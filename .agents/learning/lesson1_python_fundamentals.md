# 📖 Lesson 1: Python 3 Core & Asynchronous Programming

Welcome to **Lesson 1**! In this lesson, you will master Python from core data types to advanced asynchronous concurrency (`async`/`await`), decorators, and object-oriented design.

---

## 1. Fundamentals & Memory Model

Python is a dynamically typed, high-level language where **everything is an object**. Understanding how Python handles variables and memory is essential for writing bug-free, high-performance code.

### Mutability vs Immutability

| Type Category | Data Types | Behavior |
| :--- | :--- | :--- |
| **Immutable** | `int`, `float`, `str`, `tuple`, `bool` | Value cannot be modified after creation. Operations return new objects. |
| **Mutable** | `list`, `dict`, `set` | Value can be modified in-place without changing object identity (`id()`). |

```python
# Immutable Example: Strings
name = "ssrone"
# name[0] = "b"  # ❌ TypeError: 'str' object does not support item assignment
name = "b" + name[1:]  # Creates a NEW string object

# Mutable Example: Dictionaries
category = {"name": "Pizzas", "items_count": 10}
category["items_count"] = 11  # ✅ Modifies dictionary in-place
```

---

## 2. Advanced Functions & Decorators

Decorators allow you to wrap functions to extend their behavior cleanly without modifying their source code.

```python
import time
from functools import wraps

def time_it(func):
    """Decorator to measure execution latency of any function."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        print(f"⏱️ [{func.__name__}] Executed in {duration_ms:.2f}ms")
        return result
    return wrapper

@time_it
def calculate_order_tax(subtotal: float, gst_percent: float = 5.0) -> float:
    return round(subtotal * (gst_percent / 100), 2)

# Execution
tax = calculate_order_tax(450.0, 5.0)
```

---

## 3. Object-Oriented Programming (OOP) in Python

Python supports inheritance, encapsulation, polymorphism, and abstraction.

```python
class MenuItem:
    """Represents a restaurant menu item."""
    def __init__(self, name: str, base_price: float, is_veg: bool = True):
        self.name = name
        self.base_price = base_price
        self.is_veg = is_veg

    def calculate_price(self, size_multiplier: float = 1.0) -> float:
        """Calculate final price based on size multiplier."""
        return round(self.base_price * size_multiplier, 2)

    def __repr__(self) -> str:
        return f"<MenuItem name='{self.name}' price={self.base_price}>"


# Subclassing / Inheritance
class PizzaItem(MenuItem):
    def __init__(self, name: str, base_price: float, has_cheese_crust: bool = False):
        super().__init__(name, base_price, is_veg=True)
        self.has_cheese_crust = has_cheese_crust

    # Override method
    def calculate_price(self, size_multiplier: float = 1.0) -> float:
        price = super().calculate_price(size_multiplier)
        if self.has_cheese_crust:
            price += 80.0
        return price
```

---

## 4. Asynchronous Concurrency (`async` / `await`)

FastAPI and modern Python web frameworks rely heavily on **AsyncIO**. Async programming allows single-threaded servers to handle thousands of concurrent client connections without blocking the main event loop while waiting for I/O (Database queries, HTTP calls, File reads).

### Key Concepts:
- `async def`: Defines a coroutine function.
- `await`: Pauses execution of the coroutine until the awaited Task/Future completes, relinquishing control back to the Event Loop.

```python
import asyncio

async def fetch_menu_from_db(tenant_id: int) -> list[str]:
    print(f"🔍 Fetching menu for tenant {tenant_id}...")
    await asyncio.sleep(0.1)  # Simulates async database read
    return ["Paneer Pizza", "Cold Coffee", "Veg Momos"]

async def fetch_table_status(tenant_id: int) -> dict:
    print(f"🪑 Fetching tables for tenant {tenant_id}...")
    await asyncio.sleep(0.05)  # Simulates async database read
    return {"total_tables": 12, "occupied": 4}

async def load_pos_dashboard(tenant_id: int):
    # Run both database queries concurrently!
    menu, tables = await asyncio.gather(
        fetch_menu_from_db(tenant_id),
        fetch_table_status(tenant_id),
    )
    print(f"✅ Dashboard Loaded! Menu items: {len(menu)}, Occupied tables: {tables['occupied']}")

# Run the event loop
asyncio.run(load_pos_dashboard(1))
```

---

## 🏋️ Lesson 1 Hands-on Exercises
1. Create a function `calculate_discount(total_amount: float, promo_code: str) -> float` that applies 10% for `"ssrone10"` and 20% for `"SPECIAL20"`.
2. Write an `async` function `process_order_queue(orders: list[dict])` using `asyncio.gather` to process 5 orders concurrently.
