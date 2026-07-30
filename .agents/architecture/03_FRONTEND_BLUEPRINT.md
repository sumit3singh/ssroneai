# Frontend Architecture Blueprint – BAITHAK ERP Charter #03

## 1. Core Stack
- **Framework**: React + Vite + TypeScript.
- **Routing**: TanStack Router (explicit route declaration).
- **State & Data Fetching**: TanStack Query (React Query) + Zustand.
- **Styling**: Vanilla CSS / Tailwind tokens + Lucide Icons + Recharts.

## 2. Layout Law
- Post-Login Platform Home (`/`) -> Module Selector.
- Sidebar is the ONLY primary navigation inside open modules.
