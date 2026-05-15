<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Models\AuditLogModel;

class AuditLogController
{
    private AuditLogModel $auditLogModel;

    public function __construct()
    {
        $this->auditLogModel = new AuditLogModel();
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Fetch paginated audit logs based on filters.
     */
    public function index(): void
    {
        Auth::requireLogin();

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 25;

        // Ensure reasonable limits
        if ($page < 1) $page = 1;
        if ($perPage < 1 || $perPage > 100) $perPage = 25;

        $filters = [
            'action' => $_GET['action'] ?? null,
            'resource_type' => $_GET['resource_type'] ?? null,
            'user_id' => $_GET['user_id'] ?? null,
            'search' => $_GET['search'] ?? null,
            'from' => $_GET['from'] ?? null,
            'to' => $_GET['to'] ?? null,
        ];

        // Clean up empty filters
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });

        $result = $this->auditLogModel->fetchPaginated($page, $perPage, $filters);

        Response::json($result);
    }

    /**
     * ----------------------------------------
     * show
     * ----------------------------------------
     * Fetch a single audit log entry by ID.
     * 
     * @param string $id Log ID
     */
    public function show(string $id): void
    {
        Auth::requireLogin();

        $log = $this->auditLogModel->fetchById((int)$id);

        if (!$log) {
            Response::error('Audit log not found', 404);
        }

        Response::json(['log' => $log]);
    }
}
