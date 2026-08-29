"""
The ssrone – Hotel Module Service
Encapsulates business logic for Room Reservations, Check-ins, Check-outs, and Folio billing.
"""
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.hotel.repository import HotelRepository
from src.modules.hotel.models import HotelRoom

class HotelService:
    def __init__(self, db: AsyncSession):
        self.repo = HotelRepository(db)

    async def list_rooms(self, branch_id: int | None = None) -> Sequence[HotelRoom]:
        return await self.repo.get_rooms(branch_id=branch_id)
