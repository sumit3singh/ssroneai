-- =============================================================================
-- SSR One AI – POS Menu Master Seed Data Script (200+ Menu Items)
-- Environment Context: tenant_id = 1, company_id = 1, branch_id = 2
-- Kitchen Stations: indian, tandoor, chinese, drink, french
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. KITCHEN STATIONS SEED (5 STATIONS)
-- -----------------------------------------------------------------------------

INSERT INTO public.kitchen_stations (
    tenant_id, branch_id, company_id, name, code, display_ip, printer_name, station_type, categories, is_active, sort_order
) VALUES
(1, 2, 1, 'Indian Kitchen', 'indian', '192.168.1.101', 'EPSON-KDS-IND', 'main', '[]'::jsonb, true, 1),
(1, 2, 1, 'Tandoor & Bread Station', 'tandoor', '192.168.1.102', 'EPSON-KDS-TAN', 'main', '[]'::jsonb, true, 2),
(1, 2, 1, 'Chinese & Asian Station', 'chinese', '192.168.1.103', 'EPSON-KDS-CHN', 'main', '[]'::jsonb, true, 3),
(1, 2, 1, 'Beverage & Drinks Bar', 'drink', '192.168.1.104', 'EPSON-KDS-DRK', 'beverage', '[]'::jsonb, true, 4),
(1, 2, 1, 'Continental Fast Food', 'french', '192.168.1.105', 'EPSON-KDS-FRN', 'main', '[]'::jsonb, true, 5)
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------------------------
-- 2. MENU CATEGORIES SEED (10 CATEGORIES)
-- -----------------------------------------------------------------------------

INSERT INTO public.menu_categories (
    id, tenant_id, branch_id, company_id, name, icon, slug, level, sort_order
) VALUES
(1, 1, 2, 1, 'South Indian Delights', 'utensils', 'south-indian', 1, 1),
(2, 1, 2, 1, 'Veg Sabji & Main Course', 'bowl-food', 'veg-sabji', 1, 2),
(3, 1, 2, 1, 'Non-Veg Curry & Biryani', 'drumstick', 'nonveg-curry', 1, 3),
(4, 1, 2, 1, 'Tandoori Kebabs & Starters', 'flame', 'tandoori-starters', 1, 4),
(5, 1, 2, 1, 'Tandoori Breads & Parathas', 'wheat', 'tandoori-breads', 1, 5),
(6, 1, 2, 1, 'Chinese Soups & Momos', 'soup', 'chinese-starters', 1, 6),
(7, 1, 2, 1, 'Chinese Noodles & Fried Rice', 'bowl-rice', 'chinese-mains', 1, 7),
(8, 1, 2, 1, 'Sandwiches, Burgers & Wraps', 'sandwich', 'fast-food', 1, 8),
(9, 1, 2, 1, 'Pizzas, Pastas & Garlic Bread', 'pizza', 'pizza-pasta', 1, 9),
(10, 1, 2, 1, 'Beverages, Shakes & Desserts', 'cup-soda', 'beverages', 1, 10)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    slug = EXCLUDED.slug;


-- -----------------------------------------------------------------------------
-- 3. MENU TAGS SEED
-- -----------------------------------------------------------------------------

INSERT INTO public.menu_tags (
    id, tenant_id, branch_id, company_id, name, color_code, color, icon
) VALUES
(1, 1, 2, 1, 'Bestseller', '#ef4444', '#ef4444', 'star'),
(2, 1, 2, 1, 'Chef Special', '#f59e0b', '#f59e0b', 'sparkles'),
(3, 1, 2, 1, 'Spicy', '#dc2626', '#dc2626', 'flame'),
(4, 1, 2, 1, 'Must Try', '#8b5cf6', '#8b5cf6', 'heart'),
(5, 1, 2, 1, 'Healthy', '#10b981', '#10b981', 'leaf'),
(6, 1, 2, 1, 'Jain Friendly', '#06b6d4', '#06b6d4', 'sun')
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- 4. MENU ITEMS SEED (245 ITEMS)
-- -----------------------------------------------------------------------------

CREATE TEMP TABLE temp_menu_seed (
    item_code VARCHAR(50),
    category_id INT8,
    name VARCHAR(200),
    price NUMERIC(12, 2),
    cost_price NUMERIC(12, 2),
    tax_rate NUMERIC(5, 2),
    is_veg BOOLEAN,
    is_popular BOOLEAN,
    kds_station VARCHAR(50),
    description VARCHAR(500),
    short_description VARCHAR(200),
    packaging_charge NUMERIC(15, 2),
    sort_order INT4
);

INSERT INTO temp_menu_seed VALUES
-- CATEGORY 1: South Indian Delights (kds_station = 'indian') [IND-001 to IND-025]
('IND-001', 1, 'Plain Dosa', 90.00, 30.00, 5.00, true, true, 'indian', 'Crispy Golden Rice Crepe served with Sambar and Coconut Chutney', 'Crispy Plain Rice Dosa', 10.00, 1),
('IND-002', 1, 'Masala Dosa', 120.00, 40.00, 5.00, true, true, 'indian', 'Golden Dosa filled with spiced mashed potato masala', 'Classic Masala Dosa', 10.00, 2),
('IND-003', 1, 'Butter Masala Dosa', 140.00, 45.00, 5.00, true, true, 'indian', 'Dosa loaded with Amul butter and spicy potato filling', 'Amul Butter Masala Dosa', 10.00, 3),
('IND-004', 1, 'Cheese Masala Dosa', 160.00, 55.00, 5.00, true, true, 'indian', 'Dosa topped with freshly grated mozzarella and potato masala', 'Cheesy Potato Dosa', 10.00, 4),
('IND-005', 1, 'Mysore Masala Dosa', 150.00, 50.00, 5.00, true, true, 'indian', 'Spicy Mysore red garlic chutney spread inside crispy Dosa with masala', 'Fiery Mysore Dosa', 10.00, 5),
('IND-006', 1, 'Rava Plain Dosa', 110.00, 35.00, 5.00, true, false, 'indian', 'Crispy semolina onion crepe cooked to perfection', 'Crispy Rava Dosa', 10.00, 6),
('IND-007', 1, 'Rava Masala Dosa', 135.00, 45.00, 5.00, true, false, 'indian', 'Crispy semolina crepe filled with potato masala and cashews', 'Rava Dosa with Masala', 10.00, 7),
('IND-008', 1, 'Rava Onion Dosa', 130.00, 40.00, 5.00, true, false, 'indian', 'Semolina Dosa cooked with abundant finely chopped onions', 'Onion Rava Dosa', 10.00, 8),
('IND-009', 1, 'Paneer Dosa', 170.00, 60.00, 5.00, true, true, 'indian', 'Crispy Dosa filled with shredded seasoned Cottage Cheese masala', 'Stuffed Paneer Dosa', 10.00, 9),
('IND-010', 1, 'Cheese Burst Dosa', 190.00, 65.00, 5.00, true, true, 'indian', 'Ultra cheesy crispy dosa stuffed with molten processed cheese', 'Extra Cheesy Dosa', 10.00, 10),
('IND-011', 1, 'Paper Masala Dosa', 180.00, 55.00, 5.00, true, false, 'indian', 'Extra thin 2-foot crispy paper dosa served with masala & chutney', 'Extra Thin 2-Foot Dosa', 15.00, 11),
('IND-012', 1, 'Steamed Idli (2 Pcs)', 70.00, 20.00, 5.00, true, true, 'indian', 'Soft and fluffy steamed fermented rice cakes served with sambar & 3 chutneys', 'Soft Steamed Idlis', 10.00, 12),
('IND-013', 1, 'Button Idli in Sambar', 100.00, 30.00, 5.00, true, false, 'indian', '12 mini button idlis dipped in piping hot aromatic sambar topped with ghee', 'Mini Ghee Sambar Idli', 10.00, 13),
('IND-014', 1, 'Fried Masala Idli', 110.00, 35.00, 5.00, true, false, 'indian', 'Crispy fried idli cubes tossed in curry leaves, mustard seeds and podi masala', 'Spicy Fried Idli Cubes', 10.00, 14),
('IND-015', 1, 'Medu Vada (2 Pcs)', 80.00, 25.00, 5.00, true, true, 'indian', 'Crispy lentil donuts fried crisp outside and fluffy inside', 'Crispy Medu Vada', 10.00, 15),
('IND-016', 1, 'Sambar Vada (2 Pcs)', 95.00, 30.00, 5.00, true, false, 'indian', 'Medu vadas soaked in hot authentic spiced sambar with coriander', 'Sambar Soaked Vada', 10.00, 16),
('IND-017', 1, 'Curd Vada (2 Pcs)', 105.00, 35.00, 5.00, true, false, 'indian', 'Medu vadas soaked in chilled seasoned yogurt topped with boondi and coriander', 'Chilled Dahi Vada', 10.00, 17),
('IND-018', 1, 'Plain Uttapam', 100.00, 30.00, 5.00, true, false, 'indian', 'Thick soft rice pancake topped with butter', 'Thick Soft Rice Pancake', 10.00, 18),
('IND-019', 1, 'Onion Uttapam', 120.00, 35.00, 5.00, true, true, 'indian', 'Thick Uttapam generously topped with caramelised onions & green chillies', 'Onion Topped Uttapam', 10.00, 19),
('IND-020', 1, 'Tomato Onion Uttapam', 130.00, 40.00, 5.00, true, false, 'indian', 'Uttapam baked with juicy diced tomatoes and fresh onions', 'Tomato Onion Uttapam', 10.00, 20),
('IND-021', 1, 'Mix Veg Uttapam', 140.00, 45.00, 5.00, true, true, 'indian', 'Uttapam topped with capsicum, onion, tomato, carrots and green peas', 'Loaded Veg Uttapam', 10.00, 21),
('IND-022', 1, 'Cheese Capsicum Uttapam', 160.00, 50.00, 5.00, true, false, 'indian', 'Uttapam topped with crisp capsicum and melted cheddar cheese', 'Cheesy Capsicum Uttapam', 10.00, 22),
('IND-023', 1, 'Podi Dosa', 130.00, 40.00, 5.00, true, false, 'indian', 'Dosa smeared with spicy roasted lentil podi powder and pure desi ghee', 'Ghee Podi Dosa', 10.00, 23),
('IND-024', 1, 'Upma Classic', 80.00, 25.00, 5.00, true, false, 'indian', 'Roasted semolina cooked with mustard seeds, curry leaves and roasted cashews', 'Desi Roasted Upma', 10.00, 24),
('IND-025', 1, 'South Indian Combo Thali', 220.00, 75.00, 5.00, true, true, 'indian', '1 Masala Dosa + 1 Idli + 1 Medu Vada + Sambar + 2 Chutneys + Kesari Halwa', 'Full South Indian Platter', 15.00, 25),

