"""
The ssrone – Seed Demo Menu Script
Populates database with realistic ssrone Cafe menu items, categories, normalized variant groups, options, addon groups, options, and tags.
Run: ..\.venv\Scripts\python scripts/seed_demo_menu.py
"""
import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, text
from src.core.database.engine import AsyncSessionLocal, engine, Base
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
    {"name": "Beverages & Chai", "icon": "CupSoda", "slug": "beverages-chai", "sort_order": 1},
    {"name": "Breads & Roti", "icon": "Utensils", "slug": "breads-roti", "sort_order": 2},
    {"name": "Indian Main Course", "icon": "ChefHat", "slug": "indian-main-course", "sort_order": 3},
    {"name": "Pizzas & Western", "icon": "Flame", "slug": "pizzas-western", "sort_order": 4},
    {"name": "Starters & Momos", "icon": "Package", "slug": "starters-momos", "sort_order": 5},
]

DEMO_TAGS = [
    {"name": "Bestseller", "color": "#ef4444", "icon": "Star"},
    {"name": "Spicy", "color": "#f97316", "icon": "Flame"},
    {"name": "Chef Special", "color": "#8b5cf6", "icon": "Sparkles"},
    {"name": "Jain Option", "color": "#10b981", "icon": "Check"},
]

DEMO_ITEMS = [
    {
        "category_slug": "beverages-chai",
        "name": "Kulhad Masala Chai",
        "description": "Authentic clay-pot brewed ginger cardamom tea.",
        "short_description": "Clay-pot ginger tea",
        "base_price": 20.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "packaging_charge": 0.0,
        "kds_station": "Beverages",
        "sort_order": 1,
        "tags": ["Bestseller"],
        "variant_groups": [],
        "addon_groups": []
    },
    {
        "category_slug": "breads-roti",
        "name": "Tawa Roti",
        "description": "Fresh whole wheat tawa cooked Indian flatbread.",
        "short_description": "Whole wheat tawa roti",
        "base_price": 10.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "packaging_charge": 0.0,
        "kds_station": "Tandoor",
        "sort_order": 2,
        "tags": [],
        "variant_groups": [
            {
                "name": "Roti Type",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Plain Tawa Roti", "selling_price": 10.0, "price": 10.0, "is_default": True, "sort_order": 1},
                    {"name": "Tawa Roti with Butter", "selling_price": 12.0, "price": 12.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": []
    },
    {
        "category_slug": "indian-main-course",
        "name": "Kadai Paneer",
        "description": "Cottage cheese cooked with capsicum, onions, and freshly ground spices in a traditional wok.",
        "short_description": "Wok-tossed spicy cottage cheese",
        "base_price": 130.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "packaging_charge": 10.0,
        "kds_station": "Main",
        "sort_order": 3,
        "tags": ["Bestseller", "Chef Special"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half Portion", "selling_price": 130.0, "price": 130.0, "is_default": True, "sort_order": 1},
                    {"name": "Full Portion", "selling_price": 250.0, "price": 250.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Extra Toppings",
                "min_selection": 0,
                "max_selection": 2,
                "sort_order": 1,
                "options": [
                    {"name": "Extra Amul Butter", "price": 25.0, "sort_order": 1},
                    {"name": "Extra Fresh Cream", "price": 20.0, "sort_order": 2},
                ]
            }
        ]
    },
    {
        "category_slug": "pizzas-western",
        "name": "Veg Loaded Pizza",
        "description": "Hand-tossed pizza crust loaded with crisp capsicum, onion, tomato, jalapenos, and melted mozzarella cheese.",
        "short_description": "Veggie loaded hand-tossed pizza",
        "base_price": 180.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "packaging_charge": 10.0,
        "kds_station": "Western",
        "sort_order": 4,
        "tags": ["Bestseller"],
        "variant_groups": [
            {
                "name": "Pizza Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Small (7\")", "selling_price": 150.0, "price": 150.0, "is_default": False, "sort_order": 1},
                    {"name": "Medium (10\")", "selling_price": 180.0, "price": 180.0, "is_default": True, "sort_order": 2},
                    {"name": "Large (12\")", "selling_price": 230.0, "price": 230.0, "is_default": False, "sort_order": 3},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Crust Upgrade & Addons",
                "min_selection": 0,
                "max_selection": 3,
                "sort_order": 1,
                "options": [
                    {
                        "name": "Cheese Burst Crust",
                        "price": 80.0,
                        "variant_prices": {
                            "Small (7\")": 50.0,
                            "Medium (10\")": 80.0,
                            "Large (12\")": 100.0
                        },
                        "sort_order": 1
                    },
                    {
                        "name": "Extra Mozzarella Cheese",
                        "price": 40.0,
                        "variant_prices": {
                            "Small (7\")": 30.0,
                            "Medium (10\")": 40.0,
                            "Large (12\")": 60.0
                        },
                        "sort_order": 2
                    }
                ]
            }
        ]
    },
    {
        "category_slug": "starters-momos",
        "name": "Kurkure Veg Momos",
        "description": "Crispy fried veg momos coated in crunchy cornflakes crust served with spicy chutney.",
        "short_description": "Crispy cornflakes coated momos",
        "base_price": 130.0,
        "is_veg": True,
        "is_popular": True,
        "gst_percent": 5.0,
        "packaging_charge": 10.0,
        "kds_station": "Chinese",
        "sort_order": 5,
        "tags": ["Bestseller", "Spicy"],
        "variant_groups": [
            {
                "name": "Portion Size",
                "min_selection": 1,
                "max_selection": 1,
                "is_required": True,
                "sort_order": 1,
                "options": [
                    {"name": "Half (5 Pcs)", "selling_price": 130.0, "price": 130.0, "is_default": True, "sort_order": 1},
                    {"name": "Full (8 Pcs)", "selling_price": 190.0, "price": 190.0, "is_default": False, "sort_order": 2},
                ]
            }
        ],
        "addon_groups": [
            {
                "name": "Dips & Sauces",
                "min_selection": 0,
                "max_selection": 2,
                "sort_order": 1,
                "options": [
                    {"name": "Cheese Dip", "price": 30.0, "sort_order": 1},
                    {"name": "Spicy Schezwan Dip", "price": 20.0, "sort_order": 2},
                ]
            }
        ]
    }
]


async def seed():
    tenant_id = 1
    branch_id = 1
    
    print("[INIT] Starting SSR One AI Cafe demo menu seed...")
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS packaging_charge DOUBLE PRECISION DEFAULT 0.0;"))
        await conn.execute(text("ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS selling_price DOUBLE PRECISION DEFAULT 0.0;"))
        await conn.execute(text("ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS price DOUBLE PRECISION DEFAULT 0.0;"))
        await conn.execute(text("ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS variant_prices JSONB DEFAULT '{}'::jsonb;"))
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
                    packaging_charge=item_data.get("packaging_charge", 0.0),
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
                        opt_sp = float(opt_data.get("selling_price", opt_data.get("price", 0.0)))
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
                            variant_prices=opt_data.get("variant_prices", {}),
                            sort_order=opt_data["sort_order"],
                        )
                        session.add(opt)

        await session.commit()
        print("[SUCCESS] SSR One AI Cafe demo menu seed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
