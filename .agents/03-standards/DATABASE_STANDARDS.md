# Database Engineering & Migration Standards

> **Last Reviewed**: August 2026

This document defines schema normalization, indexing, financial precision, and migration rules for PostgreSQL.

---

## 1. Primary Keys & Base Fields

1. **BigInteger IDs**: Use 64-bit auto-incrementing BigInteger IDs (`id: Mapped[int] = mapped_column(BigInteger, primary_key=True)`).
2. **Audit Mixins**: Every table must inherit standard audit columns:
   - `created_at`: `TIMESTAMP WITH TIME ZONE` (default UTC now).
   - `updated_at`: `TIMESTAMP WITH TIME ZONE`.
   - `created_by`: `BigInteger` nullable.
   - `is_deleted`: `Boolean` default `False` for soft deletion.
   - `tenant_id`: `BigInteger` non-nullable index for RLS.
   - `version`: `BigInteger` default `1` for Optimistic Concurrency Control on transactional entities.

---

## 2. Financial Precision & Anti-Floating Point Law

- **Zero `float8` / `float` for Money**: Floating-point numbers (`float8`) introduce IEEE 754 rounding errors in shift registers and tax reports.
- **Mandatory `numeric(15,2)` or `numeric(15,4)`**: All currency amounts (cash sales, prices, variances, taxes, pay-ins/pay-outs) MUST use `numeric(15,2)` or `numeric(15,4)`.

---

## 3. High-Performance Partial & Composite Indexing

- **Soft Delete Filtering**: Everyday queries select active data (`is_deleted = false`). Create partial indexes to reduce index size by 70% and accelerate reads by 10x:
  ```sql
  CREATE INDEX idx_orders_active_pos ON public.orders (tenant_id, branch_id, status, created_at DESC) WHERE is_deleted = false;
  ```

---

## 4. PostgreSQL Engine-Level Row-Level Security (RLS)

- Enable native PostgreSQL RLS on all tenant-scoped tables:
  ```sql
  ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation_policy ON public.orders AS RESTRICTIVE USING (tenant_id = current_setting('app.current_tenant_id')::bigint);
  ```

---

## 5. Subsystem Schemas: Bill of Materials (BOM) & Auto Stock Deduction

- Hospitality and Retail POS orders automatically deduct stock using `inventory_items` and `recipe_ingredients`:
  ```sql
  CREATE TABLE public.inventory_items (
      id bigserial PRIMARY KEY,
      tenant_id int8 NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      branch_id int8 NULL,
      name varchar(200) NOT NULL,
      item_code varchar(50) NOT NULL,
      unit_of_measure varchar(20) DEFAULT 'kg' NOT NULL,
      current_stock numeric(15, 3) DEFAULT 0.000 NOT NULL,
      reorder_level numeric(15, 3) DEFAULT 10.000 NOT NULL,
      cost_per_unit numeric(15, 2) DEFAULT 0.00 NOT NULL,
      is_deleted bool DEFAULT false NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL
  );

  CREATE TABLE public.recipe_ingredients (
      id bigserial PRIMARY KEY,
      tenant_id int8 NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
      menu_item_id int8 NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
      inventory_item_id int8 NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
      quantity_required numeric(15, 4) NOT NULL,
      wastage_percentage numeric(5, 2) DEFAULT 0.00 NOT NULL,
      is_deleted bool DEFAULT false NOT NULL
  );
  ```

---

## 6. Alembic Migration Policy

- Schema changes MUST be executed via Alembic migrations (`services/backend/migrations/`).
- Never execute manual DDL modifications directly on production databases without a corresponding Alembic migration script.
- Lifespan startup handlers MUST NOT execute synchronous `ALTER TABLE` DDL migration loops.

