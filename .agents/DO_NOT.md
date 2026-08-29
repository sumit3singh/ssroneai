# Project Anti-Patterns & Critical Mistakes Inventory (DO NOT)

> **Project:** SSR One Enterprise Platform
> **Version:** 2.0
> **Last Reviewed:** August 2026
> **Priority:** CRITICAL (NON-NEGOTIABLE)

---

# Purpose

This document defines architectural anti-patterns, implementation mistakes, and forbidden development practices for the SSR One platform.

Every developer, AI assistant, reviewer, and contributor MUST follow these rules.

Violation of these rules means the implementation is NOT production-ready and MUST be rejected during code review.

---

# Core Engineering Principles

The following principles are absolute and cannot be violated.

1. PostgreSQL is the Single Source of Truth (SSOT).
2. Business logic belongs in the backend.
3. Router → Service → Repository → Database.
4. Metadata drives behaviour—not hardcoded code.
5. Configuration belongs in the database whenever possible.
6. Everything must support multi-tenancy.
7. Every feature must be scalable.
8. Every feature must be reusable.
9. Every feature must be testable.
10. No shortcuts for temporary development that reach production.

---

# 1. Database Rules

## ❌ DO NOT Store Business Rules in Frontend

Examples

- GST calculations
- Discount calculations
- Inventory logic
- Permission logic
- Approval logic

These belong only in backend services.

---

## ❌ DO NOT Use Frontend as Source of Truth

Forbidden

- React State
- Context
- Local Storage
- Session Storage
- Cookies

These are caches only.

Only PostgreSQL owns business data.

---

## ❌ DO NOT Hardcode IDs

Forbidden

```python
tenant_id = 1
company_id = 1
branch_id = 1
role_id = 1
```

Always retrieve IDs from the database.

---

## ❌ DO NOT Hardcode Master Data

Forbidden

- Countries
- States
- Cities
- Departments
- Units
- Tax Types
- GST Rates
- Voucher Types
- Payment Terms
- User Roles

These must come from PostgreSQL.

---

## ❌ DO NOT Store Permissions in Code

Forbidden

```python
if user.is_admin:
```

Use RBAC tables and permission engine.

---

## ❌ DO NOT Bypass Row-Level Security

Every tenant table MUST contain

- tenant_id

Every query must respect tenant isolation.

---

# 2. Backend Rules

## ❌ DO NOT Put SQL in Routers

Routers are controllers only.

Allowed

```
Request

↓

Validation

↓

Service

↓

Response
```

Forbidden

```
Router

↓

select()

↓

Business Logic

↓

Commit

↓

Response
```

---

## ❌ DO NOT Mix Responsibilities

Router

Only HTTP.

Service

Business Logic.

Repository

Database.

Model

Persistence.

---

## ❌ DO NOT Skip Repository Layer

Every database query must pass through repositories.

---

## ❌ DO NOT Create Fat Services

Services should orchestrate business logic.

Complex logic must be divided into domain services.

---

## ❌ DO NOT Return ORM Models

Always return DTOs / Response Models.

---

## ❌ DO NOT Perform Multiple Commits

Related operations must execute inside one transaction.

---

## ❌ DO NOT Perform Unwrapped ORM Queries (Missing `scalar_one_or_none()`)

Forbidden:

```python
result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
if not category:  # NameError! 'category' was never assigned from result
    raise HTTPException(status_code=404, detail="Category not found")
```

Always explicitly unwrap SQLAlchemy `Result` objects:

```python
result = await db.execute(select(MenuCategory).where(MenuCategory.id == category_id))
category = result.scalar_one_or_none()
if not category:
    raise HTTPException(status_code=404, detail="Category not found")
```

---

## ❌ DO NOT Swallow Database Exceptions and Return Empty Arrays

Forbidden:

```python
try:
    # DB query
except Exception as err:
    logger.error("Failed to list categories", error=str(err))
    return []  # Hides DB crash from UI, making system outages look like "no data"!
```

Always fail fast or return an explicit HTTP exception / structured error response so UI can distinguish errors from empty datasets.

---

## ❌ DO NOT Use Fallback Tenant or Branch IDs

Forbidden:

```python
tenant_id = user.tenant_id or 1
branch_id = user.branch_id or 1
```

Always raise an unauthorized/bad request error if context IDs are missing.

---

## ❌ DO NOT Execute DDL ALTER TABLE Migration Loops in Lifespan Startup

Forbidden:
```python
# Executing ALTER TABLE statements inside lifespan startup context managers
for stmt in alter_statements:
    await conn.execute(text(stmt))
```
Startup lifespan MUST ONLY execute declarative `await conn.run_sync(Base.metadata.create_all, checkfirst=True)`. DDL migration statements acquire exclusive table-level locks, starving connection pools and causing HTTP request timeouts.

---

## ❌ DO NOT Register Duplicate Endpoints or Omit Dependency Model Imports

Forbidden:
- Registering identical paths like `@router.get("/public/context")` twice in the same router module.
- Omitting imports for type annotations used in dependencies or handler signatures (e.g. `request: Request` or `current_user: User | None = Depends(...)` without importing `Request` or `User` from `fastapi` and model modules).

