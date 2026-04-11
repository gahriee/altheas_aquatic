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

    /**
     * ----------------------------------------
     * logAttempt
     * ----------------------------------------
     * Log a failed attempt for an IP and endpoint.
     *
     * @param string $ip The IP address of the requester.
     * @param string $endpoint The endpoint being Accessed.
     */
    public function logAttempt(string $ip, string $endpoint): void
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO rate_limit_log (ip_address, endpoint, attempted_at)
                VALUES (:ip, :endpoint, NOW())
            ");
            $stmt->execute(['ip' => $ip, 'endpoint' => $endpoint]);
        } catch (\PDOException $e) {
            // Silently fail if logging fails
        }
    }

    /**
     * ----------------------------------------
     * getRecentAttempts
     * ----------------------------------------
     * Count the number of attempts for an IP and endpoint within a time window.
     *
     * @param string $ip The IP address of the requester.
     * @param string $endpoint The endpoint being accessed.
     * @param int $minutes The time window in minutes.
     * @return int The number of attempts.
     */
    public function getRecentAttempts(string $ip, string $endpoint, int $minutes = 10): int
    {
        try {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) FROM rate_limit_log
                WHERE ip_address = :ip
                AND endpoint = :endpoint
                AND attempted_at > DATE_SUB(NOW(), INTERVAL :minutes MINUTE)
            ");
            $stmt->execute([
                'ip' => $ip,
                'endpoint' => $endpoint,
                'minutes' => $minutes
            ]);
            return (int) $stmt->fetchColumn();
        } catch (\PDOException $e) {
            return 0;
        }
    }
}
