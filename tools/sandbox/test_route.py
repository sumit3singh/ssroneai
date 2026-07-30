import asyncio
import sys, os
sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import select
from src.core.database.engine import AsyncSessionLocal
from src.modules.restaurant.models import MenuCategory
from src.modules.restaurant.schemas import CategoryResponseSchema

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(MenuCategory).where(MenuCategory.is_deleted == False))
        categories = res.scalars().all()
        print(f"CATEGORIES IN DB ({len(categories)}):")
        for c in categories:
            try:
                schema = CategoryResponseSchema.model_validate(c)
                print("VALIDATED SCHEMA OK:", schema.id, schema.name, "tenant_id=", schema.tenant_id)
            except Exception as e:
                print("VALIDATION ERROR:", e)

asyncio.run(main())
