<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Csrf;
use App\Core\Database;
use App\Core\Response;
use App\Models\UserModel;
use Delight\Auth\Role;
use Delight\Auth\InvalidEmailException;
use Delight\Auth\InvalidPasswordException;
use Delight\Auth\UserAlreadyExistsException;
use Delight\Auth\UnknownIdException;

class UserController
{
    private \Delight\Auth\Auth $auth;
    private UserModel $userModel;
    private \PDO $db;

    public function __construct()
    {
        $this->auth = Auth::getInstance();
        $this->db = Database::getInstance()->getConnection();
        $this->userModel = new UserModel($this->db);
    }

    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * GET /api/admin/users?type=all|admin_staff|customer
     */
    public function index(): void
    {
        Auth::requireLogin();

        if (!$this->auth->hasRole(Role::ADMIN)) {
            Response::error('Admin role required', 403);
        }

        $type = $_GET['type'] ?? 'all';
        $currentUserId = $this->auth->getUserId();
        $data = $this->userModel->fetchAllWithCounts($type, $currentUserId);
        
        Response::json($data);
    }

    /**
     * ----------------------------------------
     * store
     * ----------------------------------------
     * POST /api/admin/users
     */
    public function store(): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        if (!$this->auth->hasRole(Role::ADMIN)) {
            Response::error('Admin role required', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? '';

        if (empty($email) || empty($password) || empty($role)) {
            Response::error('Email, password, and role are required', 400);
        }

        if (!in_array($role, ['admin', 'staff'])) {
            Response::error('Invalid role', 400);
        }

        try {
            $userId = $this->auth->admin()->createUser($email, $password);

            // Set verified = 1 and role_label
            $stmt = $this->db->prepare("UPDATE users SET verified = 1, role_label = :role_label WHERE id = :id");
            $stmt->execute(['role_label' => $role, 'id' => $userId]);

            // Add role mask
            $roleMask = $role === 'admin' ? Role::ADMIN : Role::MANAGER;
            $this->auth->admin()->addRoleForUserById($userId, $roleMask);

            Response::json(['message' => 'User created successfully', 'id' => $userId], 201);
        } catch (InvalidEmailException $e) {
            Response::error('Invalid email address', 400);
        } catch (InvalidPasswordException $e) {
            Response::error('Invalid password', 400);
        } catch (UserAlreadyExistsException $e) {
            Response::error('User already exists', 409);
        } catch (\Exception $e) {
            Response::error('Failed to create user', 500);
        }
    }

    /**
     * ----------------------------------------
     * update
     * ----------------------------------------
     * POST /api/admin/users/{id}
     */
    public function update(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        if (!$this->auth->hasRole(Role::ADMIN)) {
            Response::error('Admin role required', 403);
        }

        if ($id === $this->auth->getUserId()) {
            Response::error('Cannot modify your own account', 400);
        }

        $user = $this->userModel->getById($id);
        if (!$user) {
            Response::error('User not found', 404);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $role = $input['role'] ?? null;
        $password = $input['password'] ?? null;

        try {
            if ($role && in_array($role, ['admin', 'staff']) && $role !== $user['role_label']) {
                // Remove old role
                $oldRoleMask = $user['role_label'] === 'admin' ? Role::ADMIN : Role::MANAGER;
                $this->auth->admin()->removeRoleForUserById($id, $oldRoleMask);

                // Add new role
                $newRoleMask = $role === 'admin' ? Role::ADMIN : Role::MANAGER;
                $this->auth->admin()->addRoleForUserById($id, $newRoleMask);

                // Update label
                $this->userModel->updateRoleLabel($id, $role);
            }

            if (!empty($password)) {
                $this->auth->admin()->changePasswordForUserById($id, $password);
            }

            Response::json(['message' => 'User updated successfully']);
        } catch (UnknownIdException $e) {
            Response::error('User not found', 404);
        } catch (InvalidPasswordException $e) {
            Response::error('Invalid password', 400);
        } catch (\Exception $e) {
            Response::error('Failed to update user', 500);
        }
    }

    /**
     * ----------------------------------------
     * destroy
     * ----------------------------------------
     * POST /api/admin/users/{id}/delete
     */
    public function destroy(int $id): void
    {
        Auth::requireLogin();
        Csrf::verifyHeader();

        if (!$this->auth->hasRole(Role::ADMIN)) {
            Response::error('Admin role required', 403);
        }

        if ($id === $this->auth->getUserId()) {
            Response::error('Cannot delete your own account', 400);
        }

        $user = $this->userModel->getById($id);
        if (!$user) {
            Response::error('User not found', 404);
        }

        if ($user['role_label'] === 'admin') {
            $adminCount = $this->userModel->countAdmins();
            if ($adminCount <= 1) {
                Response::error('Cannot delete the last admin account', 400);
            }
        }

        try {
            $this->auth->admin()->deleteUserById($id);
            Response::json(['message' => 'User deleted successfully']);
        } catch (UnknownIdException $e) {
            Response::error('User not found', 404);
        } catch (\Exception $e) {
            Response::error('Failed to delete user', 500);
        }
    }
}
