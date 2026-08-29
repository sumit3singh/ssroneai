# Git Workflow & Commit Standard

> **Last Reviewed**: August 2026

This document defines Git branching and commit message conventions for **The ssrone**.

---

## 1. Commit Message Convention (Conventional Commits)

Commit messages MUST follow the format: `<type>(<scope>): <description>`

### Allowed Types:
- `feat`: New feature or capability.
- `fix`: Bug fix or patch.
- `refactor`: Code refactoring without functionality changes.
- `docs`: Documentation updates.
- `test`: Adding or updating automated tests.
- `chore`: Infrastructure, dependency, or config updates.

### Examples:
- `feat(pos): add size-based addon pricing algorithm`
- `fix(pg-management): resolve type error in resident master table`
- `refactor(backend): separate service and repository layers in restaurant module`
