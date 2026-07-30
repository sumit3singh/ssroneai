# The Baithak — Design Tokens Specification
**Version:** 1.1  
**Status:** Frozen  

---

## 1. Color Tokens Mapping

| Semantic Token | Light Mode Value | Dark Mode Value | Tailwind Class Mapping |
| :--- | :--- | :--- | :--- |
| **Primary** | `#1F4E5F` | `#6BA6FF` | `bg-primary` / `text-primary` |
| **Secondary** | `#F3F4F6` | `#262B35` | `bg-secondary` / `text-secondary` |
| **Accent** | `#C58B3A` | `#D4A45A` | `bg-accent` / `text-accent` |
| **Background** | `#F8F5F1` | `#171A1F` | `bg-background` / `text-foreground` |
| **Card / Surface** | `#FFFFFF` | `#20242C` | `bg-card` |
| **Border** | `#E5E7EB` | `#343B48` | `border-border` |
| **Muted** | `#F3F4F6` | `#262B35` | `bg-muted` / `text-muted-foreground` |

---

## 2. Radii & Border Tokens
- **Base Radius**: `12px` (Tailwind `rounded-xl`). Used for inputs, buttons, and visual cards.
- **Large Radius**: `16px` (Tailwind `rounded-2xl`). Used for main panels, modals, and drawers.
- **Small Radius**: `8px` (Tailwind `rounded-lg`). Used for small inline tags, selectors, and dropdown options.

---

## 3. Shadows & Elevators
- **Elevation Base**: `shadow-sm` (Light Mode: soft shadow, Dark Mode: none).
- **Elevation Raised**: `shadow-md` (Used for hover states and cards).
- **Elevation Overlay**: `shadow-xl` (Used for floating dropdowns, modals, and tooltips).

---

## 4. Metadata Registry Tables (NEW)
Every dynamic asset, route, form, and permission scope must be cataloged in PostgreSQL metadata registry tables.

### 4.1 table: file_master_erp
- `file_id` (VARCHAR(50), PK): Unique code (e.g. `POS001`, `PG001`).
- `file_name` (VARCHAR(150)): Readable label.
- `file_type` (VARCHAR(20)): `FORM`, `REPORT`, `DASHBOARD`, `WIDGET`.

### 4.2 table: role_permission
- `role_id` (UUID, FK referencing `roles.id`)
- `file_id` (VARCHAR(50))
- `can_view` (BOOLEAN)
- `can_add` (BOOLEAN)
- `can_edit` (BOOLEAN)
- `can_delete` (BOOLEAN)
- `can_print` (BOOLEAN)
- `can_export` (BOOLEAN)

### 4.3 Objects Core Mapping
All database transaction items, KDS counters, guest bookings, and resident receipts must declare these four reference properties on schema level:
- `file_id`
- `module_id`
- `screen_type`
- `permission_code`
