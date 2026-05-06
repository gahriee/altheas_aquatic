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
        
        $orders = $this->orderModel->getAll();
        Response::json($orders);
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

        $input = json_decode(file_get_contents('php://input'), true);
        $status = $input['status'] ?? null;

        if (!$status) {
            Response::error('Status is required', 400);
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE orders SET status = :status WHERE order_id = :id");
        $success = $stmt->execute([':status' => $status, ':id' => $id]);

        if ($success) {
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
}
