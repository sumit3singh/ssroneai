"""
The Baithak – Inventory Router
Product catalog and stock management endpoints.
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.inventory.models import Product, ProductCategory, StockEntry
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/inventory", tags=["Inventory"])


class ProductCreateSchema(BaseModel):
    name: str
    code: str
    category_id: int | None = None
    product_type: str = "physical"
    mrp: Decimal = Field(gt=0)
    selling_price: Decimal = Field(gt=0)
    cost_price: Decimal | None = None
    unit_of_measure: str = "pcs"
    track_inventory: bool = True
    reorder_level: Decimal | None = None
    is_vegetarian: bool | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    code: str
    mrp: Decimal
    selling_price: Decimal
    unit_of_measure: str
    track_inventory: bool
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/products")
async def list_products(
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    query = select(Product).where(
        Product.tenant_id == current_user.tenant_id, Product.is_deleted == False
    )
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "items": [ProductResponse.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ProductResponse:
    product = Product(
        tenant_id=current_user.tenant_id,
        name=body.name,
        code=body.code,
        category_id=body.category_id,
        product_type=body.product_type,
        mrp=body.mrp,
        selling_price=body.selling_price,
        cost_price=body.cost_price,
        unit_of_measure=body.unit_of_measure,
        track_inventory=body.track_inventory,
        reorder_level=body.reorder_level,
        is_vegetarian=body.is_vegetarian,
        created_by=current_user.id,
    )
    db.add(product)
    await db.flush()
    return ProductResponse.model_validate(product)


@router.get("/stock-summary")
async def stock_summary(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Quick summary: total products, low stock count."""
    query = select(StockEntry).where(StockEntry.tenant_id == current_user.tenant_id)
    if branch_id:
        query = query.where(StockEntry.branch_id == branch_id)
    result = await db.execute(query)
    entries = result.scalars().all()

    return {
        "total_products": len(entries),
        "total_stock_value": float(sum(e.quantity_on_hand * e.average_cost for e in entries)),
    }
