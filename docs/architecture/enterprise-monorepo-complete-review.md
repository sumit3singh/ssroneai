# SSR One AI — Enterprise Monorepo Complete Review

## Final Status
This repository has been restructured into a production-ready enterprise monorepo with the following top-level layers:

- `apps/` — frontend applications
- `packages/` — shared reusable libraries and packages
- `services/` — backend service(s)
- `infrastructure/` — infrastructure manifests and deployment config
- `docs/` — architecture, onboarding, and runbooks
- `tools/` — engineering support utilities
- `scripts/` — maintenance and migration scripts

The backend service is now located at `services/backend`, and all local Docker and CI references have been updated accordingly.

## Completed Work

### Structural changes
- Moved `backend/` to `services/backend`
- Preserved `docker-compose.yml` at repo root for compatibility
- Updated `infrastructure/docker/docker-compose.dev.yml` and `infrastructure/docker/docker-compose.prod.yml`
- Added `services/backend/README.md`
- Added `README.md` at repo root
- Consolidated shared API client usage in apps and added compatibility shims
- Updated `.gitignore` to exclude `services/backend/uploads/`

### Workspace improvements
- Verified `package.json` workspaces include `apps/*`, `packages/*`, and `services/*`
- Corrected GitHub CI to build from `services/backend` and `apps/admin-web`
- Added enterprise document references describing the new structure

### Shared package consolidation
- `apps/admin-web/src/shared/utils/api-client.ts` now re-exports the shared `@ssr-one-ai/api-client`
- `apps/staff-web/src/shared/api-client.ts` now re-exports the shared `@ssr-one-ai/api-client`

## Recommended Enterprise Folder Tree

```
ssr-one-ai/
  apps/
    admin-web/
    customer-food-web/
    customer-stay-web/
    kds-web/
    mobile-app/
    staff-web/

  packages/
    api-client/
    auth/
    config/
    forms/
    hooks/
    icons/
    theme/
    types/
    ui/
    utils/

  services/
    backend/
      src/
      tests/
      migrations/
      scripts/
      Dockerfile
      pyproject.toml

  infrastructure/
    docker/
      docker-compose.dev.yml
      docker-compose.prod.yml

  docs/
    architecture/
    database/
    onboarding/
    runbooks/

  tools/
    diagnostics/
    quality/
    generators/

  scripts/
    dev/
    migrations/
    maintenance/

  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  docker-compose.yml
```

## Migration Plan

1. Keep imports stable by using compatibility re-export files.
2. Move physical source folders while leaving package names unchanged.
3. Update Docker and CI references incrementally.
4. Add documentation and package ownership notes.
5. Validate with tests and build checks after each migration stage.

## Risk Analysis

- **Low**: documentation-only updates and folder moves with compatibility shims.
- **Medium**: consolidating shared client logic and updating app import paths.
- **High**: changing runtime backend entrypoints or API contract layers.

## Notes

- The database is treated as the single source of truth.
- The implementation preserves existing business logic and import names.
- This change is completed to the degree of structural reorganization, documentation, and compatibility.
