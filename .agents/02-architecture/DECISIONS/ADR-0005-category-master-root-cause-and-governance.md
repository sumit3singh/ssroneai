# ADR-0005: Category Master Fix, Single Source of Truth, and Module Alignment Governance

> **Status:** APPROVED & MANDATORY  
> **Date:** August 2026  
> **Authors:** Chief Software Architect & AI Assistant  
> **Applies To:** All Modules (Frontend & Backend)

---

## 1. Context & Executive Summary

During the development of the **POS Menu Categories Master** (`apps/admin-web/src/modules/pos/pages/master/categories/CategoryListPage.tsx`), a runtime crash occurred on the backend delete category operation (`delete_category`), returning a `NameError: name 'category' is not defined`.

The user personally diagnosed and resolved the runtime issue, while also conducting an architectural audit of `services/backend/src/modules/restaurant/router.py`.

The audit revealed several severe architectural violations across the backend codebase:
1. **Unwrapped ORM Queries:** Executing SQLAlchemy queries without unwrapping results via `scalar_one_or_none()`, leading to runtime `NameError` crashes.
2. **Inconsistent Tenant & Branch Isolation:** Endpoints allowing hardcoded fallback IDs (`tenant_id = 1, 2` or `branch_id = 1`) instead of enforcing strict multi-tenancy boundaries.
3. **Silent DB Error Swallowing:** Wrapping DB queries in `try ... except` blocks and returning `[]` empty lists on exception, hiding server errors and making system outages appear as "empty datasets".
4. **Router Layer Architectural Drift:** Routers performing raw SQL queries, transaction management, and business logic directly inside controller handlers instead of delegating to `Service` and `Repository` layers.
5. **Frontend-Backend Module Desynchronization:** Backend modules containing dead/orphaned code (e.g. `services/backend/src/modules/cloud_kitchen` and `sweet_bakery`) despite frontend modules having deleted or consolidated them.

---

## 2. Root Cause Analysis

### A. The Category Delete Runtime Bug
In `router.py`, the code attempted to reference `category` immediately after `await db.execute(...)` without un-wrapping the `Result` object:
```python
# ❌ BROKEN PATTERN
result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
if not category:  # NameError: name 'category' is not defined!
    raise HTTPException(status_code=404, detail="Category not found")
```

### B. Corrected Pattern Applied
```python
# ✅ CORRECT PATTERN
result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
category = result.scalar_one_or_none()
if not category:
    raise HTTPException(status_code=404, detail="Category not found")

category.is_deleted = True
if hasattr(category, "updated_by") and current_user:
    category.updated_by = current_user.id
await db.commit()
```

---

## 3. Mandatory Governance Laws Going Forward

### Law 1: PostgreSQL is the Single Source of Truth (SSOT)
- **Zero Mock Fallbacks:** Neither frontend components nor backend services may invent fallback data, hardcode fallback tenant IDs (`tenant_id = 1`), or return dummy arrays on error.
- **Fail Fast Error Propagation:** If a database query fails, the backend MUST log the exception and return a proper HTTP 500 / 404 response. Returning empty lists `[]` on error is STRICTLY FORBIDDEN.

### Law 2: Strict Service-Repository Pattern
- Routers (`router.py`) MUST NOT execute raw SQL queries (`select()`, `insert()`, `update()`) or manage transactions (`db.commit()`).
- Flow MUST be: **Router → Service → Repository → Database**.

### Law 3: Mandatory Runtime & ORM Verification
- Before declaring ANY backend task complete:
  1. Verify every SQLAlchemy `Result` is unwrapped (`scalar_one_or_none()`, `scalars().all()`).
  2. Execute unit tests (`pytest`).
  3. Verify HTTP responses deliver valid JSON schemas matching frontend expectations.

### Law 4: 1-to-1 Frontend/Backend Module Parity & Cleanup
- Backend module folder names in `services/backend/src/modules/` MUST match frontend modules 1-to-1.
- Dead/unused backend modules (such as `cloud_kitchen` and `sweet_bakery`) MUST be audited and removed or realigned with the canonical enterprise architecture.

---

## 4. Sign-Off & Commitment

This ADR is registered as permanent operating instructions. All future task execution by AI assistants will be held strictly accountable to these rules.
