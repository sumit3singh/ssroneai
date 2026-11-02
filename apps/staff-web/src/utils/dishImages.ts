/**
 * Curated high-resolution restaurant food photography assets
 * Perfectly matching commercial POS systems (NEXX / Toast / Square).
 */

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  starters: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80",
  soups: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80",
  main_course: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  breads: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
  chinese: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80",
  south_indian: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80",
  fast_food: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  beverages: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
  desserts: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
  combo: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=400&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  fries: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80",
  momos: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80",
  rolls: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80",
  thali: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80",
  chole: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80",
};

export function getDishImage(dishName: string, categoryName: string = ""): string {
  const name = dishName.toLowerCase();
  const cat = categoryName.toLowerCase();

  if (name.includes("dosa")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("idli") || name.includes("sambar")) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("tikka") || name.includes("paneer tikka")) {
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("mutton biryani") || name.includes("biryani")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("pasta") || name.includes("alfredo")) {
    return "https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("fries") || name.includes("french")) {
    return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("manchurian") || name.includes("chilli")) {
    return "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("butter chicken") || name.includes("paneer butter") || name.includes("curry")) {
    return "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("dal") || name.includes("makhani")) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("naan") || name.includes("roti") || name.includes("bread") || name.includes("paratha")) {
    return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("spring roll") || name.includes("roll")) {
    return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("salad") || name.includes("caesar")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("thali") || name.includes("combo")) {
    return "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("chole") || name.includes("bhature")) {
    return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("coffee") || name.includes("shake") || name.includes("tea") || name.includes("drink")) {
    return "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("momo")) {
    return "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80";
  }
  if (name.includes("noodle") || name.includes("chowmein") || name.includes("maggi")) {
    return "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80";
  }

  // Category fallback
  for (const [key, url] of Object.entries(CATEGORY_DEFAULT_IMAGES)) {
    if (cat.includes(key)) return url;
  }

  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
}
