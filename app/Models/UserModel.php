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
}
