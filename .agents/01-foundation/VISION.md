# Product Vision & Operating Charter (SSR ONE AI)

> **Owner & Provider**: SSR IT Industry  
> **Product**: SSR One AI – Full Hospitality & Accommodation ERP Platform  
> **Last Reviewed**: August 2026

---

## 1. Executive Product Vision

**SSR One AI** is a multi-tenant, enterprise-grade hospitality and retail business operating system designed by **SSR IT Industry** to serve thousands of commercial clients (hoteliers, restaurateurs, PG owners, cafe operators, and retail chains).

The platform powers end-to-end operations across 6 specialized monorepo applications connected to a single unified backend engine and PostgreSQL database framework.

---

## 2. Business Model & Database Architecture

### A. Commercial Licensing & Subscriptions
- **Subscription Price**: Standard tier starts at **₹12,000 / year / tenant**.
- **Target Customers**: Independent hotels, PG accommodations, fine dining restaurants, QSR chains, cafes, cloud kitchens, and multi-outlet food courts.

### B. Database Provisioning Policies (Platform Admin Managed)
1. **Shared Database Strategy (Multi-Tenant RLS)**:
   - Default policy for standard subscribers (e.g. ₹12,000/year tier).
   - Multiple tenant clients share the PostgreSQL instance.
   - Absolute data isolation is enforced at the database level using `tenant_id`, `company_id`, and `branch_id` columns with PostgreSQL Row-Level Security (RLS).
2. **Dedicated Database Strategy (Enterprise Tiers)**:
   - For high-volume enterprise clients demanding custom infrastructure.
   - Managed via `apps/platform-admin`, which provisions a dedicated PostgreSQL database instance for that tenant while executing the exact same application codebase.

---

## 3. Organizational Hierarchy & Scope Isolation Rules

```
[SSR IT Industry SaaS Engine] (Platform Admin)
  └── [Tenant: Customer Company / Enterprise] (tenant_id)
        └── [Company Entity] (company_id)
              ├── [Branch / Outlet 1] (branch_id) (e.g. Baithak Cafe - CUH Mahendragarh)
              └── [Branch / Outlet 2] (branch_id) (e.g. Baithak Cafe - Gurugram)
```

### Scope Isolation Standard
1. **Branch-Scoped Master & Transaction Data**:
   - Menu Categories, Menu Items, Variations, Add-ons, KOTs, Orders, Billing Invoices, Dining Tables, KDS Stations, Room Inventories, Stock Levels, Shift Drawers, and Staff Logins are strictly scoped to `branch_id`.
   - Data created under Branch A is isolated from Branch B.
2. **Tenant / Company-Scoped Customer Master (Exceptional Rule)**:
   - **Customer Master** (`Customer` model) is scoped to **`tenant_id` / `company_id`** (NOT tied to a single branch).
   - A customer registered at Branch A can visit Branch B of the same tenant company, and their profile, credit balance, and loyalty points are shared seamlessly across all branches of that tenant.
3. **User & Employee Master Rules**:
   - In `apps/admin-web -> Settings / User Management`:
     - Users **cannot create or delete** Companies or Branches (creation is restricted to `apps/platform-admin` / licensing entitlements).
     - Users can view and update Company/Branch metadata (Logo, Address, Contact, GSTIN).
     - To create a User login, an Employee must **first be created** under a specific Branch in HRMS, then bound to a User account.

---

## 4. Architecture of the 6 Monorepo Applications

1. **`apps/platform-admin` (SSR IT Industry Superadmin Control Plane - ~95% Complete)**:
   - Platform superadmin portal to provision tenants, manage enterprise companies, provision branches, issue license keys, configure database policies (Shared vs Dedicated), and monitor audit logs.
2. **`apps/admin-web` (Main Tenant ERP - ~70% Complete)**:
   - Full ERP suite used by Tenant Superadmins, Branch Managers, and Cashiers.
   - Modules: POS Counter Billing, Live Floor Tracker, KDS, Shift Drawer, PMS Hotel Rooms, PG Tenants, Inventory & Recipes, HRMS Payroll, CRM Loyalty, Finance Accounting, Reports, and Settings.
3. **`apps/customer-food-web` (Customer Food Ordering & Table QR App)**:
   - Web application for guest online food ordering and table-side QR menu ordering. Customized per tenant branding; orders route to active `branch_id`.
4. **`apps/customer-stay-web` (Customer Hotel & PG Room Booking Portal)**:
   - Guest-facing web portal for browsing hotel/PG rooms, checking live availability, and booking stays per tenant/branch.
5. **`apps/kds-web` (Kitchen Display System Application)**:
   - Dedicated kitchen screen app for chefs and station cooks, scoped strictly to branch & station via staff login.
6. **`apps/staff-web` (Waiter & Room Service Mobile App)**:
   - Mobile-optimized web app for waiters, captains, and room attendants to take table orders and manage room service per branch.

---

## 5. SSR IT Industry Public Marketing Portal

- A public-facing sales and marketing portal for **SSR IT Industry** where prospective client companies can:
  - Explore **SSR One AI** features across Hotel, Restaurant, PG, and Retail verticals.
  - View subscription pricing tiers (₹12,000/yr Starter up to Enterprise Dedicated DB).
  - Book live product demos and submit sales inquiries directly to SSR IT Industry leads.
