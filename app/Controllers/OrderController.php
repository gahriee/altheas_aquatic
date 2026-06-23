<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;
use App\Core\AuditLogger;
use App\Models\OrderModel;

/**
 * ----------------------------------------
 * Order Controller
 * ----------------------------------------
 * Handles order management and verification.
 */
class OrderController
{
    private OrderModel $orderModel;

    public function __construct()
    {
        $this->orderModel = new OrderModel(Database::getInstance()->getConnection());
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Returns a list of all orders. (Admin only)
     */
    public function index(): void
    {
        Auth::requireLogin();
        
        $params = [
            'status' => $_GET['status'] ?? null,
            'payment_method' => $_GET['payment_method'] ?? null,
            'payment_status' => $_GET['payment_status'] ?? null,
            'search' => $_GET['search'] ?? null,
            'from' => $_GET['from'] ?? null,
            'to' => $_GET['to'] ?? null
        ];

        $orders = $this->orderModel->getAll($params);
        $counts = $this->orderModel->getOrderCounts();

        Response::json([
            'orders' => $orders,
            'counts' => $counts
        ]);
    }

    /**
     * ----------------------------------------
     * updateStatus
     * ----------------------------------------
     * Updates the status of an existing order. (Admin only)
     */
    public function updateStatus(int $id): void
    {
        Auth::requireLogin();
        \App\Core\Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $status = $input['status'] ?? null;
        $paymentStatus = $input['payment_status'] ?? null;

        if (!$status && !$paymentStatus) {
            Response::error('Status or payment_status is required', 400);
        }

        $success = false;
        $messages = [];

        if ($status) {
            if ($this->orderModel->updateStatus($id, $status)) {
                $success = true;
                $messages[] = "status to '{$status}'";
            }
        }

        if ($paymentStatus) {
            if ($this->orderModel->updatePaymentStatusById($id, $paymentStatus)) {
                $success = true;
                $messages[] = "payment status to '{$paymentStatus}'";
            }
        }

        if ($success) {
            $order = $this->orderModel->getById($id);
            if ($order) {
                $changes = implode(' and ', $messages);
                AuditLogger::log('update', 'order', $id, "Updated order #{$order['order_number']} {$changes}");
            }
            Response::json(['message' => 'Order updated successfully']);
        } else {
            Response::error('Failed to update order');
        }
    }

    /**
     * ----------------------------------------
     * show
     * ----------------------------------------
     * Returns details of a single order.
     */
    public function show(int $id): void
    {
        Auth::requireLogin();
        $order = $this->orderModel->getById($id);
        if (!$order) {
            Response::error('Order not found', 404);
        }
        Response::json($order);
    }

    /**
     * ----------------------------------------
     * confirmation
     * ----------------------------------------
     * Returns confirmation details for an order.
     */
    public function confirmation(int $id): void
    {
        $order = $this->orderModel->getById($id);
        if (!$order) {
            Response::error('Order not found', 404);
        }

        // This endpoint could be extended to show polling info or status
        Response::json($order);
    }

    /**
     * ----------------------------------------
     * submitCod
     * ----------------------------------------
     * Handles COD checkout creation.
     */
    public function submitCod(): void
    {
        \App\Core\Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $customer = $input['customer'] ?? [];
        $items = $input['items'] ?? [];

        if (empty($customer['name']) || empty($customer['email']) || empty($customer['phone']) || empty($customer['address'])) {
            Response::error('Name, email, phone, and address are required', 400);
        }

        if (empty($items)) {
            Response::error('Cart is empty', 400);
        }

        $userId = Auth::isLoggedIn() ? Auth::userId() : null;

        $orderData = [
            'customer_name' => $customer['name'],
            'customer_email' => $customer['email'],
            'customer_phone' => $customer['phone'],
            'delivery_address' => $customer['address'],
            'notes' => $customer['notes'] ?? null
        ];

        try {
            $result = $this->orderModel->createCodOrder($orderData, $items, $userId);

            // Clear the cart session for logged-in users or guest (since Cart works with session)
            \App\Core\Cart::clear();

            // Send Email Notification
            if (!empty($orderData['customer_email'])) {
                $fullOrder = $this->orderModel->getById((int) $result['order_id']);
                if ($fullOrder) {
                    $displayId = $result['order_number'] ?? "#{$result['order_id']}";
                    $totalAmount = number_format((float) $fullOrder['total_amount'], 2);
                    
                    $subject = "Order Received: {$displayId}";
                    
                    $itemsHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
                    $itemsHtml .= '<thead><tr><th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: left;">Product</th><th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: right;">Qty</th><th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: right;">Price</th><th style="border-bottom: 1px solid #ddd; padding: 8px; text-align: right;">Subtotal</th></tr></thead>';
                    $itemsHtml .= '<tbody>';
                    foreach ($fullOrder['items'] as $item) {
                        $price = number_format((float) $item['unit_price'], 2);
                        $subtotal = number_format((float) $item['subtotal'], 2);
                        $itemsHtml .= "<tr><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$item['product_name']}</td><td style='padding: 8px; text-align: right; border-bottom: 1px solid #eee;'>{$item['qty']}</td><td style='padding: 8px; text-align: right; border-bottom: 1px solid #eee;'>₱{$price}</td><td style='padding: 8px; text-align: right; border-bottom: 1px solid #eee;'>₱{$subtotal}</td></tr>";
                    }
                    $itemsHtml .= '</tbody></table>';

                    $date = date('F j, Y, g:i a');
                    $address = $fullOrder['delivery_address'] ?: 'No address provided';

                    $htmlBody = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
                        <h2 style='color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;'>Althea's Aquatic</h2>
                        <p>Hi {$fullOrder['customer_name']},</p>
                        <p>Thank you for your order! We have received your request and will process it shortly. Please prepare exact cash for the delivery.</p>
                        <div style='background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                            <p style='margin: 0 0 5px 0;'><strong>Order Number:</strong> {$displayId}</p>
                            <p style='margin: 0 0 5px 0;'><strong>Date:</strong> {$date}</p>
                            <p style='margin: 0 0 5px 0;'><strong>Total Amount:</strong> <span style='color: #0d9488; font-weight: bold;'>₱{$totalAmount}</span></p>
                            <p style='margin: 0 0 5px 0;'><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
                            <p style='margin: 0 0 0 0;'><strong>Delivery Address:</strong> {$address}</p>
                        </div>
                        <h3>Order Summary</h3>
                        {$itemsHtml}
                        <p style='margin-top: 30px; font-size: 0.9em; color: #64748b;'>If you have any questions, feel free to reply to this email.</p>
                    </div>
                    ";

                    try {
                        \App\Core\Mailer::send($fullOrder['customer_email'], $subject, $htmlBody);
                        error_log("Email successfully sent to {$fullOrder['customer_email']} for Order {$displayId}");
                    } catch (\Exception $e) {
                        error_log("Email failed for Order {$displayId}: " . $e->getMessage());
                    }
                }
            }

            Response::json([
                'order_id' => $result['order_id'],
                'order_number' => $result['order_number'],
                'checkout_type' => 'cod',
                'message' => 'Order placed successfully'
            ], 201);
        } catch (\Exception $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    /**
     * ----------------------------------------
     * cleanupExpired
     * ----------------------------------------
     * Triggers the stock restoration for expired pending orders.
     * Intended for cron usage.
     */
    public function cleanupExpired(): void
    {
        try {
            // Default expiry: 60 minutes
            $count = $this->orderModel->cleanupExpiredOrders(60);
            Response::json(['message' => "Order cleanup completed. {$count} orders expired."]);
        } catch (\Exception $e) {
            Response::error('Cleanup error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ----------------------------------------
     * myOrders
     * ----------------------------------------
     * Returns a list of orders for the authenticated customer.
     */
    public function myOrders(): void
    {
        Auth::requireCustomerLogin();
        $userId = Auth::userId();
        
        $params = [
            'status' => $_GET['status'] ?? null,
            'limit' => isset($_GET['limit']) ? (int) $_GET['limit'] : null,
            'offset' => isset($_GET['offset']) ? (int) $_GET['offset'] : null
        ];

        $orders = $this->orderModel->getByUserId($userId, $params);
        Response::json(['orders' => $orders]);
    }

    /**
     * ----------------------------------------
     * myOrderDetail
     * ----------------------------------------
     * Returns details of a single order belonging to the authenticated customer.
     */
    public function myOrderDetail(int $id): void
    {
        Auth::requireCustomerLogin();
        $userId = Auth::userId();

        $order = $this->orderModel->getDetailForUser($id, $userId);
        
        if (!$order) {
            Response::error('Order not found', 404);
        }
        
        Response::json($order);
    }
}
