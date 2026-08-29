"""
The ssrone – Billing Router
Thin FastAPI controller delegating to BillingService and BillingRepository.
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.billing.services import BillingService
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/billing", tags=["Billing"])


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
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
    service = BillingService(db)
    invoices, total = await service.list_invoices(
        tenant_id=current_user.tenant_id,
        status_filter=status_filter,
        page=page,
        page_size=page_size
    )

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
    """Record a payment against an invoice via BillingService."""
    service = BillingService(db)
    try:
        invoice = await service.record_payment(
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            invoice_id=body.invoice_id,
            amount=body.amount,
            payment_method=body.payment_method,
            reference_number=body.reference_number
        )
        return {"message": "Payment recorded", "balance_due": float(invoice.balance_due)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