---

## ❌ DO NOT Instantiate ORM Models in Lifespan with Unimported Types or Invalid Field Names

Forbidden:
- Using `Decimal("...")` or date types inside `main.py` lifespan without explicit imports.
- Instantiating ORM models (e.g. `Employee`) with invalid keyword arguments (e.g. `first_name` instead of `full_name`).
This throws startup exceptions, breaking the backend connection and causing frontend login to fail with `Unable to load workspace from PostgreSQL: Network Error`.

---

## ❌ DO NOT Trust Client Input

Never trust

- User Role
- Device
- Browser
- Company
- Branch
- Permissions

Always verify from backend.

---

# 3. Frontend Rules

## ❌ DO NOT Inject Mock Data

If API returns nothing

Show

- Empty State

NOT

Demo Data

---

## ❌ DO NOT Duplicate Shared Components

Everything shared belongs inside

packages/

Never duplicate

- UI
- Types
- Hooks
- Utilities

---

## ❌ DO NOT Create Giant Components

Maximum

- 300 lines
- 15 KB

Split into reusable components.

---

## ❌ DO NOT Put Business Logic in React

Frontend performs presentation only.

---

## ❌ DO NOT Call Database Directly

Frontend always communicates through backend APIs.

---

## ❌ DO NOT Hardcode Labels

Everything configurable belongs in metadata.

---

## ❌ DO NOT Create Non-Interactive Forms Missing Enter Key Handlers

Forbidden:
- Wrapping input elements inside non-form `<div>` containers without `<form onSubmit={...}>`.
- Ignoring `Enter` key presses on physical, touch, or soft keyboards during form entry.
- All input forms MUST be wrapped in `<form onSubmit={...}>` with `type="submit"` buttons for instant `Enter` key execution.

---


# 4. Security Rules

## ❌ DO NOT Store Plain Passwords

Only password hashes.

---

## ❌ DO NOT Store Tokens in Local Storage

Use secure HTTP-only cookies where applicable.

---

## ❌ DO NOT Expose Internal Errors

Never expose

- SQL
- Stack traces
- Database messages

---

## ❌ DO NOT Trust JWT Alone

Validate

- Session
- User Status
- Tenant
- Company
- Permissions

---

## ❌ DO NOT Keep Development Endpoints

Forbidden

- truncate
- seed
- reset
- dev-only APIs

in production.

---

## ❌ DO NOT Break Admin-Web Auth Flow or Alter Tested Login Logic

Forbidden:
- Modifying `LoginPage.tsx`, token persistence, or dynamic context initialization without full regression testing.
- Swallowing auth errors or injecting unverified context state that breaks the `admin-web` single sign-on experience.
- Breaking JWT header passing (`X-Tenant-ID`, `X-Company-ID`, `X-Branch-ID`) in API client interceptors.

---


# 5. Architecture Rules

## ❌ DO NOT Break Module Structure

Every module

```
Dashboard

Master

Transaction

Report

Settings
```

---

## ❌ DO NOT Create Circular Dependencies

Packages must remain independent.

---

## ❌ DO NOT Duplicate Business Logic

One implementation.

One owner.

---

## ❌ DO NOT Ignore ADR Decisions

Every architectural decision must follow approved ADRs.

---

## ❌ DO NOT Create Duplicate Documentation

One topic.

One document.

---

# 6. AI Development Rules

## ❌ DO NOT Assume

Ask or retrieve.

Never invent.

---

## ❌ DO NOT Ignore Existing Code

Always extend existing architecture.

---

## ❌ DO NOT Create New Pattern When One Exists

Reuse.

Don't reinvent.

---

## ❌ DO NOT Generate Temporary Code

No

TODO

FIXME

TEMP

HACK

Placeholder

Dummy implementation

---

## ❌ DO NOT Leave Empty Directories

Every folder should either

- contain production code

or

- not exist.

---

# 7. Performance Rules

## ❌ DO NOT Create N+1 Queries

Optimize database access.

---

## ❌ DO NOT Fetch Entire Tables

Always paginate.

---

## ❌ DO NOT Perform Heavy Computation in UI

Backend performs calculations.

---

## ❌ DO NOT Block Async Operations

Use async correctly.

---

# 8. Documentation Rules

## ❌ DO NOT Write Code Without Updating Documentation

Architecture changes require documentation updates.

---

## ❌ DO NOT Change Standards Without ADR

Architecture changes require ADR approval.

---

# Definition of Failure

Implementation automatically FAILS if ANY of the following exist:

- SQL inside routers
- Hardcoded IDs
- Hardcoded permissions
- Mock production data
- Duplicate shared components
- Duplicate business logic
- Business logic inside frontend
- Missing tenant isolation
- Missing transaction boundaries
- Missing repository layer
- Development endpoints in production
- ORM models exposed to API
- Components larger than project limits
- Duplicate documentation
- Metadata bypassed with hardcoded values
- Violation of approved ADRs

---

# Final Principle

**If a solution works but violates architecture, it is considered incorrect.**

**Architecture, scalability, maintainability, security, and consistency always take priority over quick implementation.**