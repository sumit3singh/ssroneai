# SSR One AI — Enterprise AI Context & Project Brief

> **MANDATORY AI ASSISTANT INSTRUCTION**: Read this file at the start of every session to align on tech stack, monorepo package boundaries, naming standards, and architectural constraints.

---

## 1. Executive Summary

- **Product Name**: SSR One AI (Enterprise Operating Platform)
- **Technical Scope**: Multi-tenant monorepo serving Hospitality, Restaurant (POS/KOT/KDS), Hotel PMS, PG Management, CRM, HRMS, and Finance verticals.
- **Repository Name / Scope**: `ssr_one_ai` (`@ssrone/*` packages).

---

## 2. Monorepo Architecture & Package Boundaries

```
ssr_one_ai/
├── apps/
│   ├── admin-web/          # Main Enterprise Admin SPA (React 19, Vite, TanStack Router)
│   ├── customer-food-web/    # Customer Food Ordering Web App
│   ├── customer-stay-web/    # Customer Hotel/PG Booking Web App
│   ├── kds-web/             # Kitchen Kiosk Display System (Dedicated Hardware Target)
│   └── staff-web/           # Staff Operations Portal
├── packages/
│   ├── api-client/          # Shared Axios HTTP Client with JWT & Tenant Interceptors
│   ├── auth/                # Shared Auth Store (Zustand) & Session Utilities
│   ├── ui/                  # Shared Design System Primitives & Components
│   ├── navigation/          # Sidebar Layout, Navigation Engine & Permission Guard
│   ├── theme/               # Canonical Design Tokens (Colors, Typography, Spacing)
│   ├── config/              # Environment Configuration Engine
│   ├── forms/               # Zod Form Validation Hooks
│   ├── hooks/               # Shared React Hooks (useMobile, useDebounce, etc.)
│   ├── icons/               # Lucide Icon Exports
│   ├── types/               # TypeScript Interfaces & Models
│   ├── charts/              # Recharts Visualizations
│   ├── tables/              # TanStack Data Tables
│   └── utils/               # Shared Utility Functions (cn, formatters)
└── services/backend/        # FastAPI Python Microservice (Service-Repository Pattern)
```

---

## 3. Golden Rules & Architectural Constraints

1. **One Topic = One File**: Before creating new docs, edit existing files indexed in [`.agents/AGENTS.md`](file:///e:/2026/ssr_one_ai/.agents/AGENTS.md).
2. **Zero Duplication**: Never write duplicate UI components, auth stores, API clients, or design tokens in `apps/*`. Always import from `@ssrone/*`.
3. **Module Tier Shapes**:
   - **Tier A** (Full Suite): Has `api/`, `components/`, `dashboard/`, `domain/`, `dto/`, `mappers/`, `master/`, `permissions/`, `report/`, `repositories/`, `services/`, `settings/`, `store/`, `transaction/`, `types/`, `validators/`.
   - **Tier B** (Focused Utility): Simple structure with `README.md`, `module.json`, `index.ts`, page component, and optional domain files. No empty Tier A directories allowed.
4. **PostgreSQL Multi-Tenancy**: All backend queries enforce `tenant_id` via Row-Level Security (RLS). Never omit tenant filtering.
5. **No Customer Leaks**: "ssrone" is a customer/tenant name. Never use customer names in platform package names, codebase identifiers, or documentation titles.
