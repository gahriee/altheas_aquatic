<?php declare(strict_types=1);

namespace App\Core;

use RuntimeException;

class Uploader
{
    /**
     * ----------------------------------------
     * upload
     * ----------------------------------------
     * Handle single file upload with validation and renaming.
     *
     * @param array $file The $_FILES entry.
     * @param string $destination The directory to store the uploaded file.
     * @return string The new filename.
     * @throws RuntimeException On any upload or validation error.
     */
    public function upload(array $file, string $destination): string
    {
        // Check for PHP upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException("File upload failed with error code: " . $file['error']);
        }

        // Validate file size (max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 2MB limit.");
        }

        // Validate MIME type
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

        // Generate new random filename
        $extension = $allowedMimes[$mimeType];
        $newFilename = bin2hex(random_bytes(16)) . '.' . $extension;

        // Ensure destination directory exists
        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }

        // Move the file
        $targetPath = rtrim($destination, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $newFilename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new RuntimeException("Failed to move uploaded file.");
        }

        return $newFilename;
    }
}
