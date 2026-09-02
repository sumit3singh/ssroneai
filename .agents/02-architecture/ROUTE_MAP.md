# Complete Route Map Specifications

> **Last Reviewed**: September 2026

This document lists canonical client and backend endpoint routes across all applications in **SSR One AI**.

---

## 1. Multi-App Client SPA Route Map

| App Directory | Route Path | Purpose & View Mode |
| :--- | :--- | :--- |
| `apps/admin-web` | `/` | Main Module Launcher Dashboard |
| `apps/admin-web` | `/pos` | POS Billing, Order Taking, Table Management |
| `apps/admin-web` | `/hotel` | Hotel Room Grid, Booking, Check-in / Out, Folios |
| `apps/admin-web` | `/pg-management` | Bed Allocation, Rent Collection, Deposit Audit |
| `apps/admin-web` | `/crm` | Guest Loyalty, CLV, Campaign Management |
| `apps/admin-web` | `/finance` | Double-Entry Ledger, P&L, GST Tax Returns |
| `apps/admin-web` | `/inventory` | Stock Movement Ledger, Reorder Alerts, Purchase Orders |
| `apps/admin-web` | `/hr` | Staff Roster, Attendance, Salary Slip Generator |
| `apps/platform-admin` | `/` | Superadmin Tenant Provisioning, Cluster Status (100% OK) |
| `apps/platform-admin` | `/outlets` | Multi-Outlet Branch Management & Licensing Keys |
| `apps/kds-web` | `/` | Kitchen Display System Live Queue & Timer Badges |
| `apps/staff-web` | `/` | Staff Mobile Operations (Housekeeping, Room Service, KOT) |
| `apps/customer-food-web` | `/` | QR Digital Food Menu, Cart & Table Checkout |
| `apps/customer-stay-web` | `/` | Guest Room Booking, Folio Balance & Amenities |
| `apps/marketing-web` | `/` | Enterprise Landing Page, Pricing Tier Matrix & Demos |

---

## 2. Core Backend API Routes (`services/backend`)

- `/api/v1/auth`: Authentication, JWT Tokens, Tenant Context, License entitlement.
- `/api/v1/restaurant`: Menu Categories, Item Masters, Tables, KDS WebSocket stream.
- `/api/v1/orders`: Order Creation, KOT Generation, Split Billing, Payment Processing.
- `/api/v1/hotel`: Room Inventory, Reservations, Guest Check-in/Out, Night Audit.
- `/api/v1/pg_management`: Residents, Bed Masters, Monthly Rent Receipts.
- `/api/v1/crm`: Customer Profiles, Wallet Transactions, Loyalty Points.
- `/api/v1/inventory`: Products, Stock Movement Ledger, Purchase Orders.
- `/api/v1/finance`: Chart of Accounts, Journal Vouchers, GST Invoices.
- `/api/v1/hrms`: Employee Master, Shift Roster, Payroll Generation.
