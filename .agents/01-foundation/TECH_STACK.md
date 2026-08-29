# Technology Stack & Selection Justifications

> **Last Reviewed**: August 2026

This document lists every technology used in **The ssrone** ecosystem and the architectural rationale for its selection.

---

## 1. Backend Stack

| Technology | Version | Purpose & Architectural Rationale |
| :--- | :--- | :--- |
| **Python** | `3.12+` | High productivity, rich AI/analytics libraries, robust type hint support. |
| **FastAPI** | `0.115+` | Ultra-fast ASGI web framework, automatic OpenAPI Swagger generation, native Pydantic v2 validation. |
| **SQLAlchemy** | `2.0+ (Async)` | Enterprise Async ORM for clean database mapping, eager relation loading (`selectinload`), and connection pooling. |
| **PostgreSQL** | `16+` | Battle-tested relational database supporting native Row-Level Security (RLS) for multi-tenant isolation, JSONB indexing, and CTEs. |
| **Alembic** | `1.13+` | Version-controlled database schema migrations. |
| **Pydantic** | `v2.9+` | Strict runtime request/response data validation and serialization. |
| **Uvicorn / Gunicorn** | `0.30+` | High-performance ASGI server implementation. |

---

## 2. Frontend Stack

| Technology | Version | Purpose & Architectural Rationale |
| :--- | :--- | :--- |
| **React** | `19.0` | Modern UI library supporting Concurrent Mode, Server Components, and optimized rendering. |
| **TypeScript** | `5.5+` | Strict compile-time type safety preventing runtime null pointer crashes. |
| **Vite** | `5.4+` | Lightning-fast HMR and ESM-based build tooling. |
| **TanStack Router** | `1.56+` | Type-safe nested client routing supporting search param validation and code-splitting. |
| **TanStack Query** | `5.56+` | Server state management, automated background caching, refetching, and optimistic updates. |
| **Zustand** | `5.0+` | Unopinionated, lightweight global client state management for Auth, Branch, and Cart stores. |
| **Tailwind CSS** | `3.4+` | Utility-first CSS framework enforcing curated HSL design token systems. |
| **Lucide React** | `0.447+` | Clean, consistent vector icon set. |
| **Sonner** | `1.5+` | Toast notification engine. |

---

## 3. Shared Workspace Packages (`@ssrone/*`)

| Package Name | Path | Purpose |
| :--- | :--- | :--- |
| `@ssrone/ui` | `packages/ui` | Shared UI primitive components (`Button`, `Input`, `Badge`, `Card`, `Modal`). |
| `@ssrone/types` | `packages/types` | Centralized TypeScript definitions for DTOs, Base Entities, and Enums. |
| `@ssrone/api-client` | `packages/api-client` | Axios HTTP client instance with auth header injection and global error interceptors. |
| `@ssrone/utils` | `packages/utils` | Utility functions (`cn`, `formatCurrency`, `formatDate`). |
