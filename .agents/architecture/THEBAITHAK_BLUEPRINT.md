# 🏢 THE BAITHAK – WORLD‑CLASS HOSPITALITY PLATFORM
## Master Blueprint Document (FINAL - Single Source of Truth)

**Version:** 12.1  
**Status:** 📐 ENTERPRISE ARCHITECTURE BASELINE (FROZEN)  
**Last Updated:** June 2026  
**Audience:** Architects, Senior Developers, Enterprise Clients, Implementation Teams

---

## Table of Contents

1. Executive Summary & Vision
2. Core Philosophy & Non-Negotiable Engineering Principles
3. Technology Stack & Developer Tooling (LOCKED)
4. System Architecture Overview
5. Database-First & Metadata-Driven Design
6. Core Platform Engines
7. Mobile & Offline Sync Architecture
8. Core Platform Domain Model & Ecosystem Components
9. Backend Architecture (World-Class Python & FastAPI)
10. Frontend Architecture (World-Class React & TanStack)
11. The Baithak Design Language (TBDL) v1.0 Enterprise Hospitality UI/UX Design Constitution
12. Ultra Performance Standards
13. Enterprise User Experience Standards
14. Security, Privacy & Compliance
15. Observability, SLO/SLA & Operations
16. AI Governance Framework
17. Development Constitution, Exclusions & Version Compatibility
18. DevOps, Delivery & Disaster Recovery
19. Scalability & Capacity Planning
20. Testing & Quality Engineering Standards
21. Product Lifecycle & Release Governance
22. Non-Functional Requirements (NFR) Matrix & Data Lifecycle
23. Project Risk Register
24. Architecture Decision Records (ADR-001 to ADR-005)
25. Kickoff Deliverables & Enterprise Architecture Governance
26. Definition of Architecture Complete

---

## 1. EXECUTIVE SUMMARY & VISION

### 1.1 What is The Baithak Hospitality Platform?

**The Baithak Hospitality Platform** is a modular, AI-native, metadata-driven enterprise platform for hospitality businesses. Rather than a traditional, rigid ERP, it is a unified **Hospitality Operating System** combining ERP, CRM, POS, PMS (Hotel Property Management), PG Management, CMS, PWA, Customer Engagement, Analytics, and AI into one cohesive ecosystem powered by a single core business engine.

It is designed to serve a range of hospitality verticals:
* Restaurants & Cafés
* Hotels, Resorts & Banquets
* PG / Hostels / Student Accommodations
* Sweet Shops (Mistan Bhandar) & Bakeries
* Cloud Kitchens & Food Courts
* Multi‑Outlet & Franchise Chains

### 1.2 Core Value Proposition

**One Platform. Every Hospitality Business.**

By utilizing a single, highly flexible PostgreSQL database and metadata engines, the platform enables operators to run diverse business types on a unified system.

```
                              THE BAITHAK
                                   │
     ─────────────────────────────────────────────────────────────
              Customer Website | PWA | QR Ordering | Mobile App
     ─────────────────────────────────────────────────────────────
      Restaurant | Hotel | PG | Sweet Shop | Bakery | Cloud Kitchen
     ─────────────────────────────────────────────────────────────
         Inventory | Finance | CRM | HRMS | Payroll | Assets |
                          Maintenance | Tasks
     ─────────────────────────────────────────────────────────────
               AI | Analytics | CMS | API | Marketplace | IoT
     ─────────────────────────────────────────────────────────────
      Vendor Portal | Employee Portal | Owner Portal | Franchise Portal |
                            Customer Portal
     ─────────────────────────────────────────────────────────────
             Reports | Dashboards | Automation | Notifications |
                               Security
```

### 1.3 Architectural Vision: Engines Over Modules

To achieve massive scale without codebase bloating, The Baithak is built on **reusable core engines** instead of isolated, custom-coded modules. Features, validation, workflow approvals, pricing calculations, and even UI layouts are dynamically driven by database metadata. 

> [!IMPORTANT]
> **The Golden Rule of The Baithak Development:**
> Never write customer-specific or branch-specific code to solve a problem. If a client needs a custom layout, workflow, or pricing rule, it must be solved by enhancing a reusable metadata engine or configuration, not by adding `if-else` blocks in the codebase.

---

## 2. CORE PHILOSOPHY & NON-NEGOTIABLE ENGINEERING PRINCIPLES

### 2.1 Guiding Principles

| Principle | Meaning |
|-----------|---------|
| **Database-First** | The database remains the final, absolute system of truth. |
| **Metadata-Driven** | UI layouts, workflows, permissions, and features are loaded dynamically from metadata tables. |
| **Engine-Centric** | Business logic is handled by generic engines (Pricing, Tax, Workflow) rather than hardcoded modules. |
| **SaaS & White-Label Ready**| The platform is multi-tenant, multi-company, and white-labeled from day one. |
| **Configuration > Code**| All customer-specific requirements are resolved via configuration settings. |
| **Consistent Experience** | Unified Design Language (TBDL) guarantees a highly polished, predictable interface. |
| **Auditability** | Every change, transaction, and system event is tracked, versioned, and reversible. |

### 2.2 The 10 Conditions for Commercial Success

To ensure long-term scalability and commercial readiness, the development team must adhere strictly to these ten architectural conditions:

1. **Never Write Customer-Specific Code:** Address specific client requests by extending metadata configurations, custom fields, or form definitions.
2. **Never Hardcode Business Types:** Verticals like Restaurants, Hotels, or PGs are records in the `business_type` engine, not separate codebase paths.
3. **Everything Configurable:** Settings must dictate invoice numbers, approval flows, discount rules, payment gateways, and branch configurations.
4. **Complete White-Labeling:** Tenants can customize logos, themes, domains, custom CSS, SMS, email templates, and invoices without code deployments.
5. **Module Licensing & Feature Engines:** Enable or disable modules (POS, PMS, Inventory) via licensing and feature master configurations.
6. **Multi-Company Hierarchy:** Support single-tenant entities owning multiple distinct companies with different VAT/GST IDs.
7. **Multi-Branch Operations:** Real-time visibility and inventory transfers across branches, warehouses, and franchises.
8. **Granular Role-Based Permissions (RBAC):** Permissions are checked at the database level (RLS), API router, and frontend components.
9. **AI as a Business Assistant:** Move beyond visual gimmicks. The AI engine acts as an agent executing reports, forecasting stock, and querying trends.
10. **Mobile First UI:** Empower business owners to configure, monitor, and run operations entirely from a touch-friendly mobile interface.

### 2.3 Non-Negotiable Engineering Principles

These principles govern every technical decision throughout the product lifecycle:

1. **Performance First:** Every feature must be designed and optimized for speed before developer convenience.
2. **Configuration Before Customization:** If a customer requirement can be solved through configuration, metadata, workflows, or rules, no custom code should be written.
3. **Reuse Before Rewrite:** Never duplicate business logic. Always extend existing shared engines.
4. **Database is the Source of Truth:** Business state belongs strictly to PostgreSQL. Frontend state is temporary.
5. **API First:** Every platform capability must be accessible through secure, versioned APIs. The frontend is only one consumer.
6. **AI is an Assistant:** AI recommends and generates; humans review and approve. AI never performs irreversible business actions without explicit human authorization.
7. **Mobile Equals Desktop:** Business-critical operations must work equally well across desktop screens, tablets, and mobile devices.
8. **Offline by Design:** Critical local checkout and KDS systems continue without internet connectivity and synchronize automatically when online.
9. **Security by Default:** Every API, table, feature, and integration starts with secure defaults. Permissions must be explicit.
10. **Observability by Default:** Every operation produces structured logs, performance metrics, OpenTelemetry traces, and transaction audit records.
11. **Accessibility by Default:** Every screen complies with accessibility standards (WCAG 2.2 AA) and supports keyboard navigation.
12. **Backward Compatibility:** Platform upgrades must never break existing customer environments or custom reports.
13. **Zero Data Loss:** Every business transaction is either fully committed or fully rolled back.
14. **Everything is Versioned:** Database migrations, APIs, configurations, prompts, template documents, reports, workflows, and themes are versioned.
15. **Customer Success:** Every feature must reduce user effort. Never increase complexity.

