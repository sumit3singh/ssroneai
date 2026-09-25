# Current State Snapshot & Architectural Safeguard Standard (Zero-Ruination Protocol)

> **Status**: Accepted, Active & Non-Negotiable  
> **Effective Date**: September 2026  
> **Project Completion Status**: **100% OPERATIONAL & LIVE IN PRODUCTION (Railway)**  
> **Audited By**: Enterprise System Architect AI & SSR IT INDUSTRY Leadership  

---

## 1. Executive Purpose & Context

The **SSR One AI** enterprise platform is at 100% completion and live on production cloud infrastructure (Railway). All fundamental platform tiers, vertical slice domain modules, engines, and multi-tenant isolation boundaries are fully functional, verified, and operational in production code.

This document serves as the **Canonical Current State Snapshot & Safeguard Standard**. Its primary directive is:
> **ZERO RUINATION PROTOCOL**: No developer, AI assistant, automated script, or contributor may alter, regress, delete, or break any existing working architecture, module flow, or performance milestone documented herein.

---

## 2. Monorepo Current State Snapshot (Frozen Baseline)

### 2.1 Web Applications (`apps/` - 8 Frontends)

| App Name | Directory | Port | Key Features & Architecture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Enterprise ERP Web** | `apps/admin-web` | `5173` / `3000` | React 19 + TanStack Router + Zustand. 11 domain modules (POS, Hotel, PG, CRM, Finance, Inventory, HR, Customization Studio, Forms, AI Copilot, Settings). Features **Zero-Wait POS** (< 1.2ms order saving, Dual In-Memory Hot-Mounted DOM, Dexie.js offline queue), and dedicated clean Platform Home module launcher. | 🟢 100% Operational (Live) |
| **Platform Superadmin** | `apps/platform-admin` | `5174` / `3001` | React 19 + Vite. Superadmin tenant provisioning, cluster health status, outlet licensing keys, and live Sales Lead follow-up console (`#leads`) with WhatsApp integration. | 🟢 100% Operational |
| **Kitchen Operations System (KOS)** | `apps/kds-web` | `8083` / `3002` | Multi-Stage 5-Mode QSR KOS: Station Cook KDS, Batch Prep, EXPO Pass, Packing & Handoff, SLA Command Center. Direct PostgreSQL connection via `/api/v1/orders/kds/live`. 86 Item modal & recipe view. | 🟢 100% Operational (Live) |
| **Queue-Buster Token Web** | `apps/token-order-web` | `3003` | Mobile fast-order web app for counter QR & kiosk tablets. Generates 3-digit queue tokens (`#104`). Cashier loads entire pre-built cart in < 0.1s via `Alt+Q`. | 🟢 100% Operational |
| **Customer Food Web** | `apps/customer-food-web` | `3000` / `3004` | Public customer QR menu, dynamic CSS token injection, tenant branding/logo, dynamic item filters, cart customization, and live order status tracker. | 🟢 100% Operational (Live) |
| **Customer Stay Web** | `apps/customer-stay-web` | `3001` / `3005` | Hotel room booking, date range picker, room catalog, booking folio, guest check-in requests. | 🟢 100% Operational (Live) |
| **Staff Mobile Web** | `apps/staff-web` | `8084` / `3006` | Staff mobile operations: Housekeeping room cleaning status, room service orders, KOT table entry, staff attendance. | 🟢 100% Operational |
| **Marketing Scrollytelling Web** | `apps/marketing-web` | `3002` / `3007` | GSAP `MotionPathPlugin` character-guided scrollytelling along a winding emerald road across 7 story beats. Warm paper daylight theme, ₹12,000/yr flat pricing, PostgreSQL lead ingestion. | 🟢 100% Operational (Live) |

---

### 2.2 Shared Packages (`packages/` - 13 Packages)

