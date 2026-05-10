-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 10, 2026 at 06:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `altheas_aquatic`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `item_id` int(11) NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Aquatic Pets', 'Live fish, shrimp, and snails'),
(2, 'Aquatic Plants', 'Live plants for freshwater aquariums');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `delivery_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty_received` int(11) NOT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `delivered_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `data_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data_json`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `data_json`, `is_read`, `created_at`) VALUES
(1, 'order_paid', 'Payment Received', 'Order #23 for ₱100.00 has been paid.', '{\"order_id\":23}', 1, '2026-04-19 19:50:32'),
(2, 'order_paid', 'Payment Received', 'Order ORD-NBWBF4VY for ₱50.00 has been paid.', '{\"order_id\":24,\"order_number\":\"ORD-NBWBF4VY\"}', 1, '2026-04-19 20:05:13'),
(3, 'order_paid', 'Payment Received', 'Order ORD-ZN19QD7G for ₱200.00 has been paid.', '{\"order_id\":25,\"order_number\":\"ORD-ZN19QD7G\"}', 1, '2026-04-19 21:15:25'),
(4, 'order_paid', 'Payment Received', 'Order ORD-17WQPZRR for ₱200.00 has been paid.', '{\"order_id\":26,\"order_number\":\"ORD-17WQPZRR\"}', 1, '2026-04-19 21:19:36'),
(5, 'order_paid', 'Payment Received', 'Order ORD-MGAOX6FT for ₱250.00 has been paid.', '{\"order_id\":27,\"order_number\":\"ORD-MGAOX6FT\"}', 1, '2026-04-19 21:27:26'),
(6, 'order_paid', 'Payment Received', 'Order ORD-49S7NQJ3 for ₱50.00 has been paid.', '{\"order_id\":32,\"order_number\":\"ORD-49S7NQJ3\"}', 0, '2026-05-10 17:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
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
  `ordered_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `delivery_address`, `total_amount`, `order_number`, `payment_intent_id`, `payment_method`, `payment_status`, `status`, `ordered_at`, `notes`) VALUES
(32, 2, 'Edgar Dollentas', 'edgardollentas04@gmail.com', '09311059092', 'Test, Adams (Pob.), Adams, Ilocos Norte, Region I (Ilocos Region)', 50.00, 'ORD-49S7NQJ3', 'pi_zBAw3dJf8oXhj1bN6ACguiep', 'gcash', 'paid', 'confirmed', '2026-05-10 17:33:23', '');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`item_id`, `order_id`, `product_id`, `qty`, `unit_price`, `subtotal`) VALUES
(38, 32, 6, 1, 50.00, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_qty` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`, `stock_qty`, `low_stock_threshold`, `image_path`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Amano Shrimp', 'Peaceful, great algae eaters.', 50.00, 73, 5, '81458ceb406047235685bc299dc34993.jpg', 1, '2026-04-19 15:02:47', '2026-04-19 21:15:15'),
(2, 1, 'Red Cherry Shrimp', 'Vibrant red shrimp, perfect for beginners.', 50.00, 97, 5, 'cb583acf2bc98463528beb34dccb5e61.jpg', 1, '2026-04-19 20:10:07', '2026-04-19 21:27:14'),
(3, 1, 'Nerite Snail', 'Excellent algae cleaners.', 50.00, 150, 5, '8fd6847b29c1c398bb5a0a398dea6420.jpg', 1, '2026-04-19 20:10:35', '2026-04-19 20:10:44'),
(4, 2, 'Hornworth', 'Fast-growing plant that helps oxygenate the tank.', 50.00, 150, 5, 'd9674b8345426a36f324733eb350186b.jpg', 1, '2026-04-19 20:11:25', '2026-04-19 20:11:25'),
(5, 2, 'Hydrilla', 'Great for shrimp tanks and beginner-friendly.', 50.00, 147, 5, '76c4d9d97761b17a46bda115a6c4c7d8.jpg', 1, '2026-04-19 20:12:00', '2026-05-10 15:42:21'),
(6, 2, 'Pearl Weed', 'Compact carpeting plant ideal for aquascaping.', 50.00, 143, 5, '1b1c02fcfeb53152be7e95ac4ff731f4.jpg', 1, '2026-04-19 20:12:25', '2026-05-10 17:33:23');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(249) NOT NULL,
  `password` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `verified` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `resettable` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `roles_mask` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `registered` int(10) UNSIGNED NOT NULL,
  `last_login` int(10) UNSIGNED DEFAULT NULL,
  `force_logout` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
  `role_label` enum('admin','staff','customer') DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `username`, `status`, `verified`, `resettable`, `roles_mask`, `registered`, `last_login`, `force_logout`, `role_label`) VALUES
