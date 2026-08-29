# Frontend Architecture Specification

> **Last Reviewed**: August 2026

This document defines the frontend architecture for **The ssrone** web applications.

---

## 1. Application Layering & Module Isolation

Frontend web applications (primarily `apps/admin-web`) are organized into strict modular boundaries:

```
apps/admin-web/src/
├── app/                         # App Root, Providers, Auth Store & Router Setup
├── modules/                     # 14 Feature Modules (CRM, POS, Hotel, PG, etc.)
│   └── <module_name>/
│       ├── dashboard/           # Section 1: Dashboard KPIs & Actions
│       ├── master/              # Section 2: Master Records CRUD
│       ├── transaction/         # Section 3: Operations & Transactions
│       ├── report/              # Section 4: Reports & Analytics
│       ├── settings/            # Section 5: Module Configuration
│       └── types/               # Module-Specific Type Definitions
└── shared/                      # App-wide UI Primitives, Hooks & Utilities
```

---

## 2. Core Frontend Principles

1. **Max File Size Limit**: No single `.tsx` component file may exceed 300 lines of code or 15 KB in size.
2. **State Management Isolation**:
   - **Local View State**: `useState` / `useReducer` inside components.
   - **Global Client State**: `Zustand` (`useAuthStore`, `useBranchStore`).
   - **Server Remote State**: `TanStack Query` (`useQuery`, `useMutation`).
3. **Design Token Uniformity**: All components must use curated HSL CSS tokens defined in `@ssrone/ui`—arbitrary inline hex colors or uncurated utility styles are forbidden.
