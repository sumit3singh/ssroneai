# SSR One AI – Universal Enterprise UI/UX Standard & Design System (DESIGN_SYSTEM.md)

> **Last Reviewed**: August 2026
> **Mandatory Rule for All Developers & AI Assistants**: Every UI feature, page, modal, and component built across **The ssrone** ecosystem MUST strictly conform to this Universal UI Standard.

---

## 1. Governance & Golden Rules of Universal UI

1. **Fit-to-Screen Compact Information Layout**:
   - UI tables and containers MUST fit within the viewport screen size without overflowing or forcing huge page-level scrollbars.
   - Tables MUST use compact density padding (`py-2 px-3` or `padding: 0.75rem 1rem`), small fonts (`text-xs` / `0.75rem`), and square/compact bounding boxes.
   - Summaries, KPI banners, and action controls must remain visible above or alongside primary data grids.

2. **Database Single Source of Truth (SSOT)**:
   - ZERO fake data arrays, static fallback text, or hardcoded dummy values (`"John Doe"`, `"Baithak Cafe"`, etc.) are permitted in production UI components.
   - Every metric, table row, status badge, company, and branch MUST be dynamically fetched from and persisted to the PostgreSQL database via REST API.

3. **Universal Currency Standard: INR (`₹`)**:
   - All financial amounts (fees, MRR, ARR, prices, invoice amounts) MUST be displayed in Indian Rupees (`₹`) formatted via `toLocaleString('en-IN')` (e.g. `₹12,000 / yr`).
   - Hardcoded USD (`$`) or unformatted numbers are strictly forbidden.

4. **Yearly Subscription Lifecycle & Payment Receipts**:
   - Standard subscription pricing: **₹12,000 / year** (365-day validity period).
   - Subscription Status badges MUST reflect live database validity:
     - `Active` (`365 DAYS REMAINING`) – Green badge
     - `Expired` (`EXPIRED`) – Red destructive badge
     - `Suspended` – Amber warning badge
   - Payment receipts MUST record Payment Mode (*UPI Transfer, Razorpay, Bank NEFT, Cash*) and **UTR Reference Number** (e.g., `UTR-UPI-9876543210`).

5. **4-Level Enterprise Tree Explorer & Direct Provisioning**:
   - Hierarchical structure across all modules:
     1. **Platform Operating System** (SSR IT Platform)
     2. **Tenant Customer** (Subscription Account)
     3. **Corporate Legal Entity** (Company CIN/GSTIN)
     4. **Outlet & Branch** (Physical Branch Code / City)
   - Provisioning MUST support direct modal action (`+ Add Company`, `+ Add Branch`) with real-time API persistence to PostgreSQL.

---

## 2. HSL Design Token System

All color tokens are expressed in HSL CSS variables supporting seamless Light and Dark modes:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%; /* ssrone Violet */
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.75rem;
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --card: 224 71.4% 4.1%;
  --card-foreground: 210 20% 98%;
  --primary: 263.4 70% 50.4%;
  --border: 215 27.9% 16.9%;
}
```

---

## 3. Universal Typography & Component Standards

- **Primary Font**: `Inter`, system-ui, sans-serif.
- **Monospace Code/Ref Font**: `JetBrains Mono`, `ui-monospace`, monospace (for UTR numbers, License Keys, Branch Codes, and GSTINs).
- **Glassmorphism & Micro-Interactivity**:
  - Cards and modals MUST use subtle glassmorphism borders (`border: 1px solid rgba(255,255,255,0.1)` in dark mode).
  - Hover states MUST feature smooth transition effects (`transition: all 0.15s ease-in-out`).
  - Primitive UI components MUST be imported from `@ssrone/ui` (`Button`, `Badge`, `Card`, `Modal`, `Drawer`).

---

## 4. Universal Interaction & Usability Laws (Non-Negotiable)

1. **PostgreSQL Single Source of Truth (SSOT)**:
   - PostgreSQL is the sole data authority. Zero mock arrays, zero dummy fallback state.

2. **100% Professional Enterprise UI**:
   - Design must feel bespoke, state-of-the-art, and ultra-premium (never look like generic low-effort AI placeholders).

3. **Full Multi-Device Ergonomics (Keyboard, Touchscreen & Mouse)**:
   - **Keyboard `Enter` Key Form Submission**: EVERY input form MUST be wrapped in a `<form onSubmit={...}>` element with a `type="submit"` button so that pressing `Enter` on a physical, soft, or mobile keyboard immediately submits the form.
   - **Touchscreen Friendly**: All interactive touch targets must be at least $44 \times 44\text{px}$ with generous spacing.
   - **Mouse & Pointer Ergonomics**: Proper cursor pointers (`cursor-pointer`), hover states, and smooth click feedback.