---

## 3. TECHNOLOGY STACK & DEVELOPER TOOLING (LOCKED)

The technology stack is unified and optimized for instant responsiveness, horizontal scaling, and robust AI integration.

### 3.1 Core Architecture Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | Component-based UI library |
| **TypeScript** | 5.x | Enforces strict, type-safe development |
| **Vite** | 5.x | Lightning-fast build tool and dev server |
| **TanStack Router** | 7.x | Strict type-safe client-side routing & prefetching |
| **TanStack Query** | 5.x | Server state synchronization, caching, and optimistic updates |
| **Tailwind CSS** | 3.x | Design system styling utilities |
| **shadcn/ui** | Latest | Tailwind-based premium components |
| **Lucide React** | Latest | The single, standard icon library |
| **Zod** | Latest | Client-side validation schemas |
| **React Hook Form** | Latest | High-performance form state management |
| **FastAPI** | Latest | High-performance Python ASGI API framework |
| **SQLAlchemy** | 2.x | Async ORM mapping for PostgreSQL |
| **PostgreSQL** | 16+ | Enterprise relational database |
| **Redis** | 7.x | Caching, session management, and Celery broker |
| **Celery** | 5.x | Asynchronous task queue for heavy processes |
| **WebSockets** | Native | Real-time event broadcasting (KDS, notifications) |
| **Pydantic** | 2.x | Data validation and settings management |
| **Alembic** | Latest | Database migration manager |

### 3.2 Standardized Development & Quality Tools
To ensure codebase consistency and long-term maintainability, the project implements locked-in dev tools:

* **Code Quality & Formatting:**
  * **Ruff:** High-speed linter and import organizer for Python.
  * **Black:** Standard code formatter for Python backend scripts.
  * **ESLint & Prettier:** Strictly enforces React and TypeScript formatting rules.
  * **Husky:** Prevents unformatted or failing code from being committed using pre-commit git hooks.
* **Testing Toolchain:**
  * **Pytest:** Backend unit and integration tests.
  * **Playwright:** End-to-end browser automation for UI flows.
  * **Vitest:** High-performance React unit testing.
* **Monitoring & Operations:**
  * **Sentry:** Production error tracking and trace log compilation.
  * **Prometheus & Grafana:** Infrastructure performance dashboarding.

### 3.3 AI & Analytics Stack

* **AI Gateway:** Unified proxy wrapper supporting OpenAI, Anthropic, Gemini, and local model adapters with provider failover.
* **Vector Store & RAG:** pgvector extension in PostgreSQL for contextual knowledge retrieval.
* **Forecasting:** Prophet / ARIMA pipelines for inventory and reservation forecasting.
* **OCR & Document Parsing:** Tesseract / Google Document AI integrations for vendor bills.
* **AI Model Insights:** Token cost tracking, latency metrics, model health dashboards, and usage analytics.
* **AI Audit Logging:** Persist prompt history, response metadata, approval actions, and cost attributions.

### 3.4 Platform & Integration Governance Stack

* **Platform Studio:** Admin metadata studio for creating tables, forms, pages, reports, dashboards, APIs, workflows, and automations without developer intervention.
* **API Contract Governance:** OpenAPI-first engineering, backward compatibility, deprecation policy, and consumer contract testing.
* **API Gateway Layer:** Rate limiting, API keys, API analytics, API monetization, webhook management, and API policy enforcement.
* **Integration Hub:** Connector framework for WhatsApp, SMS, Email, Payment Gateways, Accounting APIs, Government APIs, OTA APIs, and Maps.
  * Adapter pattern using `integration_provider`, `integration_instance`, `integration_log`, and `integration_retry` constructs.
* **Scheduler Engine:** Dedicated scheduling engine for night audits, inventory synchronization, AI training jobs, report generation, backups, and notification delivery.
* **Cost Governance:** Track per-tenant costs for database, storage, AI, notifications, and API usage, and enforce budget thresholds.
* **Data Retention Governance:** Retention rules, archive rules, purge rules, and legal hold management.
* **Franchise & Multi-Brand Governance:** Hierarchies Tenant → Brand → Region → Branch with brand standards, menus, pricing, and reporting as metadata-driven constructs.

### 3.5 Enterprise Directory Structure

The Baithak codebase enforces a highly structured, scalable, monorepo-friendly folder layout to keep applications, shared packages, backend modules, database schemas, and documentation organized:

```
baithak/
├── apps/                        # Frontend Web & Mobile Applications
│   ├── admin-web/               # Admin & Staff ERP dashboard (Vite + React + TanStack)
│   ├── customer-food-web/       # Customer-facing food ordering PWA (Vite + React)
│   ├── customer-stay-web/       # Customer-facing hotel & accommodation booking PWA
│   ├── kds-web/                 # Kitchen Display System web view (WebSockets-enabled)
│   ├── staff-web/               # Employee self-service & operation dashboard
│   └── mobile-app/              # Cross-platform mobile app (React Native / Expo)
│
├── backend/                     # High-performance FastAPI Python Backend
│   ├── src/
│   │   ├── core/                # Core platform utilities (database, event_bus, tax/pricing engines)
│   │   ├── modules/             # Business modules
│   │   │   ├── restaurant/      # POS, Restaurant, and Order management modules
│   │   │   ├── hotel/           # Hotel property management (PMS), rooms, and reservations
│   │   │   ├── inventory/       # Stock tracking and stock movement logs
│   │   │   ├── finance/         # Financial accounting ledger, billing, and invoicing
│   │   │   ├── crm/             # Customer profiles, feedback, and loyalty points
│   │   │   ├── hrms/            # Staff records, payroll, and attendance
│   │   │   ├── procurement/     # Vendor management and purchase orders
│   │   │   └── analytics/       # Dynamic report generation and analytics hooks
│   │   ├── engines/             # Core functional metadata engines
│   │   │   ├── workflow/        # Visual Workflow Designer & state-machine executor
│   │   │   ├── rules/           # Conditional validation rule evaluator
│   │   │   ├── licensing/       # Tenant feature permission and quota enforcer
│   │   │   ├── search/          # Unified multi-module search engine
│   │   │   ├── notification/    # Central notification delivery dispatcher
│   │   │   ├── audit/           # Auditable system logs & change history tracker
│   │   │   ├── timeline/        # Shared transaction and event timeline logs
│   │   │   └── attachment/      # Generic file upload and media attachment engine
│   │   ├── ai/                  # AI Copilot and Agentic frameworks
│   │   │   ├── copilot/         # Chat stream, context building, and session manager
│   │   │   ├── agents/          # Multi-agent collaboration engine (CEO, CRM, Kitchen agents)
│   │   │   ├── rag/             # PostgreSQL pgvector document retrieval pipelines
│   │   │   └── prompts/         # Versioned prompt template library
│   │   ├── integrations/        # Adapters for third-party systems
│   │   │   ├── whatsapp/        # WhatsApp BSP automation
│   │   │   ├── payment/         # Stripe, Razorpay, and UPI gateways
│   │   │   ├── gst/             # Government GSTIN validator and GSTR-1 e-filing
│   │   │   ├── email/           # SMTP, SendGrid, and Mailgun handlers
│   │   │   ├── sms/             # Twilio and local telecom gateways
│   │   │   └── ota/             # Channel manager & online travel agents (Booking.com, Expedia)
│   │   ├── workers/             # Celery background tasks and queues
│   │   └── api/                 # App server config and routes setup
│   ├── migrations/              # Alembic database migrations
│   ├── tests/                   # Pytest unit, integration, and E2E tests
│   ├── scripts/                 # Maintenance, data seeding, and utility scripts
│   ├── Dockerfile               # Production container definition
│   └── pyproject.toml           # Backend linting, formatting, and dependency config
│
├── packages/                    # Shared configuration & library packages
│   ├── ui/                      # Reusable components built on shadcn/ui
│   ├── design-system/           # Unified CSS theme values, typography, and assets
│   ├── api-client/              # Type-safe Axios/TanStack Query client package
│   ├── auth/                    # Shared JWT and OAuth helper routines
│   ├── types/                   # Unified TypeScript definitions and interfaces
│   └── utils/                   # General utility routines
│
├── database/                    # Raw database scripts & configurations
│   ├── schema/                  # Initial schemas, DDL scripts, and tables creation
│   ├── seeders/                 # Default records and demo datasets
│   ├── functions/               # SQL functions and procedures
│   ├── views/                   # Dynamic analytics views
│   └── reports/                 # Custom reporting query templates
│
├── infrastructure/              # Deployment and operations configuration
│   ├── docker/                  # Local and production docker files
│   ├── nginx/                   # Reverse proxy configuration
│   ├── monitoring/              # Observability configuration
│   │   ├── prometheus/          # Metric collection scraper
│   │   ├── grafana/             # Performance visualization dashboards
│   │   └── loki/                # Central log aggregator
│   ├── backup/                  # Backup routines and retention scripts
│   ├── deployment/              # Kubernetes helm charts / Terraform definitions
│   └── scripts/                 # Operations and provisioning scripts
│
├── docs/                        # Project documentation (MarkDown)
│   ├── architecture/            # Design decisions & overview
│   ├── modules/                 # Detail specification for each module
│   ├── api/                     # OpenAPI references
│   ├── database/                # ERDs & schema definitions
│   ├── workflows/               # BPMN maps
│   ├── deployment/              # Release procedures
│   ├── decisions/               # Architecture Decision Records (ADRs)
│   └── standards/               # Style guides and testing rules
│
├── .github/                     # GitHub Actions CI/CD workflows
│   └── workflows/
│
├── docker-compose.yml           # Local multi-container setup
├── .gitignore                   # Standard ignore definitions
├── README.md                    # Quickstart guide
├── SETUP.md                     # Detailed developer environment setup
└── THEBAITHAK_BLUEPRINT.md      # Final enterprise design blueprint document
```

