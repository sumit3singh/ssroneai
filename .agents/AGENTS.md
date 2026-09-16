# SSR One AI – Enterprise Documentation Master Index (AGENTS.md)

> **MANDATORY INSTRUCTION FOR ALL DEVELOPERS & AI ASSISTANTS**:  
> Read this document first. **One topic = One file.** Before creating any new documentation, search this index to edit existing documents rather than creating duplicate files.

> **Last Reviewed**: September 2026

---

## 1. Governance & Critical Anti-Patterns

- **[AGENTS.md](file:///e:/2026/ssr_one_ai/.agents/AGENTS.md)**: Master index and entry point for all documentation across SSR One AI.
- **[DO_NOT.md](file:///e:/2026/ssr_one_ai/.agents/DO_NOT.md)**: Inventory of critical mistakes, anti-patterns, and golden rule violations to avoid.

---

## 2. Platform Foundation (`01-foundation/`)

- **[01-foundation/VISION.md](file:///e:/2026/ssr_one_ai/.agents/01-foundation/VISION.md)**: Executive product vision, core strategic pillars, and supported business verticals.
- **[01-foundation/PRODUCT_REQUIREMENTS.md](file:///e:/2026/ssr_one_ai/.agents/01-foundation/PRODUCT_REQUIREMENTS.md)**: Functional and non-functional product requirements for all 14 business modules.
- **[01-foundation/TECH_STACK.md](file:///e:/2026/ssr_one_ai/.agents/01-foundation/TECH_STACK.md)**: Complete list of technologies used (Python, FastAPI, PostgreSQL, React 19, Vite, TanStack) and selection rationale.
- **[01-foundation/FEATURE_MATRIX.md](file:///e:/2026/ssr_one_ai/.agents/01-foundation/FEATURE_MATRIX.md)**: Matrix mapping feature capabilities across Starter, Professional, and Enterprise licensing tiers.

---

## 3. Platform Architecture (`02-architecture/`)

- **[02-architecture/ARCHITECTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ARCHITECTURE.md)**: Canonical enterprise system architecture blueprint and service topology.
- **[02-architecture/ZERO_WAIT_POS_BLUEPRINT.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ZERO_WAIT_POS_BLUEPRINT.md)**: Approved architectural master blueprint for 0ms UI latency, offline-first Dexie.js sync, and dual in-memory hot-mounted layout.
- **[02-architecture/PROJECT_STRUCTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/PROJECT_STRUCTURE.md)**: Monorepo directory map, file inventory, and code metrics.
- **[02-architecture/FRONTEND_ARCHITECTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/FRONTEND_ARCHITECTURE.md)**: React 19, TanStack Router, Zustand, and module layering standards.
- **[02-architecture/BACKEND_ARCHITECTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/BACKEND_ARCHITECTURE.md)**: FastAPI microservices, ASGI request lifecycle, and Service-Repository pattern.
- **[02-architecture/DEPLOYMENT_ARCHITECTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DEPLOYMENT_ARCHITECTURE.md)**: Docker Compose container topology and environment specifications.
- **[02-architecture/AI_ARCHITECTURE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/AI_ARCHITECTURE.md)**: AI Copilot, RAG context retrieval, OCR invoice scanning, and voice order engines.
- **[02-architecture/MULTI_TENANCY.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/MULTI_TENANCY.md)**: Critical multi-tenant security boundary and PostgreSQL Row-Level Security (RLS) standards.
- **[02-architecture/PLATFORM_ADMIN_BLUEPRINT.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/PLATFORM_ADMIN_BLUEPRINT.md)**: Superadmin tenant provisioning, licensing keys, and platform audit logs.
- **[02-architecture/ROUTE_MAP.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ROUTE_MAP.md)**: Canonical list of frontend application routes and backend API endpoints.
- **[02-architecture/API_VERSIONING_GUIDE.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/API_VERSIONING_GUIDE.md)**: API versioning URI scheme, deprecation RFC headers, and SDK migration guidelines.
- **[02-architecture/DECISIONS/](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/)**: Complete Architectural Decision Records (ADRs):
  - [ADR-0001](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0001-module-structure.md): Module Structure Standard (5-part frontend, 5-layer backend)
  - [ADR-0002](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0002-multi-tenancy-rls.md): PostgreSQL Row-Level Security (RLS) & Tenant Isolation
  - [ADR-0003](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0003-monorepo-package-boundaries.md): Monorepo Package Boundaries & Zero Circular Dependency
  - [ADR-0004](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0004-structure-migration-complete.md): Monorepo Consolidation Complete
  - [ADR-0005](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0005-category-master-root-cause-and-governance.md): Category Master Root Cause Analysis & SSOT Rules
  - [ADR-0006](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0006-universal-multi-tenant-context-architecture.md): Universal Multi-Tenant Context Architecture
  - [ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md): Startup DDL Lock Purge & Pure SSOT Auth Context
  - [ADR-0008](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0008-ui-modernization-and-domain-functionality-transition.md): UI Modernization & Domain Functionality Transition
  - [ADR-0009](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0009-pos-kiosk-billing-and-order-edit-architecture.md): POS Kiosk Fullscreen Architecture & Tooltip Popover Engine
  - [ADR-0010](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0010-zero-wait-pos-architecture-and-dual-in-memory-mounted-layout.md): Zero-Wait POS Architecture & Dual In-Memory Hot-Mounted DOM Layout
  - [ADR-0011](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0011-marketing-web-character-guided-motion-path-architecture.md): Marketing Web Character-Guided Motion-Path Scrollytelling Architecture

---

## 4. Platform Standards (`03-standards/`)

- **[03-standards/DOCUMENTATION_STANDARD.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/DOCUMENTATION_STANDARD.md)**: Rules governing documentation creation, anti-duplication guidelines, and naming standards.
- **[03-standards/CODING_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/CODING_STANDARDS.md)**: TypeScript, React, Python, and FastAPI code quality rules.
- **[03-standards/NAMING_STANDARD.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/NAMING_STANDARD.md)**: File, class, interface, database, and package naming conventions.
- **[03-standards/MODULE_STRUCTURE.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/MODULE_STRUCTURE.md)**: Frontend 5-part architecture and backend 5-layer folder blueprint.
- **[03-standards/COMPONENT_GUIDELINES.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/COMPONENT_GUIDELINES.md)**: Usage guidelines for `@ssrone/ui` primitive components.
- **[03-standards/API_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/API_STANDARDS.md)**: REST API verb standards, HTTP status codes, and WebSocket event payloads.
- **[03-standards/DATABASE_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/DATABASE_STANDARDS.md)**: PostgreSQL DDL schemas, BigInteger IDs, audit mixins, and Alembic migrations.
- **[03-standards/SECURITY_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/SECURITY_STANDARDS.md)**: JWT authentication, CORS policies, XSS sanitization, and security compliance.
- **[03-standards/PERFORMANCE_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/PERFORMANCE_STANDARDS.md)**: Latency benchmarks, async eager loading (`selectinload`), and frontend code-splitting.
- **[03-standards/TESTING_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/TESTING_STANDARDS.md)**: Vitest unit tests, PyTest backend tests, and Playwright E2E suites.
- **[03-standards/ERROR_HANDLING_STANDARD.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/ERROR_HANDLING_STANDARD.md)**: Exception handling conventions, error payloads, and Sonner toast alerts.
- **[03-standards/ENGINE_STANDARD.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/ENGINE_STANDARD.md)**: Architecture standards for 14 enterprise engines (Workflow, Notification, Report, Audit, Print, Licensing, Tax, etc.).
- **[03-standards/GIT_STANDARD.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/GIT_STANDARD.md)**: Conventional Commits conventions and Git branch management rules.
- **[03-standards/DEVOPS_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/03-standards/DEVOPS_STANDARDS.md)**: GitHub Actions CI/CD pipeline and automated quality gates.

---

## 5. UI/UX Design (`04-design/`)

- **[04-design/DESIGN_SYSTEM.md](file:///e:/2026/ssr_one_ai/.agents/04-design/DESIGN_SYSTEM.md)**: HSL design token CSS variables, typography scale, and micro-animation specs.
- **[04-design/NAVIGATION_STANDARDS.md](file:///e:/2026/ssr_one_ai/.agents/04-design/NAVIGATION_STANDARDS.md)**: Platform home landing law and dynamic module sidebar rules.
- **[04-design/UI_PATTERNS.md](file:///e:/2026/ssr_one_ai/.agents/04-design/UI_PATTERNS.md)**: Form design with Zod validation, TanStack data tables, and dashboard KPI grid patterns.

---

## 6. Quality & Governance (`05-quality/` & `06-governance/`)

- **[05-quality/CURRENT_STATE_SAFEGUARD.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/CURRENT_STATE_SAFEGUARD.md)**: Zero-Ruination Protocol, Monorepo Baseline Snapshot, and 10 Non-Negotiable Invariants.
- **[05-quality/DEFINITION_OF_DONE.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/DEFINITION_OF_DONE.md)**: Checklist defining criteria required before marking features as DONE.
- **[05-quality/CODE_REVIEW_CHECKLIST.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/CODE_REVIEW_CHECKLIST.md)**: Code reviewer checklist for Pull Request approvals.
- **[05-quality/FINAL_SIGN_OFF_CHECKLIST.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/FINAL_SIGN_OFF_CHECKLIST.md)**: Monorepo architecture, multi-tenant security, and code integrity final sign-off checklist.
- **[06-governance/CHANGE_MANAGEMENT.md](file:///e:/2026/ssr_one_ai/.agents/06-governance/CHANGE_MANAGEMENT.md)**: Governance policy for introducing architectural changes via ADRs.
- **[06-governance/RELEASE_MANAGEMENT.md](file:///e:/2026/ssr_one_ai/.agents/06-governance/RELEASE_MANAGEMENT.md)**: Semantic versioning and release tagging policies.
- **[06-governance/CODE_OF_CONDUCT.md](file:///e:/2026/ssr_one_ai/.agents/06-governance/CODE_OF_CONDUCT.md)**: Community standards, pledge, and enforcement policies.
- **[06-governance/CONTRIBUTING.md](file:///e:/2026/ssr_one_ai/.agents/06-governance/CONTRIBUTING.md)**: Developer setup, branching strategy, and contribution guidelines.

---

## 7. Domain Specifications (`07-modules/`)

- **[07-modules/MODULE_SPECIFICATIONS.md](file:///e:/2026/ssr_one_ai/.agents/07-modules/MODULE_SPECIFICATIONS.md)**: Master index for domain specifications.
- **[07-modules/POS_MODULE_SPECIFICATION.md](file:///e:/2026/ssr_one_ai/.agents/07-modules/POS_MODULE_SPECIFICATION.md)**: Point of Sale, KOT, and Kitchen Display System specification.
- **[07-modules/PMS_MODULE_SPECIFICATION.md](file:///e:/2026/ssr_one_ai/.agents/07-modules/PMS_MODULE_SPECIFICATION.md)**: Hotel PMS, Room Inventory, and PG Management specification.
- **[07-modules/CRM_MODULE_SPECIFICATION.md](file:///e:/2026/ssr_one_ai/.agents/07-modules/CRM_MODULE_SPECIFICATION.md)**: Customer Relationship Management and Loyalty specification.

---

## 8. AI Operating Rules & Living Tasks (`08-ai-rules/` & `09-tasks/`)

- **[08-ai-rules/AI_DEVELOPMENT_RULES.md](file:///e:/2026/ssr_one_ai/.agents/08-ai-rules/AI_DEVELOPMENT_RULES.md)**: Operating rules and anti-patterns for AI assistants.
- **[08-ai-rules/ENTERPRISE_ARCHITECT_AI_CONSTITUTION.json](file:///e:/2026/ssr_one_ai/.agents/08-ai-rules/ENTERPRISE_ARCHITECT_AI_CONSTITUTION.json)**: Machine-readable AI persona constitution.
- **[09-tasks/PENDING_WORK_ROADMAP.md](file:///e:/2026/ssr_one_ai/.agents/09-tasks/PENDING_WORK_ROADMAP.md)**: Living roadmap phases and active milestone tasks.
- **[09-tasks/ROUTING_TODO.md](file:///e:/2026/ssr_one_ai/.agents/09-tasks/ROUTING_TODO.md)**: Client-side SPA navigation completion matrix.
- **[09-tasks/FEATURE_LICENSING_TASKS.md](file:///e:/2026/ssr_one_ai/.agents/09-tasks/FEATURE_LICENSING_TASKS.md)**: Living task tracker for feature licensing and tier entitlement checks.
- **[archive/](file:///e:/2026/ssr_one_ai/.agents/archive/)**: Historical prompts and archived one-off specifications.
