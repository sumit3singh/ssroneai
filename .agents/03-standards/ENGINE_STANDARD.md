# Platform Engine Architecture Standard

> **Last Reviewed**: September 2026  
> **Status**: Complete Inventory of All 14 Enterprise Engines

This document defines how core enterprise engines are constructed and maintained across **SSR One AI** (`services/backend/src/engines/`).

---

## 1. Complete Enterprise Engine Specifications

| Engine Name | File Path | Core Function & Responsibility |
| :--- | :--- | :--- |
| **Workflow Engine** | `engines/workflow/` | Finite state machine transitions (Order lifecycle, Room reservation, Task assignments). |
| **Notification Engine** | `engines/notification/` | Multi-channel alert dispatch (SMS, Email, WhatsApp Business API, Push notifications). |
| **Reporting Framework** | `engines/report/` | Analytical query aggregation, BI KPI calculations, CSV/PDF export generator. |
| **Audit Engine** | `engines/audit/` | Captures immutable system audit trails for financial, security, and operational compliance. |
| **Print Engine** | `engines/print/` | Thermal receipt, invoice, and kitchen KOT ticket formatting for ESC/POS USB/LAN printers. |
| **Approval Engine** | `engines/approval/` | Multi-tier approval workflows for purchase orders, refunds, expense claims, and discounts. |
| **Discount Engine** | `engines/discount/` | Rule-based promotional voucher validation, tier-based guest discounts, and happy hour rules. |
| **Form Builder Engine** | `engines/form_builder/` | Dynamic metadata-driven JSON schema validation, custom guest intake forms, and inspection lists. |
| **Licensing Engine** | `engines/licensing/` | Subscription tier verification (`Starter`, `Professional`, `Enterprise`) and feature gate enforcement. |
| **Pricing Engine** | `engines/pricing/` | Dynamic menu pricing, room rate plans, seasonal surcharges, and multi-currency conversions. |
| **Rules Engine** | `engines/rules/` | Configurable deterministic business rule evaluation (e.g. auto-cancellation, late checkout penalty). |
| **Scheduler Engine** | `engines/scheduler/` | Background periodic tasks (night audit, low-stock alerts, recurring rent invoice generation). |
| **Search Engine** | `engines/search/` | Multi-field fuzzy search, catalog indexing, guest directory search, and invoice lookup. |
| **Tax Engine** | `engines/tax/` | GST (CGST/SGST/IGST), VAT, service charge calculations, and tax slab compliance. |

---

## 2. Engine Construction Principles

1. **Stateless & Tenant-Aware**: All engines MUST be stateless and accept `tenant_id` on every execution.
2. **Asynchronous Dispatch**: Long-running engine tasks MUST execute via background workers (`services/backend/src/workers/`).
3. **Pure Logic Isolation**: Engines contain pure business calculation and orchestration logic—never raw HTTP handler concerns.