(1, 'admin@example.com', '$pa01$2y$10$K9iSuhnU7JXAi9OUxSFSquQdb.v7YvdrMIY0HaAzSSynY.XlfFTKq', NULL, 0, 1, 1, 1, 1776582079, 1778411873, 0, 'admin'),
(2, 'edgardollentas04@gmail.com', '$pa01$2y$10$2II37Ag9gedTQXOsX6xPXuFu9U8rlxWbShD2wNWsf8r8RdydSZQZO', NULL, 0, 1, 1, 16, 1778398892, 1778398899, 0, 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `users_2fa`
--

CREATE TABLE `users_2fa` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `mechanism` tinyint(3) UNSIGNED NOT NULL,
  `seed` varchar(255) DEFAULT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_audit_log`
--

CREATE TABLE `users_audit_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `event_at` int(10) UNSIGNED NOT NULL,
  `event_type` varchar(128) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `admin_id` int(10) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(49) CHARACTER SET ascii COLLATE ascii_general_ci DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `details_json` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users_audit_log`
--

INSERT INTO `users_audit_log` (`id`, `user_id`, `event_at`, `event_type`, `admin_id`, `ip_address`, `user_agent`, `details_json`) VALUES
(1, 1, 1776582096, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(2, 1, 1776582200, 'login', NULL, NULL, NULL, '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(3, 1, 1776582252, 'logout.local', NULL, '::/48', 'nlIWmzsbvEU3sXZNKoCfTehikyTHZ370T1Qi31oUVDo=', NULL),
(4, 1, 1776583020, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(5, 1, 1776593713, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(6, 1, 1776594395, 'logout.local', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', NULL),
(7, 1, 1776594805, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(8, 1, 1776598288, 'logout.local', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', NULL),
(9, 1, 1776598294, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(10, 1, 1778086645, 'login', NULL, '::/48', 'OHrnrvD/LLiLaLh5Ci9euLZ3wZp2WjEYUXtG3xfFUZM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(11, 1, 1778394097, 'login', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(12, 1, 1778396892, 'logout.local', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', NULL),
(13, 1, 1778396941, 'login', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(14, 1, 1778397222, 'logout.local', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', NULL),
(15, 1, 1778397235, 'login', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}'),
(16, 1, 1778398789, 'logout.local', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', NULL),
(17, 2, 1778398892, 'register', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"e***4@g***l.com\",\"username\":null}'),
(18, 2, 1778398899, 'login', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"e***4@g***l.com\",\"username\":null}'),
(19, 2, 1778411866, 'logout.local', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', NULL),
(20, 1, 1778411873, 'login', NULL, '::/48', 'mISJZYC72ShbigeC6nrmPeAe1fRx0bq2IC3gYwwDmaM=', '{\"email\":\"a***n@e***e.com\",\"username\":null}');

-- --------------------------------------------------------

--
-- Table structure for table `users_confirmations`
--

CREATE TABLE `users_confirmations` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `email` varchar(249) NOT NULL,
  `selector` varchar(16) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_otps`
--

CREATE TABLE `users_otps` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `mechanism` tinyint(3) UNSIGNED NOT NULL,
  `single_factor` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `selector` varchar(24) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `expires_at` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_remembered`
--

CREATE TABLE `users_remembered` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user` int(10) UNSIGNED NOT NULL,
  `selector` varchar(24) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_resets`
--

CREATE TABLE `users_resets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user` int(10) UNSIGNED NOT NULL,
  `selector` varchar(20) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `token` varchar(255) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `expires` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_throttling`
--

CREATE TABLE `users_throttling` (
  `bucket` varchar(44) CHARACTER SET latin1 COLLATE latin1_general_cs NOT NULL,
  `tokens` float NOT NULL,
  `replenished_at` int(10) UNSIGNED NOT NULL,
  `expires_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users_throttling`
--

INSERT INTO `users_throttling` (`bucket`, `tokens`, `replenished_at`, `expires_at`) VALUES
('CUeQSH1MUnRpuE3Wqv_fI3nADvMpK_cg6VpYK37vgIw', 4, 1778398892, 1778830892),
('ejWtPDKvxt-q7LZ3mFjzUoIWKJYzu47igC8Jd9mffFk', 73.9378, 1778411873, 1778951873),
('nerfTmBUuCaKnb-KHBaUeSWsBERIajGEwwlnCf_XmOo', 74, 1776582200, 1777122200);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `idx_user_product` (`user_id`,`product_id`),
  ADD KEY `idx_cart_product` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`delivery_id`),
  ADD KEY `idx_deliveries_date` (`delivered_at`),
  ADD KEY `idx_deliveries_supplier` (`supplier_id`),
  ADD KEY `idx_deliveries_product` (`product_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_read` (`is_read`),
  ADD KEY `idx_notifications_created` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `idx_orders_number` (`order_number`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_payment_status` (`payment_status`),
  ADD KEY `idx_orders_payment_intent` (`payment_intent_id`),
  ADD KEY `idx_orders_date` (`ordered_at`),
  ADD KEY `idx_orders_email` (`customer_email`),
  ADD KEY `idx_orders_customer` (`customer_name`),
  ADD KEY `idx_orders_user` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `fk_items_orders` (`order_id`),
  ADD KEY `idx_items_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_products_active` (`is_active`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_price` (`price`),
  ADD KEY `idx_products_created` (`created_at`),
  ADD KEY `idx_products_stock` (`stock_qty`),
  ADD KEY `idx_products_active_cat` (`is_active`,`category_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users_2fa`
--
ALTER TABLE `users_2fa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id_mechanism` (`user_id`,`mechanism`);

--
-- Indexes for table `users_audit_log`
--
ALTER TABLE `users_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_at` (`event_at`),
  ADD KEY `user_id_event_at` (`user_id`,`event_at`),
  ADD KEY `user_id_event_type_event_at` (`user_id`,`event_type`,`event_at`);

--
-- Indexes for table `users_confirmations`
--
ALTER TABLE `users_confirmations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `selector` (`selector`),
  ADD KEY `email_expires` (`email`,`expires`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users_otps`
--
ALTER TABLE `users_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id_mechanism` (`user_id`,`mechanism`),
  ADD KEY `selector_user_id` (`selector`,`user_id`);

--
-- Indexes for table `users_remembered`
--
ALTER TABLE `users_remembered`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `selector` (`selector`),
  ADD KEY `user` (`user`);

--
-- Indexes for table `users_resets`
--
ALTER TABLE `users_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `selector` (`selector`),
  ADD KEY `user_expires` (`user`,`expires`);

--
-- Indexes for table `users_throttling`
--
ALTER TABLE `users_throttling`
  ADD PRIMARY KEY (`bucket`),
  ADD KEY `expires_at` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `delivery_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users_2fa`
--
ALTER TABLE `users_2fa`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_audit_log`
--
ALTER TABLE `users_audit_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users_confirmations`
--
ALTER TABLE `users_confirmations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_otps`
--
ALTER TABLE `users_otps`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_remembered`
--
ALTER TABLE `users_remembered`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_resets`
--
ALTER TABLE `users_resets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `fk_deliveries_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `fk_deliveries_suppliers` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_items_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_items_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
