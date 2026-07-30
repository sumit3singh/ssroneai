# SSR One AI Monorepo

This monorepo contains the SSR One AI project with frontend apps, shared UI and toolkit packages, backend services, infrastructure definitions, and developer tooling.

## Repository Layout

- `apps/` — frontend applications and web customers experience.
- `packages/` — shared reusable libraries for UI, hooks, types, configuration, and API clients.
- `services/` — service-oriented backend implementation and worker services.
- `infrastructure/` — infrastructure manifests, Docker Compose files, and deployment configuration.
- `docs/` — architecture, database design, and internal documentation.
- `tools/` — diagnostics, developer utilities, and workspace tooling.
- `scripts/` — maintenance scripts, migration helpers, and workspace automation.

## Current Structure

- `apps/admin-web`
- `apps/customer-food-web`
- `apps/customer-stay-web`
- `apps/kds-web`
- `apps/mobile-app`
- `apps/staff-web`
- `packages/api-client`
- `packages/auth`
- `packages/config`
- `packages/forms`
- `packages/hooks`
- `packages/icons`
- `packages/theme`
- `packages/types`
- `packages/ui`
- `packages/utils`
- `services/backend`
- `infrastructure/docker`

## Notes

- The backend service is now located at `services/backend`.
- Development Docker Compose manifests are located under `infrastructure/docker`.
- Root `docker-compose.yml` remains available for compatibility and quick local startup.

## Getting Started

### Frontend

```bash
npm run dev:admin
```

### Backend

The backend is a Python service in `services/backend`. Use the service's own `pyproject.toml` and Python tooling.

### Infrastructure

Use `infrastructure/docker/docker-compose.dev.yml` for local development compose workflows.

## Goals

This repository is structured to support enterprise-scale development by clearly separating frontend apps, shared packages, backend services, and infrastructure definitions.

The database is treated as the single source of truth for service state and domain integrity.

See `docs/architecture/enterprise-monorepo-complete-review.md` for the final architecture, migration plan, folder tree, and risk analysis.
