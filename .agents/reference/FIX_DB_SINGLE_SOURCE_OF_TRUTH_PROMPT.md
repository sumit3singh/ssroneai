# Fix Single Source of Truth Violations

## Objective

Fix the project so the database is the only source of truth for data used by the apps. Remove or replace all hardcoded menu/catalog data, localStorage mock data, and fallback mock data that bypasses real DB/API state.

## Scope

This work applies to the following areas:

- `apps/customer-food-web`
- `apps/staff-web`
- `apps/admin-web`
- `apps/kds-web`
- `apps/mobile-app`
- `apps/customer-stay-web`
- `backend/scripts`

## What must be fixed

### 1. Remove hardcoded frontend mock menu/catalog data

- `apps/customer-food-web/src/data/mockMenu.ts`
  - Do not use this file as a data source for menu categories, menu items, prices, tags, variants, addons, descriptions, or images.
- Any component or service that imports `mockMenu.ts` must be rewritten to use API/DB-driven data instead.

### 2. Replace localStorage product/branch state and branch hardcodes

- `apps/customer-food-web/src/pages/Menu.tsx`
  - Remove fallback from `localStorage.baithak_products` and unit code filtering based on hardcoded `CUH02`/`GGN01`.
- `apps/customer-food-web/src/pages/Welcome.tsx`
  - Remove the branch selector hardcodes and branch unit localStorage state.

### 3. Eliminate local fallback orders/invoices in customer food app

- `apps/customer-food-web/src/services/api.ts`
  - Remove localStorage fallback writes and reads for `baithak_orders`, `baithak_invoices`, and `baithak_status_*`.
  - Remove hardcoded local HTTP endpoints for guest customer and guest order paths.
  - Ensure `fetchMenuItems`, `fetchCategories`, `placeOrder`, and order status functions rely on backend APIs/DB only.

### 4. Remove frontend mock database fallback in admin web

- `apps/admin-web/src/shared/utils/mock-db.ts`
  - Remove or disable hardcoded `SEED_FILE_MASTER_ERP` fallback data and branch/product mock catalog.
- `apps/admin-web/src/shared/layout/AppShell.tsx`
  - Remove fallback to `mockDB.get("file_master_erp")` and use backend menu config API results only.

### 5. Remove localStorage demo seed reliance in staff app

- `apps/staff-web/src/utils/seedData.ts`
  - Remove the demo product/table/ order/invoice seeding logic used as app data.
- `apps/staff-web/src/App.tsx`
  - Stop loading products and tables from localStorage.
  - Eliminate writing orders and invoices to localStorage for normal workflows.
- `apps/staff-web/src/components/SeedManager.tsx`
  - Remove or disable this UI if it is no longer part of the supported single-source-of-truth workflow.
- `apps/staff-web/src/utils/seedEmployees.ts`
  - Remove localStorage employee seed fallback.

### 6. Stop using localStorage as the primary data store in support apps

- `apps/kds-web/src/App.tsx`
  - Remove `baithak_orders` localStorage order state and make KDS consume live order data only.
- `apps/mobile-app/src/App.tsx`
  - Remove localStorage reads for `baithak_customers` and `baithak_orders`.
  - Do not hardcode QR or order links to `localhost:8080`.
- `apps/customer-stay-web/src/components/Rooms.tsx`
  - Replace hardcoded `rooms` array and localStorage reservation persistence with backend-driven room/reservation data.

### 7. Remove backend-to-frontend hardcoded seed duplication

- `backend/scripts/seed_menu.py`
  - Do not treat this file as the canonical app runtime data source for menus and branches.
  - Keep it only as a database seed script, if needed for initial DB setup.
- `backend/scripts/update_mock_db.py`
  - Remove the generation of `apps/admin-web/src/shared/utils/mock-db.ts` from seed data.
  - Do not duplicate DB seed data into frontend mock code.

### 8. Fix environment URL fallbacks

- `apps/admin-web/vite.config.ts`
  - Replace hardcoded proxy target `http://localhost:8000` with environment-driven config only.
- `apps/staff-web/src/shared/api-client.ts`
  - Remove fallback to `http://localhost:8000/api/v1`.
- `apps/customer-food-web/src/services/api.ts`
  - Remove hardcoded local guest endpoint URLs.

## Acceptance criteria

- No app should use `mockMenu.ts` as a data source for active menu content.
- No app should use hardcoded `CUH02` / `GGN01` branch logic for product selection or branch selection controls.
- No data-critical workflow can succeed by writing to or reading from `localStorage` mock keys such as `baithak_orders`, `baithak_products`, `baithak_tables`, `baithak_customers`, or `baithak_reservations`.
- `apps/admin-web` must fetch and render ERP menu configuration from backend APIs only.
- `apps/kds-web` must consume live order data from backend API or WebSocket rather than localStorage snapshots.
- `apps/mobile-app` and `apps/customer-stay-web` must be updated to use backend data for customers, orders, reservations, and rooms.
- No script should regenerate frontend mock DB files from backend seed data.

## Notes for the developer

- Keep backend seed scripts for DB bootstrap only; they should not create alternative frontend runtime truth.
- If a data fallback is still needed for offline/demo mode, isolate it behind a clear offline layer and do not let it replace live DB truth in normal app flows.
- The goal is to enforce one canonical source of truth: the database and backend API layer.

## Deliverable

Provide a PR that removes or replaces all hardcoded/mock data flows listed above and documents any remaining acceptable offline/demo fallback behavior separately.