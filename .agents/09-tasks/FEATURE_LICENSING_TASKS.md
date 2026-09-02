# Feature Licensing & Subscription Entitlement Tasks

> **Last Reviewed**: September 2026

This document tracks implementation tasks for tenant licensing, module feature gates, and subscription entitlement checks across SSR One AI.

---

## 1. Living Licensing Task List

- [x] Create `PermissionGuard.tsx` component wrapper in `@ssrone/auth`.
- [x] Create `FeatureGate.tsx` component for conditionally rendering UI features based on subscription tier (`Starter`, `Professional`, `Enterprise`).
- [x] Connect license key verification endpoint in `services/backend/src/modules/auth/router.py`.
- [x] Add automated branch count check on tenant branch creation API.
- [ ] Connect license entitlement middleware to FastAPI router decorators for module-level feature gating (`@require_tier(Tier.ENTERPRISE)`).
- [ ] Wire up real-time platform admin license renewal & outlet expansion events over WebSocket / REST.
- [ ] Implement client-side tier upgrade prompt modal when non-entitled module action is triggered.

