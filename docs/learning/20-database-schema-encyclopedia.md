# Lesson 20: Database Schema Encyclopedia: Tables, Relationships & Multi-Tenant Design

> **Architecture Pillar**: Canonical Relational Data Model, Table Relationships & Enterprise Multi-Tenancy  
> **Repository Path**: `services/backend/src/core/database/models.py`, `database/schema/all_table_ddl.sql`, `services/backend/src/modules/`  
> **Prerequisites**: Lessons 06 (SQLAlchemy), 07 (PostgreSQL & Neon), 08 (Alembic), 09 (Multi-Tenancy & RLS)

---

## 1. What It Is (Simple Explanation + Analogy)

The database schema of **The ssrone (SSR INFINITY)** is the single source of truth for the entire business. It models every aspect of hospitality operations:
* Who owns the restaurant chain (Tenants).
* Which physical outlet is operating (Companies & Branches).
* Who is logged into the cash drawer (Users, Roles & Permissions).
* What items are on the menu (Categories, Items, Modifiers).
* What was ordered, paid, and cooked (Orders, KOTs, Payments).
* What ingredients were consumed from the fridge (Inventory, Recipes BOM).
* Who slept in which hotel room or PG bed (Rooms, Bookings, Beds, Residents).

### The Real-Life Analogy
Think of the database schema as a **metropolitan city property registry**:
* **The Master Foundation (`BaseModel` / `TenantBaseModel`)**: Like city building codes requiring every building to have a steel foundation, fire exits, and an official street deed. Every table inherits identical primary keys, audit timestamps, and tenant isolation tags.
* **The Multi-Tenant Boundary (`tenant_id`)**: Like distinct skyscrapers in the city. The tenant ID is the biometric security elevator that prevents a resident of Skyscraper A from wandering into an apartment in Skyscraper B.
* **The Shared Citizen Registry (`customers`)**: The only shared municipal registry across all restaurants in a franchise, allowing diners to earn points in Noida and redeem them in Delhi.

---

## 2. The Core Foundation Mixins (`src/core/database/models.py`)

Every table in SSR One AI is constructed using object-oriented mixin inheritance:

```
                      ┌──────────────────────┐
                      │     Base (ORM)       │
                      └──────────┬───────────┘
                                 │
     ┌──────────────┬────────────┴─────────────┬──────────────┐
     ▼              ▼                          ▼              ▼
┌──────────┐  ┌──────────────┐           ┌───────────┐  ┌─────────────┐
│  BigInt  │  │  Timestamp   │           │   Audit   │  │ SoftDelete  │
│  Mixin   │  │    Mixin     │           │   Mixin   │  │    Mixin    │
│ (int8 ID)│  │(created/upd) │           │(user_ids) │  │(is_deleted) │
└────┬─────┘  └──────┬───────┘           └─────┬─────┘  └──────┬──────┘
     │               │                         │               │
     └───────────────┴───────────┬─────────────┴───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │          BaseModel            │  (Global Tables)
                 └───────────────┬───────────────┘
                                 │ + TenantMixin (tenant_id int8)
                 ┌───────────────┴───────────────┐
                 │       TenantBaseModel         │  (Multi-Tenant Tables)
                 └───────────────────────────────┘
```

### The 5 Standard Columns on EVERY Tenant Table:
1. `id` (`BigInteger`, Primary Key, Autoincrement): 64-bit unsigned integer (up to $9 \times 10^{18}$ rows).
2. `tenant_id` (`BigInteger`, Indexed, Not Null): Foreign key to `tenants.id`, enforced by PostgreSQL Row-Level Security (RLS).
3. `created_at` & `updated_at` (`DateTime(timezone=True)`): Managed automatically via `server_default=func.now()` and `onupdate=func.now()`.
4. `created_by` & `updated_by` (`BigInteger`, Nullable): ID of the authenticated user who initiated the record mutation.
5. `is_deleted` (`Boolean`, Default `False`): Enables non-destructive soft deletes for financial and audit compliance.

