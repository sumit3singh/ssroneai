"""
The Baithak – Seed Demo Menu Script
Populates database with realistic Baithak Cafe menu items, categories, normalized variant groups, options, addon groups, options, and tags.
Run: ..\.venv\Scripts\python scripts/seed_demo_menu.py
"""
import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from src.core.database.engine import AsyncSessionLocal
from src.modules.restaurant.models import (
    MenuCategory,
    MenuItem,
    MenuVariantGroup,
    MenuVariantOption,
    MenuAddonGroup,
    MenuAddonOption,
    MenuTag,
    MenuItemTag,
)


DEMO_CATEGORIES = [
    {"name": "Starters & Momos", "icon": "Flame", "slug": "starters-momos", "sort_order": 1},
    {"name": "Pizzas & Breads", "icon": "Utensils", "slug": "pizzas-breads", "sort_order": 2},
    {"name": "Indian Main Course", "icon": "ChefHat", "slug": "indian-main-course", "sort_order": 3},
    {"name": "Breads & Biryani", "icon": "Coffee", "slug": "breads-biryani", "sort_order": 4},
    {"name": "Beverages & Shakes", "icon": "CupSoda", "slug": "beverages-shakes", "sort_order": 5},
    {"name": "Desserts & Chai", "icon": "Cake", "slug": "desserts-chai", "sort_order": 6},
]

DEMO_TAGS = [
    {"name": "Bestseller", "color": "#ef4444", "icon": "Star"},
    {"name": "Spicy", "color": "#f97316", "icon": "Flame"},
    {"name": "Chef Special", "color": "#8b5cf6", "icon": "Sparkles"},
    {"name": "Jain Option", "color": "#10b981", "icon": "Check"},
]

