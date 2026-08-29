# Canonical Module Structure Standard

> **Last Reviewed**: August 2026

This document defines the single canonical module folder blueprint for **The ssrone** frontend and backend systems.

---

## 1. Frontend 5-Part Module Structure (`apps/admin-web/src/modules/`)

Every frontend module directory MUST follow the 5-part architecture:

```
apps/admin-web/src/modules/<module_name>/
├── dashboard/                   # 1. Dashboard Page & KPI Metrics Component
│   └── <ModuleName>DashboardPage.tsx
├── master/                      # 2. Master Entity Management & CRUD Tables
│   └── <ModuleName>MasterSection.tsx
├── transaction/                 # 3. Operations, Billing, Check-ins & Receipts
│   └── <ModuleName>TransactionSection.tsx
├── report/                      # 4. Financial Audit & BI Analytics Reports
│   └── <ModuleName>ReportSection.tsx
├── settings/                    # 5. Module Settings & Operational Parameters
│   └── <ModuleName>SettingsSection.tsx
├── types/                       # Module TypeScript Type Definitions
│   └── index.ts
├── index.ts                     # Module Barrel Export File
└── <ModuleName>Page.tsx         # Lightweight Router Delegate Wrapper (~3 KB)
```

---

## 2. Backend Module Structure (`services/backend/src/modules/`)

Every backend micro-module MUST follow the 5-layer pattern:

```
services/backend/src/modules/<module_name>/
├── __init__.py
├── models.py                    # SQLAlchemy ORM Database Models
├── schemas.py                   # Pydantic v2 Validation Schemas
├── repository.py                # Database Access Layer (Async DB Queries)
├── services.py                  # Domain Business Logic & Calculations
└── router.py                    # FastAPI Controller Endpoints
```
