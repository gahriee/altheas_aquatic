<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Database;
use App\Core\Response;
use App\Models\NotificationModel;

class NotificationController
{
    private NotificationModel $notificationModel;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the controller with dependencies.
     */
    public function __construct()
    {
        $this->notificationModel = new NotificationModel(Database::getInstance()->getConnection());
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * GET /api/admin/notifications
     * Fetches the latest notifications for the admin feed.
     */
    public function index(): void
    {
        Auth::requireLogin();
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $notifications = $this->notificationModel->getLatest($limit);
        Response::json($notifications);
    }

    /**
     * ----------------------------------------
     * unreadCount
     * ----------------------------------------
     * GET /api/admin/notifications/unread-count
     * Returns the count of unread notifications.
     */
    public function unreadCount(): void
    {
        Auth::requireLogin();
        
        $count = $this->notificationModel->getUnreadCount();
        Response::json(['count' => $count]);
    }

    /**
     * ----------------------------------------
     * markRead
     * ----------------------------------------
     * POST /api/admin/notifications/{id}/read
     * Marks a single notification as read.
     */
    public function markRead(string $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();
        
        $success = $this->notificationModel->markAsRead((int)$id);
        if ($success) {
            Response::json(['message' => 'Notification marked as read']);
        } else {
            Response::error('Failed to mark notification as read', 500);
        }
    }

    /**
     * ----------------------------------------
     * markAllRead
     * ----------------------------------------
     * POST /api/admin/notifications/read-all
     * Marks all notifications as read.
     */
    public function markAllRead(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();
        
        $success = $this->notificationModel->markAllAsRead();
        if ($success) {
            Response::json(['message' => 'All notifications marked as read']);
        } else {
            Response::error('Failed to mark all notifications as read', 500);
        }
    }
}
