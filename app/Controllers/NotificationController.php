<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Database;
use App\Core\Response;
use App\Core\AuditLogger;
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
            AuditLogger::log('update', 'notification', null, "Marked all notifications as read");
            Response::json(['message' => 'All notifications marked as read']);
        } else {
            Response::error('Failed to mark all notifications as read', 500);
        }
    }

    /**
     * ----------------------------------------
     * history
     * ----------------------------------------
     * GET /api/admin/notifications/history
     * Returns a paginated list of notifications with filters.
     */
    public function history(): void
    {
        Auth::requireLogin();
        
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? max(1, (int)$_GET['per_page']) : 20;
        
        $type = isset($_GET['type']) && $_GET['type'] !== '' ? $_GET['type'] : null;
        $isRead = isset($_GET['is_read']) && $_GET['is_read'] !== '' ? (int)$_GET['is_read'] : null;
        
        $result = $this->notificationModel->getPaginated($page, $perPage, $type, $isRead);
        
        Response::json($result);
    }

    /**
     * ----------------------------------------
     * deleteOld
     * ----------------------------------------
     * POST /api/admin/notifications/delete-old
     * Deletes old notifications based on days provided.
     */
    public function deleteOld(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $days = isset($input['days']) ? max(1, (int)$input['days']) : 30;

        $deletedCount = $this->notificationModel->deleteOld($days);

        AuditLogger::log('delete', 'notification', null, "Deleted old notifications");

        Response::json([
            'message' => "Successfully cleared $deletedCount old notifications",
            'deleted_count' => $deletedCount
        ]);
    }
}
