-- Migration: Add order_number to orders table
-- Created: 2026-04-19

ALTER TABLE `orders` ADD COLUMN `order_number` VARCHAR(25) NULL AFTER `total_amount`;
ALTER TABLE `orders` ADD UNIQUE INDEX `idx_orders_number` (`order_number`);
