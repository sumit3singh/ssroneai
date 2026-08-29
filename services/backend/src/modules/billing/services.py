"""
Service-Repository Layer: BillingService
Encapsulates business calculations, payment processing, and event dispatch for billing.
"""
from datetime import date
from decimal import Decimal
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.event_bus.bus import event_bus, payment_received_event
from src.modules.billing.models import Invoice, InvoicePayment
from src.modules.billing.repository import BillingRepository


class BillingService:
    """Business service for handling invoice management and payments."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = BillingRepository(session)

    async def list_invoices(
        self,
        tenant_id: int,
        status_filter: str | None = None,
        page: int = 1,
        page_size: int = 25
    ) -> tuple[Sequence[Invoice], int]:
        return await self.repository.list_invoices(tenant_id, status_filter, page, page_size)

    async def record_payment(
        self,
        tenant_id: int,
        user_id: int,
        invoice_id: int,
        amount: Decimal,
        payment_method: str,
        reference_number: str | None = None
    ) -> Invoice:
        invoice = await self.repository.get_invoice_by_id(tenant_id, invoice_id)
        if not invoice:
            raise ValueError("Invoice not found")

        payment = InvoicePayment(
            tenant_id=tenant_id,
            invoice_id=invoice.id,
            payment_date=date.today(),
            amount=amount,
            payment_method=payment_method,
            reference_number=reference_number,
            created_by=user_id,
        )

        invoice.amount_paid += amount
        invoice.balance_due = invoice.grand_total - invoice.amount_paid
        invoice.status = "paid" if invoice.balance_due <= 0 else "partial"
        invoice.updated_by = user_id

        updated_invoice = await self.repository.add_payment(payment, invoice)

        event = payment_received_event(
            tenant_id=str(tenant_id),
            invoice_id=str(invoice.id),
            amount=float(amount),
        )
        await event_bus.publish(event)

        return updated_invoice
