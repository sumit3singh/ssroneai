"""
The ssrone – Finance Module Pydantic v2 Schemas
Validation schemas for Chart of Accounts, Journal Entries, and P&L/GST Summaries.
"""
from datetime import date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChartOfAccountCreate(BaseModel):
    account_code: str = Field(..., max_length=20)
    account_name: str = Field(..., max_length=200)
    account_type: str = Field(..., max_length=30)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True
    current_balance: Decimal = Decimal("0.00")


class ChartOfAccountResponse(ChartOfAccountCreate):
    id: int
    tenant_id: int
    is_system: bool

    class Config:
        from_attributes = True


class JournalEntryLine(BaseModel):
    account_id: int
    account_code: str
    account_name: str
    debit: Decimal = Decimal("0.00")
    credit: Decimal = Decimal("0.00")
    description: Optional[str] = None


class JournalEntryCreate(BaseModel):
    entry_number: str = Field(..., max_length=50)
    entry_date: date
    description: str = Field(..., max_length=500)
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    lines: List[JournalEntryLine] = []


class JournalEntryResponse(JournalEntryCreate):
    id: int
    tenant_id: int
    total_debit: Decimal
    total_credit: Decimal
    is_posted: bool

    class Config:
        from_attributes = True


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
