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
