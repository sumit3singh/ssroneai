import asyncio
import sys, os
sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database.engine import AsyncSessionLocal
from src.modules.restaurant.models import MenuItem
from src.modules.restaurant.schemas import MenuItemResponseSchema
from src.modules.restaurant.router import _build_menu_item_response

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(
            select(MenuItem)
            .options(
                selectinload(MenuItem.category),
                selectinload(MenuItem.variant_groups_rel),
                selectinload(MenuItem.addon_groups_rel),
            )
            .where(MenuItem.is_deleted == False)
        )

        items = res.scalars().all()
        print(f"MENU ITEMS IN DB ({len(items)}):")
        for item in items:
            try:
                resp = _build_menu_item_response(item)
                print("VALIDATED ITEM OK:", resp.id, resp.name, "variants=", len(resp.variant_groups), "addons=", len(resp.addon_groups))
            except Exception as e:
                import traceback
                print("VALIDATION ERROR ON ITEM:", item.id, item.name, e)
                traceback.print_exc()

asyncio.run(main())
