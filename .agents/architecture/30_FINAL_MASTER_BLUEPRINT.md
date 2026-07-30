# BAITHAK ERP – Final Master Blueprint (The Single Source of Truth)

> **AUTHORITATIVE MASTER CHARTER (#30)**  
> This is the single governing reference document for **THE BAITHAK (SSR INFINITY)**. Every developer, designer, software architect, tester, DevOps engineer, and product manager MUST strictly follow this master blueprint.

---

## 1. Product Vision & Positioning
- **System**: THE BAITHAK (SSR INFINITY)
- **Positioning**: Metadata-driven, multi-tenant Enterprise Business Operating System for hospitality, food retail, hotel PMS, PG management, and multi-location retail chains.
- **Mother System Philosophy**: The Admin ERP is the single control center. All master data (tenants, companies, branches, items, accounts, users, workflows) is created and managed here and synced to client apps (`customer-food-web`, `customer-stay-web`, `kds-web`, `mobile-app`, `staff-web`).

---

## 2. Platform & Enterprise Architecture
- **Layered Architecture**: Client Apps → API Gateway → FastAPI Controllers → Domain Engines → PostgreSQL Database.
- **Core Platform Engines**:
  1. Multi-Tenant Engine (`tenant_id`, `company_id`, `branch_id`)
  2. Workflow & Approval Engine (`workflow_master`)
  3. Pricing & Tax Engine (Absolute `sellingPrice`, GST engine)
  4. Notification Engine (Email, SMS, Push, WhatsApp, In-App)
  5. Audit & Compliance Engine (`audit_logs`)
  6. AI Engine (Copilot, Forecasting, Insights)

---

## 3. Mandatory 5-Part Module Navigation Standard
Every business module inside the platform strictly follows:
$$\text{Dashboard} \longrightarrow \text{Master} \longrightarrow \text{Transaction} \longrightarrow \text{Report} \longrightarrow \text{Settings}$$
- **Zero Duplicate Center Navigation Tabs**: Navigation inside modules is driven strictly by the sidebar navigation tree.

---

## 4. Single Source of Truth & Database Governance (Golden Rules #1 & #2)
- PostgreSQL database is the single source of truth.
- Zero mock data, zero fallback demo arrays, zero `mockDB` in production code.
- All application data is loaded dynamically via RESTful backend APIs.

---

## 5. UI/UX Design System Tokens
- **Theme System**: Universal Light Mode / Modern Dark Mode.
- **Typography**: Inter / Outfit modern sans-serif fonts.
- **Color Palettes**: Curated dark & light modes with semantic status badges (`success`, `warning`, `danger`, `info`).
- **3D Micro-Animations**: Smooth glassmorphism backdrop blurs, floating subtle particle rain, and interactive micro-transitions.

---

## 6. Security, RBAC & Multi-Tenant Governance
- **Authentication**: JWT Bearer tokens with auto-refresh mechanism.
- **Authorization**: Fine-grained RBAC & ABAC permission scopes (`module:read`, `module:write`, `module:delete`).
- **Data Scoping**: Tenant-level, company-level, and branch-level SQL isolation on all queries.

---

## 7. AI & Intelligent Operations
- Built-in **AI Copilot** for natural language SQL queries, sales predictions, inventory reorder recommendations, and dynamic chat capabilities.
