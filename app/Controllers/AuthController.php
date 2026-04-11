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
     * Stub for login implementation in Priority 2.
     */
    public function login(): void
    {
        Response::error('Not Implemented', 501);
    }

    /**
     * ----------------------------------------
     * logout
     * ----------------------------------------
     * Stub for logout implementation in Priority 2.
     */
    public function logout(): void
    {
        Response::error('Not Implemented', 501);
    }
}