-- CATEGORY 2: Veg Sabji & Main Course (kds_station = 'indian') [IND-026 to IND-055]
('IND-026', 2, 'Paneer Butter Masala', 260.00, 90.00, 5.00, true, true, 'indian', 'Cottage cheese cubes simmered in rich creamy tomato and butter gravy', 'Rich Creamy Paneer Gravy', 15.00, 26),
('IND-027', 2, 'Kadai Paneer', 270.00, 95.00, 5.00, true, true, 'indian', 'Paneer cubes tossed with bell peppers & crushed coriander seeds in spicy wok gravy', 'Spicy Bell Pepper Paneer', 15.00, 27),
('IND-028', 2, 'Paneer Tikka Masala', 280.00, 100.00, 5.00, true, true, 'indian', 'Char-grilled tandoori paneer tikkas cooked in a spicy gravy', 'Smoky Tandoori Paneer Gravy', 15.00, 28),
('IND-029', 2, 'Shahi Paneer', 290.00, 105.00, 5.00, true, false, 'indian', 'Paneer cooked in a royal sweet cashew cream gravy flavored with cardamom', 'Royal Creamy Cashew Paneer', 15.00, 29),
('IND-030', 2, 'Palak Paneer', 250.00, 85.00, 5.00, true, false, 'indian', 'Fresh paneer cubes cooked in smooth spinach purée tempered with garlic', 'Fresh Spinach Paneer Gravy', 15.00, 30),
('IND-031', 2, 'Paneer Do Pyaza', 265.00, 90.00, 5.00, true, false, 'indian', 'Paneer cooked with double onions and aromatic Indian spices', 'Double Onion Paneer Curry', 15.00, 31),
('IND-032', 2, 'Matar Paneer', 240.00, 80.00, 5.00, true, false, 'indian', 'Classic combination of green peas and paneer in onion tomato gravy', 'Green Peas Paneer Curry', 15.00, 32),
('IND-033', 2, 'Paneer Lababdar', 295.00, 105.00, 5.00, true, true, 'indian', 'Grated and cubed paneer cooked in luscious tomato cream cashew gravy', 'Rich Lababdar Paneer', 15.00, 33),
('IND-034', 2, 'Dal Tadka', 180.00, 55.00, 5.00, true, true, 'indian', 'Yellow arhar dal tempered with ghee, cumin, garlic, dry red chillies & coriander', 'Ghee Tempered Yellow Dal', 10.00, 34),
('IND-035', 2, 'Dal Makhani', 240.00, 80.00, 5.00, true, true, 'indian', 'Overnight slow cooked black lentils enriched with butter and fresh cream', 'Slow Cooked Black Dal', 15.00, 35),
('IND-036', 2, 'Dal Fry', 170.00, 50.00, 5.00, true, false, 'indian', 'Yellow lentil curry cooked with tomato onion masala and green chillies', 'Classic Yellow Dal Fry', 10.00, 36),
('IND-037', 2, 'Mix Vegetable Curry', 210.00, 70.00, 5.00, true, false, 'indian', 'Seasonal garden vegetables cooked in spicy traditional North Indian curry', 'Seasonal Mixed Veg Curry', 10.00, 37),
('IND-038', 2, 'Veg Kolhapuri', 230.00, 75.00, 5.00, true, true, 'indian', 'Spicy mixed vegetables cooked in fiery Kolhapuri red chilli gravy', 'Fiery Kolhapuri Veg Curry', 10.00, 38),
('IND-039', 2, 'Malai Kofta', 280.00, 95.00, 5.00, true, true, 'indian', 'Deep fried paneer potato dumplings simmered in rich creamy white gravy', 'Creamy Dumpling Curry', 15.00, 39),
('IND-040', 2, 'Aloo Gobi Adraki', 190.00, 60.00, 5.00, true, false, 'indian', 'Potatoes and cauliflower florets tossed with fresh ginger juliennes & spices', 'Ginger Potato Cauliflower', 10.00, 40),
('IND-041', 2, 'Aloo Jeera', 160.00, 45.00, 5.00, true, false, 'indian', 'Diced potatoes tempered with roasted cumin seeds, turmeric and coriander', 'Cumin Tempered Potatoes', 10.00, 41),
('IND-042', 2, 'Bhindi Masala', 200.00, 65.00, 5.00, true, false, 'indian', 'Tender lady fingers sauteed with spicy onion tomato dry masala', 'Spicy Lady Finger Fry', 10.00, 42),
('IND-043', 2, 'Baingan Bharta', 210.00, 70.00, 5.00, true, false, 'indian', 'Flame roasted eggplant mashed and cooked with garlic, onions and tomatoes', 'Smoky Mashed Eggplant', 10.00, 43),
('IND-044', 2, 'Chana Masala', 200.00, 65.00, 5.00, true, true, 'indian', 'Kabuli chickpeas cooked in tangy piquant Punjabi spice curry', 'Punjabi Spicy Chickpea Curry', 10.00, 44),
('IND-045', 2, 'Dum Aloo Punjabi', 220.00, 75.00, 5.00, true, false, 'indian', 'Baby potatoes slow cooked in rich spicy gravy spiced with fennel & kashmiri mirch', 'Rich Punjabi Dum Aloo', 10.00, 45),
('IND-046', 2, 'Kaju Butter Masala', 320.00, 115.00, 5.00, true, true, 'indian', 'Roasted cashew nuts simmered in rich velvety tomato cashew cream sauce', 'Roasted Cashew Butter Curry', 15.00, 46),
('IND-047', 2, 'Navratan Korma', 290.00, 100.00, 5.00, true, false, 'indian', '9 gems mixture of fruits, nuts and vegetables in mild aromatic white gravy', 'Royal 9 Gem Cream Korma', 15.00, 47),
('IND-048', 2, 'Steamed Basmati Rice', 120.00, 35.00, 5.00, true, false, 'indian', 'Aromatic long grain basmati rice steamed perfectly', 'Plain Steamed Basmati', 10.00, 48),
('IND-049', 2, 'Jeera Rice', 150.00, 45.00, 5.00, true, true, 'indian', 'Long grain basmati rice tempered with pure desi ghee and cumin seeds', 'Ghee Cumin Basmati Rice', 10.00, 49),
('IND-050', 2, 'Veg Pulao', 180.00, 55.00, 5.00, true, false, 'indian', 'Basmati rice cooked with whole spices, garden vegetables and ghee', 'Aromatic Veg Pulao', 10.00, 50),
('IND-051', 2, 'Matar Pulao', 170.00, 50.00, 5.00, true, false, 'indian', 'Basmati rice cooked with sweet green peas and mild spices', 'Green Peas Basmati Pulao', 10.00, 51),
('IND-052', 2, 'Veg Dum Biryani', 240.00, 80.00, 5.00, true, true, 'indian', 'Hyderabadi style slow cooked biryani rice layered with marinated vegetables', 'Layered Veg Dum Biryani', 15.00, 52),
('IND-053', 2, 'Paneer Dum Biryani', 270.00, 95.00, 5.00, true, true, 'indian', 'Fragrant basmati biryani layered with marinated paneer cubes and fried onions', 'Paneer Stuffed Dum Biryani', 15.00, 53),
('IND-054', 2, 'Boondi Raita', 90.00, 25.00, 5.00, true, false, 'indian', 'Whisked fresh curd mixed with crispy boondi, roasted cumin & black salt', 'Chilled Boondi Curd', 5.00, 54),
('IND-055', 2, 'Pineapple Raita', 110.00, 35.00, 5.00, true, false, 'indian', 'Sweetened yogurt with juicy pineapple chunks and mint', 'Sweet Pineapple Yogurt', 5.00, 55),

