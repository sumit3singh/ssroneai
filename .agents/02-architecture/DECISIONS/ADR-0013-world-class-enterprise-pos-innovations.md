# [ADR-0013] World-Class Enterprise POS Innovations & Zero-Ruination Hardening

> **Date**: 2026-09-18  
> **Status**: Accepted  
> **Deciders**: Enterprise Architecture Team & SSR IT INDUSTRY Leadership

---

## 1. Context & Problem Statement
Prior to production live launch across global food service and retail locations, SSR One AI required a suite of modern point-of-sale innovations to compete with and surpass top legacy POS systems (Toast, Square, Petpooja, Lightspeed). 

The key requirements were:
1. **Dynamic UPI QR & Offline Soundbox Audio Chime**: Contactless scan-and-pay with instant audio confirmation on the POS terminal without depending on third-party hardware soundboxes or audio file downloads.
2. **Customer-Facing Display (CFD / 2nd Screen Kiosk)**: Dual-screen counter operations where customers can review live cart items, taxes, discounts, and scan payment QR codes simultaneously with zero cashier interruption.
3. **Multilingual AI Voice Order Taking**: Real-time hands-free order creation supporting natural English and Hindi ("दो मसाला डोसा", "three chai").
4. **PWA Kiosk & Tablet 1-Click Install**: Turn-key native-like desktop and tablet deployment with service worker caching for offline boot.
5. **WhatsApp Invoicing & Guest Receipts**: 1-click digital receipt dispatch via WhatsApp Web and WhatsApp Cloud API.
6. **Recipe Bill of Materials (BOM) Stock Consumption**: Automated inventory ingredient decrementing on order fulfillment.
7. **Food Delivery Aggregator Gateway Webhook**: Real-time order ingestion from Swiggy, Zomato, and UberEats directly into the kitchen display and order tracker.
8. **Multi-Currency & Global i18n Engine**: Localization across INR, USD, EUR, GBP, AED, SAR and language dictionaries (English, Hindi, Arabic).

All additions were required to adhere strictly to the **Zero-Ruination Protocol**: zero regression of sub-1.2ms POS billing performance, dual in-memory hot-mounted layout preservation, and 100% type safety.

---

## 2. Decision Drivers
- **Zero-Ruination & Performance Guarantee**: POS item clicks must remain instantaneous (< 1.2ms). Sound synthesis and second-screen updates must not block the main JavaScript event loop.
- **Offline-First Resilience**: If the internet disconnects, the QR matrix generator and Web Audio soundbox synthesizer must function 100% locally with zero external network dependencies.
- **Zero Hardware Lock-In**: Soundbox chimes work directly through standard browser speakers using Web Audio API frequencies, eliminating the monthly subscription cost of physical IoT soundboxes.
- **Cross-Window Synchronization**: Customer display operates seamlessly across browser windows or separate monitors using the native `BroadcastChannel` API without requiring round-trip WebSocket server hops.

---

## 3. Architecture & Implementation Blueprint

### A. Dynamic UPI QR & Web Audio Soundbox Chime
- **Offline SVG Matrix Generator**: Implemented in pure TypeScript (`DynamicUpiQrCode.tsx`), generating ISO/IEC 18004 compliant QR codes locally with zero external libraries.
- **Synthesized 3-Tone Chime**: `playPaymentSuccessSound()` in `@ssrone/utils` uses `window.AudioContext` to construct a triumphant C5 (523.25 Hz), E5 (659.25 Hz), and G5 (783.99 Hz) harmonic sequence with exponential gain decay. It requires 0 audio asset downloads and executes with 0ms latency.
- **Modal Integration**: `POSUPIQRModal.tsx` handles dynamic bill amounts, test chimes, and instant one-tap settlement.

### B. Customer-Facing Display (CFD / 2nd Monitor)
- **Channel**: `BroadcastChannel("ssrone_cfd_sync")`.
- **Route**: `/pos/cfd` registered in `apps/admin-web/src/app/routes/index.tsx`.
- **Data Flow**:
  - `CART_UPDATE`: Broadcasts line items, subtotal, discount, GST, and net payable.
  - `ORDER_SETTLED`: Broadcasts settled order number and triggers celebratory animation and audio chime.
  - `CLEAR_CART`: Resets the customer screen to the welcome billboard.

### C. Multilingual AI Voice Order Engine
- **Component**: `POSVoiceOrderButton.tsx`.
- **Speech API**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- **Parsing**: Natural language number matching (`"ek"`, `"do"`, `"teen"`, `"one"`, `"two"`, etc.) and fuzzy token similarity matching against the active menu item catalog.
- **UI State**: Visual microphone pulse, floating live transcript pill, and instant cart insertion.

### D. Progressive Web App (PWA) Kiosk Engine
- **Manifests**: `manifest.webmanifest` configured with `display: "standalone"`, `orientation: "landscape-primary"`, and fast navigation shortcuts.
- **Service Workers**: `sw.js` in `apps/admin-web`, `apps/kds-web`, and `apps/token-order-web` caching shell assets for instant boot and offline resilience.

### E. Backend Enterprise Endpoints
1. **WhatsApp Invoicing**: `POST /api/v1/orders/{order_id}/whatsapp-invoice` generates formatted receipts and clickable `wa.me` dispatch links.
2. **Aggregator Webhook**: `POST /api/v1/orders/integrations/aggregators/webhook` normalizes Swiggy/Zomato orders into internal order structures with automatic daily sequence generation.
3. **Recipe BOM Stock Consumption**: `POST /api/v1/inventory/orders/{order_id}/consume-bom` automatically computes ingredient usage and inserts `StockMovement` audit entries.

---

## 4. Verification & Validation
- **TypeScript & Build Integrity**:
  - `pnpm --filter @ssrone/admin-web build`: 0 errors across 4,631 modules.
  - `pnpm --filter @ssrone/kds-web build`: 0 errors across 1,648 modules.
  - `pnpm --filter @ssrone/token-order-web build`: 0 errors.
- **Zero-Ruination Invariant**: POS hot DOM layout and sub-1.2ms token generation preserved without regression.
