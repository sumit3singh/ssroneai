# SSR One AI – Universal Coding & Architectural Excellence Standards (CODING_STANDARDS.md)

> **Last Reviewed**: August 2026
> **Mandatory Rule for All AI Assistants & Engineers**: Every line of code written across **The ssrone** monorepo MUST be concise, to-the-point, high-performance, and production-ready. Avoid fluff, unnecessary boilerplate, or temporary hacks.

---

## 1. Governance & Core Architectural Principles

1. **To-the-Point & Production-Ready Code**:
   - Write clean, modular, highly optimized code focused strictly on resolving business requirements.
   - Avoid redundant code blocks, unnecessary wrapper abstractions, or verbose commented-out snippets.

2. **Database Single Source of Truth (SSOT)**:
   - All state MUST be driven dynamically by PostgreSQL database REST APIs.
   - ZERO hardcoded fake data arrays or dummy fallbacks (`"John Doe"`, `"Baithak Cafe"`, etc.) permitted in production code.

3. **Root-Cause Engineering (No Symptom Patches)**:
   - Fix underlying contract, database schema, or type mismatches directly at the root. Never swallow errors silently or return dummy fallbacks.

4. **Universal Currency & Fit-to-Screen UI**:
   - All monetary figures MUST be in Indian Rupees (`₹`) formatted via `toLocaleString('en-IN')` (e.g. `₹12,000 / yr`).
   - All UI components MUST be compact, fit-to-screen, and visually wowed with modern glassmorphic styling and `@ssrone/ui` primitives.

---

## 2. Frontend Standards (TypeScript & React 19)

1. Use functional components with explicit, strict TypeScript interfaces for all props and state.
2. Maintain clean, reactive state management using Zustand and TanStack Query.
3. Use shared monorepo packages (`@ssrone/ui`, `@ssrone/api-client`, `@ssrone/theme`, `@ssrone/types`).
4. Ensure fast, non-blocking UI rendering with compact font scales (`text-xs` / `0.75rem`) and responsive grid layouts.

---

## 3. Backend Standards (Python 3.12 & FastAPI)

1. Enforce PEP 8 conventions, typing annotations, and async ASGI request lifecycles (`AsyncSession`, `selectinload`).
2. Enforce Service-Repository pattern: keep router endpoints clean, delegating logic to dedicated modules.
3. Validate all payload inputs with Pydantic v2 schemas and map ORM models directly to PostgreSQL DDL schemas (`BigInteger` primary/foreign keys, `JSONB` attributes).
