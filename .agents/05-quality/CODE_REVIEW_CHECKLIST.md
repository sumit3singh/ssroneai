# Code Review & Architecture Verification Checklist

> **Last Reviewed**: August 2026

This checklist must be used by software architects and code reviewers before merging Pull Requests into main branches.

---

## Review Criteria

1. **Security & RLS Isolation**: Does every PostgreSQL query enforce Row-Level Security (`tenant_id`)?
2. **Golden Rules Compliance**: Are there any hardcoded mock objects or fallback arrays in production code?
3. **Monorepo Package Boundaries**: Are UI components imported from `@ssrone/ui` and types from `@ssrone/types`?
4. **Backend Layering**: Are DB queries isolated in `repository.py` and business logic in `services.py`?
5. **Component Size Limit**: Is every file under 300 lines of code?
6. **Documentation Integrity**: Did the author check for existing docs before creating new ones?
