# SSR One AI — Enterprise Database Architecture

This directory houses the foundational database definitions, schema migrations, seeders, views, and stored functions for SSR One AI.

## Structure

* `schema/` — Canonical platform and business-table definitions.
* `migrations/` — Database migration scripts and references.
* `seed/` — Fixture and sample tenant/customer data only; keep tenant-specific examples here.
* `views/` — Database views for reporting and analytics.
* `functions/` — Stored procedures and database triggers.

## Guidance

- Keep customer or tenant-specific sample rows in `database/seed/` only.
- Do not bake customer names into package, folder, or platform code.
- Refer to the AI context docs in `.agents/02-architecture/MULTI_TENANCY.md` for multi-tenant and RLS guidance.