---

## 4. SYSTEM ARCHITECTURE OVERVIEW

The platform uses a modular Event-Driven Clean Architecture leveraging a robust event bus to minimize coupling between domains.

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (REACTIVE WEBPAGE)                 │
│         TanStack Router + TanStack Query + Tailwind         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Async REST / WebSockets
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI API GATEWAY                    │
│      Auth │ RLS Enforcer │ Rate Limiter │ Audit Logger     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│              CORE PLATFORM ENGINE (EVENT BUS)               │
│    Feature  │  Rule  │  Pricing  │  Tax  │  Form  │  Workflow│
└──────────────────────────┬──────────────────────────────────┘

                           │
             ┌─────────────┼─────────────┬─────────────┐
             ▼             ▼             ▼             ▼
      ┌──────────────┐┌──────────┐┌──────────────┐┌──────────┐
      │ PostgreSQL   ││  Redis   ││ Celery Workers││   OLAP   │
      │ (with RLS &  ││ (Cache & ││ (Email, AI,   ││ Analytics│
      │ pgvector)    ││  PubSub) ││  PDF Exports)││ Database │
      └──────────────┘└──────────┘└──────────────┘└──────────┘
```

---

## 5. DATABASE-FIRST & METADATA-DRIVEN DESIGN

### 5.1 Metadata Tables for Dynamic Control

Rather than hardcoding permissions or page definitions, the platform depends on key metadata-driven tables:

* **`feature_master`:** Defines available modules (e.g., POS, PMS, CRM).
* **`feature_license`:** Maps active features to tenant contracts and expiry dates.
* **`feature_permission`:** Binds features to specific user roles.
* **`feature_configuration`:** Stores key-value parameters that control execution paths.

### 5.2 Dynamic Form & Field Architecture

The platform reads UI definitions from the database, allowing forms to adapt instantly to different business types without redeploying code:

```
form_master (id, form_key, title, business_type_id)
  └── field_master (id, form_id, field_name, field_type, is_required)
        └── field_validation (id, field_id, min_value, max_value, regex_pattern)
