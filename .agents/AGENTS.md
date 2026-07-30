# BAITHAK ERP – Enterprise Platform Master Entry Charter (AGENTS.md)

> **MANDATORY INSTRUCTION**: Every developer, engineer, software architect, and AI coding assistant MUST read this document and all referenced standards in `.agents/` before making any code modifications or additions to THE BAITHAK.

---

## Project Vision: SSR INFINITY
You are NOT building individual React pages. You are NOT building isolated modules.
You are building **THE BAITHAK (SSR INFINITY)**, a metadata-driven, world-class Enterprise Business Operating System capable of serving thousands of companies, millions of users, and multiple hospitality/ERP industries from a single scalable platform.

---

## MANDATORY POST-LOGIN ARCHITECTURE LAW

1. **Always land on Platform Home (Module Launcher) after login (`/`).**
2. **Never automatically land inside a specific module workspace (like POS).**
3. **Platform Home is clean, calm, full-width, and uncluttered; sidebar ONLY appears inside an open module.**
4. **Keep Platform Home generic (Search, Favorites, Business Modules, Connected Apps, Platform Admin); keep business data inside module dashboards.**
5. **Only after clicking a module card does the system enter that module workspace.**
6. **Inside every module workspace, navigation follows identical 5-part structure: Dashboard → Master → Transaction → Report → Settings.**

---

## CONSOLIDATED MASTER BLUEPRINTS & CONSTITUTIONS

