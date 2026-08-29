"""
The ssrone – Hotel PMS Module
Room management, reservations, check-in/out, folios, dynamic rates.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class RoomStatus(StrEnum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    CHECKED_OUT = "checked_out"
    MAINTENANCE = "maintenance"
    CLEANING = "cleaning"
    BLOCKED = "blocked"
    OUT_OF_ORDER = "out_of_order"


class ReservationStatus(StrEnum):
    INQUIRY = "inquiry"
    TENTATIVE = "tentative"
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    NO_SHOW = "no_show"
    CANCELLED = "cancelled"


class RoomType(TenantBaseModel):
    """Room category (Standard, Deluxe, Suite, etc.)."""
    __tablename__ = "room_types"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_occupancy: Mapped[int] = mapped_column(Integer, default=2)
    base_rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    amenities: Mapped[list] = mapped_column(JSONB, default=list)
    images: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="room_type")


class Guest(TenantBaseModel):
    """Hotel guest profile for reservations and check-in."""
    __tablename__ = "hotel_guests"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    id_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    id_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class Room(TenantBaseModel):
    """Physical room/unit."""
    __tablename__ = "hotel_rooms"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    room_type_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("room_types.id"), nullable=False
    )
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    floor: Mapped[str | None] = mapped_column(String(10), nullable=True)
    building: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default=RoomStatus.AVAILABLE, index=True)
    is_smoking: Mapped[bool] = mapped_column(Boolean, default=False)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_cleaned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)

    room_type: Mapped["RoomType"] = relationship("RoomType", back_populates="rooms")
    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="room")


class Reservation(TenantBaseModel):
    """Hotel booking/reservation."""
    __tablename__ = "hotel_reservations"

    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    reservation_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    room_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("hotel_rooms.id"), nullable=False
    )
    primary_guest_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    room_type_id: Mapped[int] = mapped_column(BigInteger, nullable=False)

    check_in_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    actual_check_in: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, default=1)
    children: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(String(30), default=ReservationStatus.CONFIRMED, index=True)
    source: Mapped[str] = mapped_column(String(30), default="direct")  # direct, ota, walk_in

    rate_per_night: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_room_charges: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total_extras: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    advance_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)

    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    extras: Mapped[list] = mapped_column(JSONB, default=list)

    room: Mapped["Room"] = relationship("Room", back_populates="reservations")
