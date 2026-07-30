# 📖 Lesson 2: FastAPI & Enterprise Backend Architecture

Welcome to **Lesson 2**! In this lesson, you will master backend architecture using **FastAPI**, Pydantic v2 data validation schemas, JWT authentication, and dependency injection.

---

## 1. Why FastAPI?

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python based on standard Python type hints.

### Core Strengths:
- **Ultra-fast performance**: On par with NodeJS and Go (powered by Starlette and Pydantic).
- **Automated OpenAPI Documentation**: Generates interactive Swagger docs (`/docs`) automatically.
- **Robust Type Validation**: Invalid requests are rejected with exact standard error messages before reaching route handlers.

---

## 2. Pydantic v2 Schemas & Data Validation

Pydantic schemas enforce type safety at runtime for incoming request bodies and outgoing JSON responses.

```python
from pydantic import BaseModel, Field, EmailStr

class MenuItemCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=150, description="Dish title")
    base_price: float = Field(gt=0, description="Must be greater than zero")
    category_id: int
    is_veg: bool = True
    gst_percent: float = 5.0

class MenuItemResponseSchema(BaseModel):
    id: int
    name: str
    base_price: float
    category_id: int
    is_veg: bool
    gst_percent: float
    tenant_id: int

    model_config = {"from_attributes": True}  # Enable ORM serialization
```

---

## 3. Dependency Injection in FastAPI

Dependency Injection (`Depends`) allows you to reuse logic (database sessions, authentication checks, permissions) across handlers cleanly.

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

# Dependency: Provide database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Dependency: Authenticate User
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    user = await decode_user_from_jwt(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

# Route Handler consuming dependencies
router = APIRouter(prefix="/restaurant", tags=["Restaurant"])

@router.get("/menu-items")
async def list_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Route logic runs with guaranteed active DB session & authenticated user!
    return await fetch_items_for_tenant(db, current_user.tenant_id)
```

---

## 4. Multi-Tenant Middleware Architecture

In enterprise multi-tenant platforms (like **The Baithak**), middleware intercepts every request to extract tenant context, bind request logs, and configure security boundaries.

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Extract tenant slug from header or URL
        tenant_slug = request.headers.get("X-Tenant-Slug", "baithak-demo")
        request.state.tenant_slug = tenant_slug

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000

        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        return response
```

---

## 🏋️ Lesson 2 Hands-on Exercises
1. Build a FastAPI route `POST /orders` that validates an `OrderCreateSchema` with `table_number` (int) and `items` (list of item IDs).
2. Implement a custom dependency `require_superadmin` that checks if `user.is_superadmin == True` and raises HTTP 403 otherwise.
