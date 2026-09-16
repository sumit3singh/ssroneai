"""
The ssrone – Orders & KOT Models
Full order lifecycle: creation, hold, void, split, KOT station routing, billing, status logs.
"""
from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import (
    BigInteger, ForeignKey, Integer, Numeric, String, Text, Boolean, DateTime, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel, BaseModel


class OrderStatus(StrEnum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    KOT_SENT = "kot_sent"
    IN_KITCHEN = "in_kitchen"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class OrderType(StrEnum):
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"
    ROOM_SERVICE = "room_service"
    BANQUET = "banquet"
    ONLINE = "online"


class PaymentStatus(StrEnum):
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"
    REFUNDED = "refunded"


class DiningTable(TenantBaseModel):
    """Physical dining table in a branch."""
    __tablename__ = "dining_tables"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    table_number: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=4)
    status: Mapped[str] = mapped_column(String(20), default="free")  # free, occupied, reserved, cleaning
    section: Mapped[str | None] = mapped_column(String(50), nullable=True)
    floor: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    position_x: Mapped[int] = mapped_column(Integer, default=0)
    position_y: Mapped[int] = mapped_column(Integer, default=0)
    current_order_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        UniqueConstraint("tenant_id", "branch_id", "table_number", name="uq_dining_table"),
    )


class KitchenStation(TenantBaseModel):
    """Kitchen station for routing KOT items (Main, Tandoor, Chinese, Beverages)."""
    __tablename__ = "kitchen_stations"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    printer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    station_type: Mapped[str] = mapped_column(String(50), default="main")
    categories: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    kots: Mapped[list["KOT"]] = relationship("KOT", back_populates="station")


class Order(TenantBaseModel):
    """Master order record."""
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    token_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    branch_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("branches.id"), nullable=False, index=True)
    customer_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    table_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("dining_tables.id", ondelete="SET NULL"), nullable=True, index=True)
    waiter_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)

    guest_count: Mapped[int] = mapped_column(Integer, default=1)
    order_type: Mapped[str] = mapped_column(String(30), default=OrderType.DINE_IN)
    status: Mapped[str] = mapped_column(String(30), default=OrderStatus.DRAFT, index=True)
    payment_status: Mapped[str] = mapped_column(String(20), default=PaymentStatus.UNPAID)
    is_held: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_order_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)

    # Financial Summary
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    taxable_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    cgst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    sgst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    igst_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total_tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    # Timestamps & Meta
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    special_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_channel: Mapped[str] = mapped_column(String(30), default="pos")
    external_order_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    metadata_payload: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    
    held_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    kot_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ready_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    served_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_orders_tenant_branch_status", "tenant_id", "branch_id", "status"),
        Index("ix_orders_tenant_branch_created", "tenant_id", "branch_id", "created_at"),
    )

    # Relationships
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
    payments: Mapped[list["OrderPayment"]] = relationship(
        "OrderPayment", back_populates="order"
    )
    kots: Mapped[list["KOT"]] = relationship(
        "KOT", back_populates="order", cascade="all, delete-orphan"
    )
    status_logs: Mapped[list["OrderStatusLog"]] = relationship(
        "OrderStatusLog", back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(TenantBaseModel):
    """Individual line item on an order."""
    __tablename__ = "order_items"

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id"), nullable=False, index=True)
    menu_item_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True)
    product_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    product_name: Mapped[str] = mapped_column(String(300), nullable=False)
    item_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    product_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    variant_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    variant_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    unit_of_measure: Mapped[str] = mapped_column(String(20), default="pcs")

    @property
    def name(self) -> str:
        return self.item_name or self.product_name or "Item"
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    mrp: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    # Kitchen & Modifications
    kot_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    kds_status: Mapped[str] = mapped_column(String(20), default="pending")
    kds_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    kds_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    course: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preparation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    selected_variants: Mapped[list] = mapped_column(JSONB, default=list)
    selected_addons: Mapped[list] = mapped_column(JSONB, default=list)
    modifiers: Mapped[list] = mapped_column(JSONB, default=list)
    tax_breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Voiding
    is_voided: Mapped[bool] = mapped_column(Boolean, default=False)
    void_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    voided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    voided_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")


class OrderPayment(TenantBaseModel):
    """Payment transaction against an order."""
    __tablename__ = "order_payments"

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id"), nullable=False, index=True)
    payment_mode: Mapped[str] = mapped_column(String(50), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="success")
    transaction_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)

    @property
    def payment_method(self) -> str:
        return self.payment_mode

    @property
    def reference_number(self) -> str | None:
        return self.transaction_reference

    order: Mapped["Order"] = relationship("Order", back_populates="payments")


