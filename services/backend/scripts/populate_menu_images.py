import psycopg2

conn = psycopg2.connect("postgresql://postgres:asd123@localhost:5433/neondb_copy")
cur = conn.cursor()

# 1. Update Menu Categories with high quality representative photography
CATEGORY_IMAGES = {
    1: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80", # Momo's
    2: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80", # Roll
    3: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80", # Noodles & Rice
    4: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=400&q=80", # Others / Snacks
    5: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", # French / Burgers & Sandwiches
    6: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80", # Fries & Pasta
    7: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80", # Pizza
    8: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80", # Drink & Shakes
    9: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80", # Tandoori & Chaap
    10: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80", # Sabji & Dal
    11: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80", # Special Paneer
    12: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80", # Breads & Naan
    13: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80", # Paratha & South Indian
    14: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80", # RRP (Raita, Rice, Papad)
    15: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80", # Thali & Combo
}

for cat_id, img_url in CATEGORY_IMAGES.items():
    cur.execute("UPDATE menu_categories SET image_url = %s WHERE id = %s;", (img_url, cat_id))

print(f"Updated {len(CATEGORY_IMAGES)} categories with image_url")

# 2. Get all menu items
cur.execute("SELECT id, name, category_id FROM menu_items WHERE is_deleted IS NOT TRUE;")
items = cur.fetchall()

