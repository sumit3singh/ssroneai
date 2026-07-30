"""
The Baithak – PG Management Router
Resident onboarding, bed allocation, rent collection.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.core.event_bus.bus import event_bus, rent_past_due_event
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.pg_management.models import (
    BedStatus, PGBed, PGRentRecord, PGResident, PGRoom, RentStatus,
)
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/pg", tags=["PG Management"])


# ─── Schemas ─────────────────────────────────────────────────

class PGRoomCreateSchema(BaseModel):
    branch_id: int
    floor_id: int
    room_number: str
    room_type: str = "sharing"
    capacity: int = 1
    monthly_rent: Decimal = Field(gt=0)
    security_deposit: Decimal = Decimal("0")


class PGResidentCreateSchema(BaseModel):
    branch_id: int
    bed_id: int
    first_name: str
    last_name: str
    phone: str
    email: str | None = None
    check_in_date: date
    monthly_rent: Decimal = Field(gt=0)
    billing_day: int = Field(default=1, ge=1, le=28)


class PGResidentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    monthly_rent: Decimal
    check_in_date: date
    is_active: bool

    model_config = {"from_attributes": True}


class CollectRentSchema(BaseModel):
    rent_record_id: int
    amount: Decimal = Field(gt=0)
    payment_method: str = "cash"


# ─── Residents ───────────────────────────────────────────────

@router.get("/residents")
async def list_residents(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGResidentResponse]:
    query = select(PGResident).where(
        PGResident.tenant_id == current_user.tenant_id,
        PGResident.is_deleted == False,
        PGResident.is_active == True,
    )
    if branch_id:
        query = query.where(PGResident.branch_id == branch_id)
    result = await db.execute(query)
    return [PGResidentResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/residents", response_model=PGResidentResponse, status_code=status.HTTP_201_CREATED)
async def create_resident(
    body: PGResidentCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PGResidentResponse:
    # Verify bed availability
    bed_result = await db.execute(select(PGBed).where(PGBed.id == body.bed_id))
    bed = bed_result.scalar_one_or_none()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    if bed.status != BedStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Bed is not available")

    resident = PGResident(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        bed_id=body.bed_id,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        email=body.email,
        check_in_date=body.check_in_date,
        monthly_rent=body.monthly_rent,
        billing_day=body.billing_day,
        is_active=True,
        created_by=current_user.id,
    )
    db.add(resident)
    bed.status = BedStatus.OCCUPIED
    await db.flush()

    return PGResidentResponse.model_validate(resident)


@router.post("/rent/collect")
async def collect_rent(
    body: CollectRentSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(PGRentRecord).where(
            PGRentRecord.id == body.rent_record_id, PGRentRecord.tenant_id == current_user.tenant_id
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Rent record not found")

    record.amount_paid += body.amount
    record.balance = record.total_due - record.amount_paid
    record.status = RentStatus.PAID if record.balance <= 0 else RentStatus.PARTIAL
    record.payment_method = body.payment_method
    record.paid_at = datetime.now(timezone.utc)
    record.updated_by = current_user.id

    return {"message": "Rent payment recorded", "balance": float(record.balance)}


@router.get("/rent/overdue")
async def overdue_rent(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """List all overdue rent records — surfaces for AI nudges and dashboards."""
    query = select(PGRentRecord).where(
        PGRentRecord.tenant_id == current_user.tenant_id,
        PGRentRecord.status.in_([RentStatus.OVERDUE, RentStatus.PENDING]),
    )
    if branch_id:
        query = query.where(PGRentRecord.branch_id == branch_id)
    result = await db.execute(query)
    records = result.scalars().all()

    total_due = sum(r.balance for r in records)
    return {
        "count": len(records),
        "total_amount_due": float(total_due),
        "records": [
            {
                "id": str(r.id),
                "resident_id": str(r.resident_id),
                "billing_month": r.billing_month,
                "balance": float(r.balance),
                "due_date": str(r.due_date),
            }
            for r in records
        ],
    }


class PGRoomResponse(BaseModel):
    id: int
    branch_id: int
    floor_id: int
    room_number: str
    room_type: str
    capacity: int
    monthly_rent: Decimal
    is_active: bool
    model_config = {"from_attributes": True}


@router.get("/rooms", response_model=list[PGRoomResponse])
async def list_rooms(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGRoomResponse]:
    query = select(PGRoom).where(
        PGRoom.tenant_id == current_user.tenant_id,
        PGRoom.is_deleted == False,
    )
    if branch_id:
        query = query.where(PGRoom.branch_id == branch_id)
    result = await db.execute(query)
    return [PGRoomResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/rooms", response_model=PGRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    body: PGRoomCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PGRoomResponse:
    room = PGRoom(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        floor_id=body.floor_id,
        room_number=body.room_number,
        room_type=body.room_type,
        capacity=body.capacity,
        monthly_rent=body.monthly_rent,
        security_deposit=body.security_deposit,
        created_by=current_user.id,
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return PGRoomResponse.model_validate(room)
