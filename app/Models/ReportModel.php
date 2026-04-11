<?php declare(strict_types=1);

namespace App\Models;

use PDO;

class ReportModel
{
    private PDO $db;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the ReportModel with a database connection.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
