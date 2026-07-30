"""
SQLAlchemy ORM Business Models
Data models for Restaurant/POS, Hotel PMS, Inventory, Finance, CRM, HRMS, and PG Management.
"""
from datetime import date, datetime
from typing import Optional
from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.models import TenantBaseModel


class MenuItemModel(TenantBaseModel):
    """Restaurant / POS Menu Items Master."""
    __tablename__ = "menu_items"
    __table_args__ = (
        UniqueConstraint("tenant_id", "item_code", name="uq_tenant_item_code"),
        {"extend_existing": True},
    )

    category_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    item_code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    cost_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=5.0, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class POSOrderModel(TenantBaseModel):
    """POS Orders Transaction."""
    __tablename__ = "pos_orders"
    __table_args__ = (
        UniqueConstraint("tenant_id", "order_number", name="uq_tenant_pos_order"),
        {"extend_existing": True},
    )

    order_number: Mapped[str] = mapped_column(String(50), nullable=False)
    table_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    order_type: Mapped[str] = mapped_column(String(50), default="DINE_IN", nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="UNPAID", nullable=False)
    customer_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    customer_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)


class HotelRoomModel(TenantBaseModel):
    """Hotel Rooms Master."""
    __tablename__ = "hotel_rooms"
    __table_args__ = (
        UniqueConstraint("tenant_id", "room_number", name="uq_tenant_room_no"),
        {"extend_existing": True},
    )

    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    room_type: Mapped[str] = mapped_column(String(50), nullable=False)
    rate_per_night: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="VACANT", nullable=False)
    floor_number: Mapped[int] = mapped_column(Integer, default=1)


class HotelReservationModel(TenantBaseModel):
    """Hotel Reservation Transaction."""
    __tablename__ = "hotel_reservations"
    __table_args__ = (
        UniqueConstraint("tenant_id", "reservation_code", name="uq_tenant_reservation"),
        {"extend_existing": True},
    )

    reservation_code: Mapped[str] = mapped_column(String(50), nullable=False)
    room_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    guest_name: Mapped[str] = mapped_column(String(150), nullable=False)
    guest_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    guest_email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_nights: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="CONFIRMED", nullable=False)


class InventoryItemModel(TenantBaseModel):
    """Inventory Items Master."""
    __tablename__ = "inventory_items"
    __table_args__ = (
        UniqueConstraint("tenant_id", "sku", name="uq_tenant_sku"),
        {"extend_existing": True},
    )

    sku: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    unit: Mapped[str] = mapped_column(String(20), default="PCS", nullable=False)
    current_stock: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0, nullable=False)
    min_stock_level: Mapped[float] = mapped_column(Numeric(12, 3), default=10.0, nullable=False)
    unit_cost: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)


class InvoiceModel(TenantBaseModel):
    """Finance Invoices Transaction."""
    __tablename__ = "invoices"
    __table_args__ = (
        UniqueConstraint("tenant_id", "invoice_number", name="uq_tenant_invoice"),
        {"extend_existing": True},
    )

    invoice_number: Mapped[str] = mapped_column(String(50), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="UNPAID", nullable=False)


class CustomerModel(TenantBaseModel):
    """CRM Customers Master."""
    __tablename__ = "customers"
    __table_args__ = ({"extend_existing": True},)

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    total_orders: Mapped[int] = mapped_column(Integer, default=0)
    total_spent: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)


class EmployeeModel(TenantBaseModel):
    """HRMS Employees Master."""
    __tablename__ = "employees"
    __table_args__ = (
        UniqueConstraint("tenant_id", "employee_code", name="uq_tenant_emp_code"),
        {"extend_existing": True},
    )

    employee_code: Mapped[str] = mapped_column(String(50), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    designation: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    basic_salary: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)


class PGBedModel(TenantBaseModel):
    """PG Management Beds Master."""
    __tablename__ = "pg_beds"
    __table_args__ = ({"extend_existing": True},)

    property_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    bed_number: Mapped[str] = mapped_column(String(20), nullable=False)
    monthly_rent: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="VACANT", nullable=False)
