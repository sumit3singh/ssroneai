# The Baithak — Coding Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. Directory Structure Conventions
All packages in the monorepo must adhere to this module structure:
- **Frontend** (`apps/admin-web/src`):
  - `app/`: Global providers, stores, styles.
  - `shared/`: Generic components, utility functions, layout wrappers.
  - `modules/{module_name}/`: Page views, customized components, and custom hooks.
- **Backend** (`backend/src`):
  - `core/`: Database connections, engine config, exceptions.
  - `modules/{module_name}/`: Routes (`router.py`), database tables (`models.py`), request schemas (`schemas.py`), and logic layers (`service.py`).

---

## 2. Naming Conventions

### 2.1 File Names
- React Page and Component files must use PascalCase and have `.tsx` extension (e.g. `POSPage.tsx`, `AppShell.tsx`).
- Helper modules and hooks must use camelCase (e.g. `useCreateOrder.ts`, `apiClient.ts`).
- Python files must use snake_case (e.g. `seed_menu.py`, `models.py`).

### 2.2 Variables & Functions
- **TypeScript**: camelCase for variables/functions, PascalCase for classes, Interfaces, and Types.
- **Python**: snake_case for variables/functions/attributes, PascalCase for SQLAlchemy models and Pydantic schemas.

---

## 3. Formatting
- **Linting**: ESLint for React/TypeScript, Ruff / Flake8 for Python.
- **Auto-formatting**: Prettier for TSX/JSON/CSS, Black for Python.
- **Rule**: All committed files must be format-clean before merge requests are approved.
