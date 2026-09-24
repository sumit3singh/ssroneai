-- =============================================================================
-- SSR One AI – Baithak Cafe Complete Master Menu Seed
-- Tenant: 1 (Baithak Cafe), Company: 1, Branch: 1 (CUH Outlet), User: 10
-- Kitchen Stations: Indian (IND), Chinese (CHN), Italian (ITL), Drinks (DRK)
-- Proper Title Capitalization for Categories, Items, Variants & Addons
-- 100% DIRECT INSERTS INTO REAL TABLES:
--   1. public.menu_categories
--   2. public.menu_items
--   3. public.menu_variant_groups
--   4. public.menu_variant_options
--   5. public.menu_addon_groups
--   6. public.menu_addon_options
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. DIRECT INSERT: public.menu_categories (15 Categories in Title Case)
-- -----------------------------------------------------------------------------
INSERT INTO public.menu_categories (
    id, tenant_id, company_id, branch_id, name, slug, icon, level, sort_order, created_by, is_deleted
) VALUES
(1,  1, 1, 1, 'Momo''s',             'momos',             'package',   1, 1,  10, false),
(2,  1, 1, 1, 'Roll',               'roll',              'utensils',  1, 2,  10, false),
(3,  1, 1, 1, 'Noodles & Rice',     'noodles-rice',      'bowl-rice', 1, 3,  10, false),
(4,  1, 1, 1, 'Others',             'others',            'sparkles',  1, 4,  10, false),
(5,  1, 1, 1, 'French',             'french',            'sandwich',  1, 5,  10, false),
(6,  1, 1, 1, 'Fries & Pasta',      'fries-pasta',       'flame',     1, 6,  10, false),
(7,  1, 1, 1, 'Pizza',              'pizza',             'pizza',     1, 7,  10, false),
(8,  1, 1, 1, 'Drink',              'drink',             'cup-soda',  1, 8,  10, false),
(9,  1, 1, 1, 'Tandoori',           'tandoori',          'flame',     1, 9,  10, false),
(10, 1, 1, 1, 'Sabji',              'sabji',             'bowl-food', 1, 10, 10, false),
(11, 1, 1, 1, 'Special Paneer',     'special-paneer',    'crown',     1, 11, 10, false),
(12, 1, 1, 1, 'Breads',             'breads',            'wheat',     1, 12, 10, false),
(13, 1, 1, 1, 'Paratha, South-Ind', 'paratha-south-ind', 'utensils',  1, 13, 10, false),
(14, 1, 1, 1, 'RRP',                'rrp',               'bowl-rice', 1, 14, 10, false),
(15, 1, 1, 1, 'Thali, Combo',       'thali-combo',       'award',     1, 15, 10, false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

SELECT setval('public.menu_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_categories));


-- -----------------------------------------------------------------------------
-- 2. DIRECT INSERT: public.menu_items (229 Items with Title Capitalization)
-- -----------------------------------------------------------------------------
INSERT INTO public.menu_items (
    id, tenant_id, company_id, branch_id, category_id, item_code, name, price, cost_price, tax_rate, is_veg, is_popular, is_available, kds_station, description, short_description, packaging_charge, sort_order, created_by, created_at, updated_at, is_deleted
) VALUES
-- 1. Momo's (Category 1, Station: Chinese)
(1,  1, 1, 1, 1, 'MOM-001', 'Veg. Steam Momos',        80.00, 25.00, 5.00, true, true,  true, 'Chinese', 'Delicate steamed vegetable dumplings', 'Steamed Veg Momos', 10.00, 1, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(2,  1, 1, 1, 1, 'MOM-002', 'Veg. Fry Momos',         100.00, 30.00, 5.00, true, true,  true, 'Chinese', 'Crispy deep-fried vegetable dumplings', 'Crispy Fried Veg Momos', 10.00, 2, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(3,  1, 1, 1, 1, 'MOM-003', 'Veg. Butter Momos',      110.00, 35.00, 5.00, true, false, true, 'Chinese', 'Pan-tossed veg dumplings in butter and mild spices', 'Butter Veg Momos', 10.00, 3, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(4,  1, 1, 1, 1, 'MOM-004', 'Veg. Kurkure Momos',     140.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Crunchy crumb-coated fried veg momos', 'Kurkure Veg Momos', 10.00, 4, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(5,  1, 1, 1, 1, 'MOM-005', 'Veg. Tandoori Momos',    140.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Tandoor roasted veg dumplings in red masala', 'Tandoori Veg Momos', 10.00, 5, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(6,  1, 1, 1, 1, 'MOM-006', 'Veg. Malai Momos',       160.00, 50.00, 5.00, true, false, true, 'Chinese', 'Momos tossed in cashew cream and butter', 'Malai Veg Momos', 10.00, 6, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(7,  1, 1, 1, 1, 'MOM-007', 'Veg. Afgani Momos',      160.00, 50.00, 5.00, true, false, true, 'Chinese', 'Momos tossed in rich creamy Afghani sauce', 'Afgani Veg Momos', 10.00, 7, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(8,  1, 1, 1, 1, 'MOM-008', 'Veg. Chilli Momos',      160.00, 50.00, 5.00, true, true,  true, 'Chinese', 'Momos tossed in spicy chilli garlic soy sauce', 'Chilli Veg Momos', 10.00, 8, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(9,  1, 1, 1, 1, 'MOM-009', 'Paneer Steam Momos',     100.00, 35.00, 5.00, true, true,  true, 'Chinese', 'Steamed dumplings packed with fresh paneer', 'Steamed Paneer Momos', 10.00, 9, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(10, 1, 1, 1, 1, 'MOM-010', 'Paneer Fry Momos',       120.00, 40.00, 5.00, true, true,  true, 'Chinese', 'Golden deep-fried paneer dumplings', 'Fried Paneer Momos', 10.00, 10, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(11, 1, 1, 1, 1, 'MOM-011', 'Paneer Butter Momos',    140.00, 45.00, 5.00, true, false, true, 'Chinese', 'Paneer dumplings tossed in sizzling butter', 'Butter Paneer Momos', 10.00, 11, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(12, 1, 1, 1, 1, 'MOM-012', 'Paneer Kurkure Momos',   160.00, 55.00, 5.00, true, true,  true, 'Chinese', 'Ultra crunchy coated fried paneer momos', 'Kurkure Paneer Momos', 10.00, 12, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(13, 1, 1, 1, 1, 'MOM-013', 'Paneer Tandoori Momos',  160.00, 55.00, 5.00, true, true,  true, 'Chinese', 'Tandoori roasted paneer dumplings with peppers', 'Tandoori Paneer Momos', 10.00, 13, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(14, 1, 1, 1, 1, 'MOM-014', 'Paneer Malai Momos',     180.00, 60.00, 5.00, true, false, true, 'Chinese', 'Paneer momos in creamy malai gravy', 'Malai Paneer Momos', 10.00, 14, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(15, 1, 1, 1, 1, 'MOM-015', 'Paneer Afgani Momos',    180.00, 60.00, 5.00, true, false, true, 'Chinese', 'Paneer momos in rich Afghani white cream gravy', 'Afgani Paneer Momos', 10.00, 15, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(16, 1, 1, 1, 1, 'MOM-016', 'Paneer Chilli Momos',    180.00, 60.00, 5.00, true, true,  true, 'Chinese', 'Paneer momos tossed in spicy chilli garlic sauce', 'Chilli Paneer Momos', 10.00, 16, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 2. Roll (Category 2, Stations: Chinese / Indian)
(17, 1, 1, 1, 2, 'ROL-001', 'Veg. Spring Roll',                 90.00,  30.00, 5.00, true, true,  true, 'Chinese', 'Crispy fried rolls filled with seasoned vegetables', 'Veg Spring Roll', 10.00, 17, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(18, 1, 1, 1, 2, 'ROL-002', 'Paneer Spring Roll',              120.00,  40.00, 5.00, true, true,  true, 'Chinese', 'Crispy rolls stuffed with spiced cottage cheese and veggies', 'Paneer Spring Roll', 10.00, 18, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(19, 1, 1, 1, 2, 'ROL-003', 'Mix Spring Roll',                 140.00,  45.00, 5.00, true, false, true, 'Chinese', 'Loaded roll with paneer, vegetables and noodles', 'Mix Spring Roll', 10.00, 19, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(20, 1, 1, 1, 2, 'ROL-004', 'Veg. Kathi Roll',                  90.00,  30.00, 5.00, true, true,  true, 'Indian',  'Flaky paratha wrap with seasoned mixed vegetables & mint chutney', 'Veg Kathi Roll', 10.00, 20, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(21, 1, 1, 1, 2, 'ROL-005', 'Noodle Kathi Roll',               100.00,  32.00, 5.00, true, false, true, 'Indian',  'Paratha roll stuffed with hakka noodles and tangy sauce', 'Noodle Kathi Roll', 10.00, 21, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(22, 1, 1, 1, 2, 'ROL-006', 'Paneer Kathi Roll',               120.00,  40.00, 5.00, true, true,  true, 'Indian',  'Flaky paratha roll with spiced paneer cubes & green chutney', 'Paneer Kathi Roll', 10.00, 22, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(23, 1, 1, 1, 2, 'ROL-007', 'Mix Kathi Roll',                  140.00,  45.00, 5.00, true, false, true, 'Indian',  'Assorted stuffing of vegetables, noodles and paneer', 'Mix Kathi Roll', 10.00, 23, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(24, 1, 1, 1, 2, 'ROL-008', 'Tandoori Chaap Kathi Roll',       130.00,  42.00, 5.00, true, true,  true, 'Indian',  'Grilled tandoori soya chaap wrapped in paratha with onions', 'Tandoori Chaap Kathi Roll', 10.00, 24, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(25, 1, 1, 1, 2, 'ROL-009', 'Tandoori Malai Chaap Kathi Roll', 150.00,  50.00, 5.00, true, false, true, 'Indian',  'Creamy malai chaap wrapped in flaky flatbread', 'Malai Chaap Kathi Roll', 10.00, 25, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(26, 1, 1, 1, 2, 'ROL-010', 'Tandoori Afgani Chaap Kathi Roll',150.00,  50.00, 5.00, true, false, true, 'Indian',  'Afghani cream chaap rolled in crispy layered paratha', 'Afgani Chaap Kathi Roll', 10.00, 26, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(27, 1, 1, 1, 2, 'ROL-011', 'Tandoori Paneer Tikka Kathi Roll',170.00,  55.00, 5.00, true, true,  true, 'Indian',  'Smoked paneer tikka wrapped with spicy mint chutney', 'Paneer Tikka Kathi Roll', 10.00, 27, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 3. Noodles & Rice (Category 3, Station: Chinese)
(28, 1, 1, 1, 3, 'NDL-001', 'Veg. Noodles',                    100.00, 30.00, 5.00, true, true,  true, 'Chinese', 'Wok-tossed noodles with shredded vegetables and soy', 'Veg Noodles', 10.00, 28, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(29, 1, 1, 1, 3, 'NDL-002', 'Schezwan Noodles',                130.00, 40.00, 5.00, true, true,  true, 'Chinese', 'Fiery wok noodles in spicy Sichuan chili sauce', 'Schezwan Noodles', 10.00, 29, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(30, 1, 1, 1, 3, 'NDL-003', 'Chilli Garlic Noodles',           150.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Noodles tossed with roasted garlic, red chilies and herbs', 'Chilli Garlic Noodles', 10.00, 30, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(31, 1, 1, 1, 3, 'NDL-004', 'Singapuri Noodles',               160.00, 50.00, 5.00, true, false, true, 'Chinese', 'Thin noodles tossed in mild Singaporean curry seasoning', 'Singapuri Noodles', 10.00, 31, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(32, 1, 1, 1, 3, 'NDL-005', 'Paneer Noodles',                  170.00, 55.00, 5.00, true, true,  true, 'Chinese', 'Wok noodles loaded with fresh golden paneer cubes', 'Paneer Noodles', 10.00, 32, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(33, 1, 1, 1, 3, 'NDL-006', 'Hakka Noodles',                   200.00, 65.00, 5.00, true, false, true, 'Chinese', 'Classic Kolkata style Hakka noodles', 'Hakka Noodles', 10.00, 33, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(34, 1, 1, 1, 3, 'NDL-007', 'Special Veg. Loaded Noodles',     250.00, 80.00, 5.00, true, true,  true, 'Chinese', 'Special noodles loaded with paneer, baby corn, mushrooms & veggies', 'Special Veg Loaded Noodles', 15.00, 34, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(35, 1, 1, 1, 3, 'RIC-001', 'Veg. Fried Rice',                 100.00, 30.00, 5.00, true, true,  true, 'Chinese', 'Basmati rice tossed with diced vegetables and soy', 'Veg Fried Rice', 10.00, 35, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(36, 1, 1, 1, 3, 'RIC-002', 'Manchurian Fried Rice',           120.00, 38.00, 5.00, true, true,  true, 'Chinese', 'Fried rice tossed with minced veg manchurian balls', 'Manchurian Fried Rice', 10.00, 36, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(37, 1, 1, 1, 3, 'RIC-003', 'Paneer Fried Rice',               140.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Wok fried rice with soft cottage cheese cubes', 'Paneer Fried Rice', 10.00, 37, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(38, 1, 1, 1, 3, 'RIC-004', 'Schezwan Fried Rice',             140.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Spicy fried rice in homemade Sichuan chili sauce', 'Schezwan Fried Rice', 10.00, 38, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(39, 1, 1, 1, 3, 'RIC-005', 'Chilli Garlic Fried Rice',        150.00, 48.00, 5.00, true, false, true, 'Chinese', 'Basmati rice tossed with browned garlic flakes & chilies', 'Chilli Garlic Fried Rice', 10.00, 39, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(40, 1, 1, 1, 3, 'RIC-006', 'Singapuri Fried Rice',            160.00, 50.00, 5.00, true, false, true, 'Chinese', 'Singapore spiced aromatic yellow fried rice', 'Singapuri Fried Rice', 10.00, 40, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(41, 1, 1, 1, 3, 'RIC-007', 'Special Veg. Loaded Fried Rice',  200.00, 65.00, 5.00, true, true,  true, 'Chinese', 'Fried rice loaded with paneer, mushrooms and baby corn', 'Special Veg Loaded Fried Rice', 15.00, 41, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 4. Others (Category 4, Stations: Chinese / Indian)
(42, 1, 1, 1, 4, 'SOP-001', 'Veg. Hot & Sour Soup',     100.00, 30.00, 5.00, true, true,  true, 'Chinese', 'Tangy and spicy broth filled with shredded vegetables', 'Hot & Sour Soup', 0.00, 42, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(43, 1, 1, 1, 4, 'SOP-002', 'Sweet Corn Soup',          120.00, 35.00, 5.00, true, true,  true, 'Chinese', 'Creamy sweet corn soup with carrots and peas', 'Sweet Corn Soup', 0.00, 43, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(44, 1, 1, 1, 4, 'SOP-003', 'Manchow Soup',             150.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Spicy garlic soup topped with crispy fried noodles', 'Manchow Soup', 0.00, 44, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(45, 1, 1, 1, 4, 'CHT-001', 'Peanut Masala',            100.00, 30.00, 5.00, true, true,  true, 'Indian',  'Crunchy peanuts with chopped onions, tomatoes, green chilies and lemon', 'Peanut Masala', 0.00, 45, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(46, 1, 1, 1, 4, 'CHT-002', 'Sweet Corn Chaat',         100.00, 30.00, 5.00, true, true,  true, 'Indian',  'Steamed sweet corn tossed in butter, chaat spices and lemon', 'Sweet Corn Chaat', 0.00, 46, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(47, 1, 1, 1, 4, 'CHT-003', 'Crispy Corn Chaat',        150.00, 45.00, 5.00, true, true,  true, 'Indian',  'Batter-fried crispy corn with diced peppers and spices', 'Crispy Corn Chaat', 0.00, 47, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(48, 1, 1, 1, 4, 'CHT-004', 'Pav Bhaji',                120.00, 40.00, 5.00, true, true,  true, 'Indian',  'Spiced butter vegetable curry served with 2 toasted pavs', 'Pav Bhaji', 10.00, 48, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(49, 1, 1, 1, 4, 'CHT-005', 'Veg. Fried Rice & Manchurian Gravy', 150.00, 48.00, 5.00, true, true,  true, 'Chinese', 'Value combo of fried rice with saucy veg manchurian gravy', 'Fried Rice Manchurian Combo', 10.00, 49, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(50, 1, 1, 1, 4, 'CHT-006', 'Veg. Noodle & Manchurian Gravy',     150.00, 48.00, 5.00, true, true,  true, 'Chinese', 'Value combo of noodles with saucy veg manchurian gravy', 'Noodle Manchurian Combo', 10.00, 50, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(51, 1, 1, 1, 4, 'CHT-007', 'Extra Loaded Veg Maggie',  100.00, 30.00, 5.00, true, true,  true, 'Indian',  'Street-style noodles loaded with butter and vegetables', 'Loaded Veg Maggie', 0.00, 51, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 5. French (Category 5, Station: Italian)
(52, 1, 1, 1, 5, 'FRN-001', 'Veg Sandwich',             100.00, 32.00, 5.00, true, true,  true, 'Italian', 'Sliced bread with cucumber, tomato, potato, green chutney', 'Veg Sandwich', 10.00, 52, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(53, 1, 1, 1, 5, 'FRN-002', 'Paneer Sandwich',          120.00, 40.00, 5.00, true, true,  true, 'Italian', 'Paneer slices and fresh veggies between toasted bread', 'Paneer Sandwich', 10.00, 53, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(54, 1, 1, 1, 5, 'FRN-003', 'Tandoori Sandwich',        160.00, 50.00, 5.00, true, true,  true, 'Italian', 'Smoky tandoori paneer filling with tandoori mayo', 'Tandoori Sandwich', 10.00, 54, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(55, 1, 1, 1, 5, 'FRN-004', 'Cheese Sandwich',          180.00, 60.00, 5.00, true, true,  true, 'Italian', 'Double mozzarella cheese and herbs toasted golden', 'Cheese Sandwich', 10.00, 55, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(56, 1, 1, 1, 5, 'FRN-005', 'Aloo Tikki Burger',         60.00, 20.00, 5.00, true, true,  true, 'Italian', 'Spiced potato patty with tomato, onions and burger mayo', 'Aloo Tikki Burger', 10.00, 56, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(57, 1, 1, 1, 5, 'FRN-006', 'Veggie Burger',             70.00, 22.00, 5.00, true, true,  true, 'Italian', 'Vegetable patty with lettuce, onion and creamy mayo', 'Veggie Burger', 10.00, 57, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(58, 1, 1, 1, 5, 'FRN-007', 'Paneer Burger',             90.00, 30.00, 5.00, true, true,  true, 'Italian', 'Fried paneer slice with cheese spread and tangy sauce', 'Paneer Burger', 10.00, 58, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(59, 1, 1, 1, 5, 'FRN-008', 'Cheese Burger',            100.00, 35.00, 5.00, true, true,  true, 'Italian', 'Veg patty topped with rich melted yellow cheese slice', 'Cheese Burger', 10.00, 59, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(60, 1, 1, 1, 5, 'FRN-009', 'Melted Cheese Burger',     130.00, 45.00, 5.00, true, true,  true, 'Italian', 'Burger loaded with molten liquid cheese sauce', 'Melted Cheese Burger', 10.00, 60, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(61, 1, 1, 1, 5, 'FRN-010', 'Maharaja Burger',          160.00, 55.00, 5.00, true, true,  true, 'Italian', 'Double vegetable patties, double cheese slices and special sauce', 'Maharaja Burger', 15.00, 61, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(62, 1, 1, 1, 5, 'FRN-011', 'Aloo Tikki Wrap',          120.00, 38.00, 5.00, true, true,  true, 'Italian', 'Crisp potato patty wrapped in warm tortilla with chipotle mayo', 'Aloo Tikki Wrap', 10.00, 62, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(63, 1, 1, 1, 5, 'FRN-012', 'Veggie Wrap',              140.00, 45.00, 5.00, true, true,  true, 'Italian', 'Garden vegetables wrapped in soft flour tortilla', 'Veggie Wrap', 10.00, 63, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(64, 1, 1, 1, 5, 'FRN-013', 'Paneer Wrap',              180.00, 60.00, 5.00, true, true,  true, 'Italian', 'Spiced paneer cubes wrapped with fresh mint and dressing', 'Paneer Wrap', 10.00, 64, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(65, 1, 1, 1, 5, 'FRN-014', 'Melted Cheese Wrap',       220.00, 75.00, 5.00, true, true,  true, 'Italian', 'Tortilla stuffed with paneer and molten cheese sauce', 'Melted Cheese Wrap', 10.00, 65, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 6. Fries & Pasta (Category 6, Stations: Chinese / Italian)
(66, 1, 1, 1, 6, 'FRP-001', 'French Fries',             100.00, 30.00, 5.00, true, true,  true, 'Chinese', 'Crispy deep fried salted potato fries', 'French Fries', 10.00, 66, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(67, 1, 1, 1, 6, 'FRP-002', 'Peri Peri Fries',          120.00, 35.00, 5.00, true, true,  true, 'Chinese', 'Crispy fries dusted with spicy peri-peri seasoning', 'Peri Peri Fries', 10.00, 67, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(68, 1, 1, 1, 6, 'FRP-003', 'Chilli Potato',            140.00, 42.00, 5.00, true, true,  true, 'Chinese', 'Crispy potato fingers tossed in chilli garlic sauce', 'Chilli Potato', 10.00, 68, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(69, 1, 1, 1, 6, 'FRP-004', 'Honey Chilli Potato',      160.00, 48.00, 5.00, true, true,  true, 'Chinese', 'Crispy potato tossed in honey and red chili glaze', 'Honey Chilli Potato', 10.00, 69, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(70, 1, 1, 1, 6, 'FRP-005', 'Manchurian Dry',           140.00, 45.00, 5.00, true, true,  true, 'Chinese', 'Crispy mixed veg balls tossed with garlic and scallions', 'Manchurian Dry', 10.00, 70, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(71, 1, 1, 1, 6, 'FRP-006', 'Manchurian Gravy',         160.00, 50.00, 5.00, true, true,  true, 'Chinese', 'Vegetable dumplings in savory dark soy garlic gravy', 'Manchurian Gravy', 10.00, 71, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(72, 1, 1, 1, 6, 'FRP-007', 'Paneer Chilli Dry',        250.00, 80.00, 5.00, true, true,  true, 'Chinese', 'Crisp paneer cubes tossed with onion petals and capsicum', 'Paneer Chilli Dry', 15.00, 72, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(73, 1, 1, 1, 6, 'FRP-008', 'Paneer Chilli Gravy',      280.00, 90.00, 5.00, true, true,  true, 'Chinese', 'Paneer chunks in thick spicy Indo-Chinese gravy', 'Paneer Chilli Gravy', 15.00, 73, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(74, 1, 1, 1, 6, 'FRP-009', 'Mushroom Chilli Dry',      250.00, 80.00, 5.00, true, false, true, 'Chinese', 'Crispy button mushrooms in hot garlic soy sauce', 'Mushroom Chilli Dry', 15.00, 74, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(75, 1, 1, 1, 6, 'FRP-010', 'Gobi Chilli Dry',          230.00, 75.00, 5.00, true, false, true, 'Chinese', 'Crispy cauliflower florets in chilli garlic sauce', 'Gobi Chilli Dry', 10.00, 75, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(76, 1, 1, 1, 6, 'FRP-011', 'Soya Chilli Dry',          200.00, 60.00, 5.00, true, false, true, 'Chinese', 'Soya chunks stir-fried with capsicum and chili sauce', 'Soya Chilli Dry', 10.00, 76, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(77, 1, 1, 1, 6, 'FRP-012', 'Red Sauce Pasta',          150.00, 48.00, 5.00, true, true,  true, 'Italian', 'Penne in spicy Italian Arrabbiata garlic tomato sauce', 'Red Sauce Pasta', 10.00, 77, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(78, 1, 1, 1, 6, 'FRP-013', 'White Sauce Pasta',        170.00, 55.00, 5.00, true, true,  true, 'Italian', 'Penne in creamy parmesan Alfredo sauce with bell peppers', 'White Sauce Pasta', 10.00, 78, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(79, 1, 1, 1, 6, 'FRP-014', 'Mix Sauce Pasta',          170.00, 55.00, 5.00, true, true,  true, 'Italian', 'Pink sauce blend of spicy tomato and cream', 'Mix Sauce Pasta', 10.00, 79, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(80, 1, 1, 1, 6, 'FRP-015', 'Sweet Corn Pasta',         190.00, 60.00, 5.00, true, false, true, 'Italian', 'Creamy pasta packed with sweet corn kernels and herbs', 'Sweet Corn Pasta', 10.00, 80, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(81, 1, 1, 1, 6, 'FRP-016', 'Paneer Pasta',             220.00, 70.00, 5.00, true, true,  true, 'Italian', 'Rich pasta tossed with paneer cubes and mozzarella', 'Paneer Pasta', 15.00, 81, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(82, 1, 1, 1, 6, 'FRP-017', 'Special Veg. Loaded Pasta',250.00, 80.00, 5.00, true, true,  true, 'Italian', 'Loaded with paneer, sweet corn, mushrooms, olives and extra cheese', 'Special Loaded Pasta', 15.00, 82, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 7. Pizza (Category 7, Station: Italian)
(83, 1, 1, 1, 7, 'PIZ-001', 'Sweet Corn / Capsicum / Onion / Tomato Pizza', 210.00, 65.00, 5.00, true, true,  true, 'Italian', 'Crust with capsicum, red onions, sweet corn and tomatoes', 'Veggie Four Topping Pizza', 15.00, 83, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(84, 1, 1, 1, 7, 'PIZ-002', 'Veg Pizza',                                   230.00, 70.00, 5.00, true, true,  true, 'Italian', 'Hand-tossed base with capsicum, onion, tomato and mozzarella', 'Veg Pizza', 15.00, 84, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(85, 1, 1, 1, 7, 'PIZ-003', 'Margherita Pizza',                            230.00, 68.00, 5.00, true, true,  true, 'Italian', 'Italian classic with herb tomato concasse, basil and double mozzarella', 'Margherita Pizza', 15.00, 85, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(86, 1, 1, 1, 7, 'PIZ-004', 'Black Olive Pizza',                           250.00, 78.00, 5.00, true, false, true, 'Italian', 'Black olives, red onions, capsicum and mozzarella', 'Black Olive Pizza', 15.00, 86, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(87, 1, 1, 1, 7, 'PIZ-005', 'Mushroom Pizza',                              260.00, 80.00, 5.00, true, false, true, 'Italian', 'Button mushrooms, sweet onions and melted cheese', 'Mushroom Pizza', 15.00, 87, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(88, 1, 1, 1, 7, 'PIZ-006', 'Paneer Pizza',                                270.00, 85.00, 5.00, true, true,  true, 'Italian', 'Diced cottage cheese, bell peppers, onions and mozzarella', 'Paneer Pizza', 15.00, 88, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(89, 1, 1, 1, 7, 'PIZ-007', 'Peppy Paneer Pizza',                          290.00, 90.00, 5.00, true, true,  true, 'Italian', 'Spiced paneer, red paprika, capsicum and mozzarella', 'Peppy Paneer Pizza', 15.00, 89, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(90, 1, 1, 1, 7, 'PIZ-008', 'Tandoori Pizza',                              300.00, 95.00, 5.00, true, true,  true, 'Italian', 'Tandoori spiced sauce with roasted vegetables and cheese', 'Tandoori Pizza', 15.00, 90, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(91, 1, 1, 1, 7, 'PIZ-009', 'Indi Tandoori Paneer Pizza',                  310.00, 98.00, 5.00, true, true,  true, 'Italian', 'Tandoori paneer, red onions, coriander and double cheese', 'Indi Tandoori Paneer Pizza', 15.00, 91, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(92, 1, 1, 1, 7, 'PIZ-010', 'Farm House Pizza',                            320.00, 100.00, 5.00, true, true, true, 'Italian', 'Loaded with capsicum, onion, tomato, grilled mushroom & cheese', 'Farm House Pizza', 15.00, 92, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(93, 1, 1, 1, 7, 'PIZ-011', 'Double Decker Pizza',                         340.00, 110.00, 5.00, true, true, true, 'Italian', 'Two layers of crust stuffed with liquid cheese and veggies', 'Double Decker Pizza', 15.00, 93, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(94, 1, 1, 1, 7, 'PIZ-012', 'All in One Pizza',                            360.00, 120.00, 5.00, true, true, true, 'Italian', 'Paneer, corn, mushroom, black olives, jalapenos and extra cheese', 'All in One Pizza', 15.00, 94, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 8. Drink (Category 8, Station: Drinks)
(95,  1, 1, 1, 8, 'DRK-001', 'Tea',                                         20.00,  5.00, 5.00, true, true,  true, 'Drinks', 'Hot Indian milk tea brewed with ginger and cardamom', 'Tea', 0.00, 95, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(96,  1, 1, 1, 8, 'DRK-002', 'Black Coffee',                                30.00,  8.00, 5.00, true, false, true, 'Drinks', 'Freshly brewed hot black coffee', 'Black Coffee', 0.00, 96, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(97,  1, 1, 1, 8, 'DRK-003', 'Coffee',                                      40.00, 10.00, 5.00, true, true,  true, 'Drinks', 'Hot brewed frothy milk coffee', 'Coffee', 0.00, 97, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(98,  1, 1, 1, 8, 'DRK-004', 'Cold Drink',                                  30.00, 20.00, 5.00, true, true,  true, 'Drinks', 'Chilled carbonated soft beverage', 'Cold Drink', 0.00, 98, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(99,  1, 1, 1, 8, 'DRK-005', 'Strawberry Ice Cream',                        50.00, 18.00, 5.00, true, false, true, 'Drinks', 'Strawberry ice cream scoop', 'Strawberry Ice Cream', 0.00, 99, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(100, 1, 1, 1, 8, 'DRK-006', 'Chocolate Ice Cream',                         60.00, 22.00, 5.00, true, true,  true, 'Drinks', 'Rich chocolate ice cream scoop', 'Chocolate Ice Cream', 0.00, 100, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(101, 1, 1, 1, 8, 'DRK-007', 'Butterscotch Ice Cream',                      60.00, 22.00, 5.00, true, true,  true, 'Drinks', 'Butterscotch ice cream with cashew praline', 'Butterscotch Ice Cream', 0.00, 101, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(102, 1, 1, 1, 8, 'DRK-008', 'Kesar Pista Ice Cream',                       70.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Royal saffron and pistachio dairy ice cream', 'Kesar Pista Ice Cream', 0.00, 102, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(103, 1, 1, 1, 8, 'DRK-009', 'Banana Shake',                                80.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Fresh ripe banana milkshake', 'Banana Shake', 0.00, 103, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(104, 1, 1, 1, 8, 'DRK-010', 'Papaya Shake',                                80.00, 25.00, 5.00, true, false, true, 'Drinks', 'Refreshing ripe papaya blended with milk', 'Papaya Shake', 0.00, 104, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(105, 1, 1, 1, 8, 'DRK-011', 'Mango Shake',                                 80.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Sweet mango pulp blended into thick shake', 'Mango Shake', 0.00, 105, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(106, 1, 1, 1, 8, 'DRK-012', 'Chikoo Shake',                                80.00, 25.00, 5.00, true, false, true, 'Drinks', 'Fresh chikoo fruit blended with milk', 'Chikoo Shake', 0.00, 106, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(107, 1, 1, 1, 8, 'DRK-013', 'Mix Shake (Banana, Papaya, Chikoo)',          100.00, 32.00, 5.00, true, true,  true, 'Drinks', 'Three-fruit blend of banana, papaya and chikoo', 'Mix Fruit Shake', 0.00, 107, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(108, 1, 1, 1, 8, 'DRK-014', 'Cold Coffee',                                 80.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Chilled frothy blended coffee with milk', 'Cold Coffee', 0.00, 108, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(109, 1, 1, 1, 8, 'DRK-015', 'Strawberry Shake',                            80.00, 25.00, 5.00, true, false, true, 'Drinks', 'Sweet strawberry crush blended shake', 'Strawberry Shake', 0.00, 109, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(110, 1, 1, 1, 8, 'DRK-016', 'Butterscotch Shake',                          80.00, 25.00, 5.00, true, false, true, 'Drinks', 'Butterscotch caramel flavor shake with praline', 'Butterscotch Shake', 0.00, 110, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(111, 1, 1, 1, 8, 'DRK-017', 'Vanilla Shake',                               80.00, 25.00, 5.00, true, false, true, 'Drinks', 'Classic vanilla thick milkshake', 'Vanilla Shake', 0.00, 111, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(112, 1, 1, 1, 8, 'DRK-018', 'Chocolate Shake',                             90.00, 30.00, 5.00, true, true,  true, 'Drinks', 'Decadent chocolate shake with chocolate syrup', 'Chocolate Shake', 0.00, 112, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(113, 1, 1, 1, 8, 'DRK-019', 'Chocolate + Banana Shake',                    90.00, 30.00, 5.00, true, false, true, 'Drinks', 'Fresh banana blended with chocolate and milk', 'Chocolate Banana Shake', 0.00, 113, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(114, 1, 1, 1, 8, 'DRK-020', 'Kitkat Shake',                                90.00, 35.00, 5.00, true, true,  true, 'Drinks', 'Thick shake blended with KitKat chocolate bars', 'Kitkat Shake', 0.00, 114, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(115, 1, 1, 1, 8, 'DRK-021', 'Oreo Shake',                                  90.00, 35.00, 5.00, true, true,  true, 'Drinks', 'Thick shake crushed with real Oreo cookies', 'Oreo Shake', 0.00, 115, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(116, 1, 1, 1, 8, 'DRK-022', 'Virgin Mojito',                               99.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Mint leaves, lime chunks and chilled sparkling soda', 'Virgin Mojito', 0.00, 116, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(117, 1, 1, 1, 8, 'DRK-023', 'Blue Lagoon Mojito',                          99.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Blue curacao citrus cooler with soda and lemon', 'Blue Lagoon Mojito', 0.00, 117, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(118, 1, 1, 1, 8, 'DRK-024', 'Green Apple Mojito',                          99.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Green apple syrup, mint and club soda', 'Green Apple Mojito', 0.00, 118, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(119, 1, 1, 1, 8, 'DRK-025', 'Kala Khatta Mojito',                          99.00, 25.00, 5.00, true, true,  true, 'Drinks', 'Tangy kala khatta cooler with black salt and cumin', 'Kala Khatta Mojito', 0.00, 119, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(120, 1, 1, 1, 8, 'DRK-026', 'Strawberry Mojito',                          149.00, 40.00, 5.00, true, false, true, 'Drinks', 'Fresh strawberry, mint, lime and sparkling soda', 'Strawberry Mojito', 0.00, 120, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(121, 1, 1, 1, 8, 'DRK-027', 'Guava Mojito',                               149.00, 40.00, 5.00, true, false, true, 'Drinks', 'Pink guava pulp cooler dusted with chili salt rim', 'Guava Mojito', 0.00, 121, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(122, 1, 1, 1, 8, 'DRK-028', 'Orange Mojito',                              139.00, 38.00, 5.00, true, false, true, 'Drinks', 'Orange juice infused with mint and soda', 'Orange Mojito', 0.00, 122, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(123, 1, 1, 1, 8, 'DRK-029', 'Pineapple Mojito',                           139.00, 38.00, 5.00, true, false, true, 'Drinks', 'Sweet pineapple chunks muddled with mint and soda', 'Pineapple Mojito', 0.00, 123, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 9. Tandoori (Category 9, Station: Indian)
(124, 1, 1, 1, 9, 'TAN-001', 'Masala Chaap',                               230.00, 75.00, 5.00, true, true,  true, 'Indian', 'Skewered soya chaap in spicy tandoori marinade', 'Masala Chaap', 10.00, 124, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(125, 1, 1, 1, 9, 'TAN-002', 'Achari Chaap',                               230.00, 75.00, 5.00, true, true,  true, 'Indian', 'Soya chaap infused with tangy pickled spices', 'Achari Chaap', 10.00, 125, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(126, 1, 1, 1, 9, 'TAN-003', 'Malai Chaap',                                250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Soya chaap coated in cashew-cream and butter', 'Malai Chaap', 10.00, 126, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(127, 1, 1, 1, 9, 'TAN-004', 'Afgani Chaap',                               250.00, 80.00, 5.00, true, false, true, 'Indian', 'Chaap cooked in rich white Afghani marinade', 'Afgani Chaap', 10.00, 127, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(128, 1, 1, 1, 9, 'TAN-005', 'Hara Bhara Kebab (6 Pcs)',                   180.00, 55.00, 5.00, true, true,  true, 'Indian', 'Patties crafted from spinach, peas, potatoes and herbs', 'Hara Bhara Kebab', 10.00, 128, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(129, 1, 1, 1, 9, 'TAN-006', 'Veg. Seekh Kebab (2 Pcs)',                   180.00, 55.00, 5.00, true, true,  true, 'Indian', 'Minced vegetable and cottage cheese skewered kebab', 'Veg Seekh Kebab', 10.00, 129, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(130, 1, 1, 1, 9, 'TAN-007', 'Reshmi Kebab (6 Pcs)',                       200.00, 65.00, 5.00, true, false, true, 'Indian', 'Silken smooth vegetarian kebabs with cream and saffron', 'Reshmi Kebab', 10.00, 130, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(131, 1, 1, 1, 9, 'TAN-008', 'Dahi Ke Sholay (2 Pcs)',                     200.00, 65.00, 5.00, true, true,  true, 'Indian', 'Crispy bread pockets stuffed with spiced hung curd', 'Dahi Ke Sholay', 10.00, 131, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(132, 1, 1, 1, 9, 'TAN-009', 'Tandoori Aloo Tikka',                        220.00, 68.00, 5.00, true, false, true, 'Indian', 'Potatoes stuffed with paneer and grilled in tandoor', 'Tandoori Aloo Tikka', 10.00, 132, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(133, 1, 1, 1, 9, 'TAN-010', 'Paneer Tikka',                               290.00, 95.00, 5.00, true, true,  true, 'Indian', 'Cottage cheese marinated with yogurt and roasted in tandoor', 'Paneer Tikka', 15.00, 133, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(134, 1, 1, 1, 9, 'TAN-011', 'Achari Paneer Tikka',                        290.00, 95.00, 5.00, true, false, true, 'Indian', 'Paneer cubes marinated with tangy pickled spices', 'Achari Paneer Tikka', 15.00, 134, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(135, 1, 1, 1, 9, 'TAN-012', 'Malai Paneer Tikka',                         300.00, 98.00, 5.00, true, true,  true, 'Indian', 'Paneer in cardamom, cashew cream and butter grilled', 'Malai Paneer Tikka', 15.00, 135, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(136, 1, 1, 1, 9, 'TAN-013', 'Mushroom Tikka',                             300.00, 98.00, 5.00, true, false, true, 'Indian', 'Button mushrooms in tandoori yogurt grilled on skewers', 'Mushroom Tikka', 15.00, 136, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 10. Sabji (Category 10, Station: Indian)
(137, 1, 1, 1, 10, 'SAB-001', 'Dahi Fry',                   140.00, 45.00, 5.00, true, false, true, 'Indian', 'Fresh curd cooked with cumin, mustard seeds and onions', 'Dahi Fry', 10.00, 137, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(138, 1, 1, 1, 10, 'SAB-002', 'Dal Fry (Yellow / Mix)',    180.00, 55.00, 5.00, true, true,  true, 'Indian', 'Yellow lentils tempered with ghee, garlic and cumin', 'Dal Fry', 10.00, 138, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(139, 1, 1, 1, 10, 'SAB-003', 'Butter Fry Dal',             200.00, 60.00, 5.00, true, true,  true, 'Indian', 'Yellow lentils with double butter tadka', 'Butter Fry Dal', 10.00, 139, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(140, 1, 1, 1, 10, 'SAB-004', 'Dal Makhani',                250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Slow-cooked black lentils simmered with butter & cream', 'Dal Makhani', 15.00, 140, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(141, 1, 1, 1, 10, 'SAB-005', 'Aloo Matar',                 180.00, 55.00, 5.00, true, false, true, 'Indian', 'Potatoes and green peas in spiced onion-tomato gravy', 'Aloo Matar', 10.00, 141, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(142, 1, 1, 1, 10, 'SAB-006', 'Gobhi Matar',                180.00, 55.00, 5.00, true, false, true, 'Indian', 'Cauliflower and green peas with roasted cumin', 'Gobhi Matar', 10.00, 142, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(143, 1, 1, 1, 10, 'SAB-007', 'Chole Masala',               180.00, 55.00, 5.00, true, true,  true, 'Indian', 'Punjabi chickpeas simmered with roasted spices', 'Chole Masala', 10.00, 143, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(144, 1, 1, 1, 10, 'SAB-008', 'Punjabi Rajma',              180.00, 55.00, 5.00, true, true,  true, 'Indian', 'Red kidney beans in onion, garlic and ginger gravy', 'Punjabi Rajma', 10.00, 144, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(145, 1, 1, 1, 10, 'SAB-009', 'Mix Veg',                    250.00, 78.00, 5.00, true, true,  true, 'Indian', 'Garden vegetables in rich cashew masala gravy', 'Mix Veg', 15.00, 145, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(146, 1, 1, 1, 10, 'SAB-010', 'Matar Mushroom',             250.00, 78.00, 5.00, true, true,  true, 'Indian', 'Mushrooms and peas in spiced brown onion sauce', 'Matar Mushroom', 15.00, 146, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(147, 1, 1, 1, 10, 'SAB-011', 'Mushroom Masala',            270.00, 85.00, 5.00, true, false, true, 'Indian', 'Mushrooms in thick spicy onion-tomato masala', 'Mushroom Masala', 15.00, 147, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(148, 1, 1, 1, 10, 'SAB-012', 'Jeera Aloo',                 160.00, 48.00, 5.00, true, true,  true, 'Indian', 'Potatoes tempered with roasted cumin seeds', 'Jeera Aloo', 10.00, 148, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(149, 1, 1, 1, 10, 'SAB-013', 'Sev Bhaji',                  170.00, 50.00, 5.00, true, true,  true, 'Indian', 'Spicy curry with fried gram flour sev and tomato gravy', 'Sev Bhaji', 10.00, 149, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(150, 1, 1, 1, 10, 'SAB-014', 'Aloo Gobhi',                 180.00, 55.00, 5.00, true, false, true, 'Indian', 'Pan-fried potatoes and cauliflower with ginger', 'Aloo Gobhi', 10.00, 150, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(151, 1, 1, 1, 10, 'SAB-015', 'Malai Kofta',                290.00, 95.00, 5.00, true, true,  true, 'Indian', 'Paneer dumplings in sweet cashew cream gravy', 'Malai Kofta', 15.00, 151, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(152, 1, 1, 1, 10, 'SAB-016', 'Stuffed Capsicum',           290.00, 95.00, 5.00, true, false, true, 'Indian', 'Bell peppers stuffed with spiced cottage cheese and potato', 'Stuffed Capsicum', 15.00, 152, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(153, 1, 1, 1, 10, 'SAB-017', 'Cheese Tomato',              290.00, 95.00, 5.00, true, true,  true, 'Indian', 'Paneer and cheese in tangy buttery tomato reduction', 'Cheese Tomato', 15.00, 153, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(154, 1, 1, 1, 10, 'SAB-018', 'Navratan Korma',             300.00, 100.00, 5.00, true, false, true, 'Indian', 'Vegetables, fruits and nuts in sweet creamy gravy', 'Navratan Korma', 15.00, 154, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(155, 1, 1, 1, 10, 'SAB-019', 'Kashmiri Dum Aloo',          300.00, 100.00, 5.00, true, false, true, 'Indian', 'Baby potatoes slow-cooked in Kashmiri yogurt gravy', 'Kashmiri Dum Aloo', 15.00, 155, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(156, 1, 1, 1, 10, 'SAB-020', 'Kaju Curry',                 320.00, 105.00, 5.00, true, true,  true, 'Indian', 'Roasted whole cashews in rich creamy butter gravy', 'Kaju Curry', 15.00, 156, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(157, 1, 1, 1, 10, 'SAB-021', 'Masala Chaap Gravy',         250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Soya chaap in spicy onion-tomato gravy', 'Masala Chaap Gravy', 15.00, 157, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(158, 1, 1, 1, 10, 'SAB-022', 'Rogan Josh Chaap Gravy',     260.00, 82.00, 5.00, true, false, true, 'Indian', 'Soya chaap in aromatic Kashmiri Rogan Josh spices', 'Rogan Josh Chaap Gravy', 15.00, 158, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(159, 1, 1, 1, 10, 'SAB-023', 'Butter Masala Chaap Gravy',  270.00, 85.00, 5.00, true, true,  true, 'Indian', 'Chaap cooked in buttery creamy makhani gravy', 'Butter Masala Chaap Gravy', 15.00, 159, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 11. Special Paneer (Category 11, Station: Indian)
(160, 1, 1, 1, 11, 'PAN-001', 'Matar Paneer',              220.00, 70.00, 5.00, true, true,  true, 'Indian', 'Paneer and peas in authentic spiced onion tomato sauce', 'Matar Paneer', 10.00, 160, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(161, 1, 1, 1, 11, 'PAN-002', 'Shahi Paneer',              250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Cottage cheese in royal cashew nut and saffron gravy', 'Shahi Paneer', 15.00, 161, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(162, 1, 1, 1, 11, 'PAN-003', 'Kadai Paneer',              250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Paneer cooked in iron wok with coriander & capsicum', 'Kadai Paneer', 15.00, 162, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(163, 1, 1, 1, 11, 'PAN-004', 'Palak Paneer',              250.00, 80.00, 5.00, true, true,  true, 'Indian', 'Paneer in pureed spinach seasoned with garlic and ghee', 'Palak Paneer', 15.00, 163, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(164, 1, 1, 1, 11, 'PAN-005', 'Paneer Butter Masala',      270.00, 85.00, 5.00, true, true,  true, 'Indian', 'Soft paneer in rich tomato-cream makhani gravy with butter', 'Paneer Butter Masala', 15.00, 164, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(165, 1, 1, 1, 11, 'PAN-006', 'Paneer Lababdar',          270.00, 85.00, 5.00, true, true,  true, 'Indian', 'Paneer with grated cheese and chunky spiced gravy', 'Paneer Lababdar', 15.00, 165, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(166, 1, 1, 1, 11, 'PAN-007', 'Paneer Do Pyaza',           270.00, 85.00, 5.00, true, false, true, 'Indian', 'Paneer with sautéed onion pearls and fragrant spices', 'Paneer Do Pyaza', 15.00, 166, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(167, 1, 1, 1, 11, 'PAN-008', 'Paneer Tikka Masala',       290.00, 95.00, 5.00, true, true,  true, 'Indian', 'Tandoori paneer tikka tossed in rich tomato-onion masala', 'Paneer Tikka Masala', 15.00, 167, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(168, 1, 1, 1, 11, 'PAN-009', 'Paneer Bhurji',             290.00, 95.00, 5.00, true, true,  true, 'Indian', 'Scrambled paneer with onions, tomatoes and butter', 'Paneer Bhurji', 15.00, 168, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(169, 1, 1, 1, 11, 'PAN-010', 'Handi Paneer',              260.00, 82.00, 5.00, true, false, true, 'Indian', 'Paneer slow-cooked in clay handi with rustic spices', 'Handi Paneer', 15.00, 169, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(170, 1, 1, 1, 11, 'PAN-011', 'Paneer Korma',              260.00, 82.00, 5.00, true, false, true, 'Indian', 'Paneer in mildly spiced yogurt and coconut cream sauce', 'Paneer Korma', 15.00, 170, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(171, 1, 1, 1, 11, 'PAN-012', 'Hyderabadi Paneer',         290.00, 92.00, 5.00, true, false, true, 'Indian', 'Spicy green paneer curry with mint and Nizami spices', 'Hyderabadi Paneer', 15.00, 171, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(172, 1, 1, 1, 11, 'PAN-013', 'Paneer Pasanda',            300.00, 98.00, 5.00, true, true,  true, 'Indian', 'Stuffed paneer triangles layered with nuts in velvety gravy', 'Paneer Pasanda', 15.00, 172, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 12. Breads (Category 12, Station: Indian)
(173, 1, 1, 1, 12, 'BRD-001', 'Green Salad',                  60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Fresh sliced cucumber, carrots, tomatoes and onions', 'Green Salad', 0.00, 173, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(174, 1, 1, 1, 12, 'BRD-002', 'Kachumber Salad',              80.00, 22.00, 5.00, true, true,  true, 'Indian', 'Diced garden vegetables with chaat masala and lemon', 'Kachumber Salad', 0.00, 174, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(175, 1, 1, 1, 12, 'BRD-003', 'Fruit Salad',                 120.00, 35.00, 5.00, true, false, true, 'Indian', 'Seasonal diced fruits with black salt and lemon', 'Fruit Salad', 0.00, 175, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(176, 1, 1, 1, 12, 'BRD-004', 'Tawa Roti',                    12.00,  3.00, 5.00, true, true,  true, 'Indian', 'Whole wheat flatbread on hot griddle', 'Tawa Roti', 0.00, 176, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(177, 1, 1, 1, 12, 'BRD-005', 'Tawa Butter Roti',             15.00,  4.50, 5.00, true, true,  true, 'Indian', 'Whole wheat tawa roti brushed with butter', 'Tawa Butter Roti', 0.00, 177, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(178, 1, 1, 1, 12, 'BRD-006', 'Tandoori Roti',                15.00,  4.00, 5.00, true, true,  true, 'Indian', 'Whole wheat bread baked in clay tandoor', 'Tandoori Roti', 0.00, 178, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(179, 1, 1, 1, 12, 'BRD-007', 'Tandoori Butter Roti',         18.00,  5.50, 5.00, true, true,  true, 'Indian', 'Tandoori roti glazed with butter', 'Tandoori Butter Roti', 0.00, 179, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(180, 1, 1, 1, 12, 'BRD-008', 'Tandoori Onion Roti (Butter)', 25.00,  8.00, 5.00, true, false, true, 'Indian', 'Tandoori flatbread with chopped red onions and butter', 'Tandoori Onion Roti', 0.00, 180, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(181, 1, 1, 1, 12, 'BRD-009', 'Lachha Paratha',               50.00, 15.00, 5.00, true, true,  true, 'Indian', 'Layered flaky whole wheat bread baked in tandoor', 'Lachha Paratha', 0.00, 181, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(182, 1, 1, 1, 12, 'BRD-010', 'Plain Naan',                   50.00, 15.00, 5.00, true, true,  true, 'Indian', 'Traditional leavened soft white flatbread', 'Plain Naan', 0.00, 182, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(183, 1, 1, 1, 12, 'BRD-011', 'Butter Naan',                  60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Tandoor naan glazed with melted Amul butter', 'Butter Naan', 0.00, 183, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(184, 1, 1, 1, 12, 'BRD-012', 'Garlic Butter Naan',           70.00, 22.00, 5.00, true, true,  true, 'Indian', 'Naan topped with roasted garlic and melted butter', 'Garlic Butter Naan', 0.00, 184, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(185, 1, 1, 1, 12, 'BRD-013', 'Aloo Stuffed Naan',            60.00, 18.00, 5.00, true, false, true, 'Indian', 'Naan bread stuffed with spiced potato masala', 'Aloo Stuffed Naan', 0.00, 185, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(186, 1, 1, 1, 12, 'BRD-014', 'Paneer Stuffed Naan',          80.00, 25.00, 5.00, true, true,  true, 'Indian', 'Naan stuffed with seasoned grated paneer and herbs', 'Paneer Stuffed Naan', 0.00, 186, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(187, 1, 1, 1, 12, 'BRD-015', 'Missi Roti (Onion)',           40.00, 12.00, 5.00, true, true,  true, 'Indian', 'Gram flour bread with onions and ajwain', 'Missi Roti', 0.00, 187, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 13. Paratha, South-Ind (Category 13, Station: Indian)
(188, 1, 1, 1, 13, 'PRT-001', 'Aloo Paratha',        60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Flatbread stuffed with spiced mashed potatoes', 'Aloo Paratha', 0.00, 188, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(189, 1, 1, 1, 13, 'PRT-002', 'Aloo-Pyaaz Paratha',  70.00, 22.00, 5.00, true, true,  true, 'Indian', 'Flatbread with spiced potatoes and chopped onions', 'Aloo Pyaaz Paratha', 0.00, 189, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(190, 1, 1, 1, 13, 'PRT-003', 'Pyaaz Paratha',       70.00, 22.00, 5.00, true, false, true, 'Indian', 'Crisp flatbread with seasoned onions and ajwain', 'Pyaaz Paratha', 0.00, 190, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(191, 1, 1, 1, 13, 'PRT-004', 'Gobi Paratha',        80.00, 25.00, 5.00, true, true,  true, 'Indian', 'Flatbread stuffed with grated spiced cauliflower', 'Gobi Paratha', 0.00, 191, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(192, 1, 1, 1, 13, 'PRT-005', 'Paneer Paratha',     100.00, 32.00, 5.00, true, true,  true, 'Indian', 'Flatbread stuffed with seasoned paneer and herbs', 'Paneer Paratha', 0.00, 192, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(193, 1, 1, 1, 13, 'PRT-006', 'Mix Paratha',         90.00, 28.00, 5.00, true, true,  true, 'Indian', 'Stuffed with paneer, aloo, gobi, pyaaz and spices', 'Mix Paratha', 0.00, 193, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(194, 1, 1, 1, 13, 'PRT-007', 'Plain Dosa',         100.00, 28.00, 5.00, true, true,  true, 'Indian', 'Crispy rice and lentil crepe with sambar and chutney', 'Plain Dosa', 10.00, 194, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(195, 1, 1, 1, 13, 'PRT-008', 'Masala Dosa',        120.00, 35.00, 5.00, true, true,  true, 'Indian', 'Crispy dosa with spiced mashed potato filling', 'Masala Dosa', 10.00, 195, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(196, 1, 1, 1, 13, 'PRT-009', 'Onion Dosa',         130.00, 38.00, 5.00, true, false, true, 'Indian', 'Dosa sprinkled with chopped onions and curry leaves', 'Onion Dosa', 10.00, 196, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(197, 1, 1, 1, 13, 'PRT-010', 'Paneer Dosa',        150.00, 45.00, 5.00, true, true,  true, 'Indian', 'Dosa loaded with seasoned grated paneer', 'Paneer Dosa', 10.00, 197, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(198, 1, 1, 1, 13, 'PRT-011', 'Idli Sambar',         60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Steamed soft rice cakes (2 pcs) with dal sambar', 'Idli Sambar', 10.00, 198, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(199, 1, 1, 1, 13, 'PRT-012', 'Vada Sambar',         80.00, 24.00, 5.00, true, true,  true, 'Indian', 'Crispy fried lentil donuts (2 pcs) with sambar', 'Vada Sambar', 10.00, 199, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 14. RRP (Category 14, Station: Indian)
(200, 1, 1, 1, 14, 'RRP-001', 'Plain Dahi',            50.00, 15.00, 5.00, true, true,  true, 'Indian', 'Fresh homestyle set curd in cup', 'Plain Dahi', 0.00, 200, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(201, 1, 1, 1, 14, 'RRP-002', 'Boondi Raita',          80.00, 22.00, 5.00, true, true,  true, 'Indian', 'Yogurt with roasted cumin and crispy gram boondi', 'Boondi Raita', 0.00, 201, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(202, 1, 1, 1, 14, 'RRP-003', 'Mix Veg. Raita',        90.00, 25.00, 5.00, true, true,  true, 'Indian', 'Whipped yogurt with diced onions, cucumbers and tomatoes', 'Mix Veg Raita', 0.00, 202, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(203, 1, 1, 1, 14, 'RRP-004', 'Kachumber Raita',      100.00, 28.00, 5.00, true, false, true, 'Indian', 'Diced cucumber, onion and tomato in seasoned yogurt', 'Kachumber Raita', 0.00, 203, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(204, 1, 1, 1, 14, 'RRP-005', 'Aloo Raita',           100.00, 28.00, 5.00, true, false, true, 'Indian', 'Diced boiled potatoes with cumin in chilled curd', 'Aloo Raita', 0.00, 204, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(205, 1, 1, 1, 14, 'RRP-006', 'Mix Fruit Raita',      130.00, 38.00, 5.00, true, true,  true, 'Indian', 'Chilled yogurt with diced seasonal fruits', 'Mix Fruit Raita', 0.00, 205, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(206, 1, 1, 1, 14, 'RRP-007', 'Masala Chaach',         30.00,  8.00, 5.00, true, true,  true, 'Indian', 'Spiced buttermilk with ginger, mint and rock salt', 'Masala Chaach', 0.00, 206, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(207, 1, 1, 1, 14, 'RRP-008', 'Sweet Lassi',           60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Creamy sweet Punjabi yogurt beverage', 'Sweet Lassi', 0.00, 207, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(208, 1, 1, 1, 14, 'RRP-009', 'Roasted Papad',         20.00,  5.00, 5.00, true, true,  true, 'Indian', 'Crispy lentil cracker roasted over flame', 'Roasted Papad', 0.00, 208, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(209, 1, 1, 1, 14, 'RRP-010', 'Fry Papad',             30.00,  8.00, 5.00, true, true,  true, 'Indian', 'Deep fried crispy urad dal cracker', 'Fry Papad', 0.00, 209, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(210, 1, 1, 1, 14, 'RRP-011', 'Masala Papad',          50.00, 12.00, 5.00, true, true,  true, 'Indian', 'Papad topped with spiced onions, tomatoes and coriander', 'Masala Papad', 0.00, 210, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(211, 1, 1, 1, 14, 'RRP-012', 'Plain Rice',            60.00, 18.00, 5.00, true, true,  true, 'Indian', 'Steamed long grain basmati rice', 'Plain Rice', 0.00, 211, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(212, 1, 1, 1, 14, 'RRP-013', 'Jeera Rice',            80.00, 22.00, 5.00, true, true,  true, 'Indian', 'Basmati rice tempered with roasted cumin seeds', 'Jeera Rice', 0.00, 212, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(213, 1, 1, 1, 14, 'RRP-014', 'Matar Rice',            90.00, 25.00, 5.00, true, false, true, 'Indian', 'Basmati rice with sweet green peas and mild spices', 'Matar Rice', 0.00, 213, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(214, 1, 1, 1, 14, 'RRP-015', 'Tomato Rice',          110.00, 30.00, 5.00, true, false, true, 'Indian', 'Spiced rice with ripe tomatoes and curry leaves', 'Tomato Rice', 0.00, 214, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(215, 1, 1, 1, 14, 'RRP-016', 'Curd Rice',            130.00, 35.00, 5.00, true, true,  true, 'Indian', 'Basmati rice mixed with creamy tempered curd', 'Curd Rice', 0.00, 215, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(216, 1, 1, 1, 14, 'RRP-017', 'Veg. Pulao',           130.00, 38.00, 5.00, true, true,  true, 'Indian', 'Basmati rice cooked with mixed vegetables and spices', 'Veg Pulao', 0.00, 216, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(217, 1, 1, 1, 14, 'RRP-018', 'Kashmiri Pulao',       150.00, 45.00, 5.00, true, false, true, 'Indian', 'Sweet aromatic rice with fruits and nuts', 'Kashmiri Pulao', 0.00, 217, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(218, 1, 1, 1, 14, 'RRP-019', 'Special Veg. Biryani', 150.00, 45.00, 5.00, true, true,  true, 'Indian', 'Layered basmati rice and vegetables cooked on dum', 'Special Veg Biryani', 10.00, 218, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),

-- 15. Thali, Combo (Category 15, Station: Indian)
(219, 1, 1, 1, 15, 'THL-001', 'Chole Masala + Rice',                120.00, 35.00, 5.00, true, true,  true, 'Indian', 'Punjabi chole masala served with basmati rice', 'Chole Rice Combo', 10.00, 219, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(220, 1, 1, 1, 15, 'THL-002', 'Punjabi Rajma + Rice',               120.00, 35.00, 5.00, true, true,  true, 'Indian', 'North Indian rajma curry over hot basmati rice', 'Rajma Rice Combo', 10.00, 220, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(221, 1, 1, 1, 15, 'THL-003', 'Shahi Paneer + 2 Lachha Paratha',    160.00, 50.00, 5.00, true, true,  true, 'Indian', 'Shahi paneer served with 2 crispy lachha parathas', 'Shahi Paneer Paratha Combo', 10.00, 221, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(222, 1, 1, 1, 15, 'THL-004', 'Dal Makhani + 4 Tandoori Roti',      150.00, 48.00, 5.00, true, true,  true, 'Indian', 'Dal makhani served with 4 butter tandoori rotis', 'Dal Makhani Roti Combo', 10.00, 222, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(223, 1, 1, 1, 15, 'THL-005', 'Aloo Chur-Chur Naan Thali',          200.00, 60.00, 5.00, true, true,  true, 'Indian', 'Aloo chur chur naan with dal makhani, chole, raita & salad', 'Aloo Chur Chur Naan Thali', 15.00, 223, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(224, 1, 1, 1, 15, 'THL-006', 'Aloo-Pyaaz Chur-Chur Naan Thali',    210.00, 62.00, 5.00, true, true,  true, 'Indian', 'Aloo pyaaz chur chur naan with dal makhani, chole & raita', 'Aloo Pyaaz Chur Chur Thali', 15.00, 224, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(225, 1, 1, 1, 15, 'THL-007', 'Gobi Chur-Chur Naan Thali',          220.00, 65.00, 5.00, true, false, true, 'Indian', 'Gobi chur chur naan with chole, dal makhani & raita', 'Gobi Chur Chur Thali', 15.00, 225, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(226, 1, 1, 1, 15, 'THL-008', 'Paneer Chur-Chur Naan Thali',        250.00, 75.00, 5.00, true, true,  true, 'Indian', 'Loaded paneer chur chur naan with paneer sabji, dal makhani, raita', 'Paneer Chur Chur Thali', 15.00, 226, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(227, 1, 1, 1, 15, 'THL-009', 'Mix Chur-Chur Naan Thali',           230.00, 70.00, 5.00, true, true,  true, 'Indian', 'Mix veg chur chur naan with dal makhani, chole & raita', 'Mix Chur Chur Thali', 15.00, 227, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(228, 1, 1, 1, 15, 'THL-010', 'Mini Thali',                         150.00, 45.00, 5.00, true, true,  true, 'Indian', 'Dal fry, dry sabji, 4 tawa rotis, rice & pickle', 'Mini Thali', 15.00, 228, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false),
(229, 1, 1, 1, 15, 'THL-011', 'Baithak Special Thali',              290.00, 85.00, 5.00, true, true,  true, 'Indian', 'Grand thali: Shahi paneer, dal makhani, mix veg, raita, rice, 2 rotis/naan, papad, sweet', 'Baithak Special Thali', 20.00, 229, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false)
ON CONFLICT (tenant_id, item_code) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    tax_rate = EXCLUDED.tax_rate,
    is_veg = EXCLUDED.is_veg,
    is_popular = EXCLUDED.is_popular,
    kds_station = EXCLUDED.kds_station,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    packaging_charge = EXCLUDED.packaging_charge,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

SELECT setval('public.menu_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_items));


-- -----------------------------------------------------------------------------
-- 3. DIRECT INSERT: public.menu_variant_groups & public.menu_variant_options
-- -----------------------------------------------------------------------------
DELETE FROM public.menu_variant_groups WHERE tenant_id = 1;

INSERT INTO public.menu_variant_groups (
    id, tenant_id, company_id, branch_id, item_id, name, is_required, min_selection, max_selection, sort_order
) VALUES
-- Momos Portion Size (Items 1..4, 9..12)
(1,  1, 1, 1, 1,  'Portion Size', true, '1', '1', '1'),
(2,  1, 1, 1, 2,  'Portion Size', true, '1', '1', '1'),
(3,  1, 1, 1, 3,  'Portion Size', true, '1', '1', '1'),
(4,  1, 1, 1, 4,  'Portion Size', true, '1', '1', '1'),
(5,  1, 1, 1, 9,  'Portion Size', true, '1', '1', '1'),
(6,  1, 1, 1, 10, 'Portion Size', true, '1', '1', '1'),
(7,  1, 1, 1, 11, 'Portion Size', true, '1', '1', '1'),
(8,  1, 1, 1, 12, 'Portion Size', true, '1', '1', '1'),
-- French Sandwiches Preparation (Items 52..55)
(9,  1, 1, 1, 52, 'Preparation Type', true, '1', '1', '1'),
(10, 1, 1, 1, 53, 'Preparation Type', true, '1', '1', '1'),
(11, 1, 1, 1, 54, 'Preparation Type', true, '1', '1', '1'),
(12, 1, 1, 1, 55, 'Preparation Type', true, '1', '1', '1'),
-- French Burgers Preparation (Items 57..59)
(13, 1, 1, 1, 57, 'Preparation Type', true, '1', '1', '1'),
(14, 1, 1, 1, 58, 'Preparation Type', true, '1', '1', '1'),
(15, 1, 1, 1, 59, 'Preparation Type', true, '1', '1', '1'),
-- Pizza Size (Items 83..94)
(16, 1, 1, 1, 83, 'Pizza Size', true, '1', '1', '1'),
(17, 1, 1, 1, 84, 'Pizza Size', true, '1', '1', '1'),
(18, 1, 1, 1, 85, 'Pizza Size', true, '1', '1', '1'),
(19, 1, 1, 1, 86, 'Pizza Size', true, '1', '1', '1'),
(20, 1, 1, 1, 87, 'Pizza Size', true, '1', '1', '1'),
(21, 1, 1, 1, 88, 'Pizza Size', true, '1', '1', '1'),
(22, 1, 1, 1, 89, 'Pizza Size', true, '1', '1', '1'),
(23, 1, 1, 1, 90, 'Pizza Size', true, '1', '1', '1'),
(24, 1, 1, 1, 91, 'Pizza Size', true, '1', '1', '1'),
(25, 1, 1, 1, 92, 'Pizza Size', true, '1', '1', '1'),
(26, 1, 1, 1, 93, 'Pizza Size', true, '1', '1', '1'),
(27, 1, 1, 1, 94, 'Pizza Size', true, '1', '1', '1'),
-- Tandoori Portion Size (Items 124..127, 132..136)
(28, 1, 1, 1, 124, 'Portion Size', true, '1', '1', '1'),
(29, 1, 1, 1, 125, 'Portion Size', true, '1', '1', '1'),
(30, 1, 1, 1, 126, 'Portion Size', true, '1', '1', '1'),
(31, 1, 1, 1, 127, 'Portion Size', true, '1', '1', '1'),
(32, 1, 1, 1, 132, 'Portion Size', true, '1', '1', '1'),
(33, 1, 1, 1, 133, 'Portion Size', true, '1', '1', '1'),
(34, 1, 1, 1, 134, 'Portion Size', true, '1', '1', '1'),
(35, 1, 1, 1, 135, 'Portion Size', true, '1', '1', '1'),
(36, 1, 1, 1, 136, 'Portion Size', true, '1', '1', '1'),
-- Sabji Portion Size (Items 137..147, 157..159)
(37, 1, 1, 1, 137, 'Portion Size', true, '1', '1', '1'),
(38, 1, 1, 1, 138, 'Portion Size', true, '1', '1', '1'),
(39, 1, 1, 1, 139, 'Portion Size', true, '1', '1', '1'),
(40, 1, 1, 1, 140, 'Portion Size', true, '1', '1', '1'),
(41, 1, 1, 1, 141, 'Portion Size', true, '1', '1', '1'),
(42, 1, 1, 1, 142, 'Portion Size', true, '1', '1', '1'),
(43, 1, 1, 1, 143, 'Portion Size', true, '1', '1', '1'),
(44, 1, 1, 1, 144, 'Portion Size', true, '1', '1', '1'),
(45, 1, 1, 1, 145, 'Portion Size', true, '1', '1', '1'),
(46, 1, 1, 1, 146, 'Portion Size', true, '1', '1', '1'),
(47, 1, 1, 1, 147, 'Portion Size', true, '1', '1', '1'),
(48, 1, 1, 1, 157, 'Portion Size', true, '1', '1', '1'),
(49, 1, 1, 1, 158, 'Portion Size', true, '1', '1', '1'),
(50, 1, 1, 1, 159, 'Portion Size', true, '1', '1', '1'),
-- Special Paneer Portion Size (Items 160..168)
(51, 1, 1, 1, 160, 'Portion Size', true, '1', '1', '1'),
(52, 1, 1, 1, 161, 'Portion Size', true, '1', '1', '1'),
(53, 1, 1, 1, 162, 'Portion Size', true, '1', '1', '1'),
(54, 1, 1, 1, 163, 'Portion Size', true, '1', '1', '1'),
(55, 1, 1, 1, 164, 'Portion Size', true, '1', '1', '1'),
(56, 1, 1, 1, 165, 'Portion Size', true, '1', '1', '1'),
(57, 1, 1, 1, 166, 'Portion Size', true, '1', '1', '1'),
(58, 1, 1, 1, 167, 'Portion Size', true, '1', '1', '1'),
(59, 1, 1, 1, 168, 'Portion Size', true, '1', '1', '1'),
-- Stuffed Parathas Preparation (Items 188..193)
(60, 1, 1, 1, 188, 'Preparation Type', true, '1', '1', '1'),
(61, 1, 1, 1, 189, 'Preparation Type', true, '1', '1', '1'),
(62, 1, 1, 1, 190, 'Preparation Type', true, '1', '1', '1'),
(63, 1, 1, 1, 191, 'Preparation Type', true, '1', '1', '1'),
(64, 1, 1, 1, 192, 'Preparation Type', true, '1', '1', '1'),
(65, 1, 1, 1, 193, 'Preparation Type', true, '1', '1', '1')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('public.menu_variant_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_variant_groups));

INSERT INTO public.menu_variant_options (
    tenant_id, company_id, branch_id, group_id, name, additional_price, selling_price, price, is_default, sort_order
) VALUES
-- Momos (Half / Full)
(1, 1, 1, 1, 'Half', -20.00, 60.00, 60.00, false, 1),
(1, 1, 1, 1, 'Full',   0.00, 80.00, 80.00, true,  2),
(1, 1, 1, 2, 'Half', -30.00, 70.00, 70.00, false, 1),
(1, 1, 1, 2, 'Full',   0.00, 100.00, 100.00, true, 2),
(1, 1, 1, 3, 'Half', -30.00, 80.00, 80.00, false, 1),
(1, 1, 1, 3, 'Full',   0.00, 110.00, 110.00, true, 2),
(1, 1, 1, 4, 'Half', -40.00, 100.00, 100.00, false, 1),
(1, 1, 1, 4, 'Full',   0.00, 140.00, 140.00, true, 2),
(1, 1, 1, 5, 'Half', -30.00, 70.00, 70.00, false, 1),
(1, 1, 1, 5, 'Full',   0.00, 100.00, 100.00, true, 2),
(1, 1, 1, 6, 'Half', -30.00, 90.00, 90.00, false, 1),
(1, 1, 1, 6, 'Full',   0.00, 120.00, 120.00, true, 2),
(1, 1, 1, 7, 'Half', -40.00, 100.00, 100.00, false, 1),
(1, 1, 1, 7, 'Full',   0.00, 140.00, 140.00, true, 2),
(1, 1, 1, 8, 'Half', -40.00, 120.00, 120.00, false, 1),
(1, 1, 1, 8, 'Full',   0.00, 160.00, 160.00, true, 2),

-- French Sandwiches (Oven / Grilled)
(1, 1, 1, 9,  'Oven',    0.00, 100.00, 100.00, true,  1),
(1, 1, 1, 9,  'Grilled', 20.00, 120.00, 120.00, false, 2),
(1, 1, 1, 10, 'Oven',    0.00, 120.00, 120.00, true,  1),
(1, 1, 1, 10, 'Grilled', 20.00, 140.00, 140.00, false, 2),
(1, 1, 1, 11, 'Oven',    0.00, 160.00, 160.00, true,  1),
(1, 1, 1, 11, 'Grilled', 20.00, 180.00, 180.00, false, 2),
(1, 1, 1, 12, 'Oven',    0.00, 180.00, 180.00, true,  1),
(1, 1, 1, 12, 'Grilled', 20.00, 200.00, 200.00, false, 2),

-- French Burgers (Tawa / Oven)
(1, 1, 1, 13, 'Tawa', -20.00, 50.00, 50.00, false, 1),
(1, 1, 1, 13, 'Oven',   0.00, 70.00, 70.00, true,  2),
(1, 1, 1, 14, 'Tawa', -20.00, 70.00, 70.00, false, 1),
(1, 1, 1, 14, 'Oven',   0.00, 90.00, 90.00, true,  2),
(1, 1, 1, 15, 'Tawa', -20.00, 80.00, 80.00, false, 1),
(1, 1, 1, 15, 'Oven',   0.00, 100.00, 100.00, true,  2),

-- Pizzas (Small / Medium / Large: Small = Med - 60, Large = Med + 60)
(1, 1, 1, 16, 'Small',   -60.00, 150.00, 150.00, false, 1),
(1, 1, 1, 16, 'Medium',    0.00, 210.00, 210.00, true,  2),
(1, 1, 1, 16, 'Large',    60.00, 270.00, 270.00, false, 3),

(1, 1, 1, 17, 'Small',   -60.00, 170.00, 170.00, false, 1),
(1, 1, 1, 17, 'Medium',    0.00, 230.00, 230.00, true,  2),
(1, 1, 1, 17, 'Large',    60.00, 290.00, 290.00, false, 3),

(1, 1, 1, 18, 'Small',   -60.00, 170.00, 170.00, false, 1),
(1, 1, 1, 18, 'Medium',    0.00, 230.00, 230.00, true,  2),
(1, 1, 1, 18, 'Large',    60.00, 290.00, 290.00, false, 3),

(1, 1, 1, 19, 'Small',   -60.00, 190.00, 190.00, false, 1),
(1, 1, 1, 19, 'Medium',    0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 19, 'Large',    60.00, 310.00, 310.00, false, 3),

(1, 1, 1, 20, 'Small',   -60.00, 200.00, 200.00, false, 1),
(1, 1, 1, 20, 'Medium',    0.00, 260.00, 260.00, true,  2),
(1, 1, 1, 20, 'Large',    60.00, 320.00, 320.00, false, 3),

(1, 1, 1, 21, 'Small',   -60.00, 210.00, 210.00, false, 1),
(1, 1, 1, 21, 'Medium',    0.00, 270.00, 270.00, true,  2),
(1, 1, 1, 21, 'Large',    60.00, 330.00, 330.00, false, 3),

(1, 1, 1, 22, 'Small',   -60.00, 230.00, 230.00, false, 1),
(1, 1, 1, 22, 'Medium',    0.00, 290.00, 290.00, true,  2),
(1, 1, 1, 22, 'Large',    60.00, 350.00, 350.00, false, 3),

(1, 1, 1, 23, 'Small',   -60.00, 240.00, 240.00, false, 1),
(1, 1, 1, 23, 'Medium',    0.00, 300.00, 300.00, true,  2),
(1, 1, 1, 23, 'Large',    60.00, 360.00, 360.00, false, 3),

(1, 1, 1, 24, 'Small',   -60.00, 250.00, 250.00, false, 1),
(1, 1, 1, 24, 'Medium',    0.00, 310.00, 310.00, true,  2),
(1, 1, 1, 24, 'Large',    60.00, 370.00, 370.00, false, 3),

(1, 1, 1, 25, 'Small',   -60.00, 260.00, 260.00, false, 1),
(1, 1, 1, 25, 'Medium',    0.00, 320.00, 320.00, true,  2),
(1, 1, 1, 25, 'Large',    60.00, 380.00, 380.00, false, 3),

(1, 1, 1, 26, 'Small',   -60.00, 280.00, 280.00, false, 1),
(1, 1, 1, 26, 'Medium',    0.00, 340.00, 340.00, true,  2),
(1, 1, 1, 26, 'Large',    60.00, 400.00, 400.00, false, 3),

(1, 1, 1, 27, 'Small',   -60.00, 300.00, 300.00, false, 1),
(1, 1, 1, 27, 'Medium',    0.00, 360.00, 360.00, true,  2),
(1, 1, 1, 27, 'Large',    60.00, 420.00, 420.00, false, 3),

-- Tandoori Items (Half / Full: Masala/Achari Half 150/Full 230, Malai/Afgani Half 160/Full 250, Aloo Tikka Half 140/Full 220)
(1, 1, 1, 28, 'Half', -80.00, 150.00, 150.00, false, 1),
(1, 1, 1, 28, 'Full',   0.00, 230.00, 230.00, true,  2),
(1, 1, 1, 29, 'Half', -80.00, 150.00, 150.00, false, 1),
(1, 1, 1, 29, 'Full',   0.00, 230.00, 230.00, true,  2),
(1, 1, 1, 30, 'Half', -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 30, 'Full',   0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 31, 'Half', -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 31, 'Full',   0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 32, 'Half', -80.00, 140.00, 140.00, false, 1),
(1, 1, 1, 32, 'Full',   0.00, 220.00, 220.00, true,  2),
(1, 1, 1, 33, 'Half', -110.00, 180.00, 180.00, false, 1),
(1, 1, 1, 33, 'Full',    0.00, 290.00, 290.00, true,  2),
(1, 1, 1, 34, 'Half', -110.00, 180.00, 180.00, false, 1),
(1, 1, 1, 34, 'Full',    0.00, 290.00, 290.00, true,  2),
(1, 1, 1, 35, 'Half', -110.00, 190.00, 190.00, false, 1),
(1, 1, 1, 35, 'Full',    0.00, 300.00, 300.00, true,  2),
(1, 1, 1, 36, 'Half', -110.00, 190.00, 190.00, false, 1),
(1, 1, 1, 36, 'Full',    0.00, 300.00, 300.00, true,  2),

-- Sabji (Half / Full: exact values from menu.md)
(1, 1, 1, 37, 'Half', -50.00,   90.00,  90.00, false, 1),
(1, 1, 1, 37, 'Full',   0.00,  140.00, 140.00, true,  2),
(1, 1, 1, 38, 'Half', -60.00,  120.00, 120.00, false, 1),
(1, 1, 1, 38, 'Full',   0.00,  180.00, 180.00, true,  2),
(1, 1, 1, 39, 'Half', -70.00,  130.00, 130.00, false, 1),
(1, 1, 1, 39, 'Full',   0.00,  200.00, 200.00, true,  2),
(1, 1, 1, 40, 'Half', -90.00,  160.00, 160.00, false, 1),
(1, 1, 1, 40, 'Full',   0.00,  250.00, 250.00, true,  2),
(1, 1, 1, 41, 'Half', -60.00,  120.00, 120.00, false, 1),
(1, 1, 1, 41, 'Full',   0.00,  180.00, 180.00, true,  2),
(1, 1, 1, 42, 'Half', -60.00,  120.00, 120.00, false, 1),
(1, 1, 1, 42, 'Full',   0.00,  180.00, 180.00, true,  2),
(1, 1, 1, 43, 'Half', -60.00,  120.00, 120.00, false, 1),
(1, 1, 1, 43, 'Full',   0.00,  180.00, 180.00, true,  2),
(1, 1, 1, 44, 'Half', -60.00,  120.00, 120.00, false, 1),
(1, 1, 1, 44, 'Full',   0.00,  180.00, 180.00, true,  2),
(1, 1, 1, 45, 'Half', -90.00,  160.00, 160.00, false, 1),
(1, 1, 1, 45, 'Full',   0.00,  250.00, 250.00, true,  2),
(1, 1, 1, 46, 'Half', -90.00,  160.00, 160.00, false, 1),
(1, 1, 1, 46, 'Full',   0.00,  250.00, 250.00, true,  2),
(1, 1, 1, 47, 'Half', -100.00, 170.00, 170.00, false, 1),
(1, 1, 1, 47, 'Full',    0.00, 270.00, 270.00, true,  2),
(1, 1, 1, 48, 'Half',  -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 48, 'Full',    0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 49, 'Half', -100.00, 160.00, 160.00, false, 1),
(1, 1, 1, 49, 'Full',    0.00, 260.00, 260.00, true,  2),
(1, 1, 1, 50, 'Half', -100.00, 170.00, 170.00, false, 1),
(1, 1, 1, 50, 'Full',    0.00, 270.00, 270.00, true,  2),

-- Special Paneer (Half / Full: exact values from menu.md)
(1, 1, 1, 51, 'Half',  -80.00, 140.00, 140.00, false, 1),
(1, 1, 1, 51, 'Full',    0.00, 220.00, 220.00, true,  2),
(1, 1, 1, 52, 'Half',  -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 52, 'Full',    0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 53, 'Half',  -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 53, 'Full',    0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 54, 'Half',  -90.00, 160.00, 160.00, false, 1),
(1, 1, 1, 54, 'Full',    0.00, 250.00, 250.00, true,  2),
(1, 1, 1, 55, 'Half', -100.00, 170.00, 170.00, false, 1),
(1, 1, 1, 55, 'Full',    0.00, 270.00, 270.00, true,  2),
(1, 1, 1, 56, 'Half', -100.00, 170.00, 170.00, false, 1),
(1, 1, 1, 56, 'Full',    0.00, 270.00, 270.00, true,  2),
(1, 1, 1, 57, 'Half', -100.00, 170.00, 170.00, false, 1),
(1, 1, 1, 57, 'Full',    0.00, 270.00, 270.00, true,  2),
(1, 1, 1, 58, 'Half', -110.00, 180.00, 180.00, false, 1),
(1, 1, 1, 58, 'Full',    0.00, 290.00, 290.00, true,  2),
(1, 1, 1, 59, 'Half', -110.00, 180.00, 180.00, false, 1),
(1, 1, 1, 59, 'Full',    0.00, 290.00, 290.00, true,  2),

-- Stuffed Parathas (With Butter / With Luni Ghee: +40 for Luni Ghee)
(1, 1, 1, 60, 'With Butter',    0.00,  60.00,  60.00, true,  1),
(1, 1, 1, 60, 'With Luni Ghee',40.00, 100.00, 100.00, false, 2),
(1, 1, 1, 61, 'With Butter',    0.00,  70.00,  70.00, true,  1),
(1, 1, 1, 61, 'With Luni Ghee',40.00, 110.00, 110.00, false, 2),
(1, 1, 1, 62, 'With Butter',    0.00,  70.00,  70.00, true,  1),
(1, 1, 1, 62, 'With Luni Ghee',40.00, 110.00, 110.00, false, 2),
(1, 1, 1, 63, 'With Butter',    0.00,  80.00,  80.00, true,  1),
(1, 1, 1, 63, 'With Luni Ghee',40.00, 120.00, 120.00, false, 2),
(1, 1, 1, 64, 'With Butter',    0.00, 100.00, 100.00, true,  1),
(1, 1, 1, 64, 'With Luni Ghee',40.00, 140.00, 140.00, false, 2),
(1, 1, 1, 65, 'With Butter',    0.00,  90.00,  90.00, true,  1),
(1, 1, 1, 65, 'With Luni Ghee',40.00, 130.00, 130.00, false, 2);

SELECT setval('public.menu_variant_options_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_variant_options));


-- -----------------------------------------------------------------------------
-- 4. DIRECT INSERT: public.menu_addon_groups & public.menu_addon_options
-- -----------------------------------------------------------------------------
DELETE FROM public.menu_addon_groups WHERE tenant_id = 1;

INSERT INTO public.menu_addon_groups (
    id, tenant_id, company_id, branch_id, item_id, name, min_selection, max_selection, sort_order
) VALUES
-- Spring Rolls (Items 17..19)
(1,  1, 1, 1, 17, 'Roll Addons', 0, 1, '1'),
(2,  1, 1, 1, 18, 'Roll Addons', 0, 1, '1'),
(3,  1, 1, 1, 19, 'Roll Addons', 0, 1, '1'),
-- Pav Bhaji (Item 48)
(4,  1, 1, 1, 48, 'Pav Bhaji Addons', 0, 1, '1'),
-- Pizzas (Items 83..94)
(5,  1, 1, 1, 83, 'Pizza Addons', 0, 3, '1'),
(6,  1, 1, 1, 84, 'Pizza Addons', 0, 3, '1'),
(7,  1, 1, 1, 85, 'Pizza Addons', 0, 3, '1'),
(8,  1, 1, 1, 86, 'Pizza Addons', 0, 3, '1'),
(9,  1, 1, 1, 87, 'Pizza Addons', 0, 3, '1'),
(10, 1, 1, 1, 88, 'Pizza Addons', 0, 3, '1'),
(11, 1, 1, 1, 89, 'Pizza Addons', 0, 3, '1'),
(12, 1, 1, 1, 90, 'Pizza Addons', 0, 3, '1'),
(13, 1, 1, 1, 91, 'Pizza Addons', 0, 3, '1'),
(14, 1, 1, 1, 92, 'Pizza Addons', 0, 3, '1'),
(15, 1, 1, 1, 93, 'Pizza Addons', 0, 3, '1'),
(16, 1, 1, 1, 94, 'Pizza Addons', 0, 3, '1'),
-- Special Shakes (Items 112..115)
(17, 1, 1, 1, 112, 'Shake Addons', 0, 1, '1'),
(18, 1, 1, 1, 113, 'Shake Addons', 0, 1, '1'),
(19, 1, 1, 1, 114, 'Shake Addons', 0, 1, '1'),
(20, 1, 1, 1, 115, 'Shake Addons', 0, 1, '1'),
-- Stuffed Parathas (Items 188..193)
(21, 1, 1, 1, 188, 'Paratha Addons', 0, 2, '1'),
(22, 1, 1, 1, 189, 'Paratha Addons', 0, 2, '1'),
(23, 1, 1, 1, 190, 'Paratha Addons', 0, 2, '1'),
(24, 1, 1, 1, 191, 'Paratha Addons', 0, 2, '1'),
(25, 1, 1, 1, 192, 'Paratha Addons', 0, 2, '1'),
(26, 1, 1, 1, 193, 'Paratha Addons', 0, 2, '1')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('public.menu_addon_groups_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_addon_groups));

INSERT INTO public.menu_addon_options (
    tenant_id, company_id, branch_id, group_id, name, price, variant_prices, is_available, sort_order
) VALUES
-- Spring Rolls: Kurkure Crispiness (+30)
(1, 1, 1, 1, 'Kurkure Crispiness', 30.00, '{}'::jsonb, true, 1),
(1, 1, 1, 2, 'Kurkure Crispiness', 30.00, '{}'::jsonb, true, 1),
(1, 1, 1, 3, 'Kurkure Crispiness', 30.00, '{}'::jsonb, true, 1),

-- Pav Bhaji: 1 Extra Pav Only (+30)
(1, 1, 1, 4, '1 Extra Pav Only', 30.00, '{}'::jsonb, true, 1),

-- Pizzas: Cheese Burst (Extra) [Small: 50, Medium: 90, Large: 120]
(1, 1, 1, 5,  'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 6,  'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 7,  'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 8,  'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 9,  'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 10, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 11, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 12, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 13, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 14, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 15, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),
(1, 1, 1, 16, 'Cheese Burst (Extra)', 90.00, '{"Small": 50.00, "Medium": 90.00, "Large": 120.00}'::jsonb, true, 1),

-- Special Shakes: With Ice Cream (+20)
(1, 1, 1, 17, 'With Ice Cream', 20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 18, 'With Ice Cream', 20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 19, 'With Ice Cream', 20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 20, 'With Ice Cream', 20.00, '{}'::jsonb, true, 1),

-- Stuffed Parathas: Extra Butter (+20) & Extra Luni Ghee (+40)
(1, 1, 1, 21, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 21, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2),
(1, 1, 1, 22, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 22, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2),
(1, 1, 1, 23, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 23, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2),
(1, 1, 1, 24, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 24, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2),
(1, 1, 1, 25, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 25, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2),
(1, 1, 1, 26, 'Extra Butter',    20.00, '{}'::jsonb, true, 1),
(1, 1, 1, 26, 'Extra Luni Ghee', 40.00, '{}'::jsonb, true, 2);

SELECT setval('public.menu_addon_options_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.menu_addon_options));

COMMIT;
