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
