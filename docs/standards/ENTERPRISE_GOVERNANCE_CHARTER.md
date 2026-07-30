# SSR One AI — Master Architecture Governance Charter (Phase 0)

**Document ID**: GOV-2026-001  
**Project**: SSR One AI (THE BAITHAK Enterprise Business Operating System)  
**Scope**: Project-Wide Architectural Governance & Engineering Laws  
**Status**: **FROZEN ENTERPRISE BASELINE**  

---

## 1. Folder Naming Standards
* **Workspace Directories**: All top-level capabilities and shared packages MUST use lowercase `kebab-case` (`apps/admin-web`, `packages/api-client`, `services/backend`, `metadata/forms`, `infrastructure/docker`).
* **Frontend Feature Modules**: Every module inside `apps/admin-web/src/modules/` MUST use lowercase `kebab-case` (`ai-copilot`, `pg-management`, `pos`, `connected-apps`).
* **Module Subdirectories**: Every module MUST strictly contain the 9-part subfolder hierarchy (`api/`, `components/`, `services/`, `store/`, `types/`, `validators/`, `dashboard/`, `master/`, `transaction/`, `report/`, `settings/`).

---

## 2. File Naming Standards
* **React Components**: PascalCase (`Button.tsx`, `POSPage.tsx`, `VirtualTable.tsx`).
* **TypeScript Hooks & Utilities**: camelCase (`useOrders.ts`, `useLocalStorage.ts`, `formatters.ts`).
* **Python Modules & Services**: Snake_case (`unit_of_work.py`, `repository.py`, `platform_models.py`).
* **Database DDL Files**: Lowercase snake_case (`platform_tables.sql`, `001_initial_schema.sql`).
* **Metadata Files**: Lowercase snake_case JSON files (`pos_order_form.json`, `sales_summary_report.json`).

---

## 3. General Coding Standards
* **Single Responsibility Principle**: Every class, hook, and function MUST perform exactly one well-defined responsibility.
* **Zero Magic Numbers / Strings**: All constants MUST be defined in `constants.ts` or Python Enum classes.
* **Immutability**: Avoid mutating state or parameters directly. Use spread operators, Zustand state setters, or Pydantic copies.
* **Explicit Return Types**: All TypeScript public functions and Python methods MUST specify explicit return types.

---

## 4. TypeScript Standards
* **Strict Compiler Options**: `tsconfig.json` MUST enforce `"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`.
* **Zero `any` Policy**: Never use `any`. Use generics (`T`), `unknown` with type guards, or explicit interfaces.
* **Named Exports Only**: Use named exports (`export function POSPage()`) for better IDE autocompletion and tree shaking. Avoid `export default` except in route configs.

---

## 5. React Standards
* **Functional Components Only**: Use functional components with React Hooks. Class components are strictly prohibited.
* **Custom Hooks**: Extract complex state management, data fetching, or side-effects out of JSX views into custom hooks in `hooks/`.
* **Render Optimization**: Wrap expensive list item components or heavy calculations in `React.memo` / `useMemo` to maintain 60 FPS rendering.
* **Styling**: Use tokenized Tailwind CSS utility classes or `@ssr-one-ai/theme` design tokens. Zero inline `style={{ ... }}` objects.

---

## 6. FastAPI Standards
* **Async ORM**: Use SQLAlchemy 2.0 async ORM (`AsyncSession`, `select`, `update`, `delete`). Synchronous DB queries on event loops are strictly forbidden.
* **Pydantic v2 Models**: Use Pydantic v2 schemas for all request payloads and response DTOs.
* **Dependency Injection**: Inject database sessions, current user, tenant header, and repositories via FastAPI `Depends()`.
* **Custom Exception Hierarchy**: Throw custom `AppException` subclasses (`EntityNotFoundException`, `UnauthorizedException`, `ValidationException`) handled globally by `src/core/exceptions/handlers.py`.

---

