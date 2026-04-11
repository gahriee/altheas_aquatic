<?php declare(strict_types=1);

namespace App\Core;

class Router
{
    /**
     * ----------------------------------------
     * dispatch
     * ----------------------------------------
     * Parse the request URL and method, match against routes, and call the controller.
     */
    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = trim($uri, '/');

        // Handle OPTIONS preflight for CORS
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        // All routes must start with api/
        if (!str_starts_with($uri, 'api')) {
            Response::error('Not Found', 404);
        }

        // Strip 'api/' from the start
        $path = preg_replace('/^api\/?/', '', $uri);
        $segments = explode('/', $path);
        
        // Basic routing table logic
        $this->resolve($method, $path, $segments);
    }

    /**
     * ----------------------------------------
     * resolve
     * ----------------------------------------
     * Resolve the route to a controller and method.
     *
     * @param string $method The HTTP method.
     * @param string $path The URL path after /api/.
     * @param array $segments The split URL segments.
     */
    private function resolve(string $method, string $path, array $segments): void
    {
        // CSRF
        if ($method === 'GET' && $path === 'csrf-token') {
            $this->call('AuthController', 'csrfToken');
        }

        // Authentication
        if ($method === 'POST' && $path === 'login') {
            $this->call('AuthController', 'customerLogin');
        }
        if ($method === 'POST' && $path === 'admin/login') {
            $this->call('AuthController', 'login');
        }
        if ($method === 'POST' && $path === 'admin/logout') {
            $this->call('AuthController', 'logout');
        }
        if ($method === 'GET' && $path === 'admin/me') {
            $this->call('AuthController', 'me');
        }

        // Admin Dashboard
        if ($method === 'GET' && $path === 'admin/dashboard') {
            $this->call('DashboardController', 'index');
        }

        // Inventory
        if ($method === 'GET' && $path === 'admin/inventory') {
            $this->call('InventoryController', 'index');
        }
        if ($method === 'POST' && $path === 'admin/inventory') {
            $this->call('InventoryController', 'store');
        }
        if ($method === 'GET' && preg_match('/^admin\/inventory\/(\d+)$/', $path, $matches)) {
            $this->call('InventoryController', 'show', [(int)$matches[1]]);
        }
        if ($method === 'POST' && preg_match('/^admin\/inventory\/(\d+)$/', $path, $matches)) {
            $this->call('InventoryController', 'update', [(int)$matches[1]]);
        }
        if ($method === 'POST' && preg_match('/^admin\/inventory\/(\d+)\/deactivate$/', $path, $matches)) {
            $this->call('InventoryController', 'deactivate', [(int)$matches[1]]);
        }

        // Categories
        if ($method === 'GET' && $path === 'admin/categories') {
            $this->call('CategoryController', 'index');
        }
        if ($method === 'POST' && $path === 'admin/categories') {
            $this->call('CategoryController', 'store');
        }
        if ($method === 'POST' && preg_match('/^admin\/categories\/(\d+)\/delete$/', $path, $matches)) {
            $this->call('CategoryController', 'delete', [(int)$matches[1]]);
        }

        // Suppliers
        if ($method === 'GET' && $path === 'admin/suppliers') {
            $this->call('SupplierController', 'index');
        }
        if ($method === 'POST' && $path === 'admin/suppliers') {
            $this->call('SupplierController', 'store');
        }
        if ($method === 'POST' && preg_match('/^admin\/suppliers\/(\d+)$/', $path, $matches)) {
            $this->call('SupplierController', 'update', [(int)$matches[1]]);
        }
        if ($method === 'GET' && preg_match('/^admin\/suppliers\/(\d+)\/deliveries$/', $path, $matches)) {
            $this->call('SupplierController', 'deliveries', [(int)$matches[1]]);
        }
        if ($method === 'POST' && $path === 'admin/suppliers/delivery') {
            $this->call('SupplierController', 'recordDelivery');
        }

        // Orders (Admin)
        if ($method === 'GET' && $path === 'admin/orders') {
            $this->call('OrderController', 'index');
        }
        if ($method === 'GET' && preg_match('/^admin\/orders\/(\d+)$/', $path, $matches)) {
            $this->call('OrderController', 'show', [(int)$matches[1]]);
        }
        if ($method === 'POST' && preg_match('/^admin\/orders\/(\d+)\/status$/', $path, $matches)) {
            $this->call('OrderController', 'updateStatus', [(int)$matches[1]]);
        }

        // Reports
        if ($method === 'GET' && $path === 'admin/reports/sales') {
            $this->call('ReportController', 'sales');
        }
        if ($method === 'GET' && $path === 'admin/reports/inventory') {
            $this->call('ReportController', 'inventory');
        }
        if ($method === 'GET' && $path === 'admin/reports/suppliers') {
            $this->call('ReportController', 'suppliers');
        }
        if ($method === 'GET' && $path === 'admin/reports/export') {
            $this->call('ReportController', 'exportCsv');
        }

        // Storefront (Public)
        if ($method === 'GET' && $path === 'products') {
            $this->call('StorefrontController', 'list');
        }
        if ($method === 'GET' && preg_match('/^products\/(\d+)$/', $path, $matches)) {
            $this->call('StorefrontController', 'detail', [(int)$matches[1]]);
        }
        if ($method === 'GET' && $path === 'categories') {
            $this->call('StorefrontController', 'categories');
        }

        // Cart
        if ($method === 'GET' && $path === 'cart') {
            $this->call('CartController', 'index');
        }
        if ($method === 'POST' && $path === 'cart/add') {
            $this->call('CartController', 'add');
        }
        if ($method === 'POST' && $path === 'cart/update') {
            $this->call('CartController', 'update');
        }
        if ($method === 'POST' && $path === 'cart/remove') {
            $this->call('CartController', 'remove');
        }
        if ($method === 'POST' && $path === 'cart/clear') {
            $this->call('CartController', 'clear');
        }

        // Checkout
        if ($method === 'POST' && $path === 'checkout') {
            $this->call('OrderController', 'submit');
        }
        if ($method === 'GET' && preg_match('/^order-confirmation\/(\d+)$/', $path, $matches)) {
            $this->call('OrderController', 'confirmation', [(int)$matches[1]]);
        }

        // Fallback
        Response::error('Not Found', 404);
    }

    /**
     * ----------------------------------------
     * call
     * ----------------------------------------
     * Instantiate the controller and call the method.
     *
     * @param string $controllerName The controller class name.
     * @param string $methodName The method name to call.
     * @param array $params The numeric parameters to pass to the method.
     */
    private function call(string $controllerName, string $methodName, array $params = []): void
    {
        $controllerClass = "App\\Controllers\\$controllerName";
        
        if (!class_exists($controllerClass)) {
            Response::error('Controller not found', 500);
        }

        $controller = new $controllerClass();
        
        if (!method_exists($controller, $methodName)) {
            Response::error('Endpoint not implemented', 500);
        }

        // Call method with unpacked parameters
        call_user_func_array([$controller, $methodName], $params);
        exit;
    }
}
