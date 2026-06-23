<?php declare(strict_types=1);

namespace App\Core;

use Bramus\Router\Router as BramusRouter;

class Router
{
    private BramusRouter $router;

    /**
     * ----------------------------------------
     * __construct
     * ----------------------------------------
     * Initialize the Bramus Router.
     */
    public function __construct()
    {
        $this->router = new BramusRouter();
    }

    /**
     * ----------------------------------------
     * dispatch
     * ----------------------------------------
     * Define all routes and run the router.
     */
    public function dispatch(): void
    {
        // Set up the base namespace for controllers
        $this->router->setNamespace('App\Controllers');

        // CORS Handle (Options) - already handled in index.php but good for safety
        $this->router->options('/.*', function () {
            http_response_code(204);
            exit;
        });

        // Development Frontend Redirect (for non-API routes when using php -S)
        if (defined('APP_ENV') && APP_ENV === 'development') {
            $this->router->get('/((?!api|image\.php|vendor).*)', function () {
                $path = $_SERVER['REQUEST_URI'];
                header("Location: http://localhost:5173" . $path);
                exit;
            });
        }

        // API group
        $this->router->mount('/api', function () {

            // CSRF
            $this->router->get('/csrf-token', 'AuthController@csrfToken');

            // Authentication (Public)
            $this->router->post('/login', 'AuthController@customerLogin');
            $this->router->post('/register', 'AuthController@register');
            $this->router->post('/admin/login', 'AuthController@login');
            $this->router->post('/forgot-password', 'AuthController@forgotPassword');
            $this->router->post('/verify-reset-token', 'AuthController@verifyResetToken');
            $this->router->post('/reset-password', 'AuthController@resetPassword');

            // Admin Group
            $this->router->mount('/admin', function () {
                $this->router->post('/logout', 'AuthController@logout');
                $this->router->get('/me', 'AuthController@me');
                $this->router->post('/profile/change-password', 'AuthController@changePassword');
                $this->router->get('/dashboard', 'DashboardController@index');

                // Inventory
                $this->router->get('/inventory', 'InventoryController@index');
                $this->router->post('/inventory', 'InventoryController@store');
                $this->router->get('/inventory/trash', 'InventoryController@trash');
                $this->router->get('/inventory/low-stock', 'InventoryController@lowStock');
                $this->router->get('/inventory/(\d+)', 'InventoryController@show');
                $this->router->post('/inventory/(\d+)', 'InventoryController@update');
                $this->router->post('/inventory/(\d+)/deactivate', 'InventoryController@deactivate');
                $this->router->post('/inventory/(\d+)/restore', 'InventoryController@restore');
                $this->router->delete('/inventory/(\d+)', 'InventoryController@destroy');

                // Categories
                $this->router->get('/categories', 'CategoryController@index');
                $this->router->post('/categories', 'CategoryController@store');
                $this->router->post('/categories/(\d+)/delete', 'CategoryController@delete');

                // Suppliers
                $this->router->get('/suppliers', 'SupplierController@index');
                $this->router->post('/suppliers', 'SupplierController@store');
                $this->router->post('/suppliers/(\d+)', 'SupplierController@update');
                $this->router->get('/suppliers/(\d+)/deliveries', 'SupplierController@deliveries');
                $this->router->post('/suppliers/delivery', 'SupplierController@recordDelivery');

                // Orders
                $this->router->get('/orders', 'OrderController@index');
                $this->router->get('/orders/(\d+)', 'OrderController@show');
                $this->router->post('/orders/(\d+)/status', 'OrderController@updateStatus');
                $this->router->post('/orders/cleanup-expired', 'OrderController@cleanupExpired');

                // Reports
                $this->router->get('/reports/sales', 'ReportController@sales');
                $this->router->get('/reports/inventory', 'ReportController@inventory');
                $this->router->get('/reports/suppliers', 'ReportController@suppliers');
                $this->router->get('/reports/export', 'ReportController@exportCsv');

                // Notifications
                $this->router->get('/notifications', 'NotificationController@index');
                $this->router->get('/notifications/history', 'NotificationController@history');
                $this->router->get('/notifications/unread-count', 'NotificationController@unreadCount');
                $this->router->post('/notifications/(\d+)/read', 'NotificationController@markRead');
                $this->router->post('/notifications/read-all', 'NotificationController@markAllRead');
                $this->router->post('/notifications/delete-read', 'NotificationController@deleteRead');

                // Users
                $this->router->get('/users', 'UserController@index');
                $this->router->post('/users', 'UserController@store');
                $this->router->post('/users/(\d+)', 'UserController@update');
                $this->router->post('/users/(\d+)/deactivate', 'UserController@deactivate');
                $this->router->post('/users/(\d+)/reactivate', 'UserController@reactivate');

                // Audit Logs
                $this->router->get('/audit-logs', 'AuditLogController@index');
                $this->router->get('/audit-logs/(\d+)', 'AuditLogController@show');
            });

            // Storefront (Public)
            $this->router->get('/storefront/list', 'StorefrontController@list');
            $this->router->get('/storefront/detail/(\d+)', 'StorefrontController@detail');
            $this->router->get('/storefront/categories', 'StorefrontController@categories');

            // Cart
            $this->router->get('/cart', 'CartController@index');
            $this->router->post('/cart/add', 'CartController@add');
            $this->router->post('/cart/update', 'CartController@update');
            $this->router->post('/cart/remove', 'CartController@remove');
            $this->router->post('/cart/clear', 'CartController@clear');

            // Checkout
            $this->router->post('/checkout', 'PaymentController@createIntent');
            $this->router->post('/checkout/cod', 'OrderController@submitCod');
            $this->router->get('/order-confirmation/(\d+)', 'OrderController@confirmation');
            $this->router->get('/orders/(\d+)/confirmation', 'OrderController@confirmation');

            // My Orders (Customer)
            $this->router->get('/my-orders', 'OrderController@myOrders');
            $this->router->get('/my-orders/(\d+)', 'OrderController@myOrderDetail');

            // Profile (Customer)
            $this->router->get('/profile', 'ProfileController@show');
            $this->router->post('/profile', 'ProfileController@update');

            // Payments
            $this->router->post('/payments/create-intent', 'PaymentController@createIntent');
            $this->router->get('/payments/status/([^/]+)', 'PaymentController@checkStatus');
            $this->router->post('/webhooks/paymongo', 'PaymentController@handleWebhook');
        });

        // 404 Fallback
        $this->router->set404(function () {
            Response::error('Not Found', 404);
        });

        // Run the router
        $this->router->run();
    }
}
