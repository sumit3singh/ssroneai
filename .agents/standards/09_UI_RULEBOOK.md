# The Baithak — UI Rule Book
**Version:** 1.1  
**Status:** Non-Negotiable Baseline  

---

## 1. Light Mode Colors (Strict Baseline)
The following hex color values are the **only** permitted values for Light Mode backgrounds and surfaces:

- **Background**: `#F8F5F1` (Cream background)
- **Surface**: `#FFFFFF`
- **Text**: `#111827`
- **Sidebar**: `#FFFFFF`
- **Cards**: `#FFFFFF`
- **Tables**: `#FFFFFF`

> [!CAUTION]
> **Prohibition of Dark Surfaces in Light Mode:**
> Dark backgrounds (such as `#171A1F` or `#0F172A`) are strictly prohibited for main dashboard panels, cards, grids, or containers when the Light Mode theme is active. Any screen showing dark surfaces in Light Mode fails UI review.

---

## 2. Dark Mode Colors
- **Background**: `#171A1F` (Dark background)
- **Surface**: `#20242C` (Darker grey-blue surface)
- **Text**: `#E8EAF0`
- **Sidebar**: `#20242C`
- **Cards**: `#20242C`
- **Tables**: `#20242C`

---

## 3. Theme Governance Rule
A developer cannot create custom or inline hex/RGB colors inside react files (`.tsx`).
- **Design Token Dependency**: All colors must come from Tailwind semantic tokens (e.g. `bg-background`, `bg-card`, `border-border`, `text-foreground`).
- **Rule Enforcement**: Hardcoded color strings (e.g., `bg-[#0f172a]` or style attributes with raw hex codes) are forbidden.

---

## 4. File-Based Permission Governance (NEW)
Every page, modal, report, or transaction action in the frontend must map directly to a unique configuration key (`file_id`) defined in the database metadata table `file_master_erp`:
- **POS Billing**: `POS001`
- **KOT Entry**: `POS002`
- **Sales Register**: `POSR001`
- **Resident Setup**: `PG001`
- **Resident Ledger**: `PGR001`
- **PMS Room Grid**: `PMS001`

A developer cannot render a new route or custom action wrapper without checking active user permissions against the associated `file_id`.
