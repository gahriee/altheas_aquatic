---
id: 2026-04-12-02-supplier-module
title: "Supplier Module & Delivery Recording"
type: feature
priority: 🔴 High
status: 🟢 Done
phase: 1
created: 2026-04-12
completed: 2026-04-15
---

## Context

> This ticket implements the **Supplier Module** as part of Phase 1 — Core Foundation. 
> It enables the management of suppliers (CRUD) and the recording of deliveries (`deliveries` table), which automatically updates the product inventory levels.
> This follows the Inventory Module and the Trash Management polishing, completing the administrative side of stock acquisition.

---

## Scope

This ticket implements the following paired unit of work:

| Layer | What is being built |
| :--- | :--- |
| **Database** | No schema changes; verify `suppliers` and `deliveries` tables |
| **Model** | `SupplierModel` CRUD; `DeliveryModel` (or extended `SupplierModel`) for transactions; `ProductModel` update for stock |
| **Controller** | `SupplierController` with endpoints for CRUD and recording deliveries |
| **API Wrapper** | `frontend/src/api/suppliers.js` and `frontend/src/api/deliveries.js` |
| **React Components** | `SupplierList.jsx`, `SupplierForm.jsx`, `DeliveryForm.jsx` |

---

## Dependencies

*No dependencies — this ticket can be started immediately.*

---

## AI Agent Instructions

> ⚠️ Follow Rule 18 in `AGENTS.md`: always implement the Model, Controller, AND React components together.
> Complete each Step fully before moving to the next. Never skip steps or leave stubs.

---

### Step 1 — Database (`database/`)

- [x] Verify `database/schema.sql` contains the `suppliers` and `deliveries` tables as defined.
- [x] No schema changes expected.

---

### Step 2 — Model (`app/Models/`)

- [x] **SupplierModel.php**:
    - `fetchAll(): array` — Returns all suppliers sorted by name (with delivery_count).
    - `fetchById(int $id): ?array` — Returns a single supplier or null.
    - `store(array $data): int` — Inserts a new supplier (name must be unique).
    - `update(int $id, array $data): bool` — Updates supplier info.
- [x] **ProductModel.php**:
    - Add `incrementStock(int $id, int $qty): bool` — Atomic update using `UPDATE products SET stock_qty = stock_qty + :qty WHERE product_id = :id`.
- [x] **SupplierModel.php** (or **DeliveryModel.php**):
    - `recordDelivery(array $data): bool` — Implementation of the "Record Delivery" business logic:
        1. Open transaction.
        2. Insert row into `deliveries`.
        3. Call `ProductModel::incrementStock`.
        4. Commit transaction.

---

### Step 3 — Controller (`app/Controllers/`)

- [x] **SupplierController.php**:
    - `index()` — Returns JSON list of suppliers.
    - `show(int $id)` — Returns JSON for a single supplier.
    - `store()` — Authenticated POST; CSRF-protected; handles name conflict.
    - `update(int $id)` — Authenticated POST/PUT; CSRF-protected.
    - `recordDelivery()` — Authenticated POST; CSRF-protected; calls model transaction.

---

### Step 4 — API Wrapper (`frontend/src/api/`)

- [x] Create `frontend/src/api/suppliers.js`:
    - `getSuppliers()`, `getSupplier(id)`, `createSupplier(data)`, `updateSupplier(id, data)`.
- [x] Create `frontend/src/api/deliveries.js`:
    - `recordDelivery(data)`, `getDeliveries(id)`.

---

### Step 5 — React Components & Pages (`frontend/src/pages/admin/suppliers/`)

- [x] **SupplierList.jsx**:
    - Use `DataTable` to list suppliers.
    - Search by supplier name.
    - Action buttons: Edit, Record Delivery.
- [x] **SupplierForm.jsx**:
    - Manage creation and editing of suppliers.
    - Fields: Name (unique), Contact Person, Phone, Email, Address.
- [x] **DeliveryForm.jsx**:
    - Form to record a delivery.
    - Fields: Supplier (dropdown), Product (dropdown - fetch from inventory), Qty Received (number), Unit Cost (number), Notes.
    - Shows success toast on completion and redirects back to Supplier List or Inventory.

---

### Step 6 — Environment Variables

*No new config values introduced in this ticket.*

---

### Step 7 — Docs & Status Update

- [x] Mark all completed tasks as `[x]` in `docs/features/project-status.md`
- [x] Update `docs/architecture/software-architecture.md` if any architecture decisions changed
- [x] Set this ticket's `status` to `🟢 Done` and populate the `completed` date

---

## Acceptance Criteria

- [x] All PHP files declare `strict_types=1` at the top.
- [x] All methods have explicit parameter types and return types.
- [x] Database transactions are used for delivery recording (delivery insert + stock update).
- [x] Supplier names are unique; attempts to create duplicates return 409 Conflict.
- [x] Every state-changing form includes a CSRF token; every POST handler verifies it.
- [x] Global toast notifications show success/error for all operations.
- [x] `docs/features/project-status.md` updated with completed task checkmarks.
