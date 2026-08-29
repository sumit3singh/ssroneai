# Definition of Done (DoD)

> **Last Reviewed**: August 2026

A feature or bug fix is considered **DONE** only when all criteria in this checklist are verified.

---

## DoD Checklist

- [ ] **Code Implementation**: Feature is implemented strictly per specification.
- [ ] **Zero Mock Data**: Verified zero fallback demo objects injected into state on API failure.
- [ ] **Max File Size**: No modified or created component file exceeds 300 lines of code.
- [ ] **5-Part Architecture**: Module adheres strictly to `Dashboard -> Master -> Transaction -> Report -> Settings`.
- [ ] **Type Check**: `npm run type-check` passes with **0 errors**.
- [ ] **Lint Check**: `npm run lint` passes without warnings.
- [ ] **Backend Service-Repository**: Database queries encapsulated in `repository.py` and business logic in `services.py`.
- [ ] **Documentation Update**: `PROJECT_STRUCTURE.md` or `.agents/` docs updated if folder/module structure changed.
