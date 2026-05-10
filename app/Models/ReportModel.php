<?php declare(strict_types=1);

namespace App\Models;

use PDO;
use PDOException;

class ReportModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the ReportModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * getSalesSummary
     * ----------------------------------------
     * Retrieves aggregated sales data and top-selling products for a date range.
     */
    public function getSalesSummary(string $from, string $to): array
    {
        try {
            // Aggregate totals
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(order_id) as total_orders,
                    COALESCE(SUM(total_amount), 0) as total_revenue
                FROM orders 
                WHERE status IN ('confirmed', 'completed') 
                  AND DATE(ordered_at) BETWEEN :from AND :to
            ");
            $stmt->execute(['from' => $from, 'to' => $to]);
            $totals = $stmt->fetch();

            // Top selling products
            $stmtProducts = $this->db->prepare("
                SELECT 
                    p.name,
                    SUM(oi.qty) as total_qty,
                    SUM(oi.subtotal) as total_sales
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE o.status IN ('confirmed', 'completed')
                  AND DATE(o.ordered_at) BETWEEN :from AND :to
                GROUP BY p.product_id, p.name
                ORDER BY total_qty DESC
                LIMIT 10
            ");
            $stmtProducts->execute(['from' => $from, 'to' => $to]);
            $topProducts = $stmtProducts->fetchAll();

            return [
                'total_orders' => (int)$totals['total_orders'],
                'total_revenue' => (float)$totals['total_revenue'],
                'top_products' => $topProducts
            ];
        } catch (PDOException $e) {
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * getInventoryStatus
     * ----------------------------------------
     * Retrieves all active products with their current stock levels.
     */
    public function getInventoryStatus(): array
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    product_id,
                    name,
                    stock_qty,
                    low_stock_threshold,
                    (stock_qty <= 0) as is_out_of_stock,
                    (stock_qty > 0 AND stock_qty <= low_stock_threshold) as is_low_stock
                FROM products
                WHERE is_active = 1
                ORDER BY is_out_of_stock DESC, is_low_stock DESC, name ASC
            ");
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * getSupplierSummary
     * ----------------------------------------
     * Retrieves supplier delivery summaries for a date range.
     */
    public function getSupplierSummary(string $from, string $to): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    s.supplier_id,
                    s.name,
                    COUNT(d.delivery_id) as total_deliveries,
                    COALESCE(SUM(d.qty_received), 0) as total_units_received
                FROM suppliers s
                LEFT JOIN deliveries d ON s.supplier_id = d.supplier_id 
                    AND DATE(d.delivered_at) BETWEEN :from AND :to
                GROUP BY s.supplier_id, s.name
                ORDER BY total_deliveries DESC, s.name ASC
            ");
            $stmt->execute(['from' => $from, 'to' => $to]);
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw $e;
        }
    }
}
