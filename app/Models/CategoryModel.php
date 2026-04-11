<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class CategoryModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the CategoryModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * ----------------------------------------
     * fetchAll
     * ----------------------------------------
     * Fetch all categories from the database.
     */
    public function fetchAll(): array
    {
        $sql = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