DEMO_ITEMS = [
    {
        "category_slug": "starters-momos",
        "name": "Kurkure Veg Momos",
        "description": "Crispy fried veg momos coated in crunchy cornflakes crust served with spicy chutney.",
        "short_description": "Crispy cornflake coated veg momos",
        "base_price": 130.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Chinese",
        "sort_order": 1,
        "tags": ["Bestseller", "Spicy"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half (5 Pcs)", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Full (8 Pcs)", "price_adjustment": 60.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Dips & Extras",
                "min_selection": 0,
                "max_selection": 3,
                "sort_order": 1,
                "options": [
                    {"name": "Cheese Dip", "price": 30.0, "sort_order": 1},
                    {"name": "Spicy Schezwan Dip", "price": 20.0, "sort_order": 2},
                    {"name": "Extra Mayonnaise", "price": 15.0, "sort_order": 3},
                ]
            }
        ]
    },
    {
        "category_slug": "starters-momos",
        "name": "Steamed Paneer Momos",
        "description": "Soft thin-flour dumplings stuffed with spiced cottage cheese and fresh herbs.",
        "short_description": "Soft steamed paneer dumplings",
        "base_price": 120.0,
        "is_veg": True,
        "is_popular": False,
        "gst_percent": 5.0,
        "kds_station": "Chinese",
        "sort_order": 2,
        "tags": ["Jain Option"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half (5 Pcs)", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Full (8 Pcs)", "price_adjustment": 50.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": []
    },
    {
        "category_slug": "indian-main-course",
        "name": "Paneer Butter Masala",
        "description": "Rich, creamy cashew tomato gravy with soft cottage cheese cubes finished with fresh butter.",
        "short_description": "Rich creamy cottage cheese gravy",
        "base_price": 220.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Main",
        "sort_order": 1,
        "tags": ["Bestseller", "Chef Special"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Full", "price_adjustment": 120.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Gravy Customizations",
                "min_selection": 0,
                "max_selection": 2,
                "sort_order": 1,
                "options": [
                    {"name": "Extra Amul Butter", "price": 30.0, "sort_order": 1},
                    {"name": "Extra Fresh Cream", "price": 25.0, "sort_order": 2},
                ]
            }
        ]
    },
    {
        "category_slug": "indian-main-course",
        "name": "Dal Makhani (Overnight Cooked)",
        "description": "Black lentils slow-cooked overnight with spices, butter, and cream.",
        "short_description": "Slow-cooked black lentils with cream",
        "base_price": 190.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Main",
        "sort_order": 2,
        "tags": ["Bestseller"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Full", "price_adjustment": 100.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": []
    },
    {
        "category_slug": "pizzas-breads",
        "name": "Farmhouse Loaded Pizza",
        "description": "Hand-tossed pizza crust topped with capsicum, onion, tomato, jalapenos, and mozzarella.",
        "short_description": "Hand-tossed veggie loaded pizza",
        "base_price": 240.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Western",
        "sort_order": 1,
        "tags": ["Bestseller"],
        "variant_groups": [
            {
                "name": "Pizza Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Personal (7\")", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Medium (10\")", "price_adjustment": 130.0, "is_default": False, "sort_order": 2},
                    {"name": "Large (12\")", "price_adjustment": 230.0, "is_default": False, "sort_order": 3},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Crust Upgrade & Extra Toppings",
                "min_selection": 0,
                "max_selection": 3,
                "sort_order": 1,
                "options": [
                    {"name": "Cheese Burst Crust", "price": 90.0, "sort_order": 1},
                    {"name": "Extra Mozzarella", "price": 50.0, "sort_order": 2},
                    {"name": "Extra Jalapenos", "price": 30.0, "sort_order": 3},
                ]
            }
        ]
    },
    {
        "category_slug": "breads-biryani",
        "name": "Tandoori Butter Naan",
        "description": "Traditional clay-oven baked refined flour bread topped with melted Amul butter.",
        "short_description": "Clay-oven baked butter naan",
        "base_price": 45.0,
        "is_veg": True,
        "is_popular": False,
        "gst_percent": 5.0,
        "kds_station": "Tandoor",
        "sort_order": 1,
        "tags": [],
        "variant_groups": [],
        "addon_groups": []
    },
    {
        "category_slug": "beverages-shakes",
        "name": "Thick Cold Coffee with Ice Cream",
        "description": "Chilled blended espresso coffee served with a scoop of vanilla ice cream.",
        "short_description": "Blended espresso with vanilla ice cream",
        "base_price": 110.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Beverages",
        "sort_order": 1,
        "tags": ["Bestseller"],
        "variant_groups": [
            {
                "name": "Glass Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Regular (300ml)", "price_adjustment": 0.0, "is_default": True, "sort_order": 1},
                    {"name": "Large (500ml)", "price_adjustment": 35.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Extra Addons",
                "min_selection": 0,
                "max_selection": 2,
                "sort_order": 1,
                "options": [
                    {"name": "Extra Ice Cream Scoop", "price": 35.0, "sort_order": 1},
                    {"name": "Chocolate Chips", "price": 20.0, "sort_order": 2},
                ]
            }
        ]
    },
    {
        "category_slug": "desserts-chai",
        "name": "Kulhad Masala Chai",
        "description": "Authentic clay-pot brewed ginger cardamom tea.",
        "short_description": "Clay-pot ginger cardamom tea",
        "base_price": 30.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "kds_station": "Beverages",
        "sort_order": 1,
        "tags": ["Bestseller"],
        "variant_groups": [],
        "addon_groups": []
    }
]


from sqlalchemy import select, text


