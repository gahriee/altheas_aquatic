<?php declare(strict_types=1);

namespace App\Core;

use App\Models\AuditLogModel;
use Exception;

class AuditLogger
{
    /**
     * ----------------------------------------
     * log
     * ----------------------------------------
     * Log a state-changing action.
     * 
     * @param string $action 'create', 'update', or 'delete'
     * @param string $resourceType Type of resource (e.g. 'product', 'order')
     * @param int|null $resourceId ID of the resource
     * @param string $description Human-readable description
     * @param array|null $oldData Old data (for update/delete)
     * @param array|null $newData New data (for create/update)
     */
    public static function log(
        string $action,
        string $resourceType,
        ?int $resourceId,
        string $description,
        ?array $oldData = null,
        ?array $newData = null
    ): void {
        try {
            $userId = Auth::userId();
            $userEmail = null;
            if ($userId) {
                // If the user is logged in via Auth::getInstance()
                $userEmail = Auth::getInstance()->getEmail();
            }

            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

            $data = [
                'user_id' => $userId,
                'user_email' => $userEmail,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'old_data' => $oldData,
                'new_data' => $newData,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent
            ];

            $model = new AuditLogModel();
            $model->insert($data);
        } catch (Exception $e) {
            // Silently fail but log to PHP error log
            error_log("AuditLogger::log exception: " . $e->getMessage());
        }
    }
}
