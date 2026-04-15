<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class SupplierModel
{
    private PDO $db;
    
    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the SupplierModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * fetchAll
     * ----------------------------------------
     * Fetch all suppliers from the database with delivery counts.
     */
    public function fetchAll(): array
    {
        $sql = "SELECT s.*, COUNT(d.delivery_id) as delivery_count 
                FROM suppliers s 
                LEFT JOIN deliveries d ON s.supplier_id = d.supplier_id 
                GROUP BY s.supplier_id 
                ORDER BY s.name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * fetchById
     * ----------------------------------------
     * Fetch a single supplier by its ID.
     */
    public function fetchById(int $id): ?array
    {
        $sql = "SELECT * FROM suppliers WHERE supplier_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $supplier = $stmt->fetch();
        return $supplier ?: null;
    }

    /**
     * ----------------------------------------
     * store
     * ----------------------------------------
     * Insert a new supplier into the database.
     */
    public function store(array $data): int
    {
        $sql = "INSERT INTO suppliers (name, contact_person, phone, email, address) 
                VALUES (:name, :contact_person, :phone, :email, :address)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':contact_person' => $data['contact_person'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':email' => $data['email'] ?? null,
            ':address' => $data['address'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update an existing supplier.
     */
    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE suppliers 
                SET name = :name, 
                    contact_person = :contact_person, 
                    phone = :phone, 
                    email = :email, 
                    address = :address 
                WHERE supplier_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':contact_person' => $data['contact_person'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':email' => $data['email'] ?? null,
            ':address' => $data['address'] ?? null
        ]);
    }

    /**
     * ----------------------------------------
     * fetchByProductId
     * ----------------------------------------
     * Fetch all deliveries for a specific supplier.
     */
    public function fetchDeliveries(int $supplierId): array
    {
        $sql = "SELECT d.*, p.name as product_name 
                FROM deliveries d 
                JOIN products p ON d.product_id = p.product_id 
                WHERE d.supplier_id = :supplier_id 
                ORDER BY d.delivered_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':supplier_id' => $supplierId]);
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * recordDelivery
     * ----------------------------------------
     * Record a delivery and update product stock qty atomically.
     */
    public function recordDelivery(array $data): bool
    {
        try {
            $this->db->beginTransaction();

            // 1. Insert delivery record
            $sql = "INSERT INTO deliveries (supplier_id, product_id, qty_received, unit_cost, notes) 
                    VALUES (:supplier_id, :product_id, :qty_received, :unit_cost, :notes)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':supplier_id' => $data['supplier_id'],
                ':product_id' => $data['product_id'],
                ':qty_received' => $data['qty_received'],
                ':unit_cost' => $data['unit_cost'] ?? null,
                ':notes' => $data['notes'] ?? null
            ]);

            // 2. Update product stock
            $productModel = new ProductModel($this->db);
            if (!$productModel->incrementStock((int)$data['product_id'], (int)$data['qty_received'])) {
                throw new \Exception('Failed to update product stock');
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Delivery Transaction Failed: " . $e->getMessage());
            return false;
        }
    }
}
