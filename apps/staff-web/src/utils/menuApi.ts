import { api } from "@ssrone/api-client";
import { MenuItem } from "@/stores/useStaffPOSStore";

export const POS_CATEGORIES = [
  { id: "1", name: "Starters & Appetizers", icon: "Utensils", count: 28 },
  { id: "2", name: "Main Course Gravies", icon: "Soup", count: 34 },
  { id: "3", name: "Tandoori Breads", icon: "Flame", count: 18 },
  { id: "4", name: "Dum Biryani & Rice", icon: "Sparkles", count: 22 },
  { id: "5", name: "Chinese & Asian Wok", icon: "UtensilsCrossed", count: 26 },
  { id: "6", name: "Wood-Fired Pizza", icon: "Pizza", count: 20 },
  { id: "7", name: "Burgers & Sandwiches", icon: "Sandwich", count: 22 },
  { id: "8", name: "Beverages & Cold Brews", icon: "Coffee", count: 28 },
  { id: "9", name: "Gourmet Desserts", icon: "IceCream", count: 18 },
  { id: "10", name: "Combos & Royal Thalis", icon: "Crown", count: 18 },
];

export const COMMERCIAL_MENU_ITEMS: MenuItem[] = [
  // 1. Starters & Appetizers
  {
    id: "prod-101",
    code: "STR-01",
    name: "Paneer Tikka Angara",
    description: "Charcoal roasted spiced cottage cheese marinated in crushed coriander, mustard oil and hung curd.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 260,
    basePrice: 260,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-1",
        name: "Portion Size",
        options: [
          { id: "opt-1a", name: "Regular (6 Pcs)", sellingPrice: 260 },
          { id: "opt-1b", name: "Large (10 Pcs)", sellingPrice: 390 },
          { id: "opt-1c", name: "Family Platter", sellingPrice: 590 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-1",
        name: "Accompaniments & Dips",
        options: [
          { id: "ao-1a", name: "Extra Mint Chutney & Laccha Onion", price: 30 },
          { id: "ao-1b", name: "Melted Garlic Herb Butter", price: 45 },
          { id: "ao-1c", name: "Extra Spiced Chaat Dip", price: 25 },
        ],
      },
    ],
  },
  {
    id: "prod-102",
    code: "STR-02",
    name: "Crispy Corn & Waterchestnut",
    description: "Golden fried sweet corn kernels and crunchy water chestnuts tossed with scallions and crushed pepper.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 220,
    basePrice: 220,
    isVeg: true,
    isBestseller: false,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-103",
    code: "STR-03",
    name: "Dahi Ke Kebab",
    description: "Pan-seared spiced hung yoghurt patties with fresh coriander, cardamom and cashew filling.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 280,
    basePrice: 280,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-104",
    code: "STR-04",
    name: "Bhatti Murgh Tikka",
    description: "Tender boneless chicken morsels marinated in roasted degi mirch, pounded spices and malt vinegar.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 360,
    basePrice: 360,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-104",
        name: "Portion Size",
        options: [
          { id: "opt-104a", name: "Regular (6 Pcs)", sellingPrice: 360 },
          { id: "opt-104b", name: "Jumbo (10 Pcs)", sellingPrice: 540 },
        ],
      },
    ],
  },
  {
    id: "prod-105",
    code: "STR-05",
    name: "Amritsari Tawa Fish",
    description: "Crispy carom seed and gram flour dusted River Sole fillets fried crisp, served with radish salad.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 440,
    basePrice: 440,
    isVeg: false,
    isBestseller: false,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-106",
    code: "STR-06",
    name: "Hara Bhara Kebab",
    description: "Nutritious spinach, green peas, and potato galettes pan-fried with roasted cashews.",
    category: "Starters & Appetizers",
    categoryId: "1",
    selling_price: 240,
    basePrice: 240,
    isVeg: true,
  },

  // 2. Main Course Gravies
  {
    id: "prod-201",
    code: "MC-01",
    name: "Dal Makhani Grand Reserve",
    description: "Slow simmered overnight black urad lentils infused with tomato puree, white cultured butter and fresh cream.",
    category: "Main Course Gravies",
    categoryId: "2",
    selling_price: 290,
    basePrice: 290,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
    addonGroups: [
      {
        id: "ag-201",
        name: "Garnish & Richness",
        options: [
          { id: "ao-201a", name: "Extra Desi White Butter", price: 40 },
          { id: "ao-201b", name: "Fresh Coriander & Ginger Juliennes", price: 20 },
        ],
      },
    ],
  },
  {
    id: "prod-202",
    code: "MC-02",
    name: "Paneer Lababdar",
    description: "Cottage cheese chunks cooked in rich onion, tomato and cashew nut gravy, finished with grated paneer.",
    category: "Main Course Gravies",
    categoryId: "2",
    selling_price: 340,
    basePrice: 340,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-202",
        name: "Serving Size",
        options: [
          { id: "opt-202a", name: "Half Handi", sellingPrice: 340 },
          { id: "opt-202b", name: "Full Handi", sellingPrice: 580 },
        ],
      },
    ],
  },
  {
    id: "prod-203",
    code: "MC-03",
    name: "Classic Butter Chicken (Murgh Makhani)",
    description: "Tandoor roasted pulled chicken in velvety tomato, butter, cashewnut and fenugreek scented gravy.",
    category: "Main Course Gravies",
    categoryId: "2",
    selling_price: 440,
    basePrice: 440,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-203",
        name: "Portion Size",
        options: [
          { id: "opt-203a", name: "Regular (Half)", sellingPrice: 440 },
          { id: "opt-203b", name: "Full (Feast)", sellingPrice: 760 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-203",
        name: "Add-ons",
        options: [
          { id: "ao-203a", name: "Extra Makhani Gravy Bowl", price: 90 },
          { id: "ao-203b", name: "Bone-less Chicken Cuts Only", price: 60 },
        ],
      },
    ],
  },
  {
    id: "prod-204",
    code: "MC-04",
    name: "Rogan Josh Kashmiri",
    description: "Tender mountain mutton cuts cooked in traditional Kashmiri spices, ratanjot and fennel essence.",
    category: "Main Course Gravies",
    categoryId: "2",
    selling_price: 520,
    basePrice: 520,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1545247181-516773cae7be?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-205",
    code: "MC-05",
    name: "Pind De Chole",
    description: "Authentic Rawalpindi chickpea curry slow-cooked with tea leaves, anardana, and roasted spices.",
    category: "Main Course Gravies",
    categoryId: "2",
    selling_price: 250,
    basePrice: 250,
    isVeg: true,
  },

  // 3. Tandoori Breads
  {
    id: "prod-301",
    code: "BRD-01",
    name: "Butter Garlic Naan",
    description: "Hand stretched refined flour bread topped with minced roasted garlic, butter and fresh coriander.",
    category: "Tandoori Breads",
    categoryId: "3",
    selling_price: 75,
    basePrice: 75,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-302",
    code: "BRD-02",
    name: "Cheese Chilli Naan",
    description: "Tandoori naan stuffed with mature cheddar cheese, green chillies and baked to crisp perfection.",
    category: "Tandoori Breads",
    categoryId: "3",
    selling_price: 110,
    basePrice: 110,
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "prod-303",
    code: "BRD-03",
    name: "Laccha Paratha (Butter)",
    description: "Multi-layered flaky whole wheat bread cooked in clay oven and brushed with pure ghee.",
    category: "Tandoori Breads",
    categoryId: "3",
    selling_price: 65,
    basePrice: 65,
    isVeg: true,
  },
  {
    id: "prod-304",
    code: "BRD-04",
    name: "Tandoori Roti (Wheat)",
    description: "Traditional whole wheat unleavened bread baked crisp in clay oven.",
    category: "Tandoori Breads",
    categoryId: "3",
    selling_price: 35,
    basePrice: 35,
    isVeg: true,
    variantGroups: [
      {
        id: "vg-304",
        name: "Finish",
        options: [
          { id: "opt-304a", name: "Plain Dry", sellingPrice: 35 },
          { id: "opt-304b", name: "Desi Butter Glaze", sellingPrice: 45 },
        ],
      },
    ],
  },

  // 4. Dum Biryani & Rice
  {
    id: "prod-401",
    code: "BIR-01",
    name: "Awadhi Murgh Dum Biryani",
    description: "Fragrant aged basmati rice layered with succulent chicken, saffron milk, kewra, and mint sealed with dough.",
    category: "Dum Biryani & Rice",
    categoryId: "4",
    selling_price: 420,
    basePrice: 420,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-401",
        name: "Portion Size",
        options: [
          { id: "opt-401a", name: "Single (1 Pax)", sellingPrice: 420 },
          { id: "opt-401b", name: "Handi Feast (2-3 Pax)", sellingPrice: 750 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-401",
        name: "Biryani Accompaniments",
        options: [
          { id: "ao-401a", name: "Burani Garlic Raita", price: 50 },
          { id: "ao-401b", name: "Spicy Mirchi Ka Salan", price: 45 },
          { id: "ao-401c", name: "Extra Boiled Egg (2 Pcs)", price: 40 },
        ],
      },
    ],
  },
  {
    id: "prod-402",
    code: "BIR-02",
    name: "Subz Tarkari Dum Biryani",
    description: "Seasonal garden vegetables, paneer cubes, and aromatic saffron basmati rice slow-cooked in handi.",
    category: "Dum Biryani & Rice",
    categoryId: "4",
    selling_price: 320,
    basePrice: 320,
    isVeg: true,
    isBestseller: false,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-403",
    code: "BIR-03",
    name: "Gosht Dum Biryani (Mutton)",
    description: "Slow dum cooked prime lamb cuts layered with mint, golden onions and saffron long grain rice.",
    category: "Dum Biryani & Rice",
    categoryId: "4",
    selling_price: 540,
    basePrice: 540,
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "prod-404",
    code: "BIR-04",
    name: "Jeera Fried Rice",
    description: "Long grain basmati rice tossed with fragrant roasted cumin seeds and fresh coriander.",
    category: "Dum Biryani & Rice",
    categoryId: "4",
    selling_price: 180,
    basePrice: 180,
    isVeg: true,
  },

  // 5. Wood-Fired Pizza
  {
    id: "prod-501",
    code: "PIZ-01",
    name: "Margherita Di Bufala",
    description: "San Marzano plum tomato sauce, fresh buffalo bocconcini mozzarella, fresh basil and extra virgin olive oil.",
    category: "Wood-Fired Pizza",
    categoryId: "6",
    selling_price: 380,
    basePrice: 380,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-501",
        name: "Crust Size",
        options: [
          { id: "opt-501a", name: "10-inch Medium", sellingPrice: 380 },
          { id: "opt-501b", name: "12-inch Large", sellingPrice: 540 },
          { id: "opt-501c", name: "14-inch Party", sellingPrice: 720 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-501",
        name: "Toppings & Crust",
        options: [
          { id: "ao-501a", name: "Extra Cheese Burst", price: 80 },
          { id: "ao-501b", name: "Kalamata Black Olives & Sun-dried Tomato", price: 60 },
          { id: "ao-501c", name: "Jalapeno Pepper Dip", price: 35 },
        ],
      },
    ],
  },
  {
    id: "prod-502",
    code: "PIZ-02",
    name: "BBQ Smoked Chicken Pizza",
    description: "Smoked tender chicken morsels, charred bell peppers, red onions, mozzarella, and smoky bourbon glaze.",
    category: "Wood-Fired Pizza",
    categoryId: "6",
    selling_price: 480,
    basePrice: 480,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-502",
        name: "Crust Size",
        options: [
          { id: "opt-502a", name: "10-inch Medium", sellingPrice: 480 },
          { id: "opt-502b", name: "12-inch Large", sellingPrice: 660 },
        ],
      },
    ],
  },

  // 6. Burgers & Sandwiches
  {
    id: "prod-601",
    code: "BRG-01",
    name: "Truffle Mushroom Burger",
    description: "Grilled herb portobello patty, caramelized onions, smoked cheddar cheese, and truffle garlic emulsion.",
    category: "Burgers & Sandwiches",
    categoryId: "7",
    selling_price: 290,
    basePrice: 290,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    addonGroups: [
      {
        id: "ag-601",
        name: "Burger Sides",
        options: [
          { id: "ao-601a", name: "Peri-Peri Seasoned Fries", price: 60 },
          { id: "ao-601b", name: "Crispy Battered Onion Rings", price: 70 },
          { id: "ao-601c", name: "Extra Melted Cheddar Slice", price: 40 },
        ],
      },
    ],
  },
  {
    id: "prod-602",
    code: "BRG-02",
    name: "Buttermilk Fried Chicken Burger",
    description: "Crispy buttermilk coated chicken breast, spicy sriracha slaw, pickled cucumbers on brioche bun.",
    category: "Burgers & Sandwiches",
    categoryId: "7",
    selling_price: 340,
    basePrice: 340,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80",
    variantGroups: [
      {
        id: "vg-602",
        name: "Size",
        options: [
          { id: "opt-602a", name: "Single Patty", sellingPrice: 340 },
          { id: "opt-602b", name: "Double Monster Patty", sellingPrice: 480 },
        ],
      },
    ],
  },

  // 7. Chinese & Asian Wok
  {
    id: "prod-701",
    code: "WOK-01",
    name: "Chilli Paneer Dry / Gravy",
    description: "Wok tossed cottage cheese cubes with bell peppers, green chillies, garlic and dark soy glaze.",
    category: "Chinese & Asian Wok",
    categoryId: "5",
    selling_price: 280,
    basePrice: 280,
    isVeg: true,
    isBestseller: true,
    variantGroups: [
      {
        id: "vg-701",
        name: "Style",
        options: [
          { id: "opt-701a", name: "Dry Appetizer", sellingPrice: 280 },
          { id: "opt-701b", name: "Rich Gravy", sellingPrice: 310 },
        ],
      },
    ],
  },
  {
    id: "prod-702",
    code: "WOK-02",
    name: "Hakka Noodles Special",
    description: "Wok-fried artisanal wheat noodles with shredded cabbage, carrots, bell peppers and scallions.",
    category: "Chinese & Asian Wok",
    categoryId: "5",
    selling_price: 220,
    basePrice: 220,
    isVeg: true,
    variantGroups: [
      {
        id: "vg-702",
        name: "Protein",
        options: [
          { id: "opt-702a", name: "Vegetable Classic", sellingPrice: 220 },
          { id: "opt-702b", name: "Egg Tossed", sellingPrice: 260 },
          { id: "opt-702c", name: "Shredded Chicken", sellingPrice: 310 },
        ],
      },
    ],
  },

  // 8. Beverages & Cold Brews
  {
    id: "prod-801",
    code: "BEV-01",
    name: "Special Masala Cutting Chai",
    description: "Freshly brewed full milk Assam tea infused with green cardamom, fresh ginger, and lemongrass.",
    category: "Beverages & Cold Brews",
    categoryId: "8",
    selling_price: 60,
    basePrice: 60,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-802",
    code: "BEV-02",
    name: "Cold Brew Coffee with Vanilla Cream",
    description: "18-hour cold steeped single-estate Arabica coffee poured over clear ice and topped with sweet cream.",
    category: "Beverages & Cold Brews",
    categoryId: "8",
    selling_price: 190,
    basePrice: 190,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-803",
    code: "BEV-03",
    name: "Fresh Alphonso Mango Lassi",
    description: "Thick churned sweet yoghurt blended with real Ratnagiri Alphonso mango pulp and pistachio flakes.",
    category: "Beverages & Cold Brews",
    categoryId: "8",
    selling_price: 140,
    basePrice: 140,
    isVeg: true,
    isBestseller: true,
  },

  // 9. Gourmet Desserts
  {
    id: "prod-901",
    code: "DST-01",
    name: "Sizzling Chocolate Brownie",
    description: "Warm fudgy walnut brownie served on sizzling cast iron plate with Madagascar vanilla bean gelato.",
    category: "Gourmet Desserts",
    categoryId: "9",
    selling_price: 240,
    basePrice: 240,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-902",
    code: "DST-02",
    name: "Gulab Jamun with Rabri Duo",
    description: "Warm saffron-soaked soft khoya dumplings served atop slow reduced creamy pistachio rabri.",
    category: "Gourmet Desserts",
    categoryId: "9",
    selling_price: 180,
    basePrice: 180,
    isVeg: true,
    isBestseller: true,
  },

  // 10. Combos & Royal Thalis
  {
    id: "prod-1001",
    code: "THL-01",
    name: "Maharaja Royal Thali (Veg)",
    description: "Dal Makhani, Shahi Paneer, Pind Chole, Pulao, 2 Butter Naan, Gulab Jamun, Salad, Raita & Papad.",
    category: "Combos & Royal Thalis",
    categoryId: "10",
    selling_price: 490,
    basePrice: 490,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-1002",
    code: "THL-02",
    name: "Shahi Murgh Thali (Non-Veg)",
    description: "Butter Chicken, Dal Makhani, Chicken Tikka (2 Pcs), Jeera Rice, 2 Garlic Naan, Raita, Gulab Jamun & Papad.",
    category: "Combos & Royal Thalis",
    categoryId: "10",
    selling_price: 590,
    basePrice: 590,
    isVeg: false,
    isBestseller: true,
  },
];

