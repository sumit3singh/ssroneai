# ADR-0008: UI Modernization Completion & Transition to Deep Domain Functionality Integration

> **Status**: Accepted & Enforced  
> **Date**: September 2026  
> **Authors**: Enterprise Architect AI & Platform Development Team  

---

## 1. Context & Problem Statement

Following initial monorepo consolidation and database SSOT auth context establishment (ADR-0007), the platform underwent comprehensive UI design token unification, responsive layout optimization, dynamic dashboard grid creation, and cluster status badge integration across all 7 web applications:
1. `apps/admin-web`: Core Enterprise ERP (POS, PMS, PG, CRM, HR, Inventory, Finance, Billing, KDS, etc.)
2. `apps/platform-admin`: Multi-tenant Superadmin Console (Cluster Status, Outlets, Licenses, Audit Logs)
3. `apps/kds-web`: Kitchen Display System (Live Order Queues, Timer Badges, Station Routing)
4. `apps/staff-web`: Staff Portal (Housekeeping, Room Service, KOT Entry, Attendance)
5. `apps/customer-food-web`: Customer Ordering Web App (QR Menu, Cart, Checkout, Order Tracking)
6. `apps/customer-stay-web`: Guest Portal (Room Reservation, Check-in, Amenities, Room Service Requests)
7. `apps/marketing-web`: Public Landing Page & Vertical Solutions Showcase

With the UI design system, HSL CSS variables, micro-animations, and client-side SPA routing verified across all applications, the platform is now transitioning into **Phase 2: Deep Domain & Backend Functionality Integration**.

---

## 2. Decision & Architecture Rules

### Rule 1: Separation of Visual UI and Deep Domain Logic
- **Visual Presentation**: UI components must strictly consume design tokens (`@ssrone/ui`, HSL CSS variables) and must not contain inline SQL or direct network fetches.
- **Domain Logic**: Business logic, calculated aggregates (e.g. TAX/GST, discounts, folio balances, payroll calculations), and offline sync strategies must reside in dedicated domain packages (`@ssrone/forms`, `@ssrone/hooks`, `@ssrone/api-client`) or backend services (`services/backend/src/modules/`).

### Rule 2: Service-Repository Pattern & PostgreSQL SSOT
- **Service Layer**: Handles multi-tenant context validation, transaction boundaries, and domain rules.
- **Repository Layer**: Executes async SQLAlchemy queries with explicit pre-fetching (`selectinload`) and Row-Level Security (RLS) tenant isolation filters (`tenant_id = :tenant_id`).
- **Forbidden**: Frontend mock data fallbacks or bypasses of database validation rules.

### Rule 3: Offline Conflict Resolution Engine (`conflictResolver.ts`)
- **Strategy Matrix**: Client-side state mutations during network disconnects must store local transactions in IndexedDB and resolve conflicts upon reconnection using standard strategies:
  - `ServerWins`: Server state overrides client in concurrent modifications.
  - `ClientWins`: Local change overrides (for local order drafts).
  - `FieldMerge`: Non-overlapping fields are merged automatically.

### Rule 4: Tier Entitlement & Feature Gate Enforcement
- **Entitlement Checking**: Features must be gated both on the frontend using `PermissionGuard` / `FeatureGate` components and enforced on backend FastAPI endpoints checking the tenant's license tier (`Starter`, `Professional`, `Enterprise`).

---

## 3. Scope of Functionality Integration

| Module / App | Domain Functionality Target |
| :--- | :--- |
| **POS & KDS** | Order creation, KOT printing, table transfer, split billing, live KDS station WebSocket sync. |
| **Hotel PMS & PG** | Room grid state, guest check-in/out, folio billing, automated night audit, bed allocation. |
| **CRM & Loyalty** | Guest tier rewards, campaign triggers, feedback scoring, customer lifetime value analytics. |
| **HR & Payroll** | Attendance tracking, shift management, salary slip generation, tax compliance deduction. |
| **Inventory & Finance** | Stock movement ledger, PO approval workflow, automated double-entry journal posting. |
| **Platform Admin** | Real-time cluster health monitoring, tenant provisioning, automated subscription renewals, **Sales Leads Console (`#leads`) with WhatsApp follow-up & phone-based deduplication**. |
| **Marketing Web** | **PostgreSQL SSOT Lead Ingestion (`lead_inquiries`), 10-digit mobile validation (`@field_validator("phone")`), and phone-based upsert engine (updates requested slot/notes without creating duplicate rows)**. |

---

## 4. Consequences & Benefits

- **Architectural Preservation**: Prevents regression or corruption of UI layouts while injecting domain functionality.
- **Predictable API Integration**: Ensures consistent DTO schemas between React query hooks and FastAPI routers.
- **Enterprise Multi-Tenancy**: Guarantees RLS security and license entitlement across all 16 business modules.
