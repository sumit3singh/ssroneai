"""
The ssrone – Inventory Router
Product catalog, stock management, GRN goods receipt notes, and production batch logging.
"""
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.inventory.models import Product, ProductCategory, ProductionBatch, StockEntry, StockMovement
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
    tenant_id = current_user.tenant_id
    query = select(Product).where(
        Product.tenant_id == tenant_id, Product.is_deleted == False
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
    tenant_id = current_user.tenant_id
    product = Product(
        tenant_id=tenant_id,
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
    tenant_id = current_user.tenant_id
    query = select(StockEntry).where(StockEntry.tenant_id == tenant_id)
    if branch_id:
        query = query.where(StockEntry.branch_id == branch_id)
    result = await db.execute(query)
    entries = result.scalars().all()

    return {
        "total_products": len(entries),
        "total_stock_value": float(sum(e.quantity_on_hand * e.average_cost for e in entries)),
    }


# ─── Goods Receipt Note (GRN) & Stock Movements ───────────────

class GRNCreateSchema(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_cost: float = Field(gt=0)
    batch_number: str | None = None
    expiry_date: str | None = None
    supplier_name: str | None = None
    notes: str | None = None
    branch_id: int | None = 1


@router.get("/movements")
async def list_stock_movements(
    product_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = (
        select(StockMovement, Product.name, Product.unit_of_measure)
        .outerjoin(Product, StockMovement.product_id == Product.id)
        .where(StockMovement.tenant_id == tenant_id, StockMovement.is_deleted == False)
    )
    if product_id:
        query = query.where(StockMovement.product_id == product_id)
    res = await db.execute(query.order_by(StockMovement.created_at.desc()).limit(100))
    rows = res.all()
    return [
        {
            "id": m.id,
            "product_id": m.product_id,
            "product_name": p_name or f"Item #{m.product_id}",
            "unit_of_measure": uom or "pcs",
            "movement_type": m.movement_type,
            "quantity": float(m.quantity),
            "unit_cost": float(m.unit_cost) if m.unit_cost else None,
            "balance_after": float(m.balance_after),
            "batch_number": m.batch_number,
            "expiry_date": m.expiry_date,
            "notes": m.notes,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m, p_name, uom in rows
    ]


@router.post("/grn", status_code=status.HTTP_201_CREATED)
async def create_goods_receipt(
    body: GRNCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    branch_id = body.branch_id or 1

    # Verify product
    p_res = await db.execute(select(Product).where(Product.id == body.product_id, Product.tenant_id == tenant_id))
    product = p_res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update or create StockEntry
    se_res = await db.execute(
        select(StockEntry).where(
            StockEntry.tenant_id == tenant_id,
            StockEntry.product_id == body.product_id,
            StockEntry.branch_id == branch_id,
        )
    )
    stock_entry = se_res.scalar_one_or_none()
    qty_in = Decimal(str(body.quantity))
    cost = Decimal(str(body.unit_cost))

    if not stock_entry:
        stock_entry = StockEntry(
            tenant_id=tenant_id,
            branch_id=branch_id,
            product_id=body.product_id,
            quantity_on_hand=qty_in,
            quantity_reserved=Decimal("0.0"),
            quantity_available=qty_in,
            average_cost=cost,
        )
        db.add(stock_entry)
        balance_after = qty_in
    else:
        prev_qty = stock_entry.quantity_on_hand
        prev_cost = stock_entry.average_cost
        new_qty = prev_qty + qty_in
        if new_qty > 0:
            stock_entry.average_cost = ((prev_qty * prev_cost) + (qty_in * cost)) / new_qty
        stock_entry.quantity_on_hand = new_qty
        stock_entry.quantity_available = new_qty - stock_entry.quantity_reserved
        balance_after = stock_entry.quantity_on_hand

    import time
    batch_num = body.batch_number or f"BATCH-{int(time.time()) % 1000000:06d}"

    movement = StockMovement(
        tenant_id=tenant_id,
        branch_id=branch_id,
        product_id=body.product_id,
        movement_type="purchase",
        quantity=qty_in,
        unit_cost=cost,
        balance_after=balance_after,
        batch_number=batch_num,
        expiry_date=body.expiry_date,
        notes=f"Supplier: {body.supplier_name or 'Direct'} | {body.notes or ''}".strip(),
    )
    db.add(movement)
    await db.commit()

    return {
        "message": f"GRN intake of {body.quantity} {product.unit_of_measure} recorded",
        "batch_number": batch_num,
        "new_stock_level": float(balance_after),
    }


# ─── Production Batches ────────────────────────────────────────

class ProductionBatchCreateSchema(BaseModel):
    item_type: str = "FOOD"
    item_id: int
    quantity_produced: float = Field(gt=0)
    unit: str = "KG"
    production_date: date | None = None
    expiry_date: date | None = None
    chef_name: str | None = None
    batch_number: str | None = None


@router.get("/production-batches")
async def list_production_batches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(ProductionBatch)
        .where(ProductionBatch.tenant_id == tenant_id, ProductionBatch.is_deleted == False)
        .order_by(ProductionBatch.id.desc())
        .limit(100)
    )
    batches = res.scalars().all()
    return [
        {
            "id": pb.id,
            "batch_number": pb.batch_number,
            "item_type": pb.item_type,
            "item_id": pb.item_id,
            "quantity_produced": float(pb.quantity_produced),
            "unit": pb.unit,
            "production_date": pb.production_date.isoformat() if pb.production_date else None,
            "expiry_date": pb.expiry_date.isoformat() if pb.expiry_date else None,
            "chef_name": pb.chef_name,
            "status": pb.status,
        }
        for pb in batches
    ]


@router.post("/production-batches", status_code=status.HTTP_201_CREATED)
async def create_production_batch(
    body: ProductionBatchCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    import time
    batch_num = body.batch_number or f"PB-{int(time.time()) % 1000000:06d}"

    pb = ProductionBatch(
        tenant_id=tenant_id,
        batch_number=batch_num,
        item_type=body.item_type,
        item_id=body.item_id,
        quantity_produced=Decimal(str(body.quantity_produced)),
        unit=body.unit.upper(),
        production_date=body.production_date or date.today(),
        expiry_date=body.expiry_date,
        chef_name=body.chef_name,
        status="COMPLETED",
    )
    db.add(pb)
    await db.commit()
    await db.refresh(pb)
    return {"message": "Production batch recorded successfully", "id": pb.id, "batch_number": batch_num}


class ConsumeBOMItemSchema(BaseModel):
    product_id: int
    quantity: float
    name: str | None = None


class ConsumeBOMRequest(BaseModel):
    order_id: int | str
    order_number: str | None = None
    items: list[ConsumeBOMItemSchema] = []


@router.post("/orders/{order_id}/consume-bom")
async def consume_order_recipe_bom(
    order_id: int | str,
    body: ConsumeBOMRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Automated Recipe Bill of Materials (BOM) Stock Consumption:
    Automatically decrements inventory ingredients when an order is fulfilled.
    Creates audit trail records in stock movements.
    """
    tenant_id = current_user.tenant_id
    consumed_records = []

    # If items are provided in the payload, deduce stock for each
    items = body.items if body else []
    for it in items:
        # Standard ingredient consumption ratio (e.g. 0.15kg per portion)
        qty_to_consume = Decimal(str(max(0.1, it.quantity * 0.15)))

        stock_entry = await db.execute(
            select(StockEntry).where(
                StockEntry.tenant_id == tenant_id,
                StockEntry.product_id == it.product_id,
            )
        )
        entry = stock_entry.scalar_one_or_none()

        if entry:
            entry.current_stock = max(Decimal("0.0"), entry.current_stock - qty_to_consume)
            movement = StockMovement(
                tenant_id=tenant_id,
                product_id=it.product_id,
                movement_type="RECIPE_CONSUMPTION",
                quantity=-qty_to_consume,
                reference_type="ORDER_BOM",
                reference_id=str(order_id),
                notes=f"Auto BOM consumption for Order #{body.order_number if body else order_id}",
            )
            db.add(movement)
            consumed_records.append({
                "product_id": it.product_id,
                "consumed_quantity": float(qty_to_consume),
                "remaining_stock": float(entry.current_stock),
            })

    await db.commit()
    return {
        "status": "success",
        "order_id": order_id,
        "consumed_ingredients_count": len(consumed_records),
        "details": consumed_records,
    }
