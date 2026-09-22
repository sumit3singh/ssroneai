# 📖 Lesson 3: PostgreSQL & Database Engineering

Welcome to **Lesson 3**! In this lesson, you will learn relational database design, schema normalization, asynchronous ORM querying with **SQLAlchemy 2.0**, and multi-tenant Row Level Security (RLS).

---

## 1. Database Normalization & Design

Database normalization minimizes redundancy and ensures data integrity. **The ssrone Platform** uses a normalized relational architecture:

```
[tenants] (1) ───< (N) [branches]
  │                      │
  └───< (N) [menu_categories]
               │
               └───< (N) [menu_items] (1) ───< (N) [menu_variant_groups] (1) ───< (N) [menu_variant_options]
                                    │
                                    └───< (N) [menu_addon_groups] (1) ───< (N) [menu_addon_options]
```

### Relational Tables vs JSONB Columns:
- Use **Relational Tables** (`menu_variant_options`, `menu_addon_options`) for queryable data requiring integrity constraints.
- Use **JSONB Columns** (`variant_prices: JSONB`) for flexible key-value overrides like size-wise addon prices (`{"Small": 50, "Medium": 80, "Large": 100}`).

---

## 2. SQLAlchemy 2.0 Async ORM Models

```python
from sqlalchemy import BigInteger, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from src.core.database.engine import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("tenants.id"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    base_price: Mapped[float] = mapped_column(Float, default=0.0)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships (selectin eager loading strategy)
    category: Mapped["MenuCategory"] = relationship("MenuCategory", back_populates="items")
    variant_groups_rel: Mapped[list["MenuVariantGroup"]] = relationship(
        "MenuVariantGroup",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
```

---

## 3. Asynchronous Querying & Eager Loading

When querying models with relationships in AsyncIO, you MUST use `selectinload` or `joinedload` to prevent `MissingGreenlet` errors when accessing nested attributes:

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def get_menu_catalog(db: AsyncSession, tenant_id: int):
    stmt = (
        select(MenuItem)
        .options(
            selectinload(MenuItem.category),
            selectinload(MenuItem.variant_groups_rel).selectinload(MenuVariantGroup.options),
            selectinload(MenuItem.addon_groups_rel).selectinload(MenuAddonGroup.options)
        )
        .where(
            MenuItem.tenant_id == tenant_id,
            MenuItem.is_deleted == False
        )
        .order_by(MenuItem.name.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
```

---

## 4. Multi-Tenant Row Level Security (RLS) in PostgreSQL

Row Level Security (RLS) ensures that tenants can ONLY query their own data, preventing accidental cross-tenant data leaks at the database engine layer.

```sql
-- Enable Row Level Security on table
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create Tenant Isolation Policy
CREATE POLICY tenant_isolation_policy ON menu_items
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id')::bigint);
```

```python
async def set_db_tenant_context(db: AsyncSession, tenant_id: int):
    """Set RLS context variable on PostgreSQL session."""
    await db.execute(f"SET LOCAL app.current_tenant_id = '{tenant_id}'")
```

---

## 🏋️ Lesson 3 Hands-on Exercises
1. Write a SQL schema definition for a `orders` table linked to `tenants` and `branches`.
2. Write an Async SQLAlchemy query that fetches all active menu items where `is_veg == True`.
