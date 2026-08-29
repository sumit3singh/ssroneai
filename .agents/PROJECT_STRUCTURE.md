# SSR One AI – Full Recursive Project File Tree

> **100% Exhaustive Monorepo Workspace Inventory (Every File & Directory)**  
> **Last Generated**: August 2026

```
e:\2026\ssr_one_ai
├── .agents/
│   ├── 01-foundation/
│   │   ├── FEATURE_MATRIX.md
│   │   ├── PRODUCT_REQUIREMENTS.md
│   │   ├── TECH_STACK.md
│   │   └── VISION.md
│   ├── 02-architecture/
│   │   ├── DECISIONS/
│   │   │   ├── ADR-0001-module-structure.md
│   │   │   ├── ADR-0002-multi-tenancy-rls.md
│   │   │   ├── ADR-0003-monorepo-package-boundaries.md
│   │   │   ├── ADR-0004-structure-migration-complete.md
│   │   │   └── template.md
│   │   ├── ARCHITECTURE.md
│   │   ├── BACKEND_ARCHITECTURE.md
│   │   ├── DEPLOYMENT_ARCHITECTURE.md
│   │   ├── FRONTEND_ARCHITECTURE.md
│   │   ├── MULTI_TENANCY.md
│   │   ├── PLATFORM_ADMIN_BLUEPRINT.md
│   │   ├── PROJECT_STRUCTURE.md
│   │   └── ROUTE_MAP.md
│   ├── 03-standards/
│   │   ├── API_STANDARDS.md
│   │   ├── CODING_STANDARDS.md
│   │   ├── COMPONENT_GUIDELINES.md
│   │   ├── DATABASE_STANDARDS.md
│   │   ├── DOCUMENTATION_STANDARD.md
│   │   ├── ERROR_HANDLING_STANDARD.md
│   │   ├── ENGINE_STANDARD.md
│   │   ├── GIT_STANDARD.md
│   │   ├── DEVOPS_STANDARDS.md
│   │   ├── NAMING_STANDARD.md
│   │   ├── PERFORMANCE_STANDARDS.md
│   │   ├── SECURITY_STANDARDS.md
│   │   └── TESTING_STANDARDS.md
│   ├── 04-design/
│   │   ├── DESIGN_SYSTEM.md
│   │   ├── NAVIGATION_STANDARDS.md
│   │   └── UI_PATTERNS.md
│   ├── 05-quality/
│   │   ├── CODE_REVIEW_CHECKLIST.md
│   │   ├── DEFINITION_OF_DONE.md
│   │   └── FINAL_SIGN_OFF_CHECKLIST.md
│   ├── 06-governance/
│   │   ├── CHANGE_MANAGEMENT.md
│   │   ├── CODE_OF_CONDUCT.md
│   │   ├── CONTRIBUTING.md
│   │   └── RELEASE_MANAGEMENT.md
│   ├── 07-modules/
│   │   ├── CRM_MODULE_SPECIFICATION.md
│   │   ├── MODULE_SPECIFICATIONS.md
│   │   ├── PMS_MODULE_SPECIFICATION.md
│   │   └── POS_MODULE_SPECIFICATION.md
│   ├── 08-ai-rules/
│   │   ├── AI_DEVELOPMENT_RULES.md
│   │   └── ENTERPRISE_ARCHITECT_AI_CONSTITUTION.json
│   ├── 09-tasks/
│   │   ├── FEATURE_LICENSING_TASKS.md
│   │   ├── PENDING_WORK_ROADMAP.md
│   │   └── ROUTING_TODO.md
│   ├── archive/
│   │   └── FIX_DB_SINGLE_SOURCE_OF_TRUTH_PROMPT.md
│   ├── AGENTS.md
│   ├── DO_NOT.md
│   └── PROJECT_BRIEF.md
│
├── apps/
│   ├── admin-web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── routes/
│   │   │   │       └── index.tsx
│   │   │   ├── modules/
│   │   │   │   ├── ai-copilot/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── AIChatDrawer.tsx
│   │   │   │   │   │   └── AICopilotWidget.tsx
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── AICopilotPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   ├── README.md
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── LoginPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── crm/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   └── CRMPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── finance/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   └── FinancePage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── forms/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── FormBuilderPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── hotel/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   └── HotelPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── hr/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   └── HRPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   └── InventoryPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── pg-management/
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   ├── PGDashboardPage.tsx
│   │   │   │   │   │   └── PGManagementPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   ├── pos/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── POSHeader.tsx
│   │   │   │   │   │   └── POSTableGrid.tsx
│   │   │   │   │   ├── pages/dashboard/
│   │   │   │   │   │   ├── POSDashboardPage.tsx
│   │   │   │   │   │   └── POSPage.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── module.json
│   │   │   │   │   └── routes.ts
│   │   │   │   └── settings/
│   │   │   │       ├── pages/
│   │   │   │       │   ├── CommunicationPage.tsx
│   │   │   │       │   ├── MasterStudioPage.tsx
│   │   │   │       │   ├── PlatformStudioPage.tsx
│   │   │   │       │   ├── SettingsPage.tsx
│   │   │   │       │   └── WorkflowPage.tsx
│   │   │   │       ├── index.ts
│   │   │   │       ├── module.json
│   │   │   │       └── routes.ts
│   │   │   ├── shared/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── AppShell.tsx
│   │   │   │   │   ├── ConnectedAppPage.tsx
│   │   │   │   │   └── ConnectedAppsLauncher.tsx
│   │   │   │   └── utils/
│   │   │   │       ├── cn.ts
│   │   │   │       ├── dev-mode.ts
│   │   │   │       └── formatters.ts
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── customer-food-web/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── customer-stay-web/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── kds-web/
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── platform-admin/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ClusterTelemetryView.tsx
│   │   │   │   ├── CommandHeader.tsx
│   │   │   │   ├── LicenseWizardModal.tsx
│   │   │   │   └── SidebarNav.tsx
│   │   │   ├── App.tsx
│   │   │   ├── index.css
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── staff-web/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── index.css
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── database/
│   ├── ddl/
│   │   ├── 01_auth_schema.sql
│   │   ├── 02_restaurant_schema.sql
│   │   ├── 03_hotel_schema.sql
│   │   ├── 04_crm_schema.sql
│   │   ├── 05_hr_schema.sql
│   │   ├── 06_inventory_schema.sql
│   │   ├── 07_finance_schema.sql
│   │   └── 08_licensing_schema.sql
│   └── migrations/
│       ├── alembic.ini
│       └── env.py
│
├── infrastructure/
│   ├── docker-compose.yml
│   └── nginx/
│       └── nginx.conf
│
├── learning/
│   ├── CURRICULUM.md
│   ├── lesson1_python_fundamentals.md
│   ├── lesson2_fastapi_and_backend_architecture.md
│   ├── lesson3_postgresql_and_database_design.md
│   ├── lesson4_frontend_modern_typescript_react.md
│   └── lesson5_fullstack_pos_system_architecture.md
│
├── metadata/
│   ├── forms/
│   │   └── pos_order_form.json
│   ├── README.md
│   └── version.json
│
├── packages/
│   ├── api-client/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── charts/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── forms/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── hooks/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── icons/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── navigation/
│   │   ├── src/
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── index.ts
│   │   │   └── Sidebar.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tables/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── theme/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── types/
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── FormRenderer.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── KPICard.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/
│   ├── check_project_structure.py
│   └── link_platform_admin_node_modules.py
│
├── services/
│   └── backend/
│       ├── src/
│       │   ├── core/
│       │   │   ├── event_bus/
│       │   │   │   ├── catalog.py
│       │   │   │   └── engine.py
│       │   │   ├── config.py
│       │   │   ├── database.py
│       │   │   └── security.py
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── crm/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── finance/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── hotel/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── hr/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── inventory/
│       │   │   │   ├── models.py
│       │   │   │   ├── router.py
│       │   │   │   └── service.py
│       │   │   ├── licensing/
│       │   │   │   ├── engine.py
│       │   │   │   ├── models.py
│       │   │   │   └── router.py
│       │   │   └── restaurant/
│       │   │       ├── models.py
│       │   │       ├── router.py
│       │   │       └── service.py
│       │   └── shared/
│       │       └── storage.py
│       ├── main.py
│       └── requirements.txt
│
├── tests/
│   └── README.md
│
├── tools/
│   ├── diagnostics/
│   └── sandbox/
│
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
└── turbo.json
```
