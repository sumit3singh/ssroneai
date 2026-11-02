import React from "react";
import {
  Star,
  Tag,
  Sparkles,
  Percent,
  Check,
  Plus
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, MenuItem } from "@/stores/useStaffPOSStore";
import { getDishImage } from "@/utils/dishImages";

interface PosMenuCatalogProps {
  products: MenuItem[];
  categories?: Array<{ id: string | number; name: string }>;
  onSelectItem: (item: MenuItem, variant?: any) => void;
}

export const PosMenuCatalog: React.FC<PosMenuCatalogProps> = ({
  products,
  categories = [],
  onSelectItem,
}) => {
  const store = useStaffPOS();

  // Extract unique categories if not provided
  const availableCategories = React.useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const catSet = new Set<string>();
    products.forEach((p) => {
      if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet).map((name) => ({ id: name, name }));
  }, [categories, products]);

  // Filter products based on selectedCategory, filterMode, searchQuery
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // 1. Filter mode
      if (store.filterMode === "veg" && !p.isVeg) return false;
      if (store.filterMode === "non_veg" && p.isVeg) return false;
      if (store.filterMode === "bestseller" && !p.isBestseller) return false;
      if (store.filterMode === "favourites" && !p.isBestseller) return false;

      // 2. Category filter
      if (store.selectedCategory !== "all") {
        const catMatch =
          String(p.categoryId) === String(store.selectedCategory) ||
          String(p.category).toLowerCase() === String(store.selectedCategory).toLowerCase();
        if (!catMatch) return false;
      }

      // 3. Search query
      if (store.searchQuery.trim()) {
        const q = store.searchQuery.toLowerCase().trim();
        const codeMatch = p.code ? p.code.toLowerCase().includes(q) : false;
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = p.category ? p.category.toLowerCase().includes(q) : false;
        return codeMatch || nameMatch || catMatch;
      }

      return true;
    });
  }, [products, store.selectedCategory, store.filterMode, store.searchQuery]);

  return (
    <section className="flex-1 bg-slate-50/50 p-2 sm:p-2.5 flex flex-col space-y-2 overflow-y-auto min-h-0 select-none">
      {/* 1. HORIZONTAL CATEGORY SWIPE RAIL (Instant touch access on mobile, tablet & touchscreens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 pt-0.5">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setSelectedCategory("all");
          }}
          className={`min-h-[36px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 ${
            store.selectedCategory === "all"
              ? "bg-[#0B3B2C] text-white font-black shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>All Menu</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            store.selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }`}>
            {products.length}
          </span>
        </button>

        {availableCategories.map((cat) => {
          const isSelected =
            String(store.selectedCategory).toLowerCase() === String(cat.name).toLowerCase() ||
            String(store.selectedCategory) === String(cat.id);
          const count = products.filter(
            (p) =>
              String(p.category).toLowerCase() === String(cat.name).toLowerCase() ||
              String(p.categoryId) === String(cat.id)
          ).length;

          return (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => {
                sound.tap();
                store.setSelectedCategory(cat.name);
              }}
              className={`min-h-[36px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95 whitespace-nowrap ${
                isSelected
                  ? "bg-[#0B3B2C] text-white font-black shadow-xs ring-2 ring-[#0B3B2C]/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{cat.name}</span>
              {count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. SUB-FILTER ROW (Veg / Non-Veg / Bestseller / Favourites) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setFilterMode("all");
          }}
          className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
            store.filterMode === "all"
              ? "bg-slate-900 text-white shadow-xs font-black"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Items
        </button>

        {/* Veg */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setFilterMode(store.filterMode === "veg" ? "all" : "veg");
          }}
          className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            store.filterMode === "veg"
              ? "bg-emerald-600 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Pure Veg</span>
        </button>

        {/* Non-Veg */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setFilterMode(store.filterMode === "non_veg" ? "all" : "non_veg");
          }}
          className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            store.filterMode === "non_veg"
              ? "bg-rose-600 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
          <span>Non-Veg</span>
        </button>

        {/* Bestseller */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setFilterMode(store.filterMode === "bestseller" ? "all" : "bestseller");
          }}
          className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
            store.filterMode === "bestseller"
              ? "bg-amber-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles size={12} className={store.filterMode === "bestseller" ? "text-white" : "text-amber-500"} />
          <span>Bestseller</span>
        </button>

        {/* Favourites */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setFilterMode(store.filterMode === "favourites" ? "all" : "favourites");
          }}
          className={`min-h-[30px] px-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
            store.filterMode === "favourites"
              ? "bg-amber-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Star size={12} className={store.filterMode === "favourites" ? "text-white fill-white" : "text-amber-500 fill-amber-500"} />
          <span>Favourites</span>
        </button>
      </div>

      {/* 3. DENSE FOOD CARDS GRID (Touchscreen Optimized with Half / Full Portions) */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-0.5">
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <p className="font-bold text-sm text-slate-600">No dishes match filter</p>
            <p className="text-xs text-slate-400">Try selecting another category or clear search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-2.5">
            {filteredProducts.map((dish) => {
              const imageUrl = dish.image || getDishImage(dish.name, dish.category);
              const inCartItem = store.cart.find((c) => c.id === dish.id);
              const hasVariants = dish.variants && dish.variants.length > 0;

              return (
                <div
                  key={dish.id}
                  onClick={() => onSelectItem(dish)}
                  className={`relative bg-white rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between group shadow-2xs hover:shadow-md active:scale-[0.98] ${inCartItem
                      ? "border-emerald-500 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={dish.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Veg / Non-Veg Indicator Badge in Bottom-Right Corner */}
                    <div className="absolute right-1.5 bottom-1.5 bg-white/95 p-0.5 rounded shadow-xs border border-slate-200">
                      <div
                        className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${dish.isVeg ? "border-emerald-600" : "border-rose-600"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                        />
                      </div>
                    </div>

                    {/* In-Cart Quantity Badge */}
                    {inCartItem && (
                      <div className="absolute left-1.5 top-1.5 bg-emerald-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
                        {inCartItem.quantity} in cart
                      </div>
                    )}
                  </div>

                  {/* Title & Price / Portion Tap Footer */}
                  <div className="p-2 space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate leading-tight">
                      {dish.name}
                    </h4>

                    {/* Portions Tap (Half / Full) or Standard Price */}
                    {hasVariants ? (
                      <div className="flex items-center gap-1 pt-0.5">
                        {dish.variants!.map((v) => (
                          <button
                            key={v.id || v.name}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.tap();
                              onSelectItem(dish, v);
                            }}
                            className="flex-1 py-1 px-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-mono text-[9px] font-bold text-center cursor-pointer transition active:scale-95"
                            title={`Add ${dish.name} (${v.name})`}
                          >
                            {v.name} ₹{v.price}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-slate-900">
                          ₹{dish.selling_price || dish.basePrice || 120}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Standard
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