-- CATEGORY 3: Non-Veg Curry & Biryani (kds_station = 'indian') [IND-056 to IND-080]
('IND-056', 3, 'Butter Chicken (Murgh Makhani)', 340.00, 120.00, 5.00, false, true, 'indian', 'Tandoori chicken pieces cooked in velvety tomato cream butter gravy', 'Classic Creamy Butter Chicken', 20.00, 56),
('IND-057', 3, 'Chicken Tikka Masala', 350.00, 125.00, 5.00, false, true, 'indian', 'Charcoal grilled chicken tikka simmered in onion tomato gravy', 'Smoky Chicken Tikka Curry', 20.00, 57),
('IND-058', 3, 'Kadai Chicken', 330.00, 115.00, 5.00, false, true, 'indian', 'Chicken cooked with freshly ground kadai spices, capsicum and onion', 'Spicy Kadai Chicken Curry', 20.00, 58),
('IND-059', 3, 'Chicken Curry Classic', 300.00, 100.00, 5.00, false, false, 'indian', 'Home style spicy Punjabi chicken gravy cooked with herbs', 'Home Style Chicken Curry', 20.00, 59),
('IND-060', 3, 'Chicken Korma', 360.00, 130.00, 5.00, false, false, 'indian', 'Chicken cooked in rich almond cashew nut cream gravy', 'Royal Almond Chicken Korma', 20.00, 60),
('IND-061', 3, 'Chicken Do Pyaza', 330.00, 115.00, 5.00, false, false, 'indian', 'Chicken curry cooked with abundant shallots and diced onions', 'Double Onion Chicken Curry', 20.00, 61),
('IND-062', 3, 'Chicken Vindaloo', 340.00, 120.00, 5.00, false, true, 'indian', 'Goan style fiery hot chicken curry cooked with vinegar & red chillies', 'Fiery Goan Chicken Curry', 20.00, 62),
('IND-063', 3, 'Chicken Saagwala', 320.00, 110.00, 5.00, false, false, 'indian', 'Tender chicken cooked with pureed spinach gravy seasoned with garlic', 'Spinach Chicken Curry', 20.00, 63),
('IND-064', 3, 'Chicken Rara', 370.00, 135.00, 5.00, false, true, 'indian', 'Boneless chicken pieces cooked with seasoned chicken keema gravy', 'Chicken Keema Combo Curry', 20.00, 64),
('IND-065', 3, 'Chicken Changezi', 360.00, 130.00, 5.00, false, false, 'indian', 'Mughlai style slow cooked chicken in rich tangy tomato gravy', 'Mughlai Chicken Changezi', 20.00, 65),
('IND-066', 3, 'Mutton Rogan Josh', 420.00, 160.00, 5.00, false, true, 'indian', 'Kashmiri tender mutton curry flavored with alkanet root & kashmiri spices', 'Kashmiri Mutton Curry', 20.00, 66),
('IND-067', 3, 'Mutton Bhuna Gosht', 440.00, 170.00, 5.00, false, true, 'indian', 'Slow braised mutton cooked until gravy coats the meat richly', 'Semi-Dry Bhuna Mutton', 20.00, 67),
('IND-068', 3, 'Mutton Korma', 450.00, 175.00, 5.00, false, false, 'indian', 'Royal mutton curry cooked in yoghurt and fried onion paste', 'Mughlai Mutton Korma', 20.00, 68),
('IND-069', 3, 'Kadai Mutton', 430.00, 165.00, 5.00, false, false, 'indian', 'Mutton pieces wok-tossed with capsicum, tomatoes & crushed coriander', 'Spicy Wok Mutton', 20.00, 69),
('IND-070', 3, 'Mutton Keema Matar', 410.00, 155.00, 5.00, false, true, 'indian', 'Minced goat meat cooked with green peas and authentic Punjabi spices', 'Minced Mutton Pea Curry', 20.00, 70),
('IND-071', 3, 'Fish Curry Goan', 380.00, 140.00, 5.00, false, true, 'indian', 'Fresh fish fillets cooked in tangy coconut milk and tamarind curry', 'Coconut Tangy Fish Curry', 20.00, 71),
('IND-072', 3, 'Fish Tikka Masala', 390.00, 145.00, 5.00, false, false, 'indian', 'Tandoori roasted fish chunks cooked in spicy tikka gravy', 'Tandoori Fish Gravy', 20.00, 72),
('IND-073', 3, 'Prawn Malai Curry', 480.00, 190.00, 5.00, false, true, 'indian', 'Succulent prawns cooked in mild coconut cream gravy with spices', 'Bengali Prawn Coconut Curry', 25.00, 73),
('IND-074', 3, 'Hyderabadi Chicken Biryani', 320.00, 110.00, 5.00, false, true, 'indian', 'Authentic dum cooked chicken biryani with saffron rice & spices', 'Hyderabadi Chicken Dum Biryani', 20.00, 74),
('IND-075', 3, 'Lucknowi Chicken Biryani', 330.00, 115.00, 5.00, false, false, 'indian', 'Fragrant mild chicken biryani seasoned with kewra water and rose', 'Awadhi Lucknowi Biryani', 20.00, 75),
('IND-076', 3, 'Boneless Chicken Biryani', 340.00, 120.00, 5.00, false, true, 'indian', 'Succulent boneless chicken tikka layered with fragrant basmati biryani', 'Boneless Chicken Tikka Biryani', 20.00, 76),
('IND-077', 3, 'Hyderabadi Mutton Biryani', 420.00, 160.00, 5.00, false, true, 'indian', 'Tender goat meat slow cooked on dum with aged basmati rice & saffron', 'Hyderabadi Mutton Dum Biryani', 20.00, 77),
('IND-078', 3, 'Egg Curry (2 Eggs)', 220.00, 70.00, 5.00, false, false, 'indian', 'Boiled fried eggs simmered in onion tomato masala gravy', 'Classic Boiled Egg Curry', 10.00, 78),
('IND-079', 3, 'Egg Dum Biryani', 240.00, 80.00, 5.00, false, false, 'indian', 'Hard boiled spiced eggs layered in aromatic saffron biryani rice', 'Spicy Egg Dum Biryani', 15.00, 79),
('IND-080', 3, 'Non-Veg Thali Deluxe', 380.00, 135.00, 5.00, false, true, 'indian', 'Butter Chicken + Mutton Curry + Dal Makhani + Jeera Rice + 2 Butter Naan + Gulab Jamun', 'Royal Non-Veg Grand Thali', 25.00, 80),

-- CATEGORY 4: Tandoori Kebabs & Starters (kds_station = 'tandoor') [TAN-001 to TAN-020]
('TAN-001', 4, 'Paneer Tikka Classic', 250.00, 85.00, 5.00, true, true, 'tandoor', 'Cottage cheese marinated in spiced yogurt and mustard oil, clay oven grilled', 'Classic Tandoori Paneer Tikka', 15.00, 1),
('TAN-002', 4, 'Paneer Malai Tikka', 270.00, 95.00, 5.00, true, true, 'tandoor', 'Paneer cubes marinated in cashew paste, cream, cheese and mild spices', 'Creamy Cashew Paneer Tikka', 15.00, 2),
('TAN-003', 4, 'Paneer Achari Tikka', 260.00, 90.00, 5.00, true, false, 'tandoor', 'Paneer marinated in tangy pickle spices & mustard seeds char-grilled', 'Pickle Spiced Paneer Tikka', 15.00, 3),
('TAN-004', 4, 'Paneer Hariyali Tikka', 260.00, 90.00, 5.00, true, false, 'tandoor', 'Paneer marinated in fresh mint, coriander and green chilli paste', 'Green Mint Paneer Tikka', 15.00, 4),
('TAN-005', 4, 'Tandoori Mushroom', 240.00, 80.00, 5.00, true, true, 'tandoor', 'Fresh button mushrooms stuffed with spiced cheese & roasted in tandoor', 'Stuffed Grilled Mushrooms', 15.00, 5),
('TAN-006', 4, 'Soya Chaap Tandoori', 230.00, 75.00, 5.00, true, true, 'tandoor', 'Soya chaap pieces marinated in red tandoori masala and skewered', 'Grilled Tandoori Soya Chaap', 15.00, 6),
('TAN-007', 4, 'Soya Chaap Malai', 250.00, 85.00, 5.00, true, true, 'tandoor', 'Soya chaap drenched in rich cream, cardamom & butter marinade roasted on coals', 'Creamy Malai Soya Chaap', 15.00, 7),
('TAN-008', 4, 'Veg Seekh Kebab', 220.00, 70.00, 5.00, true, false, 'tandoor', 'Minced vegetables & paneer mixed with aromatic herbs skewered in tandoor', 'Vegetable Skewered Kebab', 15.00, 8),
('TAN-009', 4, 'Hara Bhara Kebab', 210.00, 65.00, 5.00, true, false, 'tandoor', 'Pan fried patties made of spinach, green peas, potatoes and cashew nut center', 'Spinach Pea Patty Kebabs', 10.00, 9),
('TAN-010', 4, 'Dahi Ke Kebab', 240.00, 80.00, 5.00, true, true, 'tandoor', 'Crispy outer shell filled with hung curd, bell peppers & green chillies', 'Hung Curd Crispy Kebabs', 15.00, 10),
('TAN-011', 4, 'Tandoori Chicken (Half)', 280.00, 95.00, 5.00, false, true, 'tandoor', 'Bone-in chicken marinated in yogurt & kashmiri chili grilled in clay oven', 'Clay Oven Roasted Chicken (Half)', 20.00, 11),
('TAN-012', 4, 'Tandoori Chicken (Full)', 520.00, 180.00, 5.00, false, true, 'tandoor', 'Full whole chicken marinated in tandoori spices and char-roasted', 'Clay Oven Roasted Chicken (Full)', 25.00, 12),
('TAN-013', 4, 'Chicken Tikka Classic', 310.00, 105.00, 5.00, false, true, 'tandoor', 'Boneless chicken cubes marinated in tandoori spices skewered on coals', 'Boneless Tandoori Chicken Tikka', 20.00, 13),
('TAN-014', 4, 'Chicken Malai Tikka', 330.00, 115.00, 5.00, false, true, 'tandoor', 'Melt-in-mouth chicken pieces marinated in cream, cheese & green cardamom', 'Creamy Cardamom Chicken Tikka', 20.00, 14),
('TAN-015', 4, 'Chicken Reshmi Kebab', 340.00, 120.00, 5.00, false, false, 'tandoor', 'Silky chicken breast pieces marinated in egg white, cream & cashews', 'Silky Soft Chicken Kebabs', 20.00, 15),
('TAN-016', 4, 'Chicken Tangdi Kebab (3 Pcs)', 350.00, 125.00, 5.00, false, true, 'tandoor', 'Chicken drumsticks stuffed with minced meat & roasted in tandoor', 'Stuffed Tandoori Drumsticks', 20.00, 16),
('TAN-017', 4, 'Chicken Seekh Kebab', 310.00, 105.00, 5.00, false, true, 'tandoor', 'Minced chicken mixed with onion, herbs & spices skewered over open charcoal', 'Skewered Minced Chicken Kebab', 20.00, 17),
('TAN-018', 4, 'Mutton Seekh Kebab', 390.00, 145.00, 5.00, false, true, 'tandoor', 'Minced mutton mixed with royal herbs and spices grilled on skewers', 'Skewered Minced Mutton Kebab', 20.00, 18),
('TAN-019', 4, 'Fish Tikka Ajwaini', 380.00, 140.00, 5.00, false, true, 'tandoor', 'Sole fish fillets marinated with carom seeds, mustard oil & lemon grilled', 'Carom Seed Grilled Fish', 20.00, 19),
('TAN-020', 4, 'Tandoori Non-Veg Platter', 650.00, 240.00, 5.00, false, true, 'tandoor', '2 Chicken Tikka + 2 Chicken Malai + 2 Chicken Seekh + 2 Mutton Seekh + 2 Tangdi', 'Grand Tandoori Mixed Platter', 30.00, 20),

