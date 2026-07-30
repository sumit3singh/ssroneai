# The Baithak — Database Constitution
**Version:** 1.0  
**Status:** Approved  

---

## 1. SQL Injection Prevention
- **Rule**: Raw string interpolation inside database statements is strictly prohibited.
- **Implementation**: Use SQLAlchemy parameters or parameterized raw queries:
  `await db.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})`

---

## 2. Row-Level Security (RLS) Policy
- All tables representing tenant data must include a `tenant_id` column.
- Row-Level security must be configured at the database layer (for production environments) to isolate tenant data automatically, preventing cross-tenant leakage.

---

## 3. Migration and Schema Alterations
- **Tool**: Alembic migrations only.
- **Rule**: Manual database alterations (e.g. executing `ALTER TABLE` manually on production instances) are strictly forbidden. All alterations must be recorded in migration scripts.

---

## 4. Audit & Trigger Policies
- Any critical tables (financial ledgers, orders, user accounts) must utilize an audit trigger. The database must record updates and records of previous values for governance audits.
- Column `updated_at` must be automatically updated via database triggers on row modification.
