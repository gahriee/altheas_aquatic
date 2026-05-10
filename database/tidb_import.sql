-- =============================================
-- Althea's Aquatic — TiDB Cloud Import Script
-- =============================================
-- Fixed: latin1_general_cs → latin1_bin (TiDB compatible)
-- Fixed: Removed MariaDB CHECK constraints
-- Fixed: Inline indexes/constraints with CREATE TABLE

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(249) NOT NULL,
  `password` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `verified` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `resettable` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `roles_mask` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `registered` int(10) UNSIGNED NOT NULL,
  `last_login` int(10) UNSIGNED DEFAULT NULL,
  `force_logout` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
  `role_label` enum('admin','staff','customer') DEFAULT 'customer',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `email`, `password`, `username`, `status`, `verified`, `resettable`, `roles_mask`, `registered`, `last_login`, `force_logout`, `role_label`) VALUES
(1, 'admin@example.com', '$pa01$2y$10$K9iSuhnU7JXAi9OUxSFSquQdb.v7YvdrMIY0HaAzSSynY.XlfFTKq', NULL, 0, 1, 1, 1, 1776582079, 1778411873, 0, 'admin'),
(2, 'edgardollentas04@gmail.com', '$pa01$2y$10$2II37Ag9gedTQXOsX6xPXuFu9U8rlxWbShD2wNWsf8r8RdydSZQZO', NULL, 0, 1, 1, 16, 1778398892, 1778398899, 0, 'customer');

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Aquatic Pets', 'Live fish, shrimp, and snails'),
(2, 'Aquatic Plants', 'Live plants for freshwater aquariums');

-- --------------------------------------------------------
-- Table: products
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_qty` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_products_active` (`is_active`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_created` (`created_at`),
  KEY `idx_products_stock` (`stock_qty`),
  KEY `idx_products_active_cat` (`is_active`,`category_id`),
  CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`, `stock_qty`, `low_stock_threshold`, `image_path`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Amano Shrimp', 'Peaceful, great algae eaters.', 50.00, 73, 5, '81458ceb406047235685bc299dc34993.jpg', 1, '2026-04-19 15:02:47', '2026-04-19 21:15:15'),
(2, 1, 'Red Cherry Shrimp', 'Vibrant red shrimp, perfect for beginners.', 50.00, 97, 5, 'cb583acf2bc98463528beb34dccb5e61.jpg', 1, '2026-04-19 20:10:07', '2026-04-19 21:27:14'),
(3, 1, 'Nerite Snail', 'Excellent algae cleaners.', 50.00, 150, 5, '8fd6847b29c1c398bb5a0a398dea6420.jpg', 1, '2026-04-19 20:10:35', '2026-04-19 20:10:44'),
(4, 2, 'Hornworth', 'Fast-growing plant that helps oxygenate the tank.', 50.00, 150, 5, 'd9674b8345426a36f324733eb350186b.jpg', 1, '2026-04-19 20:11:25', '2026-04-19 20:11:25'),
(5, 2, 'Hydrilla', 'Great for shrimp tanks and beginner-friendly.', 50.00, 147, 5, '76c4d9d97761b17a46bda115a6c4c7d8.jpg', 1, '2026-04-19 20:12:00', '2026-05-10 15:42:21'),
(6, 2, 'Pearl Weed', 'Compact carpeting plant ideal for aquascaping.', 50.00, 143, 5, '1b1c02fcfeb53152be7e95ac4ff731f4.jpg', 1, '2026-04-19 20:12:25', '2026-05-10 17:33:23');

-- --------------------------------------------------------
-- Table: suppliers
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `suppliers` (
  `supplier_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: orders
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(150) DEFAULT NULL,
  `customer_phone` varchar(30) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `order_number` varchar(25) DEFAULT NULL,
  `payment_intent_id` varchar(100) DEFAULT NULL,
  `payment_method` enum('gcash','card','maya') DEFAULT 'gcash',
  `payment_status` enum('unpaid','paid','failed') DEFAULT 'unpaid',
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `ordered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `idx_orders_number` (`order_number`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_payment_status` (`payment_status`),
  KEY `idx_orders_payment_intent` (`payment_intent_id`),
  KEY `idx_orders_date` (`ordered_at`),
  KEY `idx_orders_email` (`customer_email`),
  KEY `idx_orders_customer` (`customer_name`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`order_id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `delivery_address`, `total_amount`, `order_number`, `payment_intent_id`, `payment_method`, `payment_status`, `status`, `ordered_at`, `notes`) VALUES
(32, 2, 'Edgar Dollentas', 'edgardollentas04@gmail.com', '09311059092', 'Test, Adams (Pob.), Adams, Ilocos Norte, Region I (Ilocos Region)', 50.00, 'ORD-49S7NQJ3', 'pi_zBAw3dJf8oXhj1bN6ACguiep', 'gcash', 'paid', 'confirmed', '2026-05-10 17:33:23', '');

-- --------------------------------------------------------
-- Table: order_items
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `order_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_items_orders` (`order_id`),
  KEY `idx_items_product` (`product_id`),
  CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `qty`, `unit_price`, `subtotal`) VALUES
(38, 32, 6, 1, 50.00, 50.00);

-- --------------------------------------------------------
-- Table: deliveries
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deliveries` (
  `delivery_id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty_received` int(11) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `delivered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`delivery_id`),
  KEY `idx_deliveries_date` (`delivered_at`),
  KEY `idx_deliveries_supplier` (`supplier_id`),
  KEY `idx_deliveries_product` (`product_id`),
  CONSTRAINT `fk_deliveries_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_deliveries_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: cart_items
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cart_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `idx_user_product` (`user_id`,`product_id`),
  KEY `idx_cart_product` (`product_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `data_json` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `data_json`, `is_read`, `created_at`) VALUES
