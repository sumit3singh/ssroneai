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
from fastapi.responses import JSONResponse

# Ensure services/backend root directory is on sys.path for src.* imports
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

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
        from src.modules.orders.models import Order, OrderItem, DiningTable, KitchenStation
        from src.modules.crm.models import Customer, CustomerAddress, CustomerInteraction, LoyaltyTransaction
        from sqlalchemy import select, text
        from passlib.context import CryptContext
        from decimal import Decimal

        # Configure all SQLAlchemy ORM mappers deterministically on startup
        Base.registry.configure()

        # Execute full DDL schema migration to guarantee all PostgreSQL tables exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all, checkfirst=True)

        async with AsyncSessionLocal() as db:
            existing = await db.execute(select(Tenant).where(Tenant.slug == "baithak-cafe"))
            t_obj = existing.scalar_one_or_none()
            if not t_obj:
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                tenant = Tenant(name="Baithak Cafe Tenant", slug="baithak-cafe", plan="enterprise", is_active=True)
                db.add(tenant)
                await db.flush()

                company = Company(tenant_id=tenant.id, name="Baithak Cafe Hospitality", country_code="IN", currency_code="INR", is_active=True)
                db.add(company)
                await db.flush()

                branch = Branch(tenant_id=tenant.id, company_id=company.id, name="Main Branch - Baithak Cafe", code="BR-001", timezone="Asia/Kolkata", is_active=True)
                db.add(branch)
                await db.flush()

                role = Role(tenant_id=tenant.id, name="SUPER_ADMIN", description="Super Admin Role")
                db.add(role)
                await db.flush()

                admin_user = User(
                    tenant_id=tenant.id, role_id=role.id, email="admin@baithakcafe.com",
                    display_name="Sumit Singh", first_name="Sumit", last_name="Singh",
                    hashed_password=pwd_context.hash("admin123"), is_active=True
                )
                db.add(admin_user)
                await db.commit()
                t_obj = tenant

            # Ensure default menu categories and items exist in PostgreSQL for ALL active branches
            b_res = await db.execute(select(Branch).where((Branch.is_deleted == False) | (Branch.is_deleted.is_(None))))
            all_branches = b_res.scalars().all()
            target_branch_ids = [b.id for b in all_branches] if all_branches else [1, 2]

            for bid in target_branch_ids:
                cat_check = await db.execute(
                    select(MenuCategory).where(
                        MenuCategory.branch_id == bid,
                        (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
                    )
                )
                b_cats = cat_check.scalars().all()
                if not b_cats:
                    defaults = [
                        {"name": "Special Chai & Tea", "icon": "☕", "slug": f"chai-tea-{bid}", "sort_order": 1},
                        {"name": "Artisanal Coffee", "icon": "🥤", "slug": f"coffee-{bid}", "sort_order": 2},
                        {"name": "Quick Bites & Snacks", "icon": "🍟", "slug": f"snacks-{bid}", "sort_order": 3},
                        {"name": "Baithak Special Burgers", "icon": "🍔", "slug": f"burgers-{bid}", "sort_order": 4},
                        {"name": "Value Combos", "icon": "🍱", "slug": f"combos-{bid}", "sort_order": 5},
                    ]
                    b_cats = []
                    for c in defaults:
                        new_c = MenuCategory(
                            tenant_id=t_obj.id if t_obj else 2,
                            company_id=1,
                            branch_id=bid,
                            name=c["name"],
                            icon=c["icon"],
                            slug=c["slug"],
                            sort_order=c["sort_order"],
                            created_by=1
                        )
                        db.add(new_c)
                        b_cats.append(new_c)
                    await db.commit()

                # Ensure menu items exist for this branch
                item_check = await db.execute(
                    select(MenuItem).where(
                        MenuItem.branch_id == bid,
                        (MenuItem.is_deleted == False) | (MenuItem.is_deleted.is_(None))
                    )
                )
                if not item_check.scalars().all() and b_cats:
                    target_cat = b_cats[0]
                    snacks_cat = b_cats[2] if len(b_cats) > 2 else target_cat
                    coffee_cat = b_cats[1] if len(b_cats) > 1 else target_cat

                    item_defs = [
                        {
                            "name": "Kulhad Masala Chai", "cat": target_cat, "price": 30.0, "veg": True, "station": "Tea Bar"
                        },
                        {
                            "name": "Elaichi Special Tea", "cat": target_cat, "price": 25.0, "veg": True, "station": "Tea Bar"
                        },
                        {
                            "name": "Cold Coffee with Ice Cream", "cat": coffee_cat, "price": 120.0, "veg": True, "station": "Beverage"
                        },
                        {
                            "name": "Peri Peri French Fries", "cat": snacks_cat, "price": 90.0, "veg": True, "station": "Kitchen"
                        },
                        {
                            "name": "Veg Pizza", "cat": target_cat, "price": 180.0, "veg": True, "station": "Pizza Bar", "has_variants": True
                        },
                    ]

                    for idef in item_defs:
                        item_obj = MenuItem(
                            tenant_id=t_obj.id if t_obj else 2,
                            branch_id=bid,
                            company_id=1,
                            category_id=idef["cat"].id,
                            name=idef["name"],
                            description=f"Freshly prepared {idef['name']} for branch {bid}.",
                            short_description=idef["name"],
                            base_price=idef["price"],
                            packaging_charge=10.0,
                            is_veg=idef["veg"],
                            is_available=True,
                            kds_station=idef["station"],
                            gst_percent=5.0,
                            sort_order=1,
                            created_by=1
                        )
                        db.add(item_obj)
                        await db.flush()

                        if idef.get("has_variants"):
                            vg = MenuVariantGroup(
                                tenant_id=item_obj.tenant_id,
                                branch_id=bid,
                                item_id=item_obj.id,
                                name="Pizza Size",
                                min_selection=1,
                                max_selection=1,
                                is_required=True,
                                sort_order=1,
                                created_by=1
                            )
                            db.add(vg)
                            await db.flush()
                            for opt in [
                                {"name": 'Small (7")', "price": 150.0, "is_default": False},
                                {"name": 'Medium (10")', "price": 180.0, "is_default": True},
                                {"name": 'Large (12")', "price": 230.0, "is_default": False},
                            ]:
                                db.add(MenuVariantOption(
                                    tenant_id=item_obj.tenant_id,
                                    branch_id=bid,
                                    group_id=vg.id,
                                    name=opt["name"],
                                    selling_price=opt["price"],
                                    price=opt["price"],
                                    is_default=opt["is_default"],
                                    is_available=True,
                                    sort_order=1,
                                    created_by=1
                                ))

                            ag = MenuAddonGroup(
                                tenant_id=item_obj.tenant_id,
                                branch_id=bid,
                                item_id=item_obj.id,
                                name="Crust Upgrade",
                                min_selection=0,
                                max_selection=5,
                                sort_order=1,
                                created_by=1
                            )
                            db.add(ag)
                            await db.flush()

                            db.add(MenuAddonOption(
                                tenant_id=item_obj.tenant_id,
                                branch_id=bid,
                                group_id=ag.id,
                                name="Cheese Burst Crust",
                                price=80.0,
                                variant_prices={'Small (7")': 50.0, 'Medium (10")': 80.0, 'Large (12")': 100.0},
                                is_available=True,
                                sort_order=1,
                                created_by=1
                            ))
                    await db.commit()

                # Seed default employees in PostgreSQL if table is empty
                from src.modules.hrms.models import Employee as EmpModel
                emp_check = await db.execute(select(EmpModel))
                if not emp_check.scalars().all():
                    db.add(EmpModel(
                        tenant_id=t_obj.id if t_obj else 2,
                        branch_id=1,
                        company_id=1,
                        employee_code="EMP-1001",
                        full_name="Ramesh Singh",
                        designation="Server / Waiter",
                        phone="9876543210",
                        basic_salary=Decimal("22000.00"),
                        is_waiter=True,
                        status="ACTIVE",
                        created_by=1
                    ))
                    db.add(EmpModel(
                        tenant_id=t_obj.id if t_obj else 2,
                        branch_id=1,
                        company_id=1,
                        employee_code="EMP-1002",
                        full_name="Priya Sharma",
                        designation="Head Chef",
                        phone="9876543211",
                        basic_salary=Decimal("25000.00"),
                        is_chef=True,
                        status="ACTIVE",
                        created_by=1
                    ))
                    await db.commit()

                await db.commit()

    except Exception as exc:
        print(f"Lifespan DB setup warning: {exc}")
    yield



app = FastAPI(
    title="SSR One AI API Gateway",
    description="Enterprise multi-tenant operating system API backend.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware Setup ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
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
