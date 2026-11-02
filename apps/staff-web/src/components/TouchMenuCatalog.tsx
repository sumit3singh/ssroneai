import React from "react";
import {
  Search,
  Utensils,
  Plus,
  Flame,
  Sparkles,
  SlidersHorizontal,
  X,
  Coffee,
  Pizza,
  Sandwich,
  Wine,
  Soup,
  IceCream,
  CircleDot
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, MenuItem } from "@/stores/useStaffPOSStore";

interface TouchMenuCatalogProps {
  products: MenuItem[];
  categories: any[];
  onSelectItem: (item: MenuItem) => void;
}

// Icon mapper for common restaurant categories
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("burger") || n.includes("sandwich")) return <Sandwich size={15} />;
  if (n.includes("pizza")) return <Pizza size={15} />;
  if (n.includes("beverage") || n.includes("chai") || n.includes("tea") || n.includes("coffee")) return <Coffee size={15} />;
  if (n.includes("soup") || n.includes("starter") || n.includes("appetizer")) return <Soup size={15} />;
  if (n.includes("dessert") || n.includes("sweet") || n.includes("ice cream")) return <IceCream size={15} />;
  if (n.includes("bar") || n.includes("drink")) return <Wine size={15} />;
  if (n.includes("special") || n.includes("combo")) return <Sparkles size={15} />;
  return <Utensils size={15} />;
};

export const TouchMenuCatalog: React.FC<TouchMenuCatalogProps> = ({
  products,
  categories,
  onSelectItem,
}) => {
  const store = useStaffPOS();

  // Filtered menu items
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (store.vegOnly && !p.isVeg) return false;
      if (store.selectedCategory !== "all") {
        const catMatch =
          String(p.categoryId) === String(store.selectedCategory) ||
          String(p.category).toLowerCase() === String(store.selectedCategory).toLowerCase();
        if (!catMatch) return false;
      }
      if (store.searchQuery.trim()) {
        const q = store.searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, store.selectedCategory, store.searchQuery, store.vegOnly]);

  // Count items per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const key = p.category || "Other";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="space-y-3">
      {/* Search & Fast Veg/Non-Veg Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
            placeholder="Search dishes (e.g. Paneer, Biryani, Dosa, Chai)..."
            className="w-full h-12 pl-11 pr-10 rounded-2xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
          />
          {store.searchQuery && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                store.setSearchQuery("");
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Veg Only Toggle Chip */}
        <button
          type="button"
          onClick={() => store.setVegOnly(!store.vegOnly)}
          className={`min-h-[48px] px-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shrink-0 ${
            store.vegOnly
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500"
              : "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="w-4 h-4 rounded-md border-2 border-emerald-500 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${store.vegOnly ? "bg-emerald-400 animate-pulse" : "bg-emerald-600"}`} />
          </div>
          <span className="hidden sm:inline">Veg Only</span>
        </button>
      </div>

      {/* KFC / Toast Style Horizontal Category Touch Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => store.setSelectedCategory("all")}
          className={`min-h-[46px] px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer flex items-center gap-2 active:scale-95 ${
            store.selectedCategory === "all"
              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30 ring-1 ring-sky-400"
              : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Utensils size={15} />
          <span>All Menu</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            store.selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
          }`}>
            {products.length}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected =
            String(store.selectedCategory) === String(cat.id) ||
            String(store.selectedCategory).toLowerCase() === String(cat.name).toLowerCase();
          const count = categoryCounts[cat.name] || 0;

          return (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => store.setSelectedCategory(cat.name)}
              className={`min-h-[46px] px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer flex items-center gap-2 active:scale-95 ${
                isSelected
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30 ring-1 ring-sky-400"
                  : "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {getCategoryIcon(cat.name)}
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Food Items Touch Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/60 border border-dashed border-white/10 rounded-3xl p-8 space-y-2">
          <Utensils size={36} className="mx-auto text-slate-600" />
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
            No dishes match filter
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing the search query or toggle Veg filter off to see more dishes.
          </p>
          <button
            type="button"
            onClick={() => {
              store.setSearchQuery("");
              store.setVegOnly(false);
              store.setSelectedCategory("all");
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
          {filteredProducts.map((prod) => {
            const hasVariants = prod.variantGroups && prod.variantGroups.length > 0;
            const hasAddons = prod.addonGroups && prod.addonGroups.length > 0;
            const hasCustomization = hasVariants || hasAddons;

            // In-cart count for this product
            const inCartQuantity = store.cart
              .filter((x) => x.id === prod.id)
              .reduce((sum, x) => sum + x.quantity, 0);

            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => onSelectItem(prod)}
                className={`group p-3 sm:p-3.5 rounded-3xl border text-left flex flex-col justify-between min-h-[142px] transition cursor-pointer active:scale-[0.98] relative overflow-hidden ${
                  inCartQuantity > 0
                    ? "bg-slate-900/95 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50"
                    : "bg-slate-900/80 border-white/10 hover:border-sky-500/50 hover:bg-slate-900"
                }`}
              >
                {/* Active in-cart quantity indicator */}
                {inCartQuantity > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-sky-500 text-white font-mono font-black text-xs flex items-center justify-center shadow-md">
                    {inCartQuantity}
                  </div>
                )}

                {/* Top Info */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {/* Indian Veg / Non-Veg Standard Symbol */}
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        prod.isVeg
                          ? "border-emerald-500 bg-emerald-950/40"
                          : "border-rose-500 bg-rose-950/40"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          prod.isVeg ? "bg-emerald-400" : "bg-rose-500"
                        }`}
                      />
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 line-clamp-1">
                      {prod.category}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors leading-snug line-clamp-2 pr-6">
                    {prod.name}
                  </h3>

                  {prod.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-medium">
                      {prod.description}
                    </p>
                  )}
                </div>

                {/* Bottom Price & Touch Add Stepper */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                  <div>
                    <span className="font-mono text-sm sm:text-base font-black text-sky-400">
                      ₹{prod.selling_price || prod.basePrice}
                    </span>
                    {hasVariants && (
                      <span className="block text-[9px] font-mono text-slate-400 uppercase">
                        {prod.variantGroups?.[0]?.options?.length || 2} Options
                      </span>
                    )}
                  </div>

                  <span
                    className={`min-h-[34px] px-3.5 rounded-xl text-xs font-black flex items-center gap-1 transition ${
                      hasCustomization
                        ? "bg-slate-800 text-sky-300 border border-sky-500/30 group-hover:bg-sky-600 group-hover:text-white"
                        : "bg-sky-600 text-white shadow-md shadow-sky-600/30 group-hover:bg-sky-500"
                    }`}
                  >
                    <Plus size={13} strokeWidth={3} />
                    <span>{hasCustomization ? "Custom" : "Add"}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