(1, 'order_paid', 'Payment Received', 'Order #23 for ₱100.00 has been paid.', '{"order_id":23}', 1, '2026-04-19 19:50:32'),
(2, 'order_paid', 'Payment Received', 'Order ORD-NBWBF4VY for ₱50.00 has been paid.', '{"order_id":24,"order_number":"ORD-NBWBF4VY"}', 1, '2026-04-19 20:05:13'),
(3, 'order_paid', 'Payment Received', 'Order ORD-ZN19QD7G for ₱200.00 has been paid.', '{"order_id":25,"order_number":"ORD-ZN19QD7G"}', 1, '2026-04-19 21:15:25'),
(4, 'order_paid', 'Payment Received', 'Order ORD-17WQPZRR for ₱200.00 has been paid.', '{"order_id":26,"order_number":"ORD-17WQPZRR"}', 1, '2026-04-19 21:19:36'),
(5, 'order_paid', 'Payment Received', 'Order ORD-MGAOX6FT for ₱250.00 has been paid.', '{"order_id":27,"order_number":"ORD-MGAOX6FT"}', 1, '2026-04-19 21:27:26'),
(6, 'order_paid', 'Payment Received', 'Order ORD-49S7NQJ3 for ₱50.00 has been paid.', '{"order_id":32,"order_number":"ORD-49S7NQJ3"}', 0, '2026-05-10 17:34:58');

-- --------------------------------------------------------
-- Auth tables (delight-im/auth)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users_confirmations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `email` varchar(249) NOT NULL,
  `selector` varchar(16) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `selector` (`selector`),
  KEY `email_expires` (`email`,`expires`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_remembered` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user` int(10) UNSIGNED NOT NULL,
  `selector` varchar(24) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `selector` (`selector`),
  KEY `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_resets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user` int(10) UNSIGNED NOT NULL,
  `selector` varchar(20) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `selector` (`selector`),
  KEY `user_expires` (`user`,`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_throttling` (
  `bucket` varchar(44) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `tokens` float NOT NULL,
  `replenished_at` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`bucket`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_audit_log` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `event_at` int(10) UNSIGNED NOT NULL,
  `event_type` varchar(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `admin_id` int(10) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(49) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `details_json` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_at` (`event_at`),
  KEY `user_id_event_at` (`user_id`,`event_at`),
  KEY `user_id_event_type_event_at` (`user_id`,`event_type`,`event_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_2fa` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `mechanism` tinyint(3) UNSIGNED NOT NULL,
  `seed` varchar(255) DEFAULT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_mechanism` (`user_id`,`mechanism`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users_otps` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `mechanism` tinyint(3) UNSIGNED NOT NULL,
  `single_factor` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `selector` varchar(24) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `expires_at` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_mechanism` (`user_id`,`mechanism`),
  KEY `selector_user_id` (`selector`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
