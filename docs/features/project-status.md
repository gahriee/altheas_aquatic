# Project Status: Althea's Aquatic

**Last Updated:** 2026-05-15
**Current Phase:** Phase 3 — Post-Delivery Enhancements

> **AI Agent Instructions:** Always read this file before generating code. Update this file when a task is completed. Do not implement features assigned to future phases.

---

## 🎯 Development Roadmap

### Phase 1: Core Foundation (Weeks 1–2) ✅

- [x] Project scaffold: MVC folder structure, front controller, autoloader, `.env` config
- [x] Database schema: all 7 tables with InnoDB + FK constraints, seed categories
- [x] Authentication: login form, bcrypt verify, session management, logout, brute-force protection
- [x] Apply Aquatic Theme: update all frontend components to strictly follow `tailwind.config.js` palette (Ticket: `2026-04-11-02`)
- [x] Core Library Migration: replaced custom router and auth with `bramus/router` and `delight-im/auth` (Ticket: `2026-04-19-01`)
- [x] Shared UI Components: implement reusable Button, Input, and Label components (Ticket: `2026-04-11-04`)
- [x] Inventory Module: product CRUD, image upload, soft delete, low-stock display (Ticket: `2026-04-11-03`)
- [x] Trash Management: unique titles, restore deactivated products (Ticket: `2026-04-12-01`)
- [x] Supplier Module: supplier CRUD, record delivery, auto stock update (Ticket: `2026-04-12-02`)
- [x] Customer Storefront: home page, product detail, category filter (Ticket: `2026-04-15-03`)
- [x] Cart & Checkout: session cart, customer info form, atomic stock deduction, order confirmation, PayMongo GCash integration
- [x] Persistent Cart: transition to database-backed storage for authenticated users (Ticket: `2026-04-18-03`)

### Phase 2: Order Management & Alerts (Week 3) ✅

- [x] Admin Order Management: List view, status updates (Ticket: `2026-04-19-06`)
- [x] Reports Module: sales summary by date range, inventory status table, supplier delivery summary (Ticket: `2026-05-07-01`)
- [x] CSV Export: export sales and inventory reports as downloadable CSV files (Ticket: `2026-05-07-01`)
- [x] Admin Dashboard: summary cards and sales trend chart (Ticket: `2026-05-07-02`)
- [x] Admin Users Module: manage admin/staff roles and accounts (Ticket: `2026-05-10-02`)
- [x] Profile Settings & Password Reset: change password, forgot password, reset password flows (Ticket: `2026-05-10-03`)
- [x] Low-stock alert panel: filtered view highlighting products at or below threshold (Ticket: `2026-05-15-01`)
- [x] Real-time Notifications: Pusher integration for order payments and stock alerts (Ticket: `2026-04-19-03`)
- [x] Notification History Page: paginated and filterable dedicated page for all alerts (Ticket: `2026-05-10-04`)
- [x] Cart Animation Sync: Synchronized count update with fly-to-cart animation (Ticket: `2026-04-19-05`)
- [x] Storefront My Orders: customer order history and detail pages (Ticket: `2026-05-10-05`)

### Phase 2.5: Polish & Delivery ✅

- [x] Mobile responsiveness audit — all pages tested on phone viewport
- [x] Security hardening audit: CSP headers, CSRF on all forms, upload path checks
- [x] UI polish: custom CSS refinements, loading states, error/success message consistency
- [x] Deployment: production server setup, `.env` config, SSL verification
- [x] Client handover: source code delivery, documentation, credentials handoff

### Phase 3: Post-Delivery Enhancements — Current Focus

- [x] Audit Logs Module: track all state-changing API actions (create, update, delete) with admin page for review
- [x] Customer Profile & Saved Delivery Address: view/edit personal info and default address, auto-fill checkout (Ticket: `2026-05-15-04`)

---

## 🏗️ Architecture Progress

### 🌐 Backend (PHP MVC)

