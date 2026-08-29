"""
The ssrone – Restaurant Module Repository
Encapsulates all database access logic for Menu Categories, Menu Items, Tables, Waiters, and KDS Orders.
"""
from typing import Sequence
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.restaurant.models import MenuCategory, MenuItem, MenuTag

class RestaurantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_categories(self, branch_id: int | None = None) -> Sequence[MenuCategory]:
        query = select(MenuCategory).where(MenuCategory.is_deleted == False)
        if branch_id:
            query = query.where(MenuCategory.branch_id == branch_id)
        query = query.order_by(MenuCategory.sort_order.asc(), MenuCategory.id.asc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_menu_items(self, branch_id: int | None = None, category_id: int | None = None) -> Sequence[MenuItem]:
        query = select(MenuItem).where(MenuItem.is_deleted == False)
        if category_id:
            query = query.where(MenuItem.category_id == category_id)
        query = query.order_by(MenuItem.id.asc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_category(self, category: MenuCategory) -> MenuCategory:
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def create_menu_item(self, item: MenuItem) -> MenuItem:
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item
