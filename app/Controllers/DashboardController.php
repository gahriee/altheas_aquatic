<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Models\DashboardModel;

class DashboardController
{
    private DashboardModel $dashboardModel;

    public function __construct()
    {
        $db = Database::getInstance()->getConnection();
        $this->dashboardModel = new DashboardModel($db);
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Returns summary statistics and sales trend for the admin dashboard.
     */
    public function index(): void
    {
        Auth::requireLogin();

        $days = isset($_GET['days']) ? (int) $_GET['days'] : 7;
        if ($days < 1) $days = 7;

        try {
            $stats = $this->dashboardModel->getSummaryStats();
            $trend = $this->dashboardModel->getSalesTrend($days);
            $recentOrders = $this->dashboardModel->getRecentOrders(5);

            Response::json([
                'stats' => $stats,
                'trend' => $trend,
                'recent_orders' => $recentOrders
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to load dashboard data', 500);
        }
    }
}
