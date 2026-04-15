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
            error_log("UserModel::getByUsername failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * ----------------------------------------
     * create
     * ----------------------------------------
     * Insert a new user into the database.
     *
     * @param array $data The user data (username, password).
     * @return int The ID of the newly created user.
     * @throws \Exception if creation fails or username exists.
     */
    public function create(array $data): int
    {
        try {
            $sql = "INSERT INTO users (username, password_hash, role, created_at) 
                    VALUES (:username, :password_hash, :role, NOW())";
            
            $stmt = $this->db->prepare($sql);
            
            $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
            
            $stmt->execute([
                ':username' => $data['username'],
                ':password_hash' => $passwordHash,
                ':role' => $data['role'] ?? 'customer'
            ]);
            
            return (int)$this->db->lastInsertId();
        } catch (\PDOException $e) {
            // Rethrow and let controller handle error mapping (e.g., 409 Conflict)
            throw $e;
        }
    }
}
