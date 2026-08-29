"""
The ssrone – Restaurant Module Service
Encapsulates domain business logic, billing calculations, tax rules, and KDS broadcast triggers.
"""
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from src.modules.restaurant.repository import RestaurantRepository
from src.modules.restaurant.models import MenuCategory, MenuItem

class RestaurantService:
    def __init__(self, db: AsyncSession):
        self.repo = RestaurantRepository(db)

    async def list_categories(self, branch_id: int | None = None) -> Sequence[MenuCategory]:
        return await self.repo.get_categories(branch_id=branch_id)

    async def list_menu_items(self, branch_id: int | None = None, category_id: int | None = None) -> Sequence[MenuItem]:
        return await self.repo.get_menu_items(branch_id=branch_id, category_id=category_id)

    def calculate_bill_totals(self, subtotal: float, discount_percent: float = 0.0, gst_percent: float = 5.0) -> dict[str, float]:
        discount_amount = (subtotal * discount_percent) / 100.0
        taxable_amount = subtotal - discount_amount
        gst_amount = (taxable_amount * gst_percent) / 100.0
        grand_total = round(taxable_amount + gst_amount, 2)
        return {
            "subtotal": round(subtotal, 2),
            "discount_amount": round(discount_amount, 2),
            "taxable_amount": round(taxable_amount, 2),
            "gst_amount": round(gst_amount, 2),
            "grand_total": grand_total,
        }
