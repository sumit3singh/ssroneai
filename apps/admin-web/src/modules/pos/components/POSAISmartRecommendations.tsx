import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { POSMenuItem } from "../types";

interface POSAISmartRecommendationsProps {
  cartItems: any[];
  allMenuItems: POSMenuItem[];
  onAddToCart: (item: POSMenuItem) => void;
}

export const POSAISmartRecommendations: React.FC<POSAISmartRecommendationsProps> = ({
  cartItems,
  allMenuItems,
  onAddToCart,
}) => {
  // Compute smart pair suggestions based on cart items
  const recommendations = React.useMemo(() => {
    if (cartItems.length === 0 || allMenuItems.length === 0) return [];

    const cartItemNames = cartItems.map((ci) => (ci.name || "").toLowerCase());
    const cartIds = new Set(cartItems.map((ci) => String(ci.menu_item_id || ci.id)));

    const suggested: { item: POSMenuItem; reason: string }[] = [];

    // Pair Rules:
    // 1. If has Dosa / South Indian -> Recommend Cold Coffee / Filter Coffee / Sambar Vada
    if (cartItemNames.some((n) => n.includes("dosa") || n.includes("uttapam"))) {
      const coffee = allMenuItems.find((i) => (i.name.toLowerCase().includes("coffee") || i.name.toLowerCase().includes("chai")) && !cartIds.has(String(i.id)));
      if (coffee) suggested.push({ item: coffee, reason: "Popular Pair with Dosa" });
      const vada = allMenuItems.find((i) => i.name.toLowerCase().includes("vada") && !cartIds.has(String(i.id)));
      if (vada) suggested.push({ item: vada, reason: "Starter Pair" });
    }

    // 2. If has Sabji / Curry -> Recommend Butter Naan / Jeera Rice / Raita
    if (cartItemNames.some((n) => n.includes("paneer") || n.includes("chicken") || n.includes("curry") || n.includes("dal"))) {
      const naan = allMenuItems.find((i) => (i.name.toLowerCase().includes("naan") || i.name.toLowerCase().includes("roti")) && !cartIds.has(String(i.id)));
      if (naan) suggested.push({ item: naan, reason: "Essential Bread Pair" });
      const rice = allMenuItems.find((i) => (i.name.toLowerCase().includes("rice") || i.name.toLowerCase().includes("pulao")) && !cartIds.has(String(i.id)));
      if (rice) suggested.push({ item: rice, reason: "Main Course Pair" });
    }

    // 3. If has Burger / Pizza / Sandwich -> Recommend Fries / Garlic Bread / Cold Drink
    if (cartItemNames.some((n) => n.includes("burger") || n.includes("pizza") || n.includes("sandwich"))) {
      const fries = allMenuItems.find((i) => (i.name.toLowerCase().includes("fries") || i.name.toLowerCase().includes("garlic bread")) && !cartIds.has(String(i.id)));
      if (fries) suggested.push({ item: fries, reason: "Perfect Combo Side" });
      const drink = allMenuItems.find((i) => (i.name.toLowerCase().includes("shake") || i.name.toLowerCase().includes("mojito") || i.name.toLowerCase().includes("soda")) && !cartIds.has(String(i.id)));
      if (drink) suggested.push({ item: drink, reason: "Beverage Companion" });
    }

    // Generic fallback high margin bestseller
    if (suggested.length < 2) {
      const bestseller = allMenuItems.find((i) => i.is_popular && !cartIds.has(String(i.id)));
      if (bestseller) suggested.push({ item: bestseller, reason: "Chef Recommendation" });
    }

    return suggested.slice(0, 3);
  }, [cartItems, allMenuItems]);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 space-y-1.5 animate-in fade-in">
      <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
        <Sparkles size={12} className="text-amber-500 fill-amber-500 animate-spin" />
        <span>AI Smart Pair Suggestions</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {recommendations.map(({ item, reason }) => {
          const itemPrice = Number(item.selling_price ?? item.base_price ?? 0);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onAddToCart(item)}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-background hover:bg-amber-500/20 border border-amber-500/40 text-left transition-all cursor-pointer group shadow-2xs active:scale-95"
              title={`Click to add ${item.name} (${reason}) - ₹${itemPrice}`}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {item.name}
                </span>
                <span className="text-[8px] font-medium text-muted-foreground">{reason}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-amber-700 dark:text-amber-300 font-mono whitespace-nowrap">
                <span>₹{itemPrice}</span>
                <Plus size={11} className="text-amber-600 dark:text-amber-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
