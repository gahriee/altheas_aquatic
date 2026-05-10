# Althea's Aquatic — E-Commerce Web Application

## Overview

Althea's Aquatic is a full-stack e-commerce web application purpose-built for selling aquatic species — fish, shrimp, snails, and aquatic plants. It provides a customer-facing storefront with a complete cart and checkout flow, and a secure admin dashboard that gives the owner full control over inventory, suppliers, sales, and business reports.

The platform is designed for a single-owner specialty shop, with a decoupled architecture: a PHP REST API backend and a React + Tailwind CSS frontend SPA.

**Business Type:** Single-owner specialty aquatics shop  
**Platform:** Web browser — desktop & mobile responsive  
**Architecture Pattern:** Decoupled — PHP REST API (backend) + React SPA (frontend)

---

## Architecture Diagram

*(Reference local architecture diagram: `docs/architecture/altheas-aquatic-architecture-diagram.png`)*

---

## System Architecture

Althea's Aquatic is structured as a decoupled application. The PHP backend exposes a JSON REST API under the `/api/` path prefix. The React frontend (built with Vite, styled with Tailwind CSS) is a Single Page Application that consumes this API. In production, both are served from the same origin — the built React output is placed inside `public/` and Apache/Nginx serves it via a catch-all `.htaccess` rule. During development, the React dev server (port 5173) and PHP backend (port 8000) run in parallel with CORS headers enabled.

### Key Architecture Decisions

**Decision #1 — Decoupled PHP API + React SPA**  
The PHP backend handles all business logic, database access, authentication, and file uploads — returning JSON responses exclusively. The mapping of requests to controllers is managed by the **`bramus/router`** library. The React frontend handles all rendering, routing (via React Router), and user interaction. This separation keeps concerns clean, makes the frontend independently testable, and allows future native app or third-party integrations to consume the same API.

**Decision #2 — Tailwind CSS (Utility-First Styling)**  
Tailwind CSS is used for all frontend styling. It is included via the CDN Play script during development and compiled via the Vite + Tailwind plugin for production. All styling strictly follows the **Aquatic Palette** defined in `frontend/tailwind.config.js`:
- **Teal**: `500` (Primary/Buttons), `600` (Hover/Footer), `100` (Light fills).
- **Mint**: `300` (CTA/Links/Focus), `100` (Badge bg).
- **Cream**: `300` (Headings on dark bg).
- **Sage**: `50` (Page bg), `100` (Borders/Dividers), `300` (Muted text), `500` (Body text).
- **Functional**: `coral-500` (Error), `emerald-500` (Success), `amber-500` (Warning).
No custom CSS file is maintained — all styles are composed from Tailwind utility classes directly in JSX.

**Decision #3 — Robust Library-Based Authentication**  
The application uses the **`delight-im/auth`** library for all authentication and authorization logic. This replaces manual session handling with a battle-tested implementation that uses PHP native sessions and HttpOnly/Secure/SameSite=Strict cookies. The system supports multi-role access (Admin/Staff/Customer) and registration requires a valid **Email** and **Password**.

**Decision #4 — Header-Based CSRF (Double Submit)**  
Because the frontend is a React SPA making fetch() calls, traditional hidden-form CSRF tokens are replaced with a header-based pattern. The React app fetches a CSRF token from `GET /api/csrf-token` on initialisation and stores it in memory. Every state-changing request (POST, PUT, DELETE) sends this token as an `X-CSRF-Token` request header. The PHP backend verifies the header value against the value stored in the session.

**Decision #5 — Professional Throttling (Brute-Force Protection)**  
Authentication endpoints (login, register, reset) are protected by **`delight-im/auth`**'s built-in throttling mechanism. This uses the `users_throttles` table to track and delay failed attempts per IP and per account, providing superior protection over manual rate-limiting logs.

