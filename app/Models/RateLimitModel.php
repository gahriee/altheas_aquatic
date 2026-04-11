<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class RateLimitModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the RateLimitModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
