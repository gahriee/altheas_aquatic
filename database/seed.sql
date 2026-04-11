-- Althea's Aquatic — Seed Data
-- Version: 1.0
-- Created: 2026-04-11

SET NAMES utf8mb4;

-- Default admin user
-- Password: admin1234 (bcrypt cost 12)
INSERT INTO `users` (`username`, `password_hash`, `role`) VALUES 
('admin', '$2y$12$LFjLiZZTmuoHxdVh3Ckef.bH0zOCSn0kZ1XBeB6vKKgWXhDAshiXC', 'admin');

-- Seed categories
INSERT INTO `categories` (`name`, `description`) VALUES 
('Aquatic Life', 'Live fish, shrimp, and snails'),
('Aquatic Plants', 'Live plants for freshwater aquariums'),
('Accessories', 'Filters, lighting, substrate, and tools');
