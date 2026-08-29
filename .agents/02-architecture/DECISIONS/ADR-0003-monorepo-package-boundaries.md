# ADR-0003: Monorepo Package Boundaries & Isolation

> **Date**: August 2026  
> **Status**: Accepted  
> **Deciders**: Monorepo Infrastructure Team

## Context & Problem Statement
Shared code (UI primitives, TypeScript definitions, formatting helpers, API client instances) was being duplicated inside `apps/admin-web/src/shared/`, leading to version drift and code duplication across web and mobile apps.

## Decision Outcome
Isolate shared code strictly into workspace packages (`packages/ui`, `packages/types`, `packages/api-client`, `packages/utils`). Applications must consume shared dependencies via `@ssrone/*` workspace links.
