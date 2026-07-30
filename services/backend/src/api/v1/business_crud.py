"""
Generic FastAPI Master & Transaction Business CRUD Router
Handles CRUD operations for Menu Items, POS Orders, Hotel Rooms, Reservations, Inventory, Invoices, Customers, Employees, and PG Beds.
"""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.dependencies import get_db
from src.core.database.business_models import (
    MenuItemModel,
    POSOrderModel,
    HotelRoomModel,
    HotelReservationModel,
    InventoryItemModel,
    InvoiceModel,
    CustomerModel,
    EmployeeModel,
    PGBedModel,
)

router = APIRouter(prefix="/business", tags=["Master & Transaction Business CRUD"])

MODEL_MAP: Dict[str, Any] = {
    "menu-items": MenuItemModel,
    "pos-orders": POSOrderModel,
    "hotel-rooms": HotelRoomModel,
    "hotel-reservations": HotelReservationModel,
    "inventory-items": InventoryItemModel,
    "invoices": InvoiceModel,
    "customers": CustomerModel,
    "employees": EmployeeModel,
    "pg-beds": PGBedModel,
}


@router.get("/{entity_key}", status_code=status.HTTP_200_OK)
async def list_entities(
    entity_key: str,
    tenant_id: int = 1,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """List records for any master or transaction business entity."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_key}' is not recognized.",
        )

    result = await db.execute(
        select(model).where(model.tenant_id == tenant_id).limit(limit).offset(offset)
    )
    records = result.scalars().all()
    return [
        {col.name: getattr(row, col.name) for col in row.__table__.columns}
        for row in records
    ]


@router.post("/{entity_key}", status_code=status.HTTP_201_CREATED)
async def create_entity(
    entity_key: str,
    payload: Dict[str, Any],
    tenant_id: int = 1,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new master or transaction record in PostgreSQL."""
    model = MODEL_MAP.get(entity_key)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity '{entity_key}' is not recognized.",
        )

    payload["tenant_id"] = tenant_id
    instance = model(**payload)
    db.add(instance)
    await db.flush()

    return {col.name: getattr(instance, col.name) for col in instance.__table__.columns}
