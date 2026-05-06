<?php declare(strict_types=1);

namespace App\Core;

use Pusher\Pusher;

class PusherService
{
    private static ?Pusher $instance = null;

    /**
     * ----------------------------------------
     * getInstance
     * ----------------------------------------
     * Returns a singleton instance of the Pusher client.
     */
    public static function getInstance(): Pusher
    {
        if (self::$instance === null) {
            $options = [
                'cluster' => PUSHER_APP_CLUSTER,
                'useTLS' => true
            ];

            self::$instance = new Pusher(
                PUSHER_APP_KEY,
                PUSHER_APP_SECRET,
                PUSHER_APP_ID,
                $options
            );
        }

        return self::$instance;
    }

    /**
     * ----------------------------------------
     * broadcast
     * ----------------------------------------
     * Broadcasts an event to a specific channel.
     */
    public static function broadcast(string $channel, string $event, array $data): bool
    {
        try {
            $pusher = self::getInstance();
            return (bool)$pusher->trigger($channel, $event, $data);
        } catch (\Exception $e) {
            error_log("Pusher Error: " . $e->getMessage());
            return false;
        }
    }
}
