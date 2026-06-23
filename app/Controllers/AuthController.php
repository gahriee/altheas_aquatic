<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Response;
use App\Core\AuditLogger;
use Delight\Auth\Auth as DelightAuth;
use Delight\Auth\InvalidPasswordException;
use Delight\Auth\InvalidEmailException;
use Delight\Auth\EmailNotVerifiedException;
use Delight\Auth\TooManyRequestsException;
use Delight\Auth\UserAlreadyExistsException;
use Delight\Auth\NotLoggedInException;
use Delight\Auth\InvalidSelectorTokenPairException;
use Delight\Auth\TokenExpiredException;
use Delight\Auth\ResetDisabledException;

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
            Response::error('Please verify your email address before logging in. Check your inbox for the verification link.', 401);
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
        try {
            // Register without username (null) and send verification email
            $userId = $this->auth->register($email, $password, null, function ($selector, $token) use ($email) {
                $url = FRONTEND_URL . '/verify-email?selector=' . \urlencode($selector) . '&token=' . \urlencode($token);
                
                $subject = "Verify your email address";
                $message = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
                        <h2 style='color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;'>Althea's Aquatic</h2>
                        <p>Welcome! Click the link below to verify your email address:</p>
                        <p><a href='{$url}' style='display: inline-block; padding: 10px 20px; background-color: #0d9488; color: #ffffff; text-decoration: none; border-radius: 5px;'>Verify Email</a></p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p><a href='{$url}'>{$url}</a></p>
                    </div>
                ";
                
                \App\Core\Mailer::send($email, $subject, $message);
            });

            // Set role to customer (verified stays 0 until they click the link)
            $db = \App\Core\Database::getInstance()->getConnection();
            $stmt = $db->prepare("UPDATE users SET roles_mask = :role_mask, role_label = 'customer' WHERE id = :id");
            $stmt->execute([
                'role_mask' => \Delight\Auth\Role::CONSUMER, // 16
                'id' => $userId
            ]);

            // Automatically create a user_profiles row
            $profileStmt = $db->prepare("INSERT INTO user_profiles (user_id) VALUES (:user_id)");
            $profileStmt->execute(['user_id' => $userId]);

            Response::json([
                'id' => $userId,
                'message' => 'Account created successfully. Please check your email to verify your account before logging in.'
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
     * verifyEmail
     * ----------------------------------------
     * Verify a user's email address using selector and token.
     */
    public function verifyEmail(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $selector = $input['selector'] ?? '';
        $token = $input['token'] ?? '';

        if (empty($selector) || empty($token)) {
            Response::error('Invalid verification link', 400);
        }

        try {
            $this->auth->confirmEmail($selector, $token);
            Response::json(['message' => 'Email verified successfully']);
        } catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
            Response::error('Invalid or expired verification link', 400);
        } catch (\Delight\Auth\TokenExpiredException $e) {
            Response::error('Verification link has expired', 400);
        } catch (\Delight\Auth\UserAlreadyExistsException $e) {
            Response::error('Email already verified', 400);
        } catch (\Delight\Auth\TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        } catch (\Exception $e) {
            Response::error('Failed to verify email', 500);
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

    /**
     * ----------------------------------------
     * changePassword
     * ----------------------------------------
     * Change password for the authenticated user.
     */
    public function changePassword(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $input['current_password'] ?? '';
        $newPassword = $input['new_password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';

        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            Response::error('All fields are required', 400);
        }

        if ($newPassword !== $confirmPassword) {
            Response::error('New password and confirm password do not match', 400);
        }

        if (strlen($newPassword) < 8) {
            Response::error('New password must be at least 8 characters long', 400);
        }

        try {
            $this->auth->changePassword($currentPassword, $newPassword);
            AuditLogger::log('update', 'user', Auth::userId(), "Changed password");
            Response::json(['message' => 'Password changed successfully']);
        } catch (NotLoggedInException $e) {
            Response::unauthorized();
        } catch (InvalidPasswordException $e) {
            Response::error('Incorrect current password', 400);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        } catch (\Exception $e) {
            Response::error('Failed to change password', 500);
        }
    }

    /**
     * ----------------------------------------
     * forgotPassword
     * ----------------------------------------
     * Send a password reset link to the user's email.
     */
    public function forgotPassword(): void
    {
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        if (empty($email)) {
            Response::error('Email is required', 400);
        }

        try {
            $this->auth->forgotPassword($email, function ($selector, $token) use ($email) {
                $url = FRONTEND_URL . '/reset-password?selector=' . \urlencode($selector) . '&token=' . \urlencode($token);
                
                $subject = "Password Reset Request";
                $message = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
                        <h2 style='color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;'>Althea's Aquatic</h2>
                        <p>You requested a password reset. Click the link below to set a new password:</p>
                        <p><a href='{$url}' style='display: inline-block; padding: 10px 20px; background-color: #0d9488; color: #ffffff; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p><a href='{$url}'>{$url}</a></p>
                        <p style='margin-top: 30px; font-size: 0.9em; color: #64748b;'>If you did not request this, please ignore this email.</p>
                    </div>
                ";
                
                \App\Core\Mailer::send($email, $subject, $message);
            });
        } catch (TooManyRequestsException $e) {
            @error_log("ForgotPassword failed: Too many requests for ({$email})");
            Response::error('Too many requests. Please try again later.', 429);
        } catch (InvalidEmailException $e) {
            @error_log("ForgotPassword failed: Invalid email ({$email})");
            // Keep silent to prevent email enumeration
        } catch (\Exception $e) {
            @error_log("ForgotPassword error for ({$email}): " . $e->getMessage());
            // Keep silent to not expose internal state
        }

        // Always return success message for other cases
        Response::json(['message' => 'If an account with that email exists, a reset link has been sent.']);
    }

    /**
     * ----------------------------------------
     * verifyResetToken
     * ----------------------------------------
     * Verify a password reset selector and token pair.
     */
    public function verifyResetToken(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $selector = $input['selector'] ?? '';
        $token = $input['token'] ?? '';

        if (empty($selector) || empty($token)) {
            Response::error('Invalid reset link', 400);
        }

        try {
            $this->auth->canResetPasswordOrThrow($selector, $token);
            Response::json(['valid' => true]);
        } catch (InvalidSelectorTokenPairException | TokenExpiredException | ResetDisabledException $e) {
            Response::error('The reset link is invalid or has expired', 400);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        } catch (\Exception $e) {
            Response::error('Failed to verify reset link', 500);
        }
    }

    /**
     * ----------------------------------------
     * resetPassword
     * ----------------------------------------
     * Reset the user's password using the selector and token.
     */
    public function resetPassword(): void
    {
        Csrf::verifyHeader();

        $input = json_decode(file_get_contents('php://input'), true);
        $selector = $input['selector'] ?? '';
        $token = $input['token'] ?? '';
        $newPassword = $input['new_password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';

        if (empty($selector) || empty($token)) {
            Response::error('Invalid reset link', 400);
        }

        if (empty($newPassword) || empty($confirmPassword)) {
            Response::error('New password is required', 400);
        }

        if ($newPassword !== $confirmPassword) {
            Response::error('New password and confirm password do not match', 400);
        }

        if (strlen($newPassword) < 8) {
            Response::error('New password must be at least 8 characters long', 400);
        }

        try {
            $this->auth->resetPassword($selector, $token, $newPassword);
            Response::json(['message' => 'Password has been reset successfully. You may now log in.']);
        } catch (InvalidSelectorTokenPairException | TokenExpiredException | ResetDisabledException $e) {
            Response::error('The reset link is invalid or has expired', 400);
        } catch (InvalidPasswordException $e) {
            Response::error('Invalid password format', 400);
        } catch (TooManyRequestsException $e) {
            Response::error('Too many requests. Please try again later.', 429);
        } catch (\Exception $e) {
            Response::error('Failed to reset password', 500);
        }
    }
}
