<?php declare(strict_types=1);

/**
 * ----------------------------------------
 * Althea's Aquatic - Environment Loader
 * ----------------------------------------
 * Reads the .env file and defines constants for project-wide use.
 */

$envPath = __DIR__ . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

        // Split by first equals sign
        if (str_contains($line, '=')) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Fallback defaults if NOT defined in .env
$defaults = [
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'altheas_aquatic',
    'DB_USER' => 'root',
    'DB_PASS' => '',
    'APP_URL' => 'http://localhost:8000',
    'APP_ENV' => 'development',
    'PAYMONGO_PUBLIC_KEY' => '',
    'PAYMONGO_SECRET_KEY' => '',
    'PAYMONGO_WEBHOOK_SECRET' => '',
    'PUSHER_APP_ID' => '',
    'PUSHER_APP_KEY' => '',
    'PUSHER_APP_SECRET' => '',
    'PUSHER_APP_CLUSTER' => 'ap1'
];

foreach ($defaults as $key => $value) {
    if (!defined($key)) {
        define($key, $value);
    }
}
