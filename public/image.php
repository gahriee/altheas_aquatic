<?php declare(strict_types=1);

/**
 * ----------------------------------------
 * Althea's Aquatic - Image Serve Script
 * ----------------------------------------
 * Serves product images from local storage or redirects to Cloudinary URLs.
 */

$file = $_GET['file'] ?? '';

if ($file === '') {
    http_response_code(404);
    exit;
}

if (str_starts_with($file, 'https://') || str_starts_with($file, 'http://')) {
    header("Location: $file", true, 302);
    exit;
}

if (!preg_match('/^[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/', $file)) {
    http_response_code(404);
    exit;
}

$path = __DIR__ . '/../storage/products/' . $file;

if (!file_exists($path)) {
    http_response_code(404);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $path);
finfo_close($finfo);

header("Content-Type: $mime");
header("Cache-Control: public, max-age=31536000");
readfile($path);

