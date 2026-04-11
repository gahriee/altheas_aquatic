-- Althea's Aquatic — Database Schema
-- Version: 1.0
-- Created: 2026-04-11

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(80) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `last_login` DATETIME NULL,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. categories
CREATE TABLE IF NOT EXISTS `categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) UNIQUE NOT NULL, 
    `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
    `supplier_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) UNIQUE NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(150) NULL,
    `address` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. products
CREATE TABLE IF NOT EXISTS `products` (
    `product_id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(150) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `stock_qty` INT DEFAULT 0,
    `low_stock_threshold` INT DEFAULT 5,
    `image_path` VARCHAR(255) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE RESTRICT,
    INDEX `idx_products_active` (`is_active`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_price` (`price`),
    INDEX `idx_products_created` (`created_at`),
    INDEX `idx_products_stock` (`stock_qty`),
    INDEX `idx_products_active_cat` (`is_active`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. orders
CREATE TABLE IF NOT EXISTS `orders` (
    `order_id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_email` VARCHAR(150) NULL,
    `customer_phone` VARCHAR(30) NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    `ordered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `notes` TEXT NULL,
    INDEX `idx_orders_status` (`status`),
    INDEX `idx_orders_date` (`ordered_at`),
    INDEX `idx_orders_email` (`customer_email`),
    INDEX `idx_orders_customer` (`customer_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. deliveries
CREATE TABLE IF NOT EXISTS `deliveries` (
    `delivery_id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `qty_received` INT NOT NULL,
    `unit_cost` DECIMAL(10, 2) NULL,
    `delivered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `notes` TEXT NULL,
    CONSTRAINT `fk_deliveries_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_deliveries_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT,
    INDEX `idx_deliveries_date` (`delivered_at`),
    INDEX `idx_deliveries_supplier` (`supplier_id`),
    INDEX `idx_deliveries_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. order_items
CREATE TABLE IF NOT EXISTS `order_items` (
    `item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `qty` INT NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT,
    INDEX `idx_items_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. rate_limit_log
CREATE TABLE IF NOT EXISTS `rate_limit_log` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ip_address` VARCHAR(45) NOT NULL,
    `endpoint` VARCHAR(100) NOT NULL,
    `attempted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_rate_limit` (`ip_address`, `endpoint`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
