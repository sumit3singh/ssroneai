# SSR One AI — Enterprise Monorepo Foundation

## 1. Current Issues

The repository already has a strong starting point, but it still mixes concerns in a way that makes enterprise scaling harder than necessary:

- Frontend apps and shared libraries are present, but the boundary between app-specific and reusable code is not fully enforced.
- The root package manager and workspace config are functional, but the monorepo conventions are not yet documented or standardized.
- Backend code is organized by feature areas, but a clearer domain-driven split between application, infrastructure, and shared platform services would improve maintainability.
- The repository has folders for docs, infrastructure, scripts, and tools, but they are not yet formalized as enterprise-grade support layers.
- Naming and ownership conventions are partially consistent but need a more explicit enterprise standard.

## 2. Recommended Structure

The repository should be treated as a production-grade monorepo with four clear layers:

1. Applications
   - App-specific user experiences and delivery surfaces.
2. Shared Platform Packages
   - Reusable SDKs, design system, shared hooks, API abstractions, and types.
3. Backend Platform
   - Domain services, application use cases, integrations, and supporting infrastructure.
4. Enterprise Support Layers
   - Docs, infrastructure, scripts, tools, and quality automation.

### Recommended top-level structure

```text
ssr-one-ai/
  apps/
    admin-web/
    customer-food-web/
    customer-stay-web/
    kds-web/
    mobile-app/
    staff-web/

  services/backend/
    src/
      api/
      core/
      modules/
      integrations/
      engines/
      workers/
      shared/
    tests/
    migrations/

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

  docs/
    architecture/
    api/
    runbooks/
    onboarding/

  infrastructure/
    docker/
    environments/
    kubernetes/
    terraform/

  scripts/
    dev/
    migrations/
    maintenance/

  tools/
    diagnostics/
    quality/
    generators/
```

## 3. Package and App Boundaries

### Applications
These should remain UI-focused and should not contain business rules that belong in shared packages or backend services.

- apps/admin-web
- apps/customer-food-web
- apps/customer-stay-web
- apps/kds-web
- apps/mobile-app
- apps/staff-web

### Shared Packages
These should hold reusable front-end and cross-cutting platform abstractions.

- packages/ui: shared design system primitives
- packages/theme: theme tokens and visual system
- packages/types: shared domain and API contract types
- packages/hooks: reusable hooks
- packages/forms: form system and validation helpers
- packages/auth: authentication integration helpers
- packages/api-client: API client wrappers and shared request logic
- packages/utils: reusable utilities
- packages/config: environment and feature-flag configuration helpers

### Backend Architecture
The backend should be split into clearly separated layers:

- api/: transport and controllers
- core/: shared infrastructure, config, exceptions, middleware
- modules/: domain modules and business capabilities
- integrations/: external systems and adapters
- engines/: workflow, rules, orchestration, and execution engines
- workers/: async jobs and background processing
- shared/: common domain helpers

## 4. Naming Conventions

The following conventions should be adopted to improve clarity and consistency:

- Applications: kebab-case, e.g. admin-web
- Packages: scoped npm packages, e.g. @ssr-one-ai/ui
- Backend modules: lowercase snake_case or domain-based folders, e.g. inventory, billing
- Shared abstractions: descriptive names, avoid implementation-specific names
- Environment config: use clear names such as app, api, auth, feature_flags

## 5. Recommended Support Folders

### tools/
Use tools for engineering support utilities that are not production runtime code.

Suggested subfolders:
- diagnostics/: health checks, debugging helpers, lint reports
- quality/: coverage, quality gates, formatting helpers
- generators/: scaffolding and code generation utilities

### infrastructure/
Use infrastructure to hold deployment and environment definitions.

Suggested subfolders:
- docker/
- environments/
- kubernetes/
- terraform/

### docs/
Use docs for architecture, runbooks, API references, and onboarding.

Suggested subfolders:
- architecture/
- api/
- runbooks/
- onboarding/

### scripts/
Use scripts for one-off operational and developer tasks.

Suggested subfolders:
- dev/
- migrations/
- maintenance/

## 6. Recommended Testing Strategy

A production-ready enterprise monorepo should use layered testing:

- Unit tests for shared packages and pure logic
- Component tests for frontend UI behavior
- Integration tests for APIs and module boundaries
- End-to-end tests for user-critical workflows
- Contract tests for shared package interfaces
- Visual regression tests for the design system and app shell

Suggested tooling:
- Frontend: Vitest + Testing Library + Playwright
- Backend: pytest + pytest-cov + httpx/factory-boy where applicable
- Shared packages: unit tests alongside package source
- CI: enforce minimum coverage and test gates on PRs

## 7. Migration Plan

This migration should be non-breaking and progressive.

### Phase 1 — Foundation
- Keep existing business logic intact.
- Introduce documented folder ownership rules.
- Add package boundaries and workspace conventions.
- Create docs and architecture folders.

### Phase 2 — Package Extraction
- Move reusable frontend logic from apps into packages where it is clearly shared.
- Keep app entry points stable.
- Preserve import paths through compatibility re-exports.

### Phase 3 — Backend Restructuring
- Restructure backend folders into api/core/modules/integrations/engines/workers/shared.
- Keep existing route and service endpoints unchanged.
- Add adapters so existing imports continue to work.

### Phase 4 — Tooling and Quality
- Standardize linting, formatting, test, and coverage workflows.
- Introduce shared CI templates and environment standards.

### Phase 5 — Governance
- Add architecture review guidelines.
- Document ownership and package responsibilities.

## 8. Risk Analysis

### Low Risk
- Documentation and folder organization changes
- Adding new support folders
- Creating compatibility re-export files

### Medium Risk
- Moving shared logic from apps into packages
- Updating import paths that are currently implicit

### High Risk
- Large-scale backend folder reshaping without adapter layers
- Changing runtime entry points or API routes

Mitigation:
- Preserve public entry points
- Add compatibility shims where needed
- Migrate incrementally
- Validate with tests and build checks at each step

## 9. Final Folder Tree

```text
apps/
  admin-web/
  customer-food-web/
  customer-stay-web/
  kds-web/
  mobile-app/
  staff-web/

backend/
  src/
    api/
    core/
    modules/
    integrations/
    engines/
    workers/
    shared/
  tests/
  migrations/

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

docs/
  architecture/
  api/
  runbooks/
  onboarding/

infrastructure/
  docker/
  environments/
  kubernetes/
  terraform/

scripts/
  dev/
  migrations/
  maintenance/

tools/
  diagnostics/
  quality/
  generators/
```
