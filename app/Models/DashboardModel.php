<?php declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;

class DashboardModel
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * getSummaryStats
     * ----------------------------------------
     * Retrieves key business metrics for summary cards.
     */
    public function getSummaryStats(): array
    {
        try {
            // Total Active Products
            $stmt = $this->db->query("SELECT COUNT(*) FROM products WHERE is_active = 1");
            $totalProducts = (int) $stmt->fetchColumn();

            // Low Stock Count
            $stmt = $this->db->query("SELECT COUNT(*) FROM products WHERE is_active = 1 AND stock_qty <= low_stock_threshold");
            $lowStockCount = (int) $stmt->fetchColumn();

            // Today's Sales
            $stmt = $this->db->query("
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM orders 
                WHERE status IN ('confirmed', 'completed') 
                  AND DATE(ordered_at) = CURDATE()
            ");
            $todaySales = (float) $stmt->fetchColumn();

            // Pending Orders
            $stmt = $this->db->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'");
            $pendingOrders = (int) $stmt->fetchColumn();

            return [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
                'today_sales' => $todaySales,
                'pending_orders' => $pendingOrders
            ];
        } catch (PDOException $e) {
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * getSalesTrend
     * ----------------------------------------
     * Retrieves daily sales totals for the last N days.
     */
    public function getSalesTrend(int $days = 7): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    DATE(ordered_at) as date,
                    SUM(total_amount) as total
                FROM orders
                WHERE status IN ('confirmed', 'completed')
                  AND ordered_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
                GROUP BY DATE(ordered_at)
                ORDER BY date ASC
            ");
            $stmt->execute([':days' => $days - 1]);
            $results = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            // Fill gaps
            $trend = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $trend[] = [
                    'date' => date('M j', strtotime($date)),
                    'total' => (float) ($results[$date] ?? 0)
                ];
            }

            return $trend;
        } catch (PDOException $e) {
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * getRecentOrders
     * ----------------------------------------
     * Fetches the most recent orders.
     */
    public function getRecentOrders(int $limit = 5): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT order_id, order_number, customer_name, total_amount, status, ordered_at
                FROM orders
                ORDER BY ordered_at DESC
                LIMIT :limit
            ");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw $e;
        }
    }
}