---

## 3. Module-by-Module Schema Encyclopedia

### Section A: Identity, Organization & Access Control (Auth)

```
┌──────────────┐       1:N       ┌───────────────┐       1:N       ┌──────────────┐
│   tenants    │────────────────▶│   companies   │────────────────▶│   branches   │
└──────┬───────┘                 └───────────────┘                 └──────┬───────┘
       │ 1:N                                                              │
       ▼                                                                  │
┌──────────────┐       N:M       ┌───────────────┐       N:M              │
│    users     │────────────────▶│     roles     │                        │
└──────┬───────┘                 └───────┬───────┘                        │
       │                                 │ N:M                            │
       │ N:M                             ▼                                │
       │                          ┌─────────────┐                         │
       └─────────────────────────▶│ permissions │                         │
                                  └─────────────┘                         │
       ┌──────────────────────────────────────────────────────────────────┘
       ▼
┌───────────────┐
│ user_branches │ (Maps cashiers, chefs, and managers to physical locations)
└───────────────┘
```

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `tenants` | Enterprise organization or SaaS subscriber. | `id`, `name`, `subdomain`, `tier` (`STARTER`, `PRO`, `ENTERPRISE`), `is_active` | Parent of all operational tables. |
| `companies` | Legal fiscal entity under a tenant (has its own GSTIN/PAN). | `id`, `tenant_id`, `name`, `gstin`, `currency` | Belongs to `Tenant`, has many `Branches`. |
| `branches` | Physical outlet, store, kitchen, or hotel building. | `id`, `tenant_id`, `company_id`, `name`, `code`, `address` | Belongs to `Company`, has many `DiningTables`, `Orders`. |
| `users` | Staff member, cashier, manager, superadmin. | `id`, `tenant_id`, `email`, `password_hash`, `full_name`, `phone` | Belongs to `Tenant`, has many `Roles`, `Branches`. |
| `roles` | Security profile (e.g., `CASHIER`, `HEAD_CHEF`, `BRANCH_MANAGER`). | `id`, `tenant_id`, `code`, `name`, `is_system` | Maps to `permissions` via `role_permissions`. |
| `permissions` | Atomic system capability (e.g., `pos:order:create`, `billing:discount:apply`). | `id`, `code`, `category`, `description` | Universal platform dictionary. |

---

### Section B: Restaurant Catalog & POS Layout

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `dining_tables` | Physical restaurant table or bar counter seat. | `id`, `tenant_id`, `branch_id`, `table_number`, `capacity`, `status` (`VACANT`, `OCCUPIED`, `BILLED`) | Has many `Orders`. |
| `menu_categories` | Hierarchical food/drink groupings (e.g., "Starters", "Main Course"). | `id`, `tenant_id`, `name`, `parent_id`, `display_order`, `is_active` | Self-referencing tree; has many `MenuItems`. |
| `menu_items` | Sellable dish, beverage, or retail product. | `id`, `tenant_id`, `category_id`, `name`, `base_price`, `hsn_code`, `tax_rate`, `food_type` (`VEG`, `NON_VEG`, `EGG`) | Belongs to `Category`; has many `Variants`, `Modifiers`. |
| `menu_item_variants`| Portion sizing (e.g., "Half" / "Full", "Small" / "Medium" / "Large"). | `id`, `tenant_id`, `menu_item_id`, `name`, `price_offset` | Belongs to `MenuItem`. |
| `modifier_groups` | Add-on groups (e.g., "Spice Level", "Choice of Dip", "Extra Cheese"). | `id`, `tenant_id`, `name`, `min_selection`, `max_selection` | Attached to `MenuItems`. |
| `modifiers` | Individual add-on options (e.g., "Extra Truffle Oil" +₹60). | `id`, `tenant_id`, `group_id`, `name`, `price` | Belongs to `ModifierGroup`. |

---

