# Althea's Aquatic

Decoupled full-stack e-commerce web application for selling aquatic species, fish, shrimp, snails, and aquatic plants.

## Features

- **Storefront**: Browse products, filter by category, manage cart, and secure checkout.
- **Admin Inventory**: Product CRUD, image uploads, stock thresholds, and soft deletes.
- **Supplier Management**: Supplier directory and delivery recording with auto-stock updates.
- **Reporting**: Sales summaries, inventory status reports, and CSV exports.
- **Security**: CSRF protection, secure session management, and role-based access control.

## Technology Stack

- **Backend**: PHP 8.x, PDO (MySQL), REST API architecture.
- **Frontend**: React 18, Vite, Tailwind CSS v3.
- **Database**: MySQL 8.x.

## Local Development Setup

### 1. Prerequisites
- PHP 8.x
- MySQL 8.x
- Node.js (Latest LTS)
- Composer (Optional, if adding third-party PHP libs later)

### 2. Database Setup
1. Create a MySQL database named `altheas_aquatic`.
2. Import the schema: `mysql -u root -p altheas_aquatic < database/schema.sql`.
3. Import the seed data: `mysql -u root -p altheas_aquatic < database/seed.sql`.

### 3. Backend Configuration
1. Copy `config/.env.example` to `config/.env`.
2. Update the database credentials and `APP_URL`.
3. Serve the backend (e.g., `php -S localhost:8000 -t public`).

### 4. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### 5. Production Build
- `cd frontend && npm run build`
- Point your web server (Apache/NGINX) to the project root. The `.htaccess` will handle routing.

## License
MIT
