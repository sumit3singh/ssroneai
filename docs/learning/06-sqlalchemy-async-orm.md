# Lesson 06: SQLAlchemy 2.0 AsyncIO, Registry Mappers & Session Scopes
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 04: FastAPI & ASGI](file:///e:/2026/ssr_one_ai/docs/learning/04-fastapi-and-asgi.md), [Lesson 05: Pydantic V2](file:///e:/2026/ssr_one_ai/docs/learning/05-pydantic-and-validation.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**SQLAlchemy 2.0** is Python's premier Object-Relational Mapper (ORM) and SQL Toolkit. The **AsyncIO extension** (`sqlalchemy.ext.asyncio`) allows Python to talk to PostgreSQL asynchronously using native non-blocking coroutines via `asyncpg`. It translates Python classes and objects into optimized SQL queries, manages database connection pools, tracks object state changes in memory, and commits ACID transactions.

### Real-Life Analogy
Imagine a stockroom with thousands of spare parts:
* **Raw SQL**: A mechanic has to write down exact shelf numbers, aisle codes, and binary bin coordinates (`SELECT part_id, qty FROM shelf_4b WHERE aisle=12 AND bin=9`). If someone moves the shelf or renames a column, the mechanic grabs the wrong part and causes an explosion.
* **SQLAlchemy ORM**: The mechanic uses a high-tech computer terminal. They simply type `order.items.append(spark_plug)`. The system automatically knows which shelf it belongs to, verifies stock levels, creates the foreign key links, deducts inventory, and updates the invoice total without the mechanic having to write a single line of raw SQL.

In SSR One AI, SQLAlchemy is the engine that converts an order placed by a waiter into relational rows inside our `orders`, `order_items`, `kds_tickets`, and `billing_invoices` tables inside PostgreSQL.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **Zero SQL Injection Risk**: All parameters are bound safely using prepared statements. Attackers cannot inject malicious SQL into table inputs or customer names.
2. **Async Connection Pooling (Neon PgBouncer)**: Opening a new TCP connection to a PostgreSQL database takes 50–100ms. SQLAlchemy maintains a warm pool of pre-opened connections (`pool_size=15`, `max_overflow=25`). When a request arrives, it borrows a connection in 0.1ms, executes the query, and returns it to the pool.
3. **Automated Rollbacks on Error**: If a bill creation crashes halfway through (e.g. after deducting inventory but before charging the card), SQLAlchemy's session scope automatically issues an immediate `ROLLBACK`, guaranteeing that dirty, corrupt data never gets committed.
4. **Dynamic Multi-Database Routing**: For high-paying enterprise hotel chains who demand their own dedicated private database instance, our [DynamicDatabaseManager](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py#L77) dynamically switches connection pools on the fly with zero code changes.

### Alternatives Considered & Why Rejected
* **Django ORM**: Synchronous, heavily coupled to Django, and lacks the fine-grained session control required for multi-tenant SaaS.
* **Tortoise ORM**: Popular in async Python, but immature ecosystem, limited migration tooling, and smaller community.
* **Prisma (Python)**: Foreign bridge to a Node.js binary, heavy memory footprint.
* **SQLAlchemy 2.0 (Chosen)**: The undisputed industry gold standard with rock-solid reliability, full async support, and native Alembic migration integration.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: The Engine vs The Session
* **Engine** (`AsyncEngine`): The persistent factory and connection pool manager. Created **once** when the server starts. It holds the network sockets to Neon PostgreSQL.
* **Session** (`AsyncSession`): The short-lived "unit of work" created for **one single HTTP request**. It tracks all changes, queries data, commits changes, and is closed when the HTTP response is sent.

### Concept B: The 2.0 `select()` Syntax
In legacy SQLAlchemy 1.x, developers wrote `session.query(Order).filter(...)`.  
In **SQLAlchemy 2.0**, this was deprecated in favor of explicit, type-safe SQL construct functions:
```python
from sqlalchemy import select

# Modern 2.0 Syntax
stmt = select(Order).where(Order.tenant_id == tenant_id, Order.status == "in_kitchen")
result = await session.execute(stmt)
orders = result.scalars().all() # Returns list of Order objects
```

### Concept C: `scalars().all()` vs `scalars().first()`
* `result.scalars().all()`: Returns a list of all ORM entity instances matching the query.
* `result.scalars().first()`: Returns the first matching entity, or `None` if no rows match.
* `result.scalar_one_or_none()`: Returns exactly one row, returns `None` if zero rows, or **raises an error** if more than one row matches (great for finding unique records like `order_number`).

### Concept D: The `expire_on_commit=False` Rule
In synchronous SQLAlchemy, when you run `session.commit()`, SQLAlchemy immediately "expires" all in-memory attributes on your objects. If you try to read `order.id` after committing, it performs an automatic hidden database query to refresh it.  
In **AsyncIO**, this hidden query crashes your program with: `MissingGreenlet: greenlet_spawn has not been called`.  
**The Solution**: Setting `expire_on_commit=False` keeps the object's attributes cached in memory after committing, allowing you to return it directly to Pydantic without triggering crash-inducing lazy loads!

---

## 4. Syntax & Feature Breakdown

### 1. Declaring Modern 2.0 Mapped Columns
In SQLAlchemy 2.0, model columns use Python type hints with `Mapped[]` and `mapped_column()`:

```python
from datetime import datetime
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Foreign Key Relationship
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
```

### 2. Eager Loading Relationships (`selectinload`)
By default, SQLAlchemy does not load related foreign key items (like `order.items`) to save bandwidth. In async programming, you **cannot** lazy-load relationships on access. You must explicitly eager-load them using `selectinload`:

```python
from sqlalchemy.orm import selectinload

stmt = (
    select(Order)
    .where(Order.id == order_id)
    .options(selectinload(Order.items)) # Loads order and all items in 2 queries
)
result = await session.execute(stmt)
order = result.scalar_one_or_none()
```

---

## 5. How It Is Used in OUR Project (Real Code & Flow)

Let's inspect our real database engine configuration in [services/backend/src/core/database/engine.py](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py).

### 1. Enterprise Connection Pool Setup:
```python
# Lines 32-58 in services/backend/src/core/database/engine.py
def create_engine(*, url: str | None = None, testing: bool = False) -> AsyncEngine:
    """Create an async SQLAlchemy engine with connection pooling."""
    target_url = url or settings.db.async_url
    kwargs: dict[str, Any] = {
        "echo": settings.db.echo,
        "future": True,
    }

    if "sqlite" in target_url or testing:
        kwargs["poolclass"] = NullPool
    else:
        kwargs.update(
            {
                "pool_size": settings.db.pool_size,       # 15 persistent connections
                "max_overflow": settings.db.max_overflow, # 25 surge connections
                "pool_pre_ping": True,                    # Tests socket before using
                "pool_recycle": 300,                      # Recycles socket every 5 mins
                "pool_timeout": 20,                       # Waits 20s max for free socket
            }
        )

    engine_instance = create_async_engine(target_url, **kwargs)
    return engine_instance
```

#### Why `pool_pre_ping=True` and `pool_recycle=300` are Critical:
Cloud PostgreSQL providers like Neon and AWS RDS automatically close idle database connections after a few minutes of inactivity. Without `pool_pre_ping=True`, the next request arriving at 3:00 AM would try to use a dead TCP socket and crash with `asyncpg.exceptions.ConnectionDoesNotExistError`. `pool_pre_ping` detects dead sockets and transparently opens a fresh connection with zero errors!

---

### 2. The Fail-Safe Session Dependency:
```python
# Lines 113-127 in services/backend/src/core/database/engine.py
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: yields an async DB session.
    Automatically rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except BaseException:
            if session.is_active:
                await session.rollback()
            raise
        finally:
            await session.close()
```

#### How This Protects Every API Call:
1. When a request hits `@router.post("/orders")`, FastAPI calls `get_db_session()`.
2. A new `AsyncSession` is opened from the pool and injected into the endpoint as `db`.
3. If an unhandled exception or crash happens in your route handler, the `except BaseException` block intercepts it, rolls back any pending SQL modifications, and ensures no corrupt data is saved.
4. The `finally:` block returns the connection cleanly to the pool.

---

### 3. PostgreSQL Row-Level Security (RLS) Context Injection:
```python
# Lines 138-159 in services/backend/src/core/database/engine.py
async def set_rls_context(
    session: AsyncSession,
    tenant_id: str,
    user_id: str | None = None,
    is_superadmin: bool = False
) -> None:
    """Sets PostgreSQL Row-Level Security (RLS) session variables in a single network roundtrip."""
    try:
        stmts = ["set_config('app.current_tenant_id', :tenant_id, false)"]
        params: dict[str, Any] = {"tenant_id": str(tenant_id)}
        if user_id:
            stmts.append("set_config('app.current_user_id', :user_id, false)")
            params["user_id"] = str(user_id)
        if is_superadmin:
            stmts.append("set_config('app.is_superadmin', 'true', false)")
        await session.execute(
            text(f"SELECT {', '.join(stmts)}"),
            params
        )
    except Exception as e:
        logger.warning("Failed to set RLS session context variables", error=str(e))
```
This single function sets the PostgreSQL session configuration variable `app.current_tenant_id`. Once set, PostgreSQL's kernel enforces that all subsequent `SELECT`, `UPDATE`, and `DELETE` queries only see rows belonging to that specific tenant!

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: The `MissingGreenlet` Async Lazy Loading Crash
* **What happens**: You query an order, commit it, and then try to read `order.items`:
  ```python
  order = await session.get(Order, 1)
  for item in order.items: # ❌ CRASH: sqlalchemy.exc.MissingGreenlet
      print(item.product_name)
  ```
* **Why**: `order.items` was not loaded in the original query. In async mode, SQLAlchemy refuses to run a silent synchronous query.
* **Fix**: Always use `options(selectinload(Order.items))` when querying parents with relationships!

### Mistake 2: Forgetting `await session.commit()`
* **What happens**: You create an order using `session.add(new_order)`. The API returns HTTP 200 with the order ID. But when you look in PostgreSQL, the table is completely empty!
* **Why**: Calling `session.add()` only registers the object in Python memory. You **must** call `await session.commit()` to write the transaction to disk in PostgreSQL.

### Mistake 3: Reusing a Session across Concurrent Tasks (`asyncio.gather`)
* **What happens**: Running multiple queries concurrently using the same session:
  ```python
  await asyncio.gather(
      session.execute(query_1),
      session.execute(query_2), # ❌ CRASH: concurrent execution on single connection
  )
  ```
* **Why**: An `AsyncSession` is strictly **single-threaded** per connection. It cannot execute two SQL statements simultaneously on the same socket. Run them sequentially with `await`, or use separate sessions.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Keep Transactions as Short as Possible**:
   Never make slow external HTTP calls (e.g. calling Razorpay or sending an SMS) while an active database transaction is holding row locks. Fetch payment confirmation first, then open the database session to update the bill.
2. **Use `update()` with Values for High-Speed Counter Increments**:
   Instead of loading a stock item, adding 1 in Python, and saving it, use atomic database updates:
   ```python
   await session.execute(
       update(StockItem)
       .where(StockItem.id == item_id)
       .values(quantity=StockItem.quantity - 1)
   )
   ```
3. **Index Your Foreign Keys**:
   Always put an index on `tenant_id`, `branch_id`, and `order_id` in your model definitions (`index=True`) to maintain sub-5ms query times when tables grow to millions of rows.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Write a complete SQLAlchemy 2.0 async query to find all active menu items (`is_active == True`) belonging to branch ID `5`, ordered by `sort_order` ascending.

### Exercise 2 (Medium):
Write an async transaction function that safely marks an order as paid:
1. Updates `order.status = "completed"`
2. Sets `order.is_paid = True`
3. Commits the transaction
4. Refreshes and returns the updated order

### Exercise 3 (Hard):
Inspect `set_rls_context` in [services/backend/src/core/database/engine.py](file:///e:/2026/ssr_one_ai/services/backend/src/core/database/engine.py#L138). Explain why setting `is_local=False` (the third parameter in `set_config`) is critical for connection poolers like PgBouncer in transaction mode.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```python
from sqlalchemy import select

stmt = (
    select(MenuItem)
    .where(MenuItem.branch_id == 5, MenuItem.is_active == True)
    .order_by(MenuItem.sort_order.asc())
)
result = await session.execute(stmt)
items = result.scalars().all()
```

#### Solution 2:
```python
from fastapi import HTTPException

async def mark_order_paid(session: AsyncSession, order_id: int) -> Order:
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "completed"
    order.is_paid = True
    
    await session.commit()
    await session.refresh(order)
    return order
```

#### Solution 3:
In PostgreSQL:
`set_config('variable', 'value', is_local)`
- When `is_local=true`, the setting only applies to the current transaction block.
- When `is_local=false`, the setting persists across the entire session/connection.
In transaction-based connection poolers (like Neon's PgBouncer pooler), connection state can be wiped on transaction boundary reset. Setting `is_local=false` ensures that all queries executed within that session scope respect the tenant isolation boundary before the session closes.
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. Why does SSR One AI set `expire_on_commit=False` in its sessionmaker?
2. What is the difference between `AsyncEngine` and `AsyncSession`?
3. How do you eagerly load a relationship in SQLAlchemy 2.0 to prevent `MissingGreenlet` errors?
4. What does `pool_pre_ping=True` do when connecting to cloud PostgreSQL?
5. How does the `get_db_session()` dependency guarantee that database locks are rolled back if an error occurs?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a beginner why executing raw SQL string concatenation (`"SELECT * FROM users WHERE name = '" + name + "'"` ) is a critical security vulnerability, and how SQLAlchemy solves it automatically.
* *Prompt 2*: Explain what a "connection pool" is to a restaurant manager using the analogy of a fleet of delivery bikes.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```python
# ─── SQLALCHEMY 2.0 ASYNC CHEAT SHEET ─────────────────────────
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload

# 1. SELECT (with eager loading)
stmt = (
    select(Order)
    .where(Order.tenant_id == tenant_id)
    .options(selectinload(Order.items))
    .order_by(Order.created_at.desc())
)
orders = (await session.execute(stmt)).scalars().all()

# 2. INSERT
new_order = Order(order_number="ORD-101", total_amount=500.0)
session.add(new_order)
await session.commit()
await session.refresh(new_order)

# 3. ATOMIC UPDATE
await session.execute(
    update(Table)
    .where(Table.id == table_id)
    .values(status="occupied")
)
await session.commit()

# 4. DELETE
await session.execute(delete(OrderItem).where(OrderItem.id == item_id))
await session.commit()
```

---
*Next Lesson: **[Lesson 07: PostgreSQL 16, Connection Pooling (PgBouncer) & ACID Transactions](file:///e:/2026/ssr_one_ai/docs/learning/07-postgresql-and-neon.md)***
