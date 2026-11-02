import React from "react";
import {
  LayoutGrid,
  Soup,
  UtensilsCrossed,
  Pizza,
  Coffee,
  IceCream,
  Gift,
  Flame,
  ChefHat,
  Salad,
  Sandwich,
  Cookie
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS } from "@/stores/useStaffPOSStore";

interface PosCategorySidebarProps {
  categories: Array<{ id: string | number; name: string; count?: number }>;
  categoryCounts: Record<string, number>;
}

// Icon mapper matching the exact categories in reference screenshot
function getCategoryIcon(catName: string) {
  const name = catName.toLowerCase();
  if (name.includes("soup")) return <Soup size={18} />;
  if (name.includes("starter") || name.includes("snack") || name.includes("momo")) return <UtensilsCrossed size={18} />;
  if (name.includes("main") || name.includes("sabji") || name.includes("paneer")) return <ChefHat size={18} />;
  if (name.includes("rice") || name.includes("biryani")) return <Flame size={18} />;
  if (name.includes("bread") || name.includes("roti") || name.includes("naan")) return <UtensilsCrossed size={18} />;
  if (name.includes("chinese") || name.includes("noodle")) return <UtensilsCrossed size={18} />;
  if (name.includes("south") || name.includes("dosa")) return <UtensilsCrossed size={18} />;
  if (name.includes("fast") || name.includes("burger") || name.includes("pizza") || name.includes("french")) return <Pizza size={18} />;
  if (name.includes("beverage") || name.includes("drink") || name.includes("coffee") || name.includes("tea")) return <Coffee size={18} />;
  if (name.includes("dessert") || name.includes("sweet") || name.includes("ice")) return <IceCream size={18} />;
  if (name.includes("combo") || name.includes("thali") || name.includes("meal")) return <Gift size={18} />;
  return <LayoutGrid size={18} />;
}

// Standard categories list matching reference screenshot
const STANDARD_CATEGORIES = [
  "Starters",
  "Soups",
  "Main Course",
  "Biryani & Rice",
  "Indian Breads",
  "Chinese",
  "South Indian",
  "Fast Food",
  "Beverages",
  "Desserts",
  "Combo Meals",
];

export const PosCategorySidebar: React.FC<PosCategorySidebarProps> = ({
  categories = [],
  categoryCounts = {},
}) => {
  const store = useStaffPOS();

  // Categories list to render
  const categoryNames = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => c.name);
    }
    return STANDARD_CATEGORIES;
  }, [categories]);

  return (
    <aside className="w-full lg:w-[155px] xl:w-[175px] bg-[#edf0f5] border-l border-slate-200 flex flex-col h-full min-h-0 select-none p-2 space-y-1.5 shrink-0">
      {/* 1. TOP 'ALL ITEMS' AMBER CARD (Matching Reference Screenshot) */}
      <button
        type="button"
        onClick={() => {
          sound.tap();
          store.setSelectedCategory("all");
        }}
        className={`w-full min-h-[46px] rounded-xl px-2.5 py-2 font-black text-xs flex items-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-xs ${
          store.selectedCategory === "all"
            ? "bg-[#f59e0b] text-slate-950 ring-2 ring-[#f59e0b]/40 font-black"
            : "bg-white text-slate-800 hover:bg-slate-100 border border-slate-200"
        }`}
      >
        <div className="w-6 h-6 rounded-md bg-black/10 flex items-center justify-center shrink-0">
          <LayoutGrid size={15} />
        </div>
        <span className="truncate uppercase tracking-wider text-[11px] font-black">All Items</span>
      </button>

      {/* 2. VERTICAL CATEGORY CARDS LIST (Matching Reference Screenshot) */}
      <div className="flex-1 space-y-1.5 overflow-y-auto min-h-0 pr-0.5 no-scrollbar">
        {categoryNames.map((catName) => {
          const isSelected =
            String(store.selectedCategory).toLowerCase() === catName.toLowerCase();

          return (
            <button
              key={catName}
              type="button"
              onClick={() => {
                sound.tap();
                store.setSelectedCategory(catName);
              }}
              className={`w-full min-h-[44px] rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-2 text-left border active:scale-[0.98] ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm font-black"
                  : "bg-white text-slate-800 hover:bg-slate-100 border-slate-200 shadow-2xs"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {getCategoryIcon(catName)}
              </div>
              <span className="truncate text-[11px] font-extrabold flex-1 leading-tight">
                {catName}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
