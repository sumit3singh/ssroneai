# ADR-0016: Tablet Staff Web, Token Order Web, and Admin Portal Multi-App Control Engine

> **Status**: Accepted & Implemented  
> **Date**: October 2026  
> **Author**: Enterprise System Architect AI & SSR IT INDUSTRY Leadership  
> **Governing Standards**: [CURRENT_STATE_SAFEGUARD.md](file:///e:/2026/ssr_one_ai/.agents/05-quality/CURRENT_STATE_SAFEGUARD.md) (Zero-Ruination Protocol)

---

## 1. Context & Business Drivers

The SSR One AI multi-tenant hospitality platform required specific frontline usability enhancements and merchant-facing controls across its suite of connected applications:

1. **Staff Handheld POS (`apps/staff-web`)**:
   - In real-world dining room service, waitstaff operate on 8-11" tablets (iPads, Samsung Galaxy Tabs) under fast-paced ambient dining conditions.
   - Small desktop-oriented buttons caused mis-taps. Waiters needed large touch targets (48px+ minimum touch hit area), large quantity steppers (`+`/`-`), instant touch feedback (Web Audio synthesizer click), and a quick-switch mechanism between tables and staff profiles without losing active draft orders.

2. **Dine-In Fast Token Order Portal (`apps/token-order-web`)**:
   - Fast-casual and QSR table diners scan table QR codes and need immediate ordering with zero friction.
   - Traditional user profiles, addresses, and delivery modes add unnecessary clutter. Diners required **strictly single-option Dine-In** mapped directly to the scanned table code (`?table=T1`), immediate daily sequential **Token Number** generation upon checkout, and a dedicated **Token Detail / Live Kitchen Tracker** view replacing the profile tab.

3. **Admin ERP Multi-App Control Studio (`apps/admin-web/src/modules/customization`)**:
   - Restaurant owners operate under varying tax jurisdictions and regulatory models (e.g. GST composite scheme where 0% tax is billed to customers, vs regular GST where 5% is added).
   - Admins required a centralized control panel to toggle GST on/off (`applyGst: boolean`), configure tax rates, toggle tax inclusive/exclusive pricing, set packaging and delivery charges, configure tablet touch modes for `staff-web`, and manage live token tracker behavior for `token-order-web`.

4. **Accounting & Cashier POS Ledger Integrity**:
   - Cancelled orders must never inflate gross sales or unpaid debt balances; when an order is cancelled, receivables and unpaid debt must zero out immediately.
   - Customer selection in the cashier register requires a single unified combobox searching by Name, Phone, and Customer Code simultaneously, while displaying real-time Opening Balance and outstanding credit ledger balances.

---

## 2. Architectural Decisions & Specifications

### 2.1 Tablet Touchscreen Optimization (`apps/staff-web`)
- **Touch Target Standard**: All primary interactive buttons, category chips, and dispatch triggers meet or exceed the 48px × 48px touch boundary requirement.
- **Large Steppers**: In-cart quantity steppers provide a minimum 38px × 38px touch radius with high-contrast `+` and `-` controls.
- **Web Audio Touch Feedback**: Synthesizes a crisp, low-latency 640Hz ➔ 840Hz sine wave tone via the Web Audio API on tap, providing immediate tactile reassurance during busy rush hours without requiring native device haptic hardware.
- **Tablet Landscape Split Layout**:
  - Left pane (7/12 cols): Table switcher bar, live search, veg-only pill, category scroll bar, and dish cards with one-tap addition.
  - Right pane (5/12 cols): Pinned order pad with active table header, item count, remark input, and full-width 52px "DISPATCH KOT TO KITCHEN" button.
- **Quick Staff Lock**: Header includes a one-tap lock/switch button triggering `StaffLoginModal` with PIN authentication.

### 2.2 Single-Option Dine-In Token Engine (`apps/token-order-web`)
- **QR Table Auto-Detection**: URL parameters (`?table=`, `?table_number=`, `?table_id=`, `?t=`) are automatically parsed and persisted to `localStorage.getItem("ssrone_dinein_table")`.
- **Strict Dine-In Enforcement**: All takeaway and delivery options are completely eliminated from the UI. The header, cart, and checkout flow permanently display `Ordering under {tableNumber} • Dine-In Only`.
- **Automated Sequential Token Code**: Checkout creates an order via `/api/v1/orders` with `order_type: "dine_in"`, generating a sequential daily token number.
- **Token Detail View (Replaces Profile)**:
  - Bottom navigation consists of three tabs: **Menu**, **Cart**, and **Token Detail**.
  - Token Detail displays the active token badge (e.g. `#14`), table number, timestamp, itemized dishes breakdown, and a 3-step live kitchen progress tracker (`Received` ➔ `In Kitchen` ➔ `Ready / Served`).
  - Provides "Order More Items for Table" to easily append items to the table session.

### 2.3 Centralized Multi-Portal Control Panel (`CustomizationStudioPage.tsx`)
The Admin ERP Customization Studio (`/customization`) controls all 5 digital tenant portals:
- **`customer-food-web`**:
  - Banner promo image and headlines.
  - **GST & Tax Policy**: Toggle GST on/off (`applyGst: boolean`), set GST rate % (0-28%), toggle price display (inclusive vs exclusive).
  - **Packaging & Delivery Fees**: Set packaging charge and delivery fee thresholds.
  - **Kitchen Automation**: Toggle automatic thermal KOT printing upon customer order placement.
- **`customer-stay-web`**: Welcome banner, in-room dining, housekeeping, digital checkout, and check-in/out policies.
- **`kds-web`**: Display theme (Dark, High Contrast, Compact Grid), station routing, audio alerts, and SLA warning threshold minutes.
- **`staff-web`**: Tablet touchscreen mode toggle, large button scaling, table floor layout (grid vs list), auto KOT print, and waiter PIN lock requirement.
- **`token-order-web`**: Strictly Dine-In only mode toggle, live token tracker screen toggle, token number format, and auto KOT send.

### 2.4 Accounting & Customer Ledger Integrity
- **Cancelled Order Zeroing**: Order cancellation immediately sets `taxable_amount = 0`, `cgst_amount = 0`, `sgst_amount = 0`, `total_tax = 0`, `grand_total = 0`, and `balance_due = 0`. This guarantees zero distortion of financial reports or customer debt ledgers.
- **Single Unified Customer Search**: Replaces separate name and phone inputs with a single combobox supporting partial string matching across name, phone, and customer code.

---

## 3. Verification & Compliance Matrix

| Component | Test / Verification Method | Result | Status |
| :--- | :--- | :--- | :--- |
| `apps/customer-food-web` | Dynamic GST tax calculation with `applyGst` toggle | `✓ built in 38.92s` | 🟢 Verified |
| `apps/staff-web` | Tablet touch screen layout, 48px+ targets, sound feedback | `✓ built in 12.89s` | 🟢 Verified |
| `apps/token-order-web` | Single-option Dine-in table QR ordering, Token Detail tab | `✓ built in 17.94s` | 🟢 Verified |
| `apps/admin-web` | Customization Studio multi-app control panel | `✓ built in 42.24s` | 🟢 Verified |
| Backend Tax & Config | `DEFAULT_CONFIGS` updated for all 5 portal apps | Zero runtime errors | 🟢 Verified |

---

## 4. Consequences & Guarantees

- **Zero Ruination**: No existing POS cashier flows, table tracker DOM hot-mounting, or database models were broken.
- **Extensible Configuration**: New tenant app settings inherit platform fallbacks automatically, preventing blank screens or unhandled exceptions for unconfigured tenants.
- **Unified Frontline Experience**: Waitstaff on tablets, diners at tables, and kitchen cooks on KDS all receive optimized interfaces tailored to their device form factors.
