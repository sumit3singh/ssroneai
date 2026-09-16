# AI Assistant Coding & Governance Rules

> **Last Reviewed**: August 2026

This document defines mandatory behavior for AI coding assistants working on **The ssrone**.

---

## 1. Core Operating Laws

1. **Read `AGENTS.md` First**: Always read `.agents/AGENTS.md` before making architectural decisions or writing new code.
2. **Never Create Duplicate Docs**: Search `.agents/` before creating documentation. Edit existing files instead of creating new ones.
3. **Zero Mock Data in Production Code**: PostgreSQL is the single source of truth. Never generate fallback arrays or demo records inside components.
4. **Enforce 5-Part Architecture**: Keep component files under 300 lines of code. Delegate layout to `dashboard`, `master`, `transaction`, `report`, `settings`.
5. **Service-Repository Pattern**: Put DB queries in `repository.py`, business logic in `services.py`, and endpoint routes in `router.py`. No raw SQL queries or direct DB commits inside `router.py`.
6. **Never Declare Work Done Prematurely**: Never claim a feature is complete until full backend unit/integration tests pass and runtime verification (ORM result unwrapping, exception handling, schema matching) is executed.
7. **PostgreSQL Single Source of Truth (SSOT)**: Never hardcode fallback `tenant_id` (e.g. `1` or `2`) or `branch_id` (`1`). Never swallow backend exceptions in `try/except` to return empty `[]` arrays silently.
8. **Frontend-Backend Module Parity**: Frontend and backend module directories MUST match 1-to-1. Orphaned backend modules (e.g., `cloud_kitchen`, `sweet_bakery`) that do not exist in frontend must be pruned or aligned.

---

## 2. Fundamental Enterprise Architecture & Governance Directives (The 50 Immutable Laws)

1. **Single Source of Truth**: One business entity must have one authoritative source of truth.
2. **Canonical Workflow**: Every business operation must follow one canonical workflow across every channel, module, device, and interface.
3. **Zero Logic Duplication**: Never duplicate business logic, master data, calculations, or transaction rules across modules.
4. **Service Layer Boundary**: Every data write must pass through the authorized business/service layer.
5. **No Direct Frontend Persist**: No frontend is allowed to directly control business-critical database operations.
6. **ACID Transaction Guarantee**: Every transaction must be atomic, consistent, isolated, and recoverable.
7. **Zero Partial Commits**: Never allow partial transactions or partially committed business operations.
8. **Database Constraint Enforcement**: Database constraints must enforce critical business integrity, not application logic alone.
9. **Referential Validity & Traceability**: Every relationship between business entities must be referentially valid and traceable.
10. **No Entity Duplication**: Never create duplicate records when an existing authoritative entity already exists.
11. **Shared Master Data & Services**: Every module must consume shared services, shared rules, and shared master data.
12. **Multi-Tenant Security & Ownership**: Every API must enforce authentication, authorization, tenant isolation, validation, and data ownership.
13. **Strict Boundary Scoping**: No user or module may access data outside its authorized tenant, organization, outlet, role, or scope.
14. **Zero Unvalidated Client Trust**: Never trust client-side validation for security or data integrity.
15. **Auditable Business Actions**: Every critical business action must be auditable with actor, timestamp, action, source, and affected data.
16. **Immutability of Historical Data**: Historical financial, operational, inventory, and transactional data must remain immutable wherever legally and operationally required.
17. **No Silent Overwrites**: Never silently overwrite critical business data.
18. **Controlled Authorization & Traceability**: Every critical modification must have traceability and controlled authorization.
19. **Deterministic Centralized Calculations**: All calculations must come from centralized, deterministic business rules.
20. **Channel Uniformity**: Tax, pricing, discount, inventory, payment, accounting, loyalty, and settlement logic must never diverge between channels.
21. **Idempotent External Integrations**: Every external integration must be idempotent, retry-safe, failure-aware, and fully traceable.
22. **Retry-Safe Async Operations**: Every asynchronous operation must be designed for retries without creating duplicate business transactions.
23. **Observable & Recoverable Failures**: Every failure must produce a controlled, observable, and recoverable system state.
24. **Zero Orphan / Duplicate Data**: No error may leave behind orphan, duplicate, incomplete, or inconsistent data.
25. **Master-Data Integrity Protection**: Every master-data change must preserve downstream transactional integrity.
26. **Module Boundary Respect**: Every module must respect dependency boundaries and must never bypass another module's authoritative service.
27. **Pre-Implementation Impact Audit**: Every new feature must be checked against all existing modules, workflows, APIs, tables, integrations, and business rules before implementation.
28. **Full Data Lifecycle Completion**: No feature is complete until its data lifecycle is complete from creation to modification, usage, settlement, reporting, audit, and archival.
29. **Backward Compatibility Enforcement**: No schema, API, workflow, or business-rule change may be introduced without checking backward compatibility.
30. **Automated Regression Coverage**: Every critical workflow must have automated regression coverage.
31. **Production Deployment Quality Gates**: Every release must pass data-integrity, security, authorization, concurrency, failure, and regression validation.
32. **No Testing on Production Data**: Production data must never be used as a testing ground for unverified business logic.
33. **Least-Privilege Security Principles**: Sensitive data must follow least-privilege access, secure storage, secure transmission, and controlled exposure principles.
34. **Context-Specific API Exposure**: API responses must expose only the data required for the requesting context.
35. **Zero Credential / Token Leakage**: Secrets, credentials, tokens, internal configuration, and sensitive operational data must never leak through APIs, logs, errors, or client applications.
36. **Structured Telemetry & Alerts**: Every critical system event must be observable through structured logs, metrics, tracing, and alerts.
37. **Automated Reconciliation Mismatch Detection**: Every reconciliation failure must be detectable automatically rather than discovered manually.
38. **Continuous Platform Integrity Scanning**: The platform must continuously detect orphan records, duplicate records, broken relationships, financial mismatches, inventory mismatches, and unauthorized data access.
39. **Business Continuity & Disaster Recovery**: Business continuity, backup, recovery, and disaster recovery must be treated as core ERP capabilities, not infrastructure afterthoughts.
40. **Blast-Radius Isolation**: No single module, service, employee, device, integration, or AI agent should be capable of corrupting the entire platform.
41. **No AI-Hallucinated Persistence Behavior**: AI-generated code must never invent tables, APIs, workflows, fields, business rules, or persistence behavior when an existing standard already exists.
42. **AI Pre-flight Inspection**: AI must inspect existing architecture, contracts, schemas, dependencies, and business rules before modifying the system.
43. **AI Reuse First Rule**: AI must reuse existing capabilities before creating new capabilities.
44. **No UI Persistence Assumption**: AI must never assume that a successful UI operation means successful business persistence.
45. **Multi-Level AI Validation**: Every AI-generated change must be validated at UI, API, service, database, integration, and end-to-end workflow levels.
46. **Origin-Independent Consistency**: Every business capability must behave consistently regardless of where the operation originates.
47. **Loose Coupling & Strong Entity Consistency**: Every module must remain loosely coupled but strongly consistent around shared business entities.
48. **Correctness Over Performance Shortcuts**: Performance optimization must never compromise correctness, security, auditability, or transactional integrity.
49. **User Experience without Control Degradation**: User experience, operational speed, and automation must improve without weakening enterprise controls.
50. **Enterprise Precedence Guarantee**: The ERP must always prefer correctness, consistency, security, traceability, and recoverability over shortcuts.

