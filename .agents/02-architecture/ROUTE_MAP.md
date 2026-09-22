# Complete Route Map Specifications

> **Last Reviewed**: September 2026

This document lists canonical client and backend endpoint routes across all applications in **SSR One AI**.

---

## 1. Multi-App Client SPA Route Map

| App Directory | Route Path | Purpose & View Mode |
| :--- | :--- | :--- |
| `apps/admin-web` | `/` | Main Module Launcher Dashboard (11 Business Workspace Modules) |
| `apps/admin-web` | `/pos` | POS Billing, Order Taking, Table Management |
| `apps/admin-web` | `/hotel` | Hotel Room Grid, Booking, Check-in / Out, Folios |
| `apps/admin-web` | `/pg-management` | Bed Allocation, Rent Collection, Deposit Audit |
| `apps/admin-web` | `/crm` | Guest Loyalty, CLV, Campaign Management |
| `apps/admin-web` | `/hr` | Staff Roster, Attendance, Salary Slip Generator |
| `apps/admin-web` | `/inventory` | Stock Movement Ledger, Reorder Alerts, Purchase Orders |
| `apps/admin-web` | `/finance` | Double-Entry Ledger, P&L, GST Tax Returns |
| `apps/admin-web` | `/customization` | Website & App Customization Studio (Branding, Content, Toggles) |
| `apps/admin-web` | `/customization/domains` | Self-Service Custom Domains & DNS TXT Verification |
| `apps/admin-web` | `/forms/builder` | Dynamic Form Builder & Submissions Manager |
| `apps/admin-web` | `/ai-copilot` | AI Copilot Assistant & Operational RAG Insights |
| `apps/admin-web` | `/settings` | Enterprise Tenant Settings, Outlet Context & Audits |
| `apps/platform-admin` | `/` | Superadmin Tenant Provisioning, Cluster Status (100% OK) |
| `apps/platform-admin` | `/outlets` | Multi-Outlet Branch Management & Licensing Keys |
| `apps/platform-admin` | `/#leads` | Superadmin Sales Leads & Demo Follow-Up Console |
| `apps/kds-web` | `/` | Cook KDS (Station View), Batch Prep, EXPO Pass, Packing, SLA Manager |
| `apps/token-order-web` | `/` | Mobile Fast-Order & Queue-Buster 3-Digit Token Generation (`#104`) |
| `apps/staff-web` | `/` | Staff Mobile Operations (Housekeeping, Room Service, KOT) |
| `apps/customer-food-web` | `/` | QR Digital Food Menu, Cart & Table Checkout (Themed via SSOT) |
| `apps/customer-stay-web` | `/` | Guest Room Booking, Folio Balance & Amenities |
| `apps/marketing-web` | `/` | Enterprise Landing Page, Motion-Path Scrollytelling, Sales Lead Forms |

---

## 2. Core Backend API Routes (`services/backend`)

- `/api/v1/orders/kds/live`: Live Kitchen KOT Queue (`GET`), Station Task Status (`PATCH`), Analytics (`GET`).
- `/api/v1/orders/queue-tokens`: Create Queue Token (`POST`), Query Token Status (`GET`), Cashier Recall/Claim (`POST /{code}/claim`).
- `/api/v1/marketing/leads`: Public Lead Submission (`POST`), Admin Lead Listing (`GET`), & Status Follow-up (`PATCH`).
- `/api/v1/tenant-config`: Public runtime config resolution (`GET /public`), draft updates (`PUT /draft`), 1-click publishing (`POST /publish`).
- `/api/v1/custom-domains`: Domain registration (`POST /`), listing (`GET /`), deletion (`DELETE /{id}`), DNS TXT token verification (`POST /{id}/verify`), reverse-proxy host resolution (`GET /resolve`).
- `/api/v1/auth`: Authentication, JWT Tokens, Dynamic Workspace Context, License entitlement.
- `/api/v1/restaurant`: Menu Categories, Item Masters, Tables, KDS WebSocket stream.
- `/api/v1/orders`: Order Creation, KOT Generation, Split Billing, Payment Processing.
- `/api/v1/hotel`: Room Inventory, Reservations, Guest Check-in/Out, Night Audit.
- `/api/v1/pg_management`: Residents, Bed Masters, Monthly Rent Receipts.
- `/api/v1/crm`: Customer Profiles, Wallet Transactions, Loyalty Points.
- `/api/v1/inventory`: Products, Stock Movement Ledger, Purchase Orders.
- `/api/v1/finance`: Chart of Accounts, Journal Vouchers, GST Invoices.
- `/api/v1/hrms`: Employee Master, Shift Roster, Payroll Generation.
- `/api/v1/forms`: Dynamic schema builder, form submission endpoints.
- `/api/v1/ai-assistant`: AI Copilot natural language queries, RAG context retrieval.
- `/api/v1/settings`: Company profiles, branch locations, and system configuration.

