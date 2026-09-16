# SSR One AI – Monorepo Directory & File Tree Structure

> **Enterprise Platform Topology Map & Automated Code Metrics**  
> **Last Updated**: August 2026

---

## 1. Repository Executive Summary

| Metric | Count / Value |
| :--- | :--- |
| **Total Directories** | `78` |
| **Total Files** | `214` |
| **Total Lines of Code** | `42,850` lines |
| **Total Repository Size** | `1.48 MB` |

---

## 2. File Extension Breakdown

| Extension | File Count | Total Lines | Total Size |
| :--- | :--- | :--- | :--- |
| `.ts` | 64 | 14,250 | 412 KB |
| `.tsx` | 52 | 12,800 | 385 KB |
| `.py` | 38 | 7,650 | 220 KB |
| `.md` | 32 | 5,420 | 185 KB |
| `.json` | 14 | 1,480 | 42 KB |
| `.sql` | 4 | 820 | 28 KB |
| `.css` | 6 | 430 | 14 KB |
| `.html` | 4 | 220 | 8 KB |

---

## 3. Top Code Files (by File Size & Lines)

| File Path | Size | Lines |
| :--- | :--- | :--- |
| `apps/platform-admin/src/App.tsx` | 24.50 KB | 650 lines |
| `.agents/AGENTS.md` | 10.20 KB | 280 lines |
| `database/schema/002_business_tables.sql` | 14.78 KB | 380 lines |
| `scripts/check_project_structure.py` | 8.86 KB | 245 lines |
| `apps/platform-admin/src/components/LicenseWizardModal.tsx` | 8.13 KB | 240 lines |
| `scripts/generate_full_tree.py` | 7.85 KB | 225 lines |
| `.agents/DO_NOT.md` | 6.52 KB | 175 lines |
| `apps/platform-admin/src/components/SidebarNav.tsx` | 5.97 KB | 180 lines |
| `apps/platform-admin/src/components/CommandHeader.tsx` | 5.58 KB | 160 lines |
| `apps/platform-admin/src/components/ClusterTelemetryView.tsx` | 5.30 KB | 150 lines |

---

## 4. Monorepo Port & Service Map

| Service / Sub-App | Port | Technology | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **FastAPI Backend API** | `8000` | Python 3.12 / FastAPI / SQLAlchemy / AsyncPG | Single Source of Truth Async API Gateway & Multi-Tenant RLS |
| **Admin ERP Web (`admin-web`)** | `5173` | React 19 / Vite / TanStack Router | Tenant ERP Workspace (POS, Hotel, HR, CRM, Inventory, Finance) |
| **Platform Admin (`platform-admin`)** | `5174` | React 19 / Vite / Tailwind / Lucide | SaaS Superadmin Portal (Tenants, Licensing Keys, DB Telemetry) |
| **Kitchen Display (`kds-web`)** | `8083` | React 19 / Vite | 5-Mode Kitchen Operations System (Cook, Batch, EXPO, Packing, SLA) |
| **Queue Token Web (`token-order-web`)** | `3003` | React 19 / Vite / Tailwind | Mobile Fast-Order & Queue-Buster 3-Digit Token Generation (`#104`) |
| **Customer Food Web (`customer-food-web`)** | `3000` | React 19 / Vite | Digital Food Ordering & QR Menu Web App |
| **Customer Stay Web (`customer-stay-web`)** | `3001` | React 19 / Vite | Hotel Room Stay, Digital Check-in & Guest Services |
| **Staff & Waiter Portal (`staff-web`)** | `8084` | React 19 / Vite | Mobile Staff Operations (Housekeeping, Room Service, KOT) |
| **Marketing Web (`marketing-web`)** | `3002` | React 19 / Vite / GSAP | Character-Guided Motion-Path Scrollytelling & Lead Ingestion |

---

## 5. Complete Monorepo Recursive File Tree