### Section C: Orders, Billing & Kitchen Display System (KDS)

```
┌─────────────────┐       1:N       ┌─────────────────┐
│     orders      │────────────────▶│   order_items   │
└────────┬────────┘                 └────────┬────────┘
         │ 1:N                               │ 1:N
         ├──────────────────┐                ▼
         ▼                  ▼       ┌─────────────────┐
┌─────────────────┐  ┌────────────┐ │   recipes_bom   │
│ order_payments  │  │    kots    │ └─────────────────┘
└─────────────────┘  └──────┬─────┘
                            │ 1:N
                            ▼
                     ┌────────────┐
                     │ kot_items  │
                     └────────────┘
```

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `orders` | Central sales transaction record. | `id`, `tenant_id`, `branch_id`, `order_number`, `daily_token` (`#042`), `order_type` (`DINE_IN`, `TAKEAWAY`, `DELIVERY`), `status`, `subtotal`, `tax_total`, `discount_total`, `grand_total` | Parent of `OrderItems`, `OrderPayments`, `KOTs`. |
| `order_items` | Individual line items on a customer ticket. | `id`, `tenant_id`, `order_id`, `menu_item_id`, `item_name`, `quantity`, `unit_price`, `selected_modifiers` (JSONB), `item_total` | Belongs to `Order` and `MenuItem`. |
| `order_payments` | Financial settlements (supports split payments). | `id`, `tenant_id`, `order_id`, `payment_method` (`CASH`, `UPI`, `CARD`), `amount`, `transaction_ref`, `status` | Belongs to `Order`. |
| `daily_order_sequences` | Atomic counter guaranteeing `#001` daily resets per branch. | `id`, `tenant_id`, `branch_id`, `sequence_date`, `last_seq` | Unique constraint on `(tenant_id, branch_id, sequence_date)`. |
| `kots` | Kitchen Order Ticket printed/dispatched to chefs. | `id`, `tenant_id`, `branch_id`, `order_id`, `kot_number`, `station_id`, `status` (`PENDING`, `COOKING`, `READY`) | Belongs to `Order`; has many `KOTItems`. |
| `kot_items` | Specific dishes routed to a kitchen station (e.g., Tandoor vs Grill). | `id`, `tenant_id`, `kot_id`, `order_item_id`, `item_name`, `quantity`, `station_id` | Belongs to `KOT`. |

---

### Section D: Inventory, Supply Chain & Recipe BOM

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `inventory_items` | Raw ingredients and supplies (e.g., Basmati Rice, Paneer, Packaging Boxes). | `id`, `tenant_id`, `branch_id`, `name`, `sku`, `uom` (`KG`, `LTR`, `PCS`), `current_stock`, `reorder_level`, `avg_cost` | Tracked by `StockTransactions`. |
| `recipes_bom` | Bill of Materials linking sellable menu items to raw ingredients. | `id`, `tenant_id`, `menu_item_id`, `variant_id`, `yield_quantity` | Parent of `RecipeIngredients`. |
| `recipe_ingredients`| Ingredient deduction ratio (e.g., 1 Paneer Tikka = 200g Paneer + 50g Curd). | `id`, `tenant_id`, `recipe_id`, `inventory_item_id`, `quantity`, `uom` | Auto-depletes `InventoryItems` on order commit. |
| `stock_transactions`| Immutable ledger of every stock mutation (In, Out, Waste, Audit Adjustment). | `id`, `tenant_id`, `inventory_item_id`, `quantity`, `type` (`PURCHASE`, `SALE_DEDUCTION`, `WASTE`), `reference_id` | Ledger history for accounting. |
| `vendors` | Suppliers providing grocery, beverage, or hardware items. | `id`, `tenant_id`, `name`, `phone`, `gstin`, `payment_terms` | Supplies `PurchaseOrders`. |
| `purchase_orders` | Procurement POs sent to vendors. | `id`, `tenant_id`, `vendor_id`, `po_number`, `status` (`DRAFT`, `SENT`, `RECEIVED`), `total_amount` | Has many `PurchaseOrderItems`. |

