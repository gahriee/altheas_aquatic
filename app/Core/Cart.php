<?php declare(strict_types=1);

namespace App\Core;

class Cart
{
    /**
     * ----------------------------------------
     * add
     * ----------------------------------------
     * Add or increment an item in the session cart.
     *
     * @param int $productId The ID of the product.
     * @param int $qty The quantity to add.
     * @param float $price The unit price at the time of adding.
     * @param string $name The name of the product.
     */
    public static function add(int $productId, int $qty, float $price, string $name): void
    {
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }

        if (isset($_SESSION['cart'][$productId])) {
            $_SESSION['cart'][$productId]['qty'] += $qty;
        } else {
            $_SESSION['cart'][$productId] = [
                'id' => $productId,
                'name' => $name,
                'price' => $price,
                'qty' => $qty
            ];
        }

        // recalculate subtotal
        $_SESSION['cart'][$productId]['subtotal'] = $_SESSION['cart'][$productId]['qty'] * $_SESSION['cart'][$productId]['price'];
    }

    /**
     * ----------------------------------------
     * remove
     * ----------------------------------------
     * Remove an item from the session cart.
     *
     * @param int $productId The ID of the product.
     */
    public static function remove(int $productId): void
    {
        unset($_SESSION['cart'][$productId]);
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * Update the quantity of an item in the session cart.
     *
     * @param int $productId The ID of the product.
     * @param int $qty The new quantity.
     */
    public static function update(int $productId, int $qty): void
    {
        if ($qty <= 0) {
            self::remove($productId);
            return;
        }

        if (isset($_SESSION['cart'][$productId])) {
            $_SESSION['cart'][$productId]['qty'] = $qty;
            $_SESSION['cart'][$productId]['subtotal'] = $_SESSION['cart'][$productId]['qty'] * $_SESSION['cart'][$productId]['price'];
        }
    }

    /**
     * ----------------------------------------
     * getItems
     * ----------------------------------------
     * Get all items currently in the cart.
     *
     * @return array The list of cart items.
     */
    public static function getItems(): array
    {
        return $_SESSION['cart'] ?? [];
    }

    /**
     * ----------------------------------------
     * getTotal
     * ----------------------------------------
     * Calculate the total amount for all items in the cart.
     *
     * @return float The total amount.
     */
    public static function getTotal(): float
    {
        $total = 0.0;
        foreach (self::getItems() as $item) {
            $total += $item['subtotal'];
        }
        return $total;
    }

    /**
     * ----------------------------------------
     * getCount
     * ----------------------------------------
     * Count the total number of units in the cart.
     *
     * @return int The total unit count.
     */
    public static function getCount(): int
    {
        $count = 0;
        foreach (self::getItems() as $item) {
            $count += $item['qty'];
        }
        return $count;
    }

    /**
     * ----------------------------------------
     * clear
     * ----------------------------------------
     * Clear all items from the cart.
     */
    public static function clear(): void
    {
        $_SESSION['cart'] = [];
    }
}
