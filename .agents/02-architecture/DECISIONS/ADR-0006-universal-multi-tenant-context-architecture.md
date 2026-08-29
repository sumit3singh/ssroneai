# ADR-0006: Universal Multi-Tenant Context & Metadata-Driven Architecture

> **Status**: Accepted & Adopted
> **Date**: August 2026
> **Authors**: Enterprise Architect AI & Platform Development Team

---

## 1. Context & Business Vision

The **SSR One AI (`ssr_one_ai`)** ecosystem serves diverse enterprise verticals (restaurants, cafes, hotels, PG hostels, retail chains, and enterprise hospitality) under a multi-tenant SaaS subscription model (Standard **₹12,000 / year** per customer tenant).

To ensure complete tenant isolation, scalability to thousands of customer organizations, and zero code duplication, we establish a strict **5-Level Multi-Tenant Data & Security Hierarchy** driven by metadata configuration.

---

## 2. The 5-Level Enterprise Multi-Tenant Hierarchy

```
SSR ONE AI PLATFORM (System Master Engine)
│
└── PLATFORM ADMIN (platform-admin)
    │
    ├── Tenant / Customer Account (Commercial Boundary)
    │   │
    │   ├── Subscription & Licensing (₹12,000/yr, 365 Days, Expiry Governance)  make form for decide our licence fees and detail related this 
    │   ├── Billing Receipts & UTR Verification
    │   ├── Platform Configuration & Custom Domain
    │   ├── Enabled Apps (POS, ERP, PMS, KDS, CRM)
    │   └── Feature Entitlements & Plugin Suite (Banquet, Spa, Laundry)
    │
    ├── Tenant A (e.g. Baithak Cafe & Hospitality Group)
    │   │
    │   ├── Company A1 (Legal Entity: Baithak Cafe Pvt Ltd — GSTIN, CIN, Financial Year, Chart of Accounts)
    │   │   ├── Branch 001 (Noida Outlet — Address, Terminals, Printers, Tables, Branch Menu, Stock)
    │   │   └── Branch 002 (Delhi Outlet — Address, Terminals, Printers, Tables, Branch Menu, Stock)
    │   │
    │   └── Company A2 (Legal Entity: Baithak Stay & Hotels Pvt Ltd — GSTIN, CIN, Hotel Rooms, PMS)
    │       └── Branch 003 (Jaipur Hotel — Address, Room Types, Amenities, Guest Stay Portal)
    │
    └── Tenant B (e.g. Test Group)
        └── Company B1 (Legal Entity: Test Corporate Pvt Ltd)
            └── Branch 001 (Main Branch)
```

---

## 3. Boundary Definition & Responsibilities

| Hierarchy Level | Entity | Responsibilities & Data Scope | Example Attributes |
|---|---|---|---|
| **Level 1** | **Platform** | SaaS Engine, Superadmin Governance, Licensing Key Generation, Audit Stream | Platform Admin (`platform-admin`) |
| **Level 2** | **Tenant** | Commercial Customer Boundary, Subscription Validity, Payment UTR, Feature Flags | `tenant_id`, `baithakcafe.ssrone.ai`, `₹12,000/yr` |
| **Level 3** | **Company** | Legal & Accounting Business Boundary, Tax Identity, Fiscal Year, Legal Name | `company_id`, `GSTIN: 07AAACB1234A1Z5`, `CIN` |
| **Level 4** | **Branch** | Operational Physical Location, POS Terminals, Printers, Tables, Rooms, Stock | `branch_id`, `MAIN-01`, `Mahendragarh`, `Noida` |
| **Level 5** | **User / Role** | Operator Identity, RBAC Context, Allowed Branch Array, Permissions | `user_id`, `Area Manager`, `Cashier` |

---

## 4. Universal Single-Codebase Metadata Engine (`apps/`)

### Rule: NEVER Duplicate Codebases per Customer
The frontend web applications (`customer-food-web`, `customer-stay-web`, `admin-web`, `kds-web`, `staff-web`) are **single codebases**.

When any app opens, it fetches the dynamic context via:
```http
GET /api/v1/public/tenant-context
```



The React/Vite UI dynamically adapts colors, logos, available menus, room categories, and ordering workflows based strictly on this context.

---

## 5. Security & Request Context Passing

Every API request issued by client apps passes context headers:
- `Authorization: Bearer <JWT>`
- `X-Tenant-ID: <int>`
- `X-Company-ID: <int>`
- `X-Branch-ID: <int>`
- `X-Fin-Year: <string>`

FastAPI middleware (`TenantMiddleware`) validates these headers and enforces PostgreSQL **Row-Level Security (RLS)**, guaranteeing **zero cross-tenant or cross-company data leakage**.

---

## 6. Dynamic Dedicated Database Isolation for Enterprise Tenants

When an enterprise customer requests a **dedicated/isolated PostgreSQL database** (and pays premium fees e.g. **₹36,000+ / year**):

1. **Zero Code Changes Needed**:
   - Superadmin selects **Database Strategy: `Dedicated Database`** in **Platform Admin UI (`apps/platform-admin`)**.
   - Superadmin enters the custom PostgreSQL connection string:
     `postgresql+asyncpg://user:pass@db-enterprise-01.ssrone.internal:5432/ssrone_tenant_baithak_db`
   - This connection string is saved in `tenants.settings.db_connection_url`.

2. **Dynamic Backend Connection Pooling ([engine.py](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py))**:
   - `DynamicDatabaseManager` initializes and caches an isolated connection engine and session factory for the enterprise tenant on-demand.
   - All backend microservices, routers, and business logic consume `db: AsyncSession` without changing a single line of code!
