<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;

class CartController
{
    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Return the current cart content as JSON.
     */
    public function index(): void
    {
        // Simple mock for now, will be implemented with Core\Cart in Priority 5
        Response::json([
            'items' => [],
            'total' => 0,
            'count' => 0
        ]);
    }

    public function add(): void { Response::error('Not Implemented', 501); }
    public function update(): void { Response::error('Not Implemented', 501); }
    public function remove(): void { Response::error('Not Implemented', 501); }
    public function clear(): void { Response::error('Not Implemented', 501); }
}
