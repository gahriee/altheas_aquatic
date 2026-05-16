<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Database;
use App\Core\PayMongo;
use App\Core\Csrf;
use App\Models\OrderModel;
use App\Models\ProductModel;
use App\Models\NotificationModel;

/**
 * ----------------------------------------
 * Payment Controller
 * ----------------------------------------
 * Handles PayMongo PaymentIntent creation, status polling, and Webhook notifications.
 */
class PaymentController
{
    private OrderModel $orderModel;
    private ProductModel $productModel;
    private NotificationModel $notificationModel;
    private PayMongo $payMongo;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the controller with required models and PayMongo service.
     */
    public function __construct()
    {
        $db = Database::getInstance()->getConnection();
        $this->orderModel = new OrderModel($db);
        $this->productModel = new ProductModel($db);
        $this->notificationModel = new NotificationModel($db);

        $secretKey = (string) constant('PAYMONGO_SECRET_KEY');
        $this->payMongo = new PayMongo($secretKey);
    }

    /**
     * ----------------------------------------
     * createIntent
     * ----------------------------------------
     * Validates the cart, creates a pending order, and returns a PayMongo redirect URL.
     */
    public function createIntent(): void
    {
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);

        $customer = $input['customer'] ?? null;
        $items = $input['items'] ?? null;

        if (!$customer || !$items || empty($items)) {
            Response::error('Customer information and items are required.', 400);
        }