- [THEBAITHAK_MASTER_BLUEPRINT.md](file:///e:/2026/baithak/.agents/THEBAITHAK_MASTER_BLUEPRINT.md) – Frozen Enterprise Master Architecture Baseline (71KB)
- [ENTERPRISE_DEVELOPMENT_CONSTITUTION.md](file:///e:/2026/baithak/.agents/ENTERPRISE_DEVELOPMENT_CONSTITUTION.md) – Development Philosophy & Operating Laws
- [ENTERPRISE_AUDIT_REPORT.md](file:///e:/2026/baithak/.agents/ENTERPRISE_AUDIT_REPORT.md) – System & Monorepo Inventory Audit Report
- [MODULE_SPECIFICATIONS.md](file:///e:/2026/baithak/.agents/MODULE_SPECIFICATIONS.md) – POS, PMS & CRM Technical Specifications

---

## 30 MANDATORY PLATFORM ARCHITECTURE CHARTERS

All development MUST comply strictly with the following 30 platform standards:

1. [01_PRODUCT_VISION.md](file:///e:/2026/baithak/.agents/01_PRODUCT_VISION.md) – Product Vision Document (PVD)
2. [02_ENTERPRISE_ARCHITECTURE.md](file:///e:/2026/baithak/.agents/02_ENTERPRISE_ARCHITECTURE.md) – Enterprise Architecture Document (EAD)
3. [03_FRONTEND_BLUEPRINT.md](file:///e:/2026/baithak/.agents/03_FRONTEND_BLUEPRINT.md) – Frontend Architecture Blueprint
4. [04_BACKEND_BLUEPRINT.md](file:///e:/2026/baithak/.agents/04_BACKEND_BLUEPRINT.md) – Backend Architecture Blueprint
5. [05_DATABASE_ARCHITECTURE.md](file:///e:/2026/baithak/.agents/05_DATABASE_ARCHITECTURE.md) – Database Architecture Document
6. [06_UI_UX_DESIGN_SYSTEM.md](file:///e:/2026/baithak/.agents/06_UI_UX_DESIGN_SYSTEM.md) – UI/UX Design System
7. [07_MODULE_STANDARDS.md](file:///e:/2026/baithak/.agents/07_MODULE_STANDARDS.md) – Module Standards Document
8. [08_SIDEBAR_STANDARDS.md](file:///e:/2026/baithak/.agents/08_SIDEBAR_STANDARDS.md) – Sidebar Standards
9. [09_NAVIGATION_STANDARDS.md](file:///e:/2026/baithak/.agents/09_NAVIGATION_STANDARDS.md) – Navigation Standards
10. [10_MODULE_FOLDER_STRUCTURE.md](file:///e:/2026/baithak/.agents/10_MODULE_FOLDER_STRUCTURE.md) – Module Folder Structure
11. [11_COMPONENT_LIBRARY_STANDARDS.md](file:///e:/2026/baithak/.agents/11_COMPONENT_LIBRARY_STANDARDS.md) – Component Library Standards
12. [12_FORM_DESIGN_STANDARDS.md](file:///e:/2026/baithak/.agents/12_FORM_DESIGN_STANDARDS.md) – Form Design Standards
13. [13_TABLE_STANDARDS.md](file:///e:/2026/baithak/.agents/13_TABLE_STANDARDS.md) – Table Standards
14. [14_DASHBOARD_STANDARDS.md](file:///e:/2026/baithak/.agents/14_DASHBOARD_STANDARDS.md) – Dashboard Standards
15. [15_API_STANDARDS.md](file:///e:/2026/baithak/.agents/15_API_STANDARDS.md) – API Standards
16. [16_SECURITY_STANDARDS.md](file:///e:/2026/baithak/.agents/16_SECURITY_STANDARDS.md) – Security Standards
17. [17_PERFORMANCE_STANDARDS.md](file:///e:/2026/baithak/.agents/17_PERFORMANCE_STANDARDS.md) – Performance Standards
18. [18_MULTI_TENANT_STANDARDS.md](file:///e:/2026/baithak/.agents/18_MULTI_TENANT_STANDARDS.md) – Multi-Tenant Standards
19. [19_PLATFORM_ADMIN_BLUEPRINT.md](file:///e:/2026/baithak/.agents/19_PLATFORM_ADMIN_BLUEPRINT.md) – Platform Admin Blueprint
20. [20_CODING_STANDARDS.md](file:///e:/2026/baithak/.agents/20_CODING_STANDARDS.md) – Coding Standards
21. [21_TESTING_STANDARDS.md](file:///e:/2026/baithak/.agents/21_TESTING_STANDARDS.md) – Testing Standards
22. [22_DEPLOYMENT_ARCHITECTURE.md](file:///e:/2026/baithak/.agents/22_DEPLOYMENT_ARCHITECTURE.md) – Deployment Architecture
23. [23_DESIGN_TOKEN_DOCS.md](file:///e:/2026/baithak/.agents/23_DESIGN_TOKEN_DOCS.md) – Design Token Documentation
24. [24_AI_ARCHITECTURE.md](file:///e:/2026/baithak/.agents/24_AI_ARCHITECTURE.md) – AI Architecture
25. [25_WORKFLOW_ENGINE.md](file:///e:/2026/baithak/.agents/25_WORKFLOW_ENGINE.md) – Workflow Engine
26. [26_NOTIFICATION_ARCHITECTURE.md](file:///e:/2026/baithak/.agents/26_NOTIFICATION_ARCHITECTURE.md) – Notification Architecture
27. [27_REPORTING_FRAMEWORK.md](file:///e:/2026/baithak/.agents/27_REPORTING_FRAMEWORK.md) – Reporting Framework
28. [28_COMPLETE_ROUTE_MAP.md](file:///e:/2026/baithak/.agents/28_COMPLETE_ROUTE_MAP.md) – Complete Route Map
29. [29_FEATURE_MATRIX.md](file:///e:/2026/baithak/.agents/29_FEATURE_MATRIX.md) – Feature Matrix
30. [30_FINAL_MASTER_BLUEPRINT.md](file:///e:/2026/baithak/.agents/30_FINAL_MASTER_BLUEPRINT.md) – Final Master Blueprint (The Single Source of Truth)

---

## MANDATORY GOLDEN RULES

### GOLDEN RULE #1: Database is the ONLY Source of Truth
Never use `mockDB`, demo arrays, fake objects, local JSON, hardcoded master data, duplicated application state, or fallback demo records. All business data MUST come from backend APIs, which fetch strictly from PostgreSQL.

### GOLDEN RULE #2: Zero Mock Data in Production Code
Forbidden in production code: `mockDB`, `mockData`, `fakeOrders`, `sampleCustomers`, `dummyTables`, `hardcodedEmployees`, temporary arrays, test JSON inside components, or placeholder business records.


### GOLDEN RULE #4: Sidebar is the ONLY Primary Navigation Inside Modules
Never duplicate navigation inside the workspace content area. Every module follows `Dashboard → Master → Transaction → Report → Settings`.
