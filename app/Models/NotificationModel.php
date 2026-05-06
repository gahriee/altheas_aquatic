<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class NotificationModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the NotificationModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * create
     * ----------------------------------------
     * Inserts a new notification into the database.
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (type, title, message, data_json)
            VALUES (:type, :title, :message, :data_json)
        ");
        $stmt->execute([
            ':type'      => $data['type'],
            ':title'     => $data['title'],
            ':message'   => $data['message'],
            ':data_json' => isset($data['data_json']) ? json_encode($data['data_json']) : null
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * ----------------------------------------
     * getLatest
     * ----------------------------------------
     * Fetches the most recent notifications.
     */
    public function getLatest(int $limit = 50): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * getUnreadCount
     * ----------------------------------------
     * Returns the number of unread notifications.
     */
    public function getUnreadCount(): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM notifications WHERE is_read = 0");
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    /**
     * ----------------------------------------
     * markAsRead
     * ----------------------------------------
     * Marks a specific notification as read.
     */
    public function markAsRead(int $id): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * ----------------------------------------
     * markAllAsRead
     * ----------------------------------------
     * Marks all notifications as read.
     */
    public function markAllAsRead(): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
        return $stmt->execute();
    }
}
