# Pending Work & Architectural Consolidation Roadmap

> **Last Reviewed**: August 2026

This document lists living tasks and roadmap execution phases for **The ssrone**.

---

## 1. Roadmap Phases & Living Deliverables

| Phase | Milestone Area | Focus & Deliverables | Priority |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Vertical Slice Rollout (16 Modules)** | Apply Domain Models, DTOs, Mappers, Repositories, ErrorBoundaries, Skeletons, EmptyStates to remaining 16 modules. | 🔴 High |
| **Phase 2** | **Offline Conflict Resolution Engine** | Implement `conflictResolver.ts` with strategy resolution (`ServerWins`, `ClientWins`, `FieldMerge`) for offline sync. | 🔴 High |
| **Phase 3** | **Plugin & Dynamic Module Registry** | `ModuleManifest.ts` with `registerModule()` runtime loader & dependency validation (`Depends On`). | 🟡 Medium |
| **Phase 4** | **Telemetry & Performance Monitoring** | Centralized `logger.ts`, telemetry events stream, FPS & render count monitoring overlay. | 🟡 Medium |
| **Phase 5** | **Semantic Design Token Audit** | Purge raw Tailwind colors in business code; enforce 100% semantic CSS tokens (`text-primary`, `bg-surface`). | 🟡 Medium |
| **Phase 6** | **Layered Testing & CI Quality Gates** | Co-located unit tests (Vitest) for domain math, Playwright E2E suites for core workflows, Husky pre-commit hooks. | 🟢 Continuous |

---

## 2. Recently Completed Architectural Milestones

- **[COMPLETED] Lifespan DDL Startup Lock Purge ([ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md))**:
  - Purged 400+ synchronous `ALTER TABLE` DDL statements from `main.py` lifespan, reducing boot latency from >30s to <10ms and preventing connection pool starvation deadlocks.
- **[COMPLETED] Strict Database SSOT Auth Context ([ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md))**:
  - Purged all hardcoded mock arrays (`defaultCo`, `defaultBr`, `defaultFin`) from `LoginPage.tsx`. Workspace context now loads 100% dynamically from PostgreSQL.
- **[COMPLETED] Router Endpoint & Import Audit ([ADR-0007](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0007-startup-ddl-lock-purge-and-pure-ssot-auth-context.md))**:
  - Cleaned duplicate route definitions in `auth/router.py` and missing type annotations in `crm/router.py`.

