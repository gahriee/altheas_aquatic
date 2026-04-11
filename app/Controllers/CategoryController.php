<?php declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Response;
use App\Core\Database;
use App\Models\CategoryModel;

class CategoryController
{
    /**
     * ----------------------------------------
     * index
     * ----------------------------------------
     * Fetch and return all categories.
     */
    public function index(): void
    {
        Auth::requireLogin();
        
        $db = Database::getInstance()->getConnection();
        $model = new CategoryModel($db);
        
        $categories = $model->fetchAll();
        Response::json($categories);
    }
}
