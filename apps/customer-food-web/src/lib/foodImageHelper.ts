/**
 * High-definition, appetizing imagery mapper for restaurant categories and dishes.
 * Ensures consistent, professional, restaurant-grade visuals matching the Petpooja / Glen's Bakehouse UI.
 */

export function getCategoryPhoto(catName?: string, existingUrl?: string): string {
  if (
    existingUrl &&
    existingUrl.trim().length > 10 &&
    !existingUrl.includes("placeholder") &&
    !existingUrl.includes("1625246333195") // exclude invalid crop photo
  ) {
    return existingUrl;
  }

  const n = (catName || "").toLowerCase();

  if (n.includes("momo") || n.includes("dimsum") || n.includes("dumpling")) {
    return "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("roll") || n.includes("wrap")) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("noodle") || n.includes("rice") || n.includes("chinese") || n.includes("manchurian")) {
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("breakfast") || n.includes("morning") || n.includes("egg")) {
    return "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("soup") || n.includes("salad")) {
    return "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("french") || n.includes("sandwich") || n.includes("burger") || n.includes("hot dog") || n.includes("hotdog")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("fry") || n.includes("fries") || n.includes("pasta")) {
    return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("drink") || n.includes("beverage") || n.includes("shake") || n.includes("coffee") || n.includes("chai") || n.includes("tea")) {
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("tandoor") || n.includes("tikka") || n.includes("kebab")) {
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("paneer")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("sabji") || n.includes("curry") || n.includes("dal") || n.includes("gravy")) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("bread") || n.includes("naan") || n.includes("roti")) {
    return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("paratha") || n.includes("south") || n.includes("dosa") || n.includes("idli")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("thali") || n.includes("combo") || n.includes("rrp")) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("dessert") || n.includes("cake") || n.includes("pastry") || n.includes("sweet") || n.includes("bakery")) {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80";
  }
  if (n.includes("new") || n.includes("intro") || n.includes("special")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80";
  }

  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
}

export function getDishPhoto(dishName?: string, categoryName?: string, existingUrl?: string): string {
  if (
    existingUrl &&
    existingUrl.trim().length > 10 &&
    !existingUrl.includes("placeholder") &&
    !existingUrl.includes("1625246333195")
  ) {
    return existingUrl;
  }

  const n = (dishName || "").toLowerCase();

  if (n.includes("momo") || n.includes("dim sum") || n.includes("dumpling")) {
    return "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("weekend breakfast") || (n.includes("breakfast") && n.includes("platter"))) {
    return "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("fried chicken burger") || n.includes("crispy chicken burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("chicken burger") || n.includes("grilled chicken burger")) {
    return "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("veg burger") || n.includes("cheese burger") || n.includes("burger")) {
    return "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("sandwich") || n.includes("club sandwich")) {
    return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("margherita") || n.includes("cheese pizza")) {
    return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("pasta") || n.includes("penne") || n.includes("alfredo") || n.includes("arrabbiata")) {
    return "https://images.unsplash.com/photo-1621996346565-e3d5d62817cc?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("fries") || n.includes("french fries") || n.includes("peri peri")) {
    return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("roll") || n.includes("kathi") || n.includes("frankie") || n.includes("wrap")) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("noodle") || n.includes("chowmein") || n.includes("hakka")) {
    return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("fried rice") || n.includes("biryani") || n.includes("pulao") || n.includes("rice")) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("cold coffee") || n.includes("shake") || n.includes("smoothie") || n.includes("frappe")) {
    return "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("tea") || n.includes("chai") || n.includes("hot coffee") || n.includes("cappuccino")) {
    return "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("mocktail") || n.includes("mojito") || n.includes("cooler") || n.includes("drink")) {
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("paneer butter") || n.includes("shahi paneer") || n.includes("kadai paneer") || n.includes("paneer")) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("dal makhani") || n.includes("dal tadka") || n.includes("curry") || n.includes("sabji")) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("naan") || n.includes("roti") || n.includes("kulcha") || n.includes("bread")) {
    return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("thali") || n.includes("combo")) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("dosa") || n.includes("idli") || n.includes("vada") || n.includes("uttapam")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("tandoori chicken") || n.includes("tikka") || n.includes("kabab") || n.includes("kebab")) {
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80";
  }
  if (n.includes("pastry") || n.includes("cake") || n.includes("brownie") || n.includes("dessert")) {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80";
  }

  return getCategoryPhoto(categoryName);
}
