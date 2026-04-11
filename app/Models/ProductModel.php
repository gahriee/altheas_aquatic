<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class ProductModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the ProductModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