-- CATEGORY 5: Tandoori Breads & Stuffed Parathas (kds_station = 'tandoor') [TAN-021 to TAN-045]
('TAN-021', 5, 'Tandoori Roti Plain', 25.00, 6.00, 5.00, true, true, 'tandoor', 'Whole wheat flatbread baked in clay oven', 'Plain Whole Wheat Tandoori Roti', 5.00, 21),
('TAN-022', 5, 'Tandoori Roti Butter', 30.00, 8.00, 5.00, true, true, 'tandoor', 'Clay oven whole wheat flatbread brushed with butter', 'Butter Tandoori Roti', 5.00, 22),
('TAN-023', 5, 'Rumali Roti', 35.00, 10.00, 5.00, true, false, 'tandoor', 'Ultra thin soft handkerchief flatbread cooked over inverted wok', 'Thin Soft Handkerchief Roti', 5.00, 23),
('TAN-024', 5, 'Plain Naan', 45.00, 12.00, 5.00, true, false, 'tandoor', 'Traditional leavened flatbread baked in tandoor', 'Classic Leavened Plain Naan', 5.00, 24),
('TAN-025', 5, 'Butter Naan', 55.00, 16.00, 5.00, true, true, 'tandoor', 'Soft leavened tandoor flatbread layered with melted butter', 'Amul Butter Naan', 5.00, 25),
('TAN-026', 5, 'Garlic Naan', 70.00, 22.00, 5.00, true, true, 'tandoor', 'Tandoori naan topped with chopped fresh garlic & butter', 'Chopped Garlic Butter Naan', 5.00, 26),
('TAN-027', 5, 'Cheese Garlic Naan', 95.00, 32.00, 5.00, true, true, 'tandoor', 'Naan stuffed with processed cheese and topped with garlic butter', 'Cheesy Garlic Stuffed Naan', 5.00, 27),
('TAN-028', 5, 'Chilli Garlic Naan', 75.00, 24.00, 5.00, true, false, 'tandoor', 'Naan loaded with garlic and chopped spicy green chillies', 'Spicy Green Chilli Garlic Naan', 5.00, 28),
('TAN-029', 5, 'Peshawari Naan (Kashmiri Naan)', 110.00, 40.00, 5.00, true, false, 'tandoor', 'Sweet naan stuffed with nuts, raisins, coconut & dry fruits', 'Sweet Dry Fruit Stuffed Naan', 5.00, 29),
('TAN-030', 5, 'Lachha Paratha', 60.00, 18.00, 5.00, true, true, 'tandoor', 'Multi-layered crispy whole wheat tandoori paratha smeared with ghee', 'Layered Crispy Whole Wheat Paratha', 5.00, 30),
('TAN-031', 5, 'Pudina Paratha', 65.00, 20.00, 5.00, true, false, 'tandoor', 'Multi-layered paratha flavored with dried mint leaves & butter', 'Mint Flavored Layered Paratha', 5.00, 31),
('TAN-032', 5, 'Green Chilli Paratha', 65.00, 20.00, 5.00, true, false, 'tandoor', 'Multi-layered flaky paratha layered with chopped green chillies', 'Spicy Green Chilli Paratha', 5.00, 32),
('TAN-033', 5, 'Amritsari Kulcha (Paneer)', 120.00, 40.00, 5.00, true, true, 'tandoor', 'Crispy stuffed kulcha with paneer masala served with spicy chole dip', 'Paneer Stuffed Amritsari Kulcha', 10.00, 33),
('TAN-034', 5, 'Amritsari Kulcha (Aloo Onion)', 100.00, 30.00, 5.00, true, true, 'tandoor', 'Stuffed potato and onion kulcha baked crisp in tandoor with chole dip', 'Potato Onion Crispy Kulcha', 10.00, 34),
('TAN-035', 5, 'Missi Roti', 45.00, 12.00, 5.00, true, false, 'tandoor', 'Gram flour and wheat flatbread spiced with onion, carom seeds & coriander', 'Spiced Gram Flour Roti', 5.00, 35),
('TAN-036', 5, 'Aloo Paratha (Tawa/Tandoori)', 90.00, 25.00, 5.00, true, true, 'tandoor', 'Stuffed spiced mashed potato paratha served with butter and pickle', 'Classic Stuffed Potato Paratha', 10.00, 36),
('TAN-037', 5, 'Paneer Paratha', 120.00, 38.00, 5.00, true, true, 'tandoor', 'Stuffed grated seasoned cottage cheese paratha served with butter', 'Stuffed Cottage Cheese Paratha', 10.00, 37),
('TAN-038', 5, 'Gobhi Paratha', 95.00, 28.00, 5.00, true, false, 'tandoor', 'Stuffed spiced cauliflower paratha topped with white butter', 'Stuffed Cauliflower Paratha', 10.00, 38),
('TAN-039', 5, 'Onion Paratha', 90.00, 25.00, 5.00, true, false, 'tandoor', 'Stuffed chopped seasoned onion paratha served with curd & pickle', 'Stuffed Onion Paratha', 10.00, 39),
('TAN-040', 5, 'Mix Veg Paratha', 110.00, 32.00, 5.00, true, true, 'tandoor', 'Stuffed with potato, gobhi, paneer, peas & spices baked to golden crisp', 'Multi-Veg Stuffed Paratha', 10.00, 40),
('TAN-041', 5, 'Cheese Paratha', 130.00, 42.00, 5.00, true, true, 'tandoor', 'Stuffed with generous processed cheese & green herbs served with butter', 'Melting Cheese Stuffed Paratha', 10.00, 41),
('TAN-042', 5, 'Keema Paratha (Chicken)', 160.00, 55.00, 5.00, false, true, 'tandoor', 'Stuffed with spiced minced chicken keema baked in clay oven', 'Minced Chicken Stuffed Paratha', 10.00, 42),
('TAN-043', 5, 'Keema Paratha (Mutton)', 190.00, 70.00, 5.00, false, true, 'tandoor', 'Stuffed with seasoned minced mutton keema served with mint chutney', 'Minced Mutton Stuffed Paratha', 10.00, 43),
('TAN-044', 5, 'Stuffed Mushroom Paratha', 130.00, 42.00, 5.00, true, false, 'tandoor', 'Paratha stuffed with sauteed garlic mushrooms and coriander', 'Garlic Mushroom Stuffed Paratha', 10.00, 44),
('TAN-045', 5, 'Bread Basket Assorted (5 Breads)', 240.00, 75.00, 5.00, true, true, 'tandoor', '1 Butter Naan + 1 Garlic Naan + 1 Lachha Paratha + 1 Missi Roti + 1 Butter Roti', 'Assorted 5 Tandoori Breads Basket', 15.00, 45),

