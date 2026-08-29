"""
Service-Repository Layer: OrderRepository
Encapsulates PostgreSQL database operations for Orders, KOTs, and Dining Tables.
Enforces multi-tenant data boundaries (tenant_id, is_deleted filtering).
"""
from datetime import datetime, timezone
from decimal import Decimal
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.orders.models import (
    Order,
    OrderItem,
    OrderStatus,
    DiningTable,
    KitchenStation,
    KOT,
    KOTItem,
    OrderStatusLog,
)


class OrderRepository:
    """Encapsulated database operations for Order entity domain."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, tenant_id: int, order_id: int) -> Order | None:
        """Fetch single order by ID with items eager-loaded."""
        stmt = (
            select(Order)
            .where(
                Order.id == order_id,
                Order.tenant_id == tenant_id,
                Order.is_deleted == False,
            )
            .options(selectinload(Order.items))
        )
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_orders(
        self,
        tenant_id: int,
        branch_id: int | None = None,
        status: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[Sequence[Order], int]:
        """Fetch paginated orders list with filtering."""
        query = (
            select(Order)
            .where(Order.tenant_id == tenant_id, Order.is_deleted == False)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
        )

        if branch_id:
            query = query.where(Order.branch_id == branch_id)
        if status:
            query = query.where(Order.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_query)).scalar() or 0

        query = query.offset((page - 1) * page_size).limit(page_size)
        res = await self.session.execute(query)
        orders = res.scalars().all()
        return orders, total

    async def list_tables(self, tenant_id: int, branch_id: int | None = None) -> Sequence[DiningTable]:
        """List active dining tables for a branch."""
        stmt = select(DiningTable).where(
            DiningTable.tenant_id == tenant_id,
            DiningTable.is_deleted == False
        )
        if branch_id:
            stmt = stmt.where(DiningTable.branch_id == branch_id)
        res = await self.session.execute(stmt)
        return res.scalars().all()

    async def list_stations(self, tenant_id: int, branch_id: int | None = None) -> Sequence[KitchenStation]:
        """List kitchen stations for a branch."""
        stmt = select(KitchenStation).where(
            KitchenStation.tenant_id == tenant_id,
            KitchenStation.is_deleted == False
        )
        if branch_id:
            stmt = stmt.where(KitchenStation.branch_id == branch_id)
        res = await self.session.execute(stmt)
        return res.scalars().all()

    async def add_order(self, order: Order, items: list[OrderItem]) -> Order:
        """Persist a new order and its line items."""
        self.session.add(order)
        await self.session.flush()
        for item in items:
            item.order_id = order.id
            self.session.add(item)
        await self.session.flush()
        await self.session.refresh(order, ["items"])
        return order

    async def cancel_order(self, tenant_id: int, order_id: int, user_id: int, reason: str | None) -> Order:
        """Mark an order as cancelled."""
        order = await self.get_by_id(tenant_id, order_id)
        if not order:
            raise ValueError("Order not found")
        if order.status in (OrderStatus.COMPLETED, OrderStatus.CANCELLED):
            raise ValueError(f"Cannot cancel an order in '{order.status}' status")

        order.status = OrderStatus.CANCELLED
        order.cancelled_at = datetime.now(timezone.utc)
        order.cancellation_reason = reason
        order.updated_by = user_id
        await self.session.commit()
        return order
