# Customer Relationship Management (CRM) Domain Specification

> **Last Reviewed**: August 2026

This document defines the functional and technical specifications for the CRM & Loyalty module.

---

## 1. Domain Entities & Capabilities

- **Customer Master**: Centralized profile store (`first_name`, `last_name`, `email`, `phone`, `tenant_id`).
- **Loyalty Program**: Tiers (Silver, Gold, Platinum), automated point accumulation rules, and wallet top-up logic.
- **5-Part Route Layout**:
  - `crm/dashboard`: Loyalty KPIs & active campaign metrics.
  - `crm/master`: Customer Directory & Tier Management.
  - `crm/transaction`: Point Redemption & Wallet Ledger Transactions.
  - `crm/report`: Churn Analytics & Lifetime Value (LTV) Reports.
  - `crm/settings`: Loyalty Point Multiplier & Promo Rules.
