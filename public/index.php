<?php declare(strict_types=1);

/**
 * ----------------------------------------
 * Althea's Aquatic - Front Controller
 * ----------------------------------------
 * This file handles all incoming /api/* requests.
 */

// Load configuration
require_once __DIR__ . '/../config/config.php';

// Composer Autoloader
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// PSR-4 Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// CORS Header Handling
if (defined('APP_ENV') && APP_ENV === 'development') {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token");
}

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Initialize secure sessions
\App\Core\Auth::start();

// Dispatch to Router
$router = new \App\Core\Router();
$router->dispatch();