| Module                  | Status | Notes                                                                                      |
| :---------------------- | :----: | :----------------------------------------------------------------------------------------- |
| **Project Scaffold**    | `[x]`  | MVC folder structure, front controller, autoloader, env config                             |
| **Database Schema**     | `[x]`  | All 7 tables updated; adding `delight-im/auth` tables                                      |
| **Authentication**      | `[x]`  | Migrating to `delight-im/auth` for secure session/throttling                               |
| **Inventory Module**    | `[x]`  | Product CRUD, image upload, soft delete, low-stock query                                   |
| **Supplier Module**     | `[x]`  | Supplier CRUD, delivery form, auto stock deduction                                         |
| **Order Module**        | `[x]`  | Atomic checkout, order creation, order_items insert, stock deduction, PayMongo integration |
| **Reports Module**      | `[x]`  | Date-range sales query, inventory status, supplier summaries, CSV export                   |
| **Rate Limit Logic**    | `[x]`  | rate_limit_log insert/check — 5 attempts per IP per 10 minutes                             |
| **CSRF Protection**     | `[x]`  | Token generate/verify helper — applied to all state-changing forms                         |
| **File Upload Handler** | `[x]`  | MIME validation, random rename, outside-web-root storage, serve script                     |
| **Login Modal**         | `[x]`  | Portable auth with aquatic theme and post-login action support                             |
| **Order Expiry**        | `[x]`  | Auto stock restoration for unpaid orders older than 60 mins                                |
| **Admin Users Module**  | `[x]`  | `UserController` with role-based CRUD using `delight-im/auth` admin methods                |
| **Password Reset Flow** | `[x]`  | Forgot password email, verify token, change/reset password via `delight-im/auth`           |

### 🖥️ Frontend Pages

| Page                             | Status | Notes                                                                                           |
| :------------------------------- | :----: | :---------------------------------------------------------------------------------------------- |
| **Login Page**                   | `[x]`  | Credential form, error message, rate-limit feedback, forgot password link                       |
| **Profile Settings**             | `[x]`  | Admin change password form                                                                      |
| **Forgot / Reset Password**      | `[x]`  | Public pages to request and verify password reset link                                          |
| **Admin Dashboard**              | `[x]`  | Summary cards, sales trend chart, and quick actions                                             |
| **Users**                        | `[x]`  | Admin/staff list, add/edit user form, role management                                           |
| **Notification History**         | `[x]`  | Full paginated list of alerts, filter by type/status, clear old alerts                          |
| **Inventory Management**         | `[x]`  | Sortable product table, add/edit form, image preview, low-stock highlights, pagination          |
| **Low Stock Alerts**             | `[x]`  | Full list of low-stock items with threshold and restocking actions                              |
| **Supplier Management**          | `[x]`  | Supplier list, add/edit form, record delivery form, per-supplier history                        |
| **Sales / Orders**               | `[x]`  | Orders table with status filter, order detail view, status update, date-range filter            |
| **Reports**                      | `[x]`  | Date picker, sales summary table, inventory status table, supplier delivery summary, CSV export |
| **Audit Logs**                   | `[x]`  | Paginated list of system changes, filter by action/resource/user, JSON diff view                |
| **Storefront — Home**            | `[x]`  | Hero banner, featured product grid, category filter tabs, product cards                         |
| **Storefront — Product Detail**  | `[x]`  | Image, description, price, quantity selector, add-to-cart                                       |
| **Storefront — Cart & Checkout** | `[x]`  | Cart list, subtotals, customer info form, PayMongo GCash integration                            |
| **Storefront — My Orders**       | `[x]`  | Customer order history list with status tabs and itemised detail view                           |
| **Storefront — My Profile**      | `[x]`  | Customer profile page with saved delivery address and checkout pre-fill                         |
| **Order Confirmation**           | `[x]`  | Order ID, itemised summary, payment status polling, return-to-shop link                         |

_Key: `[x]` = Complete, `[~]` = In Progress, `[ ]` = Not Started, `[!]` = Blocked_

---

## 📝 Active Tasks

### ✅ Completed

- Project specification document finalized

---

### ⚙️ Priority 1: Project Scaffold & Database

- [x] **Real-time Notifications** (Ticket: `2026-04-19-03`): Added `notifications` table, Pusher SDK, `NotificationModel`, API routes, and frontend Admin feed UI.

