<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;

class StorefrontController
{
    /**
     * ----------------------------------------
     * list
     * ----------------------------------------
     * Return a list of active products as JSON.
     */
    public function list(): void
    {
        // Simple mock for now, will be implemented with ProductModel in Priority 5
        Response::json(['products' => []]);
    }

    /**
     * ----------------------------------------
     * detail
     * ----------------------------------------
     * Return details for a specific product as JSON.
     */
    public function detail(int $id): void
    {
        Response::error('Not Implemented', 501);
    }

    /**
     * ----------------------------------------
     * categories
     * ----------------------------------------
     * Return all active categories as JSON.
     */
    public function categories(): void
    {
        // Simple mock for now, will be implemented with CategoryModel in Priority 5
        Response::json(['categories' => []]);
    }
}
