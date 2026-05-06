<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class CartModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the CartModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * getItemsByUser
     * ----------------------------------------
     * Fetch all cart items for a specific user, joined with product details.
     */
    public function getItemsByUser(int $userId): array
    {
        $sql = "SELECT ci.product_id as id, p.name, p.price, ci.qty, p.image_path, (p.price * ci.qty) as subtotal
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.product_id
                WHERE ci.user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * ----------------------------------------
     * addItem
     * ----------------------------------------
     * Add an item to the user's database cart or update quantity if it exists.
     */
    public function addItem(int $userId, int $productId, int $qty): bool
    {
        $sql = "INSERT INTO cart_items (user_id, product_id, qty)
                VALUES (:user_id, :product_id, :qty)
                ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':user_id' => $userId,
            ':product_id' => $productId,
            ':qty' => $qty
        ]);
    }

    /**
     * ----------------------------------------
     * updateItem
     * ----------------------------------------
     * Update the exact quantity of an item in the user's database cart.
     */
    public function updateItem(int $userId, int $productId, int $qty): bool
    {
        if ($qty <= 0) {
            return $this->removeItem($userId, $productId);
        }

        $sql = "UPDATE cart_items SET qty = :qty WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':user_id' => $userId,
            ':product_id' => $productId,
            ':qty' => $qty
        ]);
    }

    /**
     * ----------------------------------------
     * removeItem
     * ----------------------------------------
     * Remove an item from the user's database cart.
     */
    public function removeItem(int $userId, int $productId): bool
    {
        $sql = "DELETE FROM cart_items WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':user_id' => $userId,
            ':product_id' => $productId
        ]);
    }

    /**
     * ----------------------------------------
     * clearCart
     * ----------------------------------------
     * Remove all items from the user's database cart.
     */
    public function clearCart(int $userId): bool
    {
        $sql = "DELETE FROM cart_items WHERE user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':user_id' => $userId]);
    }

    /**
     * ----------------------------------------
     * mergeSession
     * ----------------------------------------
     * Merge items from a session cart into the database cart.
     * Usually called upon successful login.
     */
    public function mergeSession(int $userId, array $sessionItems): void
    {
        if (empty($sessionItems)) {
            return;
        }

        foreach ($sessionItems as $item) {
            $this->addItem($userId, (int)$item['id'], (int)$item['qty']);
        }
    }
}
