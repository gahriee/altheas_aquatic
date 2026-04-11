<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;

class AuthController
{
    /**
     * ----------------------------------------
     * csrfToken
     * ----------------------------------------
     * Return the current CSRF token as JSON.
     */
    public function csrfToken(): void
    {
        Response::json(['token' => Csrf::token()]);
    }

    /**
     * ----------------------------------------
     * me
     * ----------------------------------------
     * Return the current authenticated user details.
     */
    public function me(): void
    {
        if (!Auth::isLoggedIn()) {
            Response::json(['user' => null]);
        }

        Response::json(['user' => Auth::user()]);
    }

    /**
     * ----------------------------------------
     * login
     * ----------------------------------------
     * Authenticate an admin user and start a session.
     */
    public function login(): void
    {
        // CSRF verification is required for all state-changing endpoints
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            Response::error('Username and password are required', 400);
        }

        $db = \App\Core\Database::getInstance()->getConnection();
        $userModel = new \App\Models\UserModel($db);
        $rateLimitModel = new \App\Models\RateLimitModel($db);

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $endpoint = 'admin/login';

        // Check rate limit: max 5 attempts per 10 minutes
        if ($rateLimitModel->getRecentAttempts($ip, $endpoint, 10) >= 5) {
            Response::error('Too many failed login attempts. Please try again in 10 minutes.', 429);
        }

        $user = $userModel->getByUsername($username);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Admin/Staff login must have the correct role
            if (!in_array($user['role'], ['admin', 'staff'])) {
                Response::error('Access denied. Admin privileges required.', 403);
            }

            // Successful login
            Auth::login((int)$user['user_id'], $user['role']);
            
            // Update last login timestamp
            $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE user_id = :id");
            $stmt->execute(['id' => $user['user_id']]);

            Response::json([
                'user' => [
                    'id' => (int)$user['user_id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ],
                'message' => 'Login successful'
            ]);
        }

        // Failed login
        $rateLimitModel->logAttempt($ip, $endpoint);
        Response::error('Invalid username or password', 401);
    }

    /**
     * ----------------------------------------
     * customerLogin
     * ----------------------------------------
     * Authenticate a customer and start a session.
     */
    public function customerLogin(): void
    {
        // CSRF verification is required for all state-changing endpoints
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            Response::error('Username and password are required', 400);
        }

        $db = \App\Core\Database::getInstance()->getConnection();
        $userModel = new \App\Models\UserModel($db);
        $rateLimitModel = new \App\Models\RateLimitModel($db);

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $endpoint = 'login';

        // Check rate limit
        if ($rateLimitModel->getRecentAttempts($ip, $endpoint, 10) >= 10) {
            Response::error('Too many attempts. Please try again later.', 429);
        }

        $user = $userModel->getByUsername($username);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Successful customer login
            Auth::login((int)$user['user_id'], $user['role']);
            
            $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE user_id = :id");
            $stmt->execute(['id' => $user['user_id']]);

            Response::json([
                'user' => [
                    'id' => (int)$user['user_id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ],
                'message' => 'Login successful'
            ]);
        }

        $rateLimitModel->logAttempt($ip, $endpoint);
        Response::error('Invalid username or password', 401);
    }

    /**
     * ----------------------------------------
     * logout
     * ----------------------------------------
     * End the current user session.
     */
    public function logout(): void
    {
        // CSRF verification is required for all state-changing endpoints
        Csrf::verifyHeader();
        
        Auth::logout();
        Response::json(['message' => 'Logged out successfully']);
    }
}
