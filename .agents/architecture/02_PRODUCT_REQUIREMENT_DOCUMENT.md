# The Baithak — Product Requirement Document (PRD)
**Version:** 1.0  
**Status:** Approved  

---

## 1. Product Goals
The Baithak serves as the single source of truth for hospitality operators. The target goals of this product are:
- **Zero Latency POS**: Billing operations must resolve in less than 500ms. Cashiers must be able to complete transactions using keyboard-only shortcuts without touching a mouse.
- **Dynamic Adaptability**: Menus, suggestions, offers, and KDS queues must adapt dynamically to time of day and customer profiles.
- **Offline Resilience**: The system must run offline in local-storage mock mode if network connectivity drops, and sync orders automatically once back online.

---

## 2. Core User Personas

1. **Cashier / Billing Agent**: Needs high-speed billing, quick search aliases, instant item entry, and clear totals.
2. **Kitchen Operator / Chef**: Needs a clean, real-time Kitchen Display System (KDS) showing orders divided by counter (Pizza Counter, Chinese Counter, Beverages, etc.).
3. **Franchise Owner / Manager**: Needs real-time multi-outlet sales tracking, inventory warnings, and customer loyalty analytics.

---

## 3. Product Features & Priority Matrix

| Feature ID | Feature Name | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FEAT-001** | Smart Command POS | Rebuild layout to 20% left, 50% center, 30% right panel with Fast AI Command Bar. | P0 |
| **FEAT-002** | Customer Intelligence | Phone search loader with tier visualization, loyalty points tracking, and repeat orders. | P0 |
| **FEAT-003** | KDS Routing | Automated item dispatching to specific display screens based on category. | P1 |
| **FEAT-004** | AI Upsell Combo Engine | Real-time cross-sell prompt in cart (e.g. suggesting drink when pizza is selected). | P1 |
| **FEAT-005** | Multi-Outlet Inventory | Branch level stock deduction, recipe mapping, and purchase ordering. | P2 |

---

## 4. Non-Negotiable System Exclusions
- No customer data caching in unencrypted browser sessions.
- No hardcoded menu items, pricing rules, or tax brackets in the codebase.
- Theme switching must seamlessly recalculate all panel styles without requiring a page reload.