class KOT(TenantBaseModel):
    """Kitchen Order Ticket header."""
    __tablename__ = "kots"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    kot_number: Mapped[str] = mapped_column(String(30), nullable=False)
    station_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("kitchen_stations.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, printed, preparing, ready, cancelled
    printed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    order: Mapped[Order] = relationship("Order", back_populates="kots")
    station: Mapped[KitchenStation | None] = relationship("KitchenStation", back_populates="kots")
    items: Mapped[list["KOTItem"]] = relationship("KOTItem", back_populates="kot", cascade="all, delete-orphan")


class KOTItem(BaseModel):
    """Kitchen Order Ticket line item."""
    __tablename__ = "kot_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    kot_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("kots.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    kot: Mapped[KOT] = relationship("KOT", back_populates="items")


class OrderStatusLog(BaseModel):
    """Audit log tracking order status transitions."""
    __tablename__ = "order_status_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), default="order.status_changed", nullable=False, index=True)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    correlation_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    changed_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)

    order: Mapped[Order] = relationship("Order", back_populates="status_logs")


class KDSOrderTicket(TenantBaseModel):
    """Station-specific KDS production ticket."""
    __tablename__ = "kds_order_tickets"

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    kot_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("kots.id", ondelete="SET NULL"), nullable=True)
    station_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("kitchen_stations.id", ondelete="CASCADE"), nullable=True, index=True)

    ticket_number: Mapped[str] = mapped_column(String(50), nullable=False)
    order_type: Mapped[str] = mapped_column(String(30), default="DINE_IN")  # DINE_IN, TAKEAWAY, DELIVERY
    fulfilment_mode: Mapped[str] = mapped_column(String(30), default="TABLE")

    table_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    table_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    token_number: Mapped[str | None] = mapped_column(String(30), nullable=True)

    status: Mapped[str] = mapped_column(String(30), default="NEW")  # NEW, ACKNOWLEDGED, PREPARING, READY, HELD, RECALLED, CANCELLED
    priority: Mapped[int] = mapped_column(Integer, default=100)
    is_rush: Mapped[bool] = mapped_column(Boolean, default=False)
    sla_seconds: Mapped[int] = mapped_column(Integer, default=600)

    queued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ready_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    items: Mapped[list["KDSTicketItem"]] = relationship("KDSTicketItem", back_populates="ticket", cascade="all, delete-orphan")


class KDSTicketItem(TenantBaseModel):
    """Item-level production state within a KDS ticket."""
    __tablename__ = "kds_ticket_items"

    ticket_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("kds_order_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    order_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("order_items.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("kitchen_stations.id", ondelete="CASCADE"), nullable=True, index=True)

    item_name: Mapped[str] = mapped_column(String(300), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    prepared_quantity: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="QUEUED")  # QUEUED, PREPARING, PARTIAL, READY, CANCELLED

    variant_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    addons: Mapped[list] = mapped_column(JSONB, default=list)
    preparation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    ticket: Mapped[KDSOrderTicket] = relationship("KDSOrderTicket", back_populates="items")


class KDSExpoOrder(TenantBaseModel):
    """Pass / EXPO order consolidation model."""
    __tablename__ = "kds_expo_orders"

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    status: Mapped[str] = mapped_column(String(30), default="WAITING")  # WAITING, PARTIAL, READY, HANDOVER, COMPLETED
    order_type: Mapped[str] = mapped_column(String(30), default="DINE_IN")
    fulfilment_mode: Mapped[str] = mapped_column(String(30), default="TABLE")

    total_items: Mapped[int] = mapped_column(Integer, default=0)
    ready_items: Mapped[int] = mapped_column(Integer, default=0)
    is_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    ready_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)





class KDSPackingOrder(TenantBaseModel):
    """Packing station checklist order model."""
    __tablename__ = "kds_packing_orders"

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    status: Mapped[str] = mapped_column(String(30), default="WAITING")  # WAITING, PACKING, PACKED, CANCELLED
    packing_required: Mapped[bool] = mapped_column(Boolean, default=True)
    checklist: Mapped[list] = mapped_column(JSONB, default=list)
    packed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class DailyOrderSequence(TenantBaseModel):
    """Stores daily incrementing order sequence counter per tenant & branch.
    Format: YYMMDD001, YYMMDD002, YYMMDD003... Resets automatically each day.
    """
    __tablename__ = "daily_order_sequences"

    branch_id: Mapped[int] = mapped_column(BigInteger, default=1, index=True)
    sequence_date: Mapped[str] = mapped_column(String(10), nullable=False)  # 'YYYY-MM-DD'
    last_seq: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint("tenant_id", "branch_id", "sequence_date", name="uq_tenant_branch_date_seq"),
    )


class QueueToken(TenantBaseModel):
    """Queue-Buster: Pre-order cart token generated on mobile QR / kiosk,
    claimed at POS counter terminal.
    """
    __tablename__ = "queue_tokens"

    branch_id: Mapped[int] = mapped_column(BigInteger, default=1, index=True)
    token_code: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    customer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    customer_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    table_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    cart_items: Mapped[list] = mapped_column(JSONB, default=list)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=Decimal("0.00"))
    is_claimed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    claimed_by_order_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)




