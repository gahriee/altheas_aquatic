<?php declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?self $instance = null;
    private PDO $connection;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Private constructor to prevent direct instantiation.
     * Initializes the PDO connection using environment constants.
     */
    private function __construct()
    {
        $host = DB_HOST;
        $db   = DB_NAME;
        $user = DB_USER;
        $pass = DB_PASS;
        $port = defined('DB_PORT') ? DB_PORT : '3306';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        if (defined('DB_SSL') && DB_SSL) {
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
            $localCert = __DIR__ . '/../../cacert.pem';
            
            if (file_exists($localCert)) {
                // Use local downloaded cert (Windows XAMPP)
                $options[PDO::MYSQL_ATTR_SSL_CA] = $localCert;
            } else {
                // Use native OS cert bundle (Render/Linux)
                $options[PDO::MYSQL_ATTR_SSL_CA] = '/etc/ssl/certs/ca-certificates.crt';
            }
        }

        try {
            $this->connection = new PDO($dsn, $user, $pass, $options);
            $this->connection->exec("SET time_zone = '+08:00'");
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    /**
     * ----------------------------------------
     * getInstance
     * ----------------------------------------
     * Get the singleton instance of the Database class.
     *
     * @return self The singleton instance.
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * ----------------------------------------
     * getConnection
     * ----------------------------------------
     * Get the PDO connection instance.
     *
     * @return PDO The PDO connection.
     */
    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /**
     * ----------------------------------------
     * __clone
     * ----------------------------------------
     * Prevent cloning of the singleton instance.
     */
    private function __clone() {}

    /**
     * ----------------------------------------
     * __wakeup
     * ----------------------------------------
     * Prevent unserializing of the singleton instance.
     */
    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize a singleton.");
    }
}
