# Lesson 08: Alembic Async DDL Revisions & Zero-Downtime Schema Evolution
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 06: SQLAlchemy 2.0 AsyncIO](file:///e:/2026/ssr_one_ai/docs/learning/06-sqlalchemy-async-orm.md), [Lesson 07: PostgreSQL 16 & Neon](file:///e:/2026/ssr_one_ai/docs/learning/07-postgresql-and-neon.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**Alembic** is the official database migration tool for SQLAlchemy. It acts as a version-control system (like Git) for your relational database schema. Whenever you add a new column, create a new table, or modify an index in Python, Alembic generates a timestamped, reversible migration script containing both an `upgrade()` function (to apply the change) and a `downgrade()` function (to undo the change).

### Real-Life Analogy
Imagine the blueprinted construction history of a 50-story commercial hotel:
* **Without Alembic (Manual SQL)**: A worker decides to knock down a wall on Floor 12 and adds an extra door. Another worker replaces a water pipe on Floor 4. Nobody documents anything. When an emergency happens, the fire department's blueprints are 2 years out of date, the water main shuts off the wrong floor, and the building collapses.
* **With Alembic**: Every structural change must be submitted as a numbered, stamped architectural revision blueprint (`001_initial_floors.py`, `002_add_fire_exits.py`, `003_upgrade_elevators.py`). The city inspector can review the exact state of the building on any date, re-apply the changes to an identical building across town with 100% precision, or safely roll back an unsafe modification.

In SSR One AI, Alembic guarantees that when you add a `discount_coupon_code` column to our `orders` table, every development laptop, CI/CD pipeline, staging server, and live production Neon database updates to the exact same table structure without wiping existing customer data.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **Zero Data Loss During Schema Updates**: When you add a new feature (like loyalty points), you cannot simply run `DROP TABLE customers; CREATE TABLE customers;` because that would erase real customer account balances! Alembic runs `ALTER TABLE customers ADD COLUMN loyalty_points integer DEFAULT 0;` safely preserving all existing rows.
2. **Automated Drift Detection (`--autogenerate`)**: Alembic compares our Python SQLAlchemy models (`Base.metadata`) against the live PostgreSQL database schema, detects any missing columns, and writes the Python migration code automatically.
3. **Multi-Environment Synchronization**: Ensures that local SQLite/PostgreSQL development databases match the production Neon PostgreSQL schema down to the last constraint.
4. **Zero-Downtime Deployments**: Allows schema upgrades to run automatically during deployment before the new FastAPI web server code begins accepting HTTP requests.

### Alternatives Considered & Why Rejected
* **Manual SQL scripts in a folder**: Prone to human error, missed scripts, no automated rollback mechanism, and no tracking of which scripts have already executed on which server.
* **Django Migrations**: Tightly coupled to Django's ORM; cannot be used with FastAPI and SQLAlchemy.
* **Alembic (Chosen)**: Native companion to SQLAlchemy, supports modern async database engines, and is the undisputed standard in the Python ecosystem.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: The `alembic_version` Table
How does PostgreSQL know which migrations have already been applied?
When Alembic runs for the first time, it creates a tiny 1-row table in PostgreSQL called `alembic_version`:
```sql
SELECT * FROM alembic_version;
-- Output: version_num: 'd7b0e38a14bc'
```
When you run `alembic upgrade head`, Alembic reads `version_num`, checks your local `migrations/versions/` folder, and executes **only** the newer migration scripts that haven't run yet.

### Concept B: Revision Scripts (`upgrade()` vs `downgrade()`)
Every migration file contains two functions:
* `upgrade()`: The forward migration. Adds columns, creates tables, or builds indexes.
* `downgrade()`: The emergency reverse migration. Drops the added columns or tables if the release needs to be rolled back.

### Concept C: Revision Identifiers & DAG Lineage
Each script has a unique hash ID and points to its predecessor:
```python
revision = '4b42347c91a0'       # Current migration ID
down_revision = 'd7b0e38a14bc'  # Parent migration ID
```
This forms an unbroken linear chain from migration #1 all the way to the latest release (`head`).

---

## 4. Syntax & Feature Breakdown

### 1. `alembic.ini` (Master Configuration)
Located in [services/backend/alembic.ini](file:///e:/2026/ssr_one_ai/services/backend/alembic.ini):
* `script_location = migrations`: Path to the migrations directory.
* `file_template = %%(rev)s_%%(slug)s`: Defines file naming conventions (e.g. `1a2b3c_add_table_qr_code.py`).
* `prepend_sys_path = .`: Ensures local Python modules can be imported inside migrations.

### 2. Anatomy of an Alembic Migration File
A standard generated migration inside `services/backend/migrations/versions/`:

```python
"""add loyalty points to customer

Revision ID: 4b42347c91a0
Revises: d7b0e38a14bc
Create Date: 2026-10-23 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4b42347c91a0'
down_revision = 'd7b0e38a14bc'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add new column with safe default
    op.add_column('customers', sa.Column('loyalty_points', sa.Integer(), nullable=False, server_default='0'))
    op.create_index(op.f('ix_customers_loyalty_points'), 'customers', ['loyalty_points'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_customers_loyalty_points'), table_name='customers')
    op.drop_column('customers', 'loyalty_points')
```

---

## 5. How It Is Used in OUR Project (Real Code & Workflow)

Let's examine how our project configures Alembic to detect all 50+ domain models in [services/backend/migrations/env.py](file:///e:/2026/ssr_one_ai/services/backend/migrations/env.py):

```python
# Lines 12-45 in services/backend/migrations/env.py
from src.core.database.engine import Base
from src.modules.auth.models import (
    AuditLog, EventStore, FeatureLicense, FeatureMaster, Role, Tenant, User, UserRole, UserSession
)
from src.modules.restaurant.models import (
    MenuCategory, MenuTag, MenuItemTag, MenuItem, MenuVariantGroup, MenuVariantOption, MenuAddonGroup, MenuAddonOption
)
from src.modules.orders.models import Order, OrderItem, OrderPayment
from src.modules.hotel.models import Guest, Reservation, Room, RoomType
from src.modules.billing.models import Invoice, InvoiceItem, InvoicePayment
from src.modules.inventory.models import Product, ProductCategory, StockEntry, StockMovement
from src.shared.config import get_settings

settings_obj = get_settings()

config = context.config
# Dynamically pass our async connection string from Pydantic Settings
config.set_main_option("sqlalchemy.url", settings_obj.db.async_url)

target_metadata = Base.metadata
```

#### Why Explicit Model Imports Matter:
If you create a new model (e.g. `KitchenDisplayOrder`) in a new file, but forget to import it inside `env.py`, Alembic's `--autogenerate` will **not** know the model exists, and will mistakenly think you deleted the table! Our `env.py` explicitly imports all models across all modules so `Base.metadata` contains the complete schema.

---

### How Migrations Run Automatically in Docker Compose:
Look at line 71 in [infrastructure/docker/docker-compose.dev.yml](file:///e:/2026/ssr_one_ai/infrastructure/docker/docker-compose.dev.yml#L71):
```yaml
command: >
  sh -c "
    alembic upgrade head &&
    python scripts/seed.py &&
    uvicorn src.app.server:app --host 0.0.0.0 --port 8000 --reload
  "
```
Whenever a developer starts the application with `docker compose up`, Alembic automatically applies all pending migrations to the database **before** the Uvicorn web server starts.

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Adding a `NOT NULL` Column Without a `server_default`
* **What happens**: You add a required column to a table that already has 100,000 orders:
  ```python
  op.add_column('orders', sa.Column('payment_type', sa.String(), nullable=False))
  ```
* **PostgreSQL Error**: `ERROR: column "payment_type" of relation "orders" contains null values`. The migration crashes and aborts!
* **The Lead Developer Fix**: Always supply a `server_default` when adding a `NOT NULL` column to an existing table:
  ```python
  op.add_column('orders', sa.Column('payment_type', sa.String(), nullable=False, server_default='CASH'))
  ```

### Mistake 2: Branching/Merge Conflict in Migration Heads
* **What happens**: Developer Alice creates a migration `rev_A`. Developer Bob creates a migration `rev_B`. Both get merged into Git `main`.
* **Alembic Error**: `Multiple head revisions are present for given argument 'head'`.
* **Fix**: Merge the two heads into a single resolution revision:
  ```bash
  alembic merge -m "merge alice and bob migrations" rev_A rev_B
  ```

### Mistake 3: Table Lock Outages in Production
* **What happens**: Running heavy DDL (like altering column types) on a 10-million row table in production locks the table for 2 minutes, causing active billing transactions to time out.
* **The Rule**: For high-volume production tables, use `lock_timeout` and perform additive zero-downtime migrations (add new column, sync data asynchronously, switch reads, drop old column).

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Always Inspect Autogenerated Files**:
   `alembic revision --autogenerate` is a helpful robot, but it is not infallible. It cannot detect table renames (it will generate a `DROP TABLE` followed by a `CREATE TABLE`, destroying your data!). Always inspect the generated file before committing.
2. **Add Indexes Concurrently in Production**:
   In high-traffic production PostgreSQL, use `CONCURRENTLY` to build indexes without locking writes:
   ```python
   op.create_index('ix_orders_created', 'orders', ['created_at'], postgresql_concurrently=True)
   ```
3. **Commit Migrations to Git**:
   Migration files are code. They must be committed to Git alongside the SQLAlchemy models that triggered them.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
What CLI command creates a new autogenerated Alembic migration with the description `"add_gstin_to_tenants"`?

### Exercise 2 (Medium):
Write the `upgrade()` and `downgrade()` functions for an Alembic migration that adds an optional `preparation_notes` text column to the `order_items` table.

### Exercise 3 (Hard):
You need to rename column `phone_number` to `contact_phone` on the `customers` table in production. If you use `--autogenerate`, Alembic will drop `phone_number` (deleting all guest numbers!) and add an empty `contact_phone`. Write the exact custom `op.alter_column` call that renames the column in-place without losing any customer phone numbers.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```bash
alembic revision --autogenerate -m "add_gstin_to_tenants"
```

#### Solution 2:
```python
def upgrade() -> None:
    op.add_column('order_items', sa.Column('preparation_notes', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('order_items', 'preparation_notes')
```

#### Solution 3:
```python
def upgrade() -> None:
    op.alter_column(
        'customers',
        'phone_number',
        new_column_name='contact_phone',
        existing_type=sa.String(length=20)
    )

def downgrade() -> None:
    op.alter_column(
        'customers',
        'contact_phone',
        new_column_name='phone_number',
        existing_type=sa.String(length=20)
    )
```
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. What is the role of the `alembic_version` table inside PostgreSQL?
2. Why is adding a `NOT NULL` column without a `server_default` dangerous on existing database tables?
3. What is the difference between `alembic upgrade +1` and `alembic upgrade head`?
4. Why must all SQLAlchemy model files be imported inside `migrations/env.py`?
5. How do you roll back the most recently applied migration?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a junior developer why running `Base.metadata.drop_all()` followed by `create_all()` is acceptable in a local test suite, but completely catastrophic in a live production environment.
* *Prompt 2*: Explain how Alembic tracks migration history like a chain of Git commits using `revision` and `down_revision` hashes.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```bash
# ─── ALEMBIC MASTER COMMANDS ──────────────────────────────────
# 1. Generate new migration by diffing models against DB
alembic revision --autogenerate -m "describe_change"

# 2. Apply all pending migrations to the database
alembic upgrade head

# 3. Roll back the last single migration
alembic downgrade -1

# 4. View current database revision
alembic current

# 5. View complete migration history log
alembic history --verbose

# 6. Resolve multiple heads conflict
alembic merge -m "merge_heads" <rev1> <rev2>
```

---
*Next Lesson: **[Lesson 09: Multi-Tenant Architecture & PostgreSQL Row-Level Security (RLS)](file:///e:/2026/ssr_one_ai/docs/learning/09-multi-tenancy-and-rls.md)***
