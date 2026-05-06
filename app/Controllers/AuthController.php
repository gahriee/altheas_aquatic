<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;
use Delight\Auth\Auth as DelightAuth;
use Delight\Auth\InvalidPasswordException;
use Delight\Auth\InvalidEmailException;
use Delight\Auth\EmailNotVerifiedException;
use Delight\Auth\TooManyRequestsException;
use Delight\Auth\UserAlreadyExistsException;

class AuthController
{
    private DelightAuth $auth;

    public function __construct()
    {
        $this->auth = Auth::getInstance();
    }

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
        if (!$this->auth->isLoggedIn()) {
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
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required', 400);
        }

        try {
            $this->auth->login($email, $password);

            // Admin/Staff login must have the correct role
            if (!$this->auth->hasAnyRole(\Delight\Auth\Role::ADMIN, \Delight\Auth\Role::MANAGER)) {
                $this->auth->logOut();
                Response::error('Access denied. Admin privileges required.', 403);
            }

            Response::json([
                'user' => Auth::user(),
                'message' => 'Login successful'
            ]);
        } catch (InvalidEmailException | InvalidPasswordException $e) {
            Response::error('Invalid email or password', 401);
        } catch (EmailNotVerifiedException $e) {
            Response::error('Email not verified', 401);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        }
    }

    /**
     * ----------------------------------------
     * customerLogin
     * ----------------------------------------
     * Authenticate a customer and start a session.
     */
    public function customerLogin(): void
    {
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required', 400);
        }

        try {
            $this->auth->login($email, $password);

            Response::json([
                'user' => Auth::user(),
                'message' => 'Login successful'
            ]);
        } catch (InvalidEmailException | InvalidPasswordException $e) {
            Response::error('Invalid email or password', 401);
        } catch (EmailNotVerifiedException $e) {
            Response::error('Email not verified', 401);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        }
    }

    /**
     * ----------------------------------------
     * register
     * ----------------------------------------
     * Handle customer account registration.
     */
    public function register(): void
    {
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required', 400);
        }

        try {
            // Register without username (null)
            $userId = $this->auth->register($email, $password, null);

            // For now, auto-verify and set role (since we don't have email flow yet)
            $db = \App\Core\Database::getInstance()->getConnection();
            $stmt = $db->prepare("UPDATE users SET verified = 1, roles_mask = :role_mask, role_label = 'customer' WHERE id = :id");
            $stmt->execute([
                'role_mask' => \Delight\Auth\Role::CONSUMER, // 16
                'id' => $userId
            ]);

            Response::json([
                'id' => $userId,
                'message' => 'Account created successfully. Please login to continue.'
            ], 201);
        } catch (UserAlreadyExistsException $e) {
            Response::error('An account with this email already exists', 409);
        } catch (InvalidEmailException $e) {
            Response::error('Invalid email address', 400);
        } catch (InvalidPasswordException $e) {
            Response::error('Invalid password', 400);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        } catch (\Exception $e) {
            Response::error('Failed to create account', 500);
        }
    }

    /**
     * ----------------------------------------
     * logout
     * ----------------------------------------
     * End the current user session.
     */
    public function logout(): void
    {
        Csrf::verifyHeader();
        $this->auth->logOut();
        Response::json(['message' => 'Logged out successfully']);
    }
}
