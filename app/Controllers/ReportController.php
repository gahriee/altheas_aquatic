<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Response;
use App\Models\ReportModel;

class ReportController
{
    private ReportModel $reportModel;

    public function __construct()
    {
        $db = Database::getInstance()->getConnection();
        $this->reportModel = new ReportModel($db);
    }

    /**
     * ----------------------------------------
     * sales
     * ----------------------------------------
     * Get aggregated sales data for a date range.
     */
    public function sales(): void
    {
        Auth::requireLogin();
        
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-d');
        
        try {
            $data = $this->reportModel->getSalesSummary($from, $to);
            Response::json($data);
        } catch (\PDOException $e) {
            Response::error('Failed to load sales report', 500);
        }
    }

    /**
     * ----------------------------------------
     * inventory
     * ----------------------------------------
     * Get inventory status report.
     */
    public function inventory(): void
    {
        Auth::requireLogin();
        
        try {
            $data = $this->reportModel->getInventoryStatus();
            Response::json(['inventory' => $data]);
        } catch (\PDOException $e) {
            Response::error('Failed to load inventory report', 500);
        }
    }

    /**
     * ----------------------------------------
     * suppliers
     * ----------------------------------------
     * Get supplier delivery summary for a date range.
     */
    public function suppliers(): void
    {
        Auth::requireLogin();
        
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-d');
        
        try {
            $data = $this->reportModel->getSupplierSummary($from, $to);
            Response::json(['suppliers' => $data]);
        } catch (\PDOException $e) {
            Response::error('Failed to load supplier report', 500);
        }
    }

    /**
     * ----------------------------------------
     * exportCsv
     * ----------------------------------------
     * Export reports to CSV.
     */
    public function exportCsv(): void
    {
        Auth::requireLogin();
        
        $type = $_GET['type'] ?? 'sales';
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-d');
        
        $filename = "export_{$type}_{$from}_{$to}.csv";
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        $output = fopen('php://output', 'w');
        
        try {
            if ($type === 'sales') {
                $data = $this->reportModel->getSalesSummary($from, $to);
                fputcsv($output, ['Product Name', 'Total Qty Sold', 'Total Sales']);
                foreach ($data['top_products'] as $row) {
                    fputcsv($output, [$row['name'], $row['total_qty'], $row['total_sales']]);
                }
            } elseif ($type === 'inventory') {
                $data = $this->reportModel->getInventoryStatus();
                fputcsv($output, ['Product Name', 'Stock Qty', 'Low Stock Threshold', 'Status']);
                foreach ($data as $row) {
                    $status = 'Adequate';
                    if ($row['is_out_of_stock']) $status = 'Out of Stock';
                    elseif ($row['is_low_stock']) $status = 'Low Stock';
                    
                    fputcsv($output, [$row['name'], $row['stock_qty'], $row['low_stock_threshold'], $status]);
                }
            } elseif ($type === 'suppliers') {
                $data = $this->reportModel->getSupplierSummary($from, $to);
                fputcsv($output, ['Supplier Name', 'Total Deliveries', 'Total Units Received']);
                foreach ($data as $row) {
                    fputcsv($output, [$row['name'], $row['total_deliveries'], $row['total_units_received']]);
                }
            }
        } catch (\PDOException $e) {
            fputcsv($output, ['Error generating report']);
        }
        
        fclose($output);
        exit;
    }
}
