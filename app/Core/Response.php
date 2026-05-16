<?php declare(strict_types=1);

namespace App\Core;

class Response
{
    /**
     * ----------------------------------------
     * json
     * ----------------------------------------
     * Send a JSON response and exit.
     *
     * @param array $data The data to encode as JSON.
     * @param int $status The HTTP status code.
     */
    public static function json(array $data, int $status = 200): void
    {
        header('Content-Type: application/json');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    /**
     * ----------------------------------------
     * error
     * ----------------------------------------
     * Send a JSON error response and exit.
     *
     * @param string $message The error message.
     * @param int $status The HTTP status code.
     */
    public static function error(string $message, int $status = 400): void
    {
        self::json(['error' => $message], $status);
    }

    /**
     * ----------------------------------------
     * unauthorized
     * ----------------------------------------
     * Send a 401 Unauthorized JSON error response and exit.
     */
    public static function unauthorized(): void
    {
        self::error('Unauthenticated', 401);
    }

    /**
     * ----------------------------------------
     * noContent
     * ----------------------------------------
     * Send a 204 No Content response and exit.
     */
    public static function noContent(): void
    {
        http_response_code(204);
        exit;
    }
}
