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
     * Marks all unread notifications as read.
     */
    public function markAllAsRead(): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
        return $stmt->execute();
    }

    /**
     * ----------------------------------------
     * getPaginated
     * ----------------------------------------
     * Fetches a paginated list of notifications with optional type and read status filters.
     */
    public function getPaginated(int $page = 1, int $perPage = 20, ?string $type = null, ?int $isRead = null): array
    {
        $offset = ($page - 1) * $perPage;
        $params = [];
        $whereClauses = [];

        if ($type !== null) {
            $whereClauses[] = "type = :type";
            $params[':type'] = $type;
        }

        if ($isRead !== null) {
            $whereClauses[] = "is_read = :is_read";
            $params[':is_read'] = $isRead;
        }

        $whereSql = '';
        if (!empty($whereClauses)) {
            $whereSql = 'WHERE ' . implode(' AND ', $whereClauses);
        }

        try {
            // Get total count
            $countSql = "SELECT COUNT(*) FROM notifications $whereSql";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Get paginated data
            $dataSql = "SELECT * FROM notifications $whereSql ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $dataStmt = $this->db->prepare($dataSql);
            
            foreach ($params as $key => $val) {
                $dataStmt->bindValue($key, $val);
            }
            $dataStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $dataStmt->execute();
            
            $notifications = $dataStmt->fetchAll();

            return [
                'notifications' => $notifications,
                'total'         => $total,
                'page'          => $page,
                'per_page'      => $perPage,
                'total_pages'   => (int)ceil($total / $perPage)
            ];
        } catch (\PDOException $e) {
            // Return empty result set on error
            error_log("Database error in getPaginated: " . $e->getMessage());
            return [
                'notifications' => [],
                'total'         => 0,
                'page'          => $page,
                'per_page'      => $perPage,
                'total_pages'   => 0
            ];
        }
    }

    /**
     * ----------------------------------------
     * deleteRead
     * ----------------------------------------
     * Deletes all notifications that have been marked as read.
     */
    public function deleteRead(): int
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM notifications WHERE is_read = 1");
            $stmt->execute();
            return $stmt->rowCount();
        } catch (\PDOException $e) {
            error_log("Database error in deleteRead: " . $e->getMessage());
            return 0;
        }
    }
}
