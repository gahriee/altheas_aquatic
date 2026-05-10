<?php declare(strict_types=1);

namespace App\Core;

use RuntimeException;

class Uploader
{
    /**
     * ----------------------------------------
     * upload
     * ----------------------------------------
     * Handle single file upload with validation.
     * Routes to Cloudinary when configured, otherwise stores locally.
     *
     * @param array $file The $_FILES entry.
     * @param string $destination The local directory to store the uploaded file (used in dev).
     * @return string The new filename (local) or full Cloudinary URL (production).
     * @throws RuntimeException On any upload or validation error.
     */
    public function upload(array $file, string $destination): string
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException("File upload failed with error code: " . $file['error']);
        }

        if ($file['size'] > 2 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 2MB limit.");
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if (!isset($allowedMimes[$mimeType])) {
            throw new RuntimeException("Invalid file type. Only JPG, PNG, and WEBP are allowed.");
        }

        if (defined('CLOUDINARY_CLOUD_NAME') && CLOUDINARY_CLOUD_NAME !== '') {
            return $this->uploadToCloudinary($file['tmp_name']);
        }

        return $this->uploadLocally($file, $destination, $allowedMimes[$mimeType]);
    }

    /**
     * ----------------------------------------
     * uploadLocally
     * ----------------------------------------
     * Store the file on local disk with a random filename.
     */
    private function uploadLocally(array $file, string $destination, string $extension): string
    {
        $newFilename = bin2hex(random_bytes(16)) . '.' . $extension;

        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        $targetPath = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $newFilename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new RuntimeException("Failed to move uploaded file.");
        }

        return $newFilename;
    }

    /**
     * ----------------------------------------
     * uploadToCloudinary
     * ----------------------------------------
     * Upload the file to Cloudinary via their unsigned REST API.
     * Returns the secure URL of the uploaded image.
     */
    private function uploadToCloudinary(string $tmpPath): string
    {
        $cloudName = CLOUDINARY_CLOUD_NAME;
        $apiKey    = CLOUDINARY_API_KEY;
        $apiSecret = CLOUDINARY_API_SECRET;
        $timestamp = (string) time();

        $params = [
            'folder'    => 'altheas_aquatic/products',
            'timestamp' => $timestamp,
        ];

        ksort($params);
        $signString = implode('&', array_map(
            fn($k, $v) => "$k=$v",
            array_keys($params),
            array_values($params)
        )) . $apiSecret;
        $signature = sha1($signString);

        $url = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

        $postFields = [
            'file'      => new \CURLFile($tmpPath),
            'api_key'   => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
            'folder'    => 'altheas_aquatic/products',
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || $response === false) {
            throw new RuntimeException("Cloudinary upload failed (HTTP $httpCode).");
        }

        $data = json_decode($response, true);
        if (!isset($data['secure_url'])) {
            throw new RuntimeException("Cloudinary response missing secure_url.");
        }

        return $data['secure_url'];
    }
}

