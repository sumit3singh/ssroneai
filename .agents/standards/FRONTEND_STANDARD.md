# BAITHAK ERP – Frontend Architecture Standard (FRONTEND_STANDARD.md)

## Directory Structure (`apps/admin-web/src/`)
- `app/`: Application bootstrap, routing, providers, and layout shells.
- `assets/`: Shared icons, images, fonts, and illustrations.
- `modules/`: Business operating modules (`pos`, `restaurant`, `inventory`, `finance`, `crm`, `hotel`, `hr`, `billing`).
- `platform/`: Platform administration engine (`tenants`, `companies`, `branches`, `licensing`).
- `shared/`: Shared design system primitives, metadata navigation registry, and API clients.
- `theme/`: Global theme tokens & tailwind styles.

## UX & Layout Rules
- Center workspace is strictly reserved for business operations.
- Zero duplicate tabs or navigation inside page content.
