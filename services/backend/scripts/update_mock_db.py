"""
Updates mock-db.ts with seeded products, customers, and tables.
"""
import os
import json

def generate_mock_db():
    # Define same menu categories
    categories = [
        "Veg.Momo's", "Paneer Momo's", "Spring Rolls", "Kathi Roll", "Noodles",
        "Soup", "Sandwich", "Fries", "Pasta", "Fried Rice", "Pizza", "Burger",
        "Wrap", "Snacks", "Paav Bhaji", "Chinese Combo", "Extra Loaded Veg Maggie",
        "Shakes", "Mojito", "Tandoori Chaap", "Kebab", "Tandoori Tikka"
    ]

    # Define items (Name, Category, Price, isVeg, isPopular, tags, variants, addons)
    momo_addons = [{"name": "Kurkure Crispiness", "price": 30.0}]
    roll_addons = [{"name": "Kurkure Crispiness", "price": 30.0}]
    pizza_addons = [{"name": "Cheese Burst", "price": 90.0, "price_by_size": {"Small": 50.0, "Medium": 90.0, "Large": 120.0}}]
    shake_addons = [{"name": "Extra Ice Cream", "price": 20.0}]

    def pizza_variants(s, m, l):
        return [{"name": "Size", "options": [{"name": "Small", "price": float(s)}, {"name": "Medium", "price": float(m)}, {"name": "Large", "price": float(l)}]}]

    sandwich_variants = [{"name": "Style", "options": [{"name": "Oven", "price": 0.0}, {"name": "Grilled", "price": 20.0}]}]

    chaap_variants = [{"name": "Portion", "options": [{"name": "Half", "price": 150.0}, {"name": "Full", "price": 230.0}]}]
    chaap_variants_malai = [{"name": "Portion", "options": [{"name": "Half", "price": 160.0}, {"name": "Full", "price": 250.0}]}]
    tikka_variants = [{"name": "Portion", "options": [{"name": "Half", "price": 140.0}, {"name": "Full", "price": 220.0}]}]
    tikka_variants_paneer = [{"name": "Portion", "options": [{"name": "Half", "price": 180.0}, {"name": "Full", "price": 290.0}]}]
    tikka_variants_malai = [{"name": "Portion", "options": [{"name": "Half", "price": 190.0}, {"name": "Full", "price": 300.0}]}]

    raw_items = [
        ("Veg Steam Momos", "Veg.Momo's", 60.0, True, True, ["Bestseller"], [{"name": "Size", "options": [{"name": "Half", "price": 60.0}, {"name": "Full", "price": 80.0}]}], momo_addons),
        ("Veg. Fry Momos", "Veg.Momo's", 70.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 70.0}, {"name": "Full", "price": 100.0}]}], momo_addons),
        ("Veg. Butter Momos", "Veg.Momo's", 80.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 80.0}, {"name": "Full", "price": 110.0}]}], momo_addons),
        ("Veg. Kurkure Momos", "Veg.Momo's", 100.0, True, True, ["Trending"], [{"name": "Size", "options": [{"name": "Half", "price": 100.0}, {"name": "Full", "price": 140.0}]}], []),
        ("Veg. Tandoori Momos", "Veg.Momo's", 140.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 140.0}]}], []),
        ("Veg. Malai Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []),
        ("Veg. Afgani Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []),
        ("Veg. Chilli Momos", "Veg.Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []),

        ("Paneer Steam Momos", "Paneer Momo's", 70.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 70.0}, {"name": "Full", "price": 100.0}]}], momo_addons),
        ("Paneer Fry Momos", "Paneer Momo's", 90.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 90.0}, {"name": "Full", "price": 120.0}]}], momo_addons),
        ("Paneer Butter Momos", "Paneer Momo's", 100.0, True, False, [], [{"name": "Size", "options": [{"name": "Half", "price": 100.0}, {"name": "Full", "price": 140.0}]}], momo_addons),
        ("Paneer Kurkure Momos", "Paneer Momo's", 120.0, True, True, ["Trending"], [{"name": "Size", "options": [{"name": "Half", "price": 120.0}, {"name": "Full", "price": 160.0}]}], []),
        ("Paneer Tandoori Momos", "Paneer Momo's", 160.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 160.0}]}], []),
        ("Paneer Malai Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []),
        ("Paneer Afgani Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []),
        ("Paneer Chilli Momos", "Paneer Momo's", 180.0, True, False, [], [{"name": "Size", "options": [{"name": "Full", "price": 180.0}]}], []),

        ("Veg. Roll", "Spring Rolls", 90.0, True, False, [], [], roll_addons),
        ("Paneer Roll", "Spring Rolls", 120.0, True, True, ["High Margin"], [], roll_addons),
        ("Mix Roll", "Spring Rolls", 140.0, True, False, [], [], roll_addons),

        ("Veg. Kathi Roll", "Kathi Roll", 90.0, True, False, [], [], []),
        ("Noodle Roll", "Kathi Roll", 100.0, True, False, [], [], []),
        ("Paneer Kathi Roll", "Kathi Roll", 120.0, True, True, ["Bestseller"], [], []),
        ("Mix Kathi Roll", "Kathi Roll", 140.0, True, False, [], [], []),
        ("Tandoori Chaap Roll", "Kathi Roll", 130.0, True, False, [], [], []),
        ("Tandoori Malai Chaap Roll", "Kathi Roll", 150.0, True, False, [], [], []),
        ("Tandoori Afgani Chaap Roll", "Kathi Roll", 150.0, True, False, [], [], []),
        ("Tandoori Paneer Tikka Roll", "Kathi Roll", 170.0, True, True, [], [], []),

        ("Veg. Noodles", "Noodles", 100.0, True, False, [], [], []),
        ("Schezwan Noodles", "Noodles", 130.0, True, False, [], [], []),
        ("Chilli Garlic Noodles", "Noodles", 150.0, True, True, ["High Margin"], [], []),
        ("Singa-puri Noodles", "Noodles", 160.0, True, False, [], [], []),
        ("Paneer Noodles", "Noodles", 170.0, True, False, [], [], []),
        ("Hakka Noodles", "Noodles", 200.0, True, True, ["Bestseller"], [], []),
        ("Special Veg. Loaded Noodles", "Noodles", 250.0, True, False, [], [], []),

        ("Veg. Hot & Sour Soup", "Soup", 100.0, True, False, [], [], []),
        ("Sweet Corn Soup", "Soup", 120.0, True, False, [], [], []),
        ("Manchow Soup", "Soup", 150.0, True, True, [], [], []),

        ("Veg Sandwich", "Sandwich", 100.0, True, False, [], sandwich_variants, []),
        ("Paneer Sandwich", "Sandwich", 120.0, True, True, ["Bestseller"], sandwich_variants, []),
        ("Tandoori Sandwich", "Sandwich", 160.0, True, False, [], sandwich_variants, []),
        ("Cheese Sandwich", "Sandwich", 180.0, True, False, [], sandwich_variants, []),

        ("French Fries", "Fries", 100.0, True, False, [], [], []),
        ("Periperi Fries", "Fries", 120.0, True, True, ["Trending"], [], []),
        ("Chilli Potato", "Fries", 140.0, True, False, [], [], []),
        ("Honey Chilli Potato", "Fries", 160.0, True, True, ["Bestseller"], [], []),
        ("Manchurian Dry", "Fries", 140.0, True, False, [], [], []),
        ("Manchurian Gravy", "Fries", 160.0, True, False, [], [], []),
        ("Paneer Chilli Dry", "Fries", 250.0, True, False, [], [], []),
        ("Paneer Chilli Gravy", "Fries", 280.0, True, False, [], [], []),
        ("Mushroom Chilli Dry", "Fries", 250.0, True, False, [], [], []),
        ("Gobi Chilli Dry", "Fries", 230.0, True, False, [], [], []),
        ("Soya Chilli Dry", "Fries", 200.0, True, False, [], [], []),

        ("Red Sauce Pasta", "Pasta", 150.0, True, False, [], [], []),
        ("White Sauce Pasta", "Pasta", 170.0, True, True, ["Bestseller"], [], []),
        ("Mix Sauce Pasta", "Pasta", 170.0, True, False, [], [], []),
        ("Sweet Corn Pasta", "Pasta", 190.0, True, False, [], [], []),
        ("Paneer Pasta", "Pasta", 220.0, True, False, [], [], []),
        ("Special Veg. Loaded Pasta", "Pasta", 250.0, True, False, [], [], []),

        ("Veg. Fried Rice", "Fried Rice", 100.0, True, False, [], [], []),
        ("Manchurian Fried Rice", "Fried Rice", 120.0, True, False, [], [], []),
        ("Paneer Fried Rice", "Fried Rice", 140.0, True, False, [], [], []),
        ("Schezwan Fried Rice", "Fried Rice", 140.0, True, False, [], [], []),
        ("Chilli Garlic Fried Rice", "Fried Rice", 150.0, True, False, [], [], []),
        ("Singa-Puri Fried Rice", "Fried Rice", 160.0, True, False, [], [], []),
        ("Special Veg. Loaded Fried Rice", "Fried Rice", 200.0, True, True, [], [], []),

        ("Veg Pizza", "Pizza", 170.0, True, True, ["Bestseller"], pizza_variants(170, 230, 290), pizza_addons),
        ("Tandoori Pizza", "Pizza", 240.0, True, True, ["Trending"], pizza_variants(240, 300, 360), pizza_addons),
        ("Sweetcorn Capsicum Pizza", "Pizza", 150.0, True, False, [], pizza_variants(150, 210, 270), pizza_addons),
        ("Margherita Pizza", "Pizza", 170.0, True, True, ["Bestseller"], pizza_variants(170, 230, 290), pizza_addons),
        ("Black Olive Pizza", "Pizza", 190.0, True, False, [], pizza_variants(190, 250, 310), pizza_addons),
        ("Mushroom Pizza", "Pizza", 200.0, True, False, [], pizza_variants(200, 260, 320), pizza_addons),
        ("Paneer Pizza", "Pizza", 210.0, True, False, [], pizza_variants(210, 270, 330), pizza_addons),
        ("Peppy Paneer Pizza", "Pizza", 230.0, True, False, [], pizza_variants(230, 290, 350), pizza_addons),
        ("Indi Tandoori Paneer Pizza", "Pizza", 250.0, True, False, [], pizza_variants(250, 310, 370), pizza_addons),
        ("Farm House Pizza", "Pizza", 260.0, True, True, ["Bestseller"], pizza_variants(260, 320, 380), pizza_addons),
        ("Double Decker Pizza", "Pizza", 280.0, True, False, [], pizza_variants(280, 340, 400), pizza_addons),
        ("All in One Pizza", "Pizza", 300.0, True, False, [], pizza_variants(300, 360, 420), pizza_addons),

        ("Aloo Tikki Burger", "Burger", 60.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 60.0}]}], []),
        ("Veggie Burger", "Burger", 50.0, True, True, ["Bestseller"], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 50.0}, {"name": "Oven", "price": 70.0}]}], []),
        ("Paneer Burger", "Burger", 70.0, True, True, ["Trending"], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 70.0}, {"name": "Oven", "price": 90.0}]}], []),
        ("Cheese Burger", "Burger", 80.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Tawa", "price": 80.0}, {"name": "Oven", "price": 100.0}]}], []),
        ("Melted Cheese Burger", "Burger", 130.0, True, False, [], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 130.0}]}], []),
        ("Maha Raja Burger", "Burger", 160.0, True, True, ["High Margin"], [{"name": "Prep Style", "options": [{"name": "Oven", "price": 160.0}]}], []),

        ("Aloo Tikki Wrap", "Wrap", 120.0, True, False, [], [], []),
        ("Veggie Wrap", "Wrap", 140.0, True, False, [], [], []),
        ("Paneer Wrap", "Wrap", 180.0, True, True, ["Bestseller"], [], []),
        ("Melted Cheese Wrap", "Wrap", 220.0, True, False, [], [], []),

        ("Peanut Masala", "Snacks", 100.0, True, False, [], [], []),
        ("Sweet Highlight Corn Chaat", "Snacks", 100.0, True, False, [], [], []),
        ("Crispy Corn Chaat", "Snacks", 150.0, True, True, ["Trending"], [], []),

        ("Paav Bhaji", "Paav Bhaji", 120.0, True, True, ["Bestseller"], [], [{"name": "Extra Paav", "price": 30.0}]),

        ("Fried Rice & Manchurian Combo", "Chinese Combo", 150.0, True, True, ["High Margin"], [], []),
        ("Noodle & Manchurian Combo", "Chinese Combo", 150.0, True, True, ["Bestseller"], [], []),

        ("Extra Loaded Veg Maggie", "Extra Loaded Veg Maggie", 100.0, True, True, ["Trending"], [], []),

        ("Banana Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Papaya Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Mango Shake", "Shakes", 80.0, True, True, ["Bestseller"], [], shake_addons),
        ("Chikoo Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Mix Shake", "Shakes", 100.0, True, False, [], [], shake_addons),
        ("Cold Coffee", "Shakes", 80.0, True, True, ["Bestseller", "High Margin"], [], shake_addons),
        ("Strawberry Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Butterscotch Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Vanilla Shake", "Shakes", 80.0, True, False, [], [], shake_addons),
        ("Chocolate Shake", "Shakes", 90.0, True, True, [], [], shake_addons),
        ("Chocolate Banana Shake", "Shakes", 90.0, True, False, [], [], shake_addons),
        ("Kitkat Shake", "Shakes", 90.0, True, True, ["Trending"], [], shake_addons),
        ("Oreo Shake", "Shakes", 90.0, True, True, ["Trending"], [], shake_addons),

        ("Virgin Mojito", "Mojito", 99.0, True, True, ["High Margin"], [], []),
        ("Blue Lagoon Mojito", "Mojito", 99.0, True, False, [], [], []),
        ("Green Apple Mojito", "Mojito", 99.0, True, False, [], [], []),
        ("Kala Khatta Mojito", "Mojito", 99.0, True, True, ["Bestseller"], [], []),
        ("Strawberry Mojito", "Mojito", 149.0, True, False, [], [], []),
        ("Guava Mojito", "Mojito", 149.0, True, False, [], [], []),
        ("Orange Mojito", "Mojito", 139.0, True, False, [], [], []),
        ("Pineapple Mojito", "Mojito", 139.0, True, False, [], [], []),

        ("Masala Chaap", "Tandoori Chaap", 150.0, True, False, [], chaap_variants, []),
        ("Achari Chaap", "Tandoori Chaap", 150.0, True, False, [], chaap_variants, []),
        ("Malai Chaap", "Tandoori Chaap", 160.0, True, True, ["Bestseller"], chaap_variants_malai, []),
        ("Afgani Chaap", "Tandoori Chaap", 160.0, True, False, [], chaap_variants_malai, []),

        ("Hara Bhara Kebab", "Kebab", 180.0, True, False, [], [], []),
        ("Veg. Seekh Kebab", "Kebab", 180.0, True, True, [], [], []),
        ("Reshmi Kebab", "Kebab", 200.0, True, False, [], [], []),
        ("Dahi Ke Sholay", "Kebab", 200.0, True, True, ["Bestseller"], [], []),

        ("Tandoori Aloo Tikka", "Tandoori Tikka", 140.0, True, False, [], tikka_variants, []),
        ("Paneer Tikka", "Tandoori Tikka", 180.0, True, True, ["Bestseller"], tikka_variants_paneer, []),
        ("Achari Paneer Tikka", "Tandoori Tikka", 180.0, True, False, [], tikka_variants_paneer, []),
        ("Malai Paneer Tikka", "Tandoori Tikka", 190.0, True, True, ["Trending"], tikka_variants_malai, []),
        ("Mushroom Tikka", "Tandoori Tikka", 190.0, True, False, [], tikka_variants_malai, [])
    ]

    products_js = []
    # Seed products for both branches CUH02 and GGN01
    for unit in ["CUH02", "GGN01"]:
        for idx, (name, cat, price, is_veg, is_popular, tags, var_groups, add_groups) in enumerate(raw_items):
            pid = f"prod-{unit.lower()}-{idx + 1}"
            code = f"DISH-{unit}-{idx + 1:03d}"
            products_js.append({
                "id": pid,
                "tenant_id": "baithak-demo-tenant",
                "unit_code": unit,
                "branch_id": unit,
                "name": name,
                "code": code,
                "barcode": str(10000000 + idx),
                "category": cat,
                "product_type": "food",
                "mrp": price,
                "selling_price": price,
                "cost_price": round(price * 0.4, 2),
                "unit_of_measure": "plate",
                "track_inventory": True,
                "reorder_level": 10,
                "is_active": True,
                "is_vegetarian": is_veg,
                "is_popular": is_popular,
                "tags": tags,
                "variant_groups": var_groups,
                "addon_groups": add_groups,
                "images": []
            })

    customers_js = [
        {
            "id": "cust-1",
            "tenant_id": "baithak-demo-tenant",
            "branch_id": "CUH02",
            "first_name": "Sumit",
            "last_name": "Singh",
            "email": "sumit@baithak.com",
            "phone": "9999999999",
            "loyalty_tier": "gold",
            "loyalty_points": 450,
            "wallet_balance": 0.0,
            "lifetime_spent": 4500.0,
            "total_visits": 15,
            "last_visit_at": "2026-07-14T18:00:00Z",
            "preferences": {"favorite_item": "Veg Pizza", "last_order_text": "Veg Pizza Medium with Cheese Burst"},
            "is_active": True
        },
        {
            "id": "cust-2",
            "tenant_id": "baithak-demo-tenant",
            "branch_id": "CUH02",
            "first_name": "Chunu",
            "last_name": "Rao",
            "email": "chunu@baithak.com",
            "phone": "7056841994",
            "loyalty_tier": "platinum",
            "loyalty_points": 820,
            "wallet_balance": 0.0,
            "lifetime_spent": 8900.0,
            "total_visits": 24,
            "last_visit_at": "2026-07-14T18:00:00Z",
            "preferences": {"favorite_item": "Cold Coffee", "last_order_text": "Kitkat Shake with Extra Ice Cream"},
            "is_active": True
        },
        {
            "id": "cust-3",
            "tenant_id": "baithak-demo-tenant",
            "branch_id": "CUH02",
            "first_name": "Mohit",
            "last_name": "Bhanja",
            "email": "mohit@baithak.com",
            "phone": "8683849395",
            "loyalty_tier": "silver",
            "loyalty_points": 120,
            "wallet_balance": 0.0,
            "lifetime_spent": 1800.0,
            "total_visits": 6,
            "last_visit_at": "2026-07-14T18:00:00Z",
            "preferences": {"favorite_item": "Veg Steam Momos", "last_order_text": "Veg Steam Momos Half"},
            "is_active": True
        }
    ]

    tables_js = []
    for unit in ["CUH02", "GGN01"]:
        for i in range(1, 11):
            tables_js.append({
                "id": f"table-{unit.lower()}-{i}",
                "tenant_id": "baithak-demo-tenant",
                "branch_id": unit,
                "number": f"T{i}",
                "capacity": 4,
                "status": "free",
                "is_active": True
            })

    # Read mock-db.ts
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.dirname(os.path.dirname(script_dir))
    mock_db_path = os.path.join(workspace_root, "apps", "admin-web", "src", "shared", "utils", "mock-db.ts")
    with open(mock_db_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replacements
    custs_str = f"const SEED_CUSTOMERS: any[] = {json.dumps(customers_js, indent=2)};"
    prods_str = f"const SEED_PRODUCTS: any[] = {json.dumps(products_js, indent=2)};"
    tables_str = f"const SEED_TABLES: any[] = {json.dumps(tables_js, indent=2)};"

    import re
    content = re.sub(r"const SEED_CUSTOMERS:\s*any\[\]\s*=\s*\[\]\s*;", custs_str, content)
    content = re.sub(r"const SEED_PRODUCTS:\s*any\[\]\s*=\s*\[\]\s*;", prods_str, content)
    content = re.sub(r"const SEED_TABLES:\s*any\[\]\s*=\s*\[\]\s*;", tables_str, content)

    print("[INFO] Single Source of Truth Enabled: Database is the only runtime truth source. Skipping frontend mock-db.ts overwrite.")

if __name__ == "__main__":
    generate_mock_db()

