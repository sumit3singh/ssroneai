# The Baithak — Enterprise Development Audit Report
**Version:** 1.1  
**Status:** Completed  
**Audit Timestamp:** 2026-07-15T17:20:00+05:30  

---

## Section 1: Project Overview

- **Project Name**: The Baithak Hospitality Platform (HOS)
- **Current Version**: v1.2.0-Enterprise
- **Technology Stack**:
  - **Monorepo Workspace**: npm Workspaces (monolithic layout)
  - **Frontend Framework**: React v18 + TypeScript + Vite + TailwindCSS
  - **Routing Engine**: TanStack Router (Type-safe route tree mapping)
  - **State / Cache Management**: TanStack Query (React Query)
  - **Backend Framework**: Python v3.11 + FastAPI (Asynchronous ASGI)
  - **ORM / DB Driver**: SQLAlchemy v2.0 + asyncpg
  - **Database Engine**: PostgreSQL v15 (Multi-tenant schema with isolation)
  - **Cache & Session Store**: Redis (for health check and pub/sub messaging)
- **Authentication Method**: JWT (JSON Web Tokens) with refresh-token rotation and HttpOnly cookie persistence.
- **Authorization Method**: Role-Based Access Control (RBAC) with JSONB permissions matrices in the `roles` table.
- **Deployment Status**: Active local multi-outlet staging on port `5173` (admin-web portal) and port `8000` (FastAPI backend).

---

## Section 2: Apps Workspace Inventory (`/apps/` directory)

1. **`apps/admin-web`**: The core ERP administrative back-office portal.
2. **`apps/customer-food-web`**: Customer-facing web application for digital menus and mobile takeaway orders.
3. **`apps/customer-stay-web`**: Self-service stay/hotel reservation and check-in portal for guests.
4. **`apps/kds-web`**: Real-time kitchen display system terminal for chefs.
5. **`apps/mobile-app`**: React Native mobile application for staff, waiters, and managers.
6. **`apps/staff-web`**: Employee self-service attendance and payroll portal.
