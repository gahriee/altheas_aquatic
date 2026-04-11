<?php declare(strict_types=1);

namespace App\Core;

class Auth
{
    /**
     * ----------------------------------------
     * start
     * ----------------------------------------
     * Initialize secure session settings and start the session.
     */
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $isSecure = (defined('APP_ENV') && APP_ENV === 'production');
            
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $isSecure,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            ini_set('session.gc_maxlifetime', '1800');
            session_start();
        }
    }

    /**
     * ----------------------------------------
     * login
     * ----------------------------------------
     * Set session variables for an authenticated user.
     *
     * @param int $userId The ID of the authenticated user.
     * @param string $role The role of the user.
     */
    public static function login(int $userId, string $role): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = $role;
        $_SESSION['last_activity'] = time();
    }

    /**
     * ----------------------------------------
     * logout
     * ----------------------------------------
     * Destroy the session and clear the session cookie.
     */
    public static function logout(): void
    {
        $_SESSION = [];
        
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        session_destroy();
    }

    /**
     * ----------------------------------------
     * requireLogin
     * ----------------------------------------
     * Ensure the user is authenticated and the session is active.
     */
    public static function requireLogin(): void
    {
        if (!self::isLoggedIn()) {
            Response::unauthorized();
        }

        // Refresh last activity
        $_SESSION['last_activity'] = time();
    }

    /**
     * ----------------------------------------
     * isLoggedIn
     * ----------------------------------------
     * Check if a valid session exists and is within the timeout window.
     *
     * @return bool True if logged in and session is fresh.
     */
    public static function isLoggedIn(): bool
    {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }

        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
            self::logout();
            return false;
        }

        return true;
    }

    /**
     * ----------------------------------------
     * user
     * ----------------------------------------
     * Get the current authenticated user's details.
     *
     * @return array The user details ['id' => int, 'role' => string].
     */
    public static function user(): array
    {
        if (!self::isLoggedIn()) {
            Response::unauthorized();
        }

        return [
            'id' => $_SESSION['user_id'],
            'role' => $_SESSION['role']
        ];
    }
}