1. **`packages/api-client`**: Central Axios/Fetch HTTP client with tenant headers, Bearer tokens, retry mechanisms, and normalized error responses.
2. **`packages/auth`**: Tenant context store, JWT management, `PermissionGuard`, and `FeatureGate` components.
3. **`packages/charts`**: Recharts wrappers for analytical dashboards, revenue curves, and operational KPI cards.
4. **`packages/config`**: Shared Tailwind CSS configurations, PostCSS settings, and base TypeScript configs.
5. **`packages/forms`**: Metadata-driven dynamic form components with React Hook Form and Zod schemas.
6. **`packages/hooks`**: Monorepo custom React hooks (`useDebounce`, `useLocalStorage`, `useNetworkStatus`, `usePermission`, etc.).
7. **`packages/icons`**: Centralized Lucide React icon re-exports.
8. **`packages/navigation`**: Dynamic module navigation sidebar, breadcrumb generator, and Platform Home launcher.
9. **`packages/tables`**: TanStack React Table v8 wrappers with sorting, filtering, and pagination.
10. **`packages/theme`**: HSL design token CSS variables, theme switching engine (Light/Dark).
11. **`packages/types`**: Monorepo-wide TypeScript domain interfaces, DTOs, and enums.
12. **`packages/ui`**: Atomic primitive components (Button, Input, Modal, Badge, Card, Popover, Tooltip, Sonner Toast).
13. **`packages/utils`**: Currency, GST math, date formatting, and text helpers.

---

### 2.3 Backend Services & Enterprise Engines (`services/backend/`)

- **14 Domain Modules** (`services/backend/src/modules/`):
  1. `auth`: JWT token authentication, user roles, tenant context, dynamic workspace loading.
  2. `restaurant`: Categories, items, variants, tables, floor layout, kitchen stations.
  3. `orders`: High-speed order creation, KOT generation, queue tokens, settlement.
  4. `billing`: Invoice generation, payment splits, receipt formatting.
  5. `hotel`: Room types, rooms, reservations, check-in/out, folios.
  6. `pg_management`: Properties, rooms, beds, tenants, rent collections, deposits.
  7. `crm`: Customers, loyalty points, wallet ledger, campaigns.
  8. `inventory`: Stock items, stock movements, purchase orders, recipes.
  9. `finance`: Chart of accounts, journal entries, vouchers, GST reports.
  10. `hrms`: Employees, shifts, attendance, payroll.
  11. `marketing`: Lead inquiries, sales follow-ups, contact messages.
  12. `maintenance`: Asset maintenance requests, service logs.
  13. `dashboard`: High-level tenant KPI metrics and aggregates.
  14. `customization`: Tenant branding studio, draft/publish lifecycle, self-service custom domains with socket DNS verification, and reverse proxy host resolution.

- **14 Enterprise Engines** (`services/backend/src/engines/`):
  1. `workflow`: State machine transitions (orders, bookings, tasks).
  2. `notification`: Multi-channel alerts (SMS, Email, WhatsApp).
  3. `report`: Analytical query aggregations and export formatting (CSV, PDF).
  4. `audit`: Immutable system audit logging.
  5. `print`: ESC/POS thermal receipt and KOT slip formatting.
  6. `approval`: Multi-level approval hierarchy.
  7. `discount`: Rule-based promo code and order discount calculations.
  8. `form_builder`: Dynamic metadata-driven form engine.
  9. `licensing`: Tier entitlement and feature gate verification.
  10. `pricing`: Dynamic menu pricing and tax calculations.
  11. `rules`: Configurable business rule evaluator.
  12. `scheduler`: Background recurring task scheduler.
  13. `search`: Full-text search and filtering engine.
  14. `tax`: GST / VAT calculation engine.

---

### 2.4 Architectural Decision Records (14 Canonical ADRs)

- **[ADR-0001](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0001-module-structure.md)**: Module Structure Standard (5-part frontend, 5-layer backend).
- **[ADR-0002](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0002-multi-tenancy-rls.md)**: PostgreSQL Row-Level Security (RLS) & Tenant Isolation.
- **[ADR-0003](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0003-monorepo-package-boundaries.md)**: Monorepo Package Boundaries & Zero Circular Dependency.
- **[ADR-0004](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0004-structure-migration-complete.md)**: Monorepo Consolidation & Directory Rationalization.
- **[ADR-0005](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0005-category-master-root-cause-and-governance.md)**: Category Master SSOT & Database Governance.
- **[ADR-0006](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0006-universal-multi-tenant-context-architecture.md)**: Universal Multi-Tenant Context Architecture.
- **[ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md)**: Startup DDL Lock Purge & Pure SSOT Auth Context.
- **[ADR-0008](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0008-ui-modernization-and-domain-functionality-transition.md)**: UI Modernization & Domain Functionality Transition.
- **[ADR-0009](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0009-pos-kiosk-billing-and-order-edit-architecture.md)**: POS Kiosk Fullscreen Architecture & Tooltip Popover Engine.
- **[ADR-0010](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0010-zero-wait-pos-architecture-and-dual-in-memory-mounted-layout.md)**: Enterprise Zero-Wait POS Architecture & Dual In-Memory Hot-Mounted DOM Layout.
- **[ADR-0011](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0011-marketing-web-character-guided-motion-path-architecture.md)**: Marketing Web Character-Guided Motion-Path Scrollytelling Architecture.
- **[ADR-0012](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0012-tenant-customization-studio-and-self-service-domains.md)**: Tenant Customization Studio & Self-Service Custom Domains Architecture.
- **[ADR-0013](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0013-world-class-enterprise-pos-innovations.md)**: World-Class Enterprise POS Innovations & Zero-Ruination Hardening.
- **[ADR-0014](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0014-production-cloud-deployment-and-zero-ruination-cd.md)**: Production Cloud Deployment & Zero-Ruination Continuous Delivery Baseline.
- **[ADR-0015](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0015-production-audit-security-and-data-integrity-hardening.md)**: Final Production Audit, Secret Sanitization & Multi-Tenant Data-Integrity Hardening.

