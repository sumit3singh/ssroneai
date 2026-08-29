# Tier A Full Transactional Module Template

This directory serves as the canonical Tier A module blueprint for high-volume, transactional domain modules (POS, Hotel, Inventory, Finance, CRM, HR, PG Management).

## Blueprint Layout

- `domain/`: Pure domain entities and business usecases.
- `api/`: REST/GraphQL query and mutation functions.
- `mappers/`: DTO <-> Domain Entity converters.
- `store/`: Zustand/local state stores.
- `components/`: Presentational components.
- `pages/`: 5-part route layout (`dashboard`, `master`, `transaction`, `report`, `settings`).
- `permissions/`: Fine-grained RBAC action definitions and role policies.
