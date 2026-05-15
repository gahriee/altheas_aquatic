<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;
use App\Core\Database;
use App\Core\AuditLogger;
use App\Models\SupplierModel;

class SupplierController
{
    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Fetch and return all suppliers.
     */
    public function index(): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        $suppliers = $model->fetchAll();
        Response::json($suppliers);
    }

    /**
     * ----------------------------------------
     * show
     * ----------------------------------------
     * Fetch and return a single supplier by ID.
     */
    public function show(int $id): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        $supplier = $model->fetchById($id);
        if (!$supplier) {
            Response::error('Supplier not found', 404);
        }

        Response::json($supplier);
    }

    /**
     * ----------------------------------------
     * store
     * ----------------------------------------
     * Create a new supplier.
     */
    public function store(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::error('No data provided', 400);
        }

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        if (empty($input['name'])) {
            Response::error('Supplier name is required', 400);
        }

        try {
            $id = $model->store($input);
            AuditLogger::log('create', 'supplier', $id, "Created supplier '{$input['name']}'");
            Response::json(['id' => $id, 'message' => 'Supplier created successfully'], 201);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('A supplier with this name already exists', 409);
            }
            Response::error('Failed to create supplier', 500);
        } catch (\Exception $e) {
            Response::error('Failed to create supplier', 500);
        }
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update an existing supplier.
     */
    public function update(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::error('No data provided', 400);
        }

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        $existing = $model->fetchById($id);
        if (!$existing) {
            Response::error('Supplier not found', 404);
        }

        if (empty($input['name'])) {
            Response::error('Supplier name is required', 400);
        }

        try {
            $model->update($id, $input);
            AuditLogger::log('update', 'supplier', $id, "Updated supplier '{$input['name']}'", $existing, $input);
            Response::json(['message' => 'Supplier updated successfully']);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('A supplier with this name already exists', 409);
            }
            Response::error('Failed to update supplier', 500);
        } catch (\Exception $e) {
            Response::error('Failed to update supplier', 500);
        }
    }

    /**
     * ----------------------------------------
     * deliveries
     * ----------------------------------------
     * Fetch and return all deliveries for a specific supplier.
     */
    public function deliveries(int $id): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        $deliveries = $model->fetchDeliveries($id);
        Response::json($deliveries);
    }

    /**
     * ----------------------------------------
     * recordDelivery
     * ----------------------------------------
     * Record a delivery and update stock.
     */
    public function recordDelivery(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            Response::error('No data provided', 400);
        }

        // Validate required fields
        if (empty($input['supplier_id']) || empty($input['product_id']) || empty($input['qty_received'])) {
            Response::error('Missing required fields: supplier, product, or quantity', 400);
        }

        if ((int)$input['qty_received'] <= 0) {
            Response::error('Quantity received must be greater than zero', 400);
        }

        $db = Database::getInstance()->getConnection();
        $model = new SupplierModel($db);

        try {
            if ($model->recordDelivery($input)) {
                AuditLogger::log('create', 'delivery', null, "Recorded delivery of {$input['qty_received']} units for product #{$input['product_id']}");
                Response::json(['message' => 'Delivery recorded successfully and stock updated'], 201);
            } else {
                Response::error('Failed to record delivery', 500);
            }
        } catch (\Exception $e) {
            Response::error('Failed to record delivery', 500);
        }
    }
}
