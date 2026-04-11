# Project Status: Althea's Aquatic

**Last Updated:** 2026-04-11
**Current Phase:** Phase 1 — Core Foundation

> **AI Agent Instructions:** Always read this file before generating code. Update this file when a task is completed. Do not implement features assigned to future phases.

---

## 🎯 Development Roadmap

### Phase 1: Core Foundation (Weeks 1–2) — Current Focus
- [x] Project scaffold: MVC folder structure, front controller, autoloader, `.env` config
- [x] Database schema: all 7 tables with InnoDB + FK constraints, seed categories
- [x] Authentication: login form, bcrypt verify, session management, logout, brute-force protection
- [x] Apply Aquatic Theme: update all frontend components to strictly follow `tailwind.config.js` palette (Ticket: `2026-04-11-02`)
- [x] Shared UI Components: implement reusable Button, Input, and Label components (Ticket: `2026-04-11-04`)
- [x] Inventory Module: product CRUD, image upload, soft delete, low-stock display (Ticket: `2026-04-11-03`)
- [x] Trash Management: unique titles, restore deactivated products (Ticket: `2026-04-12-01`)
- [ ] Supplier Module: supplier CRUD, record delivery, auto stock update (Ticket: `2026-04-12-02`)
- [ ] Customer Storefront: home page, product detail, category filter
- [ ] Cart & Checkout: session cart, customer info form, atomic stock deduction, order confirmation

