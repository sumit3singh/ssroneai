"""
The ssrone – Finance Module Models
Data models for Chart of Accounts, Journal Entries, and Budget Entries.
"""
from datetime import date
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.models import TenantBaseModel


class AccountType(StrEnum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    REVENUE = "revenue"
    EXPENSE = "expense"


class ChartOfAccounts(TenantBaseModel):
    """General ledger accounts master."""
    __tablename__ = "chart_of_accounts"
    __table_args__ = (
        UniqueConstraint("tenant_id", "account_code", name="uq_tenant_account_code"),
        {"extend_existing": True},
    )

    account_code: Mapped[str] = mapped_column(String(20), nullable=False)
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_type: Mapped[str] = mapped_column(String(30), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("chart_of_accounts.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.0)


class JournalEntry(TenantBaseModel):
    """Financial journal vouchers transaction."""
    __tablename__ = "journal_entries"
    __table_args__ = (
        UniqueConstraint("tenant_id", "entry_number", name="uq_tenant_journal_entry"),
        {"extend_existing": True},
    )

    entry_number: Mapped[str] = mapped_column(String(50), nullable=False)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_debit: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.0)
    total_credit: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.0)
    is_posted: Mapped[bool] = mapped_column(Boolean, default=False)
    lines: Mapped[list] = mapped_column(JSONB, default=list)


class BudgetEntry(TenantBaseModel):
    """Monthly budget entries master."""
    __tablename__ = "budget_entries"
    __table_args__ = (
        UniqueConstraint("tenant_id", "branch_id", "account_id", "fiscal_year", "month", name="uq_tenant_budget"),
        {"extend_existing": True},
    )

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    account_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    fiscal_year: Mapped[str] = mapped_column(String(9), nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    budgeted_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    actual_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.0)
    variance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0.0)


class FinancialYear(TenantBaseModel):
    """Financial year master definition."""
    __tablename__ = "financial_years"
    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_tenant_financial_year_code"),
        {"extend_existing": True},
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)

