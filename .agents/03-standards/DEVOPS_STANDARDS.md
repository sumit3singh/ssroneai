# DevOps & CI/CD Pipeline Standards

> **Last Reviewed**: August 2026

This document defines CI/CD pipeline automation and environment provisioning rules.

---

## 1. CI Pipeline Automation (`.github/workflows/ci.yml`)

Every Pull Request automatically triggers:
1. **Lint Check**: `npm run lint` across all apps and packages.
2. **Type Verification**: `npm run type-check` across all frontend apps.
3. **Backend Tests**: `pytest` execution against test database.
4. **Build Bundling**: `npm run build` verification via Turborepo.
