# The Baithak — Enterprise Development Constitution
**Version:** 1.0  
**Status:** Active Governing Document  
**Scope:** Universal (All Developers, Designers, Testers, & Product Managers)  

---

## 1. Our Philosophy

THE BAITHAK is not a collection of forms. It is a **Hospitality Operating System**. Every screen, workflow, report, dashboard, API, and mobile application must follow these principles:

### Principle 1: Simplicity First
- A new user should understand the system within **15 minutes**.
- No complex ERP-style screens. No clutter. No unnecessary fields.
- Every screen must answer:
  1. *What do I need to do?*
  2. *What is important right now?*
  3. *What action should I take next?*

### Principle 2: Admin ERP is the Mother System
- The Admin ERP is the single control center. All master data is created here.
```
                  Admin ERP (Mother System)
                              │
         ┌────────────┬───────┼───────────┬─────────────┐
         ▼            ▼       ▼           ▼             ▼
     POS / KDS      CRM      PMS    Inventory      Finance / HR
```
- **No duplicate masters anywhere.** Local masters in child applications are strictly prohibited.

### Principle 3: Single Source of Truth
- The database schema is the absolute truth.
- **Never hardcode**: Menus, Permissions, Tax rules, Roles, Workflows, Reports, Forms, Dashboards, or Notifications.
- Everything must be loaded dynamically from metadata tables.

---

## 2. Required Metadata Architecture

Developers must implement and enforce the following metadata tables:

- `module_master`
- `workspace_master`
- `menu_master`
- `form_master`
- `report_master`
- `dashboard_master`
- `workflow_master`
- `api_master`
- `role_master`
- `permission_master`
- `notification_master`
- `file_master`

> [!IMPORTANT]
> **Schema Standard:** Every single object created in the system must declare these reference fields:
> - `file_id`
> - `module_id`
> - `workspace_id`
> - `status`
> - `created_by`

### File ID Standard Examples
- `POS001`: Menu Category Master
- `POS002`: Dish Master
- `POS003`: Modifier Master
- `POS101`: Billing Entry
- `POS102`: KOT Entry
- `POSR001`: Daily Sales Register
- `CRM001`: Customer Master
- `PG001`: Resident Master
- `PGR001`: Resident Ledger
- `FIN001`: Ledger Master

---

## 3. Core Development Policies

### 3.1 Master Data First Policy
No transaction screen is considered complete until all related master forms are complete and active.
- *Example*: The POS Billing module is not considered complete until: Menu Category, Dish, Modifier, Combo, Offer, Recipe, Kitchen, Tax, Price List, and Loyalty masters exist and are fully functioning.

### 3.2 Workspace Layout Standard
Every module screen must follow the `UI_WORKSPACE_STANDARD` layout block structure. Form-only screens are prohibited. Every module page is a Workspace containing:
1. Header
2. Global Command Bar (Ctrl+K)
3. KPI Cards Row
4. Quick Actions Toolbar
5. AI Insights & Alerts
6. Activity Timeline Stream
7. Main Data Grid

### 3.3 Global Command Center
The `Ctrl + K` search bar must provide immediate search access to: Forms, Reports, Customers, Items, Orders, Rooms, Residents, Invoices, Employees, and Workflows from a single inline interface.

---

## 4. Subsystem Design Philosophies

### 4.1 POS Design (Fastest Billing)
- **Target**: Order Entry time of less than **5 seconds**.
- Must support: Keyboard billing hotkeys (`F1`-`F12`), Touch Billing, AI Command line, Barcode lookup, Customer profiles, Combo suggestions, and Favorites list.
- **Rule**: Cashiers must never search large menus manually. The system must suggest next items dynamically.

### 4.2 Customer Experience (CRM)
- The customer profile card must instantly render: Name, Loyalty Tier, Points, Visit Frequency, Last Orders, Favorite Items, and Outstanding Balance. Repeat customers must be recognized instantly.
- CRM must support: Leads, Prospects, Customers, Campaigns, Feedback loops, Loyalty ledger, Coupons, and Multi-channel communication.

### 4.3 PG Management
- Not room management—**Resident Lifecycle Management**.
- Must support: Buildings, Floors, Rooms, Beds, Residents, Agreements, Security Deposits, Visitors, Complaints, Maintenance, Penalties, and Utility Billing.

### 4.4 Reporting & Security
- Every transaction must be traceable. Must provide Registers, Ledgers, Summaries, and Exception Analytics.
- No hardcoded permissions. Access rights must be checked dynamically at the Role, User, Branch, Outlet, Module, Form, and Field level.

---

## 5. Definition of Done (DoD)

No feature is complete until it satisfies the following checklist:
- [ ] Master Data Complete
- [ ] API Endpoints Complete
- [ ] RBAC Permissions Complete
- [ ] Reports Complete
- [ ] Audit Event Logs Complete
- [ ] Documentation Complete
- [ ] UI Review Complete

---

## 6. Success Criteria

THE BAITHAK must feel like:
- **Apple-level simplicity** + **Shopify-level usability**
- **Salesforce-level intelligence** + **SAP-level control**
- **Oracle-level scalability** + **Hospitality-focused execution**
