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
     * getByUsername
     * ----------------------------------------
     * Fetch a user record by their username.
     *
     * @param string $username The username to search for.
     * @return array|null The user record or null if not found.
     */
    public function getByUsername(string $username): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (\PDOException $e) {
            return null;
        }
    }
}
