"""
The ssrone – Orders Schemas & Router
"""
from datetime import datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database.engine import get_db_session
from src.core.event_bus.bus import event_bus, order_created_event
from src.modules.auth.dependencies import get_current_user, get_optional_user, RequirePermission
from src.modules.auth.models import User
from src.modules.orders.models import Order, OrderItem, OrderPayment, OrderStatus, DiningTable
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/orders", tags=["Orders"])


def _parse_int_id(val: Any) -> int | None:
    """Safely parse integer IDs from int, str, or None."""
    if val is None or val == "" or val == "undefined":
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


# ─── Schemas ─────────────────────────────────────────────

class OrderItemCreateSchema(BaseModel):
    product_id: int | None = None
    item_id: int | None = None
    product_name: str | None = None
    name: str | None = None
    product_code: str | None = None
    quantity: Decimal = Field(default=Decimal("1"))
    unit_price: Decimal = Field(default=Decimal("0"))
    unit_of_measure: str = "pcs"
    discount_amount: Decimal = Decimal("0")
    variant_name: str | None = None
    addons: list[Any] = Field(default_factory=list)
    selected_variant: dict | None = None
    modifiers: list[Any] = Field(default_factory=list)
    preparation_notes: str | None = None
    course: str | None = None
    packaging_charge: Decimal = Decimal("0")


class OrderCreateSchema(BaseModel):
    branch_id: int | None = 1
    customer_id: int | None = None
    table_id: int | None = None
    table_name: str | None = None
    waiter_id: int | None = None
    waiter_name: str | None = None
    order_type: str = "dine_in"
    order_mode: str | None = "dine_in"
    items: list[OrderItemCreateSchema] = Field(default_factory=list)
    notes: str | None = None
    special_instructions: str | None = None
    source_channel: str = "pos"
    subtotal: Decimal | float | None = None
    packaging_charge: Decimal | float | None = None
    tax_amount: Decimal | float | None = None
    discount_amount: Decimal | float | None = Decimal("0")
    net_amount: Decimal | float | None = None
    payment_method: str = "CASH"
    status: str = "COMPLETED"


class OrderPaymentSchema(BaseModel):
    payment_method: str
    amount: Decimal = Field(gt=0)
    reference_number: str | None = None
    gateway: str | None = None
    notes: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int | None = None
    product_name: str | None = None
    item_name: str | None = None
    name: str | None = None
    quantity: Decimal | float
    unit_price: Decimal | float
    discount_amount: Decimal | float = Decimal("0")
    tax_amount: Decimal | float = Decimal("0")
    line_total: Decimal | float = Decimal("0")
    kds_status: str = "pending"
    modifiers: list[Any] = Field(default_factory=list)
    selected_addons: list[Any] = Field(default_factory=list)
    variant_name: str | None = None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    branch_id: int | None = 1
    order_type: str = "dine_in"
    status: str = "draft"
    payment_status: str = "unpaid"
    subtotal: Decimal | float = Decimal("0")
    discount_amount: Decimal | float = Decimal("0")
    total_tax: Decimal | float = Decimal("0")
    grand_total: Decimal | float = Decimal("0")
    amount_paid: Decimal | float = Decimal("0")
    balance_due: Decimal | float = Decimal("0")
    notes: str | None = None
    table_id: int | None = None
    waiter_id: int | None = None
    items: list[OrderItemResponse] = Field(default_factory=list)
    created_at: datetime | None = None
    confirmed_at: datetime | None = None

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int


