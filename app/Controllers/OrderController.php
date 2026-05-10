<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Database;
use App\Core\Auth;
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

        if (!$status) {
            Response::error('Status is required', 400);
        }

        if ($this->orderModel->updateStatus($id, $status)) {
            Response::json(['message' => 'Order status updated successfully']);
        } else {
            Response::error('Failed to update order status');
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
            'status' => $_GET['status'] ?? null
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