async def seed():
    tenant_id = 1
    branch_id = 1
    
    print("[INIT] Starting Baithak Cafe demo menu seed...")
    from src.core.database.engine import engine, Base
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS selling_price DOUBLE PRECISION DEFAULT 0.0;"))
        await conn.execute(text("ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0.0;"))
        await conn.execute(text("UPDATE menu_variant_options SET selling_price = price WHERE selling_price = 0.0 OR selling_price IS NULL;"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Categories
        cat_map = {}
        for cat_data in DEMO_CATEGORIES:
            stmt = select(MenuCategory).where(
                MenuCategory.tenant_id == tenant_id,
                MenuCategory.slug == cat_data["slug"]
            )
            res = await session.execute(stmt)
            cat = res.scalar_one_or_none()
            if not cat:
                cat = MenuCategory(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    slug=cat_data["slug"],
                    sort_order=cat_data["sort_order"],
                )
                session.add(cat)
                await session.flush()
                print(f"  + Added Category: {cat.name}")
            cat_map[cat_data["slug"]] = cat.id

        # 2. Seed Tags
        tag_map = {}
        for tag_data in DEMO_TAGS:
            stmt = select(MenuTag).where(
                MenuTag.tenant_id == tenant_id,
                MenuTag.name == tag_data["name"]
            )
            res = await session.execute(stmt)
            tag = res.scalar_one_or_none()
            if not tag:
                tag = MenuTag(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    name=tag_data["name"],
                    color=tag_data["color"],
                    icon=tag_data["icon"],
                )
                session.add(tag)
                await session.flush()
                print(f"  + Added Tag: {tag.name}")
            tag_map[tag_data["name"]] = tag.id

        # 3. Seed Items
        for item_data in DEMO_ITEMS:
            cat_id = cat_map[item_data["category_slug"]]
            stmt = select(MenuItem).where(
                MenuItem.tenant_id == tenant_id,
                MenuItem.name == item_data["name"]
            )
            res = await session.execute(stmt)
            existing_item = res.scalar_one_or_none()

            if not existing_item:
                item = MenuItem(
                    tenant_id=tenant_id,
                    branch_id=branch_id,
                    category_id=cat_id,
                    name=item_data["name"],
                    description=item_data.get("description"),
                    short_description=item_data.get("short_description"),
                    base_price=item_data["base_price"],
                    is_veg=item_data["is_veg"],
                    is_popular=item_data["is_popular"],
                    gst_percent=item_data["gst_percent"],
                    kds_station=item_data.get("kds_station", "Main"),
                    sort_order=item_data["sort_order"],
                )
                session.add(item)
                await session.flush()
                print(f"  + Added Menu Item: {item.name}")

                # Attach Tags
                for tag_name in item_data.get("tags", []):
                    if tag_name in tag_map:
                        it_tag = MenuItemTag(
                            tenant_id=tenant_id,
                            branch_id=branch_id,
                            item_id=item.id,
                            tag_id=tag_map[tag_name]
                        )
                        session.add(it_tag)

                # Attach Variant Groups & Options
                for vg_data in item_data.get("variant_groups", []):
                    vg = MenuVariantGroup(
                        tenant_id=tenant_id,
                        branch_id=branch_id,
                        item_id=item.id,
                        name=vg_data["name"],
                        min_selection=vg_data["min_selection"],
                        max_selection=vg_data["max_selection"],
                        is_required=vg_data["is_required"],
                        sort_order=vg_data["sort_order"],
                    )
                    session.add(vg)
                    await session.flush()

                    for opt_data in vg_data.get("options", []):
                        opt_sp = float(opt_data.get("price", opt_data.get("price_adjustment", 0.0)))
                        opt = MenuVariantOption(
                            tenant_id=tenant_id,
                            branch_id=branch_id,
                            group_id=vg.id,
                            name=opt_data["name"],
                            selling_price=opt_sp,
                            price=opt_sp,
                            is_default=opt_data.get("is_default", False),
                            sort_order=opt_data["sort_order"],
                        )
                        session.add(opt)

                # Attach Addon Groups & Options
                for ag_data in item_data.get("addon_groups", []):
                    ag = MenuAddonGroup(
                        tenant_id=tenant_id,
                        branch_id=branch_id,
                        item_id=item.id,
                        name=ag_data["name"],
                        min_selection=ag_data["min_selection"],
                        max_selection=ag_data["max_selection"],
                        sort_order=ag_data["sort_order"],
                    )
                    session.add(ag)
                    await session.flush()

                    for opt_data in ag_data.get("options", []):
                        opt = MenuAddonOption(
                            tenant_id=tenant_id,
                            branch_id=branch_id,
                            group_id=ag.id,
                            name=opt_data["name"],
                            price=opt_data["price"],
                            sort_order=opt_data["sort_order"],
                        )
                        session.add(opt)

        await session.commit()
        print("[SUCCESS] Baithak Cafe demo menu seed completed successfully!")



if __name__ == "__main__":
    asyncio.run(seed())
