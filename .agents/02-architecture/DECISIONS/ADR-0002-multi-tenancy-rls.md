# ADR-0002: PostgreSQL Row-Level Security (RLS) for Multi-Tenant Isolation

> **Date**: August 2026  
> **Status**: Accepted  
> **Deciders**: Enterprise Security & Database Architecture Team

## Context & Problem Statement
In a multi-tenant platform, relying solely on application-level `WHERE tenant_id = x` filters risks catastrophic cross-tenant data leaks if a developer forgets to append the filter.

## Decision Outcome
Enforce PostgreSQL Row-Level Security (RLS) directly at the database engine layer for all tenant-scoped tables. Every session injects `app.current_tenant_id` context, guaranteeing isolation even if application-layer SQL omits explicit tenant filters.
