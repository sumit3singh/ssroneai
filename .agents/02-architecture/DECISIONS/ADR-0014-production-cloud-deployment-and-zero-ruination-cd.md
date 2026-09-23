# ADR-0014: Production Cloud Deployment & Zero-Ruination Continuous Delivery Baseline

> **Status**: Accepted & Active  
> **Date**: September 2026  
> **Audited By**: Enterprise System Architect AI & SSR IT INDUSTRY Leadership  
> **Milestone**: Platform Live on Production Cloud (Railway)

---

## 1. Context & Business Need

The **SSR One AI** enterprise monorepo consists of 8 frontend web applications, 13 shared workspace packages, and a high-performance Python FastAPI backend with multi-tenant PostgreSQL Row-Level Security (RLS).

To transition from local development to a globally accessible live production environment, the platform required a deterministic, cloud-native deployment pipeline that:
1. Prevents dependency drift between local and cloud CI/CD environments.
2. Resolves PNPM monorepo workspace dependencies (`workspace:*`) seamlessly during build.
3. Adapts dynamically to cloud hosting port allocation (`$PORT`).
4. Accommodates modern browser DNS rebinding security protections (`allowedHosts`) without service interruption.
5. Guarantees zero downtime and non-destructive continuous deployment from Git.

---

## 2. Decision & Architectural Standards

### 2.1 Monorepo Dependency Determinism & Lockfile Integrity
* **Deterministic Versions**: Wildcard version specifiers (`"*"`) in `package.json` dependencies or devDependencies are strictly forbidden. All packages must declare explicit or semver-pinned versions matching the monorepo root.
* **Frozen Lockfile Compliance**: `pnpm-lock.yaml` is the authoritative single source of truth for all 22 workspace projects. Every commit altering package dependencies must synchronize `pnpm-lock.yaml` locally before pushing, ensuring `pnpm install --frozen-lockfile` succeeds with exit code 0.
* **Workspace Linking**: `.npmrc` enforces `auto-install-peers=true` and `link-workspace-packages=true`.

### 2.2 Cloud PaaS Build Context & Root Directory Law
* **Single Source Root Rule**: For all frontend services deployed on PaaS environments (Railway, Render, Fly.io), the **Root Directory MUST strictly remain `/` (repository root)**.
* **Rationale**: Setting the service Root Directory to an isolated subfolder (e.g., `apps/admin-web`) isolates the build context, preventing the builder from discovering `packages/*`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`, leading to `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.
* **Execution Granularity**: Build and start operations are isolated per service via filter commands:
  - Build: `pnpm --filter @ssrone/<app-name> build`
  - Start: `pnpm --filter @ssrone/<app-name> start`

### 2.3 Dynamic Port & Host Binding (`$PORT` & `allowedHosts`)
* **Vite Host Authorization**: In Vite 5/6, DNS rebinding protection blocks public cloud domains (e.g. `*.up.railway.app`). Every frontend `vite.config.ts` must configure:
  ```ts
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  }
  ```
* **Dynamic Backend Port Binding**: In `services/backend/Dockerfile`, the execution command must dynamically bind to the container platform's assigned `$PORT` environment variable:
  ```dockerfile
  CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
  ```
* **Health Check Probe**: The backend exposes `GET /health` returning `{"status": "UP"}` with HTTP 200 to satisfy platform health probes.

### 2.4 Separation of Compilation from Type-Checking
* **Build Command Standard**: Frontend production build scripts in `package.json` must invoke `vite build` directly:
  ```json
  "build": "vite build"
  ```
* **Type-Check Isolation**: Strict static type validation is reserved for `"type-check": "tsc --noEmit"`. This guarantees that production bundlers (Rollup/Esbuild) compile and tree-shake distribution bundles without failing on unbundled workspace type interfaces during deployment.

---

## 3. Consequences & Invariants

* **Positive**:
  - Live production deployment achieved on Railway with green status on both `backend` and `admin-web`.
  - Zero-friction Continuous Deployment: Pushing to `origin/main` automatically triggers zero-downtime rolling updates.
  - Complete protection against cloud build crashes (`ERR_PNPM_OUTDATED_LOCKFILE`, `EUNSUPPORTEDPROTOCOL`, `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`).
* **Inviolable Invariant**:
  - Never set Railway Root Directory to a subfolder for any monorepo frontend app.
  - Never commit `package.json` modifications without verifying `pnpm install --frozen-lockfile`.
  - Never remove `allowedHosts: true` from `vite.config.ts`.
