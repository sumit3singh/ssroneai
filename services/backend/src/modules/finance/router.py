"""
The ssrone – Finance Module Controller Router
Chart of accounts, journal entries, bank reconciliation, GST returns, budgets, financial years, and corporate invoicing.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.billing.models import Invoice, InvoiceItem, InvoicePayment, InvoiceStatus, InvoiceType
from src.modules.finance.models import BudgetEntry, ChartOfAccounts, FinancialYear, JournalEntry
from src.modules.finance.schemas import GSTSummaryResponse, PLSummaryResponse
from src.modules.finance.services import finance_service
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/pl-summary", response_model=PLSummaryResponse)
async def get_pl_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PLSummaryResponse:
    """Profit & Loss summary for a given month."""
    return await finance_service.calculate_pl_summary(month, year)


@router.get("/gst-summary", response_model=GSTSummaryResponse)
async def get_gst_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> GSTSummaryResponse:
    """GST return summary for GSTR-1 / GSTR-3B preparation."""
    return await finance_service.calculate_gst_summary(month, year)


@router.get("/chart-of-accounts")
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """List chart of accounts for the tenant directly from PostgreSQL."""
    tenant_id = current_user.tenant_id
    return await finance_service.get_accounts(db, tenant_id)


# ─── Financial Years Master ───────────────────────────────────

class FinancialYearCreateSchema(BaseModel):
    name: str
    code: str
    start_date: date
    end_date: date
    is_active: bool = True


@router.get("/financial-years")
async def list_financial_years(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(FinancialYear)
        .where(FinancialYear.tenant_id == tenant_id, FinancialYear.is_deleted == False)
        .order_by(FinancialYear.start_date.desc())
    )
    fys = res.scalars().all()
    return [
        {
            "id": fy.id,
            "name": fy.name,
            "code": fy.code,
            "start_date": fy.start_date.isoformat() if fy.start_date else None,
            "end_date": fy.end_date.isoformat() if fy.end_date else None,
            "is_active": fy.is_active,
        }
        for fy in fys
    ]


@router.post("/financial-years", status_code=status.HTTP_201_CREATED)
async def create_financial_year(
    body: FinancialYearCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    fy = FinancialYear(
        tenant_id=tenant_id,
        name=body.name.strip(),
        code=body.code.strip().upper(),
        start_date=body.start_date,
        end_date=body.end_date,
        is_active=body.is_active,
    )
    db.add(fy)
    await db.commit()
    await db.refresh(fy)
    return {"message": "Financial year created successfully", "id": fy.id}


@router.delete("/financial-years/{fy_id}")
async def delete_financial_year(
    fy_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(FinancialYear).where(FinancialYear.id == fy_id, FinancialYear.tenant_id == tenant_id))
    fy = res.scalar_one_or_none()
    if not fy:
        raise HTTPException(status_code=404, detail="Financial year not found")
    fy.is_deleted = True
    await db.commit()
    return {"message": "Financial year deleted"}


# ─── Journal Entries Vouchers ─────────────────────────────────

class JournalLineSchema(BaseModel):
    account_code: str
    account_name: str
    debit: float = 0.0
    credit: float = 0.0
    description: str | None = None


class JournalEntryCreateSchema(BaseModel):
    entry_date: date
    description: str
    reference_type: str | None = "MANUAL"
    reference_id: str | None = None
    lines: list[JournalLineSchema]


@router.get("/journal-entries")
async def list_journal_entries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.tenant_id == tenant_id, JournalEntry.is_deleted == False)
        .order_by(JournalEntry.entry_date.desc(), JournalEntry.id.desc())
        .limit(100)
    )
    entries = res.scalars().all()
    return [
        {
            "id": je.id,
            "entry_number": je.entry_number,
            "entry_date": je.entry_date.isoformat(),
            "description": je.description,
            "reference_type": je.reference_type,
            "reference_id": je.reference_id,
            "total_debit": float(je.total_debit),
            "total_credit": float(je.total_credit),
            "is_posted": je.is_posted,
            "lines": je.lines or [],
        }
        for je in entries
    ]


@router.post("/journal-entries", status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    body: JournalEntryCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    tot_debit = sum(line.debit for line in body.lines)
    tot_credit = sum(line.credit for line in body.lines)

    if round(tot_debit, 2) != round(tot_credit, 2):
        raise HTTPException(
            status_code=400,
            detail=f"Double entry unbalanced: Total Debit (₹{tot_debit}) must equal Total Credit (₹{tot_credit})"
        )

    import time
    entry_num = f"JV-{int(time.time()) % 1000000:06d}"

    je = JournalEntry(
        tenant_id=tenant_id,
        entry_number=entry_num,
        entry_date=body.entry_date,
        description=body.description.strip(),
        reference_type=body.reference_type or "MANUAL",
        reference_id=body.reference_id,
        total_debit=Decimal(str(tot_debit)),
        total_credit=Decimal(str(tot_credit)),
        is_posted=True,
        lines=[line.model_dump() for line in body.lines],
    )
    db.add(je)
    await db.commit()
    await db.refresh(je)
    return {"message": "Journal entry voucher posted successfully", "id": je.id, "entry_number": entry_num}


# ─── Monthly Budget Entries ───────────────────────────────────

class BudgetEntryCreateSchema(BaseModel):
    account_id: int
    fiscal_year: str
    month: int
    budgeted_amount: float
    branch_id: int | None = 1


@router.get("/budgets")
async def list_budgets(
    fiscal_year: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    query = (
        select(BudgetEntry, ChartOfAccounts.account_name, ChartOfAccounts.account_code)
        .outerjoin(ChartOfAccounts, BudgetEntry.account_id == ChartOfAccounts.id)
        .where(BudgetEntry.tenant_id == tenant_id, BudgetEntry.is_deleted == False)
    )
    if fiscal_year:
        query = query.where(BudgetEntry.fiscal_year == fiscal_year)
    res = await db.execute(query.order_by(BudgetEntry.month.asc()))
    rows = res.all()
    return [
        {
            "id": b.id,
            "account_id": b.account_id,
            "account_name": acc_name or f"Account #{b.account_id}",
            "account_code": acc_code or "",
            "fiscal_year": b.fiscal_year,
            "month": b.month,
            "budgeted_amount": float(b.budgeted_amount),
            "actual_amount": float(b.actual_amount),
            "variance": float(b.variance),
        }
        for b, acc_name, acc_code in rows
    ]


@router.post("/budgets", status_code=status.HTTP_201_CREATED)
async def create_budget_entry(
    body: BudgetEntryCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    b = BudgetEntry(
        tenant_id=tenant_id,
        branch_id=body.branch_id or 1,
        account_id=body.account_id,
        fiscal_year=body.fiscal_year,
        month=body.month,
        budgeted_amount=Decimal(str(body.budgeted_amount)),
        actual_amount=Decimal("0.0"),
        variance=Decimal(str(body.budgeted_amount)),
    )
    db.add(b)
    await db.commit()
    await db.refresh(b)
    return {"message": "Budget allocation recorded successfully", "id": b.id}


@router.delete("/budgets/{budget_id}")
async def delete_budget_entry(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(BudgetEntry).where(BudgetEntry.id == budget_id, BudgetEntry.tenant_id == tenant_id))
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Budget entry not found")
    b.is_deleted = True
    await db.commit()
    return {"message": "Budget allocation removed"}


# ─── Corporate Invoicing & Billing ────────────────────────────

class InvoiceItemCreateSchema(BaseModel):
    item_name: str
    quantity: float = 1.0
    unit_price: float
    tax_rate: float = 18.0


class CorporateInvoiceCreateSchema(BaseModel):
    customer_name: str
    customer_gstin: str | None = None
    invoice_date: date
    due_date: date | None = None
    notes: str | None = None
    items: list[InvoiceItemCreateSchema]


class RecordInvoicePaymentSchema(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = "Bank Transfer"
    reference_number: str | None = None
    notes: str | None = None


@router.get("/invoices")
async def list_corporate_invoices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(Invoice)
        .where(Invoice.tenant_id == tenant_id, Invoice.is_deleted == False)
        .options(selectinload(Invoice.items), selectinload(Invoice.payments))
        .order_by(Invoice.invoice_date.desc(), Invoice.id.desc())
        .limit(100)
    )
    invoices = res.scalars().all()
    out = []
    for inv in invoices:
        out.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_name": inv.customer_name,
            "customer_gstin": inv.customer_gstin,
            "invoice_date": inv.invoice_date.isoformat(),
            "due_date": inv.due_date.isoformat() if inv.due_date else None,
            "status": inv.status,
            "subtotal": float(inv.subtotal),
            "total_tax": float(inv.total_tax),
            "grand_total": float(inv.grand_total),
            "amount_paid": float(inv.amount_paid),
            "balance_due": float(inv.balance_due),
            "items_count": len(inv.items),
            "payments_count": len(inv.payments),
        })
    return out


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def create_corporate_invoice(
    body: CorporateInvoiceCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    if not body.items:
        raise HTTPException(status_code=400, detail="Invoice must contain at least one line item")

    import time
    inv_num = f"INV-{int(time.time()) % 1000000:06d}"

    subtotal = Decimal("0.0")
    total_tax = Decimal("0.0")

    invoice = Invoice(
        tenant_id=tenant_id,
        branch_id=1,
        invoice_number=inv_num,
        customer_name=body.customer_name.strip(),
        customer_gstin=body.customer_gstin.strip().upper() if body.customer_gstin else None,
        invoice_date=body.invoice_date,
        due_date=body.due_date,
        status=InvoiceStatus.ISSUED if hasattr(InvoiceStatus, "ISSUED") else "issued",
        notes=body.notes,
        created_by=current_user.id,
    )
    db.add(invoice)
    await db.flush()

    for item in body.items:
        qty = Decimal(str(item.quantity))
        price = Decimal(str(item.unit_price))
        line_sub = qty * price
        line_tax = line_sub * (Decimal(str(item.tax_rate)) / Decimal("100.0"))

        subtotal += line_sub
        total_tax += line_tax

        inv_item = InvoiceItem(
            tenant_id=tenant_id,
            invoice_id=invoice.id,
            item_id=1,
            item_name=item.item_name.strip(),
            quantity=qty,
            unit_price=price,
            discount_amount=Decimal("0.0"),
            tax_rate=Decimal(str(item.tax_rate)),
            tax_amount=line_tax,
            line_total=line_sub + line_tax,
        )
        db.add(inv_item)

    grand_total = subtotal + total_tax
    invoice.subtotal = subtotal
    invoice.taxable_amount = subtotal
    invoice.total_tax = total_tax
    invoice.grand_total = grand_total
    invoice.amount_paid = Decimal("0.0")
    invoice.balance_due = grand_total

    await db.commit()
    await db.refresh(invoice)
    return {
        "message": "Corporate invoice created successfully",
        "id": invoice.id,
        "invoice_number": inv_num,
        "grand_total": float(grand_total),
    }


@router.post("/invoices/{invoice_id}/payment", status_code=status.HTTP_201_CREATED)
async def record_corporate_invoice_payment(
    invoice_id: int,
    body: RecordInvoicePaymentSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == tenant_id))
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    pay_amt = Decimal(str(body.amount))
    payment = InvoicePayment(
        tenant_id=tenant_id,
        invoice_id=inv.id,
        payment_date=date.today(),
        amount=pay_amt,
        payment_method=body.payment_method,
        reference_number=body.reference_number,
        notes=body.notes,
        created_by=current_user.id,
    )
    db.add(payment)

    inv.amount_paid += pay_amt
    inv.balance_due = max(Decimal("0.0"), inv.grand_total - inv.amount_paid)
    if inv.balance_due <= 0:
        inv.status = InvoiceStatus.PAID if hasattr(InvoiceStatus, "PAID") else "paid"
    else:
        inv.status = InvoiceStatus.PARTIALLY_PAID if hasattr(InvoiceStatus, "PARTIALLY_PAID") else "partially_paid"

    await db.commit()
    return {"message": "Payment recorded successfully", "balance_due": float(inv.balance_due)}