**Decision #6 — Soft Delete & Trash Management**  
Products are never permanently removed from the database. Deactivating a product (`is_active = 0`) hides it from the storefront by splitting the `ProductModel` fetch logic into `fetchAll()` (Admin - returns everything) and `fetchAllActive()` (Storefront - returns only active). Deactivated products are managed via a "Trash" interface in the admin panel, where they can be reviewed and restored (`is_active = 1`). This maintains data integrity and complete sales history while keeping the active inventory clean.

**Decision #7 — Atomic Stock Deduction at Checkout**  
Stock deduction and order creation happen inside a single MySQL transaction with a SELECT FOR UPDATE lock. This eliminates race conditions and prevents overselling even under concurrent checkouts.

**Decision #8 — Automatic Delivery Stock Update**  
Recording a delivery in the Supplier module immediately adds the received quantity to the product's `stock_qty` in the same transaction. There is no manual restock step — the delivery record is the restock.

**Decision #9 — PayMongo GCash Integration**  
This platform uses **PayMongo** as the primary payment gateway for GCash. Checkout leverages the **PaymentIntent + PaymentMethod (PIPM)** workflow:
1. Backend creates a PaymentIntent and a PaymentMethod (GCash) server-side.
2. Backend attaches the PaymentMethod to the PaymentIntent to generate a secure PayMongo-hosted GCash redirect URL.
3. Order stock is deducted atomically *before* the payment intent is created to ensure availability.
4. The frontend redirects the user to the generated PayMongo URL; the user completes payment on GCash.
5. The frontend confirmation page polls `GET /api/payments/status/{id}` for real-time status updates.
6. Webhooks at `/api/webhooks/paymongo` handle asynchronous status updates (`payment.paid`, `payment.failed`).
7. **Security**: Webhook requests are verified using HMAC-SHA256 signatures with the `PAYMONGO_WEBHOOK_SECRET`. All API calls happen server-side using the Secret Key.

**Decision #10 — Persistent Database-Backed Cart**  
To prevent loss of user data between sessions and across devices, the cart is transitioned from purely session-based to a database-persisted model for authenticated customers.
- Guest users continue to use `$_SESSION['cart']`.
- Upon login, any items in the guest session are merged into the `cart_items` table.
- Logged-in customers' carts are stored in the `cart_items` table, allowing them to resume shopping on any device.

**Decision #11 — Real-time Admin Notifications via Pusher**
To provide immediate visibility into critical events (e.g. successful payments, payment failures, low stock warnings), the backend triggers a Pusher event (`pusher/pusher-php-server`). 
1. `PaymentController` (or another module) handles the domain logic, inserts a row into the `notifications` table, and broadcasts a `notification.created` event via Pusher to a private admin channel.
2. The React frontend (`AdminLayout`) subscribes to the channel via `pusher-js` to render the red bell icon dot and pop up the activity in real-time.

---

## Components

### Frontend — React SPA

| Layer | Technology | Reason |
| :--- | :--- | :--- |
| Framework | React 18 (Vite) | Component-based SPA; fast HMR dev experience |
| Routing | React Router v6 | Client-side routing; nested layouts for admin vs storefront |
| Styling | Tailwind CSS v3 | Utility-first; no custom CSS files to maintain |
| State | React Context API | Auth state, cart state — no Redux needed at this scale |
| HTTP | Fetch API (custom wrapper) | Native; no Axios dependency; centralized in `src/api/` |
| Build | Vite | Fast bundler; outputs to `public/dist/` for PHP to serve |

