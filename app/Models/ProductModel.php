<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class ProductModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the ProductModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * fetchAll
     * ----------------------------------------
     * Fetch all products from the database, joined with category name.
     * Includes inactive products for admin management.
     */
    public function fetchAll(): array
    {
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.category_id 
                WHERE p.is_active = 1
                ORDER BY p.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * getById
     * ----------------------------------------
     * Fetch a single product by its ID.
     */
    public function getById(int $id): ?array
    {
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.category_id 
                WHERE p.product_id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    /**
     * ----------------------------------------
     * create
     * ----------------------------------------
     * Insert a new product into the database.
     */
    public function create(array $data): int
    {
        $sql = "INSERT INTO products (category_id, name, description, price, stock_qty, low_stock_threshold, image_path, is_active) 
                VALUES (:category_id, :name, :description, :price, :stock_qty, :low_stock_threshold, :image_path, :is_active)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':category_id' => $data['category_id'],
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':price' => $data['price'],
            ':stock_qty' => $data['stock_qty'] ?? 0,
            ':low_stock_threshold' => $data['low_stock_threshold'] ?? 5,
            ':image_path' => $data['image_path'] ?? null,
            ':is_active' => $data['is_active'] ?? 1
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update an existing product.
     */
    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE products 
                SET category_id = :category_id, 
                    name = :name, 
                    description = :description, 
                    price = :price, 
                    stock_qty = :stock_qty, 
                    low_stock_threshold = :low_stock_threshold, 
                    image_path = :image_path, 
                    is_active = :is_active 
                WHERE product_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':category_id' => $data['category_id'],
            ':name' => $data['name'],
            ':description' => $data['description'] ?? null,
            ':price' => $data['price'],
            ':stock_qty' => $data['stock_qty'],
            ':low_stock_threshold' => $data['low_stock_threshold'],
            ':image_path' => $data['image_path'],
            ':is_active' => $data['is_active']
        ]);
    }

    /**
     * ----------------------------------------
     * deactivate
     * ----------------------------------------
     * Soft delete a product by setting is_active to 0.
     */
    public function deactivate(int $id): bool
    {
        $sql = "UPDATE products SET is_active = 0 WHERE product_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * ----------------------------------------
     * fetchByCategory
     * ----------------------------------------
     * Fetch all active products within a specific category.
     */
    public function fetchByCategory(int $categoryId): array
    {
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.category_id 
                WHERE p.category_id = :category_id AND p.is_active = 1
                ORDER BY p.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':category_id' => $categoryId]);
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * fetchInactive
     * ----------------------------------------
     * Fetch all soft-deleted products.
     */
    public function fetchInactive(): array
    {
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                JOIN categories c ON p.category_id = c.category_id 
                WHERE p.is_active = 0
                ORDER BY p.updated_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * restore
     * ----------------------------------------
     * Restore a soft-deleted product.
     */
    public function restore(int $id): bool
    {
        $sql = "UPDATE products SET is_active = 1 WHERE product_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * ----------------------------------------
     * incrementStock
     * ----------------------------------------
     * Atomically increment product stock.
     */
    public function incrementStock(int $id, int $qty): bool
    {
        $sql = "UPDATE products SET stock_qty = stock_qty + :qty WHERE product_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':qty' => $qty
        ]);
    }

    /**
     * ----------------------------------------
     * delete
     * ----------------------------------------
     * Permanently delete a product.
     * Note: This will fail if the product is linked to orders or deliveries.
     */
    public function delete(int $id): bool
    {
        $sql = "DELETE FROM products WHERE product_id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