- [x] **MVC Folder Structure**: Create `app/Controllers/`, `app/Models/`, `app/Views/`, `public/`, `config/`, `uploads/` directories; configure `.htaccess` to route all requests through `public/index.php`
- [x] **Front Controller**: `public/index.php` — dispatches to `Router.php`
- [x] **Routing Migration**: Replaced custom `Router` with `bramus/router` (Ticket: `2026-04-19-01`)
- [x] **Autoloader**: PSR-4 style `spl_autoload_register` — maps `App\Controllers\` to `app/Controllers/`, etc.
- [x] **Environment Config**: `config/config.php` — loads `.env` or defines constants for DB host, name, user, password; never committed to Git
- [x] **Database Connection**: `app/Core/Database.php` — PDO singleton with `PDO::ATTR_ERRMODE => EXCEPTION` and `PDO::ATTR_DEFAULT_FETCH_MODE => ASSOC`
- [x] **Schema Migration**: `database/schema.sql` — all 8 tables (`users`, `categories`, `products`, `suppliers`, `deliveries`, `orders`, `order_items`, `rate_limit_log`) with InnoDB, FK constraints, DATETIME timestamps
- [x] **Seed Data**: `database/seed.sql` — default admin user (email-only), seed categories (Aquatic Life, Aquatic Plants, Accessories)

---

### 🔐 Priority 2: Authentication Module

- [x] **Login Form** (`AuthController::loginForm`): username + password form with CSRF token; error message display area; rate-limit feedback ("Too many attempts — try again in X minutes")
- [x] **Login Handler** (`AuthController::login`): check `rate_limit_log` for IP threshold; `password_verify` against `password_hash`; `session_regenerate_id(true)` on success; set `$_SESSION['user_id']` and `role`; redirect to dashboard; on failure insert `rate_limit_log` row
- [x] **Auth Migration**: Replaced custom `Auth` with `delight-im/auth` and transitioned to **Email-Only** identification (Ticket: `2026-04-19-01`)
- [x] **Session Config**: `session.cookie_httponly = 1`, `session.cookie_secure = 1`, `session.cookie_samesite = Strict`, `session.gc_maxlifetime = 1800` (30 minutes)

---

### 📦 Priority 3: Inventory Module

- [x] **Product List** (`InventoryController::index`): paginated sortable table; search by name; low-stock rows highlighted in red (stock_qty ≤ low_stock_threshold); deactivate button (soft delete)
- [x] **Add Product Form** (`InventoryController::addForm` / `store`): name, category (dropdown), description, price, stock_qty, low_stock_threshold, image upload; server-side validation; CSRF token
- [x] **Edit Product Form** (`InventoryController::editForm` / `update`): pre-populated fields; image replacement option; validates on submit; preserves `created_at`
- [x] **Trash Management** (`InventoryController::trash` / `restore`): unique name constraint; view inactive products; restore functionality (Ticket: `2026-04-12-01`)
- [x] **Soft Delete** (`InventoryController::deactivate`): sets `is_active = 0`; product hidden from storefront; all order_items records preserved
- [x] **Image Upload Handler**: `app/Core/Uploader.php` — validates MIME via `finfo_file()`; accepted types: image/jpeg, image/png, image/webp; renames to `bin2hex(random_bytes(16)) . ext`; stores to `storage/products/` (outside web root); max 2MB
- [x] **Image Serve Script**: `public/image.php?file=xxx` — validates filename format; serves file with correct Content-Type header; blocks path traversal attempts

---

### 🏭 Priority 4: Supplier Module (Ticket: `2026-04-12-02`)

- [x] **Supplier List** (`SupplierController::index`): table of all suppliers with contact info; add/edit inline or modal; delivery count badge per supplier
- [x] **Add/Edit Supplier** (`SupplierController::store` / `update`): name (required), contact_person, phone, email, address; CSRF-protected POST
- [x] **Record Delivery** (`SupplierController::recordDelivery`): supplier dropdown, product dropdown, qty_received, unit_cost (optional), notes; inserts `deliveries` row; `UPDATE products SET stock_qty = stock_qty + ?` in same transaction
- [x] **Supplier Delivery History**: per-supplier view listing all past deliveries with date, product, qty, unit_cost

---

### 🛒 Priority 5: Storefront & Checkout

- [x] **Home Page** (`StorefrontController::list`): hero banner; product grid filtered by `is_active = 1` via `fetchAllActive()`; category filter tabs; product cards (Ticket: `2026-04-15-03`)
- [x] **Product Detail** (`StorefrontController::detail`): full image, name, description, price; quantity selector; related products by category (Ticket: `2026-04-15-03`)
- [x] **Session Cart**: `app/Core/Cart.php` — `add(product_id, qty)`, `remove(product_id)`, `update(product_id, qty)`, `getItems()`, `getTotal()`; stored in `$_SESSION['cart']`; validates qty does not exceed current stock
- [x] **Cart View** (`CartController::index`): item list with subtotals, quantity update, remove item, order total; proceed to checkout button
- [x] **Checkout Form** (`Checkout.jsx`): customer name (required), email, phone, notes; order summary panel; CSRF token
- [x] **Checkout Submit** (`PaymentController::createIntent`): open transaction; `SELECT stock_qty FOR UPDATE` per item; rollback + error if insufficient stock; deduct stock; insert `orders` + `order_items`; create PayMongo intent + method; commit; clear cart; redirect
- [x] **Order Confirmation** (`OrderConfirmation.jsx`): order ID, itemised summary, total amount, payment status polling, return-to-shop link
- [x] **Order Expiry**: `OrderModel::cleanupExpiredOrders` restores stock for unpaid orders > 1 hour.
- [ ] **Persistent Cart** (`CartModel`): implement DB storage and session merging for authenticated customers (Ticket: `2026-04-18-03`)

---

### 📋 Priority 6: Orders & Reports (Phase 2)

- [x] **Order List** (`OrderController::index`): table with status filter (all/pending/confirmed/completed/cancelled), date-range filter, order ID, customer, total, status; sortable columns
- [x] **Order Detail** (`OrderController::detail`): itemised view with product name, qty, unit_price, subtotal; status update dropdown; CSRF-protected POST to update status
- [x] **Sales Report** (`ReportController::sales`): date range picker; aggregated daily totals (orders count, revenue) for completed orders; top-selling products; gross totals for range
- [x] **Inventory Status Report** (`ReportController::inventory`): current stock levels table; highlights products at or below `low_stock_threshold`
- [x] **Supplier Delivery Summary** (`ReportController::suppliers`): per-supplier delivery count and total units received within date range
- [x] **CSV Export** (`ReportController::exportCsv`): `Content-Type: text/csv` + `Content-Disposition: attachment`; uses `fputcsv`; exports sales or inventory data based on `type` query param

---

### 🏠 Priority 7: Admin Dashboard

- [x] **Summary Cards**: total active products count; low-stock products count; today's completed sales total (PHP); pending orders count
- [x] **Sales Trend**: Visual line chart showing the last 7 days of revenue using `recharts`
- [x] **Quick Actions**: links to Add Product, View Orders, Generate Reports

---

## 🐛 Known Issues / Tech Debt

_None yet — project is in initial setup._

---

## 📐 Architecture Constraints

- **Never use an ORM** — all database queries use PDO with prepared statements directly in Model classes
- **Tailwind CSS v3** — all styling strictly follows the theme palette in `tailwind.config.js`; no external CSS files
- **Never hard-delete products** — always use `is_active = 0`; this preserves order history
- **All stock deductions are atomic** — always use a MySQL transaction with `SELECT FOR UPDATE`
- **Email-Only Authentication** — Users are identified solely by email; no username is required or used in app logic.
- **Never store passwords in plaintext** — always `password_hash()` with `PASSWORD_BCRYPT` (managed by `delight-im/auth`); verify with `password_verify()`
- **CSRF tokens on every state-changing form** — generate in controller, verify before processing POST
- **Images are stored outside the web root** — never place uploaded files inside `public/`; always serve through `public/image.php`
- **Rate limiting uses the DB table** — no Redis; use `rate_limit_log` for brute-force protection
- **Reports include completed orders only** — never include pending or cancelled orders in revenue totals
- **Implement PayMongo GCash Integration** — ensure PaymentIntent and Webhook flow are secure and atomic
