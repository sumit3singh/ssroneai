# @ssrone/token-order-web (Mobile Fast-Order & Queue-Buster Token Web)

Standalone ultra-responsive web application designed for mobile devices, counter QR codes, and self-ordering kiosk tablets.

## Overview
- **Port**: `3003`
- **Purpose**: Allows guests standing in line or sitting at tables to scan a QR code, rapidly assemble their food order, and generate a **3-digit Queue-Buster Token Code** (e.g. `#104`).
- **Zero-Wait Cashier Recall**: The cashier at the POS counter presses `Alt + Q` (or clicks the live waiting badge), types `104` or clicks the chip, and the entire pre-built order is loaded into the cart in **under 0.1s**, ready to collect payment and print the KOT.

## Endpoints Consumed
- `GET /api/v1/restaurant/categories?branch_id=1`
- `GET /api/v1/restaurant/menu-items?branch_id=1`
- `POST /api/v1/orders/queue-tokens` (generates persistent PostgreSQL token)
- `GET /api/v1/orders/queue-tokens/{code}` (live polling for cashier claim status)
- `POST /api/v1/orders/queue-tokens/{code}/claim` (executed when cashier loads the cart)

## Run Locally
```bash
pnpm dev:token
# or
npx pnpm --filter @ssrone/token-order-web dev
```
Accessible at: `http://localhost:3003`
