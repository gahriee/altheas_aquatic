<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Database;
use App\Models\ProductModel;
use App\Models\CategoryModel;

class StorefrontController
{
    /**
     * ----------------------------------------
     * list
     * ----------------------------------------
     * Return a list of active products as JSON.
     */
    public function list(): void
    {
        $db = Database::getInstance()->getConnection();
        $productModel = new ProductModel($db);
        
        $categoryId = isset($_GET['category']) ? (int)$_GET['category'] : null;
        
        if ($categoryId) {
            $products = $productModel->fetchByCategory($categoryId);
        } else {
            $products = $productModel->fetchAllActive();
        }

        Response::json(['products' => $products]);
    }

    /**
     * ----------------------------------------
     * detail
     * ----------------------------------------
     * Return details for a specific product as JSON.
     */
    public function detail(int $id): void
    {
        $db = Database::getInstance()->getConnection();
        $productModel = new ProductModel($db);
        $product = $productModel->getById($id);

        if (!$product || (int)$product['is_active'] === 0) {
            Response::error('Product not found or unavailable', 404);
        }

        Response::json(['product' => $product]);
    }

    /**
     * ----------------------------------------
     * categories
     * ----------------------------------------
     * Return all active categories as JSON.
     */
    public function categories(): void
    {
        $db = Database::getInstance()->getConnection();
        $categoryModel = new CategoryModel($db);
        $categories = $categoryModel->fetchAll();
        
        Response::json(['categories' => $categories]);
    }
}
