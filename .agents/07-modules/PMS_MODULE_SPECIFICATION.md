# Property Management System (PMS & PG) Specification

> **Last Reviewed**: August 2026

This document defines the technical specification for Hotel Accommodations, Room Inventory, and PG Management.

---

## 1. Domain Entities & Capabilities

- **Room & Bed Inventory**: Dynamic room status tracking (`available`, `occupied`, `checked_out`, `maintenance`).
- **Reservation & Check-In**: Folio billing, advance deposit management, and checkout settlements.
- **PG Management**: Tenant room allocation, digital rent receipt generation, and automated late fee posting.
- **5-Part Route Layout**:
  - `hotel/dashboard` & `pg-management/dashboard`: Room Grid & Occupancy Metrics.
  - `hotel/master` & `pg-management/master`: Room/Bed & Rate Plan Master.
  - `hotel/transaction` & `pg-management/transaction`: Check-in/out & Rent Collection Receipts.
  - `hotel/report` & `pg-management/report`: RevPAR, ADR & Rent Roll Audit Reports.
  - `hotel/settings` & `pg-management/settings`: Housekeeping & Deposit Rules.
