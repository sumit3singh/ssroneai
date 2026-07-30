# The Baithak — POS Module Specification
**Version:** 1.0  
**Status:** Approved  

---

## 1. POS Workflow Overview
The POS Module is designed as a super-fast billing command center.

```
 [Cashier Input] ──► [AI Command Parser] ──► [Calculate Taxes & Totals] 
                                                    │
                                                    ▼
 [Websocket Update] ◄── [KDS Dispatch] ◄── [Order Committed to DB]
```

---

## 2. Integrated Database Tables
- **menu_items**: Resolves pricing, variants, and addons.
- **menu_categories**: Groups dishes for UI tabs.
- **restaurant_tables**: Tracks physical table occupancy and status.
- **orders**: Records transactional sale logs.
- **order_items**: Records individual items, quantities, and selected modifiers.
- **customers**: Tracks CRM loyalty points and history.

---

## 3. Module API Endpoints
- `GET /api/v1/restaurant/menu-items`: Fetch active branch menu.
- `GET /api/v1/crm/customers`: Lookup loyalty details.
- `POST /api/v1/orders`: Create new checkout order.

---

## 4. Key Functional Features
- **Acronym Matcher**: Converts string initials to dish names (e.g. `ptm` -> `Paneer Tikka Masala`).
- **Fuzzy Token Parser**: Tokenizes input phrases and fuzzy-matches catalog records.
- **Dynamic Suggested Tiles**: Hour-based category recommendations.
- **Loyalty Repeat Order**: Retrieves last visit order text and populates cart automatically.