export const fetchMenuItems = async (branchId: number | string = 1): Promise<MenuItem[]> => {
  try {
    // 1. Fetch live categories first to accurately map category names
    const catMap = new Map<number | string, string>();
    try {
      const cats = await api.get<any>(`/restaurant/categories?branch_id=${branchId}`).catch(() => null);
      const catList = Array.isArray(cats) ? cats : cats?.items || [];
      catList.forEach((c: any) => catMap.set(c.id, c.name));
    } catch (_) {}

    // 2. Fetch live menu items
    const res = await api.get<any>(`/restaurant/menu-items?branch_id=${branchId}`).catch(() => null);
    let rawList: any[] = [];
    if (Array.isArray(res)) rawList = res;
    else if (res?.items && Array.isArray(res.items)) rawList = res.items;

    if (rawList.length > 0) {
      return rawList.map((item: any) => ({
        id: String(item.id),
        code: item.item_code || `DISH-${item.id}`,
        name: item.name,
        description: item.description || item.short_description || undefined,
        category: catMap.get(item.category_id) || "Other",
        categoryId: String(item.category_id || "1"),
        basePrice: Number(item.base_price || item.selling_price || 0),
        selling_price: Number(item.selling_price || item.base_price || 0),
        isVeg: item.is_veg !== undefined ? Boolean(item.is_veg) : true,
        isBestseller: Boolean(item.is_popular),
        image: item.image_url || undefined,
        variantGroups: (item.variant_groups || []).map((vg: any) => ({
          id: String(vg.id),
          name: vg.name,
          options: (Array.isArray(vg.options) ? vg.options : []).map((opt: any) => ({
            id: String(opt.id || opt.name),
            name: opt.name || opt.title,
            sellingPrice: Number(opt.price || opt.selling_price || item.selling_price),
          })),
        })),
        addonGroups: (item.addon_groups || []).map((ag: any) => ({
          id: String(ag.id),
          name: ag.name,
          options: (Array.isArray(ag.options) ? ag.options : []).map((opt: any) => ({
            id: String(opt.id || opt.name),
            name: opt.name,
            price: Number(opt.price || 0),
          })),
        })),
      }));
    }

    return COMMERCIAL_MENU_ITEMS;
  } catch (err) {
    console.warn("API menu items call error, fallback to commercial menu:", err);
    return COMMERCIAL_MENU_ITEMS;
  }
};

export const fetchCategories = async (branchId: number | string = 1): Promise<any[]> => {
  try {
    const res = await api.get<any>(`/restaurant/categories?branch_id=${branchId}`).catch(() => null);
    let catList: any[] = [];
    if (Array.isArray(res)) catList = res;
    else if (res?.items && Array.isArray(res.items)) catList = res.items;

    if (catList.length > 0) {
      return catList.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        icon: c.icon || "utensils",
      }));
    }

    return POS_CATEGORIES;
  } catch (err) {
    console.warn("API categories call error, fallback to POS categories:", err);
    return POS_CATEGORIES;
  }
};
