# Tenant Customization & Self-Service Custom Domains Specification

> **Enterprise Domain Specification**  
> **Module ID**: `customization`  
> **Backend Service**: `services/backend/src/modules/customization`  
> **Frontend Studio**: `apps/admin-web/src/modules/customization` (`/customization`, `/customization/domains`)  
> **Target Apps**: `customer-food-web`, `customer-stay-web`, `kds-web`, `staff-web`, `token-order-web`  
> **Last Updated**: September 2026

---

## 1. Domain Overview & Purpose

The **Website & App Customization ("Branding & Content Studio")** enables every multi-tenant organization to independently configure branding, colors, logos, banners, customer messaging, operational feature toggles, and custom apex/sub-domains for their public and internal web applications directly from `admin-web` without code changes or redeployments.

PostgreSQL Row-Level Security (RLS) is the Single Source of Truth (SSOT). All configurations adhere to the **Zero-Ruination Protocol (Invariant 11)**: if a tenant has not yet created or published custom settings, client apps seamlessly fall back to deterministic system defaults, guaranteeing 100% uptime.

---

## 2. Database Schema Architecture

### `tenant_app_configs`
Stores draft and published configuration JSONB payloads per tenant, target application, and optional branch override:
- `id`: BigInteger Primary Key (Autoincrement)
- `tenant_id`: BigInteger, Foreign Key to `tenants(id)`, Indexed
- `target_app`: String (e.g. `'customer-food-web'`, `'customer-stay-web'`, `'kds-web'`, `'staff-web'`, `'token-order-web'`)
- `branch_id`: BigInteger (Nullable, for outlet-specific theme/branding overrides)
- `draft_config`: JSONB (Stores unpublished working theme, branding, content, and feature toggles)
- `published_config`: JSONB (Live runtime configuration served to production clients)
- `status`: String (`'DRAFT'`, `'PUBLISHED'`)
- `version`: Integer (Monotonically incremented on each publication)
- `published_at`: DateTime (UTC timestamp of last publication)
- Audit Mixin: `created_at`, `updated_at`, `is_deleted`
- Unique Constraint: `(tenant_id, target_app, branch_id)`

### `tenant_custom_domains`
Stores custom apex and sub-domain registrations, verification status, and reverse-proxy bindings:
- `id`: BigInteger Primary Key
- `tenant_id`: BigInteger, Foreign Key to `tenants(id)`, Indexed
- `target_app`: String
- `branch_id`: BigInteger (Nullable)
- `domain`: String, Unique (Lowercase, stripped FQDN)
- `verification_status`: String (`'PENDING_DNS'`, `'ACTIVE'`, `'FAILED'`)
- `verification_token`: String (Unique TXT challenge string, e.g. `ssrone-verify-xxx`)
- `verified_at`: DateTime (UTC timestamp of DNS TXT verification)
- `ssl_status`: String (`'PENDING'`, `'ACTIVE'`)
- Audit Mixin: `created_at`, `updated_at`, `is_deleted`

> **Soft-Delete Reactivation Rule**: Re-registering a soft-deleted domain for the same tenant automatically flips `is_deleted = False` and regenerates the verification token, preventing PostgreSQL unique constraint collisions.

---

## 3. Configuration Resolution Hierarchy

When a client application (e.g. `customer-food-web` on port 3000) requests its effective configuration via `GET /api/v1/tenant-config/public?target_app=customer-food-web&tenant_id=baithak-cafe`:

1. **Tier 1 (Branch Override)**: Checks for published config where `branch_id == active_branch_id`.
2. **Tier 2 (Tenant Default)**: If absent, falls back to published config where `branch_id IS NULL`.
3. **Tier 3 (System Defaults)**: If neither exists, returns built-in deterministic constants (`#0d9488` teal / `#1e293b` slate theme, standard labels, and safe feature toggles).

---

## 4. API Endpoints

| Method | Path | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tenant-config/public` | Public runtime configuration resolution with 3-tier fallback | Public / Anonymous |
| `GET` | `/api/v1/tenant-config/draft` | Retrieve current draft config for editing | Tenant Admin (JWT) |
| `PUT` | `/api/v1/tenant-config/draft` | Save draft theme, content, and feature toggles | Tenant Admin (JWT) |
| `POST` | `/api/v1/tenant-config/publish` | 1-click promotion of draft config to published live state | Tenant Admin (JWT) |
| `GET` | `/api/v1/custom-domains` | List all custom domains registered by tenant | Tenant Admin (JWT) |
| `POST` | `/api/v1/custom-domains` | Register new apex or sub-domain and generate TXT token | Tenant Admin (JWT) |
| `DELETE`| `/api/v1/custom-domains/{id}` | Soft-delete registered custom domain | Tenant Admin (JWT) |
| `POST` | `/api/v1/custom-domains/{id}/verify` | Verify DNS TXT record challenge | Tenant Admin (JWT) |
| `GET` | `/api/v1/custom-domains/resolve` | Low-latency reverse-proxy hostname resolution | Public / Edge Proxy |

---

## 5. Frontend Customization Studio (`admin-web`)

Located at `/customization` in `admin-web`:
1. **Target App Selector**: Quick switcher across connected apps (`customer-food-web`, `customer-stay-web`, `kds-web`, `staff-web`, `token-order-web`).
2. **Branding & Theme Editor**: Color pickers for Primary, Secondary, and Accent HSL colors, Logo URL, Hero Banner URL, Font Family selection, Dark Mode toggle.
3. **App Content & Copy**: Business display name, tagline, announcement banner text, support phone, and support email.
4. **Feature Toggles**: Digital payment checkout, table-side dine-in QR ordering, takeaway pre-orders, customer loyalty points redemption.
5. **Interactive Live Preview**: Split-pane or toggleable desktop/mobile responsive viewport simulating real-time branding changes.
6. **Custom Domains Manager (`/customization/domains`)**: Domain listing table, DNS instruction modal (CNAME / TXT setup), status pill badges (`PENDING_DNS`, `ACTIVE`), and 1-click verification triggers.
