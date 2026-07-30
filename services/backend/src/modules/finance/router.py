"""
The Baithak – Finance Module
Chart of accounts, journal entries, bank reconciliation,
GST returns, budgets, and P&L reporting.
"""
from datetime import date
from decimal import Decimal
from enum import StrEnum

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.engine import get_db_session
from src.core.database.models import TenantBaseModel
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/finance", tags=["Finance"])


# ─── Models ──────────────────────────────────────────────────

class AccountType(StrEnum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class ChartOfAccounts(TenantBaseModel):
    __tablename__ = "chart_of_accounts"
    account_code: Mapped[str] = mapped_column(String(20), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_type: Mapped[str] = mapped_column(String(30), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("chart_of_accounts.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)


class JournalEntry(TenantBaseModel):
    __tablename__ = "journal_entries"
    entry_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_debit: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total_credit: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    is_posted: Mapped[bool] = mapped_column(Boolean, default=False)
    lines: Mapped[list] = mapped_column(JSONB, default=list)


class BudgetEntry(TenantBaseModel):
    __tablename__ = "budget_entries"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    account_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    fiscal_year: Mapped[str] = mapped_column(String(9), nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    budgeted_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    actual_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    variance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)


# ─── Schemas ─────────────────────────────────────────────────

class PLSummaryResponse(BaseModel):
    period: str
    revenue: float
    cogs: float
    gross_profit: float
    gross_margin_pct: float
    operating_expenses: float
    net_profit: float
    net_margin_pct: float


class GSTSummaryResponse(BaseModel):
    period: str
    total_sales: float
    taxable_value: float
    cgst_collected: float
    sgst_collected: float
    igst_collected: float
    total_gst_collected: float
    input_tax_credit: float
    net_payable: float


# ─── Routes ──────────────────────────────────────────────────

@router.get("/pl-summary", response_model=PLSummaryResponse)
async def get_pl_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db_session),
) -> PLSummaryResponse:
    """Profit & Loss summary for a given month."""
    # In production: aggregate from journal entries / billing data
    # Returning mock data for now
    revenue = 530000.0
    cogs = 212000.0
    gross_profit = revenue - cogs
    op_exp = 148000.0
    net = gross_profit - op_exp
    return PLSummaryResponse(
        period=f"{year}-{month:02d}",
        revenue=revenue,
        cogs=cogs,
        gross_profit=gross_profit,
        gross_margin_pct=round(gross_profit / revenue * 100, 1),
        operating_expenses=op_exp,
        net_profit=net,
        net_margin_pct=round(net / revenue * 100, 1),
    )


@router.get("/gst-summary", response_model=GSTSummaryResponse)
async def get_gst_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db_session),
) -> GSTSummaryResponse:
    """GST return summary for GSTR-1 / GSTR-3B preparation."""
    total_sales = 530000.0
    taxable = 449153.0
    cgst = 40424.0
    sgst = 40424.0
    igst = 0.0
    total_gst = cgst + sgst + igst
    itc = 28500.0
    return GSTSummaryResponse(
        period=f"{year}-{month:02d}",
        total_sales=total_sales,
        taxable_value=taxable,
        cgst_collected=cgst,
        sgst_collected=sgst,
        igst_collected=igst,
        total_gst_collected=total_gst,
        input_tax_credit=itc,
        net_payable=round(total_gst - itc, 2),
    )


@router.get("/chart-of-accounts")
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db_session),
) -> list[dict]:
    """List chart of accounts for the tenant."""
    from sqlalchemy import select
    result = await db.execute(
        select(ChartOfAccounts).where(
            ChartOfAccounts.tenant_id == current_user.tenant_id,
            ChartOfAccounts.is_deleted == False,
        ).order_by(ChartOfAccounts.account_code)
    )
    accounts = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "code": a.account_code,
            "name": a.account_name,
            "type": a.account_type,
            "balance": float(a.current_balance),
        }
        for a in accounts
    ]
