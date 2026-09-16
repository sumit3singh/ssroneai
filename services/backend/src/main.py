"""
SSR One AI – FastAPI Backend ASGI Entry Point
Single source of truth REST API Gateway with multi-tenant PostgreSQL Row-Level Security (RLS).
Trigger Reload: 2026-08-25 21:55 - Fast lifespan without table DDL locks
"""
import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

# Ensure services/backend root directory is on sys.path for src.* imports
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from src.shared.logger import get_logger
logger = get_logger(__name__)

# Eagerly initialize all SQLAlchemy ORM models and configure Base.registry
from src.core.database.init_models import init_sqlalchemy_models
init_sqlalchemy_models()

# ─── Health Router ───────────────────────────────────────────
from src.api.health.router import router as health_router

# ─── Business & Microservice Routers ─────────────────────────
from src.api.v1.business_crud import router as business_crud_router
from src.modules.auth.router import router as auth_router
from src.modules.auth.licensing_router import router as licensing_router
from src.modules.restaurant.router import router as restaurant_router
from src.modules.hotel.router import router as hotel_router
from src.modules.pg_management.router import router as pg_router, alias_router as pg_alias_router
from src.modules.orders.router import router as orders_router
from src.modules.inventory.router import router as inventory_router
from src.modules.hrms.router import router as hr_router
from src.modules.finance.router import router as finance_router
from src.modules.dashboard.router import router as dashboard_router
from src.modules.crm.router import router as crm_router, customers_alias_router, customer_singular_alias_router
from src.modules.billing.router import router as billing_router
from src.modules.marketing.router import router as marketing_router
from src.ai.copilot.router import router as ai_router
from src.engines.form_builder.router import router as form_builder_router
from src.engines.notification.router import router as notification_router
from src.engines.search.router import router as search_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """ASGI application lifecycle manager."""
    try:
        from src.core.database.engine import engine, AsyncSessionLocal
        from src.core.database.models import Base
        from src.modules.auth.models import Tenant, Company, Branch, Role, User
        from src.modules.restaurant.models import (
            MenuCategory, MenuTag, MenuItem, MenuVariantGroup, MenuVariantOption,
            MenuAddonGroup, MenuAddonOption, PaymentMode,
            PosShift, PosShiftTransaction
        )
        from src.modules.orders.models import Order, OrderItem, DiningTable, KitchenStation, QueueToken
        from src.modules.crm.models import Customer, CustomerAddress, CustomerInteraction, LoyaltyTransaction
        from src.modules.marketing.models import LeadInquiry
        from sqlalchemy import select, text
        from passlib.context import CryptContext
        from decimal import Decimal

        # Configure all SQLAlchemy ORM mappers deterministically on startup
        Base.registry.configure()

        # Execute full DDL schema migration to guarantee all PostgreSQL tables exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)

        logger.info("✅ Database DDL schema verified & configured (Pure SSOT context active)")

    except Exception as exc:
        print(f"Lifespan DB setup warning: {exc}")
    yield



import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app = FastAPI(
    title="SSR One AI API Gateway",
    description="Enterprise multi-tenant operating system API backend.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ─── CORS Middleware Setup ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:5174",
        "http://localhost:8083",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Router Registrations ────────────────────────────────────
app.include_router(health_router)

# v1 API Routes
v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=v1_prefix)
app.include_router(licensing_router, prefix=v1_prefix)
app.include_router(business_crud_router, prefix=v1_prefix)
app.include_router(restaurant_router, prefix=v1_prefix)
app.include_router(hotel_router, prefix=v1_prefix)
app.include_router(pg_router, prefix=v1_prefix)
app.include_router(pg_alias_router, prefix=v1_prefix)
app.include_router(orders_router, prefix=v1_prefix)
app.include_router(inventory_router, prefix=v1_prefix)
app.include_router(hr_router, prefix=v1_prefix)
app.include_router(finance_router, prefix=v1_prefix)
app.include_router(dashboard_router, prefix=v1_prefix)
app.include_router(crm_router, prefix=v1_prefix)
app.include_router(customers_alias_router, prefix=v1_prefix)
app.include_router(customer_singular_alias_router, prefix=v1_prefix)
app.include_router(billing_router, prefix=v1_prefix)
app.include_router(marketing_router, prefix=v1_prefix)
app.include_router(ai_router, prefix=v1_prefix)
app.include_router(form_builder_router, prefix=v1_prefix)
app.include_router(notification_router, prefix=v1_prefix)
app.include_router(search_router, prefix=v1_prefix)


@app.get("/", tags=["Root"])
async def root_status():
    """Root endpoint returning service identity and version."""
    return JSONResponse(
        status_code=200,
        content={
            "platform": "SSR One AI",
            "service": "Backend FastAPI Gateway",
            "version": "1.0.0",
            "status": "ONLINE",
            "docs": "/docs",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
