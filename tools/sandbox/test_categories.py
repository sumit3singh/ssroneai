import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from src.core.database.engine import AsyncSessionLocal
from src.modules.auth.models import User
from src.modules.restaurant.router import list_categories
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        user = (await session.execute(select(User).where(User.id == 1))).scalar_one()
        cats = await list_categories(branch_id=None, current_user=user, db=session)
        print("CATS RETURNED:", cats)

if __name__ == "__main__":
    asyncio.run(main())
