# Lesson 05: Pydantic V2 Schemas, Settings & Strict Serialization
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 02: Strict TypeScript](file:///e:/2026/ssr_one_ai/docs/learning/02-typescript-foundations.md), [Lesson 04: FastAPI & ASGI](file:///e:/2026/ssr_one_ai/docs/learning/04-fastapi-and-asgi.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**Pydantic V2** is Python's most widely used data validation, parsing, and serialization library. Written with a high-performance **Rust core** (`pydantic-core`), it inspects incoming raw HTTP JSON payloads or environment variables, coerces types, enforces business validation constraints (e.g. price > 0, email is valid), and serializes complex database models into JSON responses.

### Real-Life Analogy
Imagine the airport baggage scanner and passport control checkpoint:
* **Without Pydantic (Plain Python Dicts)**: A passenger hands a scribbled scrap of paper with no photo, carrying a 200kg suitcase with no tags. The airline agent blindly trusts it. Halfway across the ocean, the plane runs out of fuel and crashes.
* **With Pydantic**: Every passenger must present a standardized biometric passport. The electronic scanner verifies their age, checks their nationality, weighs their luggage down to the exact gram, and rejects prohibited items at the gate. If anything is wrong, the gate door stays locked and an instant error slip prints out: *"Luggage exceeds 20kg limit; Passport expired"*.

In SSR One AI, Pydantic is our unbreachable security gate. No malformed JSON, negative price, or malicious payload can ever reach our database because Pydantic intercepts and validates it in microseconds.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **Frontend-to-Backend Naming Bridges**: Frontend JavaScript often sends camelCase (`sellingPrice`, `isDefault`), while Python and PostgreSQL use snake_case (`selling_price`, `is_default`). Pydantic automatically translates and standardizes these fields before our code touches them.
2. **Type Coercion & Safety**: If a mobile app sends `"selling_price": "250.00"` as a string, Pydantic safely converts it to a float/Decimal. If someone sends `"selling_price": "free"`, Pydantic rejects it with an HTTP 422 Unprocessable Entity error.
3. **ORM to JSON Bridge (`from_attributes = True`)**: SQLAlchemy database objects cannot be directly converted to JSON by Python. Pydantic reads SQLAlchemy attributes directly and turns them into clean JSON response payloads.
4. **Environment Configuration (`pydantic-settings`)**: Our `.env` files and cloud database URLs are parsed, validated, and computed into async DSNs on boot.

### Alternatives Considered & Why Rejected
* **Manual `if not isinstance(...)` checks**: Verbose, fragile, takes thousands of lines of boilerplate, and is easy to miss on one endpoint.
* **Marshmallow / Cerberus**: Pure Python libraries that are 5x to 20x slower than Pydantic V2.
* **Pydantic V2 (Chosen)**: Powered by Rust, executes validations at near C-speed, and integrates natively with FastAPI and OpenAPI.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: Parsing & Coercion vs Validation
* **Parsing/Coercion**: Pydantic does not just check types; it *coerces* them when safe. If a field is `age: int` and the input is `"25"`, Pydantic converts it to the integer `25`.
* **Validation**: Enforcing constraints: `Field(ge=0, le=100)` guarantees the integer is between 0 and 100.

### Concept B: Request Schema vs Response Schema
In an enterprise REST API, the data sent to create an entity is almost never the same as the data returned:
* **Create Schema (`MenuVariantOptionCreate`)**: Does **not** have an `id` or `created_at` (because the database hasn't generated them yet).
* **Response Schema (`MenuVariantOptionResponse`)**: **Must** have `id`, `created_at`, `updated_at`, and `model_config = {"from_attributes": True}`.

### Concept C: Validators (`mode="before"` vs `mode="after"`)
* `@model_validator(mode="before")`: Runs on the **raw incoming dictionary** *before* Pydantic parses types. Perfect for intercepting camelCase fields from JavaScript or providing fallbacks.
* `@field_validator("field_name")`: Runs on a single field *after* standard type coercion. Perfect for checking business rules (e.g. GST number format).

### Concept D: Computed Fields (`@computed_field`)
Properties dynamically generated on the fly that get included in the serialized output:
```python
@computed_field
@property
def full_name(self) -> str:
    return f"{self.first_name} {self.last_name}"
```

---

## 4. Syntax & Feature Breakdown

### 1. `Field()` Constraints
Pydantic provides rich numeric and string constraints:
```python
from pydantic import BaseModel, Field

class OrderItemInput(BaseModel):
    product_name: str = Field(min_length=1, max_length=100, description="Name of dish")
    quantity: int = Field(gt=0, description="Quantity must be at least 1")
    unit_price: float = Field(ge=0.0, description="Price cannot be negative")
    discount_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
```
* `gt=0`: Greater than 0.
* `ge=0.0`: Greater than or equal to 0.0.
* `le=100.0`: Less than or equal to 100.0.

### 2. Pydantic V2 `model_config` vs V1 `Config`
In Pydantic V1, developers wrote `class Config: orm_mode = True`.  
In **Pydantic V2**, this was upgraded to a clean dictionary:
```python
class DishResponse(BaseModel):
    id: int
    name: str
    price: float

    model_config = {"from_attributes": True} # Replaces orm_mode = True
```

---

## 5. How It Is Used in OUR Project (Real Code & Request Flow)

### 1. Application Settings: [services/backend/src/shared/config.py](file:///e:/2026/ssr_one_ai/services/backend/src/shared/config.py)
Notice how SSR One AI loads its database connection configuration:

```python
# Lines 21-58 in services/backend/src/shared/config.py
class DatabaseSettings(BaseSettings):
    url: str | None = Field(default=None, alias="DATABASE_URL")
    provider: str = Field(default="postgresql", alias="DB_PROVIDER")
    host: str = Field(default="localhost", alias="DB_HOST")
    port: int = Field(default=5432, alias="DB_PORT")
    name: str = Field(default="neondb", alias="DB_NAME")
    user: str = Field(default="neondb_owner", alias="DB_USER")
    password: str = Field(default="", alias="DB_PASSWORD")
    pool_size: int = Field(default=15, alias="DB_POOL_SIZE")
    max_overflow: int = Field(default=25, alias="DB_MAX_OVERFLOW")
    echo: bool = Field(default=False, alias="DB_ECHO")

    @computed_field
    @property
    def async_url(self) -> str:
        """Converts standard PostgreSQL URLs into asyncpg-compatible DSNs."""
        if self.url:
            raw = self.url.strip()
            if raw.startswith("postgres://"):
                raw = "postgresql+asyncpg://" + raw[len("postgres://"):]
            elif raw.startswith("postgresql://"):
                raw = "postgresql+asyncpg://" + raw[len("postgresql://"):]
            # asyncpg expects 'ssl' parameter instead of 'sslmode'
            raw = raw.replace("sslmode=", "ssl=")
            return raw
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"
```

#### Why This Is Brilliant Architecture:
* When cloud providers like Neon, Render, or Railway supply `DATABASE_URL`, they provide synchronous prefixes like `postgres://` or `postgresql://`.
* Python's `asyncpg` driver **requires** `postgresql+asyncpg://`.
* Instead of crashing, Pydantic's `@computed_field` dynamically transforms the connection string and normalizes `sslmode=require` into `ssl=require` automatically on startup!

---

### 2. Real Business Schemas: [services/backend/src/modules/restaurant/schemas.py](file:///e:/2026/ssr_one_ai/services/backend/src/modules/restaurant/schemas.py)

Let's examine how restaurant menu variant options are validated:

```python
# Lines 12-48 in services/backend/src/modules/restaurant/schemas.py
class MenuVariantOptionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    selling_price: float = 0.0
    price: float = 0.0
    is_default: bool = False
    is_available: bool = True
    sort_order: int = 1

    @model_validator(mode="before")
    @classmethod
    def fallback_selling_price(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Intercept camelCase and alternative field names from frontend
            sp = data.get("selling_price", data.get("sellingPrice"))
            p = data.get("price")
            pa = data.get("price_adjustment", data.get("priceAdjustment"))
            r = data.get("rate")
            
            resolved = 0.0
            if sp is not None and float(sp) != 0.0:
                resolved = float(sp)
            elif p is not None and float(p) != 0.0:
                resolved = float(p)
            elif pa is not None and float(pa) != 0.0:
                resolved = float(pa)
            elif r is not None and float(r) != 0.0:
                resolved = float(r)
            
            data["selling_price"] = resolved
            data["price"] = resolved
            if "isDefault" in data and "is_default" not in data:
                data["is_default"] = data["isDefault"]
            if "isAvailable" in data and "is_available" not in data:
                data["is_available"] = data["isAvailable"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data
```

#### What This Achieves:
If a mobile app developer sends:
```json
{
  "name": "Medium 10-inch",
  "sellingPrice": 350.0,
  "isDefault": true
}
```
Pydantic's `mode="before"` validator intercepts it, normalizes `sellingPrice` to `selling_price`, and converts `isDefault` to `is_default`. The rest of your Python code never has to worry about casing mismatches!

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Mutable Default Arguments
* **What happens**: Writing:
  ```python
  class Order(BaseModel):
      items: list[str] = [] # ❌ DANGEROUS!
  ```
  In Python, mutable default arguments are shared across all instances.
* **Fix**: In Pydantic, use `Field(default_factory=list)`:
  ```python
  class Order(BaseModel):
      items: list[str] = Field(default_factory=list)
  ```

### Mistake 2: Missing `from_attributes = True` on Responses
* **What happens**: An endpoint queries a SQLAlchemy model and returns it:
  ```python
  @router.get("/dish/{id}", response_model=DishResponse)
  async def get_dish(id: int, db: AsyncSession = Depends(get_db)):
      return await db.get(MenuItem, id)
  ```
  FastAPI crashes with: `PydanticSerializationError: Input should be a valid dictionary or instance of DishResponse`.
* **Fix**: You must tell Pydantic that the input is a database ORM object by adding `model_config = {"from_attributes": True}` to `DishResponse`.

### Mistake 3: Pydantic V1 Syntax in Pydantic V2
* **What happens**: Using `.dict()` or `.json()`.
* **Fix**: In Pydantic V2:
  - Use `.model_dump()` instead of `.dict()`.
  - Use `.model_dump_json()` instead of `.json()`.
  - Use `model_validate(obj)` instead of `from_orm(obj)`.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Use `Decimal` for Financial Calculations**:
   In high-volume POS systems, never use `float` for currencies due to binary floating-point rounding errors (`0.1 + 0.2 = 0.30000000000000004`). Always use `from decimal import Decimal` in financial models.
2. **Exclude Unset Fields on PATCH**:
   When updating partial entities (like editing a table name without touching its capacity), use:
   ```python
   update_data = payload.model_dump(exclude_unset=True)
   ```
   This ensures only fields the user explicitly sent in the HTTP request get updated in PostgreSQL.
3. **Pre-compile Complex Regex Validators**:
   If validating phone numbers or GSTINs, compile regexes outside the validator to avoid re-compiling the expression on every HTTP request.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Create a Pydantic schema called `CustomerCreate` with:
- `name`: string between 2 and 50 characters
- `phone`: string of exactly 10 digits
- `email`: optional valid email address

### Exercise 2 (Medium):
Write a Pydantic model validator that ensures `discount_amount` is never greater than `subtotal_amount` in an order:
```python
class BillCalculation(BaseModel):
    subtotal_amount: float
    discount_amount: float
```

### Exercise 3 (Hard):
Inspect [services/backend/src/modules/restaurant/schemas.py](file:///e:/2026/ssr_one_ai/services/backend/src/modules/restaurant/schemas.py#L50). Write a complete `MenuItemResponse` Pydantic model that:
1. Validates fields: `id`, `name`, `selling_price`, `is_veg`, `category_id`.
2. Includes a list of nested `MenuVariantOptionResponse` objects.
3. Successfully serializes directly from a SQLAlchemy `MenuItem` ORM instance.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```python
from pydantic import BaseModel, Field, EmailStr

class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    phone: str = Field(pattern=r"^\d{10}$", description="10-digit mobile number")
    email: EmailStr | None = None
```

#### Solution 2:
```python
from pydantic import BaseModel, model_validator

class BillCalculation(BaseModel):
    subtotal_amount: float
    discount_amount: float

    @model_validator(mode="after")
    def verify_discount(self) -> "BillCalculation":
        if self.discount_amount > self.subtotal_amount:
            raise ValueError("Discount cannot exceed the subtotal amount")
        return self
```

#### Solution 3:
```python
class MenuItemResponse(BaseModel):
    id: int
    name: str
    selling_price: float
    is_veg: bool = True
    category_id: int
    variants: list[MenuVariantOptionResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
```
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. Why is Pydantic V2 significantly faster than Pydantic V1?
2. What is the difference between `@model_validator(mode="before")` and `@model_validator(mode="after")`?
3. What configuration line enables a Pydantic model to read data directly from a SQLAlchemy ORM object?
4. What method replaces `.dict()` in Pydantic V2?
5. Why should financial calculations in POS billing use `Decimal` rather than `float`?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a beginner why sending camelCase JSON (`{"dishName": "Pizza"}`) from a React frontend works seamlessly with our snake_case Python backend (`dish_name: str`).
* *Prompt 2*: Explain what happens when a user attempts to send a negative price (`"selling_price": -50.0`) to our API endpoint, and how Pydantic protects the database without any manual `if` statements.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```python
# ─── PYDANTIC V2 CHEAT SHEET ──────────────────────────────────
from pydantic import BaseModel, Field, EmailStr, model_validator

class DishSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0.0)
    is_active: bool = True
    tags: list[str] = Field(default_factory=list)

    # Enable ORM attribute reading (SQLAlchemy)
    model_config = {"from_attributes": True}

    # Intercept raw dictionary before parsing
    @model_validator(mode="before")
    @classmethod
    def normalize_fields(cls, data: dict) -> dict:
        if "sellingPrice" in data:
            data["price"] = data.pop("sellingPrice")
        return data

# ─── SERIALIZATION METHODS ────────────────────────────────────
dish = DishSchema(name="Paneer Tikka", price=280.0)
data_dict = dish.model_dump()                   # Dictionary
data_json = dish.model_dump_json()              # JSON String
partial   = dish.model_dump(exclude_unset=True) # Only explicitly passed fields
```

---
*Next Lesson: **[Lesson 06: SQLAlchemy 2.0 AsyncIO, Registry Mappers & Session Scopes](file:///e:/2026/ssr_one_ai/docs/learning/06-sqlalchemy-async-orm.md)***
