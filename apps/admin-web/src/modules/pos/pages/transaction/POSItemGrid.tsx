import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Leaf, Maximize2, Minimize2, Sparkles, Coffee, Utensils, Pizza, Sandwich, Flame, LayoutGrid } from "lucide-react";
import { Input } from "@ssrone/ui";
import { POSCategory, POSMenuItem, POSTable, POSWaiter } from "../../types";

interface POSItemGridProps {
  categories: POSCategory[];
  menuItems: POSMenuItem[];
  tables?: POSTable[];
  waiters?: POSWaiter[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddToCart: (item: POSMenuItem) => void;
  isFullScreenPOS?: boolean;
  onToggleFullScreen?: () => void;
}

export const POSItemGrid: React.FC<POSItemGridProps> = ({
  categories,
  menuItems,
  selectedCategoryId,
  setSelectedCategoryId,
  searchTerm,
  setSearchTerm,
  onAddToCart,
  isFullScreenPOS,
  onToggleFullScreen
}) => {
  const navigate = useNavigate();
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.item_code && item.item_code.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (selectedCategoryId && String(item.category_id) !== String(selectedCategoryId)) return false;
    if (vegOnlyFilter && !item.is_veg) return false;
    return true;
  });

  return (
    <div className="space-y-2 flex flex-col h-full max-h-full overflow-hidden">
      {/* Search Input, Category Tabs & Controls Header Bar */}
      <div className="bg-card border border-border rounded-lg p-2.5 shadow-2xs space-y-2 shrink-0">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items by name or code (e.g. Chai, Pizza, Burger)..."
              icon={<Search size={14} className="text-muted-foreground" />}
              className="h-8 text-xs font-medium bg-background border-border focus:ring-1 focus:ring-primary rounded-md"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Table Floor Tracker Button */}
            <button
              type="button"
              onClick={() => navigate({ to: "/pos/transaction/tables" })}
              className="h-8 px-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <LayoutGrid size={13} />
              <span>Table Floor</span>
            </button>

            {/* Veg Only Toggle */}
            <button
              type="button"
              onClick={() => setVegOnlyFilter((prev) => !prev)}
              className={`h-8 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                vegOnlyFilter
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Leaf size={12} className={vegOnlyFilter ? "text-white" : "text-emerald-600"} />
              <span>Veg Only</span>
            </button>

            {/* Dish Count Label */}
            <span className="h-8 px-2 text-muted-foreground font-mono text-xs font-semibold flex items-center whitespace-nowrap">
              {filteredMenuItems.length} items
            </span>

            {/* Full-Screen Workspace Toggle Button */}
            {onToggleFullScreen && (
              <button
                type="button"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    if (document.exitFullscreen) {
                      document.exitFullscreen().catch(() => {});
                    }
                  }
                  onToggleFullScreen();
                }}
                title={isFullScreenPOS ? "Exit Fullscreen Kiosk Mode (F11)" : "Enter Fullscreen Kiosk Mode (F11)"}
                className="h-8 px-2.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
              >
                {isFullScreenPOS ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isFullScreenPOS ? "Exit Kiosk" : "Kiosk Fullscreen"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Selector Bar (Enterprise Minimal Tabs) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin border-t border-border/60 pt-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
              selectedCategoryId === null
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            ALL ITEMS
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                selectedCategoryId === c.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density 150+ Catalog Auto-Fit Product Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin auto-rows-max items-start">
        {filteredMenuItems.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-lg">
            <Utensils size={28} className="mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-muted-foreground">No dishes matching search filter.</p>
          </div>
        ) : (
          filteredMenuItems.map((item) => {
            const hasVariants = item.variant_groups && item.variant_groups.length > 0;
            const hasAddons = item.addon_groups && item.addon_groups.length > 0;
            const price = item.selling_price || item.base_price;

            return (
              <div
                key={item.id}
                onClick={() => onAddToCart(item)}
                className="group bg-card border border-border hover:border-primary/80 rounded-lg p-2.5 flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow-xs transition-all duration-150 relative min-h-[110px] shrink-0 active:scale-[0.99]"
              >
                {/* Header & Status Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
                      className={`h-3 w-3 border rounded-sm flex items-center justify-center p-0.5 ${
                        item.is_veg ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "border-rose-600 bg-rose-50 dark:bg-rose-950/40"
                      }`}
                    >
                      <span className={`h-1 w-1 rounded-full ${item.is_veg ? "bg-emerald-600" : "bg-rose-600"}`} />
                    </span>

                    {(hasVariants || hasAddons) && (
                      <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1 py-0.2 rounded-sm uppercase">
                        Custom
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    {item.short_description && (
                      <p className="text-[10px] text-muted-foreground font-normal truncate mt-0.5">{item.short_description}</p>
                    )}
                  </div>

                  {/* 1-CLICK INSTANT VARIANT SIZE CHIPS (ZERO MODAL POPUPS & NO SCROLLBAR) */}
                  {hasVariants && item.variant_groups?.[0]?.options && (
                    <div className="flex flex-wrap items-center gap-1 pt-1 max-w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
                      {item.variant_groups[0].options.map((opt: any, idx: number) => (
                        <button
                          key={opt.id || opt.name || idx}
                          type="button"
                          onClick={() => onAddToCart(item, opt)}
                          className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/25 transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95"
                          title={`Click to add ${opt.name} ₹${opt.sellingPrice || opt.price}`}
                        >
                          {opt.name.split(" ")[0]} ₹{opt.sellingPrice || opt.price}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Price & Add Hover Feedback */}
                <div className="pt-1 border-t border-border/60 flex items-center justify-between mt-1.5">
                  <span className="font-mono font-bold text-xs text-foreground">
                    ₹{price}
                  </span>
                  <span className="text-[10px] font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                    {hasVariants ? "CUSTOMIZE" : "ADD +"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
