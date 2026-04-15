---
id: 2026-04-15-01-urgent-user-signup
title: "User Create Account / Sign Up"
type: feature
priority: 🔴 Urgent
status: 🟢 Done
phase: 1
created: 2026-04-15
completed: 2026-04-15
---

## Context

> This ticket implements the **Customer Registration (Sign-Up)** functionality as part of Phase 1.
> It allows new customers to create an account by providing a username and password.
> This is a prerequisite for a personalized storefront experience and persistent cart/order history.

---

## Scope

This ticket implements the following paired unit of work:

| Layer | What is being built |
| :--- | :--- |
| **Database** | No schema changes; using existing `users` table |
| **Model** | `UserModel::create(array $data): int` to insert new customer users |
| **Controller** | `AuthController::register()` to handle account creation POST requests |
| **API Wrapper** | `frontend/src/api/auth.js` — add `register(data)` |
| **React Components** | `Register.jsx` — Registration page with form and validation |

---

## Dependencies

*No dependencies — this ticket can be started immediately.*

---

## AI Agent Instructions

> ⚠️ Follow Rule 18 in `AGENTS.md`: always implement the Model, Controller, AND React components together.
> Complete each Step fully before moving to the next. Never skip steps or leave stubs.

---

### Step 1 — Database (`database/`)

*No schema changes in this ticket. The `users` table already supports the `customer` role.*

---

### Step 2 — Model (`app/Models/UserModel.php`)

- [x] Add `create(array $data): int`:
    - Hashes password using `password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])`.
    - Inserts user with `role = 'customer'`.
    - Returns the new user ID.
    - Handles `PDOException` for duplicate usernames (SQLSTATE 23000) by throwing or returning a specific error.

---

### Step 3 — Controller (`app/Controllers/AuthController.php`)

- [x] Add `register()`:
    - CSRF-protected POST handler.
    - Validates username and password are not empty.
    - Calls `UserModel::create()`.
    - Returns JSON success message (201 Created) or error (400 if missing data, 409 if duplicate username).

---

### Step 4 — API Wrapper (`frontend/src/api/auth.js`)

- [x] Add `register(data)` function to call the register endpoint.

---

### Step 5 — React Components & Pages (`frontend/src/pages/storefront/`)

- [x] **Register.jsx**:
    - Functional component with username, password, and confirm password fields.
    - Basic client-side validation (fields match, minimum length).
    - Success toast on creation and redirect to Login page.
- [x] **App.jsx**:
    - Register the `/register` route in the storefront section.

---

### Step 6 — Docs & Status Update

- [x] Mark all completed tasks as `[x]` in `docs/features/project-status.md`.
- [x] Set this ticket's `status` to `🟢 Done` and populate the `completed` date.

---

## Acceptance Criteria

- [x] All PHP files declare `strict_types=1` at the top.
- [x] All methods have explicit parameter types and return types.
- [x] Passwords are never stored in plaintext (Rule 5 in `AGENTS.md`).
- [x] Every state-changing form includes a CSRF token; every POST handler verifies it.
- [x] Duplicate usernames return a `409 Conflict` response with a clear error message.
- [x] Global toast notifications show success/error for account creation.
- [x] `docs/features/project-status.md` updated with completed task checkmarks.
