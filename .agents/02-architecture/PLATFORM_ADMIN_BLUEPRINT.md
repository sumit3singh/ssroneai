# Platform Admin Architecture Blueprint

> **Last Reviewed**: August 2026

This document specifies the Platform Superadmin & Tenant Provisioning Architecture for **The ssrone**.

---

## 1. Scope & Architectural Boundaries

To ensure strict zero-duplication enterprise architecture (10/10 standard):

1. **`apps/platform-admin` (Superadmin Portal)**:
   - Dedicated application for platform owners & superadmins.
   - Manages tenant registration, company/branch provisioning, subscription licensing keys, server-side feature gates, and global cluster audit telemetry.
   - Operates above single-tenant boundaries.

2. **`apps/admin-web` (Tenant Business Operations Portal)**:
   - Dedicated application for tenant users, managers, and staff.
   - Runs tenant business modules (POS, Hotel PMS, PG, CRM, HR, Inventory, Finance, AI Copilot, Dynamic Forms, Settings) strictly scoped within the tenant's PostgreSQL Row-Level Security (RLS) boundary.
   - Access to platform superadmin paths (`/platform/*`) redirects to the dedicated `platform-admin` app.

3. **Connected Customer & Staff Experience Apps**:
   - `apps/customer-food-web` (Food Ordering)
   - `apps/customer-stay-web` (Hotel Stay)
   - `apps/kds-web` (Kitchen Display System)
   - `apps/staff-web` (Staff & Waiter Handheld)

