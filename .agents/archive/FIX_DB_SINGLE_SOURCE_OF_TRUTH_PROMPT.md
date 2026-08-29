# Fix Single Source of Truth Violations (Archived Prompt)

> **Last Reviewed**: August 2026

## Objective
Fix the project so the database is the only source of truth for data used by the apps. Remove or replace all hardcoded menu/catalog data, localStorage mock data, and fallback mock data that bypasses real DB/API state.

## Scope
- `apps/customer-food-web`
- `apps/staff-web`
- `apps/admin-web`
- `apps/kds-web`
- `apps/mobile-app`
- `apps/customer-stay-web`

## What must be fixed
1. Remove hardcoded frontend mock menu/catalog data (`mockMenu.ts`).
2. Replace localStorage product/branch state and branch hardcodes.
3. Eliminate local fallback orders/invoices in customer food app.
4. Remove frontend mock database fallback in admin web (`mock-db.ts`).
5. Remove localStorage demo seed reliance in staff app.
6. Stop using localStorage as the primary data store in support apps.
7. Remove backend-to-frontend hardcoded seed duplication.
8. Fix environment URL fallbacks.
