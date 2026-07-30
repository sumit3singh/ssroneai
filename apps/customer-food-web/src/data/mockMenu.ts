// ── ERP-Grade Data Models ──────────────────────────

export interface VariantOption {
  id: string;
  name: string;
  price: number;
  priceAdjustment?: number;
  sortOrder: number;
}

export function getVariantDisplayPrice(basePrice: number, option: VariantOption): number {
  if (option.price !== undefined && option.price > 0) {
    return option.price;
  }
  if (option.priceAdjustment !== undefined && option.priceAdjustment > 0) {
    if (option.priceAdjustment >= basePrice) {
      return option.priceAdjustment;
    }
    return basePrice + option.priceAdjustment;
  }
  return basePrice + (option.priceAdjustment || 0);
}

export function getVariantPriceAdjustment(basePrice: number, option: VariantOption): number {
  if (option.price !== undefined && option.price > 0) {
    return option.price >= basePrice ? option.price - basePrice : option.price;
  }
  if (option.priceAdjustment !== undefined && option.priceAdjustment >= basePrice) {
    return option.priceAdjustment - basePrice;
  }
  return option.priceAdjustment || 0;
}

export interface VariantGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: VariantOption[];
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface AddonGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: AddonOption[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  categoryId: string;
  isVeg: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
  gstPercent?: number;
  tags?: Tag[];
  variantGroups?: VariantGroup[];
  addonGroups?: AddonGroup[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  parentId?: string;
  level?: number;
  sortOrder?: number;
}

// ── Keep backward-compatible aliases ──
export type Variant = VariantOption;
export type Addon = AddonOption;

// ── Tags ──
export const productTags: Tag[] = [
  { id: "tag-bestseller", name: "Bestseller" },
  { id: "tag-spicy", name: "Spicy" },
  { id: "tag-chef-special", name: "Chef Special" },
  { id: "tag-new", name: "New" },
  { id: "tag-healthy", name: "Healthy" },
];

// ── Categories ──
export const categories: Category[] = [
  { id: "chinese", name: "Chinese", icon: "🥡", slug: "chinese", level: 1, sortOrder: 1 },
  { id: "pizza", name: "Pizza", icon: "🍕", slug: "pizza", level: 1, sortOrder: 2 },
  { id: "indian", name: "Indian Main Course", icon: "🍛", slug: "indian", level: 1, sortOrder: 3 },
  { id: "breads", name: "Breads", icon: "🫓", slug: "breads", level: 1, sortOrder: 4 },
  { id: "starters", name: "Starters", icon: "🍢", slug: "starters", level: 1, sortOrder: 5 },
  { id: "beverages", name: "Beverages", icon: "🥤", slug: "beverages", level: 1, sortOrder: 6 },
  { id: "desserts", name: "Desserts", icon: "🍰", slug: "desserts", level: 1, sortOrder: 7 },
];

// ── Menu Items ──
export const menuItems: MenuItem[] = [
  // Chinese
  {
    id: "1",
    name: "Veg Momos",
    description: "Steamed dumplings stuffed with fresh veggies & aromatic spices. Served with spicy red chutney 🔥",
    basePrice: 149,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop",
    categoryId: "chinese",
    isVeg: true,
    isPopular: true,
    gstPercent: 5,
    tags: [
      { id: "tag-bestseller", name: "Bestseller" },
      { id: "tag-spicy", name: "Spicy" },
    ],
    variantGroups: [
      {
        id: "vg-momo-style",
        name: "Style",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-steamed", name: "Steamed (6 pcs)", price: 149, sortOrder: 1 },
          { id: "vo-fried", name: "Fried (6 pcs)", price: 169, sortOrder: 2 },
          { id: "vo-tandoori", name: "Tandoori (6 pcs)", price: 189, sortOrder: 3 },
        ],
      },
      {
        id: "vg-momo-size",
        name: "Size",
        isRequired: false,
        maxSelection: 1,
        options: [
          { id: "vo-regular", name: "Regular", price: 149, sortOrder: 1 },
          { id: "vo-jumbo", name: "Jumbo (8 pcs)", price: 209, sortOrder: 2 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-momo-dip",
        name: "Dipping Sauce",
        isRequired: false,
        maxSelection: 2,
        options: [
          { id: "ao-chutney", name: "Extra Chutney", price: 20, isAvailable: true },
          { id: "ao-cheese-dip", name: "Cheese Dip", price: 40, isAvailable: true },
          { id: "ao-mayo", name: "Spicy Mayo", price: 30, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Paneer Momos",
    description: "Juicy paneer-filled momos with a hint of ginger & garlic. Absolutely divine! 😍",
    basePrice: 179,
    imageUrl: "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400&h=300&fit=crop",
    categoryId: "chinese",
    isVeg: true,
    tags: [{ id: "tag-chef-special", name: "Chef Special" }],
    variantGroups: [
      {
        id: "vg-pm-style",
        name: "Style",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-pm-steamed", name: "Steamed (6 pcs)", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-pm-fried", name: "Fried (6 pcs)", priceAdjustment: 20, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Chicken Momos",
    description: "Tender chicken mince wrapped in delicate dough. Our bestseller! 🐔",
    basePrice: 189,
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop",
    categoryId: "chinese",
    isVeg: false,
    isPopular: true,
    tags: [{ id: "tag-bestseller", name: "Bestseller" }],
    variantGroups: [
      {
        id: "vg-cm-style",
        name: "Style",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-cm-steamed", name: "Steamed (6 pcs)", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-cm-fried", name: "Fried (6 pcs)", priceAdjustment: 20, sortOrder: 2 },
          { id: "vo-cm-gravy", name: "Gravy (6 pcs)", priceAdjustment: 40, sortOrder: 3 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Hakka Noodles",
    description: "Wok-tossed noodles with crunchy veggies & Indo-Chinese sauces 🍜",
    basePrice: 169,
    imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop",
    categoryId: "chinese",
    isVeg: true,
    tags: [{ id: "tag-new", name: "New" }],
    addonGroups: [
      {
        id: "ag-noodle-extra",
        name: "Extra Toppings",
        isRequired: false,
        maxSelection: 3,
        options: [
          { id: "ao-extra-veg", name: "Extra Veggies", price: 30, isAvailable: true },
          { id: "ao-paneer-top", name: "Paneer Topping", price: 50, isAvailable: true },
          { id: "ao-egg", name: "Egg", price: 30, isAvailable: true },
        ],
      },
    ],
  },
  // Pizza
  {
    id: "5",
    name: "Cheese Burst Pizza",
    description: "Oozing with molten cheese in every bite! Our signature crust loaded with mozzarella 🧀🔥",
    basePrice: 299,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
    categoryId: "pizza",
    isVeg: true,
    isPopular: true,
    tags: [
      { id: "tag-bestseller", name: "Bestseller" },
      { id: "tag-chef-special", name: "Chef Special" },
    ],
    variantGroups: [
      {
        id: "vg-pizza-size",
        name: "Size",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-med", name: "Medium (8\")", price: 299, sortOrder: 1 },
          { id: "vo-large", name: "Large (12\")", price: 449, sortOrder: 2 },
          { id: "vo-xl", name: "Extra Large (16\")", price: 599, sortOrder: 3 },
        ],
      },
      {
        id: "vg-pizza-crust",
        name: "Crust",
        isRequired: false,
        maxSelection: 1,
        options: [
          { id: "vo-thin", name: "Thin Crust", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-thick", name: "Thick Crust", priceAdjustment: 30, sortOrder: 2 },
          { id: "vo-stuffed", name: "Stuffed Crust", priceAdjustment: 60, sortOrder: 3 },
        ],
      },
    ],
    addonGroups: [
      {
        id: "ag-pizza-toppings",
        name: "Extra Toppings",
        isRequired: false,
        maxSelection: 4,
        options: [
          { id: "ao-cheese", name: "Extra Cheese", price: 60, isAvailable: true },
          { id: "ao-jalapeno", name: "Jalapeños", price: 30, isAvailable: true },
          { id: "ao-olives", name: "Olives", price: 40, isAvailable: true },
          { id: "ao-mushroom", name: "Mushrooms", price: 40, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Margherita Pizza",
    description: "Classic Italian with fresh basil, tomato sauce & mozzarella on thin crust 🍅",
    basePrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop",
    categoryId: "pizza",
    isVeg: true,
    variantGroups: [
      {
        id: "vg-marg-size",
        name: "Size",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-marg-med", name: "Medium (8\")", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-marg-lg", name: "Large (12\")", priceAdjustment: 150, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    id: "7",
    name: "Chicken Tikka Pizza",
    description: "Smoky tandoori chicken tikka with onions, capsicum & creamy sauce 🍗",
    basePrice: 349,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    categoryId: "pizza",
    isVeg: false,
    isPopular: true,
    tags: [{ id: "tag-spicy", name: "Spicy" }],
    variantGroups: [
      {
        id: "vg-ctp-size",
        name: "Size",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-ctp-med", name: "Medium (8\")", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-ctp-lg", name: "Large (12\")", priceAdjustment: 150, sortOrder: 2 },
        ],
      },
    ],
  },
  // Indian
  {
    id: "8",
    name: "Paneer Butter Masala",
    description: "Creamy, rich & buttery tomato gravy with soft paneer cubes. A crowd favorite! 🧈",
    basePrice: 249,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
    categoryId: "indian",
    isVeg: true,
    isPopular: true,
    tags: [{ id: "tag-bestseller", name: "Bestseller" }],
  },
  {
    id: "9",
    name: "Dal Makhani",
    description: "Slow-cooked black lentils in a creamy buttery sauce. Pure comfort food ❤️",
    basePrice: 219,
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
    categoryId: "indian",
    isVeg: true,
    tags: [{ id: "tag-healthy", name: "Healthy" }],
  },
  {
    id: "10",
    name: "Butter Chicken",
    description: "Tender chicken in a smooth, creamy tomato-butter sauce. Legendary taste! 🍗✨",
    basePrice: 299,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
    categoryId: "indian",
    isVeg: false,
    isPopular: true,
    tags: [
      { id: "tag-bestseller", name: "Bestseller" },
      { id: "tag-chef-special", name: "Chef Special" },
    ],
  },
  // Breads
  {
    id: "11",
    name: "Butter Naan",
    description: "Soft, fluffy tandoor-baked naan brushed with melted butter 🫓",
    basePrice: 49,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    categoryId: "breads",
    isVeg: true,
  },
  {
    id: "12",
    name: "Garlic Naan",
    description: "Aromatic garlic-infused naan with fresh coriander. Irresistible! 🧄",
    basePrice: 69,
    imageUrl: "https://images.unsplash.com/photo-1600628421060-939639517883?w=400&h=300&fit=crop",
    categoryId: "breads",
    isVeg: true,
  },
  // Starters
  {
    id: "13",
    name: "Paneer Tikka",
    description: "Chargrilled paneer cubes marinated in tandoori spices. Smoky & delicious! 🔥",
    basePrice: 229,
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
    categoryId: "starters",
    isVeg: true,
    isPopular: true,
    tags: [{ id: "tag-chef-special", name: "Chef Special" }],
  },
  {
    id: "14",
    name: "Chicken Wings",
    description: "Crispy fried wings tossed in your choice of sauce. Finger-lickin' good! 🍗",
    basePrice: 259,
    imageUrl: "https://images.unsplash.com/photo-1608039829572-9b0116f413ba?w=400&h=300&fit=crop",
    categoryId: "starters",
    isVeg: false,
    tags: [{ id: "tag-spicy", name: "Spicy" }],
    variantGroups: [
      {
        id: "vg-wings-sauce",
        name: "Sauce",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-bbq", name: "BBQ Sauce", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-hot", name: "Hot & Spicy", priceAdjustment: 0, sortOrder: 2 },
          { id: "vo-honey", name: "Honey Mustard", priceAdjustment: 20, sortOrder: 3 },
        ],
      },
    ],
  },
  // Beverages
  {
    id: "15",
    name: "Mango Lassi",
    description: "Thick, creamy yogurt blended with sweet Alphonso mangoes 🥭",
    basePrice: 99,
    imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop",
    categoryId: "beverages",
    isVeg: true,
    tags: [{ id: "tag-healthy", name: "Healthy" }],
  },
  {
    id: "16",
    name: "Masala Chai",
    description: "Traditional spiced Indian tea brewed with ginger, cardamom & love ☕",
    basePrice: 49,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=300&fit=crop",
    categoryId: "beverages",
    isVeg: true,
  },
  {
    id: "17",
    name: "Cold Coffee",
    description: "Chilled, creamy coffee with a hint of chocolate. Perfect refresher! 🧊☕",
    basePrice: 129,
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    categoryId: "beverages",
    isVeg: true,
    tags: [{ id: "tag-new", name: "New" }],
  },
  // Desserts
  {
    id: "18",
    name: "Gulab Jamun",
    description: "Soft, melt-in-mouth dumplings soaked in rose-cardamom syrup 🌹",
    basePrice: 99,
    imageUrl: "https://images.unsplash.com/photo-1666190709498-2f24f6f7a6f0?w=400&h=300&fit=crop",
    categoryId: "desserts",
    isVeg: true,
    variantGroups: [
      {
        id: "vg-gj-qty",
        name: "Quantity",
        isRequired: true,
        maxSelection: 1,
        options: [
          { id: "vo-gj-2", name: "2 pcs", priceAdjustment: 0, sortOrder: 1 },
          { id: "vo-gj-4", name: "4 pcs", priceAdjustment: 80, sortOrder: 2 },
        ],
      },
    ],
  },
  {
    id: "19",
    name: "Brownie with Ice Cream",
    description: "Warm, fudgy chocolate brownie topped with vanilla ice cream & chocolate sauce 🍫🍨",
    basePrice: 179,
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
    categoryId: "desserts",
    isVeg: true,
    isPopular: true,
    tags: [{ id: "tag-bestseller", name: "Bestseller" }],
  },
];
