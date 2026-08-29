# Platform Engine Architecture Standard

> **Last Reviewed**: August 2026

This document defines how core enterprise engines—Workflow, Notification, Reporting, and Audit—are constructed across **The ssrone**.

---

## 1. Engine Specifications

| Engine Name | File Path | Core Function |
| :--- | :--- | :--- |
| **Workflow Engine** | `engines/workflow/` | Manages state machines (Order status transitions, Reservation check-ins, Approval chains). |
| **Notification Engine** | `engines/notification/` | Multi-channel alert dispatch (SMS, Email, WhatsApp, Push notifications). |
| **Reporting Framework** | `engines/report/` | Aggregates SQL queries into CSV/PDF reports and BI analytics dashboards. |
| **Audit Engine** | `engines/audit/` | Captures immutable system audit logs for financial and operational compliance. |
| **Print Engine** | `engines/print/` | Formats thermal receipts and KOT slips for USB/Network ESC/POS printers. |

---

## 2. Engine Construction Principles

1. All engines MUST be stateless and tenant-aware.
2. Long-running engine tasks MUST execute asynchronously via background workers (`services/backend/src/workers/`).
