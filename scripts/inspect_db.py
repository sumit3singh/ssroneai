import asyncio
import sys
from pathlib import Path

# Add backend root to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "services" / "backend"
sys.path.insert(0, str(backend_dir))

from src.core.database.engine import AsyncSessionLocal
from src.modules.restaurant.models import MenuCategory, MenuItem
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        cat_stmt = select(MenuCategory)
        cat_res = await db.execute(cat_stmt)
        categories = cat_res.scalars().all()
        print(f"=== DB Menu Categories ({len(categories)}) ===")
        for c in categories:
            print(f"  Cat ID={c.id}, Name='{c.name}', tenant_id={c.tenant_id}, branch_id={c.branch_id}, is_deleted={c.is_deleted}")

        item_stmt = select(MenuItem)
        item_res = await db.execute(item_stmt)
        items = item_res.scalars().all()
        print(f"\n=== DB Menu Items ({len(items)}) ===")
        for i in items:
            print(f"  Item ID={i.id}, Name='{i.name}', category_id={i.category_id}, tenant_id={i.tenant_id}, branch_id={i.branch_id}, is_deleted={i.is_deleted}")

if __name__ == "__main__":
    asyncio.run(main())
