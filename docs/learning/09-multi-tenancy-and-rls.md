# Lesson 09: Multi-Tenant Architecture & PostgreSQL Row-Level Security (RLS)
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 06: SQLAlchemy 2.0 AsyncIO](file:///e:/2026/ssr_one_ai/docs/learning/06-sqlalchemy-async-orm.md), [Lesson 07: PostgreSQL 16 & Neon](file:///e:/2026/ssr_one_ai/docs/learning/07-postgresql-and-neon.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**Multi-Tenancy** is an architectural pattern where a single instance of a software application serves multiple independent client businesses (called **tenants**), while ensuring that no tenant can ever see, modify, or steal another tenant's data. **PostgreSQL Row-Level Security (RLS)** is a database kernel-level security feature where PostgreSQL itself automatically filters out any rows that do not belong to the currently logged-in tenant, even if a developer forgets to write `WHERE tenant_id = ...` in their SQL query.

### Real-Life Analogy
Imagine a luxury office skyscraper:
* **The Insecure Way (Application-Only Filtering)**: Every company shares one giant open room with no walls. A receptionist promises to only hand Company A their mail. But if the receptionist gets tired or distracted, Company B can easily walk over, read Company A's payroll, and steal their client list.
* **The RLS Way (Kernel-Enforced Security)**: The skyscraper has biometric fingerprint scanners on every single office door, elevator, and filing cabinet. When an employee from Company A swipes their badge, the elevator physically cannot go to Company B's floor. The laws of physics prevent cross-company access.

In SSR One AI, even if an intern writes `SELECT * FROM orders` without any `WHERE` clause, PostgreSQL's RLS engine steps in at the database kernel level and returns **only** the orders belonging to that specific restaurant tenant.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
In a multi-tenant SaaS serving hundreds of cafes, bakeries, and hotel chains:
1. **The Human Mistake Shield**: In a codebase with 200+ endpoints, a developer will eventually forget to add `.where(Order.tenant_id == active_tenant_id)`. With PostgreSQL RLS, that mistake cannot cause a data leak. The database kernel enforces isolation automatically.
2. **Cost-Effective Shared Database Architecture**: Creating a dedicated cloud database for a small bakery paying ₹1,000/month would cost us more in hosting fees than the subscription earns. A shared database with RLS allows 1,000 small tenants to share one PostgreSQL database safely.
3. **Dedicated Enterprise Database Support**: For high-paying enterprise luxury hotel chains who legally require their own private database, our [DynamicDatabaseManager](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py#L77) transparently routes their requests to a dedicated PostgreSQL connection URI using the identical application code!

### The 3 Multi-Tenancy Models Compared:

| Tenancy Model | How It Works | Cost | Security Guarantee | Maintenance |
| :--- | :--- | :--- | :--- | :--- |
| **1. Separate Database** | 1 Database per Tenant | 🔴 High (1000 DBs = high cloud bill) | 🟢 Maximum | 🔴 Complex (1000 migrations to run) |
| **2. Separate Schema** | 1 Schema (`CREATE SCHEMA`) per Tenant | 🟡 Medium | 🟡 Moderate | 🔴 Slow migrations & schema limits |
| **3. Shared Schema + RLS (Our Primary Strategy)** | Shared tables with `tenant_id` + Postgres RLS | 🟢 Lowest (Cost-effective) | 🟢 Enterprise Grade (Kernel enforced) | 🟢 1 single Alembic migration updates everyone |

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: The 3-Tier Organizational Hierarchy
SSR One AI uses a strict 3-tier organizational model:

```
[SSR IT Industry SaaS Engine] (Platform Superadmin)
  └── [Tenant: e.g. Baithak Hospitality Group] (tenant_id)
        └── [Company Entity: Baithak Cafe Pvt Ltd] (company_id)
              ├── [Branch / Outlet 1: CUH Mahendragarh] (branch_id)
              └── [Branch / Outlet 2: Gurugram CyberHub] (branch_id)
```

1. **`tenant_id`**: The billing entity and legal owner of the account.
2. **`company_id`**: The corporate business entity (holds GSTIN, registered corporate address).
3. **`branch_id`**: The physical physical outlet or store location where POS billing occurs.

### Concept B: Branch-Scoped vs Tenant-Scoped Data
* **Branch-Scoped Data**:
  - Menu Items, Daily KOTs, POS Bills, Dining Tables, KDS Kitchen Screens, Room Inventories, Staff Shifts, and Cash Drawers.
  - *Rule*: Branch A can **never** see Branch B's orders or tables!
* **Tenant-Scoped Exception (The Customer Master Law)**:
  - In [MULTI_TENANCY.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/MULTI_TENANCY.md#L39-L42), `Customer` records belong to the **Tenant**, not a single branch!
  - *Why*: If a guest registers their phone number and earns ₹200 in loyalty points at the Mahendragarh branch, when they visit the Gurugram branch next week, their profile, credit balance, and loyalty points are instantly available!

### Concept C: PostgreSQL Session Context Variables
PostgreSQL has a built-in session memory store:
```sql
SELECT set_config('app.current_tenant_id', '42', false);
```
Once this query runs, any subsequent query on that connection can read `current_setting('app.current_tenant_id')`.

---

## 4. Syntax & Database Mechanics Breakdown

### 1. Enabling RLS on a Table
In PostgreSQL DDL:
```sql
-- Step 1: Enable RLS on the table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 2: Force RLS even for table owners (prevents accidental bypass)
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- Step 3: Define the security policy
CREATE POLICY tenant_isolation_policy ON public.orders
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    );
```

#### Policy Clauses Explained:
* `USING (...)`: Applied to `SELECT`, `UPDATE`, and `DELETE`. Specifies which existing rows the tenant is allowed to see or touch.
* `WITH CHECK (...)`: Applied to `INSERT` and `UPDATE`. Prevents a tenant from maliciously inserting a row with someone else's `tenant_id`!
* `current_setting('app.current_tenant_id', true)`: The second argument `true` is critical—it tells PostgreSQL: *"If this variable is not set, return `NULL` instead of crashing with an error"*.

---

## 5. How It Is Used in OUR Project (Real Code & Request Flow)

Let's trace how a request from a browser flows into our RLS engine:

```mermaid
sequenceDiagram
    autonumber
    actor User as Cashier Browser
    participant APIClient as @ssrone/api-client
    participant FastAPIDep as Auth Dependency
    participant Engine as Database Engine
    participant Postgres as PostgreSQL Kernel

    User->>APIClient: Clicks "Load Active Orders"
    APIClient->>FastAPIDep: GET /api/v1/orders (Header: X-Tenant-Slug: baithak-cafe)
    FastAPIDep->>FastAPIDep: Decodes JWT Token -> tenant_id: 12
    FastAPIDep->>Engine: Calls set_rls_context(session, tenant_id=12)
    Engine->>Postgres: SELECT set_config('app.current_tenant_id', '12', false)
    Note over Postgres: RLS context locked to Tenant #12
    FastAPIDep->>Engine: Executes select(Order)
    Postgres-->>User: Returns ONLY Tenant #12's orders!
```

### 1. Frontend Header Injection: [packages/api-client/src/index.ts](file:///e:/2026/ssr_one_ai/packages/api-client/src/index.ts#L44-L65)
The API client attaches the tenant slug and active branch to every HTTP request automatically via Axios interceptors:
```typescript
api.interceptors.request.use((config) => {
  const tenantSlug = getTenantSlug();
  const branchId = getBranchId();

  if (tenantSlug) {
    config.headers["X-Tenant-Slug"] = tenantSlug;
  }
  if (branchId) {
    config.headers["X-Branch-Id"] = branchId;
  }
  return config;
});
```

### 2. Backend Context Injection: [services/backend/src/core/database/engine.py](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py#L138-L159)
Before your route handler executes, our backend injects the tenant ID directly into the PostgreSQL connection:
```python
async def set_rls_context(
    session: AsyncSession,
    tenant_id: str,
    user_id: str | None = None,
    is_superadmin: bool = False
) -> None:
    """Sets PostgreSQL Row-Level Security (RLS) session variables in a single network roundtrip."""
    stmts = ["set_config('app.current_tenant_id', :tenant_id, false)"]
    params: dict[str, Any] = {"tenant_id": str(tenant_id)}
    if user_id:
        stmts.append("set_config('app.current_user_id', :user_id, false)")
        params["user_id"] = str(user_id)
    if is_superadmin:
        stmts.append("set_config('app.is_superadmin', 'true', false)")
    
    await session.execute(
        text(f"SELECT {', '.join(stmts)}"),
        params
    )
```

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Connection Pool Context Leakage (PgBouncer)
* **What happens**: Request A belongs to Tenant 1. It sets `app.current_tenant_id = 1`. Request A finishes. The database connection goes back to the pool. Request B arrives for Tenant 2. If Request B fails to overwrite `app.current_tenant_id`, Request B would see Tenant 1's data!
* **Our Architectural Protection**:
  1. Look at [services/backend/src/modules/auth/dependencies.py](file:///e:/2026/ssr_one_ai/services/backend/src/modules/auth/dependencies.py#L53): Every single request immediately calls `set_rls_context()` with its own verified JWT `tenant_id`.
  2. When the session closes, PgBouncer's `DISCARD ALL` resets all session variables automatically.

### Mistake 2: Missing RLS on Newly Created Tables
* **What happens**: A developer creates a new table `loyalty_rewards` using Alembic, but forgets to execute `ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;`.
* **The Danger**: By default in PostgreSQL, tables have RLS **disabled**. Without RLS enabled, any query returns data across all tenants!
* **The Rule**: Our [05-quality/CURRENT_STATE_SAFEGUARD.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/CURRENT_STATE_SAFEGUARD.md) checklist mandates that every new table migration must explicitly enable RLS and attach `tenant_isolation_policy`.

### Mistake 3: Superadmin Context in POS Endpoints
* **What happens**: Setting `is_superadmin = True` on a cashier's POS terminal query causes the POS terminal to load orders from 50 different cafes at once!
* **The Fix**: `is_superadmin = True` is restricted exclusively to `apps/platform-admin` routes. Regular POS routes **must always** be locked to a specific `tenant_id` and `branch_id`.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Always Index `tenant_id` and `branch_id` Together**:
   PostgreSQL evaluates RLS policies on every row. Without an index on `(tenant_id, branch_id)`, queries will cause full table sequential scans. Always create a composite index:
   ```sql
   CREATE INDEX ix_orders_tenant_branch ON orders (tenant_id, branch_id);
   ```
2. **Never Trust Frontend Headers Without Verification**:
   The frontend sends `X-Tenant-Slug: baithak-cafe`. The backend **must verify** that the authenticated user's JWT token actually has permission to access that tenant before setting the RLS context!
3. **Keep `Customer` Tenant-Level**:
   Never scope the customer master table to `branch_id`. Customers belong to the brand (tenant), allowing loyalty rewards to be redeemed at any franchise location.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Write the PostgreSQL SQL statement to enable Row-Level Security on a newly created table called `room_bookings`.

### Exercise 2 (Medium):
Write the complete PostgreSQL `CREATE POLICY` statement for `room_bookings` that restricts access to the tenant defined in `app.current_tenant_id`, while allowing Superadmins (`app.is_superadmin = 'true'`) to view all bookings.

### Exercise 3 (Hard):
Inspect [services/backend/src/core/database/engine.py](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py#L77-L108). Trace how `DynamicDatabaseManager` handles an enterprise customer who supplies their own dedicated AWS RDS connection string (`postgresql://enterprise_admin:secret@hotel-db.internal:5432/hotel_db`).

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```sql
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings FORCE ROW LEVEL SECURITY;
```

#### Solution 2:
```sql
CREATE POLICY tenant_isolation_room_bookings ON public.room_bookings
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    );
```

#### Solution 3:
1. In `engine.py`, when `db_manager.get_session(connection_url)` is called:
2. It checks `if connection_url not in self._sessionmakers:`.
3. If this is the first request for this enterprise tenant, it acquires an `asyncio.Lock()`, calls `create_engine(url=connection_url)`, and creates a dedicated `async_sessionmaker`.
4. It caches the custom engine in `self._engines` and the sessionmaker in `self._sessionmakers`.
5. It returns a session connected directly to the enterprise customer's private database instance, completely bypassing the shared Neon database!
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. What is the fundamental difference between Application-Level filtering and PostgreSQL Row-Level Security (RLS)?
2. What are the 3 tiers in SSR One AI's organizational hierarchy?
3. Why is the `Customer` table scoped to `tenant_id` rather than `branch_id`?
4. What does the second parameter `true` in `current_setting('app.current_tenant_id', true)` do?
5. How does `set_rls_context()` protect against cross-tenant data leaks in PgBouncer transaction pooling mode?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a hotel chain CEO why their guest data and financial invoices are mathematically impossible to be seen by another hotel sharing our cloud platform.
* *Prompt 2*: Explain what would happen if an intern accidentally deployed an API endpoint that forgot to filter by `tenant_id`, and why our PostgreSQL database kernel prevents any data leak from occurring.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```sql
-- ─── POSTGRESQL RLS CHEAT SHEET ──────────────────────────────
-- 1. Enable RLS on Table
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;

-- 2. Master Multi-Tenant Isolation Policy
CREATE POLICY tenant_isolation ON <table_name>
    FOR ALL
    USING (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    )
    WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::bigint
        OR current_setting('app.is_superadmin', true) = 'true'
    );

-- 3. Set Session Variable in Python
SELECT set_config('app.current_tenant_id', '12', false);

-- 4. Test RLS Isolation in psql
SET app.current_tenant_id = '12';
SELECT * FROM orders; -- Returns ONLY Tenant 12 orders

SET app.current_tenant_id = '99';
SELECT * FROM orders; -- Returns ZERO rows from Tenant 12
```

---
*Next Lesson: **[Lesson 10: JWT Authentication, Refresh Rotation & Role-Based Access Control (RBAC)](file:///e:/2026/ssr_one_ai/docs/learning/10-jwt-and-rbac.md)***
