<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;
use App\Core\Database;
use App\Core\Uploader;
use App\Models\ProductModel;

class InventoryController
{
    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Fetch and return all products.
     */
    public function index(): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        $products = $model->fetchAll();
        Response::json($products);
    }

    /**
     * ----------------------------------------
     * show
     * ----------------------------------------
     * Fetch and return a single product by ID.
     */
    public function show(int $id): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        $product = $model->getById($id);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        Response::json($product);
    }

    /**
     * ----------------------------------------
     * store
     * ----------------------------------------
     * Create a new product.
     */
    public function store(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        // Using $_POST because of potential file upload
        if (empty($_POST)) {
            Response::error('No data provided', 400);
        }

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);
        $uploader = new Uploader();

        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $imagePath = $uploader->upload($_FILES['image'], __DIR__ . '/../../storage/products');
            } catch (\Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        }

        $data = [
            'category_id' => (int) ($_POST['category_id'] ?? 0),
            'name' => $_POST['name'] ?? '',
            'description' => $_POST['description'] ?? null,
            'price' => (float) ($_POST['price'] ?? 0),
            'stock_qty' => (int) ($_POST['stock_qty'] ?? 0),
            'low_stock_threshold' => (int) ($_POST['low_stock_threshold'] ?? 5),
            'image_path' => $imagePath,
            'is_active' => (int) ($_POST['is_active'] ?? 1)
        ];

        // Basic validation
        if (empty($data['name']) || $data['category_id'] <= 0 || $data['price'] <= 0) {
            Response::error('Missing required fields: name, category, or price', 400);
        }

        try {
            $id = $model->create($data);
            Response::json(['id' => $id, 'message' => 'Product created successfully'], 201);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('A product with this name already exists', 409);
            }
            Response::error('Failed to create product', 500);
        } catch (\Exception $e) {
            Response::error('Failed to create product', 500);
        }
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update an existing product.
     */
    public function update(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);
        $uploader = new Uploader();

        $existing = $model->getById($id);
        if (!$existing) {
            Response::error('Product not found', 404);
        }

        // Using $_POST for potential file replacement
        $imagePath = $existing['image_path'];
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $imagePath = $uploader->upload($_FILES['image'], __DIR__ . '/../../storage/products');
                // Cleanup old image? (Optional, following minimalist rule for now)
            } catch (\Exception $e) {
                Response::error($e->getMessage(), 400);
            }
        }

        $data = [
            'category_id' => (int) ($_POST['category_id'] ?? $existing['category_id']),
            'name' => $_POST['name'] ?? $existing['name'],
            'description' => $_POST['description'] ?? $existing['description'],
            'price' => (float) ($_POST['price'] ?? $existing['price']),
            'stock_qty' => (int) ($_POST['stock_qty'] ?? $existing['stock_qty']),
            'low_stock_threshold' => (int) ($_POST['low_stock_threshold'] ?? $existing['low_stock_threshold']),
            'image_path' => $imagePath,
            'is_active' => (int) ($_POST['is_active'] ?? $existing['is_active'])
        ];

        try {
            $model->update($id, $data);
            Response::json(['message' => 'Product updated successfully']);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('A product with this name already exists', 409);
            }
            Response::error('Failed to update product', 500);
        } catch (\Exception $e) {
            Response::error('Failed to update product', 500);
        }
    }

    /**
     * ----------------------------------------
     * deactivate
     * ----------------------------------------
     * Soft delete a product.
     */
    public function deactivate(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        try {
            $model->deactivate($id);
            Response::json(['message' => 'Product deactivated successfully']);
        } catch (\Exception $e) {
            Response::error('Failed to deactivate product', 500);
        }
    }

    /**
     * ----------------------------------------
     * trash
     * ----------------------------------------
     * Fetch and return all soft-deleted products.
     */
    public function trash(): void
    {
        Auth::requireLogin();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        $products = $model->fetchInactive();
        Response::json($products);
    }

    /**
     * ----------------------------------------
     * restore
     * ----------------------------------------
     * Restore a soft-deleted product.
     */
    public function restore(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        try {
            $model->restore($id);
            Response::json(['message' => 'Product restored successfully']);
        } catch (\Exception $e) {
            Response::error('Failed to restore product', 500);
        }
    }

    /**
     * ----------------------------------------
     * destroy
     * ----------------------------------------
     * Permanently delete a product.
     * Cleans up image file on success.
     */
    public function destroy(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $db = Database::getInstance()->getConnection();
        $model = new ProductModel($db);

        $product = $model->getById($id);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        try {
            $model->delete($id);

            // Cleanup image file if it exists
            if ($product['image_path']) {
                $filePath = __DIR__ . '/../../storage/products/' . $product['image_path'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            Response::json(['message' => 'Product permanently deleted']);
        } catch (\PDOException $e) {
            // Integrity constraint violation (SQLSTATE 23000)
            if ($e->getCode() === '23000') {
                Response::error('Cannot delete: This product has existing sales or delivery history.', 422);
            }
            Response::error('Failed to delete product from database', 500);
        } catch (\Exception $e) {
            Response::error('An unexpected error occurred during deletion', 500);
        }
    }
}
