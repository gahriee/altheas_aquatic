-- Althea's Aquatic — Seed Data
-- Version: 1.0
-- Created: 2026-04-11

SET NAMES utf8mb4;

-- Default admin user
-- Password: admin1234 (bcrypt cost 12)
-- Using roles_mask: 1 (Admin) and status: 0 (Normal)
INSERT INTO `users` (`email`, `password`, `status`, `verified`, `roles_mask`, `registered`, `role_label`) VALUES 
('admin@example.com', '$2y$12$LFjLiZZTmuoHxdVh3Ckef.bH0zOCSn0kZ1XBeB6vKKgWXhDAshiXC', 0, 1, 1, UNIX_TIMESTAMP(), 'admin');

-- Default admin profile
INSERT INTO `user_profiles` (`user_id`, `display_name`) VALUES (1, 'System Admin');

-- Seed categories
INSERT INTO `categories` (`name`, `description`) VALUES 
('Aquatic Pets', 'Live fish, shrimp, and snails'),
('Aquatic Plants', 'Live plants for freshwater aquariums'),