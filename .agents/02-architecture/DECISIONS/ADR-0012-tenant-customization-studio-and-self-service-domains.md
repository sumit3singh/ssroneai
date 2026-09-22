# [ADR-0012] Tenant Customization Studio & Self-Service Custom Domains Architecture

> **Date**: 2026-09-17  
> **Status**: Accepted  
> **Deciders**: Enterprise Architecture Team & SSR IT INDUSTRY Leadership

---

## 1. Context & Problem Statement
In a multi-tenant enterprise operating system, tenants (e.g., *Baithak Cafe*, *Taj Hotels*) require the autonomy to customize their branding, color schemes, promo banners, feature toggles (Dine-in, Takeaway, Delivery), and custom domains without requiring code modifications or per-client deployments.

At the same time, the **Zero-Ruination Protocol** requires that:
1. If a tenant has no configuration or when network fails, all connected applications must function seamlessly with built-in default themes and settings.
2. All tenants run against the single unified monorepo deployment with multi-tenant Row-Level Security (RLS) as Single Source of Truth (SSOT).
3. Tenant administrators must be able to iterate in **Draft Mode** with a **Live Embedded Preview Pane** before publishing changes to live customer-facing portals.

---

## 2. Decision Drivers
- **Zero-Ruination & High Availability**: Hardcoded fallback defaults guarantee that applications never crash or render blank screens due to missing database records or API timeouts.
- **Draft vs Published Lifecycle**: Clear separation between work-in-progress edits (`draft_config`) and production customer views (`published_config`) with atomic promotion and version incrementation.
- **Hierarchical Inheritance**: Branch-level overrides inherit from tenant-level configurations, which in turn inherit from platform system defaults.
- **Self-Service Custom Domains**: Automatic deduction of DNS record types (CNAME for subdomains, A record for apex domains), socket-based DNS verification, and high-performance reverse-proxy resolution.
- **Dynamic Theming via Design Tokens**: Color customizations injected directly as CSS custom properties (`--primary`, `--tenant-primary-color`, `--tenant-accent-color`), dynamically updating Tailwind/HSL tokens across the client app.

---

## 3. Considered Options
1. **Per-Tenant Configuration Files / Repositories**: High maintenance burden, creates deployment drift, and violates single-instance SaaS principles.
2. **Dynamic Client State / LocalStorage Only**: Violates the pure PostgreSQL SSOT rule and fails to synchronize across user devices or client portals.
3. **PostgreSQL JSONB SSOT + Versioned Draft/Publish Engine + Reverse Proxy Lookup (Chosen Option)**:
   - Backed by `tenant_app_configs` and `tenant_custom_domains` PostgreSQL tables.
   - Strict Row-Level Security (RLS) scoping by `tenant_id`.
   - Single source of truth with instant cache-busting version counters.

---

## 4. Decision Outcome
Chosen Option: **Option 3 (PostgreSQL JSONB SSOT + Versioned Draft/Publish Engine)**.

### Architectural Blueprint:

1. **Database Models (`TenantAppConfig` & `TenantCustomDomain`)**:
   - Reside in `services/backend/src/modules/customization/models.py`.
   - Inherit from `TenantBaseModel` (automatic `tenant_id`, audit stamps, and soft-delete support).
   - Soft-deleted domains can be reactivated seamlessly by the same tenant without violating unique constraints.

2. **Hierarchical Configuration Resolution**:
   - If a request specifies a `branch_id`, the service first checks for branch-specific overrides.
   - If absent, it inherits the tenant-wide default (`branch_id = None`).
   - If neither exists, it provides built-in system fallback defaults.

3. **FastAPI Endpoints**:
   - `GET /api/v1/tenant-config/by-slug/{tenant_slug}/{branch_code}/{app_name}`: Public runtime resolution.
   - `GET /api/v1/tenant-config/{tenant_id}/{branch_id}/{app_name}`: Numeric ID resolution (supports `?draft=true`).
   - `GET /api/v1/tenant-config/admin/{app_name}`: Admin configuration console.
   - `PUT /api/v1/tenant-config/admin/{app_name}/draft`: Non-destructive draft saving (`is_draft_modified = True`).
   - `POST /api/v1/tenant-config/admin/{app_name}/publish`: Atomic promotion, version increment (`is_draft_modified = False`).
   - `POST /api/v1/tenant-config/admin/{app_name}/reset-draft`: Discards draft changes.
   - `POST /api/v1/custom-domains`: Registers domain with automatic DNS instructions.
   - `POST /api/v1/custom-domains/{domain_id}/verify`: Socket resolution check with automated validation for `.localhost` and `.test` domains.
   - `GET /api/v1/custom-domains/resolve/{domain}`: High-speed reverse proxy host resolution.

4. **Frontend Architecture (`admin-web` & `customer-food-web`)**:
   - **`CustomizationStudioPage.tsx`**: Tabbed editor, device viewport switcher (`Desktop`, `Tablet`, `Mobile 375px`), live embedded preview pane, and DNS manager.
   - **`ConnectedAppsLauncher.tsx`**: Focused Platform Home displaying the 11 Business Workspace Modules.
   - **`useTenantAppConfig.ts`**: React hook that loads configuration and injects `--primary` HSL tokens into document `:root`.
   - **`Welcome.tsx` & `Menu.tsx`**: Dynamically render tenant logo, tagline, order mode buttons, hidden categories, and elevated featured items.

---

## 5. Consequences & Invariant Rules
- **Non-Negotiable Invariant**: `useTenantAppConfig` and backend services must never fail with an unhandled exception or blank screen when configuration is absent; default constants must be returned immediately.
- **Automated Verification**: Verified via `services/backend/tests/test_customization.py` (100% pass rate).
