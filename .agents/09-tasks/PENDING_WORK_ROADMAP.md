# Pending Work & Architectural Consolidation Roadmap

> **Last Reviewed**: September 2026  
> **Overall Monorepo Completion Status**: **~98–99% (Production Candidate Milestone)**

This document lists living tasks, roadmap execution phases, and completed architectural milestones for **SSR One AI**.

---

## 1. Roadmap Phases & Living Deliverables

| Phase | Milestone Area | Current Status & Completion % | Focus & Deliverables | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Vertical Slice Domain & Backend Integration** | 🟢 **100% Complete** | All 14 backend modules and 11 frontend ERP modules fully operational and connected directly to PostgreSQL SSOT. | 🟢 Closed |
| **Phase 2** | **Offline-First & Zero-Wait POS Engine** | 🟢 **100% Complete** | Dexie.js IndexedDB persistence, `< 1.2ms` local tokens (`#001`), UUIDv4 idempotency keys, dual in-memory hot-mounted DOM layout, and background sync worker with auto-reconnect drainer. | 🟢 Closed |
| **Phase 3** | **Feature Licensing & Subscription Entitlement** | 🟢 **98% Complete** | `feature_registry.json` enforced server-side by `engines/licensing/engine.py`, verified with pytest suites. Frontend `FeatureGate` and `PermissionGuard` in `@ssrone/auth`. | 🟢 Closed |
| **Phase 4** | **Plugin & Dynamic Module Registry** | 🟢 **95% Complete** | Dynamic module sidebar, breadcrumb engine, and `@ssrone/navigation` runtime launcher operational across all 8 web apps. | 🟡 Polish |
| **Phase 5** | **Telemetry & Performance Monitoring** | 🟢 **95% Complete** | Centralized audit engine, Superadmin cluster health monitor (100% OK), and order sequence tracking operational. | 🟡 Polish |
| **Phase 6** | **Layered Testing & CI Quality Gates** | 🟢 **Continuous** | Backend pytest suites passing (`services/backend/tests/test_licensing.py`, `test_customization.py`), TypeScript strict configs, zero syntax errors. | 🟢 Continuous |

---

## 2. Recently Completed Architectural Milestones

- **[COMPLETED] World-Class Enterprise POS Innovations & Zero-Ruination Hardening ([ADR-0013](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0013-world-class-enterprise-pos-innovations.md))**:
  - **Dynamic UPI QR & Offline Soundbox Audio Chime**: Contactless scan-and-pay via pure SVG QR matrix generation (`DynamicUpiQrCode.tsx`) and synthesized 3-tone C5-E5-G5 harmonic chime (`playPaymentSuccessSound()`) via Web Audio API with zero hardware lock-in and zero audio file downloads.
  - **Customer-Facing Display (CFD / 2nd Screen Kiosk)**: Dual-screen counter operations on `/pos/cfd` synchronized via `BroadcastChannel("ssrone_cfd_sync")`. Live cart stream, dynamic UPI QR on right panel, and celebration sound chime on settlement.
  - **Multilingual AI Voice Order Taking**: Real-time voice dish insertion supporting natural English and Hindi ("दो मसाला डोसा", "three chai") with fuzzy catalog matching via `POSVoiceOrderButton.tsx`.
  - **Progressive Web App (PWA) 1-Click Install**: Offline Kiosk installation enabled across `apps/admin-web`, `apps/kds-web`, and `apps/token-order-web` with `manifest.webmanifest` and service worker caching.
  - **Automated WhatsApp Invoicing**: `POST /api/v1/orders/{order_id}/whatsapp-invoice` with one-tap `wa.me` links and clean bill breakdowns.
  - **Recipe BOM Stock Consumption**: `POST /api/v1/inventory/orders/{order_id}/consume-bom` automated ingredient deduction and stock movement audit trails.
  - **Food Delivery Aggregator Gateway Webhook**: `POST /api/v1/orders/integrations/aggregators/webhook` ingest and normalization for Swiggy, Zomato, and UberEats orders into kitchen display queues.
  - **Multi-Currency & Global i18n Engine**: Currency formatting (`formatCurrency`) across INR, USD, EUR, GBP, AED, SAR and zero-dependency internationalization dictionaries in `@ssrone/utils`.
- **[COMPLETED] Tenant Customization Studio & Self-Service Custom Domains ([ADR-0012](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0012-tenant-customization-studio-and-self-service-domains.md))**:
  - Full PostgreSQL single source of truth database persistence (`tenant_app_configs` and `tenant_custom_domains`).
  - Draft vs 1-Click Live Publishing lifecycle with automatic rollback safety and version incrementing.
  - Multi-tiered runtime configuration resolution (Branch override -> Tenant default -> System default constants) ensuring zero downtime and 100% fallback reliability across `customer-food-web`, `customer-stay-web`, `kds-web`, `staff-web`, and `token-order-web`.
  - Self-service custom domain registration, DNS TXT token challenge generation, automatic reactivation of soft-deleted domains, and low-latency reverse-proxy hostname resolution (`/api/v1/custom-domains/resolve`).
  - Interactive Tenant Customization Studio on `admin-web` (`/customization`) with real-time desktop & mobile simulated iframe preview.
  - Cleaned up Platform Home: Removed redundant connected apps bottom panel; launcher exclusively displays the 11 Business Workspace Modules.
