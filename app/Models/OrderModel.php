<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class OrderModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the OrderModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * createOrder
     * ----------------------------------------
     * Creates an order and its items in a transaction with stock deduction.
     */
    public function createOrder(array $orderData, array $orderItems): int
    {
        try {
            if (!$this->db->inTransaction()) {
                $this->db->beginTransaction();
            }

            $stmt = $this->db->prepare("
                INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, payment_method, notes, order_number)
                VALUES (:customer_name, :customer_email, :customer_phone, :total_amount, :payment_method, :notes, :order_number)
            ");
            $stmt->execute([
                ':customer_name' => $orderData['customer_name'],
                ':customer_email' => $orderData['customer_email'],
                ':customer_phone' => $orderData['customer_phone'],
                ':total_amount' => $orderData['total_amount'],
                ':payment_method' => $orderData['payment_method'],
                ':notes' => $orderData['notes'] ?? null,
                ':order_number' => $orderData['order_number'] ?? $this->generateOrderNumber()
            ]);
            $orderId = (int) $this->db->lastInsertId();

            foreach ($orderItems as $item) {
                $stmt = $this->db->prepare("SELECT stock_qty FROM products WHERE product_id = :id FOR UPDATE");
                $stmt->execute([':id' => $item['product_id']]);
                $product = $stmt->fetch();

                if (!$product || $product['stock_qty'] < $item['qty']) {
                    throw new \Exception("Insufficient stock for product ID: " . $item['product_id']);
                }

                $stmt = $this->db->prepare("UPDATE products SET stock_qty = stock_qty - :qty WHERE product_id = :id");
                $stmt->execute([':qty' => $item['qty'], ':id' => $item['product_id']]);

                $stmt = $this->db->prepare("
                    INSERT INTO order_items (order_id, product_id, qty, unit_price, subtotal)
                    VALUES (:order_id, :product_id, :qty, :unit_price, :subtotal)
                ");
                $stmt->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['product_id'],
                    ':qty' => $item['qty'],
                    ':unit_price' => $item['unit_price'],
                    ':subtotal' => $item['qty'] * $item['unit_price']
                ]);
            }

            $this->db->commit();
            return $orderId;
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * createCodOrder
     * ----------------------------------------
     * Creates a Cash on Delivery order with atomic stock deduction.
     */
    public function createCodOrder(array $orderData, array $orderItems, ?int $userId): array
    {
        try {
            if (!$this->db->inTransaction()) {
                $this->db->beginTransaction();
            }

            $totalAmount = 0;
            $processedItems = [];
            
            $notificationModel = new \App\Models\NotificationModel($this->db);

            foreach ($orderItems as $item) {
                $stmt = $this->db->prepare("SELECT stock_qty, low_stock_threshold, price, name, is_active FROM products WHERE product_id = :id FOR UPDATE");
                $stmt->execute([':id' => (int) $item['product_id']]);
                $product = $stmt->fetch();

                if (!$product || !$product['is_active']) {
                    throw new \Exception("Product not found or inactive: " . ($item['name'] ?? $item['product_id']));
                }

                if ($product['stock_qty'] < $item['qty']) {
                    throw new \Exception("Insufficient stock for: " . $product['name']);
                }

                $stmt = $this->db->prepare("UPDATE products SET stock_qty = stock_qty - :qty WHERE product_id = :id");
                $stmt->execute([':qty' => $item['qty'], ':id' => (int) $item['product_id']]);

                $newStock = $product['stock_qty'] - $item['qty'];
                if ($newStock <= (int) $product['low_stock_threshold']) {
                    $notif = [
                        'type' => 'low_stock',
                        'title' => 'Low Stock Warning',
                        'message' => "Product '{$product['name']}' is running low (Remaining: {$newStock}).",
                        'data_json' => ['product_id' => $item['product_id'], 'stock_qty' => $newStock]
                    ];
                    $notificationModel->create($notif);
                    \App\Core\PusherService::broadcast('admin-notifications', 'notification-received', $notif);
                }

                $totalAmount += $product['price'] * $item['qty'];
                $processedItems[] = [
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'unit_price' => $product['price']
                ];
            }

            $orderNumber = $orderData['order_number'] ?? $this->generateOrderNumber();

            $stmt = $this->db->prepare("
                INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, delivery_address, total_amount, payment_method, payment_status, status, notes, order_number)
                VALUES (:user_id, :customer_name, :customer_email, :customer_phone, :delivery_address, :total_amount, 'cod', 'unpaid', 'confirmed', :notes, :order_number)
            ");
            
            $stmt->execute([
                ':user_id' => $userId,
                ':customer_name' => $orderData['customer_name'],
                ':customer_email' => $orderData['customer_email'],
                ':customer_phone' => $orderData['customer_phone'],
                ':delivery_address' => $orderData['delivery_address'] ?? null,
                ':total_amount' => $totalAmount,
                ':notes' => $orderData['notes'] ?? null,
                ':order_number' => $orderNumber
            ]);
            
            $orderId = (int) $this->db->lastInsertId();

            foreach ($processedItems as $item) {
                $stmt = $this->db->prepare("
                    INSERT INTO order_items (order_id, product_id, qty, unit_price, subtotal)
                    VALUES (:order_id, :product_id, :qty, :unit_price, :subtotal)
                ");
                $stmt->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['product_id'],
                    ':qty' => $item['qty'],
                    ':unit_price' => $item['unit_price'],
                    ':subtotal' => $item['qty'] * $item['unit_price']
                ]);
            }

            $this->db->commit();
            
            return [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount
            ];
            
        } catch (\PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw new \Exception("Database error: " . $e->getMessage());
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    /**
     * ----------------------------------------
     * setIntentId
     * ----------------------------------------
     * Associates a Payment Gateway Intent ID with an order.
     */
    public function setIntentId(int $orderId, string $intentId): bool
    {
        $stmt = $this->db->prepare("UPDATE orders SET payment_intent_id = :intent_id WHERE order_id = :order_id");
        return $stmt->execute([
            ':intent_id' => $intentId,
            ':order_id' => $orderId
        ]);
    }

    /**
     * ----------------------------------------
     * updatePaymentStatus
     * ----------------------------------------
     * Updates payment info and status for an order based on intent ID.
     */
    public function updatePaymentStatus(string $intentId, string $paymentStatus, string $status): bool
    {
        $stmt = $this->db->prepare("
            UPDATE orders 
            SET payment_status = :payment_status, status = :status 
            WHERE payment_intent_id = :intent_id
        ");
        return $stmt->execute([
            ':payment_status' => $paymentStatus,
            ':status' => $status,
            ':intent_id' => $intentId
        ]);
    }

    /**
     * ----------------------------------------
     * getByIntentId
     * ----------------------------------------
     * Fetches an order by its Payment Gateway intent ID.
     */
    public function getByIntentId(string $intentId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE payment_intent_id = :intent_id");
        $stmt->execute([':intent_id' => $intentId]);
        $order = $stmt->fetch();
        return $order ?: null;
    }

    /**
     * ----------------------------------------
     * getById
     * ----------------------------------------
     * Fetches an order and its items by order ID.
     */
    public function getById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE order_id = :id");
        $stmt->execute([':id' => $id]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $stmt = $this->db->prepare("
            SELECT oi.*, p.name as product_name, p.image_path
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = :id
        ");
        $stmt->execute([':id' => $id]);
        $order['items'] = $stmt->fetchAll();

        return $order;
    }

    /**
     * ----------------------------------------
     * cleanupExpiredOrders
     * ----------------------------------------
     * Finds pending unpaid orders older than $minutes, restores stock, and cancels them.
     */
    public function cleanupExpiredOrders(int $minutes): int
    {
        try {
            $stmt = $this->db->prepare("
                SELECT order_id FROM orders 
                WHERE status = 'pending' 
                AND payment_status = 'unpaid' 
                AND ordered_at < (NOW() - INTERVAL :minutes MINUTE)
            ");
            $stmt->execute([':minutes' => $minutes]);
            $expiredIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (empty($expiredIds)) {
                return 0;
            }

            $count = 0;
            foreach ($expiredIds as $orderId) {
                if (!$this->db->inTransaction()) {
                    $this->db->beginTransaction();
                }

                $stmt = $this->db->prepare("SELECT product_id, qty FROM order_items WHERE order_id = :id");
                $stmt->execute([':id' => $orderId]);
                $items = $stmt->fetchAll();

                foreach ($items as $item) {
                    $stmt = $this->db->prepare("UPDATE products SET stock_qty = stock_qty + :qty WHERE product_id = :id");
                    $stmt->execute([':qty' => $item['qty'], ':id' => $item['product_id']]);
                }

                $stmt = $this->db->prepare("
                    UPDATE orders 
                    SET status = 'cancelled', notes = CONCAT(IFNULL(notes, ''), '\nSystem: Order expired.') 
                    WHERE order_id = :id
                ");
                $stmt->execute([':id' => $orderId]);

                $this->db->commit();
                $count++;
            }

            return $count;
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }
    /**
     * ----------------------------------------
     * getByNumber
     * ----------------------------------------
     * Fetches an order and its items by order number.
     */
    public function getByNumber(string $number): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE order_number = :number");
        $stmt->execute([':number' => $number]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        return $this->getById((int) $order['order_id']);
    }

    /**
     * ----------------------------------------
     * generateOrderNumber
     * ----------------------------------------
     * Generates a unique order number in the format ORD-XXXXXXXX.
     */
    public function generateOrderNumber(): string
    {
        $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $exists = true;
        $orderNumber = '';

        while ($exists) {
            $random = '';
            for ($i = 0; $i < 8; $i++) {
                $random .= $chars[rand(0, strlen($chars) - 1)];
            }
            $orderNumber = "ORD-{$random}";

            $stmt = $this->db->prepare("SELECT 1 FROM orders WHERE order_number = :num");
            $stmt->execute([':num' => $orderNumber]);
            $exists = (bool) $stmt->fetch();
        }

        return $orderNumber;
    }

    /**
     * ----------------------------------------
     * getAll
     * ----------------------------------------
     * Fetches all orders with basic sorting and filtering.
     * Defaults to most recent first.
     */
    public function getAll(array $params = []): array
    {
        $sql = "SELECT * FROM orders WHERE 1=1";
        $binds = [];

        if (!empty($params['status']) && $params['status'] !== 'all') {
            $sql .= " AND status = :status";
            $binds[':status'] = $params['status'];
        }

        if (!empty($params['from'])) {
            $sql .= " AND ordered_at >= :from";
            $binds[':from'] = $params['from'] . ' 00:00:00';
        }

        if (!empty($params['to'])) {
            $sql .= " AND ordered_at <= :to";
            $binds[':to'] = $params['to'] . ' 23:59:59';
        }

        $sql .= " ORDER BY ordered_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($binds);
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * updateStatus
     * ----------------------------------------
     * Updates the status of an existing order.
     */
    public function updateStatus(int $orderId, string $status): bool
    {
        $allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!in_array($status, $allowedStatuses)) {
            return false;
        }

        try {
            $stmt = $this->db->prepare("UPDATE orders SET status = :status WHERE order_id = :id");
            return $stmt->execute([':status' => $status, ':id' => $orderId]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * ----------------------------------------
     * updatePaymentStatusById
     * ----------------------------------------
     * Updates the payment status of an order directly by ID.
     */
    public function updatePaymentStatusById(int $orderId, string $paymentStatus): bool
    {
        $allowedStatuses = ['unpaid', 'paid', 'failed'];
        if (!in_array($paymentStatus, $allowedStatuses)) {
            return false;
        }

        try {
            $stmt = $this->db->prepare("UPDATE orders SET payment_status = :payment_status WHERE order_id = :id");
            return $stmt->execute([':payment_status' => $paymentStatus, ':id' => $orderId]);
        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * ----------------------------------------
     * getOrderCounts
     * ----------------------------------------
     * Returns a breakdown of order counts by status.
     */
    public function getOrderCounts(): array
    {
        $stmt = $this->db->prepare("
            SELECT status, COUNT(*) as count 
            FROM orders 
            GROUP BY status
        ");
        $stmt->execute();
        $counts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $total = array_sum($counts);
        
        // Ensure all possible statuses are represented
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        foreach ($statuses as $status) {
            if (!isset($counts[$status])) {
                $counts[$status] = 0;
            }
        }
        
        return array_merge(['all' => (int)$total], array_map('intval', $counts));
    }

    /**
     * ----------------------------------------
     * getByUserId
     * ----------------------------------------
     * Fetches a customer's orders, with optional status filter.
     */
    public function getByUserId(int $userId, array $params = []): array
    {
        $sql = "
            SELECT o.*, 
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count 
            FROM orders o 
            WHERE o.user_id = :user_id
        ";
        $binds = [':user_id' => $userId];

        if (!empty($params['status']) && $params['status'] !== 'all') {
            $sql .= " AND o.status = :status";
            $binds[':status'] = $params['status'];
        }

        $sql .= " ORDER BY o.ordered_at DESC";

        if (isset($params['limit'])) {
            $limit = (int) $params['limit'];
            $offset = isset($params['offset']) ? (int) $params['offset'] : 0;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($binds);
        return $stmt->fetchAll();
    }

    /**
     * ----------------------------------------
     * getDetailForUser
     * ----------------------------------------
     * Fetches a single order and its items, only if it belongs to the given user.
     */
    public function getDetailForUser(int $orderId, int $userId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE order_id = :order_id AND user_id = :user_id");
        $stmt->execute([
            ':order_id' => $orderId,
            ':user_id' => $userId
        ]);
        
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $stmt = $this->db->prepare("
            SELECT oi.*, p.name as product_name, p.image_path
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = :id
        ");
        $stmt->execute([':id' => $orderId]);
        $order['items'] = $stmt->fetchAll();

        return $order;
    }
}
