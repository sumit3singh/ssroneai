import asyncio
import sys
from pathlib import Path

# Add backend root to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "services" / "backend"
sys.path.insert(0, str(backend_dir))

from src.core.database.engine import AsyncSessionLocal
from src.modules.restaurant.models import MenuCategory, MenuItem, MenuVariantGroup, MenuVariantOption, MenuAddonGroup, MenuAddonOption
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        # Check existing category
        cat_stmt = select(MenuCategory).where(MenuCategory.is_deleted == False)
        res = await db.execute(cat_stmt)
        cats = res.scalars().all()
        if not cats:
            print("No category found!")
            return
        
        target_cat = cats[0]
        print(f"Using category: {target_cat.name} (id={target_cat.id})")

        # Check if Veg Pizza already exists
        item_stmt = select(MenuItem).where(MenuItem.name == "Veg Pizza", MenuItem.is_deleted == False)
        item_res = await db.execute(item_stmt)
        existing = item_res.scalar_one_or_none()
        if existing:
            print(f"Veg Pizza already exists with ID: {existing.id}")
            return existing.id

        # Create Veg Pizza
        pizza = MenuItem(
            tenant_id=target_cat.tenant_id or 2,
            branch_id=1,
            company_id=1,
            category_id=target_cat.id,
            name="Veg Pizza",
            description="Hand-tossed pizza crust loaded with capsicum, onion, tomato, jalapenos, and mozzarella.",
            short_description="Loaded veggie pizza",
            base_price=180.0,
            packaging_charge=10.0,
            is_veg=True,
            is_available=True,
            kds_station="Main",
            gst_percent=5.0,
            sort_order=1,
            created_by=1
        )
        db.add(pizza)
        await db.flush()

        # Add Size Group: Pizza Size
        vg = MenuVariantGroup(
            tenant_id=pizza.tenant_id,
            branch_id=1,
            item_id=pizza.id,
            name="Pizza Size",
            min_selection=1,
            max_selection=1,
            is_required=True,
            sort_order=1,
            created_by=1
        )
        db.add(vg)
        await db.flush()

        # Options: Small (150), Medium (180), Large (230)
        options_data = [
            {"name": "Small (7\")", "price": 150.0, "is_default": False},
            {"name": "Medium (10\")", "price": 180.0, "is_default": True},
            {"name": "Large (12\")", "price": 230.0, "is_default": False},
        ]
        for opt in options_data:
            opt_obj = MenuVariantOption(
                tenant_id=pizza.tenant_id,
                branch_id=1,
                group_id=vg.id,
                name=opt["name"],
                selling_price=opt["price"],
                price=opt["price"],
                is_default=opt["is_default"],
                is_available=True,
                sort_order=1,
                created_by=1
            )
            db.add(opt_obj)

        # Add Addon Group: Crust Upgrade & Addons
        ag = MenuAddonGroup(
            tenant_id=pizza.tenant_id,
            branch_id=1,
            item_id=pizza.id,
            name="Crust Upgrade",
            min_selection=0,
            max_selection=5,
            sort_order=1,
            created_by=1
        )
        db.add(ag)
        await db.flush()

        # Addon Option: Cheese Burst Crust with per-size prices
        cb_opt = MenuAddonOption(
            tenant_id=pizza.tenant_id,
            branch_id=1,
            group_id=ag.id,
            name="Cheese Burst Crust",
            price=80.0,
            variant_prices={"Small (7\")": 50.0, "Medium (10\")": 80.0, "Large (12\")": 100.0},
            is_available=True,
            sort_order=1,
            created_by=1
        )
        db.add(cb_opt)

        await db.commit()
        print(f"Successfully created Veg Pizza in PostgreSQL database! Item ID: {pizza.id}")
        return pizza.id

if __name__ == "__main__":
    asyncio.run(main())
