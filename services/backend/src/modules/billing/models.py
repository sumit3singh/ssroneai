"""
The ssrone – Billing Module
Invoices, credit notes, receipts, payment tracking, GST returns.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class InvoiceType(StrEnum):
    TAX_INVOICE = "tax_invoice"
    PROFORMA = "proforma"
    CREDIT_NOTE = "credit_note"
    DEBIT_NOTE = "debit_note"
    RECEIPT = "receipt"
    ESTIMATE = "estimate"


class InvoiceStatus(StrEnum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    PARTIAL = "partial"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    WRITTEN_OFF = "written_off"


class Invoice(TenantBaseModel):
    __tablename__ = "invoices"
    __table_args__ = {"extend_existing": True}

    invoice_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    invoice_type: Mapped[str] = mapped_column(String(30), default=InvoiceType.TAX_INVOICE)
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    customer_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    customer_name: Mapped[str] = mapped_column(String(300), nullable=False)
    customer_gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    customer_address: Mapped[dict] = mapped_column(JSONB, default=dict)

    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=InvoiceStatus.DRAFT)

    # Source reference (order, reservation, rent, etc.)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Financials
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    taxable_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    cgst_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    sgst_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    igst_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    cess_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total_tax: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)

    # GST
    supply_type: Mapped[str] = mapped_column(String(20), default="intra_state")
    irn_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    qr_code_data: Mapped[str | None] = mapped_column(Text, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    terms: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["InvoiceItem"]] = relationship(
        "InvoiceItem", back_populates="invoice", cascade="all, delete-orphan"
    )
    payments: Mapped[list["InvoicePayment"]] = relationship("InvoicePayment", back_populates="invoice")


class InvoiceItem(TenantBaseModel):
    __tablename__ = "invoice_items"

    invoice_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("invoices.id"), nullable=False
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    hsn_sac_code: Mapped[str | None] = mapped_column(String(10), nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    taxable_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cgst_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    sgst_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    igst_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    cgst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    sgst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    igst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")


class InvoicePayment(TenantBaseModel):
    __tablename__ = "invoice_payments"

    invoice_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("invoices.id"), nullable=False
    )
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bank_account_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    gateway_response: Mapped[dict] = mapped_column(JSONB, default=dict)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    receipt_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")
