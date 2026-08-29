"""
The ssrone – Hotel Module Repository
Encapsulates database access for Room Inventory, Reservations, Guest Profiles, and Housekeeping.
"""
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.hotel.models import HotelRoom

class HotelRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_rooms(self, branch_id: int | None = None) -> Sequence[HotelRoom]:
        query = select(HotelRoom).where(HotelRoom.is_deleted == False)
        if branch_id:
            query = query.where(HotelRoom.branch_id == branch_id)
        result = await self.db.execute(query)
        return result.scalars().all()