-- CATEGORY 6: Chinese Soups & Momos (kds_station = 'chinese') [CHN-001 to CHN-020]
('CHN-001', 6, 'Veg Manchow Soup', 120.00, 35.00, 5.00, true, true, 'chinese', 'Hot & spicy soy soup loaded with chopped vegetables topped with fried noodles', 'Spicy Soy Veg Manchow', 10.00, 1),
('CHN-002', 6, 'Chicken Manchow Soup', 140.00, 45.00, 5.00, false, true, 'chinese', 'Hot & spicy soy soup with chicken chunks topped with crispy fried noodles', 'Chicken Fried Noodle Soup', 10.00, 2),
('CHN-003', 6, 'Veg Hot & Sour Soup', 120.00, 35.00, 5.00, true, false, 'chinese', 'Tangy & spicy vegetable broth with mushrooms, tofu and chilli oil', 'Tangy Spicy Veg Soup', 10.00, 3),
('CHN-004', 6, 'Chicken Hot & Sour Soup', 140.00, 45.00, 5.00, false, false, 'chinese', 'Tangy & spicy chicken broth with shredded bamboo shoots & mushrooms', 'Tangy Spicy Chicken Soup', 10.00, 4),
('CHN-005', 6, 'Sweet Corn Veg Soup', 110.00, 30.00, 5.00, true, false, 'chinese', 'Creamy sweet corn soup with finely chopped carrots & green beans', 'Creamy Sweet Corn Soup', 10.00, 5),
('CHN-006', 6, 'Sweet Corn Chicken Soup', 130.00, 40.00, 5.00, false, false, 'chinese', 'Creamy sweet corn broth with shredded chicken & egg drop ribbons', 'Creamy Chicken Corn Soup', 10.00, 6),
('CHN-007', 6, 'Veg Steamed Momos (8 Pcs)', 120.00, 35.00, 5.00, true, true, 'chinese', 'Thin wrapper dumplings stuffed with finely cabbage, carrots & onions', 'Steamed Vegetable Momos', 10.00, 7),
('CHN-008', 6, 'Veg Fried Momos (8 Pcs)', 140.00, 40.00, 5.00, true, true, 'chinese', 'Crispy deep fried vegetable dumplings served with spicy red chilli sauce', 'Crispy Fried Veg Momos', 10.00, 8),
('CHN-009', 6, 'Veg Kurkure Momos (8 Pcs)', 170.00, 55.00, 5.00, true, true, 'chinese', 'Double crunchy cornflake crusted veg momos with spicy mayo dip', 'Crunchy Cornflake Veg Momos', 10.00, 9),
('CHN-010', 6, 'Paneer Steamed Momos (8 Pcs)', 150.00, 45.00, 5.00, true, true, 'chinese', 'Momos stuffed with seasoned shredded cottage cheese & spices', 'Steamed Paneer Momos', 10.00, 10),
('CHN-011', 6, 'Paneer Fried Momos (8 Pcs)', 170.00, 55.00, 5.00, true, false, 'chinese', 'Crispy deep fried paneer stuffed dumplings served with schezwan dip', 'Crispy Fried Paneer Momos', 10.00, 11),
('CHN-012', 6, 'Chicken Steamed Momos (8 Pcs)', 160.00, 50.00, 5.00, false, true, 'chinese', 'Dumpings stuffed with juicy minced chicken, ginger & green onions', 'Juicy Steamed Chicken Momos', 10.00, 12),
('CHN-013', 6, 'Chicken Fried Momos (8 Pcs)', 180.00, 60.00, 5.00, false, true, 'chinese', 'Crispy fried minced chicken momos served with fiery sauce', 'Crispy Fried Chicken Momos', 10.00, 13),
('CHN-014', 6, 'Chicken Kurkure Momos (8 Pcs)', 200.00, 70.00, 5.00, false, true, 'chinese', 'Super crunchy cornflake crusted chicken momos served with spicy dip', 'Crunchy Crusted Chicken Momos', 10.00, 14),
('CHN-015', 6, 'Veg Spring Rolls (4 Pcs)', 160.00, 50.00, 5.00, true, true, 'chinese', 'Crispy golden rolls filled with sauteed glass noodles & shredded vegetables', 'Crispy Veg Spring Rolls', 10.00, 15),
('CHN-016', 6, 'Crispy Corn Salt & Pepper', 190.00, 60.00, 5.00, true, true, 'chinese', 'Crispy fried sweet corn kernels tossed with onions, garlic & black pepper', 'Crispy Pepper Sweet Corn', 10.00, 16),
('CHN-017', 6, 'Veg Manchurian Dry', 190.00, 60.00, 5.00, true, true, 'chinese', 'Vegetable balls tossed in spicy garlic soy ginger sauce', 'Spicy Veg Manchurian Balls', 10.00, 17),
('CHN-018', 6, 'Chilli Paneer Dry', 230.00, 75.00, 5.00, true, true, 'chinese', 'Paneer cubes tossed with crisp capsicum, onions & spicy green chilli sauce', 'Spicy Wok Chilli Paneer', 10.00, 18),
('CHN-019', 6, 'Honey Chilli Potato', 180.00, 55.00, 5.00, true, true, 'chinese', 'Crispy potato fingers tossed in sweet honey chilli sesame sauce', 'Sweet & Spicy Honey Potatoes', 10.00, 19),
('CHN-020', 6, 'Chilli Chicken Dry', 270.00, 90.00, 5.00, false, true, 'chinese', 'Crispy boneless chicken tossed with green chillies, onions & dark soy sauce', 'Crispy Wok Chilli Chicken', 15.00, 20),

-- CATEGORY 7: Chinese Noodles & Fried Rice (kds_station = 'chinese') [CHN-021 to CHN-045]
('CHN-021', 7, 'Veg Hakka Noodles', 180.00, 55.00, 5.00, true, true, 'chinese', 'Wok tossed noodles with julienne vegetables, soy sauce and white pepper', 'Classic Veg Hakka Noodles', 10.00, 21),
('CHN-022', 7, 'Veg Schezwan Noodles', 195.00, 60.00, 5.00, true, true, 'chinese', 'Spicy noodles tossed in in-house red hot schezwan sauce & veggies', 'Spicy Red Schezwan Noodles', 10.00, 22),
('CHN-023', 7, 'Veg Chilli Garlic Noodles', 190.00, 60.00, 5.00, true, false, 'chinese', 'Noodles tossed with abundant burnt garlic, green chillies & spring onions', 'Burnt Garlic Chilli Noodles', 10.00, 23),
('CHN-024', 7, 'Veg Singapuri Noodles', 210.00, 65.00, 5.00, true, false, 'chinese', 'Thin vermicelli style noodles tossed with curry powder, veggies & raisins', 'Curry Spiced Singapuri Noodles', 10.00, 24),
('CHN-025', 7, 'Veg Butter Garlic Noodles', 200.00, 65.00, 5.00, true, false, 'chinese', 'Noodles tossed in rich Amul butter, garlic and fresh herbs', 'Butter Garlic Veg Noodles', 10.00, 25),
('CHN-026', 7, 'Chicken Hakka Noodles', 220.00, 75.00, 5.00, false, true, 'chinese', 'Wok tossed noodles with chicken strips, egg ribbons & crisp veggies', 'Chicken Egg Hakka Noodles', 10.00, 26),
('CHN-027', 7, 'Chicken Schezwan Noodles', 240.00, 80.00, 5.00, false, true, 'chinese', 'Spicy wok noodles tossed with chicken, fiery schezwan paste & pepper', 'Fiery Chicken Schezwan Noodles', 10.00, 27),
('CHN-028', 7, 'Chicken Chilli Garlic Noodles', 230.00, 75.00, 5.00, false, false, 'chinese', 'Noodles tossed with roasted garlic, chicken chunks & red chilli flakes', 'Garlic Chilli Chicken Noodles', 10.00, 28),
('CHN-029', 7, 'Veg Fried Rice', 180.00, 55.00, 5.00, true, true, 'chinese', 'Steamed rice stir fried with diced carrots, beans, peas & soy sauce', 'Classic Veg Fried Rice', 10.00, 29),
('CHN-030', 7, 'Veg Schezwan Fried Rice', 195.00, 60.00, 5.00, true, true, 'chinese', 'Stir fried rice cooked in red spicy schezwan sauce & vegetables', 'Spicy Schezwan Rice', 10.00, 30),
('CHN-031', 7, 'Veg Burnt Garlic Fried Rice', 190.00, 60.00, 5.00, true, false, 'chinese', 'Rice stir fried with aromatic golden roasted garlic and spring onions', 'Golden Roasted Garlic Rice', 10.00, 31),
('CHN-032', 7, 'Egg Fried Rice', 200.00, 65.00, 5.00, false, true, 'chinese', 'Stir fried rice with scrambled eggs, green onions and white pepper', 'Scrambled Egg Fried Rice', 10.00, 32),
('CHN-033', 7, 'Chicken Fried Rice', 230.00, 75.00, 5.00, false, true, 'chinese', 'Stir fried rice loaded with shredded chicken, egg and veggies', 'Loaded Chicken Fried Rice', 10.00, 33),
('CHN-034', 7, 'Chicken Schezwan Fried Rice', 245.00, 82.00, 5.00, false, true, 'chinese', 'Fiery rice tossed with chicken, spicy schezwan chilli paste & spring onion', 'Fiery Chicken Schezwan Rice', 10.00, 34),
('CHN-035', 7, 'Veg Manchurian Gravy', 210.00, 65.00, 5.00, true, true, 'chinese', 'Veg manchurian dumplings cooked in savory dark garlic soy gravy', 'Garlic Soy Manchurian Gravy', 15.00, 35),
('CHN-036', 7, 'Chilli Paneer Gravy', 250.00, 80.00, 5.00, true, true, 'chinese', 'Cottage cheese cubes cooked in spicy green chilli soy gravy', 'Spicy Green Chilli Paneer Gravy', 15.00, 36),
('CHN-037', 7, 'Veg Hot Garlic Sauce Gravy', 220.00, 70.00, 5.00, true, false, 'chinese', 'Exotic vegetables cooked in fiery garlic tomato sauce gravy', 'Fiery Garlic Veg Gravy', 15.00, 37),
('CHN-038', 7, 'Chilli Chicken Gravy', 290.00, 95.00, 5.00, false, true, 'chinese', 'Crispy chicken chunks cooked in thick soy garlic green chilli gravy', 'Thick Soy Chilli Chicken Gravy', 15.00, 38),
('CHN-039', 7, 'Chicken Manchurian Gravy', 280.00, 90.00, 5.00, false, false, 'chinese', 'Minced chicken meatballs cooked in dark spiced soy ginger gravy', 'Spiced Chicken Meatball Gravy', 15.00, 39),
('CHN-040', 7, 'Chicken Hot Garlic Gravy', 290.00, 95.00, 5.00, false, false, 'chinese', 'Chicken breast pieces cooked in sweet red chilli garlic gravy', 'Red Chilli Garlic Chicken Gravy', 15.00, 40),
('CHN-041', 7, 'Veg American Chop Suey', 240.00, 75.00, 5.00, true, true, 'chinese', 'Crispy fried noodles topped with sweet & sour vegetable tomato sauce & fried egg option', 'Crispy Noodle Sweet & Sour', 15.00, 41),
('CHN-042', 7, 'Chicken American Chop Suey', 270.00, 90.00, 5.00, false, true, 'chinese', 'Crispy noodles topped with chicken, sweet tangy sauce & sunny side fried egg', 'Crispy Noodle Chicken Egg', 15.00, 42),
('CHN-043', 7, 'Veg Triple Schezwan Rice', 270.00, 85.00, 5.00, true, true, 'chinese', 'Combination of fried rice, schezwan noodles & manchurian gravy in one bowl', 'Rice Noodle Manchurian Bowl', 15.00, 43),
('CHN-044', 7, 'Chicken Triple Schezwan Rice', 310.00, 105.00, 5.00, false, true, 'chinese', 'Combination of chicken fried rice, chicken noodles & chicken schezwan gravy', 'Triple Chicken Combo Bowl', 15.00, 44),
('CHN-045', 7, 'Chinese Combo Meal Veg', 250.00, 80.00, 5.00, true, true, 'chinese', 'Veg Hakka Noodles OR Fried Rice served with Veg Manchurian Gravy + 2 Spring Rolls', 'Full Chinese Veg Platter', 15.00, 45),

