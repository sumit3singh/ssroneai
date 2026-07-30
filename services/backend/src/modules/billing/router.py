"""
The Baithak – Billing Router
Invoice creation and payment recording.
"""
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.core.event_bus.bus import event_bus, payment_received_event
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.billing.models import Invoice, InvoicePayment
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/billing", tags=["Billing"])


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    invoice_date: date
    grand_total: Decimal
    amount_paid: Decimal
    balance_due: Decimal
    status: str

    model_config = {"from_attributes": True}


class RecordPaymentSchema(BaseModel):
    invoice_id: int
    amount: Decimal = Field(gt=0)
    payment_method: str
    reference_number: str | None = None


@router.get("/invoices")
async def list_invoices(
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    query = select(Invoice).where(
        Invoice.tenant_id == current_user.tenant_id, Invoice.is_deleted == False
    )
    if status_filter:
        query = query.where(Invoice.status == status_filter)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Invoice.invoice_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    invoices = result.scalars().all()

    return {
        "items": [InvoiceResponse.model_validate(i) for i in invoices],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def record_payment(
    body: RecordPaymentSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Record a payment against an invoice."""
    result = await db.execute(
        select(Invoice).where(
            Invoice.id == body.invoice_id, Invoice.tenant_id == current_user.tenant_id
        )
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = InvoicePayment(
        tenant_id=current_user.tenant_id,
        invoice_id=invoice.id,
        payment_date=date.today(),
        amount=body.amount,
        payment_method=body.payment_method,
        reference_number=body.reference_number,
        created_by=current_user.id,
    )
    db.add(payment)

    invoice.amount_paid += body.amount
    invoice.balance_due = invoice.grand_total - invoice.amount_paid
    invoice.status = "paid" if invoice.balance_due <= 0 else "partial"
    invoice.updated_by = current_user.id

    await db.flush()

    event = payment_received_event(
        tenant_id=str(current_user.tenant_id),
        invoice_id=str(invoice.id),
        amount=float(body.amount),
    )
    await event_bus.publish(event)

    return {"message": "Payment recorded", "balance_due": float(invoice.balance_due)}
