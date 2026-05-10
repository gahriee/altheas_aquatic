<?php declare(strict_types=1);

/**
 * ----------------------------------------
 * Althea's Aquatic - Environment Loader
 * ----------------------------------------
 * Reads the .env file and defines constants for project-wide use.
 * Also supports cloud provider environment variables (Render, TiDB, Cloudinary).
 */

$cloudDbMap = [
    'DB_HOST' => ['TIDB_HOST', 'MYSQLHOST'],
    'DB_NAME' => ['TIDB_DATABASE', 'MYSQLDATABASE'],
    'DB_USER' => ['TIDB_USER', 'MYSQLUSER'],
    'DB_PASS' => ['TIDB_PASSWORD', 'MYSQLPASSWORD'],
    'DB_PORT' => ['TIDB_PORT', 'MYSQLPORT'],
];

foreach ($cloudDbMap as $constant => $envKeys) {
    if (!defined($constant)) {
        foreach ($envKeys as $envKey) {
            $val = getenv($envKey);
            if ($val !== false && $val !== '') {
                define($constant, $val);
                break;
            }
        }
    }
}

if (!defined('DB_SSL')) {
    $sslEnv = getenv('DB_SSL');
    if ($sslEnv !== false && $sslEnv !== '') {
        define('DB_SSL', $sslEnv === 'true' || $sslEnv === '1');
    }
}

$envPath = __DIR__ . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

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

$defaults = [
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'altheas_aquatic',
    'DB_USER' => 'root',
    'DB_PASS' => '',
    'DB_PORT' => '3306',
    'DB_SSL' => false,
    'APP_URL' => 'http://localhost:8000',
    'APP_ENV' => 'development',
    'FRONTEND_URL' => 'http://localhost:5173',
    'PAYMONGO_PUBLIC_KEY' => '',
    'PAYMONGO_SECRET_KEY' => '',
    'PAYMONGO_WEBHOOK_SECRET' => '',
    'PUSHER_APP_ID' => '',
    'PUSHER_APP_KEY' => '',
    'PUSHER_APP_SECRET' => '',
    'PUSHER_APP_CLUSTER' => 'ap1',
    'CLOUDINARY_CLOUD_NAME' => '',
    'CLOUDINARY_API_KEY' => '',
    'CLOUDINARY_API_SECRET' => '',
];

foreach ($defaults as $key => $default) {
    if (!defined($key)) {
        $envVal = getenv($key);
        if ($envVal !== false && $envVal !== '') {
            define($key, $envVal);
        } else {
            define($key, $default);
        }
    }
}
