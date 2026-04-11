<?php declare(strict_types=1);

namespace App\Core;

class Csrf
{
    /**
     * ----------------------------------------
     * generate
     * ----------------------------------------
     * Create a new CSRF token and store it in the session.
     *
     * @return string The generated token.
     */
    public static function generate(): string
    {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

    /**
     * ----------------------------------------
     * token
     * ----------------------------------------
     * Get the existing CSRF token or generate a new one.
     *
     * @return string The CSRF token.
     */
    public static function token(): string
    {
        if (empty($_SESSION['csrf_token'])) {
            return self::generate();
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * ----------------------------------------
     * verifyHeader
     * ----------------------------------------
     * Verify the X-CSRF-Token header against the session token.
     */
    public static function verifyHeader(): void
    {
        $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';

        if (empty($headerToken) || empty($sessionToken) || !hash_equals($sessionToken, $headerToken)) {
            Response::error('Invalid CSRF token', 403);
        }
    }
}
