# Complete Route Map Specifications

> **Last Reviewed**: August 2026

This document lists canonical client and backend endpoint routes for **The ssrone**.

---

## 1. Platform & Module Navigation Route Map (`apps/admin-web`)

| Route Path | Module Workspace | Active 5-Part Section |
| :--- | :--- | :--- |
| `/` | Platform Home | Module Launcher |
| `/pos` | Point of Sale | POS Dashboard |
| `/pos/master` | Point of Sale | POS Menu & Waiter Master |
| `/pos/transaction` | Point of Sale | POS KOT Billing & Orders |
| `/pos/report` | Point of Sale | POS Daily Sales & Tax Summary |
| `/pos/settings` | Point of Sale | POS Station & Printer Rules |
| `/hotel` | Hotel PMS | Room Grid Dashboard |
| `/hotel/master` | Hotel PMS | Room & Rate Plan Master |
| `/hotel/transaction` | Hotel PMS | Check-in / Check-out & Folio |
| `/hotel/report` | Hotel PMS | RevPAR & Occupancy Analytics |
| `/hotel/settings` | Hotel PMS | Housekeeping & Check-out Rules |
| `/pg-management` | PG Management | PG Dashboard KPIs |
| `/pg-management/master` | PG Management | Resident & Bed Master |
| `/pg-management/transaction` | PG Management | Rent Collection & Receipts |
| `/pg-management/report` | PG Management | Rent Roll Revenue Audit |
| `/pg-management/settings` | PG Management | Deposit & Late Fee Rules |
| `/crm` | CRM & Loyalty | Customer Loyalty Dashboard |
| `/finance` | Finance & Accounts | General Ledger & GST Tax |
| `/inventory` | Inventory | Stock Ledger & Reorder |
| `/hr` | HR & Payroll | Employee Roster & Payroll |

---

## 2. Core Backend API Routes (`services/backend`)

- `/api/v1/auth`: Login, Token Refresh, Tenant Context.
- `/api/v1/restaurant`: Categories, Menu Items, Tables, KDS Orders.
- `/api/v1/hotel`: Rooms, Reservations, Guest Folios.
- `/api/v1/pg-management`: Residents, Beds, Rent Receipts.
- `/api/v1/crm`: Customers, Wallet Balances, Loyalty Points.
- `/api/v1/inventory`: Products, Stock Entries, Purchase Orders.
