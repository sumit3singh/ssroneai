"""
The Baithak – Restaurant Menu Database Seed Script
Seeds all menu categories, detailed items (with variants & addons),
branches (CUH02, GGN01), tables, and mock customer loyalty profiles.

Usage:
    python scripts/seed_menu.py
"""
import asyncio
import sys
import os
from decimal import Decimal
from datetime import datetime, date, timezone
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.database.engine import AsyncSessionLocal
from src.modules.auth.models import Tenant, Company, Branch
from src.modules.restaurant.models import MenuCategory, MenuItem
from src.modules.restaurant.router import RestaurantTable
from src.modules.crm.models import Customer
from src.modules.orders.models import Order, OrderItem

async def seed_menu():
    print("[INFO] Seeding Restaurant Menu & Customers...")
    
    # Import and register restaurant models that are defined in router.py
    from src.modules.restaurant.router import RestaurantTable, KDSStation
    from src.core.database.engine import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # 1. Fetch Tenant & Company
        tenant_res = await db.execute(select(Tenant).where(Tenant.slug == "baithak-demo"))
        tenant = tenant_res.scalar_one_or_none()
        if not tenant:
            print("[ERROR] Tenant 'baithak-demo' not found! Please run python scripts/seed.py first.")
            return

        company_res = await db.execute(select(Company).where(Company.tenant_id == tenant.id))
        company = company_res.scalar_one_or_none()
        if not company:
            print("[ERROR] Company not found! Please run seed.py first.")
            return

        # 2. Re-create Branches if missing (CUH02 and GGN01)
        branch_codes = ["CUH02", "GGN01"]
        branches = {}
        for code in branch_codes:
            b_res = await db.execute(select(Branch).where(Branch.tenant_id == tenant.id, Branch.code == code))
            b = b_res.scalar_one_or_none()
            if not b:
                b = Branch(
                    tenant_id=tenant.id,
                    company_id=company.id,
                    name=f"Baithak Outlet - {code}",
                    code=code,
                    branch_type="outlet",
                    phone="+91-9999988888",
                    email=f"outlet.{code.lower()}@baithak.com",
                    is_active=True
                )
                db.add(b)
                await db.flush()
                print(f"[OK] Created branch {code}")
            branches[code] = b

        # 3. Clean existing menu data
        await db.execute(text("TRUNCATE TABLE menu_items CASCADE"))
        await db.execute(text("TRUNCATE TABLE menu_categories CASCADE"))
        await db.execute(text("TRUNCATE TABLE restaurant_tables CASCADE"))
        await db.execute(text("TRUNCATE TABLE customers CASCADE"))
        await db.commit()

        # 4. Create Tables for each branch
        for code, b in branches.items():
            for t_num in ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"]:
                table = RestaurantTable(
                    tenant_id=tenant.id,
                    branch_id=b.id,
                    table_number=t_num,
                    capacity=4,
                    section="Dine In",
                    status="free"
                )
                db.add(table)
        await db.flush()
        print("[OK] Seeded outlet tables")

        # 5. Define Categories
        categories_data = [
            ("Veg.Momo's", "Momo"),
            ("Paneer Momo's", "Momo"),
            ("Spring Rolls", "Roll"),
            ("Kathi Roll", "Roll"),
            ("Noodles", "Noodles"),
            ("Soup", "Soup"),
            ("Sandwich", "Sandwich"),
            ("Fries", "Fries"),
            ("Pasta", "Pasta"),
            ("Fried Rice", "Rice"),
            ("Pizza", "Pizza"),
            ("Burger", "Burger"),
            ("Wrap", "Wrap"),
            ("Snacks", "Snacks"),
            ("Paav Bhaji", "PaavBhaji"),
            ("Chinese Combo", "Combo"),
            ("Extra Loaded Veg Maggie", "Maggie"),
            ("Shakes", "Shake"),
            ("Mojito", "Mojito"),
            ("Tandoori Chaap", "Chaap"),
            ("Kebab", "Kebab"),
            ("Tandoori Tikka", "Tikka")
        ]

        categories = {}
        for idx, (name, icon) in enumerate(categories_data):
            cat = MenuCategory(
                tenant_id=tenant.id,
                name=name,
                icon=icon,
                sort_order=idx + 1
            )
            db.add(cat)
            await db.flush()
            categories[name] = cat
        print("[OK] Seeded menu categories")

        # Helper to define items
        items_to_seed = []

        # Veg.Momo's (Half/Full)
        momo_addons = [
            {"name": "Kurkure Crispiness", "price": 30.0}
        ]

        items_to_seed.append(("Veg Steam Momos", "Veg.Momo's", 60.0, True, True, ["Bestseller"], [{"name": "Size", "options": [{"name": "Half", "price": 60.0}, {"name": "Full", "price": 80.0}]}], momo_addons))
        items_to_seed.append(("Veg. Fry Momos", "Veg.Momo's", 70.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 70.0}, {"name": "Full", "price": 100.0}]}], momo_addons))
        items_to_seed.append(("Veg. Butter Momos", "Veg.Momo's", 80.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 80.0}, {"name": "Full", "price": 110.0}]}], momo_addons))
        items_to_seed.append(("Veg. Kurkure Momos", "Veg.Momo's", 100.0, True, True, ["Trending"], [{"name": "Size", "options": [{"name": "Half", "price": 100.0}, {"name": "Full", "price": 140.0}]}], []))
        items_to_seed.append(("Veg. Tandoori Momos", "Veg.Momo's", 140.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 140.0}]}], []))
        items_to_seed.append(("Veg. Malai Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []))
        items_to_seed.append(("Veg. Afgani Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []))
        items_to_seed.append(("Veg. Chilli Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []))

        # Paneer Momo's
        items_to_seed.append(("Paneer Steam Momos", "Paneer Momo's", 70.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 70.0}, {"name": "Full", "price": 100.0}]}], momo_addons))
        items_to_seed.append(("Paneer Fry Momos", "Paneer Momo's", 90.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 90.0}, {"name": "Full", "price": 120.0}]}], momo_addons))
        items_to_seed.append(("Paneer Butter Momos", "Paneer Momo's", 100.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 100.0}, {"name": "Full", "price": 140.0}]}], momo_addons))
        items_to_seed.append(("Paneer Kurkure Momos", "Paneer Momo's", 120.0, True, True, ["Trending"], [{"name": "Size", "options": [{"name": "Half", "price": 120.0}, {"name": "Full", "price": 160.0}]}], []))
        items_to_seed.append(("Paneer Tandoori Momos", "Paneer Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []))
        items_to_seed.append(("Paneer Malai Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []))
        items_to_seed.append(("Paneer Afgani Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []))
        items_to_seed.append(("Paneer Chilli Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []))

        # Spring Rolls
        roll_addons = [{"name": "Kurkure Crispiness", "price": 30.0}]
        items_to_seed.append(("Veg. Roll", "Spring Rolls", 90.0, True, False, [], [], roll_addons))
        items_to_seed.append(("Paneer Roll", "Spring Rolls", 120.0, True, True, ["High Margin"], [], roll_addons))
        items_to_seed.append(("Mix Roll", "Spring Rolls", 140.0, True, False, [], [], roll_addons))

        # Kathi Roll
        items_to_seed.append(("Veg. Kathi Roll", "Kathi Roll", 90.0, True, False, [], [], []))
        items_to_seed.append(("Noodle Roll", "Kathi Roll", 100.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Kathi Roll", "Kathi Roll", 120.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Mix Kathi Roll", "Kathi Roll", 140.0, True, False, [], [], []))
        items_to_seed.append(("Tandoori Chaap Roll", "Kathi Roll", 130.0, True, False, [], [], []))
        items_to_seed.append(("Tandoori Malai Chaap Roll", "Kathi Roll", 150.0, True, False, [], [], []))
        items_to_seed.append(("Tandoori Afgani Chaap Roll", "Kathi Roll", 150.0, True, False, [], [], []))
        items_to_seed.append(("Tandoori Paneer Tikka Roll", "Kathi Roll", 170.0, True, True, [], [], []))

        # Noodles
        items_to_seed.append(("Veg. Noodles", "Noodles", 100.0, True, False, [], [], []))
        items_to_seed.append(("Schezwan Noodles", "Noodles", 130.0, True, False, [], [], []))
        items_to_seed.append(("Chilli Garlic Noodles", "Noodles", 150.0, True, True, ["High Margin"], [], []))
        items_to_seed.append(("Singa-puri Noodles", "Noodles", 160.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Noodles", "Noodles", 170.0, True, False, [], [], []))
        items_to_seed.append(("Hakka Noodles", "Noodles", 200.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Special Veg. Loaded Noodles", "Noodles", 250.0, True, False, [], [], []))

        # Soup
        items_to_seed.append(("Veg. Hot & Sour Soup", "Soup", 100.0, True, False, [], [], []))
        items_to_seed.append(("Sweet Corn Soup", "Soup", 120.0, True, False, [], [], []))
        items_to_seed.append(("Manchow Soup", "Soup", 150.0, True, True, [], [], []))

        # Sandwich (Oven/Grilled)
        sandwich_variants = [{"name": "Style", "options": [{"name": "Oven", "price": 0.0}, {"name": "Grilled", "price": 20.0}]}]
        items_to_seed.append(("Veg Sandwich", "Sandwich", 100.0, True, False, [], sandwich_variants, []))
        items_to_seed.append(("Paneer Sandwich", "Sandwich", 120.0, True, True, ["Bestseller"], sandwich_variants, []))
        items_to_seed.append(("Tandoori Sandwich", "Sandwich", 160.0, True, False, [], sandwich_variants, []))
        items_to_seed.append(("Cheese Sandwich", "Sandwich", 180.0, True, False, [], sandwich_variants, []))

        # Fries
        items_to_seed.append(("French Fries", "Fries", 100.0, True, False, [], [], []))
        items_to_seed.append(("Periperi Fries", "Fries", 120.0, True, True, ["Trending"], [], []))
        items_to_seed.append(("Chilli Potato", "Fries", 140.0, True, False, [], [], []))
        items_to_seed.append(("Honey Chilli Potato", "Fries", 160.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Manchurian Dry", "Fries", 140.0, True, False, [], [], []))
        items_to_seed.append(("Manchurian Gravy", "Fries", 160.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Chilli Dry", "Fries", 250.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Chilli Gravy", "Fries", 280.0, True, False, [], [], []))
        items_to_seed.append(("Mushroom Chilli Dry", "Fries", 250.0, True, False, [], [], []))
        items_to_seed.append(("Gobi Chilli Dry", "Fries", 230.0, True, False, [], [], []))
        items_to_seed.append(("Soya Chilli Dry", "Fries", 200.0, True, False, [], [], []))

        # Pasta
        items_to_seed.append(("Red Sauce Pasta", "Pasta", 150.0, True, False, [], [], []))
        items_to_seed.append(("White Sauce Pasta", "Pasta", 170.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Mix Sauce Pasta", "Pasta", 170.0, True, False, [], [], []))
        items_to_seed.append(("Sweet Corn Pasta", "Pasta", 190.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Pasta", "Pasta", 220.0, True, False, [], [], []))
        items_to_seed.append(("Special Veg. Loaded Pasta", "Pasta", 250.0, True, False, [], [], []))

        # Fried Rice
        items_to_seed.append(("Veg. Fried Rice", "Fried Rice", 100.0, True, False, [], [], []))
        items_to_seed.append(("Manchurian Fried Rice", "Fried Rice", 120.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Fried Rice", "Fried Rice", 140.0, True, False, [], [], []))
        items_to_seed.append(("Schezwan Fried Rice", "Fried Rice", 140.0, True, False, [], [], []))
        items_to_seed.append(("Chilli Garlic Fried Rice", "Fried Rice", 150.0, True, False, [], [], []))
        items_to_seed.append(("Singa-Puri Fried Rice", "Fried Rice", 160.0, True, False, [], [], []))
        items_to_seed.append(("Special Veg. Loaded Fried Rice", "Fried Rice", 200.0, True, True, [], [], []))

        # Pizza (Small/Medium/Large + Cheese Burst addon)
        pizza_addons = [
            {
                "name": "Cheese Burst",
                "price": 90.0,
                "price_by_size": {"Small": 50.0, "Medium": 90.0, "Large": 120.0}
            }
        ]
        def pizza_variants(s, m, l):
            return [{"name": "Size", "options": [{"name": "Small", "price": float(s)}, {"name": "Medium", "price": float(m)}, {"name": "Large", "price": float(l)}]}]

        items_to_seed.append(("Veg Pizza", "Pizza", 170.0, True, True, ["Bestseller"], pizza_variants(170, 230, 290), pizza_addons))
        items_to_seed.append(("Tandoori Pizza", "Pizza", 240.0, True, True, ["Trending"], pizza_variants(240, 300, 360), pizza_addons))
        items_to_seed.append(("Sweetcorn Capsicum Pizza", "Pizza", 150.0, True, False, [], pizza_variants(150, 210, 270), pizza_addons))
        items_to_seed.append(("Margherita Pizza", "Pizza", 170.0, True, True, ["Bestseller"], pizza_variants(170, 230, 290), pizza_addons))
        items_to_seed.append(("Black Olive Pizza", "Pizza", 190.0, True, False, [], pizza_variants(190, 250, 310), pizza_addons))
        items_to_seed.append(("Mushroom Pizza", "Pizza", 200.0, True, False, [], pizza_variants(200, 260, 320), pizza_addons))
        items_to_seed.append(("Paneer Pizza", "Pizza", 210.0, True, False, [], pizza_variants(210, 270, 330), pizza_addons))
        items_to_seed.append(("Peppy Paneer Pizza", "Pizza", 230.0, True, False, [], pizza_variants(230, 290, 350), pizza_addons))
        items_to_seed.append(("Indi Tandoori Paneer Pizza", "Pizza", 250.0, True, False, [], pizza_variants(250, 310, 370), pizza_addons))
        items_to_seed.append(("Farm House Pizza", "Pizza", 260.0, True, True, ["Bestseller"], pizza_variants(260, 320, 380), pizza_addons))
        items_to_seed.append(("Double Decker Pizza", "Pizza", 280.0, True, False, [], pizza_variants(280, 340, 400), pizza_addons))
        items_to_seed.append(("All in One Pizza", "Pizza", 300.0, True, False, [], pizza_variants(300, 360, 420), pizza_addons))

        # Burger (Tawa/Oven)
        items_to_seed.append(("Aloo Tikki Burger", "Burger", 60.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 60.0}]}], []))
        items_to_seed.append(("Veggie Burger", "Burger", 50.0, True, True, ["Bestseller"], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 50.0}, {"name": "Oven", "price": 70.0}]}], []))
        items_to_seed.append(("Paneer Burger", "Burger", 70.0, True, True, ["Trending"], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 70.0}, {"name": "Oven", "price": 90.0}]}], []))
        items_to_seed.append(("Cheese Burger", "Burger", 80.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 80.0}, {"name": "Oven", "price": 100.0}]}], []))
        items_to_seed.append(("Melted Cheese Burger", "Burger", 130.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 130.0}]}], []))
        items_to_seed.append(("Maha Raja Burger", "Burger", 160.0, True, True, ["High Margin"], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 160.0}]}], []))

        # Wrap
        items_to_seed.append(("Aloo Tikki Wrap", "Wrap", 120.0, True, False, [], [], []))
        items_to_seed.append(("Veggie Wrap", "Wrap", 140.0, True, False, [], [], []))
        items_to_seed.append(("Paneer Wrap", "Wrap", 180.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Melted Cheese Wrap", "Wrap", 220.0, True, False, [], [], []))

        # Snacks
        items_to_seed.append(("Peanut Masala", "Snacks", 100.0, True, False, [], [], []))
        items_to_seed.append(("Sweet Highlight Corn Chaat", "Snacks", 100.0, True, False, [], [], []))
        items_to_seed.append(("Crispy Corn Chaat", "Snacks", 150.0, True, True, ["Trending"], [], []))

        # Paav Bhaji
        items_to_seed.append(("Paav Bhaji", "Paav Bhaji", 120.0, True, True, ["Bestseller"], [], [{"name": "Extra Paav", "price": 30.0}]))

        # Chinese Combo
        items_to_seed.append(("Fried Rice & Manchurian Combo", "Chinese Combo", 150.0, True, True, ["High Margin"], [], []))
        items_to_seed.append(("Noodle & Manchurian Combo", "Chinese Combo", 150.0, True, True, ["Bestseller"], [], []))

        # Extra Loaded Veg Maggie
        items_to_seed.append(("Extra Loaded Veg Maggie", "Extra Loaded Veg Maggie", 100.0, True, True, ["Trending"], [], []))

        # Shakes
        shake_addons = [{"name": "Extra Ice Cream", "price": 20.0}]
        items_to_seed.append(("Banana Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Papaya Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Mango Shake", "Shakes", 80.0, True, True, ["Bestseller"], [], shake_addons))
        items_to_seed.append(("Chikoo Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Mix Shake", "Shakes", 100.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Cold Coffee", "Shakes", 80.0, True, True, ["Bestseller", "High Margin"], [], shake_addons))
        items_to_seed.append(("Strawberry Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Butterscotch Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Vanilla Shake", "Shakes", 80.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Chocolate Shake", "Shakes", 90.0, True, True, [], [], shake_addons))
        items_to_seed.append(("Chocolate Banana Shake", "Shakes", 90.0, True, False, [], [], shake_addons))
        items_to_seed.append(("Kitkat Shake", "Shakes", 90.0, True, True, ["Trending"], [], shake_addons))
        items_to_seed.append(("Oreo Shake", "Shakes", 90.0, True, True, ["Trending"], [], shake_addons))

        # Mojito
        items_to_seed.append(("Virgin Mojito", "Mojito", 99.0, True, True, ["High Margin"], [], []))
        items_to_seed.append(("Blue Lagoon Mojito", "Mojito", 99.0, True, False, [], [], []))
        items_to_seed.append(("Green Apple Mojito", "Mojito", 99.0, True, False, [], [], []))
        items_to_seed.append(("Kala Khatta Mojito", "Mojito", 99.0, True, True, ["Bestseller"], [], []))
        items_to_seed.append(("Strawberry Mojito", "Mojito", 149.0, True, False, [], [], []))
        items_to_seed.append(("Guava Mojito", "Mojito", 149.0, True, False, [], [], []))
        items_to_seed.append(("Orange Mojito", "Mojito", 139.0, True, False, [], [], []))
        items_to_seed.append(("Pineapple Mojito", "Mojito", 139.0, True, False, [], [], []))

        # Tandoori Chaap (Half/Full)
        chaap_variants = [{"name": "Portion", "options": [{"name": "Half", "price": 150.0}, {"name": "Full", "price": 230.0}]}]
        chaap_variants_malai = [{"name": "Portion", "options": [{"name": "Half", "price": 160.0}, {"name": "Full", "price": 250.0}]}]
        items_to_seed.append(("Masala Chaap", "Tandoori Chaap", 150.0, True, False, [], chaap_variants, []))
        items_to_seed.append(("Achari Chaap", "Tandoori Chaap", 150.0, True, False, [], chaap_variants, []))
        items_to_seed.append(("Malai Chaap", "Tandoori Chaap", 160.0, True, True, ["Bestseller"], chaap_variants_malai, []))
        items_to_seed.append(("Afgani Chaap", "Tandoori Chaap", 160.0, True, False, [], chaap_variants_malai, []))

        # Kebab
        items_to_seed.append(("Hara Bhara Kebab", "Kebab", 180.0, True, False, [], [], []))
        items_to_seed.append(("Veg. Seekh Kebab", "Kebab", 180.0, True, True, [], [], []))
        items_to_seed.append(("Reshmi Kebab", "Kebab", 200.0, True, False, [], [], []))
        items_to_seed.append(("Dahi Ke Sholay", "Kebab", 200.0, True, True, ["Bestseller"], [], []))

        # Tandoori Tikka (Half/Full)
        tikka_variants = [{"name": "Portion", "options": [{"name": "Half", "price": 140.0}, {"name": "Full", "price": 220.0}]}]
        tikka_variants_paneer = [{"name": "Portion", "options": [{"name": "Half", "price": 180.0}, {"name": "Full", "price": 290.0}]}]
        tikka_variants_malai = [{"name": "Portion", "options": [{"name": "Half", "price": 190.0}, {"name": "Full", "price": 300.0}]}]
        items_to_seed.append(("Tandoori Aloo Tikka", "Tandoori Tikka", 140.0, True, False, [], tikka_variants, []))
        items_to_seed.append(("Paneer Tikka", "Tandoori Tikka", 180.0, True, True, ["Bestseller"], tikka_variants_paneer, []))
        items_to_seed.append(("Achari Paneer Tikka", "Tandoori Tikka", 180.0, True, False, [], tikka_variants_paneer, []))
        items_to_seed.append(("Malai Paneer Tikka", "Tandoori Tikka", 190.0, True, True, ["Trending"], tikka_variants_malai, []))
        items_to_seed.append(("Mushroom Tikka", "Tandoori Tikka", 190.0, True, False, [], tikka_variants_malai, []))

        # Insert menu items for all outlets
        for code, b in branches.items():
            for name, cat_name, price, is_veg, is_popular, tags, var_groups, add_groups in items_to_seed:
                cat = categories[cat_name]
                item = MenuItem(
                    tenant_id=tenant.id,
                    branch_id=b.id,
                    category_id=cat.id,
                    name=name,
                    description=f"Freshly prepared {name} at outlet {code}.",
                    base_price=price,
                    is_veg=is_veg,
                    is_popular=is_popular,
                    tags=tags,
                    variant_groups=var_groups,
                    addon_groups=add_groups,
                    is_available=True
                )
                db.add(item)
        await db.flush()
        print("[OK] Seeded outlet menu items")

        # 6. Seed Loyalty Customers with history
        customers_data = [
            ("Sumit", "Singh", "9999999999", "sumit@baithak.com", "gold", 450, 4500.0, 15, "Veg Pizza", "Veg Pizza Medium with Cheese Burst"),
            ("Chunu", "Rao", "7056841994", "chunu@baithak.com", "platinum", 820, 8900.0, 24, "Cold Coffee", "Kitkat Shake with Extra Ice Cream"),
            ("Mohit", "Bhanja", "8683849395", "mohit@baithak.com", "silver", 120, 1800.0, 6, "Veg Steam Momos", "Veg Steam Momos Half")
        ]

        for first, last, phone, email, tier, pts, spend, visits, fav, last_order in customers_data:
            cust = Customer(
                tenant_id=tenant.id,
                branch_id=branches["CUH02"].id,
                first_name=first,
                last_name=last,
                phone=phone,
                email=email,
                loyalty_tier=tier,
                loyalty_points=pts,
                lifetime_spent=Decimal(str(spend)),
                total_visits=visits,
                last_visit_at=datetime.now(timezone.utc),
                preferences={"favorite_item": fav, "last_order_text": last_order},
                is_active=True
            )
            db.add(cust)
        await db.flush()
        print("[OK] Seeded loyalty customers")

        # 7. Commit changes
        await db.commit()

    print("[SUCCESS] SEEDING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(seed_menu())
