"""
Service-Repository Layer: BillingRepository
Encapsulates PostgreSQL database access for Billing and Invoicing domain entities.
"""
from datetime import date
from decimal import Decimal
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.billing.models import Invoice, InvoicePayment


class BillingRepository:
    """Encapsulated DB operations for Billing entities."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_invoice_by_id(self, tenant_id: int, invoice_id: int) -> Invoice | None:
        stmt = select(Invoice).where(
            Invoice.id == invoice_id,
            Invoice.tenant_id == tenant_id,
            Invoice.is_deleted == False
        )
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def list_invoices(
        self,
        tenant_id: int,
        status_filter: str | None = None,
        page: int = 1,
        page_size: int = 25
    ) -> tuple[Sequence[Invoice], int]:
        query = select(Invoice).where(
            Invoice.tenant_id == tenant_id,
            Invoice.is_deleted == False
        )
        if status_filter:
            query = query.where(Invoice.status == status_filter)

        count_q = select(func.count()).select_from(query.subquery())
        total = (await self.session.execute(count_q)).scalar() or 0

        query = query.order_by(Invoice.invoice_date.desc()).offset((page - 1) * page_size).limit(page_size)
        res = await self.session.execute(query)
        return res.scalars().all(), total

    async def add_payment(self, payment: InvoicePayment, invoice: Invoice) -> Invoice:
        self.session.add(payment)
        self.session.add(invoice)
        await self.session.flush()
        return invoice