```

---

## 6. CORE PLATFORM ENGINES

The platform's capability is divided into **core engines** that act as the structural foundations for all hospitality modules.

### 6.1 The Core Engines

1. **Feature Engine:** Coordinates licensing and configuration. If a feature is unlicensed, its menus disappear, API endpoints reject requests, and user permissions are revoked instantly.
2. **Plugin Architecture:** Allows developers to deploy plugins (e.g., `plugins/restaurant`, `plugins/hotel`, `plugins/crm`) in an isolated directory structure with strict sandboxed API communication.
3. **Business Type Engine:** Maps tenant operations to specific verticals (Restaurant, Café, Hotel, PG, Sweet Shop) and shapes the core UI dynamically.
4. **Product Engine:** Standardizes all sellable items as "Products." Food items, room stays, laundry services, event spaces, memberships, and gift cards are simple extensions of a universal product model.
5. **Universal Pricing Engine:** Computes pricing rules dynamically by aggregating MRP, wholesales, online menu prices, POS happy hours, corporate contract adjustments, seasonal hotel rates, and VIP tiers.
6. **Tax Engine:** A global tax engine supporting CGST, SGST, IGST, local CESS, tax-inclusive, tax-exclusive pricing, and location-dependent tax rules.
7. **Discount Engine:** Resolves discounts (flat, percentage, buy-one-get-one combinations, customer coupons, and employee discounts) using priority-based resolution.
8. **Promotion Engine:** Manages marketing assets like landing page banners, checkout sliders, popups, and automated push notifications.
9. **AI Agent Architecture:** Orchestrates cooperative AI agents (CEO Agent, Kitchen Agent, CRM Agent, Finance Agent) sharing context and data to solve complex tasks.
10. **AI Prompt Library:** Stores prompt templates, categories, version histories, and execution metrics to optimize LLM interactions.
11. **AI Knowledge Base:** Converts uploaded files (recipes, SOP PDFs, lease contracts, employee manuals) into text embeddings stored in a PostgreSQL `pgvector` store for RAG pipelines.
12. **AI Automation Engine:** Emits triggers based on key conditions (e.g., low branch performance generates warnings, notifies procurement, and drafts local campaigns).
13. **Event Bus Engine:** Utilizes Redis Pub/Sub to broadcast events asynchronously (e.g., `OrderCreated` updates KDS, adjusts inventory, logs loyalty points, and feeds the AI forecasting engine).
14. **Rule Engine:** Evaluates complex conditional triggers (e.g., `IF customer_tier == 'VIP' AND order_value > 2000 THEN apply_discount(15)`) without code modifications.
15. **Report Builder:** A metadata-driven report engine allowing users to select dimensions, filters, and aggregations to output custom Excel, PDF, or chart views.
16. **Dashboard Builder:** A drag-and-drop grid system allowing users to build personalized workspace configurations out of standard widgets.
17. **Form Builder:** Reads `field_master` records to generate structured data forms with built-in validation, layout tabs, and collapsible sections.
18. **Visual Workflow Designer:** A drag-and-drop workflow designer (similar to Node-RED or n8n) that visualizes document tracks (e.g., purchase requests) through hierarchical approval nodes, email notifications, and API hooks.
19. **Business Rules Engine:** Encapsulates localized company constraints (e.g., check-in hours, credit limits) away from core database code.
20. **API Marketplace:** Handles OAuth handshakes and data serialization with third-party networks (Zomato, Swiggy, ONDC, Stripe, Tally, SAP, etc.).
21. **White Label Engine:** Dynamically injects tenant-specific themes, primary colors, subdomains, SMTP gateways, and SMS handlers into runtime sessions.
22. **Multi-Tenant Engine:** Restricts access using secure Row-Level Security (RLS) policies by isolating `tenant_id` at the database connection pool.
23. **Multi-Database Engine:** Routes database connections dynamically based on tenant subscription tiers (e.g., shared instance vs. dedicated private PostgreSQL database).
24. **Offline Engine:** Local browser IndexedDB caching allows critical POS operations (billing, kitchen prints) to run offline and sync with the API gateway once connections are restored.
25. **IoT Engine:** Controls local hardware (thermal receipt printers, barcode scanners, digital weight scales, RFID lock keycards, and temperature sensors) via a lightweight local agent.
26. **Hospitality CMS:** A multi-tenant content management system generating high-performance public landing pages, reservation forms, and booking channels.
27. **Universal Reservation Engine:** A unified scheduling grid managing booking allocations across tables, rooms, banquet halls, spas, gym timings, vehicles, parking spaces, and conference halls.
28. **Platform Studio Engine:** Metadata-driven low-code studio allowing admins to create tables, forms, pages, reports, dashboards, APIs, workflows, and automations without developer intervention.
29. **Master Data Management Engine:** Provides governance, duplicate detection, merge flows, and data standardization for customers, vendors, products, and branches.
30. **Integration Hub Engine:** Standardized connector framework for WhatsApp, SMS, Email, Payment Gateways, Accounting APIs, Government APIs, OTA APIs, and Maps, with retry, logging, and credential vaulting.
31. **API Gateway Engine:** Central API management layer offering rate limiting, API keys, analytics, monetization, webhook lifecycle, and policy enforcement.
32. **Scheduler Engine:** Dedicated scheduling engine for night audits, inventory sync, AI training, report generation, backups, and notifications with SLA monitoring.
33. **Data Retention Governance Engine:** Retention rules, archive/purge workflows, legal hold, and automated retention enforcement.
34. **Cost Governance Engine:** Tracks tenant-level costs for database, storage, AI, notifications, and API usage, and enforces quotas and budgets.
35. **Franchise & Multi-Brand Engine:** Tenant → Brand → Region → Branch metadata with brand standards, menu inheritance, pricing schemas, and franchise analytics.
36. **Revenue Management:** Dynamic hotel pricing algorithms adjusting room rates based on historical seasonal trends, occupancy, and competitor demand.
37. **Maintenance Engine:** Tracks asset inventories, preventative maintenance schedules, AMCs, room cleanings, and maintenance work orders.
38. **Hospitality Ecosystem:** Ties all endpoints together, letting a guest scan a table QR code, order a meal, post charges to their room, register loyalty points, and trigger KDS instructions automatically.

### 6.2 Universal Master Data Management (MDM) & Data Dictionary

* **Master Data Governance:** Enforces data cleaning workflows using merge operations (Customer, Vendor, Product, and Branch Merging) and validates regional credentials (such as India's GSTIN).
* **Universal Data Dictionary:** A compiled database of all metadata fields serving as the single source of truth for developers and system integrations:
  ```
  [Field Name] ──> [Meaning] ──> [DataType] ──> [Validation] ──> [API Mapping] ──> [DB Column]
  ```
  Every entity property is systematically registered, detailing histories, verification regex scripts, default values, and operational owners.

### 6.3 Enterprise Integration Layer (EIL) & Import/Export

* **EIL Operations:** Provides webhook triggers, API retries, and monitoring workflows backed by a Dead Letter Queue (DLQ).
* **Universal Import Engine:** Multi-format visual import wizard supporting CSV, Excel, XML, JSON, and financial software exports (Tally, Busy, SAP, QuickBooks). Built-in schemas map fields, dry-run validations preview errors, and rollbacks restore records on failures.
* **Universal Export Engine:** Native data grid exporter converting reports into Excel, PDF, CSV, JSON, and XML structures. Includes scheduling configurations to automatically push records to emails, WhatsApp APIs, or external API endpoints.

### 6.4 Data Migration Framework

To streamline transition from legacy tools, the platform provides a self-service data migration subsystem:

* **Migration Wizard:** A step-by-step UI to map client data sheets to database entities.
* **Visual Field Mapping:** Interface to map CSV/Excel columns to core database fields with real-time mapping previews.
* **Dry-Run Validations:** Runs dry-run validation passes to check data integrity, constraints, types, and references before committing records.
* **Rollback & Logs:** Provides one-click rollback of failed migration jobs and exports error sheets indicating invalid rows.

### 6.5 Implementation & CS Toolkits

Reduces the time needed to deploy new tenants and branches down to minutes:

* **Company & Branch Setup Wizards:** Simple visual workflows to establish companies, branches, and fiscal calendar configurations.
* **GST & Accounting Initializers:** Preloads regional tax groups, chart of accounts, and financial defaults.
* **Opening Stock & Balance Wizards:** Structured tables to populate initial asset inventories and bank ledger opening balances.
* **Hardware Setup Helpers:** Automatically discovers local network thermal printers, QR payment terminals, and scans barcodes.
* **Demo Data Generator:** Prepopulates mock rooms, menu items, mock bookings, and POS records for instant testing.
* **Customer Success Portal:** Handles tenant support tickets, training videos, feature requests tracker, dynamic renewal notifications, and licensing controls.

### 6.6 Universal Communication Center Engine (UCCE)

The UCCE serves as the central hub for dispatching, tracking, and template-managing all notifications across the platform:

* **Multi-Channel Delivery:** Service supporting message distribution across **Email**, **SMS**, **WhatsApp API**, **Push Notifications**, and **Internal Chat**.
* **Template Engine:** A visual template editor with merge tags (`{{customer_name}}`, `{{invoice_amount}}`) versioned and cached in Redis.
* **Unified Audit Ledger:** Logs delivery statuses (Sent, Delivered, Read, Failed) and handles automatic fallback channels (e.g., if WhatsApp fails, fall back to SMS).

### 6.7 Universal File Management System (FMS)

FMS provides a central document store for the entire platform:

* **Document Center:** Organizes invoices, regulatory documents (GST registration, PAN cards, Passports, Aadhaar cards), images, videos, contracts, and spreadsheets.
* **OCR Ingestion:** Background OCR workers scan and parse fields from uploaded documents (e.g., extracts vendor details and totals from bills).
* **Versioning & Permissions:** Retains history versions of all files and controls access with strict role-based token links.

### 6.8 Universal Task Engine & Collaboration Hub

TBDL includes workflow assignment engines to drive day-to-day employee performance:

* **Unified Task Engine:** Modules can trigger task objects (e.g., room cleaning requests, maintenance alerts, past-due rent followups). Supports deadline tracking, push reminders, SLA escalations, and histories.
* **Collaboration Center:** Jira-style communications (Notes, Thread comments, user mentions `@`, activity logs, custom tags, and item followers) embedded directly into transaction screens.

### 6.9 Calendar & Scheduling Engine

* **Unified Calendar Interface:** Displays all schedules (Room bookings, table reservations, scheduled meetings, equipment maintenance windows, staff shifts, leaves, events, and payment schedules) on a drag-and-drop grid.
* **Cron & Scheduler Dashboard:** UI to monitor all celery-based background processes, offering capabilities to run, pause, retry, and view execution dependencies.

### 6.10 Quality & Inspecting Module

Enforces high service levels across hospitality branches:

* **Inspection Checklists:** Interactive mobile checklists for room cleanings, kitchen safety, and asset inspections.
* **Audit Tracker:** Records temperature logs, food quality scores, and issues alerts requesting immediate corrective actions.

### 6.11 Financial Planning & Advanced Loyalty

* **Budgeting & Forecasting:** Establishes branch budgets, cost centers, profit centers, and department variances, contrasting live expenditures against forecasts.
* **Loyalty Wallet Engine:** Manages customer wallets, tiered memberships (Platinum, Gold, Silver), discount coupons, referral codes, and campaign trackers.

### 6.12 Enterprise Search Engine

Provides access to data points using simple navigation tools:

* **Standardized Search Interface:** Standardized query framework indexing across customers, rooms, orders, settings, and documents. Implementation will adapt dynamically depending on scale:
  * **PostgreSQL Full Text Search (FTS):** Default database search for core operations.
  * **pgvector Semantic Search:** AI-powered natural language queries.
  * **Elasticsearch / OpenSearch:** External indexing optional for heavy, large-scale enterprise deployments.
* **Search Contexts:** Supports saved filters, recent history lists, voice search inputs, and barcode/QR scanning.

### 6.13 Localization & i18n Translation Engine

Enables the platform to operate across global borders out of the box:

* **Localization Parameters:** Dynamically resolves system currencies, local timezones, formatting patterns, and regional tax frameworks (such as GST or VAT).
* **i18n Translation Engine:** Provides full UI language runtime translation switching, RTL support layout flips, multi-language invoices generation, localized CMS blogs rendering, and self-service translation management panels loaded from database language packs.
* **Translations & Pluralizations:** Employs explicit pluralization models (`one`, `many`, `other`) and structures fallback language routing rules (e.g. if requested language translation is missing, fall back to default English locale).

### 6.14 Data Warehouse & BI Semantic Layer (OLAP)

To protect system resources, database loads are split:

* **OLAP Isolation:** Moves calculations and analytics jobs away from the primary PostgreSQL instance (OLTP) to a dedicated analytics replica (OLAP).
* **BI Semantic Layer:** Standardized semantic abstraction tier mapping logical concepts to structured metrics views (Sales, Inventory, Finance, Customer, and HR Facts).

### 6.15 Business Rules Marketplace & Testing Sandbox

Admins configure custom policies dynamically without calling developers:
* **Rules Catalog:** Ready-to-use policy templates (Late Checkouts, Happy Hour discounts, custom room upgrades, payroll salary calculation adjustments).
* **Testing Sandbox:** Admins can mock test rules using historical dry-run logs in a safe debugger panel to evaluate results before saving.

### 6.16 Settings Policy Engine & Configuration Versioning

Similar to Windows Group Policy, settings are organized hierarchically:
* **Settings Overrides:** System configuration variables cascade from Organization -> Company -> Branch -> Department -> Role -> User -> Device, with each node capable of overriding defaults.
* **Configuration Versioning:** Every setting modification logs the modifier, timestamp, previous value, and new value, supporting instant rollbacks.

### 6.17 Feature Dependency Engine

Prevents system inconsistencies during licensing configurations:
* **Dependency Tree Resolver:** Activating an advanced feature automatically validates and checks prerequisite modules (e.g. Restaurant POS forces activation of Inventory, Tax, and Pricing engines).

### 6.18 Universal Number Series Manager

* **Number Pattern Engine:** A single centralized generator producing sequential document IDs (invoices, customer codes, vendor codes, employee IDs, asset trackers, reservations, membership IDs, and wallet IDs) using custom metadata-driven prefixes and suffix date stamps.

### 6.19 AI Copilot, Learning, and Simulations

The platform's AI moves beyond simple interfaces:
* **AI Copilot Everywhere:** Inline AI helpers contextualize inputs in real time (detects anomalous discounts, recommends vendors on purchase sheets, predicts inventory shortages, and drafts CRM followups).
* **Simulation Mode:** AI models simulate transaction adjustments (e.g. predicting profit demand impacts of increasing Paneer prices) before committing updates.
* **AI Learning Center:** Monitors query outputs, handles user feedbacks (Good/Bad votes), and identifies knowledge base gaps for automated LLM retraining.
* **AI Insight Cards:** Proactive diagnostic banners rendered on the home dashboard (e.g. "Revenue increased 18%", "7 VIP clients have not visited in 45 days").

### 6.20 Feature Usage Analytics & License Billing Engine

Standardizes client usage analytics and handles licensing billing:
* **Feature Usage Analytics:** Dynamically logs active page navigations, report runs, and average session times to build adoption metrics.
* **License & Billing Engine:** Automates subscriptions, trial limitations, payment renewals, and overage tracking.

---

## 7. MOBILE & OFFLINE SYNC ARCHITECTURE

Hospitality environments demand uninterrupted operation even in areas of poor connectivity.

### 7.1 Progressive Web Application (PWA) & Local Database
* **Local Data Storage:** Client browsers utilize **IndexedDB** managed via **Dexie.js** to store menu catalogs, room availability states, and active local customer files.
* **Service Workers:** Caches assets (HTML, CSS, JS, icons) for completely offline page initialization.

### 7.2 Offline Operations & Conflict Resolution
* **Offline Execution:** POS terminals can create transactions, print receipts, and dispatch KDS orders locally when internet connectivity is lost.
* **Background Sync Queue:** Offline transactions are stored in a local sync queue. Once connectivity is restored, the Service Worker executes a background sync in the order transactions were created.
* **Conflict Resolution:** All sync operations utilize the **Last-Write-Wins (LWW)** rule by default, backed by a metadata resolution log. If structural conflicts occur (e.g., double bookings of the same room), the sync system registers a conflict task for manual front-desk correction.

---

## 8. CORE PLATFORM DOMAIN MODEL & ECOSYSTEM COMPONENTS

The platform integrates distinct operational tools into a single, cohesive database architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                THE BAITHAK PLATFORM CORE                    │
│    Tenants   │   Companies   │   Branches   │   Outlets     │
└──────────┬───────────────┬──────────────┬───────────────┬───┘
           │               │              │               │
           ▼               ▼              ▼               ▼
     ┌──────────┐    ┌──────────┐   ┌──────────┐    ┌───────────┐
     │Restaurant│    │  Hotel   │   │    PG    │    │ Sweet Shop│
     │   POS    │    │   PMS    │   │  Tenant  │    │ & Bakery  │
     └──────────┘    └──────────┘   └──────────┘    └───────────┘
```

