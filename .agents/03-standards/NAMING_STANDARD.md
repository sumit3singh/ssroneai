# Naming Conventions Standard

> **Last Reviewed**: August 2026

This document establishes uniform naming conventions across files, database objects, TypeScript types, and Python variables.

---

## 1. Summary Matrix

| Artifact Category | Convention | Examples |
| :--- | :--- | :--- |
| **React Component Files** | `PascalCase.tsx` | `PGDashboardPage.tsx`, `POSHeader.tsx` |
| **TypeScript Interfaces / Types**| `PascalCase` | `POSMenuItem`, `Resident`, `OrderType` |
| **Python Files** | `snake_case.py` | `models.py`, `repository.py`, `services.py` |
| **Python Classes** | `PascalCase` | `RestaurantRepository`, `HotelService` |
| **Database Tables & Columns** | `snake_case` | `menu_items`, `tenant_id`, `created_at` |
| **CSS Token Variables** | `kebab-case` | `--bg-background`, `--color-primary` |
| **npm Workspace Packages** | `@ssrone/<name>` | `@ssrone/ui`, `@ssrone/types` |
