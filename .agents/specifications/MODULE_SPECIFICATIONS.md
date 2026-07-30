# The Baithak — Core Module Technical Specifications

## 1. POS & Dining Module Specification
- **Workflow**: Cashier Input ──► AI Command Parser ──► Tax & Totals ──► Order Committed to DB ──► KDS Dispatch.
- **Database Tables**: `menu_items`, `menu_categories`, `restaurant_tables`, `orders`, `order_items`, `customers`.
- **API Endpoints**: `GET /api/v1/restaurant/menu-items`, `GET /api/v1/crm/customers`, `POST /api/v1/orders`.

---

## 2. PMS & Hotel Accommodation Specification
- **Workflow**: Check-in Request ──► Guest KYC Verification ──► Room Allocation ──► Folio Ledger ──► Check-out.
- **Database Tables**: `hotel_rooms`, `room_categories`, `reservations`, `guest_profiles`, `folios`, `folio_charges`.
- **API Endpoints**: `GET /api/v1/hotel/rooms`, `POST /api/v1/hotel/reservations`, `PATCH /api/v1/hotel/rooms/:id/status`.

---

## 3. CRM & Guest Loyalty Specification
- **Workflow**: Guest Registration ──► Visit History ──► Spend Threshold ──► Loyalty Points Credit ──► Tier Upgrade.
- **Database Tables**: `customers`, `customer_tiers`, `loyalty_transactions`, `wallet_ledgers`.
- **API Endpoints**: `GET /api/v1/crm/customers`, `POST /api/v1/crm/customers`, `POST /api/v1/crm/loyalty/points`.
