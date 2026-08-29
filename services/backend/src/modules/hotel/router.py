"""
The ssrone – Hotel PMS Router
Room management, reservations, check-in/out.
"""
from datetime import date, datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.core.event_bus.bus import event_bus, room_checked_in_event, room_checked_out_event
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.hotel.models import Guest, Reservation, ReservationStatus, Room, RoomStatus, RoomType
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/hotel", tags=["Hotel PMS"])


# ─── Schemas ─────────────────────────────────────────────────

class RoomResponse(BaseModel):
    id: int
    room_number: str
    floor: str | None
    status: str
    room_type_id: int

    model_config = {"from_attributes": True}


class RoomTypeCreateSchema(BaseModel):
    branch_id: int
    name: str
    code: str
    max_occupancy: int = 2
    base_rate: Decimal = Field(gt=0)


class RoomCreateSchema(BaseModel):
    branch_id: int
    room_type_id: int
    room_number: str
    floor: str | None = None


class GuestCreateSchema(BaseModel):
    branch_id: int
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None
    id_type: str | None = None
    id_number: str | None = None


class ReservationCreateSchema(BaseModel):
    branch_id: int
    room_id: int
    room_type_id: int
    primary_guest_id: int
    check_in_date: date
    check_out_date: date
    adults: int = 1
    children: int = 0
    rate_per_night: Decimal = Field(gt=0)
    special_requests: str | None = None


class ReservationResponse(BaseModel):
    id: int
    reservation_number: str
    room_id: int
    primary_guest_id: int
    check_in_date: date
    check_out_date: date
    nights: int
    status: str
    grand_total: Decimal
    balance_due: Decimal

    model_config = {"from_attributes": True}


# ─── Rooms ───────────────────────────────────────────────────

@router.get("/rooms")
async def list_rooms(
    branch_id: int | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[RoomResponse]:
    query = select(Room).where(Room.tenant_id == current_user.tenant_id, Room.is_deleted == False)
    if branch_id:
        query = query.where(Room.branch_id == branch_id)
    if status_filter:
        query = query.where(Room.status == status_filter)
    result = await db.execute(query)
    return [RoomResponse.model_validate(r) for r in result.scalars().all()]


@router.post("/room-types", status_code=status.HTTP_201_CREATED)
async def create_room_type(
    body: RoomTypeCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    room_type = RoomType(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        name=body.name,
        code=body.code,
        max_occupancy=body.max_occupancy,
        base_rate=body.base_rate,
        created_by=current_user.id,
    )
    db.add(room_type)
    await db.flush()
    return {"id": str(room_type.id), "name": room_type.name}


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    body: RoomCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> RoomResponse:
    room = Room(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        room_type_id=body.room_type_id,
        room_number=body.room_number,
        floor=body.floor,
        status=RoomStatus.AVAILABLE,
        created_by=current_user.id,
    )
    db.add(room)
    await db.flush()
    return RoomResponse.model_validate(room)


# ─── Guests ──────────────────────────────────────────────────

@router.post("/guests", status_code=status.HTTP_201_CREATED)
async def create_guest(
    body: GuestCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    guest = Guest(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        first_name=body.first_name,
        last_name=body.last_name,
        email=body.email,
        phone=body.phone,
        id_type=body.id_type,
        id_number=body.id_number,
        created_by=current_user.id,
    )
    db.add(guest)
    await db.flush()
    return {"id": str(guest.id), "name": f"{guest.first_name} {guest.last_name}"}


# ─── Reservations ────────────────────────────────────────────

@router.post("/reservations", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    body: ReservationCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ReservationResponse:
    nights = (body.check_out_date - body.check_in_date).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date.")

    room_charges = body.rate_per_night * nights
    tax = (room_charges * Decimal("0.18")).quantize(Decimal("0.01"))
    grand_total = room_charges + tax
    now = datetime.now(timezone.utc)

    reservation = Reservation(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        reservation_number=f"RES-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S%f')[:6].upper()}",
        room_id=body.room_id,
        room_type_id=body.room_type_id,
        primary_guest_id=body.primary_guest_id,
        check_in_date=body.check_in_date,
        check_out_date=body.check_out_date,
        nights=nights,
        adults=body.adults,
        children=body.children,
        status=ReservationStatus.CONFIRMED,
        rate_per_night=body.rate_per_night,
        total_room_charges=room_charges,
        tax_amount=tax,
        grand_total=grand_total,
        balance_due=grand_total,
        special_requests=body.special_requests,
        created_by=current_user.id,
    )
    db.add(reservation)
    await db.flush()
    return ReservationResponse.model_validate(reservation)


@router.get("/reservations")
async def list_reservations(
    branch_id: int | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    query = select(Reservation).where(
        Reservation.tenant_id == current_user.tenant_id, Reservation.is_deleted == False
    )
    if branch_id:
        query = query.where(Reservation.branch_id == branch_id)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Reservation.check_in_date.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reservations = result.scalars().all()

    return {
        "items": [ReservationResponse.model_validate(r) for r in reservations],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.patch("/reservations/{reservation_id}/check-in")
async def check_in(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(Reservation).where(
            Reservation.id == reservation_id, Reservation.tenant_id == current_user.tenant_id
        )
    )
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    reservation.status = ReservationStatus.CHECKED_IN
    reservation.actual_check_in = datetime.now(timezone.utc)
    reservation.updated_by = current_user.id

    room_result = await db.execute(select(Room).where(Room.id == reservation.room_id))
    room = room_result.scalar_one_or_none()
    if room:
        room.status = RoomStatus.OCCUPIED

    event = room_checked_in_event(
        tenant_id=str(current_user.tenant_id),
        room_id=str(reservation.room_id),
        guest_id=str(reservation.primary_guest_id),
        reservation_id=str(reservation_id),
    )
    await event_bus.publish(event)

    return {"message": "Guest checked in successfully"}


@router.patch("/reservations/{reservation_id}/check-out")
async def check_out(
    reservation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(Reservation).where(
            Reservation.id == reservation_id, Reservation.tenant_id == current_user.tenant_id
        )
    )
    reservation = result.scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.balance_due > 0:
        raise HTTPException(status_code=400, detail="Cannot check out with outstanding balance due.")

    reservation.status = ReservationStatus.CHECKED_OUT
    reservation.actual_check_out = datetime.now(timezone.utc)
    reservation.updated_by = current_user.id

    room_result = await db.execute(select(Room).where(Room.id == reservation.room_id))
    room = room_result.scalar_one_or_none()
    if room:
        room.status = RoomStatus.CLEANING

    event = room_checked_out_event(
        tenant_id=str(current_user.tenant_id),
        room_id=str(reservation.room_id),
        folio_id=str(reservation_id),
    )
    await event_bus.publish(event)

    return {"message": "Guest checked out successfully"}
