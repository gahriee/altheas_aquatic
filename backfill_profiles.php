<?php
require 'config/config.php';
$db = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASS);
$db->exec('INSERT IGNORE INTO user_profiles (user_id) SELECT id FROM users');
echo 'Done';