**Admin Pages:**
- 🔐 **Login Page** — Credential form, rate-limit feedback
- 🏠 **Admin Dashboard** — Summary cards (products, low-stock, today's sales, pending orders)
- 📦 **Inventory Management** — Product table, add/edit form, image upload, low-stock highlights, pagination
- 🏭 **Supplier Management** — Supplier directory, delivery recording, per-supplier history
- 🛒 **Sales / Orders** — Order table with status filter, order detail view, status update
- 📊 **Reports** — Date-range picker, sales/inventory/supplier summaries, CSV export

**Storefront Pages:**
- 🏠 **Home** — Hero banner, product grid, category filter tabs
- 🔐 **Sign Up Page** — Account creation form for customers (Email, Password)
- 📄 **Product Detail** — Image, description, price, quantity selector, add-to-cart (triggers login modal if guest)
- 🛒 **Cart & Checkout** — Cart summary, customer info form, stock validation, order submission
- 🔐 **Login Page** — Dedicated customer login page
- ✅ **Order Confirmation** — Order ID, itemised summary, thank-you message

### Backend — PHP REST API

| Layer | Technology | Reason |
| :--- | :--- | :--- |
| Language | PHP 8.x | Mature, widely hosted, strict typing support |
| Architecture | MVC (custom, API-mode) | Clean separation of routing, logic, and JSON output |
| Routing | Front controller (`index.php`) | All `/api/*` requests dispatched to controllers |
| Database | MySQL 8.x (InnoDB) | Relational integrity via FK constraints; ACID transactions |
| ORM / Query | PDO with prepared statements | SQL injection prevention; no ORM overhead |
| Auth | `delight-im/auth` | Battle-tested lifecycle (login, reset, throttling) |
| CSRF | Header-based (`X-CSRF-Token`) | Compatible with SPA fetch() calls |
| File Uploads | PHP `move_uploaded_file` | Images stored outside web root; served via `public/image.php` |
| Rate Limiting | `users_throttles` table | Built-in library-managed brute-force protection |

---

## Folder Structure

```
altheas-aquatic/
│
├── app/                                    # PHP backend (API layer)
│   ├── Controllers/                        # JSON response handlers — one per module
│   │   ├── AuthController.php              # Login, logout, CSRF token endpoint
│   │   ├── DashboardController.php         # Admin dashboard summary cards
│   │   ├── UserController.php              # Admin user management CRUD
│   │   ├── InventoryController.php         # Product CRUD, image upload, soft delete
│   │   ├── SupplierController.php          # Supplier CRUD, delivery recording
│   │   ├── OrderController.php             # Order list, detail, status update, checkout
│   │   ├── ReportController.php            # Sales, inventory, supplier reports, CSV export
│   │   ├── StorefrontController.php        # Public product list, product detail
│   │   └── CartController.php             # Session cart add, update, remove, get
│   │
│   ├── Models/                             # Database query logic — PDO only, returns arrays
│   │   ├── UserModel.php
│   │   ├── ProductModel.php
│   │   ├── CategoryModel.php
│   │   ├── SupplierModel.php
│   │   ├── OrderModel.php
│   │   ├── ReportModel.php
│   │   └── RateLimitModel.php
│   │
│   └── Core/                               # Shared services
│       ├── Database.php                    # PDO singleton
│       ├── Router.php                      # URL dispatcher — /api/* routing
│       ├── Auth.php                        # Session guard, requireLogin(), isLoggedIn()
│       ├── Csrf.php                        # Token generate, header verify
│       ├── Cart.php                        # Cart service — handles session-to-DB logic
│       ├── Uploader.php                    # MIME validation, rename, store outside web root
│       └── Response.php                    # JSON response helper (json, error, unauthorized)
│
├── frontend/                               # React SPA source
│   ├── src/
│   │   ├── api/                            # Fetch wrappers — one file per resource
│   │   │   ├── client.js                   # Base fetch wrapper (credentials, CSRF header, base URL)
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── suppliers.js
│   │   │   ├── orders.js
│   │   │   ├── cart.js
│   │   │   ├── reports.js
│   │   │   └── users.js
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx             # Admin session state — user, login(), logout()
│   │   │   └── CartContext.jsx             # Cart state — items, add(), remove(), update()
│   │   │
│   │   ├── components/                     # Shared UI components
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.jsx         # Sidebar + topbar shell for all admin pages
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── StatCard.jsx            # Summary card (dashboard)
│   │   │   ├── storefront/
│   │   │   │   ├── StorefrontLayout.jsx    # Navbar + footer shell for storefront pages
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ProductCard.jsx
│   │   │   ├── ui/                         # Atomic UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Label.jsx
│   │   │   └── shared/
│   │   │       ├── ProtectedRoute.jsx      # Redirects to /admin/login if not authenticated
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── ErrorMessage.jsx
│   │   │       └── ConfirmDialog.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── InventoryList.jsx
│   │   │   │   │   └── ProductForm.jsx
│   │   │   │   ├── suppliers/
│   │   │   │   │   ├── SupplierList.jsx
│   │   │   │   │   ├── SupplierForm.jsx
│   │   │   │   │   └── DeliveryForm.jsx
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrderList.jsx
│   │   │   │   │   └── OrderDetail.jsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── UserList.jsx
│   │   │   │   │   └── UserForm.jsx
│   │   │   │   └── reports/
│   │   │   │       └── Reports.jsx
│   │   │   └── storefront/
│   │   │       ├── Home.jsx
│   │   │       ├── ProductDetail.jsx
│   │   │       ├── Cart.jsx
│   │   │       ├── Checkout.jsx
│   │   │       └── OrderConfirmation.jsx
│   │   │
│   │   ├── App.jsx                         # React Router route definitions
│   │   ├── main.jsx                        # ReactDOM.createRoot entry point
│   │   └── index.css                       # Tailwind directives only (@tailwind base/components/utilities)
│   │
│   ├── index.html                          # Vite HTML shell
│   ├── vite.config.js                      # Vite config — proxy /api/* to PHP dev server
│   ├── tailwind.config.js                  # Tailwind content paths
│   └── package.json
│
├── public/                                 # Apache/Nginx web root
│   ├── index.php                           # PHP front controller — handles /api/* only
│   ├── image.php                           # Image serve script (validates filename, serves file)
│   └── dist/                               # Vite build output — React SPA static files
│       ├── index.html                      # SPA shell (catch-all serves this for non-API paths)
│       └── assets/                         # Hashed JS/CSS bundles
│
├── config/
│   ├── config.php                          # Loads .env, defines constants
│   └── .env.example                        # Template — committed to Git
│
├── database/
│   ├── schema.sql                          # All 8 tables — InnoDB, FK constraints
│   └── seed.sql                            # Default admin user + seed categories
│
├── storage/
│   └── products/                           # Uploaded product images — outside web root
│       └── .gitkeep
│
├── .htaccess                               # Routes /api/* to index.php; all others to dist/index.html
├── .gitignore
└── README.md
```

---

## API Design

All PHP routes are prefixed with `/api/`. The React frontend communicates exclusively through this API using `fetch()` with `credentials: 'include'` so the session cookie is sent on every request.

### Response Format

All API responses use `Content-Type: application/json`. Successful responses return HTTP 2xx with a JSON body. Errors return the appropriate HTTP status code with a JSON error body:

```json
{ "error": "Human-readable error message" }
```

Successful responses return data directly at the top level or under a relevant key:

```json
{ "products": [...] }
{ "order": { ... } }
{ "message": "Product created successfully" }
```

### CSRF Flow

1. On app initialisation, React fetches `GET /api/csrf-token` → receives `{ "token": "abc123..." }`
2. Token is stored in a module-level variable in `src/api/client.js`
3. Every non-GET request includes the header: `X-CSRF-Token: abc123...`
4. PHP `Csrf::verifyHeader()` reads `$_SERVER['HTTP_X_CSRF_TOKEN']` and compares with `$_SESSION['csrf_token']` using `hash_equals()`

### Full Route Table

```
# CSRF
GET  /api/csrf-token                    → AuthController::csrfToken()

# Authentication
+ POST /api/login                       → AuthController::customerLogin()
POST /api/register                    → AuthController::register()
POST /api/admin/login                   → AuthController::login()
POST /api/admin/logout                  → AuthController::logout()
GET  /api/admin/me                      → AuthController::me()

# Admin Dashboard
GET  /api/admin/dashboard               → DashboardController::index()

# Admin Users
GET  /api/admin/users                   → UserController::index()
POST /api/admin/users                   → UserController::store()
POST /api/admin/users/{id}              → UserController::update()
POST /api/admin/users/{id}/delete       → UserController::destroy()

# Inventory
GET  /api/admin/inventory               → InventoryController::index()
POST /api/admin/inventory               → InventoryController::store()
GET  /api/admin/inventory/{id}          → InventoryController::show()
POST /api/admin/inventory/{id}          → InventoryController::update()
POST /api/admin/inventory/{id}/deactivate → InventoryController::deactivate()
GET  /api/admin/inventory/trash         → InventoryController::trash()
POST /api/admin/inventory/{id}/restore   → InventoryController::restore()

# Categories
GET  /api/admin/categories              → CategoryController::index()
POST /api/admin/categories              → CategoryController::store()
POST /api/admin/categories/{id}/delete  → CategoryController::delete()

# Suppliers
GET  /api/admin/suppliers               → SupplierController::index()
POST /api/admin/suppliers               → SupplierController::store()
POST /api/admin/suppliers/{id}          → SupplierController::update()
GET  /api/admin/suppliers/{id}/deliveries → SupplierController::deliveries()
POST /api/admin/suppliers/delivery      → SupplierController::recordDelivery()

# Orders (Admin)
GET  /api/admin/orders                  → OrderController::index()
GET  /api/admin/orders/{id}             → OrderController::show()
POST /api/admin/orders/{id}/status      → OrderController::updateStatus()

# Reports
GET  /api/admin/reports/sales           → ReportController::sales()
GET  /api/admin/reports/inventory       → ReportController::inventory()
GET  /api/admin/reports/suppliers       → ReportController::suppliers()
GET  /api/admin/reports/export          → ReportController::exportCsv()

# Storefront (Public)
GET  /api/storefront/list                → StorefrontController::list()
GET  /api/storefront/detail/{id}          → StorefrontController::detail()
GET  /api/storefront/categories            → StorefrontController::categories()

# Cart (Persistent / Session fallback)
GET  /api/cart                          → CartController::index()
POST /api/cart/add                      → CartController::add()
POST /api/cart/update                   → CartController::update()
POST /api/cart/remove                   → CartController::remove()
POST /api/cart/clear                    → CartController::clear()

# Checkout
POST /api/checkout                      → OrderController::submit()
GET  /api/order-confirmation/{id}       → OrderController::confirmation()

# Images
GET  /image.php?file={filename}         → image.php (standalone script)

# Payments (PayMongo)
POST /api/payments/create-intent        → PaymentController::createIntent()
GET  /api/payments/status/{id}          → PaymentController::checkStatus()
POST /api/webhooks/paymongo             → PaymentController::handleWebhook()
```

### Business Logic Flow

**Checkout (Atomic Stock Deduction):**
1. React POSTs cart contents + customer info to `POST /api/checkout`
2. PHP controller opens a MySQL transaction
3. `SELECT stock_qty FROM products WHERE product_id = :id FOR UPDATE` per item
4. If any item has insufficient stock → rollback → return `422` with error message
5. Deduct stock, insert `orders` row, insert `order_items` rows
6. Commit → return `201` with `{ order_id, total_amount, items }`
7. React redirects to `/order-confirmation/:id`

**Delivery Stock Update:**
1. Admin POSTs delivery form to `POST /api/admin/suppliers/delivery`
2. PHP inserts row into `deliveries` and `UPDATE products SET stock_qty = stock_qty + :qty` in one transaction
3. Commit → return `201` with updated product stock level

**Low-Stock Alerts:**
1. Dashboard controller queries `SELECT * FROM products WHERE stock_qty <= low_stock_threshold AND is_active = 1`
2. Returns count in dashboard summary; full list available via inventory endpoint with `?filter=low_stock`

**Sales Report Aggregation:**
1. React sends date range as query params: `GET /api/admin/reports/sales?from=2026-01-01&to=2026-01-31`
2. PHP queries `orders` joined to `order_items` where `status = 'completed'` and `ordered_at BETWEEN :from AND :to`
3. Returns aggregated JSON; CSV export streamed via `GET /api/admin/reports/export?type=sales&from=...&to=...`

---

## Database Schema

### users (delight-im/auth)

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | |
| `email` | VARCHAR(249) | UNIQUE, NOT NULL | Primary identifier for delight-im/auth |
| `password` | VARCHAR(255) | NOT NULL | Hashed by library (password_verify compatible) |
| `username` | VARCHAR(100) | NULLABLE | Display name / secondary login |
| `status` | TINYINT | NOT NULL | Library status code (DEFAULT 0) |
| `verified` | TINYINT | NOT NULL | 0=Unverified, 1=Verified |
| `resettable` | TINYINT | NOT NULL | DEFAULT 1 |
| `roles_mask` | INT | NOT NULL | Bitmask for roles |
| `registered` | INT | NOT NULL | Creation timestamp (Unix) |
| `last_login` | INT | NULLABLE | Last login timestamp (Unix) |
| `force_logout` | MEDIUMINT | NOT NULL | DEFAULT 0 |
| `role_label` | ENUM | DEFAULT 'customer' | Custom field ('admin', 'staff', 'customer') |

> **Note:** The `delight-im/auth` library manages several internal tables: `users_confirmations`, `users_remembered`, `users_resets`, `users_throttling` (used for brute-force rate-limiting), `users_audit_log`, `users_otps`, and `users_2fa`.

### categories

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `category_id` | INT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. Aquatic Life |
| `description` | TEXT | NULLABLE | |

### products

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `product_id` | INT | PK, AUTO_INCREMENT | |
| `category_id` | INT | FK → categories, NOT NULL | |
| `name` | VARCHAR(150) | UNIQUE, NOT NULL | |
| `description` | TEXT | NULLABLE | |
| `price` | DECIMAL(10,2) | NOT NULL | PHP currency |
| `stock_qty` | INT | DEFAULT 0 | Current stock |
| `low_stock_threshold` | INT | DEFAULT 5 | Alert trigger level |
| `image_path` | VARCHAR(255) | NULLABLE | Filename only — served via image.php |
| `is_active` | TINYINT(1) | DEFAULT 1 | 0 = soft-deleted |
| `created_at` | DATETIME | DEFAULT NOW() | |
| `updated_at` | DATETIME | DEFAULT NOW() ON UPDATE NOW() | |

### suppliers

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `supplier_id` | INT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(150) | NOT NULL | |
| `contact_person` | VARCHAR(100) | NULLABLE | |
| `phone` | VARCHAR(30) | NULLABLE | |
| `email` | VARCHAR(150) | NULLABLE | |
| `address` | TEXT | NULLABLE | |
| `created_at` | DATETIME | DEFAULT NOW() | |

### deliveries

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `delivery_id` | INT | PK, AUTO_INCREMENT | |
| `supplier_id` | INT | FK → suppliers, NOT NULL | |
| `product_id` | INT | FK → products, NOT NULL | |
| `qty_received` | INT | NOT NULL | |
| `unit_cost` | DECIMAL(10,2) | NULLABLE | |
| `delivered_at` | DATETIME | DEFAULT NOW() | |
| `notes` | TEXT | NULLABLE | |

### orders

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `order_id` | INT | PK, AUTO_INCREMENT | |
| `customer_name` | VARCHAR(150) | NOT NULL | |
| `customer_email` | VARCHAR(150) | NULLABLE | |
| `customer_phone` | VARCHAR(30) | NULLABLE | |
| `total_amount` | DECIMAL(10,2) | NOT NULL | |
| `status` | ENUM | DEFAULT 'pending' | pending \| confirmed \| completed \| cancelled |
| `ordered_at` | DATETIME | DEFAULT NOW() | |
| `notes` | TEXT | NULLABLE | |

### order_items

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `item_id` | INT | PK, AUTO_INCREMENT | |
| `order_id` | INT | FK → orders ON DELETE CASCADE | |
| `product_id` | INT | FK → products ON DELETE RESTRICT | |
| `qty` | INT | NOT NULL | |
| `unit_price` | DECIMAL(10,2) | NOT NULL | Price at time of sale |
| `subtotal` | DECIMAL(10,2) | NOT NULL | qty × unit_price |



### cart_items

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `item_id` | INT | PK, AUTO_INCREMENT | |
| `user_id` | INT | FK → users, NOT NULL | |
| `product_id` | INT | FK → products, NOT NULL | |
| `qty` | INT | NOT NULL | |
| `created_at` | DATETIME | DEFAULT NOW() | |
| `updated_at` | DATETIME | DEFAULT NOW() ON UPDATE NOW() | |

### notifications

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | |
| `type` | ENUM | NOT NULL | `order_paid`, `order_failed`, `low_stock`, `new_customer` |
| `title` | VARCHAR(150) | NOT NULL | Short summary |
| `message` | TEXT | NOT NULL | Detailed message |
| `is_read` | TINYINT(1) | DEFAULT 0 | 0 = Unread, 1 = Read |
| `data_json` | TEXT | NULLABLE | Context payload (e.g. `{"order_id": 123}`) |
| `created_at` | DATETIME | DEFAULT NOW() | |

---

## Security

| Security Measure | Implementation |
| :--- | :--- |
| **Password Security** | bcrypt via `password_hash()` (cost 12); `password_verify()` for constant-time comparison; plaintext never stored or logged |
| **Session Management** | `session_regenerate_id(true)` on every successful login; 30-minute inactivity timeout; cookies set to HttpOnly, Secure (HTTPS), SameSite=Strict; `session_destroy()` + cookie clear on logout |
| **CSRF Protection** | Token generated via `bin2hex(random_bytes(32))`; stored in session; React fetches token from `GET /api/csrf-token` on init; sent as `X-CSRF-Token` header on all non-GET requests; PHP verifies header with `hash_equals()` |
| **SQL Injection Prevention** | PDO with prepared statements throughout; no dynamic SQL string concatenation with user input |
| **XSS Prevention** | React escapes all dynamic values by default in JSX; PHP API responses use `json_encode()` which escapes special characters; `Content-Security-Policy` header restricts inline scripts |
| **CORS** | Dev only: PHP emits `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true`; Production: same origin, no CORS headers needed |
| **Brute-Force Protection** | Rate-limiting on login/register via `users_throttles` table (provided by `delight-im/auth`); automatically delays repeated failed attempts |
| **File Upload Security** | MIME type validated server-side via `finfo_file()`; files renamed with `bin2hex(random_bytes(16))`; stored outside web root; max 2MB enforced |
| **Data in Transit** | TLS enforced via server configuration (HTTPS only) |

---

## Development Setup

### Running Locally

```bash
# 1 — PHP backend (from project root)
php -S localhost:8000 -t public

# 2 — React frontend (from frontend/)
cd frontend
npm install
npm run dev          # starts Vite dev server at http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:8000` via `vite.config.js`. Open the browser at `http://localhost:5173`.

### Production Build

```bash
cd frontend
npm run build        # outputs to public/dist/
```

The `.htaccess` rule serves `public/dist/index.html` for all non-`/api/` paths, enabling React Router to handle client-side navigation.

---

## Deployment

| Component | Technology | Hosting |
| :--- | :--- | :--- |
| PHP API | PHP 8.x | Shared hosting or VPS (Apache/Nginx + PHP-FPM) |
| React SPA | Static files | Served from `public/dist/` by the same web server |
| Database | MySQL 8.x | Same server or managed MySQL |
| File Storage | Server filesystem | Outside web root; served via `public/image.php` |
| Source Control | Git + GitHub | GitHub repository |
| Deployment | `git pull` + `npm run build` | Owner-managed |
| SSL/TLS | Let's Encrypt or hosting provider | Server-level |