---

## 3. The 11 Inviolable Architectural Invariants (Never Ruin Rules)

The following 11 invariants are strictly protected. Any proposed change violating any invariant MUST BE IMMEDIATELY REJECTED.

### 🛡️ Invariant 1: Preserve Dual In-Memory Hot-Mounted DOM in POS
- **Rule**: In `POSTransactionSection.tsx`, both the **Billing Terminal** (`POSItemGrid + POSCartPanel`) and the **Table Floor Tracker** (`POSTableTrackerPage`) must remain permanently mounted in the React DOM.
- **Mechanism**: Switching views must be done via `< 0.2ms` CSS visibility toggling (`hidden` vs `flex`) using `onSwitchView` and `window.history.replaceState`.
- **Forbidden**: NEVER revert to router-based page unmounting (`navigate(...)`), which destroys active cart state and causes screen flashing.

### 🛡️ Invariant 2: Non-Blocking < 1.2ms Order & Settlement Processing
- **Rule**: In POS billing, sending a KOT or completing a bill must NEVER synchronously wait for HTTP network roundtrips.
- **Mechanism**: Use client-side sequence tokens (`#001`, `DIN-B1-...`) from `order-sequence.ts`, generate RFC4122 UUIDv4 idempotency keys, write to Dexie.js IndexedDB in `< 0.5ms`, dispatch thermal printing immediately, and synchronize via non-blocking background queue (`useZeroWaitOrderSync.ts`).
- **Forbidden**: NEVER introduce `await api.post(...)` into the primary cashier click path.

### 🛡️ Invariant 3: Pure PostgreSQL Single Source of Truth (SSOT)
- **Rule**: All master data, tenant workspaces, companies, branches, categories, items, and permissions must load dynamically from PostgreSQL.
- **Forbidden**: NEVER re-introduce hardcoded IDs (`tenant_id = 1`, `branch_id = 1`) or hardcoded mock arrays (`defaultCo`, `defaultBr`) into frontend stores or backend routers.

### 🛡️ Invariant 4: Zero Synchronous DDL Locks in FastAPI Lifespan
- **Rule**: The FastAPI server boot sequence in `services/backend/src/main.py` must remain ultra-fast (< 10ms) and pure.
- **Forbidden**: NEVER re-introduce synchronous `ALTER TABLE` DDL statements into the FastAPI `@asynccontextmanager lifespan`. All schema migrations MUST strictly reside in versioned Alembic migration scripts (`database/alembic/`).

### 🛡️ Invariant 5: Strict 5-Layer Backend Architecture
- **Rule**: All backend requests must traverse: `Router → Service → Repository → Database`.
- **Forbidden**: Routers must NEVER execute raw SQL or ORM queries directly, and services must never bypass repositories.

### 🛡️ Invariant 6: Strict Multi-Tenant Isolation (RLS & Tenant ID Filtering)
- **Rule**: Every tenant database entity MUST include `tenant_id`. Every service/repository query must scope records by `tenant_id` to prevent cross-tenant data leakage.

### 🛡️ Invariant 7: Preserve All 8 Web Applications and Dedicated Ports
- **Rule**: The monorepo consists of 8 distinct web applications running on their assigned ports (Admin ERP: 5173, Platform Admin: 5174, KDS: 8083, Token Web: 3003, Food Web: 3000, Stay Web: 3001, Staff Web: 8084, Marketing Web: 3002).
- **Forbidden**: NEVER delete, merge, or collapse these separate application boundaries into a monolithic frontend.

