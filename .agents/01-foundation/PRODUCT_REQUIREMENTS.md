# Product & Functional Requirements Specification

> **Last Reviewed**: September 2026

This document defines the functional and product requirements for **The ssrone** enterprise operating system.

---

## 1. System Requirements Overview

The platform must support multi-tenant, multi-company, and multi-branch operations across all core business modules:

| Module | Key Functional Requirements |
| :--- | :--- |
| **Platform Home** | Generic launcher displaying the 11 Business Workspace Modules, branch selector, search, and notification center. Sidebar ONLY renders inside an active module. |
| **POS (Point of Sale)** | Fast table grid, KOT generation, size-based addon pricing algorithm, cashier settlement, real-time KDS integration, <1.2ms order saving, and dual in-memory hot-mounted layout. |
| **PMS (Hotel Stay)** | Room inventory grid, reservation booking, guest check-in/out, folio billing, housekeeping status, and RevPAR reports. |
| **PG Management** | Bed allocation master, tenant onboarding, rent receipt generation, automated late fee calculation, and rent roll audit reports. |
| **CRM & Loyalty** | Customer directory, wallet balance, tier tracking (Silver, Gold, Platinum), and automated promo code discounts. |
| **Inventory** | Stock ledger, unit of measure conversions, reorder level alerts, supplier purchase orders, and recipe costing. |
| **Finance & Accounting**| General ledger, chart of accounts, GST tax returns, invoicing, and cash/bank reconciliation. |
| **HRMS** | Employee roster, daily attendance tracking, shift scheduling, and monthly payroll processing. |
| **Website & App Customization** | Multi-tenant branding studio, HSL themes, logos, announcement banners, customer app feature toggles, live mobile/desktop preview, draft/publish lifecycle, and zero-downtime fallbacks. |
| **Custom Domains & DNS** | Self-service custom domain onboarding, automated DNS TXT token challenge verification, reverse-proxy host resolution (`/api/v1/custom-domains/resolve`), and SSL readiness. |
| **Dynamic Forms** | Metadata-driven drag-and-drop form schema builder, custom input validation rules, and structured submission processing. |
| **AI Copilot** | Natural language operational assistant, RAG context retrieval across sales, inventory, and room occupancy, and automated analytical suggestions. |
| **System Settings** | Enterprise tenant organization profile, multi-outlet branch registration, audit log ledger, and role-based security settings. |

---

## 2. Non-Functional Requirements

1. **Performance**: API response times <100ms for p95 requests; POS grid rendering under 60fps.
2. **Availability**: 99.9% uptime requirement; offline billing buffer up to 10,000 pending transactions.
3. **Security**: Row-Level Security (RLS) on PostgreSQL, JWT authentication, and RBAC permission checks on every route.
4. **Scalability**: Multi-tenant architecture capable of supporting 5,000+ active tenants on a single shared-database deployment.
