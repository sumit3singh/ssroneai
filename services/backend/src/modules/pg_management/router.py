"""
The ssrone – PG Management Router
Complete REST API for Floors, Rooms, Beds, Residents, Rent Records, Visitors & Dashboard Analytics.
Strictly 100% PostgreSQL DDL Database SSOT.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user, get_optional_user
from src.modules.auth.models import User
from src.modules.pg_management.models import (
    BedStatus, PGBed, PGFloor, PGRentRecord, PGResident, PGRoom, PGVisitorLog, RentStatus, ResidentStatus
)
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/pg", tags=["PG Management"])
alias_router = APIRouter(prefix="/pg-management", tags=["PG Management Alias"])


# ─── Pydantic Schemas ──────────────────────────────────────────────

class PGFloorCreateSchema(BaseModel):
    branch_id: int | None = 1
    company_id: int | None = 1
    floor_name: str


class PGFloorResponse(BaseModel):
    id: int
    floor_name: str
    branch_id: int | None = None
    company_id: int | None = None
    model_config = {"from_attributes": True}


class PGRoomCreateSchema(BaseModel):
    branch_id: int | None = 1
    company_id: int | None = 1
    floor_id: int | None = None
    room_number: str
    sharing_type: int = Field(default=2, ge=1, le=10)
    monthly_rent: Decimal = Field(default=Decimal("8500.00"), gt=0)


class PGRoomResponse(BaseModel):
    id: int
    branch_id: int | None = None
    company_id: int | None = None
    floor_id: int | None = None
    room_number: str
    sharing_type: int
    model_config = {"from_attributes": True}


class PGBedCreateSchema(BaseModel):
    room_id: int
    bed_number: str
    monthly_rent: Decimal = Field(gt=0)


class PGBedResponse(BaseModel):
    id: int
    room_id: int | None = None
    bed_number: str
    monthly_rent: Decimal
    status: str
    model_config = {"from_attributes": True}


class PGResidentCreateSchema(BaseModel):
    bed_id: int | None = None
    full_name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str
    id_proof_number: str | None = None
    joining_date: date | None = None
    check_in_date: date | None = None
    monthly_rent: Decimal = Field(default=Decimal("8500.00"), gt=0)


class PGResidentResponse(BaseModel):
    id: int
    bed_id: int | None = None
    full_name: str
    phone: str
    id_proof_number: str | None = None
    joining_date: date
    status: str
    model_config = {"from_attributes": True}


class CollectRentSchema(BaseModel):
    resident_id: int
    amount: Decimal = Field(gt=0)
    rent_month: str = Field(default_factory=lambda: date.today().strftime("%Y-%m"))


class PGVisitorLogCreateSchema(BaseModel):
    resident_id: int | None = None
    visitor_name: str
    visitor_phone: str


# ─── Dashboard KPIs Endpoint ──────────────────────────────────────

@router.get("/dashboard")
async def get_pg_dashboard_kpis(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1

    try:
        # 1. Total active residents
        res_stmt = select(func.count(PGResident.id)).where(
            PGResident.tenant_id == tenant_id,
            PGResident.is_deleted == False,
            PGResident.status == ResidentStatus.ACTIVE,
        )
        total_residents = (await db.execute(res_stmt)).scalar() or 0

        # 2. Monthly rent collected & pending dues
        rent_stmt = select(PGRentRecord).where(
            PGRentRecord.tenant_id == tenant_id,
            PGRentRecord.is_deleted == False,
        )
        rent_records = (await db.execute(rent_stmt)).scalars().all()

        rent_collected = sum(r.paid_amount for r in rent_records)
        pending_dues = sum(max(Decimal("0.00"), r.amount - r.paid_amount) for r in rent_records)

        # 3. Rooms count
        room_stmt = select(func.count(PGRoom.id)).where(
            PGRoom.tenant_id == tenant_id,
            PGRoom.is_deleted == False,
        )
        total_rooms = (await db.execute(room_stmt)).scalar() or 0

        # 4. Beds & Occupancy
        bed_stmt = select(PGBed).where(
            PGBed.tenant_id == tenant_id,
            PGBed.is_deleted == False,
        )
        all_beds = (await db.execute(bed_stmt)).scalars().all()
        total_beds = len(all_beds)
        occupied_beds = sum(1 for b in all_beds if b.status == BedStatus.OCCUPIED)
        occupancy_pct = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0.0

        return {
            "total_residents": total_residents,
            "rent_collected": float(rent_collected),
            "pending_dues": float(pending_dues),
            "active_rooms": total_rooms,
            "total_rooms": total_rooms,
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "occupancy_pct": occupancy_pct,
        }
    except Exception as exc:
        logger.error("Failed to calculate PG dashboard KPIs", error=str(exc))
        return {
            "total_residents": 0,
            "rent_collected": 0.0,
            "pending_dues": 0.0,
            "active_rooms": 0,
            "total_rooms": 0,
            "total_beds": 0,
            "occupied_beds": 0,
            "occupancy_pct": 0.0,
        }


# ─── Floors Endpoints ─────────────────────────────────────────────

@router.get("/floors", response_model=list[PGFloorResponse])
async def list_floors(
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGFloorResponse]:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(select(PGFloor).where(PGFloor.tenant_id == tenant_id, PGFloor.is_deleted == False))
    return [PGFloorResponse.model_validate(f) for f in result.scalars().all()]


@router.post("/floors", response_model=PGFloorResponse, status_code=status.HTTP_201_CREATED)
async def create_floor(
    body: PGFloorCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PGFloorResponse:
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    floor = PGFloor(
        tenant_id=tenant_id,
        branch_id=body.branch_id,
        company_id=body.company_id,
        floor_name=body.floor_name,
        created_by=user_id,
    )
    db.add(floor)
    await db.commit()
    await db.refresh(floor)
    return PGFloorResponse.model_validate(floor)


# ─── Rooms Endpoints ──────────────────────────────────────────────

@router.get("/rooms", response_model=list[PGRoomResponse])
async def list_rooms(
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGRoomResponse]:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(select(PGRoom).where(PGRoom.tenant_id == tenant_id, PGRoom.is_deleted == False))
    return [PGRoomResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/rooms", response_model=PGRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    body: PGRoomCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PGRoomResponse:
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    room = PGRoom(
        tenant_id=tenant_id,
        branch_id=body.branch_id,
        company_id=body.company_id,
        floor_id=body.floor_id,
        room_number=body.room_number,
        sharing_type=body.sharing_type,
        created_by=user_id,
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)

    # Auto-create beds for room based on sharing_type in pg_beds table
    for i in range(1, body.sharing_type + 1):
        bed = PGBed(
            tenant_id=tenant_id,
            room_id=room.id,
            bed_number=f"{room.room_number}-Bed-{i}",
            monthly_rent=body.monthly_rent,
            status=BedStatus.VACANT,
            created_by=user_id,
        )
        db.add(bed)
    await db.commit()

    return PGRoomResponse.model_validate(room)


# ─── Beds Endpoints ───────────────────────────────────────────────

@router.get("/beds", response_model=list[PGBedResponse])
async def list_beds(
    room_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGBedResponse]:
    tenant_id = current_user.tenant_id if current_user else 1
    query = select(PGBed).where(PGBed.tenant_id == tenant_id, PGBed.is_deleted == False)
    if room_id:
        query = query.where(PGBed.room_id == room_id)
    result = await db.execute(query)
    return [PGBedResponse.model_validate(b) for b in result.scalars().all()]


# ─── Residents Endpoints ──────────────────────────────────────────

@router.get("/residents", response_model=list[PGResidentResponse])
@alias_router.get("/residents", response_model=list[PGResidentResponse])
async def list_residents(
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PGResidentResponse]:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(select(PGResident).where(PGResident.tenant_id == tenant_id, PGResident.is_deleted == False))
    return [PGResidentResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/residents", response_model=PGResidentResponse, status_code=status.HTTP_201_CREATED)
@alias_router.post("/residents", response_model=PGResidentResponse, status_code=status.HTTP_201_CREATED)
async def create_resident(
    body: PGResidentCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PGResidentResponse:
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    if body.bed_id:
        bed_res = await db.execute(select(PGBed).where(PGBed.id == body.bed_id, PGBed.tenant_id == tenant_id))
        bed = bed_res.scalar_one_or_none()
        if bed:
            bed.status = BedStatus.OCCUPIED

    name = body.full_name or f"{body.first_name or ''} {body.last_name or ''}".strip() or "Resident"
    j_date = body.joining_date or body.check_in_date or date.today()

    resident = PGResident(
        tenant_id=tenant_id,
        bed_id=body.bed_id,
        full_name=name,
        phone=body.phone,
        id_proof_number=body.id_proof_number,
        joining_date=j_date,
        status=ResidentStatus.ACTIVE,
        created_by=user_id,
    )
    db.add(resident)
    await db.commit()
    await db.refresh(resident)

    # Initial rent record
    billing_month = j_date.strftime("%Y-%m")
    rent_rec = PGRentRecord(
        tenant_id=tenant_id,
        resident_id=resident.id,
        rent_month=billing_month,
        amount=body.monthly_rent,
        paid_amount=Decimal("0.00"),
        status=RentStatus.UNPAID,
        created_by=user_id,
    )
    db.add(rent_rec)
    await db.commit()

    return PGResidentResponse.model_validate(resident)


@router.delete("/residents/{resident_id}", status_code=status.HTTP_200_OK)
@alias_router.delete("/residents/{resident_id}", status_code=status.HTTP_200_OK)
async def delete_resident(
    resident_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(select(PGResident).where(PGResident.id == resident_id, PGResident.tenant_id == tenant_id))
    resident = result.scalar_one_or_none()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident record not found")

    resident.is_deleted = True
    resident.status = ResidentStatus.INACTIVE

    if resident.bed_id:
        bed_res = await db.execute(select(PGBed).where(PGBed.id == resident.bed_id))
        bed = bed_res.scalar_one_or_none()
        if bed:
            bed.status = BedStatus.VACANT

    await db.commit()
    return {"message": "Resident record removed successfully from PostgreSQL DB"}


# ─── Rent Payment Collection ─────────────────────────────────────

@router.post("/rent/collect")
async def collect_rent(
    body: CollectRentSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1

    result = await db.execute(
        select(PGRentRecord).where(
            PGRentRecord.resident_id == body.resident_id,
            PGRentRecord.tenant_id == tenant_id
        )
    )
    record = result.scalars().first()
    if not record:
        record = PGRentRecord(
            tenant_id=tenant_id,
            resident_id=body.resident_id,
            rent_month=body.rent_month,
            amount=body.amount,
            paid_amount=body.amount,
            status=RentStatus.PAID,
            created_by=user_id,
        )
        db.add(record)
    else:
        record.paid_amount += body.amount
        record.status = RentStatus.PAID if record.paid_amount >= record.amount else RentStatus.PARTIALLY_PAID
        record.updated_by = user_id

    await db.commit()
    return {"message": "Rent payment recorded in PostgreSQL DB", "status": record.status}