-- CATEGORY 8: Sandwiches, Burgers & Wraps (kds_station = 'french') [FRN-001 to FRN-020]
('FRN-001', 8, 'Veg Grilled Sandwich', 110.00, 32.00, 5.00, true, true, 'french', 'Butter toasted bread layered with sliced cucumber, tomato, potato & mint chutney', 'Classic Veg Toast Sandwich', 10.00, 1),
('FRN-002', 8, 'Veg Cheese Grilled Sandwich', 140.00, 42.00, 5.00, true, true, 'french', 'Toasted sandwich stuffed with veggies, mint chutney and melted cheddar', 'Cheesy Veg Toast Sandwich', 10.00, 2),
('FRN-003', 8, 'Bombay Masala Toast Sandwich', 130.00, 38.00, 5.00, true, true, 'french', 'Spiced potato mash, onions, capsicum, sandwich masala & butter grill', 'Spicy Bombay Potato Sandwich', 10.00, 3),
('FRN-004', 8, 'Paneer Tikka Sandwich', 160.00, 50.00, 5.00, true, true, 'french', 'Grilled cottage cheese cubes tossed in tikka mayo stuffed between toasted bread', 'Tandoori Paneer Mayo Sandwich', 10.00, 4),
('FRN-005', 8, 'Corn & Cheese Sandwich', 150.00, 48.00, 5.00, true, false, 'french', 'Sweet corn kernels mixed with mayo and grated mozzarella cheese', 'Sweet Corn Mozzarella Sandwich', 10.00, 5),
('FRN-006', 8, 'Chicken Grilled Sandwich', 170.00, 55.00, 5.00, false, true, 'french', 'Shredded roasted chicken mixed with herbs, mayo & butter grilled bread', 'Classic Herb Chicken Sandwich', 10.00, 6),
('FRN-007', 8, 'Chicken Club Sandwich', 210.00, 70.00, 5.00, false, true, 'french', 'Triple decker toasted sandwich layered with chicken, fried egg, lettuce & cheese', 'Triple Decker Chicken Egg Club', 15.00, 7),
('FRN-008', 8, 'Crispy Veg Herb Burger', 110.00, 32.00, 5.00, true, true, 'french', 'Golden fried veg patty in soft sesame bun with lettuce, tomato & mayo', 'Crispy Veg Patty Burger', 10.00, 8),
('FRN-009', 8, 'Aloo Tikki Supreme Burger', 90.00, 26.00, 5.00, true, true, 'french', 'Crispy spiced potato patty topped with onions, tomatoes & thousand island sauce', 'Desi Aloo Tikki Burger', 10.00, 9),
('FRN-010', 8, 'Veg Cheese Burst Burger', 150.00, 48.00, 5.00, true, true, 'french', 'Crispy veg patty topped with liquid cheese slice & molten cheese sauce', 'Double Cheese Veg Burger', 10.00, 10),
('FRN-011', 8, 'Paneer King Burger', 170.00, 55.00, 5.00, true, true, 'french', 'Thick paneer patty fried crisp with thousand island sauce & crunchy lettuce', 'Thick Paneer Patty Burger', 10.00, 11),
('FRN-012', 8, 'Crispy Chicken Burger', 160.00, 52.00, 5.00, false, true, 'french', 'Juicy fried chicken patty with lettuce, onion & garlic mayo in sesame bun', 'Crispy Chicken Patty Burger', 10.00, 12),
('FRN-013', 8, 'Chicken Cheese Burst Burger', 190.00, 65.00, 5.00, false, true, 'french', 'Fried chicken patty loaded with melted cheese slice and spicy mayo sauce', 'Melting Cheese Chicken Burger', 10.00, 13),
('FRN-014', 8, 'Double Mutton Patty Burger', 260.00, 90.00, 5.00, false, true, 'french', '2 grilled mutton patties, double cheese, caramelized onions & smoked BBQ sauce', 'Monster Double Mutton Burger', 15.00, 14),
('FRN-015', 8, 'Veg Kathi Roll', 130.00, 38.00, 5.00, true, true, 'french', 'Flaky paratha wrap filled with seasoned mixed veggies, onions & mint chutney', 'Flaky Veg Kathi Wrap', 10.00, 15),
('FRN-016', 8, 'Paneer Tikka Roll', 160.00, 50.00, 5.00, true, true, 'french', 'Grilled paneer tikka wrapped in flaky paratha with sliced onions & lemon', 'Smoky Paneer Tikka Wrap', 10.00, 16),
('FRN-017', 8, 'Chicken Tikka Roll', 180.00, 60.00, 5.00, false, true, 'french', 'Tandoori chicken tikka wrapped in egg-coated paratha with tangy chutneys', 'Egg Coated Chicken Tikka Roll', 10.00, 17),
('FRN-018', 8, 'Chicken Seekh Roll', 190.00, 65.00, 5.00, false, false, 'french', 'Skewered chicken seekh kebab wrapped in hot butter paratha', 'Chicken Seekh Kebab Wrap', 10.00, 18),
('FRN-019', 8, 'Mutton Seekh Roll', 220.00, 75.00, 5.00, false, true, 'french', 'Grilled mutton seekh wrapped with pickled onions & spicy green sauce', 'Mutton Seekh Kebab Wrap', 10.00, 19),
('FRN-020', 8, 'Falafel Pita Wrap', 170.00, 52.00, 5.00, true, false, 'french', 'Crispy chickpea falafel balls in pita pocket with hummus & tahini sauce', 'Middle Eastern Falafel Pita', 10.00, 20),

-- CATEGORY 9: Pizzas, Pastas & Garlic Bread (kds_station = 'french') [FRN-021 to FRN-045]
('FRN-021', 9, 'Margherita Pizza (7 Inch)', 180.00, 55.00, 5.00, true, true, 'french', 'Classic pizza topped with Italian basil tomato sauce & 100% mozzarella cheese', 'Classic Cheese Margherita', 15.00, 21),
('FRN-022', 9, 'Farmhouse Pizza (7 Inch)', 240.00, 75.00, 5.00, true, true, 'french', 'Topped with capsicum, onion, tomato, grilled mushroom & mozzarella', 'Loaded Veggie Farmhouse Pizza', 15.00, 22),
('FRN-023', 9, 'Paneer Tikka Pizza (7 Inch)', 270.00, 85.00, 5.00, true, true, 'french', 'Spicy tandoori paneer, red capsicum, onions, coriander & mozzarella', 'Tandoori Paneer Topped Pizza', 15.00, 23),
('FRN-024', 9, 'Veggie Paradise Pizza (7 Inch)', 260.00, 80.00, 5.00, true, false, 'french', 'Baby corn, black olives, jalapenos, capsicum & extra mozzarella', 'Exotic Veggie Paradise Pizza', 15.00, 24),
('FRN-025', 9, 'Cheese Burst Veg Pizza (7 Inch)', 290.00, 95.00, 5.00, true, true, 'french', 'Crust filled with liquid cheddar cheese topped with double mozzarella & veggies', 'Molten Cheese Crust Veg Pizza', 15.00, 25),
('FRN-026', 9, 'Chicken BBQ Pizza (7 Inch)', 310.00, 100.00, 5.00, false, true, 'french', 'Smoked BBQ chicken chunks, red onions, sweet corn & mozzarella cheese', 'Smoky BBQ Chicken Pizza', 15.00, 26),
('FRN-027', 9, 'Chicken Tikka Pizza (7 Inch)', 320.00, 105.00, 5.00, false, true, 'french', 'Tandoori chicken tikka, spicy jalapenos, onions & double mozzarella', 'Desi Chicken Tikka Pizza', 15.00, 27),
('FRN-028', 9, 'Pepperoni Supreme Pizza (7 Inch)', 360.00, 120.00, 5.00, false, true, 'french', 'Slices of spicy chicken pepperoni topped with mozzarella & oregano', 'Spicy Pepperoni Slice Pizza', 15.00, 28),
('FRN-029', 9, 'Non-Veg Feast Pizza (7 Inch)', 380.00, 130.00, 5.00, false, true, 'french', 'Chicken tikka, BBQ chicken, chicken sausage, meatballs & mozzarella', 'Meat Overload Pizza', 15.00, 29),
('FRN-030', 9, 'Classic Garlic Bread (4 Pcs)', 110.00, 32.00, 5.00, true, true, 'french', 'Oven baked French baguette slices brushed with garlic herb butter', 'Herb Garlic Baguette Slices', 10.00, 30),
('FRN-031', 9, 'Cheese Garlic Bread (4 Pcs)', 150.00, 45.00, 5.00, true, true, 'french', 'Garlic bread slices baked topped with golden melted mozzarella cheese', 'Cheesy Garlic Toast Slices', 10.00, 31),
('FRN-032', 9, 'Supreme Stuffed Garlic Bread', 180.00, 55.00, 5.00, true, true, 'french', 'Freshly baked dough stuffed with mozzarella, sweet corn & jalapeños', 'Stuffed Corn Cheese Garlic Bread', 10.00, 32),
('FRN-033', 9, 'White Sauce Penne Pasta (Veg)', 220.00, 70.00, 5.00, true, true, 'french', 'Penne pasta tossed in rich rich Alfredo cream sauce with broccoli & corn', 'Creamy Alfredo Veg Penne', 15.00, 33),
('FRN-034', 9, 'Red Sauce Penne Pasta (Veg)', 210.00, 65.00, 5.00, true, true, 'french', 'Penne pasta tossed in spicy Italian Arrabbiata tomato garlic sauce', 'Spicy Arrabbiata Tomato Penne', 15.00, 34),
('FRN-035', 9, 'Pink Sauce Penne Pasta (Veg)', 230.00, 72.00, 5.00, true, true, 'french', 'Penne pasta tossed in harmonious blend of cream & spicy tomato sauce', 'Creamy Tomato Pink Sauce Pasta', 15.00, 35),
('FRN-036', 9, 'White Sauce Chicken Penne', 260.00, 85.00, 5.00, false, true, 'french', 'Penne tossed with grilled chicken strips in rich parmesan Alfredo cream', 'Creamy Chicken Alfredo Pasta', 15.00, 36),
('FRN-037', 9, 'Red Sauce Chicken Penne', 250.00, 80.00, 5.00, false, false, 'french', 'Penne tossed with chicken in spicy tomato basil garlic sauce', 'Spicy Tomato Chicken Penne', 15.00, 37),
('FRN-038', 9, 'Mac & Cheese Classic', 240.00, 75.00, 5.00, true, true, 'french', 'Elbow macaroni baked in rich cheddar cheese sauce topped with breadcrumbs', 'Baked Cheddar Macaroni Cheese', 15.00, 38),
('FRN-039', 9, 'Classic Salted French Fries', 110.00, 30.00, 5.00, true, true, 'french', 'Golden crispy deep fried potato fries lightly salted', 'Golden Crispy Salted Fries', 10.00, 39),
('FRN-040', 9, 'Peri Peri Crispy Fries', 130.00, 36.00, 5.00, true, true, 'french', 'Crispy french fries dusted with spicy African Peri Peri seasoning', 'Spicy Peri Peri Seasoned Fries', 10.00, 40),
('FRN-041', 9, 'Loaded Cheese Fries', 160.00, 48.00, 5.00, true, true, 'french', 'Golden fries smothered with warm liquid cheddar & jalapenos', 'Cheesy Warm Loaded Fries', 10.00, 41),
('FRN-042', 9, 'Loaded Chicken Fries', 200.00, 65.00, 5.00, false, true, 'french', 'Fries topped with crispy chicken popcorn, liquid cheese & barbecue sauce', 'BBQ Chicken Cheese Fries', 15.00, 42),
('FRN-043', 9, 'Crispy Veg Nuggets (8 Pcs)', 130.00, 38.00, 5.00, true, false, 'french', 'Bite sized vegetable nuggets fried crisp served with cocktail dip', 'Crispy Golden Veg Nuggets', 10.00, 43),
('FRN-044', 9, 'Crispy Chicken Nuggets (8 Pcs)', 170.00, 52.00, 5.00, false, true, 'french', 'Tender chicken breast nuggets coated in crispy breadcrumbs', 'Golden Crispy Chicken Nuggets', 10.00, 44),
('FRN-045', 9, 'Mozzarella Cheese Sticks (5 Pcs)', 190.00, 60.00, 5.00, true, true, 'french', 'Breaded mozzarella cheese sticks fried crisp with gooey cheesy pull', 'Gooey Mozzarella Cheese Sticks', 10.00, 45),