### 🛡️ Invariant 8: Preserve All 14 Backend Engines and 13 Shared Packages
- **Rule**: The shared libraries in `packages/` and specialized engines in `services/backend/src/engines/` constitute the core reusable platform infrastructure.
- **Forbidden**: NEVER duplicate engine logic inside module routers or create one-off ad-hoc utility packages that bypass the shared packages.

### 🛡️ Invariant 9: Offline-First IndexedDB Resilience
- **Rule**: POS transactions and critical offline commands must persist to local IndexedDB (`offlineDB.offlineOrders`) so the terminal continues operating through Wi-Fi drops and power interruptions.
- **Forbidden**: NEVER delete or bypass the offline sync worker.

### 🛡️ Invariant 10: Zero-Failure Marketing Lead Pipeline
- **Rule**: The lead ingestion pipeline in `apps/marketing-web` must always enforce 10-digit phone sanitization, timeout shields, multi-endpoint fallback, direct WhatsApp follow-up link generation, and PostgreSQL persistence to `lead_inquiries`.
- **Forbidden**: NEVER replace live database lead submission with dummy `console.log` or unpersisted mock states.

### 🛡️ Invariant 11: Pure Tenant Customization & Zero-Ruination Fallbacks
- **Rule**: All connected customer applications (`customer-food-web`, `customer-stay-web`, `kds-web`, `staff-web`, `token-order-web`) must load dynamic branding and features via PostgreSQL SSOT `tenant_app_configs`, while unconditionally preserving hardcoded default fallbacks so zero downtime or blank screens occur if a tenant has no configuration or when network fails.
- **Mechanism**: Hierarchical resolution checks branch override first, falls back to tenant default, then platform fallback constants. Custom CSS tokens inject dynamically via `:root` CSS variables without requiring page reloads or bundle recompilation.
- **Forbidden**: NEVER delete or bypass fallback configuration objects or allow missing tenant records to raise 404/500 errors on public routes.

### 🛡️ Invariant 12: Production Cloud Monorepo & Continuous Delivery Baseline (Railway)
- **Rule**: All frontend cloud services must execute from the monorepo root context (`Root Directory = /`) to guarantee deterministic resolution of `packages/*` and `pnpm-workspace.yaml`.
- **Mechanisms**:
  - `pnpm-lock.yaml` must always be synchronized before committing so `pnpm install --frozen-lockfile` never fails in CI.
  - All frontend `vite.config.ts` files must configure `allowedHosts: true` under both `server` and `preview` blocks to prevent DNS rebinding host blocks on public cloud URLs (`*.up.railway.app` or custom domains).
  - Backend execution must dynamically bind to container-assigned `$PORT` via `CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]` and expose `/health` probe.
- **Forbidden**: NEVER set service Root Directory to an isolated frontend subfolder on cloud PaaS, NEVER introduce wildcard `"*"` dependency versions in `package.json`, and NEVER remove `/health` or host-authorization flags.

---

## 4. Emergency Verification & Health Checklist

Before committing any future pull request or completing any AI agent turn, verify:

1. **Backend Health**: `GET /health` and `GET /api/v1/auth/health` return HTTP 200.
2. **ERP POS Latency**: Order KOT click latency remains `< 1.2ms` in browser devtools.
3. **Table Floor Switch**: Table Floor ↔ Billing terminal switch completes in `< 0.2ms` with zero component remounting.
4. **Fast-Order Token Web**: Token generation persists to `/api/v1/orders/queue-tokens` and recalls in POS cart in `< 0.1s`.
5. **KDS Operational Modes**: Station view, Batch prep, EXPO pass, Packing, and SLA Command Center switch cleanly.
6. **Lead Submission**: Submitting a test lead on `marketing-web` inserts a row into `lead_inquiries` table and updates Superadmin `#leads`.
7. **Customization & Fallbacks**: `GET /api/v1/tenant-config/by-slug/{slug}/{code}/{app}` returns HTTP 200 with full fallback config even for non-existent tenants. `test_customization.py` passes 100%.
8. **Cloud Build Integrity**: `pnpm install --frozen-lockfile` runs with exit code 0. `pnpm --filter @ssrone/admin-web build` succeeds cleanly.

---

## 5. Architectural Governance Sign-Off

- **Current Status**: **100% OPERATIONAL & LIVE IN PRODUCTION (Railway)**
- **Protection Tier**: **CRITICAL NON-NEGOTIABLE (ZERO-RUINATION ACTIVE)**
