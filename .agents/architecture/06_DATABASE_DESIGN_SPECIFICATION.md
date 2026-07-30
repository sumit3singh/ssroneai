# The Baithak — Database Design Specification
**Version:** 1.0  
**Status:** Frozen  

---

## 1. Schema Conventions
All databases in The Baithak ecosystem must strictly adhere to these naming standards:
- **Table Names**: Pluralized, snake_case (e.g. `menu_items`, `customers`, `restaurant_tables`).
- **Primary Keys**: UUID columns named `id` with default value `gen_random_uuid()`.
- **Foreign Keys**: Named as `{singular_table_name}_id` (e.g. `category_id` referencing `menu_categories.id`).
- **Common Metadata Columns**: All tables must include:
  - `tenant_id` (UUID, non-nullable, index key)
  - `created_at` (Timestamp with timezone, defaults to current time)
  - `updated_at` (Timestamp with timezone, defaults to current time)

---

## 2. Core POS Schemas

```
      +-------------------+
      |      tenants      |
      +-------------------+
               │
               ▼
      +-------------------+
      |     companies     |
      +-------------------+
               │
               ▼
      +-------------------+
      |     branches      |
      +-------------------+
               │
      ┌────────┴────────┐
      ▼                 ▼
+------------+    +-----------+
| menu_items |    | customers |
+------------+    +-----------+
```

### 2.1 Table: menu_items
Represents physical dishes sold at outlets. Includes:
- `id` (UUID, PK)
- `category_id` (UUID, FK referencing `menu_categories.id`)
- `name` (VARCHAR, index match key)
- `base_price` (NUMERIC(10,2))
- `variant_groups` (JSONB) - Holds sizing prices (Small/Medium/Large).
- `addon_groups` (JSONB) - Holds custom markups.

### 2.2 Table: restaurant_tables
Represents tables inside dine-in outlets:
- `id` (UUID, PK)
- `branch_id` (UUID, FK referencing `branches.id`)
- `table_number` (VARCHAR(20))
- `capacity` (INTEGER)
- `status` (VARCHAR(30) - `free`, `occupied`, `reserved`)

---

## 3. Database Indexes Policy
- **Composite Indexes**: Every query filtering by tenant must utilize a composite index:
  `CREATE INDEX idx_{table}_tenant_branch ON {table}(tenant_id, branch_id);`
- **Fuzzy Search Index**: Full-text searching on menus must utilize a GIN index on `name` or `code`.
