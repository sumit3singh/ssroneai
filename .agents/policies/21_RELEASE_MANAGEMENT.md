# The Baithak — Release Management Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. Versioning Standard
The Baithak platform utilizes Semantic Versioning (SemVer 2.0.0):
- **MAJOR**: Breaking changes that alter API contracts or database baseline rules.
- **MINOR**: Backward-compatible feature additions (e.g. adding new modules).
- **PATCH**: Backward-compatible bug fixes and security hotfixes.

---

## 2. Release Pipeline (CI/CD)
All codes must navigate through these environment tiers:

1. **Development (local)**: Verification on local machines.
2. **Staging / QA**: Automated integration and Playwright test suites.
3. **Production / Release**: Blue-green zero-downtime deployment.

---

## 3. Deployment Checklist
- Database migrations successfully executed via Alembic.
- Linter and TypeScript compiler checks pass.
- Definition of Done verified for all included tasks.
