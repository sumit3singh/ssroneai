"""
Seed script to insert demo kitchen stations and dining tables for Baithak Cafe.
Run: python scripts/seed_demo_pos.py
"""
import asyncio
import sys
import os

# Add backend directory to python path
sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from sqlalchemy import select
from src.core.database.engine import AsyncSessionLocal
from src.modules.orders.models import KitchenStation, DiningTable


STATIONS_DATA = [
    {"name": "Main Kitchen", "code": "MAIN", "printer_name": "PRINTER_MAIN_01", "sort_order": 1},
    {"name": "Tandoor & Grill", "code": "TANDOOR", "printer_name": "PRINTER_TANDOOR_01", "sort_order": 2},
    {"name": "Chinese & Wok", "code": "CHINESE", "printer_name": "PRINTER_CHINESE_01", "sort_order": 3},
    {"name": "Beverages & Bar", "code": "BEVERAGES", "printer_name": "PRINTER_BEV_01", "sort_order": 4},
]

TABLES_DATA = [
    {"table_number": "T-01", "name": "Table 1 (Ground Floor)", "capacity": 2, "floor": "Ground Floor", "sort_order": 1},
    {"table_number": "T-02", "name": "Table 2 (Ground Floor)", "capacity": 4, "floor": "Ground Floor", "sort_order": 2},
    {"table_number": "T-03", "name": "Table 3 (Ground Floor)", "capacity": 4, "floor": "Ground Floor", "sort_order": 3},
    {"table_number": "T-04", "name": "Table 4 (Family Section)", "capacity": 6, "floor": "Ground Floor", "sort_order": 4},
    {"table_number": "T-05", "name": "Table 5 (First Floor View)", "capacity": 4, "floor": "First Floor", "sort_order": 5},
    {"table_number": "T-06", "name": "Table 6 (First Floor View)", "capacity": 4, "floor": "First Floor", "sort_order": 6},
    {"table_number": "T-07", "name": "Table 7 (Rooftop Lounge)", "capacity": 6, "floor": "Rooftop", "sort_order": 7},
    {"table_number": "T-08", "name": "Table 8 (Rooftop Lounge)", "capacity": 8, "floor": "Rooftop", "sort_order": 8},
]


async def seed_pos_data():
    async with AsyncSessionLocal() as session:
        print("[INIT] Starting Baithak POS stations & tables seed...")

        tenant_id = 1
        branch_id = 1

        # 1. Seed Kitchen Stations
        for st in STATIONS_DATA:
            existing = await session.execute(
                select(KitchenStation).where(
                    KitchenStation.tenant_id == tenant_id,
                    KitchenStation.branch_id == branch_id,
                    KitchenStation.code == st["code"]
                )
            )
            if not existing.scalar_one_or_none():
                station = KitchenStation(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    name=st["name"],
                    code=st["code"],
                    printer_name=st["printer_name"],
                    sort_order=st["sort_order"]
                )
                session.add(station)
                print(f"  + Added Kitchen Station: {st['name']} ({st['code']})")

        # 2. Seed Dining Tables
        for tb in TABLES_DATA:
            existing = await session.execute(
                select(DiningTable).where(
                    DiningTable.tenant_id == tenant_id,
                    DiningTable.branch_id == branch_id,
                    DiningTable.table_number == tb["table_number"]
                )
            )
            if not existing.scalar_one_or_none():
                table = DiningTable(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    table_number=tb["table_number"],
                    name=tb["name"],
                    capacity=tb["capacity"],
                    floor=tb["floor"],
                    sort_order=tb["sort_order"]
                )
                session.add(table)
                print(f"  + Added Dining Table: {tb['table_number']} - {tb['name']}")

        await session.commit()
        print("[SUCCESS] Baithak POS stations & tables seed completed successfully!\n")


if __name__ == "__main__":
    asyncio.run(seed_pos_data())