### Phase 2: Admin Operations (Weeks 3–4)
- [ ] Sales / Orders Module: order list with status filter, order detail view, status update control
- [ ] Reports Module: sales summary by date range, inventory status table, supplier delivery summary
- [ ] CSV Export: export sales and inventory reports as downloadable CSV files
- [ ] Admin Dashboard: summary cards (total products, low-stock count, today's sales, pending orders)
- [ ] Low-stock alert panel: filtered view highlighting products at or below threshold

### Phase 3: Polish & Delivery (Week 4–Delivery)
- [ ] Mobile responsiveness audit — all pages tested on phone viewport
- [ ] Security hardening audit: CSP headers, CSRF on all forms, upload path checks
- [ ] UI polish: custom CSS refinements, loading states, error/success message consistency
- [ ] Deployment: production server setup, `.env` config, SSL verification
- [ ] Client handover: source code delivery, documentation, credentials handoff

---

## 🏗️ Architecture Progress

### 🌐 Backend (PHP MVC)

| Module | Status | Notes |
| :--- | :---: | :--- |
| **Project Scaffold** | `[x]` | MVC folder structure, front controller, autoloader, env config |
| **Database Schema** | `[x]` | All 7 tables: users, categories, products, suppliers, deliveries, orders, order_items, rate_limit_log |
| **Authentication** | `[x]` | Multi-role login (customer/admin), bcrypt verify, session regeneration, logout, rate limiting |
| **Inventory Module** | `[x]` | Product CRUD, image upload, soft delete, low-stock query |
| **Supplier Module** | `[ ]` | Supplier CRUD, delivery form, auto stock deduction |
| **Order Module** | `[ ]` | Atomic checkout, order creation, order_items insert, stock deduction |
| **Reports Module** | `[ ]` | Date-range sales query, inventory status, supplier summaries, CSV export |
| **Rate Limit Logic** | `[x]` | rate_limit_log insert/check — 5 attempts per IP per 10 minutes |
| **CSRF Protection** | `[x]` | Token generate/verify helper — applied to all state-changing forms |
| **File Upload Handler** | `[x]` | MIME validation, random rename, outside-web-root storage, serve script |
| **Login Modal** | `[x]` | Portable auth with aquatic theme and post-login action support |

### 🖥️ Frontend Pages

| Page | Status | Notes |
| :--- | :---: | :--- |
| **Login Page** | `[x]` | Credential form, error message, rate-limit feedback |
| **Admin Dashboard** | `[ ]` | Summary cards, quick-action buttons, navigation sidebar |
| **Inventory Management** | `[x]` | Sortable product table, add/edit form, image preview, low-stock highlights, pagination |
| **Supplier Management** | `[ ]` | Supplier list, add/edit form, record delivery form, per-supplier history |
| **Sales / Orders** | `[ ]` | Orders table with status filter, order detail view, status update, date-range filter |
| **Reports** | `[ ]` | Date picker, sales summary table, inventory status table, supplier delivery summary, CSV export |
| **Storefront — Home** | `[ ]` | Hero banner, featured product grid, category filter tabs, product cards |
| **Storefront — Product Detail** | `[ ]` | Image, description, price, quantity selector, add-to-cart |
| **Storefront — Cart & Checkout** | `[ ]` | Cart list, subtotals, customer info form, out-of-stock protection |
| **Order Confirmation** | `[ ]` | Order ID, itemised summary, thank-you message, return-to-shop link |

*Key: `[x]` = Complete, `[~]` = In Progress, `[ ]` = Not Started, `[!]` = Blocked*

---

## 📝 Active Tasks

### ✅ Completed
- Project specification document finalized

---

### ⚙️ Priority 1: Project Scaffold & Database

- [x] **MVC Folder Structure**: Create `app/Controllers/`, `app/Models/`, `app/Views/`, `public/`, `config/`, `uploads/` directories; configure `.htaccess` to route all requests through `public/index.php`
- [x] **Front Controller**: `public/index.php` — parse URL segments, instantiate correct controller, call correct method; 404 fallback
- [x] **Autoloader**: PSR-4 style `spl_autoload_register` — maps `App\Controllers\` to `app/Controllers/`, etc.
- [x] **Environment Config**: `config/config.php` — loads `.env` or defines constants for DB host, name, user, password; never committed to Git
- [x] **Database Connection**: `app/Core/Database.php` — PDO singleton with `PDO::ATTR_ERRMODE => EXCEPTION` and `PDO::ATTR_DEFAULT_FETCH_MODE => ASSOC`
- [x] **Schema Migration**: `database/schema.sql` — all 8 tables (`users`, `categories`, `products`, `suppliers`, `deliveries`, `orders`, `order_items`, `rate_limit_log`) with InnoDB, FK constraints, DATETIME timestamps
- [x] **Seed Data**: `database/seed.sql` — default admin user (bcrypt hashed password), seed categories (Aquatic Life, Aquatic Plants, Accessories)

---

### 🔐 Priority 2: Authentication Module

- [x] **Login Form** (`AuthController::loginForm`): username + password form with CSRF token; error message display area; rate-limit feedback ("Too many attempts — try again in X minutes")
- [x] **Login Handler** (`AuthController::login`): check `rate_limit_log` for IP threshold; `password_verify` against `password_hash`; `session_regenerate_id(true)` on success; set `$_SESSION['user_id']` and `role`; redirect to dashboard; on failure insert `rate_limit_log` row
- [x] **Auth Middleware**: `app/Core/Auth.php` — `requireLogin()` method called at the top of every admin controller; redirects to `/admin/login` if session invalid
- [x] **Logout Handler** (`AuthController::logout`): CSRF-verified POST; `session_destroy()`; clear session cookie; redirect to login
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

- [ ] **Supplier List** (`SupplierController::index`): table of all suppliers with contact info; add/edit inline or modal; delivery count badge per supplier
- [ ] **Add/Edit Supplier** (`SupplierController::store` / `update`): name (required), contact_person, phone, email, address; CSRF-protected POST
- [ ] **Record Delivery** (`SupplierController::recordDelivery`): supplier dropdown, product dropdown, qty_received, unit_cost (optional), notes; inserts `deliveries` row; `UPDATE products SET stock_qty = stock_qty + ?` in same transaction
- [ ] **Supplier Delivery History**: per-supplier view listing all past deliveries with date, product, qty, unit_cost

---

### 🛒 Priority 5: Storefront & Checkout

- [ ] **Home Page** (`StorefrontController::home`): hero banner; product grid filtered by `is_active = 1`; category filter tabs (all + per category); product cards with image, name, price, Buy Now / Add to Cart
- [ ] **Product Detail** (`StorefrontController::detail`): full image, name, description, price; quantity selector (max = stock_qty); Add to Cart button; related products by category
- [ ] **Session Cart**: `app/Core/Cart.php` — `add(product_id, qty)`, `remove(product_id)`, `update(product_id, qty)`, `getItems()`, `getTotal()`; stored in `$_SESSION['cart']`; validates qty does not exceed current stock
- [ ] **Cart View** (`CartController::index`): item list with subtotals, quantity update, remove item, order total; proceed to checkout button
- [ ] **Checkout Form** (`OrderController::checkoutForm`): customer name (required), email, phone, notes; order summary panel; CSRF token
- [ ] **Checkout Submit** (`OrderController::submit`): open transaction; `SELECT stock_qty FOR UPDATE` per item; rollback + error if insufficient stock; deduct stock; insert `orders` + `order_items`; commit; clear cart; redirect to confirmation
- [ ] **Order Confirmation** (`OrderController::confirmation`): order ID, itemised summary, total amount, thank-you message, return-to-shop link

---

### 📋 Priority 6: Orders & Reports (Phase 2)

- [ ] **Order List** (`OrderController::index`): table with status filter (all/pending/confirmed/completed/cancelled), date-range filter, order ID, customer, total, status; sortable columns
- [ ] **Order Detail** (`OrderController::detail`): itemised view with product name, qty, unit_price, subtotal; status update dropdown; CSRF-protected POST to update status
- [ ] **Sales Report** (`ReportController::index`): date range picker; aggregated daily totals (orders count, revenue) for completed orders; top-selling products; gross totals for range
- [ ] **Inventory Status Report**: current stock levels table; highlights products at or below `low_stock_threshold`
- [ ] **Supplier Delivery Summary**: per-supplier delivery count and total units received within date range
- [ ] **CSV Export** (`ReportController::exportCsv`): `Content-Type: text/csv` + `Content-Disposition: attachment`; uses `fputcsv`; exports sales or inventory data based on `type` query param

---

### 🏠 Priority 7: Admin Dashboard

- [ ] **Summary Cards**: total active products count; low-stock products count (with link to inventory); today's completed sales total (PHP); pending orders count (with link to orders)
- [ ] **Quick Actions**: links to Add Product, Record Delivery, View Pending Orders, Run Report
- [ ] **Navigation Sidebar**: links to all admin sections; active state highlighting; logout button

---

## 🐛 Known Issues / Tech Debt

*None yet — project is in initial setup.*

---

## 📐 Architecture Constraints

- **Never use an ORM** — all database queries use PDO with prepared statements directly in Model classes
- **Tailwind CSS v3** — all styling strictly follows the theme palette in `tailwind.config.js`; no external CSS files
- **Never hard-delete products** — always use `is_active = 0`; this preserves order history
- **All stock deductions are atomic** — always use a MySQL transaction with `SELECT FOR UPDATE`
- **Never store passwords in plaintext** — always `password_hash()` with `PASSWORD_BCRYPT`; verify with `password_verify()`
- **CSRF tokens on every state-changing form** — generate in controller, verify before processing POST
- **Images are stored outside the web root** — never place uploaded files inside `public/`; always serve through `public/image.php`
- **Rate limiting uses the DB table** — no Redis; use `rate_limit_log` for brute-force protection
- **Reports include completed orders only** — never include pending or cancelled orders in revenue totals
- **Do not implement Phase 3 features** (mobile app, payment gateway integration, email notifications) unless explicitly instructed
