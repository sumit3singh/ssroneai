"""
Service-Repository Layer: OrderService
Encapsulates business domain logic, calculation rules, event publishing, and audits.
"""
from decimal import Decimal
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.event_bus.bus import event_bus, order_created_event
from src.core.database.audit import log_audit
from src.modules.auth.models import User
from src.modules.orders.models import Order, OrderItem, OrderStatus
from src.modules.orders.repository import OrderRepository
from src.shared.logger import get_logger

logger = get_logger(__name__)


class OrderService:
    """Business service orchestrating Order calculations, repository persistence, and event triggers."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = OrderRepository(session)

    async def get_order(self, tenant_id: int, order_id: int) -> Order | None:
        return await self.repository.get_by_id(tenant_id, order_id)

    async def list_orders(
        self,
        tenant_id: int,
        branch_id: int | None = None,
        status: str | None = None,
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[Sequence[Order], int]:
        return await self.repository.list_orders(
            tenant_id=tenant_id,
            branch_id=branch_id,
            status=status,
            page=page,
            page_size=page_size
        )

    async def cancel_order(self, tenant_id: int, order_id: int, user_id: int, reason: str | None) -> Order:
        return await self.repository.cancel_order(tenant_id, order_id, user_id, reason)
