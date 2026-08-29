import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "services" / "backend"
sys.path.insert(0, str(backend_dir))

from src.core.database.engine import AsyncSessionLocal
from src.modules.orders.models import DiningTable
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        stmt = select(DiningTable)
        res = await db.execute(stmt)
        tables = res.scalars().all()
        print(f"=== DB Dining Tables Count: {len(tables)} ===")
        for t in tables:
            print(f"  Table ID={t.id}, Number='{t.table_number}', BranchID={t.branch_id}, TenantID={t.tenant_id}, Status='{t.status}', Deleted={t.is_deleted}")

if __name__ == "__main__":
    asyncio.run(main())
