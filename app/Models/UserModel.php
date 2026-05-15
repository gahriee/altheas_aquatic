<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class UserModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the UserModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * getByEmail
     * ----------------------------------------
     * Fetch a user record by their email address.
     *
     * @param string $email The email to search for.
     * @return array|null The user record or null if not found.
     */
    public function getByEmail(string $email): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (\PDOException $e) {
            error_log("UserModel::getByEmail failed: " . $e->getMessage());
            return null;
        }
    }
    /**
     * ----------------------------------------
     * fetchAdmins
     * ----------------------------------------
     * Fetch all users where role_label IN ('admin', 'staff'), ordered by registered DESC.
     * 
     * @return array List of admin/staff users.
     */
    public function fetchAdmins(): array
    {
        try {
            $stmt = $this->db->query("
                SELECT id, email, username, role_label, roles_mask, status, verified, registered, last_login 
                FROM users 
                WHERE role_label IN ('admin', 'staff') 
                ORDER BY registered DESC
            ");
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            error_log("UserModel::fetchAdmins failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * ----------------------------------------
     * fetchAllWithCounts
     * ----------------------------------------
     * Fetch users by type (admin_staff vs customer) and return role counts.
     * 
     * @param string $type The filter type ('admin_staff', 'customer', or 'all').
     * @return array Array containing 'users' and 'counts'.
     */
    public function fetchAllWithCounts(string $type = 'all', int $excludeId = 0): array
    {
        try {
            // Fetch users based on type
            $whereParts = [];
            if ($type === 'admin_staff') {
                $whereParts[] = "role_label IN ('admin', 'staff')";
            } elseif ($type === 'customer') {
                $whereParts[] = "(role_label = 'customer' OR role_label IS NULL)";
            }

            if ($excludeId > 0) {
                $whereParts[] = "id != :exclude_id";
            }

            $where = !empty($whereParts) ? " WHERE " . implode(" AND ", $whereParts) : "";

            $stmt = $this->db->prepare("
                SELECT id, email, username, role_label, roles_mask, status, verified, registered, last_login 
                FROM users 
                $where
                ORDER BY registered DESC
            ");
            
            if ($excludeId > 0) {
                $stmt->execute(['exclude_id' => $excludeId]);
            } else {
                $stmt->execute();
            }
            $users = $stmt->fetchAll();

            // Fetch counts
            $counts = [
                'admin_staff' => 0,
                'customer' => 0,
                'all' => 0
            ];

            $countWhere = $excludeId > 0 ? " WHERE id != :exclude_id " : "";
            $countStmt = $this->db->prepare("
                SELECT role_label, COUNT(*) as count 
                FROM users 
                $countWhere
                GROUP BY role_label
            ");
            
            if ($excludeId > 0) {
                $countStmt->execute(['exclude_id' => $excludeId]);
            } else {
                $countStmt->execute();
            }
            $rows = $countStmt->fetchAll();

            foreach ($rows as $row) {
                if (in_array($row['role_label'], ['admin', 'staff'])) {
                    $counts['admin_staff'] += (int) $row['count'];
                } else {
                    $counts['customer'] += (int) $row['count'];
                }
                $counts['all'] += (int) $row['count'];
            }

            return [
                'users' => $users,
                'counts' => $counts
            ];
        } catch (\PDOException $e) {
            error_log("UserModel::fetchAllWithCounts failed: " . $e->getMessage());
            return ['users' => [], 'counts' => ['admin_staff' => 0, 'customer' => 0, 'all' => 0]];
        }
    }

    /**
     * ----------------------------------------
     * getById
     * ----------------------------------------
     * Fetch a single user by ID, excluding the password field.
     * 
     * @param int $id The user ID.
     * @return array|null The user record or null if not found.
     */
    public function getById(int $id): ?array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, email, username, role_label, roles_mask, status, verified, registered, last_login 
                FROM users 
                WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (\PDOException $e) {
            error_log("UserModel::getById failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * ----------------------------------------
     * updateRoleLabel
     * ----------------------------------------
     * Update the role_label field for a given user ID.
     * 
     * @param int $id The user ID.
     * @param string $roleLabel The new role label (admin or staff).
     * @return bool True on success.
     */
    public function updateRoleLabel(int $id, string $roleLabel): bool
    {
        if (!in_array($roleLabel, ['admin', 'staff', 'customer'])) {
            return false;
        }

        try {
            $stmt = $this->db->prepare("UPDATE users SET role_label = :role_label WHERE id = :id");
            return $stmt->execute([
                'role_label' => $roleLabel,
                'id' => $id
            ]);
        } catch (\PDOException $e) {
            error_log("UserModel::updateRoleLabel failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * ----------------------------------------
     * countAdmins
     * ----------------------------------------
     * Count users where role_label = 'admin'.
     * 
     * @return int Number of admin users.
     */
    public function countAdmins(): int
    {
        try {
            $stmt = $this->db->query("SELECT COUNT(*) FROM users WHERE role_label = 'admin'");
            return (int) $stmt->fetchColumn();
        } catch (\PDOException $e) {
            error_log("UserModel::countAdmins failed: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * ----------------------------------------
     * deactivate
     * ----------------------------------------
     * Set a user's status to BANNED (2), effectively soft-disabling the account.
     *
     * @param int $id The user ID to deactivate.
     * @return bool True on success.
     */
    public function deactivate(int $id): bool
    {
        try {
            $stmt = $this->db->prepare("UPDATE users SET status = 2 WHERE id = :id");
            return $stmt->execute(['id' => $id]);
        } catch (\PDOException $e) {
            error_log("UserModel::deactivate failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * ----------------------------------------
     * reactivate
     * ----------------------------------------
     * Restore a deactivated user's status back to NORMAL (0).
     *
     * @param int $id The user ID to reactivate.
     * @return bool True on success.
     */
    public function reactivate(int $id): bool
    {
        try {
            $stmt = $this->db->prepare("UPDATE users SET status = 0 WHERE id = :id");
            return $stmt->execute(['id' => $id]);
        } catch (\PDOException $e) {
            error_log("UserModel::reactivate failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * ----------------------------------------
     * getProfile
     * ----------------------------------------
     * Fetch the user_profiles row for the given user_id.
     * Also join users.email so the response includes the customer's email.
     * If no profile row exists, return a default array with just the user's email.
     * 
     * @param int $userId The user ID.
     * @return array|null The user profile record.
     */
    public function getProfile(int $userId): ?array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, u.email 
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.id = :user_id
            ");
            $stmt->execute(['user_id' => $userId]);
            $row = $stmt->fetch();
            
            if (!$row) {
                return null;
            }

            // If profile_id is null, it means no profile exists yet, but we have the email from the LEFT JOIN
            if ($row['profile_id'] === null) {
                return [
                    'user_id' => $userId,
                    'email' => $row['email'],
                    'display_name' => '',
                    'phone' => '',
                    'region' => '',
                    'region_code' => '',
                    'province' => '',
                    'province_code' => '',
                    'city' => '',
                    'city_code' => '',
                    'barangay' => '',
                    'barangay_code' => '',
                    'street' => ''
                ];
            }

            return $row;
        } catch (\PDOException $e) {
            error_log("UserModel::getProfile failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * ----------------------------------------
     * upsertProfile
     * ----------------------------------------
     * Insert or update the profile row.
     * 
     * @param int $userId The user ID.
     * @param array $data The profile data.
     * @return bool True on success.
     */
    public function upsertProfile(int $userId, array $data): bool
    {
        if ($userId <= 0) {
            return false;
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO user_profiles (
                    user_id, display_name, phone, region, region_code, province, province_code, 
                    city, city_code, barangay, barangay_code, street
                ) VALUES (
                    :user_id, :display_name, :phone, :region, :region_code, :province, :province_code,
                    :city, :city_code, :barangay, :barangay_code, :street
                )
                ON DUPLICATE KEY UPDATE
                    display_name = VALUES(display_name),
                    phone = VALUES(phone),
                    region = VALUES(region),
                    region_code = VALUES(region_code),
                    province = VALUES(province),
                    province_code = VALUES(province_code),
                    city = VALUES(city),
                    city_code = VALUES(city_code),
                    barangay = VALUES(barangay),
                    barangay_code = VALUES(barangay_code),
                    street = VALUES(street)
            ");

            return $stmt->execute([
                'user_id' => $userId,
                'display_name' => $data['display_name'] ?? null,
                'phone' => $data['phone'] ?? null,
                'region' => $data['region'] ?? null,
                'region_code' => $data['region_code'] ?? null,
                'province' => $data['province'] ?? null,
                'province_code' => $data['province_code'] ?? null,
                'city' => $data['city'] ?? null,
                'city_code' => $data['city_code'] ?? null,
                'barangay' => $data['barangay'] ?? null,
                'barangay_code' => $data['barangay_code'] ?? null,
                'street' => $data['street'] ?? null
            ]);
        } catch (\PDOException $e) {
            error_log("UserModel::upsertProfile failed: " . $e->getMessage());
            return false;
        }
    }
}
