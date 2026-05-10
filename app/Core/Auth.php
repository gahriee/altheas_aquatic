<?php declare(strict_types=1);

namespace App\Core;

use Delight\Auth\Auth as DelightAuth;
use App\Core\Database;

class Auth
{
    private static ?DelightAuth $instance = null;

    /**
     * ----------------------------------------
     * getInstance
     * ----------------------------------------
     * Get the singleton instance of Delight Auth.
     */
    public static function getInstance(): DelightAuth
    {
        if (self::$instance === null) {
            $db = Database::getInstance()->getConnection();
            self::$instance = new DelightAuth($db);
        }
        return self::$instance;
    }

    /**
     * ----------------------------------------
     * start
     * ----------------------------------------
     * Placeholder to maintain API compatibility; 
     * session is managed by the library.
     */
    public static function start(): void
    {
        // Delight Auth handles session_start internally or via getInstance
        self::getInstance();
    }

    /**
     * ----------------------------------------
     * requireLogin
     * ----------------------------------------
     * Ensure the user is authenticated.
     */
    public static function requireLogin(): void
    {
        if (!self::isLoggedIn()) {
            Response::unauthorized();
        }
    }

    /**
     * ----------------------------------------
     * requireCustomerLogin
     * ----------------------------------------
     * Ensure any user is authenticated (including customers).
     */
    public static function requireCustomerLogin(): void
    {
        if (!self::isLoggedIn()) {
            Response::unauthorized();
        }
    }

    /**
     * ----------------------------------------
     * isLoggedIn
     * ----------------------------------------
     * Check if a valid session exists.
     */
    public static function isLoggedIn(): bool
    {
        return self::getInstance()->isLoggedIn();
    }

    /**
     * ----------------------------------------
     * user
     * ----------------------------------------
     * Get basic details of the logged-in user.
     */
    public static function user(): array
    {
        $auth = self::getInstance();
        if (!$auth->isLoggedIn()) {
            Response::unauthorized();
        }

        return [
            'id' => $auth->getUserId(),
            'email' => $auth->getEmail(),
            'role' => self::getRole()
        ];
    }

    /**
     * ----------------------------------------
     * userId
     * ----------------------------------------
     * Get the authenticated user ID.
     */
    public static function userId(): ?int
    {
        return self::getInstance()->getUserId();
    }

    /**
     * ----------------------------------------
     * getRole
     * ----------------------------------------
     * Helper to get the primary role label.
     */
    public static function getRole(): string
    {
        $auth = self::getInstance();
        if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) return 'admin';
        if ($auth->hasRole(\Delight\Auth\Role::MANAGER)) return 'staff';
        return 'customer';
    }
}
