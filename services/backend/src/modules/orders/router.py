"""
The Baithak – Orders Schemas & Router
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
from src.modules.auth.dependencies import get_current_user, RequirePermission
from src.modules.auth.models import User
from src.modules.orders.models import Order, OrderItem, OrderPayment, OrderStatus
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/orders", tags=["Orders"])


# ─── Schemas ─────────────────────────────────────────────

class OrderItemCreateSchema(BaseModel):
    product_id: int
    product_name: str
    product_code: str | None = None
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(gt=0)
    unit_of_measure: str = "pcs"
    discount_amount: Decimal = Decimal("0")
    modifiers: list[dict] = Field(default_factory=list)
    preparation_notes: str | None = None
    course: str | None = None


class OrderCreateSchema(BaseModel):
    branch_id: int
    customer_id: int | None = None
    table_id: int | None = None
    waiter_id: int | None = None
    order_type: str = "dine_in"
    items: list[OrderItemCreateSchema] = Field(min_length=1)
    notes: str | None = None
    special_instructions: str | None = None
    source_channel: str = "pos"


class OrderPaymentSchema(BaseModel):
    payment_method: str
    amount: Decimal = Field(gt=0)
    reference_number: str | None = None
    gateway: str | None = None
    notes: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: Decimal
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    line_total: Decimal
    kds_status: str
    modifiers: list[Any]

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    order_number: str
    branch_id: int
    order_type: str
    status: str
    payment_status: str
    subtotal: Decimal
    discount_amount: Decimal
    total_tax: Decimal
    grand_total: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    notes: str | None
    items: list[OrderItemResponse]
    created_at: datetime
    confirmed_at: datetime | None

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderResponse:
    """Create a new order and dispatch to KDS via Event Bus."""

    # Generate order number (simplified — use NumberSeriesManager in production)
    from datetime import timezone
    now = datetime.now(timezone.utc)
    order_number = f"ORD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:6]}"

    # Calculate initial totals
    subtotal = sum(item.quantity * item.unit_price for item in body.items)
    total_discount = sum(item.discount_amount for item in body.items)
    taxable = subtotal - total_discount
    cgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
    sgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
    total_tax = cgst + sgst
    grand_total = taxable + total_tax

    # Evaluate business rules
    from src.engines.rules.engine import rule_engine, BusinessRule, RuleCondition, RuleAction, Operator, ActionType
    
    rules = [
        BusinessRule(
            rule_id="rule_large_order_block",
            name="Block large orders without customer ID",
            entity_type="order",
            conditions=[
                RuleCondition(field="grand_total", operator=Operator.GT, value=50000.0),
                RuleCondition(field="customer_id", operator=Operator.IS_NULL, value=None)
            ],
            actions=[
                RuleAction(action_type=ActionType.BLOCK, parameters={"reason": "Large orders (>50,000 INR) require an attached Customer profile."})
            ]
        ),
        BusinessRule(
            rule_id="rule_large_takeaway_discount",
            name="Apply 10% discount for large takeaways",
            entity_type="order",
            conditions=[
                RuleCondition(field="grand_total", operator=Operator.GT, value=5000.0),
                RuleCondition(field="order_type", operator=Operator.EQ, value="takeaway")
            ],
            actions=[
                RuleAction(action_type=ActionType.APPLY_DISCOUNT, parameters={"percent": 10})
            ]
        )
    ]

    rule_ctx = {
        "grand_total": float(grand_total),
        "customer_id": str(body.customer_id) if body.customer_id else None,
        "order_type": body.order_type
    }

    eval_result = rule_engine.evaluate(rules, rule_ctx, "order")

    if eval_result.blocked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=eval_result.block_reason or "Transaction blocked by business rules."
        )

    # Apply discounts from rules if present
    for act in eval_result.actions_to_execute:
        if act.action_type == ActionType.APPLY_DISCOUNT:
            pct = Decimal(str(act.parameters.get("percent", 0)))
            if pct > 0:
                additional_discount = (grand_total * (pct / Decimal("100"))).quantize(Decimal("0.01"))
                total_discount += additional_discount
                taxable = subtotal - total_discount
                cgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
                sgst = (taxable * Decimal("0.09")).quantize(Decimal("0.01"))
                total_tax = cgst + sgst
                grand_total = taxable + total_tax

    order = Order(
        tenant_id=current_user.tenant_id,
        order_number=order_number,
        branch_id=body.branch_id,
        customer_id=body.customer_id,
        table_id=body.table_id,
        waiter_id=body.waiter_id,
        order_type=body.order_type,
        status=OrderStatus.CONFIRMED,
        subtotal=subtotal,
        discount_amount=total_discount,
        taxable_amount=taxable,
        cgst_amount=cgst,
        sgst_amount=sgst,
        total_tax=total_tax,
        grand_total=grand_total,
        balance_due=grand_total,
        notes=body.notes,
        special_instructions=body.special_instructions,
        source_channel=body.source_channel,
        created_by=current_user.id,
    )
    db.add(order)
    await db.flush()

    # Create order items
    for item_data in body.items:
        line_total = (
            item_data.quantity * item_data.unit_price - item_data.discount_amount
        ).quantize(Decimal("0.01"))
        item = OrderItem(
            tenant_id=current_user.tenant_id,
            order_id=order.id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            product_code=item_data.product_code,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount_amount=item_data.discount_amount,
            line_total=line_total,
            unit_of_measure=item_data.unit_of_measure,
            modifiers=item_data.modifiers,
            preparation_notes=item_data.preparation_notes,
            course=item_data.course,
            created_by=current_user.id,
        )
        db.add(item)

    await db.flush()
    await db.refresh(order, ["items"])

    # Emit event to Event Bus (triggers KDS, inventory deduction, loyalty points)
    event = order_created_event(
        tenant_id=str(current_user.tenant_id),
        order_id=str(order.id),
        order_number=order_number,
        branch_id=str(body.branch_id),
        grand_total=float(grand_total),
    )
    try:
        await event_bus.publish(event)
    except Exception as e:
        logger.warning("Event bus publish failed (Redis offline)", error=str(e))

    logger.info("Order created", order_id=str(order.id), order_number=order_number)

    from src.core.database.audit import log_audit
    await log_audit(
        session=db,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="ORDER_CREATED",
        resource_type="Order",
        resource_id=str(order.id),
        new_values={"order_number": order_number, "grand_total": float(grand_total)},
    )

    return OrderResponse.model_validate(order)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    branch_id: int | None = None,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderListResponse:
    """List orders with filters and pagination."""
    query = (
        select(Order)
        .where(Order.tenant_id == current_user.tenant_id, Order.is_deleted == False)
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> OrderResponse:
    """Get a single order by ID."""
    result = await db.execute(
        select(Order)
        .where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False,
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Update order status and/or payment status."""
    from datetime import timezone
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.tenant_id == current_user.tenant_id,
            Order.is_deleted == False
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    if status == OrderStatus.COMPLETED:
        order.completed_at = datetime.now(timezone.utc)
    elif status == OrderStatus.CANCELLED:
        order.cancelled_at = datetime.now(timezone.utc)

    if payment_status:
        order.payment_status = payment_status
        if payment_status == "paid":
            order.amount_paid = order.grand_total
            order.balance_due = Decimal("0.00")

    if amount_paid is not None:
        order.amount_paid = amount_paid
        order.balance_due = max(Decimal("0.00"), order.grand_total - amount_paid)

    order.updated_by = current_user.id
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
        "          THE BAITHAK CAFE             ",
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
        "     Thank you for visiting Baithak!    ",
        "========================================",
    ])

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "thermal_text": "\n".join(lines),
        "grand_total": float(order.grand_total),
    }



