# Routing & SPA Navigation TODO Tracker

> **Last Reviewed**: September 2026

This document tracks client-side SPA navigation completion across all applications in the SSR One AI monorepo.

---

## 1. Web Application SPA Routing Verification Matrix

| App / Module | App Directory | Base / Module Routes | Navigation & View Modes | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Enterprise ERP Web** | `apps/admin-web` | `/pos`, `/hotel`, `/pg-management`, `/crm`, `/hr`, `/inventory`, `/finance` | 5-Part Navigation (`Dashboard → Master → Transaction → Report → Settings`) | 🟢 Complete |
| **Platform Admin** | `apps/platform-admin` | `/`, `/tenants`, `/outlets`, `/subscriptions`, `/licenses`, `/audit-logs` | Dynamic tab switching, modal provisioning, cluster health status overlay | 🟢 Complete |
| **Kitchen Display System** | `apps/kds-web` | `/`, `/kds` | Order status queues (`Pending`, `Preparing`, `Ready`, `Delivered`), timer alerts, KOT printing | 🟢 Complete |
| **Staff Mobile Web** | `apps/staff-web` | `/`, `/housekeeping`, `/room-service`, `/kot-entry`, `/attendance` | Quick-action mobile grid, status toggles, task checklists | 🟢 Complete |
| **Customer Food Web** | `apps/customer-food-web` | `/`, `/menu`, `/cart`, `/checkout`, `/order-status` | Dynamic menu filter, item customization modal, live order progress | 🟢 Complete |
| **Customer Stay Web** | `apps/customer-stay-web` | `/`, `/rooms`, `/booking`, `/my-stay`, `/service-requests` | Date picker, room type filter, folio summary, guest check-in | 🟢 Complete |
| **Marketing Site** | `apps/marketing-web` | `/`, `/solutions`, `/pricing`, `/contact` | Hero landing, feature showcase, contact form, tier comparison | 🟢 Complete |

