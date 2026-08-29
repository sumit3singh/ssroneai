"""
The ssrone – PG Management Module Models
Strictly mapped to PostgreSQL DDL: pg_floors, pg_rooms, pg_beds, pg_residents, pg_rent_records, pg_visitor_logs.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class BedStatus(StrEnum):
    VACANT = "VACANT"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"
    RESERVED = "RESERVED"


class RentStatus(StrEnum):
    UNPAID = "UNPAID"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    OVERDUE = "OVERDUE"


class ResidentStatus(StrEnum):
    ACTIVE = "ACTIVE"
    NOTICE = "NOTICE"
    INACTIVE = "INACTIVE"


class PGFloor(TenantBaseModel):
    __tablename__ = "pg_floors"
    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    floor_name: Mapped[str] = mapped_column(String(50), nullable=False)
    rooms: Mapped[list["PGRoom"]] = relationship("PGRoom", back_populates="floor")


class PGRoom(TenantBaseModel):
    __tablename__ = "pg_rooms"
    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    floor_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("pg_floors.id", ondelete="SET NULL"), nullable=True)
    room_number: Mapped[str] = mapped_column(String(20), nullable=False)
    sharing_type: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    floor: Mapped["PGFloor | None"] = relationship("PGFloor", back_populates="rooms")
    beds: Mapped[list["PGBed"]] = relationship("PGBed", back_populates="room")


class PGBed(TenantBaseModel):
    __tablename__ = "pg_beds"
    room_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("pg_rooms.id", ondelete="CASCADE"), nullable=True)
    bed_number: Mapped[str] = mapped_column(String(20), nullable=False)
    monthly_rent: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="VACANT", nullable=False)
    version: Mapped[int] = mapped_column(BigInteger, default=1, nullable=False)
    room: Mapped["PGRoom | None"] = relationship("PGRoom", back_populates="beds")
    residents: Mapped[list["PGResident"]] = relationship("PGResident", back_populates="bed")


class PGResident(TenantBaseModel):
    __tablename__ = "pg_residents"
    bed_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("pg_beds.id", ondelete="SET NULL"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    id_proof_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    joining_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    version: Mapped[int] = mapped_column(BigInteger, default=1, nullable=False)
    bed: Mapped["PGBed | None"] = relationship("PGBed", back_populates="residents")
    rent_records: Mapped[list["PGRentRecord"]] = relationship("PGRentRecord", back_populates="resident")


class PGRentRecord(TenantBaseModel):
    __tablename__ = "pg_rent_records"
    resident_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pg_residents.id", ondelete="CASCADE"), nullable=False)
    rent_month: Mapped[str] = mapped_column(String(7), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="UNPAID", nullable=False)
    resident: Mapped["PGResident"] = relationship("PGResident", back_populates="rent_records")


class PGVisitorLog(TenantBaseModel):
    __tablename__ = "pg_visitor_logs"
    resident_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("pg_residents.id", ondelete="SET NULL"), nullable=True)
    visitor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    visitor_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    check_in_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    check_out_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