```
ssr_one_ai
├── .agents/                                # Monorepo Governance, Architecture & AI Operating Rules
│   ├── 01-foundation/                      # Product Vision & Vertical Strategy
│   │   ├── FEATURE_MATRIX.md               # Tier Entitlements (Starter, Pro, Enterprise)
│   │   ├── PRODUCT_REQUIREMENTS.md         # Requirements for all 14 Modules
│   │   ├── TECH_STACK.md                   # Technology Choices (Python, FastAPI, PostgreSQL, React 19)
│   │   └── VISION.md                       # Strategic Vision & Roadmap
│   ├── 02-architecture/                    # Enterprise Architecture Blueprints
│   │   ├── DECISIONS/                      # Architectural Decision Records (ADRs)
│   │   │   ├── ADR-0001-module-structure.md
│   │   │   ├── ADR-0002-multi-tenancy-rls.md
│   │   │   ├── ADR-0003-monorepo-package-boundaries.md
│   │   │   ├── ADR-0004-structure-migration-complete.md
│   │   │   ├── ADR-0005-category-master-root-cause-and-governance.md
│   │   │   ├── ADR-0006-universal-multi-tenant-context-architecture.md
│   │   │   ├── ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md
│   │   │   ├── ADR-0008-ui-modernization-and-domain-functionality-transition.md
│   │   │   ├── ADR-0009-pos-kiosk-billing-and-order-edit-architecture.md
│   │   │   ├── ADR-0010-zero-wait-pos-architecture-and-dual-in-memory-mounted-layout.md
│   │   │   ├── ADR-0011-marketing-web-character-guided-motion-path-architecture.md
│   │   │   └── template.md
│   │   ├── AI_ARCHITECTURE.md              # AI Copilot, RAG Retrieval & OCR Specs
│   │   ├── API_VERSIONING_GUIDE.md         # API Versioning URI Scheme & RFC Specs
│   │   ├── ARCHITECTURE.md                 # Single Source of Truth System Topology
│   │   ├── BACKEND_ARCHITECTURE.md         # FastAPI Microservices & Service-Repository Pattern
│   │   ├── DEPLOYMENT_ARCHITECTURE.md      # Docker Container Topology & Environments
│   │   ├── FRONTEND_ARCHITECTURE.md        # React 19, TanStack Router & Zustand Standards
│   │   ├── MULTI_TENANCY.md                # PostgreSQL Row-Level Security (RLS) Standards
│   │   ├── PLATFORM_ADMIN_BLUEPRINT.md     # Platform Superadmin Onboarding Blueprint
│   │   ├── PROJECT_STRUCTURE.md            # Recursive Monorepo File Tree Map
│   │   ├── ROUTE_MAP.md                    # Frontend SPA Routes & Backend API Endpoint Map
│   │   └── ZERO_WAIT_POS_BLUEPRINT.md      # Zero-Wait POS Master Architecture Blueprint
│   ├── 03-standards/                       # Quality & Design Standards
│   │   ├── API_STANDARDS.md                # REST Verbs, Status Codes & WebSocket Payloads
│   │   ├── CODING_STANDARDS.md             # TypeScript, React, Python Code Rules
│   │   ├── COMPONENT_GUIDELINES.md         # @ssrone/ui Primitive Specs
│   │   ├── DATABASE_STANDARDS.md           # PostgreSQL DDL Schemas & Alembic Guidelines
│   │   ├── DEVOPS_STANDARDS.md             # CI/CD Pipeline & Quality Gates
│   │   ├── DOCUMENTATION_STANDARD.md       # Rules Governing Documentation & Structure
│   │   ├── ENGINE_STANDARD.md              # Workflow, Notification & Audit Engine Specs
│   │   ├── ERROR_HANDLING_STANDARD.md      # Exception Handling & Toast Alert Standards
│   │   ├── GIT_STANDARD.md                 # Conventional Commits Conventions
│   │   ├── MODULE_STRUCTURE.md             # Frontend 5-part & Backend 5-layer Blueprint
│   │   ├── NAMING_STANDARD.md              # Naming Conventions across Layers
│   │   ├── PERFORMANCE_STANDARDS.md        # Latency Benchmarks & Frontend Code Splitting
│   │   ├── SECURITY_STANDARDS.md           # JWT Authentication & CORS Policies
│   │   └── TESTING_STANDARDS.md            # Vitest, PyTest & Playwright Standards
│   ├── 04-design/                          # Design Tokens & UI Patterns
│   │   └── DESIGN_SYSTEM.md                # HSL Tokens, Typography & Motion Specs
│   ├── 05-quality/                         # Quality & Verification Specs
│   │   └── DEFINITION_OF_DONE.md           # Definition of Done Criteria
│   ├── 06-governance/                      # Governance & Release Policies
│   │   ├── CHANGE_MANAGEMENT.md            # Governance Policy for Architecture Changes
│   │   ├── CODE_OF_CONDUCT.md              # Community Standards & Enforcement
│   │   ├── CONTRIBUTING.md                 # Developer Setup & Branching Strategy
│   │   └── RELEASE_MANAGEMENT.md           # Semantic Versioning & Release Tagging
│   ├── 07-modules/                         # Domain Module Specifications
│   │   ├── CRM_MODULE_SPECIFICATION.md     # CRM & Loyalty Specs
│   │   ├── MODULE_SPECIFICATIONS.md        # Domain Specification Master Index
│   │   ├── PMS_MODULE_SPECIFICATION.md     # Hotel PMS & Room Inventory Specs
│   │   └── POS_MODULE_SPECIFICATION.md     # POS, KOT & Floor Plan Specs
│   ├── 08-ai-rules/                        # AI Operating Rules
│   │   ├── AI_DEVELOPMENT_RULES.md         # AI Operating Rules & Anti-Patterns
│   │   └── ENTERPRISE_ARCHITECT_AI_CONSTITUTION.json # Machine-Readable AI Constitution
│   ├── 09-tasks/                           # Living Task Trackers
│   │   ├── FEATURE_LICENSING_TASKS.md      # Licensing & Tier Entitlement Tasks
│   │   ├── PENDING_WORK_ROADMAP.md         # Active Roadmap & Milestone Tasks
│   │   └── ROUTING_TODO.md                 # Client SPA Navigation Matrix
│   ├── archive/                            # Archived One-off Specifications
│   ├── AGENTS.md                           # Master Documentation Index & Golden Rules
│   ├── DO_NOT.md                           # Inventory of Critical Anti-Patterns
│   └── PROJECT_BRIEF.md                    # Platform Overview Brief
│
├── apps/                                   # Client Applications (8 Frontends)
│   ├── admin-web/                          # [Port 5173] Tenant ERP Workspace Suite
│   │   ├── src/
│   │   │   ├── app/                        # Main Layout & TanStack Router Configuration
│   │   │   ├── assets/                     # Application Icons & Static Assets
│   │   │   ├── main.tsx                    # React Entry Point
│   │   │   ├── modules/                    # Domain Modules (POS, Hotel, PG, CRM, HR, Finance, etc.)
│   │   │   ├── platform/                   # Core Engine Connectors & Tenant Providers
│   │   │   ├── shared/                     # Shared UI Layouts, Utils & Helpers
│   │   │   └── theme/                      # Styling & HSL Tokens
│   │   ├── Dockerfile
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── nginx.conf
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── platform-admin/                     # [Port 5174] SaaS Superadmin Control Center
│   │   ├── src/
│   │   │   ├── components/                 # CommandHeader, SidebarNav, ClusterTelemetryView, LicenseWizardModal
│   │   │   ├── data/                       # Mock & Telemetry Data Specs
│   │   │   ├── App.tsx                     # Main Superadmin Dashboard Container
│   │   │   ├── index.css                   # Glassmorphism UI Styling Tokens
│   │   │   ├── main.tsx                    # Entry Point
│   │   │   └── types.ts                    # Admin Dashboard Type Definitions
│   │   ├── README.md
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── customer-food-web/                  # [Port 3000] Customer Digital Food Ordering Web
│   │   ├── src/                            # App, Pages, Components, Stores, i18n
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   └── vite.config.ts
│   │
│   ├── customer-stay-web/                  # [Port 3001] Customer Hotel Stay & Check-in Web
│   │   ├── src/                            # Hotel Check-in & Guest Services UI
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── kds-web/                            # [Port 8083] 5-Mode Kitchen Operations System (KOS)
│   │   ├── src/                            # Cook Station, Batch Prep, EXPO, Packing, SLA Manager
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── token-order-web/                    # [Port 3003] Mobile Fast-Order & Queue-Buster Token Web
│   │   ├── src/                            # Fast Order Assembly & 3-Digit Token (#104) Generator
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── staff-web/                          # [Port 8084] Waiter Captain & Mobile POS App
│   │   ├── src/                            # Restaurant Captain POS Interface
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── marketing-web/                      # [Port 3002] Character-Guided Motion-Path Scrollytelling
│       ├── src/                            # 7 Story Beats, SVG Emerald Motion Path, Lead Ingestion
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── packages/                               # Shared Monorepo Workspace Libraries (13 npm Packages)
│   ├── api-client/                         # Axios Gateway Client (@ssrone/api-client)
│   ├── auth/                               # Monorepo Auth & Session Store (@ssrone/auth)
│   ├── charts/                             # Recharts Wrappers (@ssrone/charts)
│   ├── config/                             # TypeScript & ESLint Rules (@ssrone/config)
│   ├── forms/                              # Form Engine Library (@ssrone/forms)
│   ├── hooks/                              # Custom React Hooks (@ssrone/hooks)
│   ├── icons/                              # Icon Exports (@ssrone/icons)
│   ├── navigation/                         # Unified Navigation (@ssrone/navigation)
│   ├── tables/                             # Data Table Wrappers (@ssrone/tables)
│   ├── theme/                              # HSL CSS Color Tokens (@ssrone/theme)
│   ├── types/                              # Monorepo Interfaces (@ssrone/types)
│   ├── ui/                                 # Primitive Component System (@ssrone/ui)
│   └── utils/                              # Shared Utilities (@ssrone/utils)
│
├── services/                               # Backend Microservices
│   └── backend/                            # [Port 8000] FastAPI Microservices Backend
│       ├── migrations/                     # Alembic Database Migrations
│       ├── scripts/                        # Database & Service Scripts
│       ├── src/
│       │   ├── ai/                         # GenAI LLM & Demand Forecast Engines
│       │   ├── api/                        # REST API Router Endpoints (v1)
│       │   ├── core/                       # Database Session, Config, Security & Event Bus
│       │   ├── engines/                    # 14 Enterprise Engines (Workflow, Notification, Audit, Print, Licensing, Tax, etc.)
│       │   ├── integrations/               # Payment Gateways, WhatsApp & SMS Integrations
│       │   ├── modules/                    # Business Microservice Modules (auth, restaurant, hotel, crm, hr, finance, etc.)
│       │   ├── shared/                     # Cloud & Local Storage Abstraction
│       │   └── workers/                    # Background Worker Tasks & Async Queues
│       ├── main.py                         # ASGI FastAPI Application Entry Point
│       ├── alembic.ini                     # Database Migration Config
│       ├── Dockerfile                      # Backend Container Blueprint
│       ├── pyproject.toml                  # Python Project Settings
│       └── requirements.txt                # Backend Python Dependencies
│
├── database/                               # Database Schemas & Seeds
│   ├── schema/                             # PostgreSQL DDL Schemas & Row-Level Security (RLS)
│   │   ├── 002_business_tables.sql         # Business Domain Database Schema
│   │   └── platform_tables.sql             # SaaS Platform & Tenant Provisioning Schema
│   ├── functions/                          # Stored Functions & Triggers
│   ├── seed/                               # Database Seeding Data
│   └── views/                              # Analytical Database Views
│
├── infrastructure/                         # Docker & Deployment Configurations
│   └── docker/                             # Docker Compose Files
│       ├── docker-compose.dev.yml          # Local Development Topology
│       └── docker-compose.prod.yml         # Production Container Topology
│
├── scripts/                                # Maintenance & Automated Verification Scripts
│   ├── apply_normalized_schema.py          # Database Schema Normalization Script
│   ├── check_project_structure.py          # Monorepo Structure & Compliance Validator
│   ├── generate_full_tree.py               # Complete Recursive Monorepo Tree Generator
│   ├── inspect_db_tables.py                # Database Table Inspector
│   ├── link_platform_admin_node_modules.py # Monorepo Workspace Junction Linker
│   ├── purge_extra_tables.py               # Database Cleanup Utility
│   ├── remove_legacy_admin_platform.py     # Legacy Cleanup Script
│   ├── rename_project.sh                   # Monorepo Renaming Utility
│   ├── reset_db_tables.py                  # Database Table Reset Script
│   ├── scaffold_module.py                  # Module Generator Script
│   ├── truncate_all_tables.py              # Data Truncation Utility
│   └── verify_table_counts.py              # Schema Table Count Verifier
│
├── docs/                                   # Platform Documentation
├── learning/                               # Internal Training & Guides
├── metadata/                               # Module Metadata & Schemas
├── plugins/                                # Platform Extensibility Plugins
├── tools/                                  # Internal CLI & Developer Tools
├── tests/                                  # Monorepo E2E & Integration Test Suites
│
├── .gitignore                              # Git Exclusion Rules
├── .npmrc                                  # npm/pnpm Workspace Registry Rules
├── CHANGELOG.md                            # Version Release History
├── CODEOWNERS                              # Code Ownership Assignments
├── CODE_OF_CONDUCT.md                      # Community Guidelines
├── CONTRIBUTING.md                         # Contribution Guidelines
├── GLOSSARY.md                             # Domain Business Glossary
├── LICENSE                                 # Platform License Agreement
├── README.md                               # Primary Monorepo Overview
├── SECURITY.md                             # Security Reporting Policies
├── package.json                            # Root Monorepo Workspace Definition
├── pnpm-workspace.yaml                     # pnpm Multi-package Configuration
├── pyrightconfig.json                      # Python Static Type Checker Settings
├── run.bat                                 # Windows Monorepo Dev Launcher
├── tsconfig.base.json                      # Base TypeScript Compiler Configuration
└── turbo.json                              # Turborepo Build Pipeline Task Settings
```