### 8.1 Key Ecosystem Components

* **Restaurant POS:** Fast-billing POS with menu management, table layouts, and offline capability.
* **Hotel PMS:** Room allocations, check-in/out workflows, dynamic rates, and guest histories.
* **PG Management:** Monthly rent collections, utilities tracking, bed allocations, and visitor logs.
* **Sweet Shop & Bakery:** Supports dual-unit billing (e.g., Kgs vs Boxes), batch expiration tracking, and recipe-based ingredient cost tracking.
* **Visitor Management:** Manages passes, ID uploads, photo captures, and entry/exit times for hotels, PGs, and corporate offices.
* **Asset Management:** Tracks depreciation, lifecycle maintenance, check-outs, and repairs for items like ACs, TVs, kitchen equipment, and vehicles.
* **Vendor & Employee Portals:** Dedicated views for purchase orders, self-service timesheets, and shifting rotas.

---

## 9. BACKEND ARCHITECTURE (WORLD-CLASS PYTHON & FASTAPI)

### 9.1 Backend Directory Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── server.py                  # FastAPI initialization
│   │   ├── bootstrap.py               # Dependency injection & startup tasks
│   │   └── middleware/                # Rate limiting, tenant extraction, logging
│   │
│   ├── modules/                       # Sandboxed Business Domains
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── hotel_pms/
│   │   ├── pg_management/
│   │   ├── billing/
│   │   └── ai/
│   │
│   ├── core/                          # Reusable Platform Engines
│   │   ├── database/                  # Connection pools & migrations
│   │   ├── event_bus/                 # Redis Pub/Sub events
│   │   ├── pricing_engine/            # Pricing rules resolver
│   │   ├── workflow/                  # Approval chain evaluator
│   │   └── form_builder/              # Metadata forms generator
│   │
│   └── shared/                        # Shared utility layers
│       ├── logger.py
│       ├── redis_client.py
│       └── celery_app.py              # Celery workers
```

### 9.2 Domain Events & Event Store

Rather than hardcoding calls between domains (e.g., calling the inventory module directly from the POS module), the platform implements an event-driven pub-sub architecture. All major business actions emit structured events (e.g., `OrderCreated`, `RoomCheckedIn`, `RentPastDue`).

All events are logged in the `event_store` database table for durability and auditing:

```sql
CREATE TABLE event_store (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_type VARCHAR(100) NOT NULL,
    tenant_id BIGINT NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_event_store_tenant_status ON event_store(tenant_id, status);
```

---

## 10. FRONTEND ARCHITECTURE (WORLD-CLASS REACT & TANSTACK)

### 10.1 Frontend Directory Structure

```
frontend/src/
├── app/
│   ├── App.tsx                        # Main application element
│   ├── routes/                        # TanStack Router strict routes
│   └── providers/                     # Theme, Auth, Query clients
│
├── modules/                           # Domain components
│   ├── pos/
│   ├── reservations/
│   ├── pg_suites/
│   └── forms/                         # Form-based modules
│       └── OrderCreateForm/
│           ├── OrderCreateForm.tsx    # Presentation layer
│           ├── useOrderCreate.ts      # Query/Mutation hooks
│           └── validation.ts          # Zod validation schema
│
├── shared/                            # Global components
│   ├── ui/                            # Custom components
│   ├── layout/                        # App shell
│   └── hooks/                         # Global hooks (mobile, async)
│
└── theme/
    ├── tokens.ts                      # Design tokens
    └── tailwind.css                   # Global styles
```

---

## 11. THE BAITHAK DESIGN LANGUAGE (TBDL) v1.0 ENTERPRISE HOSPITALITY UI/UX DESIGN CONSTITUTION

### 11.1 Objective
The Baithak Hospitality Platform is a premium, AI-native Hospitality Operating System designed for extensive daily usage. Every screen must feel as polished and premium as Apple software while retaining the speed and productivity of modern enterprise tools.

### 11.2 Design Inspiration
Primary visual patterns are inspired by **Apple Human Interface Guidelines**, **Stripe Dashboard**, **Linear**, **Notion**, **Airbnb**, **Shopify Admin**, **Toast POS**, and **Square POS**. 

We explicitly avoid cluttered interfaces, raw Bootstrap layouts, and crowded dashboard structures. The visual theme is defined as **Warm Hospitality + Enterprise Precision**, presenting a layout that resembles a premium hospitality product rather than strict accounting software.

* **Brand Personality:** Premium, Warm, Elegant, Luxury, Professional, Calm, Modern, Fast, Accessible, Minimal, Trustworthy, Hospitality Focused, and AI Native.

### 11.3 Core Design Philosophy
* **Luxury Hospitality Experience:** Large breathing whitespace, minimal borders, high contrast, and soft shadows.
* **AI-Native Purple Identity:** AI interactions and insights are branded strictly with a unified purple color identity, ensuring AI controls are visually separate from regular transactional items.
* **Unified Accent Rule:** Maximum of one accent color on a screen to maintain visual discipline.

### 11.4 Visual Elements & Tokens
* **Color Palette System:**
  We utilize a warm hospitality palette designed to feel expensive and calm:
  
  | Element | Light Theme | Dark Theme |
  |---------|-------------|------------|
  | **Primary** | Forest Green (`#1A3C34`) | Sage Green |
  | **Accent** | Warm Amber (`#E67E22`) | Soft Orange |
  | **Background**| Warm Ivory (`#F8F5F1`) | Deep Graphite |
  | **Surface** | White | Slate |
  | **Success** | Emerald | Emerald |
  | **AI Branded**| Purple (`#7C3AED`) | Purple |
  
* **Typography Hierarchy:** Standardized on **Inter** (body), **Outfit** (headings), and **JetBrains Mono** (numbers, pricing codes, and invoice IDs).
* **8-Point Spacing Grid:** Grid paddings, margins, gaps, and component offsets are multiples of 8px.
* **Lucide React Icons:** Single library standard with matching line stroke weights and dimensions.

### 11.5 Screen Design Patterns
* **Dashboard KPI Views:** Answer immediate questions (Revenue, Actions Pending, Branch Rankings, Occupancy) within 10 seconds. Charts are reserved for aggregated trend analysis; drill-down metrics are used for detailed analysis.
* **Progressive Forms:** Long input profiles are chunked into progressive collapsible folders (Basic Info -> Business -> Address -> Financial -> Documents -> Audit).
* **Enterprise-Grade Data Tables:** Features sticky headers, column freezing, runtime grouping, column choosing, density switches, virtual scrolling, and keyboard sorting.
* **Unified Button Heights:** All buttons (Primary, Secondary, Ghost, Outline, Danger) must have identical heights across components.
* **Loading & Empty State UX:** Display skeleton loading cards rather than blank pages. Optimistic state updates run for POS checkouts to ensure instant feedback.
* **Toast & Notification Center:** Stackable visual toasts with undo actions and priority logs.

### 11.6 Accessibility Compliance (WCAG 2.2 AA)
The interface is designed with accessibility rules integrated from the start:
* **Keyboard Navigation & Logical Tab Order:** Users can navigate all buttons, fields, tables, and links using standard keyboard indicators (`Tab`, `Shift + Tab`, `Enter`, `Space`).
* **Visible Focus & Contrast:** Active elements display clear, high-contrast focus rings. Fonts, colors, and layout indicators are WCAG 2.2 AA compliant.
* **Screen Reader & ARIA Labels:** HTML elements use logical semantic markers, explicit screen reader descriptions, and aria landmarks.
* **Reduced Motion Support:** CSS transitions honor user system reduced motion parameters.

---

## 12. ULTRA PERFORMANCE STANDARDS

The platform is designed around strict latency thresholds:

### 12.1 Performance Budgets

| Operation | Target Latency |
|-----------|----------------|
| **Initial Load** | < 2.0 seconds |
| **Dashboard Load** | < 2.0 seconds |
| **Master Search Lists** | < 1.0 second |
| **Form Initialization** | < 500 ms |
| **Data Save / Commit** | < 1.0 second |
| **Search Queries** | < 300 ms |
| **AI Stream Starts** | < 500 ms |

### 12.2 Key Optimization Rules

* **React Splitting:** Routes are split via dynamic imports and TanStack Router prefetching.
* **Data Virtualization:** Lists with over 100 rows must use virtualized list renderers (e.g., `@tanstack/react-virtual`).
* **Database Optimization:** Force indexing on search terms, use composite indices, and perform regular queries checks with `EXPLAIN ANALYZE`.
* **Async Offloading:** Offload tasks like PDF generation, report exports, and emails to background Celery workers.
* **Caching Tiers:** Multi-layer cache system (browser storage -> API headers -> Redis memory cache).

---

## 13. ENTERPRISE USER EXPERIENCE STANDARDS

TBDL prioritizes system speed and usability for power users:

* **Maximum Click Rule:** Access any common action (e.g., generating an invoice, checking in a guest) in **3 clicks or less** from the landing dashboard.
* **Keyboard-First Design:** Cashiers and receptionists must be able to perform 90% of data entry tasks using hotkeys without touching the mouse.
* **Universal Command Palette:** `Ctrl + K` displays a global command palette to search records, switch pages, run reports, or ask the AI.
* **Right-Click Context Menus:** Provide instant access to actions (edit, delete, duplicate) directly from table rows.
* **Smart Suggestions:** The system uses recent logs and AI models to pre-populate customers, menu items, and invoice values.
* **Multi-Tab / Split View:** Users can open multiple forms side-by-side or split screens to view customer details while generating invoices.
* **Universal Timeline:** Visual timelines displayed across all entity profiles (Customers, Orders, Rooms) showing execution steps from creation to archival:
  ```
  [Created] ───> [Updated] ───> [Approved] ───> [Printed] ───> [Emailed] ───> [Paid] ───> [Closed]
  ```

---

## 14. SECURITY, PRIVACY & COMPLIANCE

The security architecture must enforce enterprise boundaries and regional regulations from the ground up.

### 14.1 Compliance Readiness
* **PCI-DSS Compliance:** Built to run payment flows using secure tokenized integrations (Stripe, Razorpay). Core database never stores primary PAN numbers or CVV codes.
* **GDPR & India DPDP Act:** Implements strict data anonymization tools, right-to-be-forgotten queries, automatic consent trackers, and customer log export Wizards.

### 14.2 Authentication & Session Architecture
* **Tokens Routing:** Uses secure short-lived JSON Web Tokens (JWT) for access validation, backed by long-lived cryptographic Refresh Tokens stored inside **HTTP-only, secure, SameSite=Strict cookies** on the browser.
* **Revocation & Lockout:** Session table registers device profiles. Provides a user dashboard to revoke sessions on active devices. Implements account lockout controls (e.g. locks account for 15 minutes after 5 failed login attempts) and password rotation policies.
* **Security Policies:** Includes password rotation timelines, permission evaluation caches (cached in Redis), SSO integrations (SAML, OAuth2.0, OpenID Connect), and MFA controls.
* **Audited Impersonation:** Support agents can impersonate tenant users only after receiving cryptographic client tokens, logging all actions in the audit ledger.

---

## 15. OBSERVABILITY, SLO/SLA & OPERATIONS

### 15.1 Observability Portals
* **Telemetry Tracing:** OpenTelemetry integrations track runtime transaction execution paths across services.
* **Tenant Health & CS Dashboard:** Aggregates database capacity parameters, background Celery workloads, active API calls, latency graphs, error logs, and backup histories.

### 15.2 SLO / SLA Operational Framework
The operations dashboard tracks runtime service level indicators (SLIs) against our targets:

| Operational Service | Metric (P95 Target) | Metric (P99 Target) |
|---------------------|---------------------|---------------------|
| **Core API Availability** | > 99.9% uptime | > 99.95% uptime |
| **Database Availability** | > 99.99% uptime | > 99.999% uptime |
| **Search Latency** | < 300 milliseconds | < 500 milliseconds |
| **AI Text Response** | < 1.0 second stream | < 2.0 seconds stream |
| **Notification Queue** | < 5 seconds processing | < 15 seconds processing |
| **KDS Order Dispatch** | < 1 second websocket | < 3 seconds websocket |
| **Dashboard KPI Load** | < 2.0 seconds | < 4.0 seconds |
| **Background Job Success**| > 99.9% success | > 99.95% success |
| **Max Planned Downtime** | < 4 hours / Year | < 2 hours / Year |

* **Error Budget:** Operations dashboards track error budgets per service, triggering deployment locks if error metrics exceed baseline limits.

---

## 16. AI GOVERNANCE FRAMEWORK

To prevent hallucinations, cost overruns, and data leaks, the AI system operates under strict governance parameters:

* **Human-In-The-Loop Approvals:** The AI assistant cannot execute state-changing actions (e.g. creating a Purchase Order or deleting an order) without explicit manager confirmation.
* **Prompt Versioning & Audits:** Prompts are stored in the database, allowing team audits and performance comparisons.
* **Cost & Token Limits:** Enforces daily token and cost budgets per tenant with automatic rate-limit throttling.
* **Fallback Strategy:** If the primary LLM model experiences outages, the system automatically redirects requests to a configured fallback model.

---

## 17. DEVELOPMENT CONSTITUTION, EXCLUSIONS & VERSION COMPATIBILITY

### 17.1 Development Constitution

The development of The Baithak Hospitality Platform is governed by an absolute architectural law. Every developer must verify their changes against this constitution:

* **Rule 1: No Customer-Specific Code:** No hardcoded customer names, IDs, or custom routing in application paths. Use settings and form definitions.
* **Rule 2: Engine Consolidation:** Do not rewrite calculations in individual modules. All calculations must invoke the core engines (Pricing, Tax, Rule engines).
* **Rule 3: Clean Separation:** Keep the user interface free of business validations. The UI only presents data; all logic runs in backend routes.
* **Rule 4: Zero Direct SQL in UI:** All database transactions must go through the FastAPI gateway interfaces.
* **Rule 5: Exact TBDL Compliance:** Component margins, padding values, color palettes, and fonts must follow design token variables.
* **Rule 6: Mandatory Audits & Reversibility:** Any state mutation (e.g., cancelling an order) must log audit details and provide a corresponding undo mechanism.
* **Rule 7: Auto-documented APIs:** All FastAPI endpoints must contain complete Pydantic schemas to maintain accurate OpenAPI specs.
* **Rule 8: AI Transparency:** Every action taken by an AI agent must be logged in the prompt history, including token cost and user approvals.

### 17.2 Scope Exclusions

To protect the roadmap from complexity bloat, the following technologies and architectural patterns are **explicitly banned** from the roadmap:

* 🚫 **Blockchain & Crypto:** No distributed ledgers or cryptocurrency payment gates.
* 🚫 **NFT & Gamification tokens:** Traditional points databases only.
* 🚫 **AR/VR & Metaverse Integrations:** Out of scope.
* 🚫 **Early Microservices:** Maintain the monorepo modular folder architecture instead.
* 🚫 **Kubernetes:** Do not deploy Kubernetes clusters until scaling telemetry confirms necessity.
* 🚫 **Event Sourcing as Primary DB:** PostgreSQL relational schemas are the final persistence model.
* 🚫 **Global CQRS Pattern:** Decoupling query and write models is restricted strictly to OLTP/OLAP boundary configurations.

### 17.3 Product Version Compatibility
To support commercial distribution, the system enforces strict compatibility rules:
* **API Versioning:** Enforces path prefix version routing (e.g. `/api/v1/` vs `/api/v2/`). Obsolete API endpoints are deprecated and supported for a minimum of 12 months.
* **Database Migrations:** Schema changes managed via Alembic must support backward-compatible execution paths (e.g., nullable additions, keeping old columns deprecated).
* **Compatibility Scopes:** Changes must maintain backward compatibility across plugins, themes, dynamic reports, approval workflows, and configuration override hierarchies. Implements comprehensive upgrade path documentation guidelines.

---

## 18. DEVOPS, DELIVERY & DISASTER RECOVERY

* **CI/CD Pipeline:** Enforces Black/Ruff coding standard steps, Playwright integration passes, and Vite bundles tree-shaking checks before deployment.
* **Backup & Disaster Recovery Strategy:**
  * **Daily Full Backups:** Database instances perform full daily backups, encrypted with **AES-256 keys**, and moved to offsite, immutable cross-region buckets (e.g. AWS S3 Glacier with object lock).
  * **WAL Incremental Logs:** Real-time Write-Ahead Logs (WAL) archived hourly to support point-in-time recovery.
  * **DR Drills:** Automated restore verification scripts run weekly in sandbox nodes. The engineering team conducts full simulated multi-region failover drills every six months backed by formal recovery runbooks.

---

## 19. SCALABILITY & CAPACITY PLANNING

The platform is designed to scale horizontally to support large hospitality enterprises:

### 19.1 Capacity Allocations

| Dimension | Standard Capacity Baseline |
|-----------|----------------------------|
| **Maximum Active Tenants** | 5,000 |
| **Maximum Branches per Tenant** | 25,000 |
| **Concurrent Active Users** | 100,000 |
| **POS Transactions per Second** | 2,500 |
| **Average Database Growth** | < 150 GB / Year (isolated indexes) |
| **Storage Allocations** | Dynamic tier allocation with AWS S3 integration |

### 19.2 Scale Operations
* **Read Replicas:** API Gateway routes heavy read/report actions to PostgreSQL read replicas, leaving the main database instance for transactional writes.
* **Database Partitioning:** Implements table partitioning based on `tenant_id` and transactional dates.
* **Failover Recovery:** Automates multi-region failover protocols, routing API gateway layers to secondary database instances if latency anomalies exceed critical thresholds.

---

## 20. TESTING & QUALITY ENGINEERING STANDARDS

To maintain code health across all 30 core engines, developers must meet strict quality benchmarks:

* **Testing Coverage Minimums:** Backend Python code (FastAPI + SQLAlchemy) must maintain **minimum 85% unit coverage**.
* **API Ingestion Tests:** Complete automated endpoints verification using Pytest.
* **UI End-to-End Tests:** Continuous browser automation workflows (Playwright) testing billing paths, room check-ins, and guest onboarding.
* **Load & Stress Tests:** Standardized performance execution models run monthly, validating system performance boundaries under 2,000 concurrent POS transactions/second.

---

## 21. PRODUCT LIFECYCLE & RELEASE GOVERNANCE

Changes migrate across structured release nodes:

```
[Development] ──> [Staging Testing] ──> [UAT Feedback] ──> [Tenant Pilot] ──> [General Production]
```

* **LTS Branches:** Long-term stable releases (LTS) are supported for 24 months, receiving security patches and critical hotfixes without introduction of new features.

---

## 22. NON-FUNCTIONAL REQUIREMENTS (NFR) MATRIX & DATA LIFECYCLE

### 22.1 NFR Matrix

These metrics represent the platform's core operational SLA promises:

| Metric | Target Baseline |
|--------|-----------------|
| **System Uptime** | 99.9% availability |
| **RTO (Recovery Time Objective)** | < 15 minutes |
| **RPO (Recovery Point Objective)** | < 5 minutes |
| **Max Offline POS Duration** | Unlimited (synchronized upon connection) |
| **AI Stream Starts** | < 500 milliseconds |
| **Browser Compatibility** | Chrome, Safari, Edge, Firefox (latest 2 versions) |

### 22.2 Data Lifecycle & Retention Policy

The platform enforces strict automated cleanups to optimize storage costs:

| Log Type | Retention Period | Post-Expiry Action |
|----------|------------------|--------------------|
| **Audit Logs** | 7 Years | Archive to cold storage (e.g., S3 Glacier) |
| **Invoices & Financials** | Permanent | Maintained indefinitely |
| **Error Logs** | 90 Days | Hard delete |
| **Notifications & System Alerts** | 30 Days | Hard delete |
| **AI Conversations** | 180 Days | Anonymize and delete |
| **Temporary PDF/CSV Exports** | 24 Hours | Cron-based script auto-delete |

---

## 23. PROJECT RISK REGISTER

| Operational Risk | Severity | Automated Mitigation Protocol |
|------------------|----------|-------------------------------|
| **AI Gateway Failure** | Medium | Automated routing to fallback model (e.g. local llama replica). |
| **Database Outage** | Critical | Promotion of read replica; PITR restore path initialization. |
| **Payment Gate Outage** | High | Rotates transactions to backup processors. |
| **Internet Interruption** | High | POS systems fall back to IndexedDB offline states automatically. |
| **SMS/WA Gateway Outage**| Medium | Communication Center routes messages to backup SMTP queues. |

---

## 24. ARCHITECTURE DECISION RECORDS (ADR)

### ADR-001: Why PostgreSQL?
* **Context:** The platform requires a reliable database supporting transactions, geolocation indexing, and text search.
* **Decision:** Lock PostgreSQL as the system of truth. It offers ACID compliance, RLS scopes, pgvector embeddings integration, and table partition capabilities.
* **Consequences:** Restricts vertical flexibility to relational patterns, but guarantees transactional reliability.

### ADR-002: Why FastAPI?
* **Context:** High throughput REST endpoints and WebSocket channels are needed to handle POS tasks.
* **Decision:** Implement Python's FastAPI framework.
* **Consequences:** Offers fast ASGI asynchronous execution, native Pydantic schema validation, and auto-generated OpenAPI schemas.

### ADR-003: Why React?
* **Context:** The ERP interface requires high data density and modular components.
* **Decision:** Standardize on React 19.x with Vite.
* **Consequences:** Allows component composition, route splitting, and integration with Dexie.js for offline browser cache storage.

### ADR-004: Why Metadata Architecture?
* **Context:** Code updates must not be needed to deploy client customizations.
* **Decision:** Build metadata tables to define permissions, features, layouts, and validation rules.
* **Consequences:** Slightly increases initial development complexity, but ensures massive maintainability.

### ADR-005: Why Event Bus?
* **Context:** Decoupled interactions across POS, inventory, finance, and notifications modules are required.
* **Decision:** Build a pub-sub Event Bus backed by Redis.
* **Consequences:** Offloads background actions away from core transaction processes.

---

## 25. KICKOFF DELIVERABLES & ENTERPRISE ARCHITECTURE GOVERNANCE

### 25.1 Kickoff Deliverables
To prevent architectural drift and maintain consistency across development teams, the kickoff phase must produce the following core deliverables:

1. **Functional Requirements Specification (FRS):** Business workflow descriptions, edge cases, guest user journeys, and cashier checklist definitions.
2. **Database Design Specification (DDS):** Relational schema maps, foreign key indexing layouts, composite indices, stored procedures, and audit trigger scripts.
3. **API Specification Document:** Complete OpenAPI details specifying all path endpoints, request/response models, permission scopes, and exception codes.
4. **UI Design System Manual (TBDL):** Complete visual parameters for frontend components, grid margins, color variables, table virtualizations, and forms.
5. **Test Specification Manual:** Detailed procedures for unit testing, UI functional testing (Playwright), API endpoints loading, and UAT test scripts.
6. **Implementation & Onboarding Guide:** Clear documentation on tenant registration wizards, default setup profiles, data migration formats, and verification templates.
7. **Developer Handbook:** Git branching standards, code formatting rules (Black, Ruff, ESLint, Prettier), code review checklists, and the Definition of Done.
8. **Module Specification Documents:** Detailed specifications outlining workflows, database tables, APIs, validation rules, screen lists, and test cases for each platform module (POS, Hotel, PG, CRM, Inventory, Finance, etc.).

### 25.2 Enterprise Architecture Governance
This document represents the frozen **Enterprise Architecture Baseline (EAB)**. Any architectural alterations require formal review, check, and approval from the Chief Solution Architect. All future product features and implementation decisions must extend—not violate—the principles and limits established in this baseline.

---

## 26. DEFINITION OF ARCHITECTURE COMPLETE

The Master Blueprint for The Baithak Hospitality Platform is considered complete when it defines the following twenty core areas:

1. **Business Vision & Ecosystem Diagram**
2. **Core Philosophy & Non-Negotiable Engineering Principles**
3. **Technology Stack & Developer Tooling**
4. **System Architecture Overview (OLTP vs OLAP)**
5. **Database-First & Metadata-Driven Layouts**
6. **Core Engines (UCCE, FMS, Rules engines)**
7. **Mobile & Offline Sync Architecture**
8. **Ecosystem & Hospitality Domain Modules**
9. **Backend Architecture folder organization**
10. **Frontend Architecture folder organization**
11. **Design System & Spacing (TBDL v1.0 Constitution)**
12. **Ultra Performance Budgets**
13. **Enterprise UX Guidelines (Ctrl+K, Command Palette)**
14. **Security, Compliance & Session Architecture**
15. **Observability, SLOs, and SLAs**
16. **AI Governance & Costs thresholds**
17. **Development Constitution & Scope Exclusions**
18. **DevOps, CI/CD, and Disaster Recovery**
19. **Scalability capacities**
20. **Testing & Quality targets**

Any subsequent additions or modifications must reside in FRS, DDS, API Specs, UI Design manuals, or Developer Handbooks. This document is baseline-frozen.

---
This document represents the Enterprise Architecture Baseline (EAB) for The Baithak Hospitality Platform. Any architectural change requires formal review and approval. Functional enhancements must be documented in FRS, DDS, API Specifications, or Developer Standards rather than modifying this baseline.
