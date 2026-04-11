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
}
