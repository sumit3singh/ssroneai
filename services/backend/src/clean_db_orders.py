import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.database.engine import AsyncSessionLocal
from sqlalchemy import text

async def clean_database():
    async with AsyncSessionLocal() as db:
        print("--- Inspecting database orders ---")
        res = await db.execute(text("SELECT id, order_number, order_type, table_id FROM orders"))
        rows = res.fetchall()
        for r in rows:
            print(dict(r))

        print("--- Setting table_id = NULL for Takeaway/Delivery orders ---")
        await db.execute(text("""
            UPDATE orders 
            SET table_id = NULL 
            WHERE LOWER(COALESCE(order_type, 'dine_in')) != 'dine_in'
        """))

        await db.commit()
        print("--- Database Orders Purged & Cleaned Successfully ---")

if __name__ == "__main__":
    asyncio.run(clean_database())
