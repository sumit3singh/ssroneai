# UI Patterns: Forms, Tables & Dashboards

> **Last Reviewed**: August 2026

This document defines design standards for Form Layouts, Data Tables, and Dashboard KPI Grids.

---

## 1. Form Design Standards

- Build forms using `react-hook-form` and `zod` schema resolvers.
- Display field validation error messages below input fields in `text-xs text-rose-500`.
- Submit buttons MUST enter a disabled loading state (`isLoading=true`) while mutations execute.

---

## 2. Table Standards

- Use TanStack React Table for grid sorting, filtering, and pagination.
- Tables MUST include an `<EmptyState>` when no records match filter criteria.
- Use explicit `<Badge>` status indicators (`success`, `warning`, `danger`).

---

## 3. Dashboard Standards

- Top KPI summary banner MUST feature 4 metric cards (Total Count, Revenue/Collections, Overdue/Alerts, Active Units).
- Quick Action cards MUST feature hover micro-animations and clear icons.