---

### Section E: Hotel & Paying Guest (PG) Accommodations

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `room_categories` | Room classification (e.g., "Deluxe AC", "Super Deluxe", "Executive Suite"). | `id`, `tenant_id`, `name`, `base_tariff`, `max_occupancy` | Has many `Rooms`. |
| `rooms` | Physical hotel room number (e.g., Room 101, Room 204). | `id`, `tenant_id`, `branch_id`, `room_number`, `category_id`, `status` (`VACANT`, `OCCUPIED`, `MAINTENANCE`, `DIRTY`) | Belongs to `RoomCategory`. |
| `bookings` | Hotel guest reservation and folio. | `id`, `tenant_id`, `branch_id`, `booking_number`, `customer_id`, `check_in_date`, `check_out_date`, `total_amount`, `status` | Has many `BookingGuests`, folio charges. |
| `beds` | Individual PG bed unit (e.g., "Room 302 - Bed A"). | `id`, `tenant_id`, `room_id`, `bed_code`, `monthly_rent`, `is_occupied` | Mapped to `Residents`. |
| `residents` | Long-term PG tenant profile. | `id`, `tenant_id`, `customer_id`, `bed_id`, `admission_date`, `security_deposit`, `is_active` | Attached to `PGRentCollections`. |
| `pg_rent_collections`| Monthly recurring PG rent bills and electricity meter readings. | `id`, `tenant_id`, `resident_id`, `month_year` (`2026-10`), `rent_due`, `electricity_units`, `total_paid`, `status` | Financial ledger for PG landlords. |

---

### Section F: CRM, Loyalty & AI Intelligence

| Table Name | Description | Key Columns | Relationships |
| :--- | :--- | :--- | :--- |
| `customers` | Guest profiles (Phone number is primary identity key). | `id`, `tenant_id`, `phone`, `name`, `email`, `loyalty_tier` (`BRONZE`, `SILVER`, `GOLD`), `total_spent` | Has many `Orders`, `LoyaltyTransactions`. |
| `loyalty_transactions`| Points earned and redeemed per order. | `id`, `tenant_id`, `customer_id`, `order_id`, `points`, `type` (`EARN`, `REDEEM`, `EXPIRE`) | Linked to `Customer` and `Order`. |
| `ai_conversations` | AI Copilot conversational threads. | `id`, `tenant_id`, `user_id`, `agent_type` (`ceo`, `kitchen`, `crm`, `finance`), `title` | Has many `AIMessages`. |
| `ai_messages` | Full prompt and response history with token counts. | `id`, `tenant_id`, `conversation_id`, `role` (`user`, `assistant`), `content`, `model_used` | Belongs to `AIConversation`. |
| `audit_logs_partitioned`| High-speed PostgreSQL range-partitioned security trail. | `id`, `tenant_id`, `user_id`, `action`, `resource_type`, `created_at` | Partitioned by `RANGE (created_at)` per month. |

---

## 4. Key Performance Indexes & Constraints

```sql
-- 1. Multi-Tenant Composite Indexes (Fast lookup scoped by tenant)
CREATE INDEX idx_orders_tenant_branch_status ON orders (tenant_id, branch_id, status);
CREATE INDEX idx_menu_items_tenant_category ON menu_items (tenant_id, category_id, is_active);

-- 2. Daily Sequence Guarantee (Atomic daily reset per branch)
ALTER TABLE daily_order_sequences 
ADD CONSTRAINT uq_tenant_branch_date_seq UNIQUE (tenant_id, branch_id, sequence_date);

-- 3. Soft-Delete Partial Indexes (Speeds up queries by ignoring deleted records)
CREATE INDEX idx_active_customers ON customers (tenant_id, phone) WHERE is_deleted = false;
CREATE INDEX idx_active_tables ON dining_tables (branch_id, status) WHERE is_deleted = false;
```

