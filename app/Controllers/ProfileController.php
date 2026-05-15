<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Core\Csrf;
use App\Models\UserModel;
use App\Core\Database;
use App\Core\Auth;

class ProfileController
{
    private UserModel $userModel;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the controller with the UserModel.
     */
    public function __construct()
    {
        $db = Database::getInstance()->getConnection();
        $this->userModel = new UserModel($db);
    }

    /**
     * ----------------------------------------
     * show
     * ----------------------------------------
     * GET /api/profile
     * Returns the customer's profile.
     */
    public function show(): void
    {
        Auth::requireLogin();

        $userId = Auth::userId();
        $profile = $this->userModel->getProfile($userId);

        if (!$profile) {
            // Should not happen as getProfile returns a default structure if the user exists
            Response::error('User not found', 404);
            exit;
        }

        Response::json(['profile' => $profile]);
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * POST /api/profile
     * Updates the customer's profile.
     */
    public function update(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        $userId = Auth::userId();

        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        if (isset($input['display_name']) && trim($input['display_name']) === '') {
            Response::error('Display name cannot be empty if provided', 400);
            exit;
        }

        $success = $this->userModel->upsertProfile($userId, $input);

        if ($success) {
            Response::json(['message' => 'Profile updated successfully']);
        } else {
            Response::error('Failed to update profile', 500);
        }
    }
}
