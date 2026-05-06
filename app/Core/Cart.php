<?php declare(strict_types=1);

namespace App\Core;

use App\Models\CartModel;
use App\Core\Database;
use App\Core\Auth;

class Cart
{
    /**
     * ----------------------------------------
     * getModel
     * ----------------------------------------
     * Returns an instance of the CartModel.
     */
    private static function getModel(): CartModel
    {
        return new CartModel(Database::getInstance()->getConnection());
    }

    /**
     * ----------------------------------------
     * add
     * ----------------------------------------
     * Add or increment an item in the database cart.
     * Requires the user to be logged in.
     */
    public static function add(int $productId, int $qty): void
    {
        $userId = Auth::userId();
        if ($userId) {
            self::getModel()->addItem($userId, $productId, $qty);
        }
    }

    /**
     * ----------------------------------------
     * getItemQty
     * ----------------------------------------
     * Get the current quantity of a specific product in the cart.
     */
    public static function getItemQty(int $productId): int
    {
        $userId = Auth::userId();
        if ($userId) {
            $items = self::getModel()->getItemsByUser($userId);
            foreach ($items as $item) {
                if ((int)$item['id'] === $productId) {
                    return (int)$item['qty'];
                }
            }
        }
        return 0;
    }

    /**
     * ----------------------------------------
     * remove
     * ----------------------------------------
     * Remove an item from the database cart.
     */
    public static function remove(int $productId): void
    {
        $userId = Auth::userId();
        if ($userId) {
            self::getModel()->removeItem($userId, $productId);
        }
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update the quantity of an item in the database cart.
     */
    public static function update(int $productId, int $qty): void
    {
        if ($qty <= 0) {
            self::remove($productId);
            return;
        }

        $userId = Auth::userId();
        if ($userId) {
            self::getModel()->updateItem($userId, $productId, $qty);
        }
    }

    /**
     * ----------------------------------------
     * getItems
     * ----------------------------------------
     * Get all items currently in the database cart.
     */
    public static function getItems(): array
    {
        $userId = Auth::userId();
        if ($userId) {
            return self::getModel()->getItemsByUser($userId);
        }
        return [];
    }

    /**
     * ----------------------------------------
     * getTotal
     * ----------------------------------------
     * Calculate the total amount for all items.
     */
    public static function getTotal(): float
    {
        $total = 0.0;
        foreach (self::getItems() as $item) {
            $total += (float)$item['subtotal'];
        }
        return $total;
    }

    /**
     * ----------------------------------------
     * getCount
     * ----------------------------------------
     * Count the total number of units in the cart.
     */
    public static function getCount(): int
    {
        $count = 0;
        foreach (self::getItems() as $item) {
            $count += (int)$item['qty'];
        }
        return $count;
    }

    /**
     * ----------------------------------------
     * clear
     * ----------------------------------------
     * Clear all items from the database cart.
     */
    public static function clear(): void
    {
        $userId = Auth::userId();
        if ($userId) {
            self::getModel()->clearCart($userId);
        }
    }
}
