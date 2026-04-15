---
id: 2026-04-15-03-storefront-browsing
title: "Storefront Browsing: Home & Product Detail"
type: feature
priority: 🔴 High
status: 🟢 Done
phase: 1
created: 2026-04-15
completed: 2026-04-15
---

## Context

> This ticket implements the core browsing features of the storefront.
> Customers should be able to view a list of all active products on the Home page, filter them by category, and click into a dedicated Product Detail page for more information.
> Reference: `docs/features/project-status.md` (Priority 5) and `docs/architecture/software-architecture.md` (Public Storefront section).

---

## Scope

This ticket implements the following paired unit of work:

| Layer | What is being built |
| :--- | :--- |
| **Database** | No schema changes; using existing `products` and `categories` tables |
| **Model** | `ProductModel::fetchAllActive()`, `ProductModel::fetchByCategory(int $id)`, `CategoryModel::fetchAll()` |
| **Controller** | `StorefrontController` methods: `list()`, `detail(int $id)`, `categories()` |
| **API Wrapper** | `frontend/src/api/products.js`, `frontend/src/api/categories.js` |
| **React Components** | `Home.jsx`, `ProductDetail.jsx`, `CategoryTabs.jsx` |

---

## Dependencies

- [x] [2026-04-15-02-urgent-remove-login-modal.md](file:///c:/xampp/htdocs/althea/docs/tickets/2026-04-15-02-urgent-remove-login-modal.md) (Modal removal complete).

---

## AI Agent Instructions

> ⚠️ Follow Rule 18 in `AGENTS.md`: always implement the Model, Controller, AND React components together.
> Complete each Step fully before moving to the next. Never skip steps or leave stubs.

---

### Step 1 — Database (`database/`)

*No schema changes in this ticket.*

---

### Step 2 — Model (`app/Models/`)

- [x] **ProductModel.php**:
    - Add `fetchAllActive(): array` (p.is_active = 1 joined with category name).
    - Add `fetchByCategory(int $categoryId): array` (filtered by active category).
- [x] **CategoryModel.php**:
    - Ensure `fetchAll(): array` is available for navigation tabs.

---

### Step 3 — Controller (`app/Controllers/StorefrontController.php`)

- [x] Implement `list()`: Returns JSON of all active products.
- [x] Implement `detail(int $id)`: Returns JSON of a single active product; returns 404 if not found or inactive.
- [x] Implement `categories()`: Returns JSON of all categories for the filter tabs.

---

### Step 4 — API Wrapper (`frontend/src/api/`)

- [x] `products.js`: Add `getProducts()`, `getProductDetails(id)`.
- [x] `categories.js`: Add `getCategories()`.

---

### Step 5 — React Components & Pages (`frontend/src/`)

- [x] **Home.jsx**:
    - Fetch and display products in a grid using `ProductCard.jsx`.
    - Fetch and display categories in a tab list using `CategoryTabs.jsx`.
    - Implement filtering logic by category ID.
- [x] **ProductDetail.jsx**:
    - Fetch and display full product details: name, description, price, image, category.
    - Implement quantity selector and "Add to Cart" button (referencing guest redirect logic from Ticket 02).
- [x] **CategoryTabs.jsx**:
    - Create a reusable tab component for filtering.

---

### Step 6 — Docs & Status Update

- [x] Mark all completed tasks as `[x]` in `docs/features/project-status.md`.
- [x] Update `docs/architecture/software-architecture.md` if any architecture decisions changed.
- [x] Set this ticket's `status` to `🟢 Done` and populate the `completed` date.

---

## Acceptance Criteria

- [x] All PHP files declare `strict_types=1` at the top.
- [x] All methods have explicit parameter types and return types.
- [x] Frontend displays only active products (`is_active = 1`).
- [x] Storefront home page allows filtering by category.
- [x] Product detail page returns 404 for deactivated products.
- [x] Aesthetics strictly follow the Aquatic theme (Sage, Teal, Mint, Cream).
- [x] `docs/features/project-status.md` updated with completed task checkmarks.
 stone
