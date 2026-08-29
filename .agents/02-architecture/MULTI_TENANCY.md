# Multi-Tenancy Architecture & Row-Level Security (RLS)

> **Owner & Provider**: SSR IT Industry  
> **Product**: SSR One AI Platform  
> **Last Reviewed**: August 2026

> [!CAUTION]
> **CRITICAL SECURITY BOUNDARY**: Cross-tenant data leakage is catastrophic. Every database query and API handler MUST strictly enforce multi-tenant isolation.

---

## 1. Multi-Tenant Architecture Overview

**SSR One AI** implements two database deployment strategies configured via `apps/platform-admin`:

1. **Shared Database Strategy (Multi-Tenant RLS)**:
   - Standard pricing tier (e.g. ₹12,000/year/tenant).
   - Shared PostgreSQL instance where data is partitioned using `tenant_id`, `company_id`, and `branch_id`.
   - Data security is enforced via PostgreSQL Row-Level Security (RLS).
2. **Dedicated Database Strategy (Enterprise Tiers)**:
   - High-volume clients receive an isolated PostgreSQL database connection URI while running the identical application codebase.

---

## 2. Organizational Hierarchy & Data Scoping Rules

```
[SSR IT Industry SaaS Engine] (Platform Admin)
  └── [Tenant: Customer Company / Enterprise] (tenant_id)
        └── [Company Entity] (company_id)
              ├── [Branch / Outlet 1] (branch_id) (e.g. Baithak Cafe - CUH Mahendragarh)
              └── [Branch / Outlet 2] (branch_id) (e.g. Baithak Cafe - Gurugram)
```

### A. Branch-Level Scoped Data
- **Entities**: Menu Categories, Menu Items, Variations, Add-ons, KOTs, Orders, Billing Invoices, Dining Tables, KDS Stations, Room Inventories, Stock Levels, Shift Drawers, and Staff Logins.
- **Rule**: Queries MUST filter by `branch_id == active_branch_id`. Data under Branch A is invisible to Branch B.

### B. Tenant / Company-Level Scoped Data (Customer Master Exception)
- **Entities**: Customer Master (`Customer` model).
- **Rule**: Customers register at the **Tenant / Company level** (not tied to a single branch). A customer registered at Branch A can visit Branch B of the same tenant company, and their profile, credit balance, and loyalty points are shared across all outlets of that tenant.

### C. Admin ERP Governance Rules (`apps/admin-web`)
1. **Company & Branch Master**: In `admin-web -> Settings`, users can view Company and Branch info to edit details (Logo, Address, Contact, Tax GSTIN), but **CANNOT create or delete** Companies or Branches. Provisioning of new Companies or Branches is strictly controlled by `apps/platform-admin`.
2. **User & Employee Master**: To create a User login in `admin-web`, an Employee must **first be created** under a specific Branch in HRMS, then bound to a User account. User logins store `tenant_id`, `company_id`, and `branch_id`.

---

## 3. Core Database RLS Mechanics

1. **Mandatory Columns**: Every tenant-scoped database table MUST include indexed `tenant_id`, `company_id`, and `branch_id` columns.
2. **PostgreSQL RLS Enablement**:
   ```sql
   ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

   CREATE POLICY tenant_isolation_policy ON <table_name>
       FOR ALL
       USING (tenant_id = current_setting('app.current_tenant_id')::bigint);
   ```
3. **Session Context Injection**:
   In FastAPI middleware or database session initialization, the current tenant ID and branch ID MUST be set on the active session:
   ```python
   await db.execute(f"SET LOCAL app.current_tenant_id = '{tenant_id}'")
   await db.execute(f"SET LOCAL app.current_branch_id = '{branch_id}'")
   ```