# ─── Router ──────────────────────────────────────────────

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderResponse:
    """Create a new order and dispatch to KDS via Event Bus."""
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    # Generate order number
    from datetime import timezone
    now = datetime.now(timezone.utc)
    order_number = f"ORD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:6]}"

    # Calculate subtotal & totals
    calc_subtotal = Decimal("0")
    for item in body.items:
        qty = Decimal(str(item.quantity)) if item.quantity else Decimal("1")
        price = Decimal(str(item.unit_price)) if item.unit_price else Decimal("0")
        calc_subtotal += qty * price

    subtotal = Decimal(str(body.subtotal)) if body.subtotal is not None else calc_subtotal
    total_discount = Decimal(str(body.discount_amount)) if body.discount_amount is not None else Decimal("0")
    pkg_charge = Decimal(str(body.packaging_charge)) if body.packaging_charge is not None else Decimal("0")
    taxable = max(Decimal("0"), subtotal + pkg_charge - total_discount)

    if body.tax_amount is not None:
        total_tax = Decimal(str(body.tax_amount))
        cgst = (total_tax / Decimal("2")).quantize(Decimal("0.01"))
        sgst = total_tax - cgst
    else:
        cgst = (taxable * Decimal("0.025")).quantize(Decimal("0.01"))
        sgst = (taxable * Decimal("0.025")).quantize(Decimal("0.01"))
        total_tax = cgst + sgst

    grand_total = Decimal(str(body.net_amount)) if body.net_amount is not None else (taxable + total_tax)

    target_status = body.status.lower() if body.status else "completed"
    payment_status = "paid" if target_status in ("completed", "paid") else "unpaid"
    amount_paid = grand_total if payment_status == "paid" else Decimal("0")
    balance_due = Decimal("0") if payment_status == "paid" else grand_total

    parsed_table_id = _parse_int_id(body.table_id)
    parsed_waiter_id = _parse_int_id(body.waiter_id)
    parsed_customer_id = _parse_int_id(body.customer_id)
    parsed_branch_id = _parse_int_id(body.branch_id) or 1

    order = Order(
        tenant_id=tenant_id,
        order_number=order_number,
        branch_id=parsed_branch_id,
        customer_id=parsed_customer_id,
        table_id=parsed_table_id,
        waiter_id=parsed_waiter_id,
        order_type=body.order_type or "dine_in",
        status=target_status,
        payment_status=payment_status,
        subtotal=subtotal,
        discount_amount=total_discount,
        taxable_amount=taxable,
        cgst_amount=cgst,
        sgst_amount=sgst,
        total_tax=total_tax,
        grand_total=grand_total,
        amount_paid=amount_paid,
        balance_due=balance_due,
        notes=body.notes,
        special_instructions=body.special_instructions,
        source_channel=body.source_channel or "pos",
        created_by=user_id,
    )
    db.add(order)
    await db.flush()

    # Update dining table status if assigned
    if parsed_table_id:
        try:
            tbl_res = await db.execute(select(DiningTable).where(DiningTable.id == parsed_table_id))
            tbl = tbl_res.scalar_one_or_none()
            if tbl:
                tbl.status = "occupied" if target_status not in ("completed", "cancelled") else "free"
                tbl.current_order_id = order.id if tbl.status == "occupied" else None
        except Exception as tbl_err:
            logger.warning("Failed to update table status on order creation", error=str(tbl_err))

    # Create order items
    for item_data in body.items:
        raw_id = item_data.product_id or item_data.item_id
        prod_id = _parse_int_id(raw_id) or 1
        prod_name = item_data.product_name or item_data.name or "Dish Item"

        try:
            qty = Decimal(str(item_data.quantity)) if item_data.quantity is not None else Decimal("1")
        except Exception:
            qty = Decimal("1")

        try:
            price = Decimal(str(item_data.unit_price)) if item_data.unit_price is not None else Decimal("0")
        except Exception:
            price = Decimal("0")

        try:
            disc = Decimal(str(item_data.discount_amount or 0))
        except Exception:
            disc = Decimal("0")

        line_total = (qty * price - disc).quantize(Decimal("0.01"))

        item = OrderItem(
            tenant_id=tenant_id,
            order_id=order.id,
            menu_item_id=prod_id,
            product_id=prod_id,
            product_name=prod_name,
            item_name=prod_name,
            total_price=line_total,
            product_code=item_data.product_code,
            variant_name=item_data.variant_name,
            quantity=qty,
            unit_price=price,
            discount_amount=disc,
            line_total=line_total,
            unit_of_measure=item_data.unit_of_measure or "pcs",
            modifiers=item_data.modifiers or [],
            selected_addons=item_data.addons or [],
            preparation_notes=item_data.preparation_notes,
            course=item_data.course,
            created_by=user_id,
        )
        db.add(item)

    try:
        await db.flush()
        await db.commit()
        await db.refresh(order, ["items"])
    except Exception as commit_err:
        await db.rollback()
        logger.error("Order commit error in PostgreSQL", error=str(commit_err))
        raise HTTPException(status_code=500, detail=f"Database Order Commit Error: {str(commit_err)}")

    # Emit event to Event Bus
    try:
        event = order_created_event(
            tenant_id=str(tenant_id),
            order_id=str(order.id),
            order_number=order_number,
            branch_id=str(body.branch_id or 1),
            grand_total=float(grand_total),
        )
        await event_bus.publish(event)
    except Exception as e:
        logger.warning("Event bus publish failed (Redis offline)", error=str(e))

    logger.info("Order created successfully", order_id=str(order.id), order_number=order_number)


    try:
        from src.core.database.audit import log_audit
        await log_audit(
            session=db,
            tenant_id=tenant_id,
            user_id=user_id,
            action="ORDER_CREATED",
            resource_type="Order",
            resource_id=str(order.id),
            new_values={"order_number": order_number, "grand_total": float(grand_total)},
        )
    except Exception as audit_err:
        logger.warning("Audit log failed for order creation", error=str(audit_err))

    return OrderResponse.model_validate(order)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    branch_id: int | None = None,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderListResponse:
    """List orders with filters and pagination."""
    tenant_id = current_user.tenant_id if current_user else 1
    query = (
        select(Order)
        .where(Order.tenant_id == tenant_id, (Order.is_deleted == False) | (Order.is_deleted.is_(None)))
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )

    if branch_id:
        query = query.where(Order.branch_id == branch_id)
    if status:
        query = query.where(Order.status == status)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()

    return OrderListResponse(
        items=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderResponse:
    """Get a single order by ID."""
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(
        select(Order)
        .where(
            Order.id == order_id,
            Order.tenant_id == tenant_id,
            (Order.is_deleted == False) | (Order.is_deleted.is_(None)),
        )
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return OrderResponse.model_validate(order)


@router.patch("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    reason: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Cancel an order (only if not yet completed)."""
    from datetime import timezone
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in (OrderStatus.COMPLETED, OrderStatus.CANCELLED):
        raise HTTPException(status_code=400, detail=f"Cannot cancel an order in '{order.status}' status")

    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.now(timezone.utc)
    order.cancellation_reason = reason
    order.updated_by = current_user.id

    logger.info("Order cancelled", order_id=str(order_id), reason=reason)
    return {"message": "Order cancelled", "order_id": str(order_id)}


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str = Query(..., description="Target status"),
    payment_status: str | None = Query(None, description="Target payment status"),
    amount_paid: Decimal | None = Query(None, description="Amount paid update"),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Update order status and/or payment status."""
    from datetime import timezone
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == tenant_id,
            (Order.is_deleted == False) | (Order.is_deleted.is_(None))
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = (order.status or "").lower()
    current_payment_status = (order.payment_status or "").lower()
    target_status = status.lower()

    if current_status in ("completed", "paid") or current_payment_status == "paid":
        if target_status in ("completed", "paid"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order #{order.order_number} is already settled & completed! Re-settlement is not permitted."
            )

    if current_status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order #{order.order_number} has been cancelled and cannot be modified."
        )

    order.status = target_status
    if order.status in ("completed", "paid"):
        order.completed_at = datetime.now(timezone.utc)
        order.payment_status = "paid"
        order.amount_paid = order.grand_total or Decimal("0.00")
        order.balance_due = Decimal("0.00")
    elif order.status == "cancelled":
        order.cancelled_at = datetime.now(timezone.utc)

    if payment_status:
        order.payment_status = payment_status
        if payment_status == "paid":
            order.amount_paid = order.grand_total
            order.balance_due = Decimal("0.00")

    if amount_paid is not None:
        order.amount_paid = amount_paid
        order.balance_due = max(Decimal("0.00"), order.grand_total - amount_paid)

    order.updated_by = user_id
    await db.commit()
    logger.info("Order status updated", order_id=str(order_id), status=status, payment_status=payment_status)
    return {
        "message": "Order updated successfully",
        "order_id": str(order_id),
        "status": order.status,
        "payment_status": order.payment_status,
        "amount_paid": float(order.amount_paid),
        "balance_due": float(order.balance_due)
    }


@router.post("/guest", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_order(
    body: OrderCreateSchema,
    db: AsyncSession = Depends(get_db_session),
) -> OrderResponse:
    """Create a new guest order from customer web portals without staff JWT auth."""
    from datetime import timezone
    now = datetime.now(timezone.utc)
    order_number = f"ORD-GUEST-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:6]}"

    # Calculate initial totals
    subtotal = sum(item.quantity * item.unit_price for item in body.items)
    total_discount = sum(item.discount_amount for item in body.items)
    taxable = subtotal - total_discount
    cgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
    sgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
    total_tax = cgst + sgst
    grand_total = taxable + total_tax

    # Create Order object (associated to default tenant_id = 1)
    order = Order(
        tenant_id=1,
        branch_id=body.branch_id,
        order_number=order_number,
        order_type=body.order_type,
        customer_id=body.customer_id,
        table_id=body.table_id,
        status="Pending",
        payment_status="unpaid",
        subtotal=subtotal,
        discount_amount=total_discount,
        total_tax=total_tax,
        grand_total=grand_total,
        amount_paid=Decimal("0.00"),
        balance_due=grand_total,
        notes=body.notes,
        created_by=1, # System default Admin
    )
    db.add(order)
    await db.flush()

    # Add items
    for it in body.items:
        o_item = OrderItem(
            order_id=order.id,
            product_id=it.product_id,
            product_name=it.product_name,
            product_code=it.product_code or "",
            quantity=it.quantity,
            unit_price=it.unit_price,
            discount_amount=it.discount_amount,
            tax_amount=(it.quantity * it.unit_price * Decimal("0.18")).quantize(Decimal("0.01")),
            line_total=(it.quantity * it.unit_price),
            kds_status="pending",
            modifiers=it.modifiers,
        )
        db.add(o_item)

    await db.flush()
    
from src.modules.orders.models import (
    Order,
    OrderItem,
    OrderPayment,
    OrderStatus,
    DiningTable,
    KitchenStation,
    KOT,
    KOTItem,
    OrderStatusLog,
)
from src.modules.orders.schemas import (
    DiningTableSchema,
    KitchenStationSchema,
    KOTResponseSchema,
    HoldOrderSchema,
    VoidOrderSchema,
    SplitOrderSchema,
)


# ─── Tables & Stations ────────────────────────────────────────

@router.get("/tables", response_model=list[DiningTableSchema])
async def list_dining_tables(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[DiningTableSchema]:
    stmt = select(DiningTable).where(
        DiningTable.tenant_id == current_user.tenant_id,
        DiningTable.is_deleted == False
    )
    if branch_id:
        stmt = stmt.where(DiningTable.branch_id == branch_id)
    res = await db.execute(stmt)
    return [DiningTableSchema.model_validate(t) for t in res.scalars().all()]


@router.get("/stations", response_model=list[KitchenStationSchema])
async def list_kitchen_stations(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[KitchenStationSchema]:
    stmt = select(KitchenStation).where(
        KitchenStation.tenant_id == current_user.tenant_id,
        KitchenStation.is_deleted == False
    )
    if branch_id:
        stmt = stmt.where(KitchenStation.branch_id == branch_id)
    res = await db.execute(stmt)
    return [KitchenStationSchema.model_validate(s) for s in res.scalars().all()]


# ─── KOT Generation & Station Routing ─────────────────────────

@router.post("/{order_id}/kots", response_model=list[KOTResponseSchema], status_code=status.HTTP_201_CREATED)
async def generate_kot(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Generate KOT tickets and route pending items to kitchen stations."""
    from datetime import timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Find un-KOT'd or pending items
    pending_items = [it for it in order.items if not it.is_voided and it.kds_status == "pending"]
    if not pending_items:
        raise HTTPException(status_code=400, detail="No pending items available to send to KOT.")

    # Group items by kitchen station code / station ID
    stations_result = await db.execute(
        select(KitchenStation).where(
            KitchenStation.tenant_id == current_user.tenant_id,
            KitchenStation.is_deleted == False
        )
    )
    stations = {s.code.lower(): s for s in stations_result.scalars().all()}

    # Fallback default station
    default_station = list(stations.values())[0] if stations else None

    items_by_station: dict[int | None, list[OrderItem]] = {}
    for item in pending_items:
        station_id = default_station.id if default_station else None
        # Check item preparation notes or modifiers for explicit station link
        if item.course and item.course.lower() in stations:
            station_id = stations[item.course.lower()].id
            
        items_by_station.setdefault(station_id, []).append(item)

    created_kots = []
    kot_counter = 1
    for st_id, st_items in items_by_station.items():
        kot_num = f"KOT-{order.order_number}-{now.strftime('%H%M%S')}-{kot_counter}"
        kot_counter += 1

        kot = KOT(
            tenant_id=current_user.tenant_id,
            branch_id=order.branch_id,
            order_id=order.id,
            kot_number=kot_num,
            station_id=st_id,
            status="printed",
            printed_at=now,
            created_by=current_user.id
        )
        db.add(kot)
        await db.flush()

        for it in st_items:
            kot_item = KOTItem(
                tenant_id=current_user.tenant_id,
                branch_id=order.branch_id,
                kot_id=kot.id,
                order_item_id=it.id,
                quantity=it.quantity,
                status="preparing",
                notes=it.preparation_notes
            )
            db.add(kot_item)
            it.kds_status = "in_kitchen"
            it.kot_id = kot.id
            it.kds_sent_at = now

        created_kots.append(kot)

    # Log status change
    old_status = order.status
    order.status = OrderStatus.KOT_SENT
    order.kot_sent_at = now
    
    log = OrderStatusLog(
        tenant_id=current_user.tenant_id,
        order_id=order.id,
        old_status=old_status,
        new_status=OrderStatus.KOT_SENT,
        changed_by=current_user.id,
        notes=f"Generated {len(created_kots)} KOT(s)"
    )
    db.add(log)
    await db.commit()

    return created_kots


# ─── Order Hold & Resume ──────────────────────────────────────

@router.post("/{order_id}/hold", response_model=OrderResponse)
async def hold_order(
    order_id: int,
    body: HoldOrderSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Put an order on hold."""
    from datetime import timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.is_held = True
    order.held_at = now
    
    log = OrderStatusLog(
        tenant_id=current_user.tenant_id,
        order_id=order.id,
        old_status=old_status,
        new_status="held",
        changed_by=current_user.id,
        notes=body.reason
    )
    db.add(log)
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.post("/{order_id}/resume", response_model=OrderResponse)
async def resume_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Resume a held order."""
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.is_held = False
    log = OrderStatusLog(
        tenant_id=current_user.tenant_id,
        order_id=order.id,
        old_status="held",
        new_status=order.status,
        changed_by=current_user.id,
        notes="Order resumed by cashier"
    )
    db.add(log)
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


# ─── Order Void ───────────────────────────────────────────────

@router.post("/{order_id}/void", response_model=OrderResponse)
async def void_order(
    order_id: int,
    body: VoidOrderSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Void specific item or entire order with mandatory audit reason."""
    from datetime import timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.item_id:
        item = next((it for it in order.items if it.id == body.item_id), None)
        if not item:
            raise HTTPException(status_code=404, detail="Order item not found")
        item.is_voided = True
        item.void_reason = body.reason
        item.voided_at = now
        item.voided_by = current_user.id
        notes_str = f"Voided item {item.product_name}: {body.reason}"
    else:
        old_status = order.status
        order.status = OrderStatus.CANCELLED
        order.cancelled_at = now
        order.cancellation_reason = body.reason
        for it in order.items:
            it.is_voided = True
            it.void_reason = body.reason
            it.voided_at = now
            it.voided_by = current_user.id
        notes_str = f"Voided entire order: {body.reason}"

    # Recalculate totals for active items
    active_items = [it for it in order.items if not it.is_voided]
    subtotal = sum(it.quantity * it.unit_price for it in active_items)
    taxable = subtotal - order.discount_amount
    tax = taxable * Decimal("0.18")
    order.subtotal = subtotal
    order.total_tax = tax
    order.grand_total = max(Decimal("0.00"), taxable + tax)
    order.balance_due = max(Decimal("0.00"), order.grand_total - order.amount_paid)

    log = OrderStatusLog(
        tenant_id=current_user.tenant_id,
        order_id=order.id,
        old_status=order.status,
        new_status="voided",
        changed_by=current_user.id,
        notes=notes_str
    )
    db.add(log)
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


# ─── Order Split ──────────────────────────────────────────────

@router.post("/{order_id}/split", response_model=OrderResponse)
async def split_order(
    order_id: int,
    body: SplitOrderSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Split specified items into a child sub-order."""
    from datetime import timezone
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    parent_order = result.scalar_one_or_none()
    if not parent_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Create child order
    child_order_num = f"{parent_order.order_number}-SPLIT"
    child_order = Order(
        tenant_id=current_user.tenant_id,
        branch_id=parent_order.branch_id,
        order_number=child_order_num,
        order_type=parent_order.order_type,
        parent_order_id=parent_order.id,
        customer_id=parent_order.customer_id,
        table_id=parent_order.table_id,
        notes=f"Split from order {parent_order.order_number}",
        status=parent_order.status,
        payment_status="unpaid",
        created_by=current_user.id
    )
    db.add(child_order)
    await db.flush()

    child_subtotal = Decimal("0.00")
    for split_item in body.items:
        parent_item = next((it for it in parent_order.items if it.id == split_item.order_item_id), None)
        if not parent_item:
            continue

        if split_item.quantity >= parent_item.quantity:
            # Move item entirely to child order
            parent_item.order_id = child_order.id
            child_subtotal += parent_item.line_total
        else:
            # Reduce parent quantity and create child item
            parent_item.quantity -= split_item.quantity
            parent_item.line_total = parent_item.quantity * parent_item.unit_price

            child_item = OrderItem(
                tenant_id=current_user.tenant_id,
                order_id=child_order.id,
                product_id=parent_item.product_id,
                product_name=parent_item.product_name,
                product_code=parent_item.product_code,
                quantity=split_item.quantity,
                unit_price=parent_item.unit_price,
                line_total=split_item.quantity * parent_item.unit_price,
                kds_status=parent_item.kds_status,
                modifiers=parent_item.modifiers
            )
            db.add(child_item)
            child_subtotal += child_item.line_total

    # Update child financial totals
    child_tax = child_subtotal * Decimal("0.18")
    child_order.subtotal = child_subtotal
    child_order.total_tax = child_tax
    child_order.grand_total = child_subtotal + child_tax
    child_order.balance_due = child_order.grand_total

    # Recalculate parent financial totals
    parent_subtotal = sum(it.quantity * it.unit_price for it in parent_order.items if it.order_id == parent_order.id and not it.is_voided)
    parent_tax = parent_subtotal * Decimal("0.18")
    parent_order.subtotal = parent_subtotal
    parent_order.total_tax = parent_tax
    parent_order.grand_total = parent_subtotal + parent_tax
    parent_order.balance_due = max(Decimal("0.00"), parent_order.grand_total - parent_order.amount_paid)

    log = OrderStatusLog(
        tenant_id=current_user.tenant_id,
        order_id=parent_order.id,
        old_status=parent_order.status,
        new_status="split",
        changed_by=current_user.id,
        notes=f"Split into child order {child_order_num}"
    )
    db.add(log)
    await db.commit()

    # Return child order
    res_stmt = select(Order).where(Order.id == child_order.id).options(selectinload(Order.items))
    res_child = await db.execute(res_stmt)
    return OrderResponse.model_validate(res_child.scalar_one())


# ─── Thermal Bill Print ───────────────────────────────────────

@router.get("/{order_id}/print-bill")
async def get_printable_bill(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Generate printable thermal text format for customer bill / invoice."""
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        ).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    lines = [
        "========================================",
        "          THE ssrone CAFE             ",
        "         TAX INVOICE / BILL            ",
        "========================================",
        f"Bill #:  {order.order_number}",
        f"Date:    {order.created_at.strftime('%d-%b-%Y %H:%M:%S')}",
        f"Customer: {order.notes or 'Walk-in Customer'}",
        "----------------------------------------",
        "ITEM                  QTY  PRICE  AMOUNT",
        "----------------------------------------",
    ]

    for item in order.items:
        if item.is_voided:
            continue
        item_name = f"{item.product_name:<20}"
        qty_str = f"{item.quantity:>3}"
        price_str = f"{item.unit_price:>5.0f}"
        amount_str = f"{item.line_total:>7.2f}"
        lines.append(f"{item_name} {qty_str} {price_str} {amount_str}")


    lines.extend([
        "----------------------------------------",
        f"Subtotal:                 INR {order.subtotal:>8.2f}",
        f"Discount:                 INR {order.discount_amount:>8.2f}",
        f"GST (5% Food):            INR {order.total_tax:>8.2f}",
        "----------------------------------------",
        f"GRAND TOTAL:              INR {order.grand_total:>8.2f}",
        f"Paid ({order.payment_status.upper()}):             INR {order.amount_paid:>8.2f}",
        f"Balance Due:              INR {order.balance_due:>8.2f}",
        "========================================",
        "     Thank you for visiting ssrone!    ",
        "========================================",
    ])

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "thermal_text": "\n".join(lines),
        "grand_total": float(order.grand_total),
    }