        try {
            $db = Database::getInstance()->getConnection();
            $db->beginTransaction();

            $totalAmount = 0;
            $orderItems = [];
            foreach ($items as $item) {
                // Atomic stock check and deduction
                $stmt = $db->prepare("SELECT stock_qty, low_stock_threshold, price, name, is_active FROM products WHERE product_id = :id FOR UPDATE");
                $stmt->execute([':id' => (int) $item['product_id']]);
                $product = $stmt->fetch();

                if (!$product || !$product['is_active']) {
                    $db->rollBack();
                    Response::error("Product not found: " . ($item['name'] ?? $item['product_id']), 422);
                }

                if ($product['stock_qty'] < $item['qty']) {
                    $db->rollBack();
                    Response::error("Insufficient stock for: " . $product['name'], 422);
                }

                // Deduct stock
                $stmt = $db->prepare("UPDATE products SET stock_qty = stock_qty - :qty WHERE product_id = :id");
                $stmt->execute([':qty' => $item['qty'], ':id' => (int) $item['product_id']]);

                $newStock = $product['stock_qty'] - $item['qty'];
                if ($newStock <= (int) $product['low_stock_threshold']) {
                    $notif = [
                        'type' => 'low_stock',
                        'title' => 'Low Stock Warning',
                        'message' => "Product '{$product['name']}' is running low (Remaining: {$newStock}).",
                        'data_json' => ['product_id' => $item['product_id'], 'stock_qty' => $newStock]
                    ];
                    $this->notificationModel->create($notif);
                    \App\Core\PusherService::broadcast('admin-notifications', 'notification-received', $notif);
                }

                $totalAmount += $product['price'] * $item['qty'];
                $orderItems[] = [
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_price' => $product['price']
                ];
            }

            $orderNumber = $this->orderModel->generateOrderNumber();

            $orderData = [
                'customer_name' => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'delivery_address' => $customer['address'] ?? null,
                'total_amount' => $totalAmount,
                'payment_method' => 'gcash',
                'notes' => $customer['notes'] ?? '',
                'order_number' => $orderNumber
            ];

            $userId = \App\Core\Auth::isLoggedIn() ? \App\Core\Auth::userId() : null;

            // Insert order into DB
            $stmt = $db->prepare("
                INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, payment_method, notes, order_number)
                VALUES (:user_id, :customer_name, :customer_email, :customer_phone, :delivery_address, :total_amount, :payment_method, :notes, :order_number)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':customer_name' => $orderData['customer_name'],
                ':customer_email' => $orderData['customer_email'],
                ':customer_phone' => $orderData['customer_phone'],
                ':delivery_address' => $orderData['delivery_address'],
                ':total_amount' => $orderData['total_amount'],
                ':payment_method' => $orderData['payment_method'],
                ':notes' => $orderData['notes'],
                ':order_number' => $orderData['order_number']
            ]);
            $orderId = (int) $db->lastInsertId();

            // Insert order items
            foreach ($orderItems as $item) {
                $stmt = $db->prepare("
                    INSERT INTO order_items (order_id, product_id, qty, unit_price, subtotal)
                    VALUES (:order_id, :product_id, :qty, :unit_price, :subtotal)
                ");
                $stmt->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['product_id'],
                    ':qty' => $item['qty'],
                    ':unit_price' => $item['unit_price'],
                    ':subtotal' => $item['qty'] * $item['unit_price']
                ]);
            }

            // PayMongo Flow Step 1: Create Payment Intent
            $description = "Order #{$orderId} from Althea's Aquatic";
            $amountCentavos = (int) ($totalAmount * 100);
            $intent = $this->payMongo->createPaymentIntent($amountCentavos, $description);
            $intentId = $intent['data']['id'];
            $clientKey = $intent['data']['attributes']['client_key'];

            // PayMongo Flow Step 2: Create Payment Method (GCash)
            $method = $this->payMongo->createPaymentMethod('gcash');
            $methodId = $method['data']['id'];

            // PayMongo Flow Step 3: Attach Payment Method
            $frontendUrl = (string) constant('FRONTEND_URL');
            if (!str_starts_with($frontendUrl, 'http://') && !str_starts_with($frontendUrl, 'https://')) {
                $frontendUrl = 'https://' . $frontendUrl;
            }
            $returnUrl = rtrim($frontendUrl, '/') . "/order-confirmation/{$orderId}?pi={$intentId}";

            $attach = $this->payMongo->attachPaymentIntent($intentId, $methodId, $returnUrl);

            $redirectUrl = $attach['data']['attributes']['next_action']['redirect']['url'] ?? '';

            if (empty($redirectUrl)) {
                throw new \RuntimeException("Failed to generate checkout redirect URL from PayMongo.");
            }

            // Save Intent ID on Order
            $this->orderModel->setIntentId($orderId, $intentId);

            $db->commit();

            Response::json([
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'redirect_url' => $redirectUrl,
                'payment_intent_id' => $intentId,
                'client_key' => $clientKey
            ], 201);

        } catch (\Exception $e) {
            if (isset($db) && $db->inTransaction()) {
                $db->rollBack();
            }
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * ----------------------------------------
     * checkStatus
     * ----------------------------------------
     * Retrieves the current status of a PaymentIntent.
     */
    public function checkStatus(string $intentId): void
    {
        try {
            $intent = $this->payMongo->retrievePaymentIntent($intentId);
            $status = $intent['data']['attributes']['status'];

            $order = $this->orderModel->getByIntentId($intentId);

            Response::json([
                'status' => $status,
                'order_id' => $order['order_id'] ?? null
            ]);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    /**
     * ----------------------------------------
     * handleWebhook
     * ----------------------------------------
     * Handles asynchronous notifications from PayMongo.
     */
    public function handleWebhook(): void
    {
        $payload = file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '';
        $webhookSecret = (string) constant('PAYMONGO_WEBHOOK_SECRET');

        if (empty($sigHeader) || empty($webhookSecret)) {
            Response::error('Missing signature or secret', 400);
        }

        try {
            $isValid = $this->payMongo->verifyWebhookSignature($payload, $sigHeader, $webhookSecret);
            if (!$isValid) {
                Response::error('Invalid signature', 401);
            }

            $event = json_decode($payload, true);
            $type = $event['data']['attributes']['type'] ?? '';
            $intentId = $event['data']['attributes']['data']['attributes']['payment_intent_id'] ?? '';

            if (empty($intentId)) {
                Response::error('Payment intent ID not found in payload', 400);
            }

            switch ($type) {
                case 'payment.paid':
                    $this->orderModel->updatePaymentStatus($intentId, 'paid', 'confirmed');

                    // Real-time Notification
                    $order = $this->orderModel->getByIntentId($intentId);
                    if ($order) {
                        $displayId = $order['order_number'] ?? "#{$order['order_id']}";
                        $notif = [
                            'type' => 'order_paid',
                            'title' => 'Payment Received',
                            'message' => "Order {$displayId} for ₱" . number_format((float) $order['total_amount'], 2) . " has been paid.",
                            'data_json' => ['order_id' => $order['order_id'], 'order_number' => $order['order_number']]
                        ];
                        $this->notificationModel->create($notif);
                        \App\Core\PusherService::broadcast('admin-notifications', 'notification-received', $notif);
                    }
                    break;

                case 'payment.failed':
                    $this->orderModel->updatePaymentStatus($intentId, 'failed', 'pending');

                    // Real-time Notification
                    $order = $this->orderModel->getByIntentId($intentId);
                    if ($order) {
                        $displayId = $order['order_number'] ?? "#{$order['order_id']}";
                        $notif = [
                            'type' => 'order_failed',
                            'title' => 'Payment Failed',
                            'message' => "Order {$displayId} payment attempt failed.",
                            'data_json' => ['order_id' => $order['order_id'], 'order_number' => $order['order_number']]
                        ];
                        $this->notificationModel->create($notif);
                        \App\Core\PusherService::broadcast('admin-notifications', 'notification-received', $notif);
                    }
                    break;
            }

            Response::json(['message' => 'Webhook handled successfully']);
        } catch (\Exception $e) {
            Response::error('Webhook error: ' . $e->getMessage(), 400);
        }
    }
}
