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
