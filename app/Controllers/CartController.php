<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Auth;
use App\Core\Cart;
use App\Core\Csrf;
use App\Models\ProductModel;
use App\Core\Database;

class CartController
{
    private ProductModel $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel(Database::getInstance()->getConnection());
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Return the current cart content as JSON.
     */
    public function index(): void
    {
        // For index, we don't necessarily require login, we just return empty if guest
        Response::json([
            'items' => array_values(Cart::getItems()),
            'total' => Cart::getTotal(),
            'count' => Cart::getCount()
        ]);
    }

    /**
     * ----------------------------------------
     * add
     * ----------------------------------------
     * Add a product to the cart.
     */
    public function add(): void
    {
        Csrf::verifyHeader();
        Auth::requireLogin();

        $data = json_decode(file_get_contents('php://input'), true);
        $productId = (int)($data['product_id'] ?? 0);
        $qty = (int)($data['qty'] ?? 1);

        if ($productId <= 0 || $qty <= 0) {
            Response::error('Invalid product or quantity', 400);
        }

        $product = $this->productModel->getById($productId);
        if (!$product || !$product['is_active']) {
            Response::error('Product not found', 404);
        }

        $currentQtyInCart = Cart::getItemQty($productId);
        if (($currentQtyInCart + $qty) > $product['stock_qty']) {
            Response::error("Insufficient stock. Only {$product['stock_qty']} available.", 422);
        }

        Cart::add($productId, $qty);

        Response::json(['message' => 'Item added to cart']);
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update quantity of an item.
     */
    public function update(): void
    {
        Csrf::verifyHeader();
        Auth::requireLogin();

        $data = json_decode(file_get_contents('php://input'), true);
        $productId = (int)($data['product_id'] ?? 0);
        $qty = (int)($data['qty'] ?? 0);

        if ($productId <= 0) {
            Response::error('Invalid product', 400);
        }

        if ($qty <= 0) {
            Cart::remove($productId);
            Response::json(['message' => 'Item removed']);
        }

        $product = $this->productModel->getById($productId);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        if ($qty > $product['stock_qty']) {
            Response::error("Insufficient stock. Only {$product['stock_qty']} available.", 422);
        }

        Cart::update($productId, $qty);
        Response::json(['message' => 'Cart updated']);
    }

    /**
     * ----------------------------------------
     * remove
     * ----------------------------------------
     * Remove an item from the cart.
     */
    public function remove(): void
    {
        Csrf::verifyHeader();
        Auth::requireLogin();

        $data = json_decode(file_get_contents('php://input'), true);
        $productId = (int)($data['product_id'] ?? 0);

        if ($productId <= 0) {
            Response::error('Invalid product', 400);
        }

        Cart::remove($productId);
        Response::json(['message' => 'Item removed']);
    }

    /**
     * ----------------------------------------
     * clear
     * ----------------------------------------
     * Clear all items.
     */
    public function clear(): void
    {
        Csrf::verifyHeader();
        Auth::requireLogin();
        
        Cart::clear();
        Response::json(['message' => 'Cart cleared']);
    }
}