## 7. Database Standards (Golden Rules)
* **GOLDEN RULE #1 (Database is Single Source of Truth)**: Never use `mockDB`, demo arrays, fake objects, local JSON, hardcoded master data, or fallback demo records. All business data MUST come from backend APIs, which fetch strictly from PostgreSQL.
* **PostgreSQL Naming**: Database tables and column names MUST use lowercase `snake_case` (`audit_logs`, `approval_requests`, `created_at`).
* **Audit & Soft Delete**: Every table MUST include primary key `id BIGSERIAL`, timezone-aware `created_at`, `updated_at`, and soft-delete fields (`is_deleted`, `deleted_at`).

---

## 8. Git Workflow
* **Feature-Branch Workflow**: Development MUST occur on isolated feature or fix branches branched off `develop`.
* **Rebase Strategy**: Developers MUST rebase feature branches on top of `develop` before submitting pull requests to ensure a linear, clean commit graph.

---

## 9. Branch Strategy
* `main` — Production release branch (tagged `v1.0.0`, `v1.1.0`).
* `develop` — Staging integration branch.
* `feature/<TICKET-ID>-<description>` — Feature development branches.
* `fix/<TICKET-ID>-<description>` — Bug fix branches.
* `release/vX.Y.Z` — Release candidate preparation branches.

---

## 10. Commit Conventions
Commits MUST follow the **Conventional Commits Specification**:
* `feat(pos): add offline transaction sync queue`
* `fix(backend): fix async loop teardown in pytest`
* `docs(governance): add phase 0 architecture governance charter`
* `refactor(ui): extract VirtualTable component into @ssr-one-ai/tables`
* `test(backend): add pytest unit test for approval engine`

---

## 11. Code Review Checklist
Before any pull request can be merged into `develop`, the reviewer MUST verify:
1. [ ] Code compiles with zero TypeScript errors (`pnpm run type-check`).
2. [ ] Backend pytest suite passes 100% (`pytest tests/unit/`).
3. [ ] No `any` types, `console.log`, or `debugger` statements exist.
4. [ ] Golden Rule #1 satisfied (Zero mock arrays or fake objects).
5. [ ] Module layout adheres to the 9-part enterprise structure.
6. [ ] Database DDL or Alembic migrations provided for schema changes.
7. [ ] API endpoints include authentication & tenant isolation guards.
8. [ ] New functions include docstrings and explicit return types.
9. [ ] No hardcoded secrets or passwords in code.
10. [ ] PR contains an up-to-date description and test instructions.

---

## 12. Testing Standards
* **Backend Unit Tests**: Place unit tests under `services/backend/tests/unit/` using `pytest` and `pytest-asyncio`.
* **Frontend Unit Tests**: Component tests using React Testing Library.
* **E2E Tests**: Cross-service browser E2E workflows under `tests/e2e/` using Playwright.
* **Coverage Goal**: Maintain $\ge 80\%$ test coverage on core engines and service logic.

---

## 13. Documentation Standards
* **Self-Documenting Folders**: Every top-level workspace directory MUST contain a `README.md` explaining its purpose and architecture.
* **Function Docstrings**: Public TypeScript functions MUST include JSDoc comments; Python functions MUST include Google-style docstrings.
* **Auto-Generated API Specs**: FastAPI endpoints MUST provide OpenAPI descriptions (`summary`, `description`, `response_model`).

---

## 14. Definition of Done (DoD)
A task or feature is officially **Done** only when:
1. [ ] Feature implementation meets 100% of user request requirements.
2. [ ] All 14 Architecture Governance standards are satisfied.
3. [ ] Code compiles cleanly across all packages in monorepo.
4. [ ] Automated unit and integration tests pass with zero errors.
5. [ ] Database schema changes applied and verified against PostgreSQL.
6. [ ] Documentation updated in `docs/` or corresponding `README.md`.
7. [ ] CI/CD pipeline (`.github/workflows/ci.yml`) runs green.
8. [ ] Chief Software Architect sign-off received.