-- CATEGORY 10: Beverages, Shakes & Desserts (kds_station = 'drink') [DRK-001 to DRK-030]
('DRK-001', 10, 'Masala Chai (Cutting)', 30.00, 8.00, 5.00, true, true, 'drink', 'Authentic Indian tea brewed with ginger, cardamom, cloves & full cream milk', 'Desi Ginger Cardamom Tea', 0.00, 1),
('DRK-002', 10, 'Adrak Elaichi Tea', 35.00, 9.00, 5.00, true, false, 'drink', 'Piping hot fresh ginger and green cardamom milk tea', 'Hot Ginger Cardamom Tea', 0.00, 2),
('DRK-003', 10, 'Green Tea Lemon Honey', 50.00, 12.00, 5.00, true, false, 'drink', 'Organic green tea infused with fresh lemon squeeze & natural honey', 'Healthy Lemon Honey Green Tea', 0.00, 3),
('DRK-004', 10, 'Hot Filter Coffee', 60.00, 16.00, 5.00, true, true, 'drink', 'Traditional South Indian chicory blend filter coffee poured frothy', 'South Indian Frothy Coffee', 0.00, 4),
('DRK-005', 10, 'Espresso Single Shot', 70.00, 18.00, 5.00, true, false, 'drink', 'Intense rich dark roasted arabica coffee shot', 'Rich Dark Espresso Shot', 0.00, 5),
('DRK-006', 10, 'Cappuccino Hot', 110.00, 30.00, 5.00, true, true, 'drink', 'Equal parts espresso, steamed milk and velvety milk foam topped with cocoa', 'Classic Steamed Cappuccino', 0.00, 6),
('DRK-007', 10, 'Café Latte', 120.00, 32.00, 5.00, true, false, 'drink', 'Smooth espresso shot with rich steamed milk and thin foam layer', 'Smooth Milky Espresso Latte', 0.00, 7),
('DRK-008', 10, 'Hot Chocolate Fudge', 140.00, 40.00, 5.00, true, true, 'drink', 'Rich Dutch dark cocoa powder melted in steaming whole milk', 'Rich Dark Hot Chocolate', 0.00, 8),
('DRK-009', 10, 'Classic Cold Coffee', 130.00, 35.00, 5.00, true, true, 'drink', 'Blended espresso, chilled milk, sugar and ice topped with chocolate powder', 'Chilled Blended Cold Coffee', 10.00, 9),
('DRK-010', 10, 'Cold Coffee with Ice Cream', 160.00, 48.00, 5.00, true, true, 'drink', 'Cold coffee thick shake crowned with a huge scoop of vanilla ice cream', 'Cold Coffee Vanilla Scoop', 10.00, 10),
('DRK-011', 10, 'Hazelnut Cold Coffee', 170.00, 52.00, 5.00, true, true, 'drink', 'Blended cold coffee infused with premium roasted hazelnut syrup', 'Roasted Hazelnut Cold Coffee', 10.00, 11),
('DRK-012', 10, 'Chocolate Milkshake', 140.00, 42.00, 5.00, true, true, 'drink', 'Thick milkshake blended with dark chocolate sauce & chocolate ice cream', 'Thick Dark Chocolate Shake', 10.00, 12),
('DRK-013', 10, 'Oreo Crunch Shake', 160.00, 50.00, 5.00, true, true, 'drink', 'Chilled milk blended with crushed Oreo cookies & vanilla ice cream', 'Crushed Oreo Cookie Shake', 10.00, 13),
('DRK-014', 10, 'KitKat Chocolate Shake', 170.00, 55.00, 5.00, true, true, 'drink', 'Blended with KitKat wafer bars, chocolate syrup & vanilla scoop', 'Crispy KitKat Wafer Shake', 10.00, 14),
('DRK-015', 10, 'Strawberry Milkshake', 140.00, 40.00, 5.00, true, false, 'drink', 'Blended sweet strawberry pulp, chilled milk & strawberry ice cream', 'Sweet Strawberry Fruit Shake', 10.00, 15),
('DRK-016', 10, 'Mango Thick Shake', 150.00, 45.00, 5.00, true, true, 'drink', 'Rich Alphonso mango pulp blended with chilled milk & ice cream', 'Alphonso Mango Thick Shake', 10.00, 16),
('DRK-017', 10, 'Nutella Brownie Shake', 190.00, 65.00, 5.00, true, true, 'drink', 'Thick shake loaded with original Nutella spread & fresh chocolate brownie bits', 'Loaded Nutella Brownie Shake', 10.00, 17),
('DRK-018', 10, 'Sweet Punjabi Lassi', 90.00, 25.00, 5.00, true, true, 'drink', 'Thick sweet churned yogurt drink topped with malai & cardamom', 'Thick Sweet Malai Lassi', 5.00, 18),
('DRK-019', 10, 'Mango Lassi', 110.00, 32.00, 5.00, true, false, 'drink', 'Churned yogurt blended with Alphonso mango pulp & saffron', 'Chilled Alphonso Mango Lassi', 5.00, 19),
('DRK-020', 10, 'Masala Salted Chaas (Buttermilk)', 50.00, 12.00, 5.00, true, true, 'drink', 'Refreshment churned spiced buttermilk with cumin, mint & green chilli', 'Spiced Mint Cooling Chaas', 0.00, 20),
('DRK-021', 10, 'Virgin Mojito Mocktail', 130.00, 35.00, 5.00, true, true, 'drink', 'Muddled fresh mint leaves, lime juice, simple syrup & sparkling soda', 'Chilled Fresh Mint Lime Soda', 10.00, 21),
('DRK-022', 10, 'Blue Lagoon Mocktail', 140.00, 38.00, 5.00, true, true, 'drink', 'Refreshing blue curacao syrup, lemon juice, mint & sprite fizzy drink', 'Fizzy Blue Curacao Drink', 10.00, 22),
('DRK-023', 10, 'Fresh Lime Soda (Sweet/Salt)', 70.00, 18.00, 5.00, true, true, 'drink', 'Squeezed fresh lime juice served with sparkling soda or water', 'Chilled Fresh Lemon Soda', 5.00, 23),
('DRK-024', 10, 'Watermelon Mint Cooler', 120.00, 30.00, 5.00, true, false, 'drink', 'Freshly pressed watermelon juice poured over crushed ice & mint', 'Fresh Watermelon Mint Juice', 10.00, 24),
('DRK-025', 10, 'Gulab Jamun (2 Pcs)', 80.00, 22.00, 5.00, true, true, 'drink', 'Warm soft fried khoya dumplings soaked in rose flavored sugar syrup', 'Warm Soft Rose Sugar Syrup Dumplings', 5.00, 25),
('DRK-026', 10, 'Rasgulla (2 Pcs)', 80.00, 22.00, 5.00, true, false, 'drink', 'Spongy chhena balls soaked in clear light cardamom sugar syrup', 'Spongy Bengali Chhena Rasgulla', 5.00, 26),
('DRK-027', 10, 'Sizzling Sizzler Brownie with Ice Cream', 180.00, 55.00, 5.00, true, true, 'drink', 'Hot fudgy chocolate brownie served on sizzling iron plate topped with vanilla ice cream & hot fudge sauce', 'Hot Sizzling Brownie Vanilla Scoop', 10.00, 27),
('DRK-028', 10, 'Rasmalai (2 Pcs)', 110.00, 35.00, 5.00, true, true, 'drink', 'Flattened chhena patties soaked in sweet saffron cardamom thickened milk', 'Saffron Flavored Creamy Rasmalai', 5.00, 28),
('DRK-029', 10, 'Vanilla Ice Cream (2 Scoops)', 70.00, 18.00, 5.00, true, false, 'drink', 'Classic rich vanilla bean ice cream scoops', 'Rich Vanilla Bean Ice Cream', 5.00, 29),
('DRK-030', 10, 'Chocolate Fudge Ice Cream Sundae', 140.00, 42.00, 5.00, true, true, 'drink', '2 scoops vanilla ice cream layered with hot chocolate fudge sauce & roasted nuts', 'Chocolate Fudge Nut Sundae', 10.00, 30);


