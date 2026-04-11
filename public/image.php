<?php declare(strict_types=1);

/**
 * ----------------------------------------
 * Althea's Aquatic - Image Serve Script
 * ----------------------------------------
 * Safely serves product images from outside the web root.
 */

$file = $_GET['file'] ?? '';

// Validate filename format (MD5 hash + extension)
if (!preg_match('/^[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/', $file)) {
    http_response_code(404);
    exit;
}

// Construct path to storage directory
$path = __DIR__ . '/../storage/products/' . $file;

if (!file_exists($path)) {
    http_response_code(404);
    exit;
}

// Detect MIME type and serve
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $path);
finfo_close($finfo);

header("Content-Type: $mime");
readfile($path);
