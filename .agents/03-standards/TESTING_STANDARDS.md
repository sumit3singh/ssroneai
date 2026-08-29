# Testing & Quality Assurance Standards

> **Last Reviewed**: August 2026

This document defines testing frameworks, coverage rules, and test execution standards.

---

## 1. Test Automation Hierarchy

1. **Unit Tests (Vitest / PyTest)**: Test pure functions, math algorithms (e.g. dynamic addon pricing), and utility helpers.
2. **Integration Tests (PyTest + Async Client)**: Test API endpoints against a real PostgreSQL test database.
3. **End-to-End Tests (Playwright)**: Test critical user journeys (POS order entry, guest check-in, PG rent receipt issuing).

---

## 2. Test Execution Commands

- Frontend Unit Tests: `npm run test` (Vitest)
- Frontend Type Check: `npm run type-check` (`tsc --noEmit`)
- Backend Tests: `pytest` (PyTest)