-- Insert into public.menu_items from staging table
INSERT INTO public.menu_items (
    tenant_id, branch_id, company_id, category_id, item_code, name, price, cost_price, tax_rate, is_available, kds_station, description, short_description, is_veg, is_popular, packaging_charge, sort_order
)
SELECT 
    1 AS tenant_id, 
    2 AS branch_id, 
    1 AS company_id, 
    s.category_id, 
    s.item_code, 
    s.name, 
    s.price, 
    s.cost_price, 
    s.tax_rate, 
    true AS is_available, 
    s.kds_station, 
    s.description, 
    s.short_description, 
    s.is_veg, 
    s.is_popular, 
    s.packaging_charge, 
    s.sort_order
FROM temp_menu_seed s
ON CONFLICT (tenant_id, item_code) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    kds_station = EXCLUDED.kds_station,
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    is_veg = EXCLUDED.is_veg,
    is_popular = EXCLUDED.is_popular;


-- -----------------------------------------------------------------------------
-- 5. VARIANT GROUPS & VARIANT OPTIONS SEED
-- -----------------------------------------------------------------------------

-- Create Variant Group for Curries / Mains (Portion Size: Half / Full)
INSERT INTO public.menu_variant_groups (tenant_id, branch_id, company_id, item_id, name, is_required, min_selection, max_selection, sort_order)
SELECT 1, 2, 1, mi.id, 'Portion Size', true, '1', '1', '1'
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND mi.category_id IN (2, 3) -- Veg & Non-Veg Sabji
ON CONFLICT DO NOTHING;

-- Insert Variant Options for Curries (Half / Full)
INSERT INTO public.menu_variant_options (tenant_id, branch_id, company_id, group_id, name, additional_price, selling_price, price, is_default, is_available, sort_order)
SELECT 
    1, 2, 1, mvg.id, 'Half Portion', -60.00, (mi.price - 60.00), (mi.price - 60.00), false, true, 1
FROM public.menu_variant_groups mvg
JOIN public.menu_items mi ON mvg.item_id = mi.id
WHERE mvg.name = 'Portion Size' AND mi.category_id IN (2, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_variant_options (tenant_id, branch_id, company_id, group_id, name, additional_price, selling_price, price, is_default, is_available, sort_order)
SELECT 
    1, 2, 1, mvg.id, 'Full Portion (Standard)', 0.00, mi.price, mi.price, true, true, 2
FROM public.menu_variant_groups mvg
JOIN public.menu_items mi ON mvg.item_id = mi.id
WHERE mvg.name = 'Portion Size' AND mi.category_id IN (2, 3)
ON CONFLICT DO NOTHING;

-- Create Variant Group for Pizzas (Size: 7" / 10" / 12")
INSERT INTO public.menu_variant_groups (tenant_id, branch_id, company_id, item_id, name, is_required, min_selection, max_selection, sort_order)
SELECT 1, 2, 1, mi.id, 'Pizza Size', true, '1', '1', '1'
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND mi.category_id = 9 AND mi.name LIKE '%Pizza%'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_variant_options (tenant_id, branch_id, company_id, group_id, name, additional_price, selling_price, price, is_default, is_available, sort_order)
SELECT 1, 2, 1, mvg.id, '7 inch Regular', 0.00, mi.price, mi.price, true, true, 1
FROM public.menu_variant_groups mvg JOIN public.menu_items mi ON mvg.item_id = mi.id WHERE mvg.name = 'Pizza Size'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_variant_options (tenant_id, branch_id, company_id, group_id, name, additional_price, selling_price, price, is_default, is_available, sort_order)
SELECT 1, 2, 1, mvg.id, '10 inch Medium', 120.00, (mi.price + 120.00), (mi.price + 120.00), false, true, 2
FROM public.menu_variant_groups mvg JOIN public.menu_items mi ON mvg.item_id = mi.id WHERE mvg.name = 'Pizza Size'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_variant_options (tenant_id, branch_id, company_id, group_id, name, additional_price, selling_price, price, is_default, is_available, sort_order)
SELECT 1, 2, 1, mvg.id, '12 inch Large', 220.00, (mi.price + 220.00), (mi.price + 220.00), false, true, 3
FROM public.menu_variant_groups mvg JOIN public.menu_items mi ON mvg.item_id = mi.id WHERE mvg.name = 'Pizza Size'
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------------------------
-- 6. ADDON GROUPS & ADDON OPTIONS SEED
-- -----------------------------------------------------------------------------

-- Create Addon Group for Burgers & Sandwiches (Dips & Extras)
INSERT INTO public.menu_addon_groups (tenant_id, branch_id, company_id, item_id, name, min_selection, max_selection, sort_order)
SELECT 1, 2, 1, mi.id, 'Add Extras & Dips', 0, 3, '1'
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND mi.category_id IN (8, 9)
ON CONFLICT DO NOTHING;

-- Insert Addon Options
INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Extra Cheese Slice', 25.00, true, 1 FROM public.menu_addon_groups mag WHERE mag.name = 'Add Extras & Dips'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Garlic Mayo Dip', 20.00, true, 2 FROM public.menu_addon_groups mag WHERE mag.name = 'Add Extras & Dips'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Peri Peri Dip', 25.00, true, 3 FROM public.menu_addon_groups mag WHERE mag.name = 'Add Extras & Dips'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Extra Jalapenos & Olives', 30.00, true, 4 FROM public.menu_addon_groups mag WHERE mag.name = 'Add Extras & Dips'
ON CONFLICT DO NOTHING;

-- Create Addon Group for Beverages (Toppings)
INSERT INTO public.menu_addon_groups (tenant_id, branch_id, company_id, item_id, name, min_selection, max_selection, sort_order)
SELECT 1, 2, 1, mi.id, 'Beverage Toppings', 0, 2, '1'
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND mi.category_id = 10 AND (mi.name LIKE '%Shake%' OR mi.name LIKE '%Coffee%')
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Vanilla Ice Cream Scoop', 35.00, true, 1 FROM public.menu_addon_groups mag WHERE mag.name = 'Beverage Toppings'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Whipped Cream Topping', 25.00, true, 2 FROM public.menu_addon_groups mag WHERE mag.name = 'Beverage Toppings'
ON CONFLICT DO NOTHING;

INSERT INTO public.menu_addon_options (tenant_id, branch_id, company_id, group_id, name, price, is_available, sort_order)
SELECT 1, 2, 1, mag.id, 'Extra Chocolate Syrup Shot', 20.00, true, 3 FROM public.menu_addon_groups mag WHERE mag.name = 'Beverage Toppings'
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------------------------
-- 7. MENU ITEM TAGS MAPPING SEED
-- -----------------------------------------------------------------------------

-- Tag popular items as 'Bestseller' (tag_id = 1)
INSERT INTO public.menu_item_tags (tenant_id, branch_id, company_id, item_id, tag_id)
SELECT 1, 2, 1, mi.id, 1
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND mi.is_popular = true
ON CONFLICT DO NOTHING;

-- Tag spicy items as 'Spicy' (tag_id = 3)
INSERT INTO public.menu_item_tags (tenant_id, branch_id, company_id, item_id, tag_id)
SELECT 1, 2, 1, mi.id, 3
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND (mi.name LIKE '%Spicy%' OR mi.name LIKE '%Chilli%' OR mi.name LIKE '%Schezwan%' OR mi.name LIKE '%Vindaloo%' OR mi.name LIKE '%Kolhapuri%')
ON CONFLICT DO NOTHING;

-- Tag special items as 'Chef Special' (tag_id = 2)
INSERT INTO public.menu_item_tags (tenant_id, branch_id, company_id, item_id, tag_id)
SELECT 1, 2, 1, mi.id, 2
FROM public.menu_items mi
WHERE mi.tenant_id = 1 AND (mi.name LIKE '%Deluxe%' OR mi.name LIKE '%Platter%' OR mi.name LIKE '%Special%' OR mi.name LIKE '%King%' OR mi.name LIKE '%Supreme%')
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS temp_menu_seed;

COMMIT;
