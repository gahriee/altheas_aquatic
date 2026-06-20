<?php
require 'app/Core/Database.php';
require 'config/config.php';
$db = \App\Core\Database::getInstance()->getConnection();
$stmt = $db->query("SELECT order_id, order_number, payment_status, intent_id FROM orders ORDER BY order_id DESC LIMIT 1");
$order = $stmt->fetch();
print_r($order);

require 'app/Core/PayMongo.php';
$payMongo = new \App\Core\PayMongo();
$intent = $payMongo->retrievePaymentIntent($order['intent_id']);
echo "PayMongo intent status: " . $intent['data']['attributes']['status'] . "\n";
