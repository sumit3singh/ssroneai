# ADR-0001: Standard 2-Tier Monorepo Module Architecture & Restructuring

> **Date**: August 2026  
> **Status**: Accepted  
> **Deciders**: Chief Software Architect & Enterprise Engineering Team

## Context & Problem Statement
Inconsistent directory structures, duplicated packages/clients across apps, loose file collisions (e.g. `pos/permissions.ts` vs `pos/permissions/`), and scattered backend engine locations created maintenance overhead and build-breaking risks.

## Decision Outcome
Adopt a mandatory, two-tier frontend module architecture and backend service-engine layout:

### 1. Frontend 2-Tier Module Blueprint (`apps/admin-web/src/modules/<name>/`)
- **Tier A (Full Transactional)**: POS, Hotel, Inventory, Finance, CRM, HR, PG Management.
 , `README.md`, `index.ts`, `routes.ts`, `navigation.ts`, `domain/`, `api/`, `mappers/`, `store/`, `components/`, `pages/`, `permissions/`, `validators/`, `types/`.
- **Tier B (Lightweight Admin)**: Settings,  Forms Builder, AI Copilot.
  Contains`README.md`, `routes.ts`, `api/`, `components/`, `pages/`, `types/`.

### 2. Mandatory Manifest & Scaffolding
- Every module MUST contain a `module.json` manifest defining `name`, `tier`, `owner`, `permissions`, and `routes`.
- New modules MUST be scaffolded via `python scripts/scaffold_module.py --name=<name> --tier=<a|b>`.

### 3. Backend Engine Location
- All backend engines (pricing, tax, discount, form_builder, notification, workflow, print, audit, licensing) live strictly under `services/backend/src/engines/`. `src/core/` is reserved for infrastructure.

### 4. Zero Scaffolding & Single Source of Truth
- Loose scaffolding folders (`ai/`, `engines/`, `events/`, `plugins/`, `observability/`, `sdk/` at root) are removed.
- All documentation lives under `.agents/` as the single canonical source of truth.
