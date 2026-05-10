-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `data_json` JSON NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_notifications_read` (`is_read`),
    INDEX `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add delivery_address to orders table
ALTER TABLE `orders` 
ADD COLUMN `delivery_address` TEXT NULL AFTER `customer_phone`;

-- 3. Add user_id to orders table
ALTER TABLE `orders` ADD COLUMN `user_id` INT UNSIGNED NULL AFTER `order_id`;
ALTER TABLE `orders` ADD INDEX idx_orders_user (`user_id`);
ALTER TABLE `orders` ADD CONSTRAINT fk_orders_user FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;
UPDATE `orders` o JOIN `users` u ON o.customer_email = u.email SET o.user_id = u.id WHERE o.user_id IS NULL;
