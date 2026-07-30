"""
The Baithak – PG Management Module
Bed/room allocations, monthly rent, utilities, visitor logs, resident onboarding.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class BedStatus(StrEnum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"


class RentStatus(StrEnum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    OVERDUE = "overdue"
    WAIVED = "waived"


class PGFloor(TenantBaseModel):
    __tablename__ = "pg_floors"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    floor_number: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    gender_type: Mapped[str] = mapped_column(String(10), default="any")  # male, female, any


class PGRoom(TenantBaseModel):
    __tablename__ = "pg_rooms"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    floor_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_floors.id"))
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    room_type: Mapped[str] = mapped_column(String(30), default="sharing")  # single, double, triple, sharing
    capacity: Mapped[int] = mapped_column(Integer, default=1)
    amenities: Mapped[list] = mapped_column(JSONB, default=list)
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    security_deposit: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    is_ac: Mapped[bool] = mapped_column(Boolean, default=False)
    is_attached_bath: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    beds: Mapped[list["PGBed"]] = relationship("PGBed", back_populates="room")


class PGBed(TenantBaseModel):
    __tablename__ = "pg_beds"
    room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_rooms.id"))
    bed_number: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=BedStatus.AVAILABLE)
    monthly_rent: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    room: Mapped["PGRoom"] = relationship("PGRoom", back_populates="beds")


class PGResident(TenantBaseModel):
    __tablename__ = "pg_residents"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    bed_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_beds.id"))
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    emergency_contact: Mapped[dict] = mapped_column(JSONB, default=dict)
    id_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    id_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    id_document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employer: Mapped[str | None] = mapped_column(String(200), nullable=True)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    security_deposit_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    billing_day: Mapped[int] = mapped_column(Integer, default=1)  # Day of month rent is due
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rent_records: Mapped[list["PGRentRecord"]] = relationship("PGRentRecord", back_populates="resident")


class PGRentRecord(TenantBaseModel):
    __tablename__ = "pg_rent_records"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    resident_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_residents.id"))
    billing_month: Mapped[str] = mapped_column(String(7), nullable=False)  # "2026-06"
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    rent_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    utility_charges: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    other_charges: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total_due: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    balance: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default=RentStatus.PENDING)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    receipt_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    resident: Mapped["PGResident"] = relationship("PGResident", back_populates="rent_records")


class PGVisitorLog(TenantBaseModel):
    __tablename__ = "pg_visitor_logs"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    resident_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_residents.id"))
    visitor_name: Mapped[str] = mapped_column(String(200), nullable=False)
    visitor_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    relation: Mapped[str | None] = mapped_column(String(50), nullable=True)
    id_proof: Mapped[str | None] = mapped_column(String(100), nullable=True)
    check_in_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    check_out_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    purpose: Mapped[str | None] = mapped_column(String(300), nullable=True)
    approved_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
