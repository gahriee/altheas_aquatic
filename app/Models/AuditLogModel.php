<?php declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;
use PDOException;

class AuditLogModel
{
    /**
     * ----------------------------------------
     * insert
     * ----------------------------------------
     * Insert a new audit log record.
     * 
     * @param array $data Log details
     * @return bool True on success, false on failure
     */
    public function insert(array $data): bool
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            $sql = "INSERT INTO audit_logs (
                        user_id, user_email, action, resource_type, resource_id, 
                        description, old_data, new_data, ip_address, user_agent
                    ) VALUES (
                        :user_id, :user_email, :action, :resource_type, :resource_id, 
                        :description, :old_data, :new_data, :ip_address, :user_agent
                    )";

            $stmt = $pdo->prepare($sql);
            
            $oldData = isset($data['old_data']) ? json_encode($data['old_data'], JSON_UNESCAPED_UNICODE) : null;
            $newData = isset($data['new_data']) ? json_encode($data['new_data'], JSON_UNESCAPED_UNICODE) : null;

            return $stmt->execute([
                ':user_id' => $data['user_id'] ?? null,
                ':user_email' => $data['user_email'] ?? null,
                ':action' => $data['action'],
                ':resource_type' => $data['resource_type'],
                ':resource_id' => $data['resource_id'] ?? null,
                ':description' => $data['description'],
                ':old_data' => $oldData,
                ':new_data' => $newData,
                ':ip_address' => $data['ip_address'] ?? null,
                ':user_agent' => $data['user_agent'] ?? null,
            ]);
        } catch (PDOException $e) {
            error_log("AuditLogModel::insert failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * ----------------------------------------
     * fetchPaginated
     * ----------------------------------------
     * Fetch paginated audit logs with optional filters.
     * 
     * @param int $page Current page number
     * @param int $perPage Number of items per page
     * @param array $filters Optional filters (action, resource_type, user_id, search, from, to)
     * @return array Pagination data and logs
     */
    public function fetchPaginated(int $page, int $perPage, array $filters = []): array
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            
            $where = [];
            $params = [];

            if (!empty($filters['action'])) {
                $where[] = "action = :action";
                $params[':action'] = $filters['action'];
            }

            if (!empty($filters['resource_type'])) {
                $where[] = "resource_type = :resource_type";
                $params[':resource_type'] = $filters['resource_type'];
            }

            if (!empty($filters['user_id'])) {
                $where[] = "user_id = :user_id";
                $params[':user_id'] = (int)$filters['user_id'];
            }

            if (!empty($filters['search'])) {
                $where[] = "(description LIKE :search OR user_email LIKE :search OR resource_type LIKE :search OR action LIKE :search)";
                $params[':search'] = '%' . $filters['search'] . '%';
            }

            if (!empty($filters['from'])) {
                $where[] = "created_at >= :from";
                $params[':from'] = $filters['from'] . ' 00:00:00';
            }

            if (!empty($filters['to'])) {
                $where[] = "created_at <= :to";
                $params[':to'] = $filters['to'] . ' 23:59:59';
            }

            $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

            // Count total
            $countSql = "SELECT COUNT(*) FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id $whereClause";
            // Replace where clause column references with table aliases if needed
            $countSql = str_replace('description LIKE', 'a.description LIKE', $countSql);
            $countSql = str_replace('user_email LIKE', 'a.user_email LIKE :search OR u.email LIKE :search', $countSql);
            $countSql = str_replace('resource_type LIKE', 'a.resource_type LIKE', $countSql);
            $countSql = str_replace('action LIKE', 'a.action LIKE', $countSql);
            $countSql = str_replace('WHERE action', 'WHERE a.action', $countSql);
            $countSql = str_replace('WHERE resource_type', 'WHERE a.resource_type', $countSql);
            $countSql = str_replace('AND resource_type', 'AND a.resource_type', $countSql);
            $countSql = str_replace('user_id =', 'a.user_id =', $countSql);
            $countSql = str_replace('created_at', 'a.created_at', $countSql);

            $stmt = $pdo->prepare($countSql);
            $stmt->execute($params);
            $total = (int)$stmt->fetchColumn();

            // Fetch records
            $offset = ($page - 1) * $perPage;
            
            $sqlWhereClause = str_replace('description LIKE', 'a.description LIKE', $whereClause);
            $sqlWhereClause = str_replace('user_email LIKE', 'a.user_email LIKE :search OR u.email LIKE :search', $sqlWhereClause);
            $sqlWhereClause = str_replace('resource_type LIKE', 'a.resource_type LIKE', $sqlWhereClause);
            $sqlWhereClause = str_replace('action LIKE', 'a.action LIKE', $sqlWhereClause);
            $sqlWhereClause = str_replace('WHERE action', 'WHERE a.action', $sqlWhereClause);
            $sqlWhereClause = str_replace('WHERE resource_type', 'WHERE a.resource_type', $sqlWhereClause);
            $sqlWhereClause = str_replace('AND resource_type', 'AND a.resource_type', $sqlWhereClause);
            $sqlWhereClause = str_replace('user_id =', 'a.user_id =', $sqlWhereClause);
            $sqlWhereClause = str_replace('created_at', 'a.created_at', $sqlWhereClause);

            $sql = "SELECT a.id, a.user_id, COALESCE(a.user_email, u.email) as user_email, a.action, a.resource_type, a.resource_id, 
                           a.description, a.ip_address, a.created_at 
                    FROM audit_logs a
                    LEFT JOIN users u ON a.user_id = u.id
                    $sqlWhereClause 
                    ORDER BY a.created_at DESC 
                    LIMIT :limit OFFSET :offset";
            
            // Re-bind params because LIMIT/OFFSET require bindValue as integers
            $stmt = $pdo->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $logs = $stmt->fetchAll();

            $totalPages = $total > 0 ? (int)ceil($total / $perPage) : 1;

            return [
                'logs' => $logs,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => $totalPages
            ];

        } catch (PDOException $e) {
            error_log("AuditLogModel::fetchPaginated failed: " . $e->getMessage());
            return [
                'logs' => [],
                'total' => 0,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => 1
            ];
        }
    }

    /**
     * ----------------------------------------
     * fetchById
     * ----------------------------------------
     * Fetch a single audit log entry by ID.
     * 
     * @param int $id The log ID
     * @return array|null Log array or null if not found
     */
    public function fetchById(int $id): ?array
    {
        try {
            $pdo = Database::getInstance()->getConnection();
            $sql = "SELECT * FROM audit_logs WHERE id = :id LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $id]);
            $log = $stmt->fetch();
            
            if ($log) {
                if ($log['old_data']) {
                    $log['old_data'] = json_decode($log['old_data'], true);
                }
                if ($log['new_data']) {
                    $log['new_data'] = json_decode($log['new_data'], true);
                }
                return $log;
            }
            return null;
        } catch (PDOException $e) {
            error_log("AuditLogModel::fetchById failed: " . $e->getMessage());
            return null;
        }
    }
}
