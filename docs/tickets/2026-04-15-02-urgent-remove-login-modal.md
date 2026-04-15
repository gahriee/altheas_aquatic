---
id: 2026-04-15-02-urgent-remove-login-modal
title: "Remove Login Modal"
type: infrastructure
priority: 🔴 Urgent
status: 🟢 Done
phase: 1
created: 2026-04-15
completed: 2026-04-15
---

## Context

> This ticket implements the removal of the `LoginModal` component in favor of the dedicated `/login` and `/register` storefront pages.
> This simplifies the authentication flow and ensures a consistent user experience.
> Reference the updated `docs/architecture/software-architecture.md`.

---

## Scope

This ticket implements the following paired unit of work:

| Layer | What is being built |
| :--- | :--- |
| **Database** | N/A |
| **Model** | N/A |
| **Controller** | N/A |
| **API Wrapper** | N/A |
| **React Components** | [DELETE] `LoginModal.jsx`; [MODIFY] `StorefrontLayout.jsx`, `Navbar.jsx`, `ProductCard.jsx`, `AuthContext.jsx`, `Login.jsx` |

---

## Dependencies

- [x] [2026-04-15-01-urgent-user-signup.md](file:///c:/xampp/htdocs/althea/docs/tickets/2026-04-15-01-urgent-user-signup.md) (Registration and Login pages must exist).

---

## AI Agent Instructions

> ⚠️ Follow Rule 18 in `AGENTS.md`: always implement the Model, Controller, AND React components together.
> Since this is a deletion/cleanup ticket, focus on ensuring all call sites are updated to point to the new Login page.

---

### Step 1 — AuthContext Clean-up (`frontend/src/context/AuthContext.jsx`)

- [x] Remove `isLoginModalOpen` state.
- [x] Remove `openLoginModal` and `closeLoginModal` handlers.
- [x] Ensure `pendingAction` state remains so the `Login` page can consume it.

---

### Step 2 — Call Site Updates (`frontend/src/components/storefront/`)

- [x] **Navbar.jsx**: Update the Login button to use `navigate('/login')` instead of `openLoginModal()`.
- [x] **ProductCard.jsx**: Update `handleAddToCart` to save the `pendingAction` in `AuthContext` and then `navigate('/login')`.
- [x] **ProductDetail.jsx**: (If exists) Similar update to `handleAddToCart`.

---

### Step 3 — Login Page Logic Update (`frontend/src/pages/storefront/Login.jsx`)

- [x] Update the `handleSubmit` or `useEffect` to check for `pendingAction` in `AuthContext` after a successful login and execute it (e.g., add item to cart).

---

### Step 4 — Component Deletion

- [x] Remove `<LoginModal />` from `frontend/src/components/storefront/StorefrontLayout.jsx`.
- [x] Delete `frontend/src/components/shared/LoginModal.jsx`.

---

### Step 5 — Docs & Status Update

- [x] Mark all completed tasks as `[x]` in `docs/features/project-status.md`.
- [x] Set this ticket's `status` to `🟢 Done` and populate the `completed` date.

---

## Acceptance Criteria

- [x] `LoginModal.jsx` is deleted.
- [x] No references to `openLoginModal` remain in the codebase.
- [x] Guests clicking "Add to Cart" or "Login" are correctly redirected to `/login`.
- [x] Post-login actions (like adding to cart) still work after redirecting via the dedicated Login page.
- [x] `docs/features/project-status.md` updated.
