# Point of Sale (POS) & KDS Technical Specification

> **Last Reviewed**: August 2026

This document defines the functional and technical specifications for the high-volume POS and KDS ecosystem.

---

## 1. Core POS Business Capabilities

- **Interactive Table Grid**: Floor plan visualization with color-coded status (`free`, `occupied`, `billing`).
- **KOT Generation**: Kitchen Order Tickets pushed in real-time via WebSockets to Kitchen Display Screens (KDS).
- **Size-Based Addon Pricing Algorithm**: Dynamic price calculation for variants and addons based on portion size (`Small`, `Medium`, `Large`).
- **Offline Billing Engine**: IndexedDB local order queue syncing automatically on network reconnection.
- **5-Part Route Layout**:
  - `pos/dashboard`: Real-time POS Sales & Active Tables.
  - `pos/master`: Menu Categories, Items, Variants & Waiters Master.
  - `pos/transaction`: KOT Orders & Cashier Billing.
  - `pos/report`: Daily Sales & GST Tax Summary Reports.
  - `pos/settings`: KDS Station Routing & ESC/POS Printer Rules.

---

## 2. Enterprise Zero-Wait POS Architecture Standard

Refer to [ADR-0010](file:///e:/2026/ssr_one_ai/.agents/02-architecture/DECISIONS/ADR-0010-zero-wait-pos-architecture-and-dual-in-memory-mounted-layout.md) and [ZERO_WAIT_POS_BLUEPRINT.md](file:///e:/2026/ssr_one_ai/.agents/02-architecture/ZERO_WAIT_POS_BLUEPRINT.md):

1. **< 1.2ms Perceived Latency (Send KOT & Settle Bill)**:
   - Client-side deterministic daily token sequence (`#001`, `#002`) and UUIDv4 idempotency keys generated via `order-sequence.ts`.
   - Multi-station kitchen thermal KOT printing and cashier guest receipt printing dispatched immediately via `useAsyncPrintQueue`.
   - Local state mutates table occupancy, active orders, and clears cart synchronously in `< 0.2ms`.
   - Background synchronization dispatched via `useZeroWaitOrderSync.ts` with `X-Idempotency-Key` header.
2. **Dual In-Memory Hot-Mounted DOM (< 0.2ms Virtual Transitions)**:
   - Billing Grid (`POSItemGrid + POSCartPanel`) and Table Floor Tracker (`POSTableTrackerPage`) are permanently mounted in the DOM.
   - Screen transitions execute via CSS visibility class swapping (`flex` vs `hidden`) without unmounting or route reloads.
   - Browser URL updates seamlessly in background via `window.history.replaceState`.
3. **Offline & Network Drop Immunity**:
   - Transactions persist into IndexedDB (`Dexie.js` `offlineOrders`) in `< 0.5ms` prior to network dispatch.
   - Auto-reconnect drainer listens for `online` events and retries with exponential backoff.

