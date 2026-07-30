# BAITHAK ERP - POS Business Domain Architecture (10/10 Standard)

## Overview
This document specifies the 21-layer enterprise architecture of the Point of Sale (POS) domain in BAITHAK.

## Domain Layers
1. `dashboard/`: Live operational tickets, KPI cards, and active table occupancy.
2. `master/`: Configuration data (Categories, Dishes, Portion Variants, Dining Tables, Waiters, Payment Modes, KDS Stations).
3. `transaction/`: Day-to-day operations (POS Counter Terminal, KDS Stream, Shift Register, Table Operations).
4. `report/`: Dynamic analytics computed from PostgreSQL transactional records (Daily Sales, Item Sales, Cashier Settlement, GST Summary).
5. `settings/`: Thermal printer IP mapping, KOT auto-print rules, receipt branding.
6. `api/`: Isolated REST API clients (`categories.api.ts`, `menuItems.api.ts`, `tables.api.ts`, `waiters.api.ts`, `orders.api.ts`).
7. `services/`: Business calculations (`billing.service.ts`, `printer.service.ts`).
8. `store/`: State management stores (`cart.store.ts`).
9. `hooks/`: React Query integration (`useMenu.ts`, `useTables.ts`, `useWaiters.ts`).
10. `validators/`: Business schema validators (`menuItem.schema.ts`, `table.schema.ts`).
11. `utils/`: Calculation & formatting helpers (`price.ts`, `gst.ts`, `currency.ts`).
12. `permissions/`: Fine-grained RBAC permissions (`billing.permission.ts`, `master.permission.ts`, `reports.permission.ts`).