---

## 5. Common Database Mistakes & Lead Architect Solutions

### Mistake 1: Foreign Keys Without Cascading Soft Deletes
* **Problem**: Deleting a category (`is_deleted = true`) leaves 50 menu items still referencing the category. If an engineer runs an inner join without checking `is_deleted` on both tables, dishes disappear from the menu without explanation.
* **Architect Fix**: Implement repository-level soft delete cascading, or use database views that filter `WHERE is_deleted = false` by default.

### Mistake 2: Missing Composite Indexes on Tenant ID
* **Problem**: An engineer creates an index on `status` alone (`CREATE INDEX ix_orders_status ON orders (status)`).
* **Root Cause**: In a multi-tenant database with 500 restaurants, millions of orders have `status = 'COMPLETED'`. PostgreSQL's query planner is forced to scan all 500 tenants to find matching rows.
* **Architect Fix**: Every single index on a tenant-scoped table MUST have `tenant_id` as its first column:
  ```sql
  CREATE INDEX idx_orders_tenant_status ON orders (tenant_id, status);
  ```

---

## 6. Self-Test (Active Recall & Feynman Technique)

### Active Recall Questions
1. Why does `TenantBaseModel` combine `BigIntMixin`, `TenantMixin`, `AuditMixin`, and `SoftDeleteMixin` instead of defining columns manually in each model?
2. What unique constraint ensures that daily token `#001` starts fresh every morning for every restaurant branch without collisions?
3. How does the `recipes_bom` table connect the front-of-house sales world (`menu_items`) with the back-of-house inventory world (`inventory_items`)?
4. Why is `audit_logs_partitioned` split using PostgreSQL `PARTITION BY RANGE (created_at)` instead of a standard table?
5. What is the performance danger of indexing a column like `status` without including `tenant_id` in the composite index?

### Feynman Explanations
1. **Explain the Bill of Materials (BOM) to a Chef**: Explain how the computer knows to deduct 200 grams of paneer and 50 grams of butter from the cold room inventory the exact moment a cashier clicks "Paneer Butter Masala".
2. **Explain Soft Deletes to a Tax Auditor**: Explain why our software never actually runs `DELETE FROM orders` when a cashier voids a mistake, and how keeping `is_deleted = true` protects the business during government GST audits.

---

## 7. Architect's Cheat Sheet (One-Screen Reference)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║               SSR ONE AI — DATABASE SCHEMA ARCHITECT'S CHEAT SHEET               ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ 1. BASE MODEL INHERITANCE:                                                       ║
║    • BaseModel: id (int8), created_at, updated_at, created_by, is_deleted        ║
║    • TenantBaseModel: BaseModel + tenant_id (int8, indexed, RLS enforced)        ║
║                                                                                  ║
║ 2. PRIMARY MULTI-TENANT HIERARCHY:                                               ║
║    tenants (1) ──▶ companies (N) ──▶ branches (N) ──▶ orders/tables/inventory   ║
║                                                                                  ║
║ 3. HIGH-CONCURRENCY TRANSACTION TABLES:                                          ║
║    • orders: Central financial and operational record                            ║
║    • order_items: Line items with JSONB selected_modifiers                       ║
║    • daily_order_sequences: Atomic FOR UPDATE daily tokens (#001, #002...)        ║
║    • kots / kot_items: Kitchen station ticket routing                            ║
║                                                                                  ║
║ 4. INVENTORY & RECIPES (BOM):                                                    ║
║    menu_items (Sellable) ──▶ recipes_bom ──▶ recipe_ingredients ──▶ inventory    ║
║                                                                                  ║
║ 5. PERFORMANCE RULES:                                                            ║
║    • Always prefix indexes with tenant_id: (tenant_id, branch_id, ...)           ║
║    • Always use partial indexes for soft deletes: WHERE is_deleted = false       ║
║    • Use BigInteger (int8) for ALL primary and foreign keys                      ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```