def get_dish_image_url(name: str, cat_id: int) -> str:
    n = name.lower()
    
    # ── MOMOS ──
    if "steamed" in n or "steam momo" in n:
        if "paneer" in n:
            return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80"
    if "fry momo" in n or "fried momo" in n:
        if "paneer" in n:
            return "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=500&q=80"
    if "butter momo" in n:
        return "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=500&q=80"
    if "kurkure momo" in n:
        if "paneer" in n:
            return "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80"
    if "tandoori momo" in n:
        return "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=500&q=80"
    if "malai momo" in n:
        return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80"
    if "afgani momo" in n:
        return "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80"
    if "chilli momo" in n:
        return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
    if "cake" in n:
        return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80"

    # ── ROLLS ──
    if "spring roll" in n:
        if "paneer" in n:
            return "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80"
        if "mix" in n:
            return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80"
    if "kathi roll" in n:
        if "paneer tikka" in n or "paneer" in n:
            return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80"
        if "tandoori" in n or "chaap" in n:
            return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
        if "noodle" in n:
            return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80"

    # ── NOODLES & RICE ──
    if "schezwan noodle" in n:
        return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
    if "chilli garlic noodle" in n:
        return "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=500&q=80"
    if "singapuri noodle" in n:
        return "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80"
    if "paneer noodle" in n:
        return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80"
    if "hakka noodle" in n:
        return "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80"
    if "loaded noodle" in n:
        return "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=500&q=80"
    if "noodle" in n:
        return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80"
    
    if "manchurian fried rice" in n:
        return "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80"
    if "paneer fried rice" in n:
        return "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=500&q=80"
    if "schezwan fried rice" in n:
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
    if "chilli garlic fried rice" in n:
        return "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80"
    if "singapuri fried rice" in n:
        return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80"
    if "loaded fried rice" in n or "fried rice" in n:
        return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80"

    # ── SOUPS & SNACKS (OTHERS) ──
    if "hot & sour" in n:
        return "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80"
    if "sweet corn soup" in n:
        return "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=500&q=80"
    if "manchow soup" in n or "soup" in n:
        return "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=500&q=80"
    if "peanut masala" in n:
        return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
    if "corn chaat" in n:
        return "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=500&q=80"
    if "pav bhaji" in n:
        return "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=500&q=80"
    if "pav only" in n:
        return "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=500&q=80"
    if "maggie" in n or "maggi" in n:
        return "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=500&q=80"

    # ── BURGERS, SANDWICHES & WRAPS (FRENCH) ──
    if "paneer sandwich" in n:
        return "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=500&q=80"
    if "cheese sandwich" in n:
        return "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=500&q=80"
    if "tandoori sandwich" in n:
        return "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=500&q=80"
    if "sandwich" in n:
        return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80"
    if "maharaja burger" in n:
        return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80"
    if "cheese burger" in n or "melted cheese burger" in n:
        return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80"
    if "paneer burger" in n:
        return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80"
    if "burger" in n:
        return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
    if "wrap" in n:
        if "paneer" in n:
            return "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=500&q=80"

    # ── FRIES & PASTA ──
    if "peri peri fries" in n:
        return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80"
    if "french fries" in n or "fries" in n:
        return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80"
    if "chilli potato" in n:
        return "https://images.unsplash.com/photo-1518013031184-41d4bf22045e?auto=format&fit=crop&w=500&q=80"
    if "manchurian" in n:
        return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
    if "chilli dry" in n or "chilli gravy" in n:
        return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80"
    if "red sauce pasta" in n:
        return "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=500&q=80"
    if "white sauce pasta" in n:
        return "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=500&q=80"
    if "mix sauce pasta" in n:
        return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80"
    if "pasta" in n:
        return "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=80"

    # ── PIZZA ──
    if "margherita" in n:
        return "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80"
    if "paneer pizza" in n or "peppy paneer" in n:
        return "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=500&q=80"
    if "mushroom pizza" in n:
        return "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=500&q=80"
    if "olive" in n:
        return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80"
    if "farm house" in n or "farmhouse" in n or "all in one" in n:
        return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
    if "pizza" in n:
        return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80"

    # ── DRINKS & SHAKES ──
    if "chai" in n or "tea" in n:
        return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80"
    if "cold coffee" in n:
        return "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80"
    if "black coffee" in n:
        return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80"
    if "coffee" in n:
        return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80"
    if "coke" in n:
        return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80"
    if "dew" in n:
        return "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=500&q=80"
    if "nimbu pani" in n:
        return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80"
    if "ice cream" in n:
        if "chocolate" in n:
            return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80"
        if "strawberry" in n:
            return "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=500&q=80"
        if "kesar pista" in n:
            return "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=500&q=80"
    if "shake" in n:
        if "banana" in n and "chocolate" in n:
            return "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=80"
        if "banana" in n:
            return "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=80"
        if "mango" in n:
            return "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80"
        if "strawberry" in n:
            return "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=500&q=80"
        if "kitkat" in n or "oreo" in n or "chocolate" in n:
            return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=500&q=80"
    if "mojito" in n:
        if "blue lagoon" in n:
            return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80"
        if "green apple" in n:
            return "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=500&q=80"
        if "kala khatta" in n:
            return "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=500&q=80"
        if "strawberry" in n:
            return "https://images.unsplash.com/photo-1500217052183-bc01ebd1a74e?auto=format&fit=crop&w=500&q=80"
        if "orange" in n:
            return "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=80"
        if "pineapple" in n:
            return "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80"

    # ── TANDOORI & KEBABS ──
    if "chaap" in n and ("tandoori" in n or "dry" in n or cat_id == 9):
        if "malai" in n:
            return "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=500&q=80"
        return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
    if "kebab" in n or "sholay" in n:
        return "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80"
    if "paneer tikka" in n or "mushroom tikka" in n:
        return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80"

    # ── SABJI & CURRIES ──
    if "dal makhani" in n:
        return "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=80"
    if "dal" in n:
        return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80"
    if "chole" in n:
        return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"
    if "rajma" in n:
        return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80"
    if "malai kofta" in n or "korma" in n:
        return "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=500&q=80"
    if "chaap gravy" in n:
        return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80"
    if cat_id == 10: # Sabji
        return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80"

    # ── SPECIAL PANEER ──
    if "paneer butter masala" in n or "lababdar" in n:
        return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80"
    if "shahi paneer" in n:
        return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80"
    if "kadai paneer" in n or "tikka masala" in n:
        return "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500&q=80"
    if "palak paneer" in n:
        return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80"
    if cat_id == 11 or "paneer" in n:
        return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80"

    # ── BREADS & NAANS ──
    if "naan" in n:
        return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80"
    if "lachha paratha" in n:
        return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80"
    if "roti" in n:
        return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80"
    if "salad" in n:
        return "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"

    # ── PARATHA & SOUTH INDIAN ──
    if "paratha" in n:
        return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80"
    if "dosa" in n:
        return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"
    if "idli" in n or "vada" in n:
        return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"

    # ── RRP (RAITA, RICE, PAPAD) ──
    if "raita" in n or "dahi" in n:
        return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80"
    if "lassi" in n or "chaach" in n:
        return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80"
    if "papad" in n:
        return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80"
    if "biryani" in n or "pulao" in n:
        return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80"
    if "rice" in n:
        return "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=500&q=80"

    # ── THALI & COMBOS ──
    if "thali" in n or "combo" in n:
        return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80"

    # Default fallback
    return CATEGORY_IMAGES.get(cat_id, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80")

# 3. Update all menu items in PostgreSQL
updated_count = 0
for item_id, item_name, cat_id in items:
    img = get_dish_image_url(item_name, cat_id)
    cur.execute("UPDATE menu_items SET image_url = %s WHERE id = %s;", (img, item_id))
    updated_count += 1

conn.commit()
print(f"Successfully populated unique food photo URLs for all {updated_count} menu items in PostgreSQL!")

# 4. Verify in DB
cur.execute("SELECT count(*) FROM menu_items WHERE image_url IS NOT NULL AND is_deleted IS NOT TRUE;")
non_null_count = cur.fetchone()[0]
print(f"Verification: {non_null_count} items now have photo URLs stored in PostgreSQL.")

conn.close()
