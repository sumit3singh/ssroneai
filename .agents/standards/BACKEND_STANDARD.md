# BAITHAK ERP – Backend Architecture Standard (BACKEND_STANDARD.md)

## Layered Backend Architecture
`FastAPI Routers` → `Application Services` → `Domain Services` → `Repositories` → `PostgreSQL Database`.

## Rules
- All database mutations must use transactions (`async with db.begin()`).
- All endpoints require authentication, tenant scoping, and RBAC permission checks.
- Zero mock data or fallback records in production.
