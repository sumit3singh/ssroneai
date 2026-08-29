# AI Assistant Coding & Governance Rules

> **Last Reviewed**: August 2026

This document defines mandatory behavior for AI coding assistants working on **The ssrone**.

---

## 1. Core Operating Laws

1. **Read `AGENTS.md` First**: Always read `.agents/AGENTS.md` before making architectural decisions or writing new code.
2. **Never Create Duplicate Docs**: Search `.agents/` before creating documentation. Edit existing files instead of creating new ones.
3. **Zero Mock Data in Production Code**: PostgreSQL is the single source of truth. Never generate fallback arrays or demo records inside components.
4. **Enforce 5-Part Architecture**: Keep component files under 300 lines of code. Delegate layout to `dashboard`, `master`, `transaction`, `report`, `settings`.
5. **Service-Repository Pattern**: Put DB queries in `repository.py`, business logic in `services.py`, and endpoint routes in `router.py`. No raw SQL queries or direct DB commits inside `router.py`.
6. **Never Declare Work Done Prematurely**: Never claim a feature is complete until full backend unit/integration tests pass and runtime verification (ORM result unwrapping, exception handling, schema matching) is executed.
7. **PostgreSQL Single Source of Truth (SSOT)**: Never hardcode fallback `tenant_id` (e.g. `1` or `2`) or `branch_id` (`1`). Never swallow backend exceptions in `try/except` to return empty `[]` arrays silently.
8. **Frontend-Backend Module Parity**: Frontend and backend module directories MUST match 1-to-1. Orphaned backend modules (e.g., `cloud_kitchen`, `sweet_bakery`) that do not exist in frontend must be pruned or aligned.
9. **Strict ORM Result Resolution**: Always explicitly unwrap SQLAlchemy async execute results (e.g., `result.scalar_one_or_none()`) before referencing entity instances.
10. **Zero Workaround Patches**: When fixing bugs, fix the underlying service/repository contract instead of patching UI states or route endpoints with dummy fallbacks.
