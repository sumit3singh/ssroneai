import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))
from src.core.database.engine import AsyncSessionLocal
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.modules.auth.models import User, UserRole

async def check():
    async with AsyncSessionLocal() as session:
        users = (await session.execute(select(User).options(selectinload(User.roles).selectinload(UserRole.role)))).scalars().all()
        print("=== USERS IN DB ===")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Tenant: {u.tenant_id}")

if __name__ == "__main__":
    asyncio.run(check())
