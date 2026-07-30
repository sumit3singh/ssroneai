# The Baithak — Testing Standards
**Version:** 1.0  
**Status:** Approved  

---

## 1. Unit Testing Strategy
- **Backend**: Use `pytest` and `pytest-asyncio` for unit testing service layers, schemas, and utils.
- **Frontend**: Use `vitest` and Testing Library for unit testing UI utilities and custom hooks.

---

## 2. Integration Testing Strategy
- Test the integration of routes, middleware, and database operations.
- **Rules**:
  - Use a clean test database schema instance for running test suites.
  - Transactions must be rolled back after each test case execution to keep the environment consistent.

---

## 3. End-to-End (E2E) Testing
- **Tool**: Playwright or Cypress for E2E user path validation.
- **Focus**: Validate checkout flows, KDS websocket broadcasts, and role-based navigation.
- **Mock Data**: Use the seeded database records to ensure repeatable test benchmarks.