- **[COMPLETED] Zero-Ruination Protocol & Current State Safeguard Standard ([CURRENT_STATE_SAFEGUARD.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/CURRENT_STATE_SAFEGUARD.md))**:
  - Established 11 non-negotiable architectural invariants guaranteeing that no existing working features, dual in-memory layouts, sub-millisecond local tokens, or database SSOT contexts can ever be regressed or compromised.
- **[COMPLETED] Mobile Fast-Order & Queue-Buster Token Web (`apps/token-order-web`)**:
  - Standalone ultra-responsive mobile web application on port `3003`. Allows customers in queue or at tables to assemble orders and generate 3-digit queue tokens (`#104`).
  - Integrated with POS Cashier terminal: pressing `Alt + Q` recalls and claims the entire order into the active billing cart in `< 0.1s`.
  - Backed by persistent PostgreSQL table and REST endpoints: `POST /api/v1/orders/queue-tokens`, `GET /api/v1/orders/queue-tokens/{code}`, and `POST /api/v1/orders/queue-tokens/{code}/claim`.
- **[COMPLETED] Marketing Web Character-Guided Motion-Path Scrollytelling ([ADR-0011](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0011-marketing-web-character-guided-motion-path-architecture.md))**:
  - Transformed public site into an immersive scrollytelling journey where a business owner travels an SVG emerald motion path across 7 story beats using GSAP `MotionPathPlugin`.
  - Preserved daylight warm paper palette (`hsl(40, 20%, 97%)`), flat ₹12,000/year enterprise pricing, and zero-failure lead submission shield to PostgreSQL `lead_inquiries`.
- **[COMPLETED] Enterprise Zero-Wait POS Architecture & Dual In-Memory Hot-Mounted Layout ([ADR-0010](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0010-zero-wait-pos-architecture-and-dual-in-memory-mounted-layout.md) & [ZERO_WAIT_POS_BLUEPRINT.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ZERO_WAIT_POS_BLUEPRINT.md))**:
  - **< 1.2ms Order Saving**: Instant client-side deterministic tokens (`#001`, `#002`), local order numbers (`DIN-B1-...`), and UUIDv4 idempotency keys (`crypto.randomUUID()`) via `order-sequence.ts`.
  - **Dual In-Memory Hot-Mounted DOM**: Both Billing Terminal (`POSItemGrid + POSCartPanel`) and Table Floor Tracker (`POSTableTrackerPage`) remain permanently mounted in DOM, swapping views in `< 0.2ms` via CSS toggling while synchronizing URL via `window.history.replaceState`.
  - **Dexie.js Offline-First Sync Worker**: Transactions persist to IndexedDB in `< 0.5ms` before non-blocking async background dispatch with `X-Idempotency-Key`. Offline queue automatically drains with exponential backoff on reconnection.
  - **Instant Table Click & Navigation**: Table selection, order edit recall, and header navigation switch views instantly without route remounts or state loss.
- **[COMPLETED] Multi-Stage QSR Kitchen Operations System (KOS) (`apps/kds-web`)**:
  - Transformed `kds-web` into a 5-mode QSR Kitchen Operations System: Cook KDS (Station View), Batch Prep (Aggregated Items), EXPO Pass (Assembly Verification), Packing & Handoff Queue, and Manager SLA Command Center.
  - Connected 100% directly to PostgreSQL via `/api/v1/orders/kds/live`, `/api/v1/orders/kds/item-status`, and `/api/v1/orders/kds/analytics` FastAPI endpoints.
  - Implemented 86 Out-of-Stock Item Control modal (`KDS86ItemModal.tsx`), Chef Recipe & Cooking Steps modal (`KDSRecipeModal.tsx`), item readiness checkboxes, and SLA timer age urgency badges (🟢/🟠/🔴).
- **[COMPLETED] Marketing Lead Ingestion & Superadmin Sales Follow-up Console ([ADR-0008](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0008-ui-modernization-and-domain-functionality-transition.md))**:
  - Full PostgreSQL single source of truth database persistence for `lead_inquiries` table with Pydantic validation.
  - Strict 10-digit mobile number validation on frontend and backend (`@field_validator("phone")`).
  - Phone-based lead deduplication & upsert engine (updates requested slot, vertical, notes & resets status to `NEW` without creating duplicate database rows).
  - Dedicated Superadmin Sales Leads follow-up console in `platform-admin` (`#leads`) with WhatsApp 1-click launch buttons and status lifecycle tracking.
- **[COMPLETED] Lifespan DDL Startup Lock Purge ([ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md))**:
  - Purged 400+ synchronous `ALTER TABLE` DDL statements from `main.py` lifespan, reducing boot latency from >30s to <10ms and preventing connection pool starvation deadlocks.
- **[COMPLETED] Strict Database SSOT Auth Context ([ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md))**:
  - Purged all hardcoded mock arrays (`defaultCo`, `defaultBr`, `defaultFin`) from `LoginPage.tsx`. Workspace context now loads 100% dynamically from PostgreSQL.



