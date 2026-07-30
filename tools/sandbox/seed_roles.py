import sys
import os
sys.path.insert(0, os.path.abspath("."))
import asyncio
from sqlalchemy import select
from src.core.database.engine import AsyncSessionLocal
from src.modules.auth.models import Role, Tenant


async def check_roles():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Role))
        roles = res.scalars().all()
        print(f"ROLES COUNT IN DB: {len(roles)}")
        for r in roles:
            print(f"  - [{r.id}] {r.name} ({r.code}) system={r.is_system_role}")

        if len(roles) == 0:
            print("Seeding system roles into database...")
            # Fetch default tenant
            t_res = await db.execute(select(Tenant).where(Tenant.slug == "baithak-demo"))
            tenant = t_res.scalar_one_or_none()
            tenant_id = tenant.id if tenant else 1

            r1 = Role(tenant_id=tenant_id, name="Super Admin", code="super_admin", description="Full System Access & Control", is_system_role=True)
            r2 = Role(tenant_id=tenant_id, name="Store Manager", code="store_manager", description="Operational & Branch Management", is_system_role=True)
            r3 = Role(tenant_id=tenant_id, name="POS Cashier", code="pos_cashier", description="Order Entry & Billing Access", is_system_role=True)
            
            db.add_all([r1, r2, r3])
            await db.commit()
            print("Successfully seeded system roles into PostgreSQL database!")

asyncio.run(check_roles())
