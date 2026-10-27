import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Star,
  Search,
  Sparkles,
  Trash2,
  Check,
  CheckCircle2,
  ChevronDown,
  ArrowUpDown,
  Utensils,
  Zap,
  Info,
  ArrowLeft,
  RotateCcw,
  X
} from "lucide-react";
import { Button, Input, PageHeader, PageContainer } from "@ssrone/ui";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { POSMenuItem } from "../../../types";
import {
  TOTAL_HOTBAR_SLOTS,
  getStoredFavoriteSlotIds,
  setStoredFavoriteSlotIds,
  resolveHotbarItems
} from "../../../utils/posHotbarStorage";

interface POSFavoritesConfigPageProps {
  menuItems: POSMenuItem[];
  orders?: any[];
  branchId?: number | string;
}

export const POSFavoritesConfigPage: React.FC<POSFavoritesConfigPageProps> = ({
  menuItems = [],
  orders = [],
  branchId
}) => {
  const navigate = useNavigate();

  // 12 slots state: array of 12 (number | null)
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    getStoredFavoriteSlotIds(branchId)
  );
  // Active dropdown open state for row (null if none open)
  const [activeDropdownRow, setActiveDropdownRow] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state whenever branch changes
  useEffect(() => {
    setSlots(getStoredFavoriteSlotIds(branchId));
    setActiveDropdownRow(null);
    setSearchQueries({});
  }, [branchId]);

  // Click outside listener for active dish picker dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownRow(null);
      }
    };
    if (activeDropdownRow !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownRow]);

  // Map of all available, non-deleted menu items
  const validMenuItems = useMemo(() => {
    return menuItems.filter(
      (item) => item && !item.is_deleted && item.is_available !== false
    );
  }, [menuItems]);

  const itemMap = useMemo(() => {
    const map = new Map<number, POSMenuItem>();
    for (const item of validMenuItems) {
      map.set(Number(item.id), item);
    }
    return map;
  }, [validMenuItems]);

  // Unique categories for filtering inside dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of validMenuItems) {
      const catName = item.category?.name || (item as any).category_name;
      if (catName) cats.add(catName);
    }
    return Array.from(cats);
  }, [validMenuItems]);

  // Set of already chosen item IDs to indicate in dropdown
  const chosenIdsSet = useMemo(() => {
    const s = new Set<number>();
    for (const id of slots) {
      if (id !== null) s.add(id);
    }
    return s;
  }, [slots]);

  const assignedCount = slots.filter((id) => id !== null).length;

  const handleSelectDish = (slotIndex: number, dishId: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = dishId;
      return next;
    });
    setActiveDropdownRow(null);
    setSearchQueries((prev) => ({ ...prev, [slotIndex]: "" }));
  };

  const handleClearSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all 12 favorite slots?")) {
      setSlots(Array(TOTAL_HOTBAR_SLOTS).fill(null));
      toast.info("Cleared all 12 slots");
    }
  };

  const handleAutoFillBestsellers = () => {
    const bestsellers = resolveHotbarItems(validMenuItems, undefined, orders);
    const newSlots: (number | null)[] = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    bestsellers.slice(0, TOTAL_HOTBAR_SLOTS).forEach((item, idx) => {
      newSlots[idx] = Number(item.id);
    });
    setSlots(newSlots);
    toast.success("Auto-filled 12 slots with top bestsellers!");
  };

  const handleSave = () => {
    setStoredFavoriteSlotIds(slots, branchId);
    toast.success("⭐ Top 12 Favorites saved successfully!", {
      description: "Favorite bar on POS Billing screen updated instantly.",
    });
  };

  return (
    <PageContainer>
      {/* Enterprise Page Header */}
      <PageHeader
        title="Top 12 Favorites Quick Bar Setup"
        description="Configure your top 12 speed-billing favorite dishes mapped to keyboard shortcuts (Shift+F1 to Shift+F12)"
        icon={<Star size={18} className="text-amber-500 fill-amber-500" />}
        badge={`${assignedCount} / ${TOTAL_HOTBAR_SLOTS} Configured`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/pos/master/menu-items" as any })}
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} /> Back to Dishes
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillBestsellers}
              className="text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer shadow-xs"
              title="Automatically populate empty slots with highest-selling dishes"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Fill with Top Bestsellers</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs font-semibold gap-1.5 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              title="Reset all 12 slots"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Save Favorites</span>
            </Button>
          </div>
        }
      />

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/10 text-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Star size={13} className="fill-amber-500 text-amber-500" /> Configured Slots
          </div>
          <div className="text-xl font-bold font-mono mt-0.5 text-amber-800 dark:text-amber-200">
            {assignedCount} / {TOTAL_HOTBAR_SLOTS}
          </div>
        </div>

        <div className="p-3 rounded-md border border-border bg-card text-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap size={13} className="text-primary" /> Active Billing Shortcuts
          </div>
          <div className="text-xs font-mono font-semibold mt-1.5 text-muted-foreground">
            Shift+F1 to Shift+F12 (1-Touch Instant Add)
          </div>
        </div>

        <div className="p-3 rounded-md border border-border bg-card text-foreground">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Utensils size={13} className="text-primary" /> Total Catalog Dishes
          </div>
          <div className="text-xl font-bold font-mono mt-0.5">
            {validMenuItems.length} Available
          </div>
        </div>
      </div>

      {/* 2-Column Configuration Main Container */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3 sm:col-span-2">Column 1: Counting (1 to 12) & Key</div>
          <div className="col-span-9 sm:col-span-10">Column 2: Selected Favorite Menu Item</div>
        </div>

        {/* 12 Slot Rows */}
        <div className="divide-y divide-border/60 p-2 sm:p-3 space-y-2">
          {Array.from({ length: TOTAL_HOTBAR_SLOTS }).map((_, slotIndex) => {
            const slotNumber = slotIndex + 1;
            const shortcutKey = `Shift+F${slotNumber}`;
            const currentDishId = slots[slotIndex];
            const currentDish = currentDishId !== null ? itemMap.get(currentDishId) : null;
            const isDropdownOpen = activeDropdownRow === slotIndex;
            const query = searchQueries[slotIndex] || "";

            // Filter dishes for this row's search
            const filteredDishes = validMenuItems.filter((dish) => {
              if (selectedCategoryFilter !== "all") {
                const cat = dish.category?.name || (dish as any).category_name;
                if (cat !== selectedCategoryFilter) return false;
              }
              if (!query.trim()) return true;
              const q = query.toLowerCase();
              const nameMatch = dish.name.toLowerCase().includes(q);
              const codeMatch = dish.item_code?.toLowerCase().includes(q);
              const catMatch = (dish.category?.name || "").toLowerCase().includes(q);
              return nameMatch || codeMatch || catMatch;
            });

            return (
              <div
                key={slotIndex}
                className={`grid grid-cols-12 gap-3 items-center p-3 rounded-lg border transition-all ${
                  currentDish
                    ? "bg-card border-border hover:border-amber-500/40 shadow-2xs"
                    : "bg-muted/10 border-dashed border-border/80 hover:bg-muted/20"
                }`}
              >
                {/* Column 1: Counting 1 to 12 & Shortcut Key */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg font-mono font-black text-sm flex items-center justify-center shrink-0 border ${
                      currentDish
                        ? "bg-amber-500 text-amber-950 border-amber-600 shadow-2xs"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {slotNumber}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">
                      Slot #{slotNumber}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-primary">
                      {shortcutKey}
                    </span>
                  </div>
                </div>

                {/* Column 2: Menu Item Selector */}
                <div
                  className="col-span-9 sm:col-span-10 relative"
                  ref={isDropdownOpen ? dropdownRef : undefined}
                >
                  {currentDish ? (
                    // Assigned Dish Card
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Veg / Non-Veg Indicator */}
                        <span
                          className={`h-3 w-3 rounded-xs border flex items-center justify-center shrink-0 ${
                            currentDish.is_veg
                              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                              : "border-rose-600 bg-rose-50 dark:bg-rose-950/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              currentDish.is_veg ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                        </span>

                        {/* Dish Name & Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">
                              {currentDish.name}
                            </span>
                            {currentDish.item_code && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                {currentDish.item_code}
                              </span>
                            )}
                            {currentDish.category?.name && (
                              <span className="text-[11px] text-muted-foreground">
                                • {currentDish.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Price & Change/Clear Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded border border-amber-500/30">
                          ₹{currentDish.price || 0}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDropdownRow(slotIndex)}
                          className="h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer"
                        >
                          <ArrowUpDown size={12} />
                          <span>Change</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleClearSlot(slotIndex)}
                          className="p-1.5 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from this slot"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Empty Slot - Click to Select Button
                    <button
                      type="button"
                      onClick={() => setActiveDropdownRow(slotIndex)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-background hover:bg-muted/40 border border-dashed border-border hover:border-primary/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                        <Utensils size={14} className="text-muted-foreground/60 group-hover:text-primary" />
                        <span className="text-xs font-medium">
                          Click to select a menu dish for Slot #{slotNumber}...
                        </span>
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
                    </button>
                  )}

                  {/* Searchable Dish Selection Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-popover border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-100">
                      {/* Search & Category Filter Header */}
                      <div className="p-2.5 border-b border-border bg-muted/30 space-y-2">
                        <div className="relative">
                          <Input
                            autoFocus
                            value={query}
                            onChange={(e) =>
                              setSearchQueries((prev) => ({
                                ...prev,
                                [slotIndex]: e.target.value,
                              }))
                            }
                            placeholder={`Search dish for Slot #${slotNumber} by name, category, or code...`}
                            icon={<Search size={14} />}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Category filter pills */}
                        {uniqueCategories.length > 0 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setSelectedCategoryFilter("all")}
                              className={`px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors text-[11px] ${
                                selectedCategoryFilter === "all"
                                  ? "bg-primary text-primary-foreground font-bold"
                                  : "bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              All ({validMenuItems.length})
                            </button>
                            {uniqueCategories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategoryFilter(cat)}
                                className={`px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors text-[11px] ${
                                  selectedCategoryFilter === cat
                                    ? "bg-primary text-primary-foreground font-bold"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Filtered Dishes List */}
                      <div className="overflow-y-auto divide-y divide-border/40 p-1 flex-1">
                        {filteredDishes.length === 0 ? (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            No matching menu items found.
                          </div>
                        ) : (
                          filteredDishes.map((dish) => {
                            const isChosenInThisSlot = currentDishId === Number(dish.id);
                            const isChosenInAnotherSlot =
                              !isChosenInThisSlot && chosenIdsSet.has(Number(dish.id));
                            const otherSlotIdx = isChosenInAnotherSlot
                              ? slots.findIndex((id) => id === Number(dish.id))
                              : -1;

                            return (
                              <button
                                key={dish.id}
                                type="button"
                                onClick={() => handleSelectDish(slotIndex, Number(dish.id))}
                                className={`w-full flex items-center justify-between p-2.5 rounded-md text-left transition-colors cursor-pointer ${
                                  isChosenInThisSlot
                                    ? "bg-amber-500/15 text-foreground font-bold"
                                    : "hover:bg-muted/80 text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Veg / Non-Veg Indicator */}
                                  <span
                                    className={`h-2.5 w-2.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                      dish.is_veg
                                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                        : "border-rose-600 bg-rose-50 dark:bg-rose-950/40"
                                    }`}
                                  >
                                    <span
                                      className={`h-1 w-1 rounded-full ${
                                        dish.is_veg ? "bg-emerald-600" : "bg-rose-600"
                                      }`}
                                    />
                                  </span>

                                  <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold truncate">
                                      {dish.name}
                                    </span>
                                    {dish.item_code && (
                                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                        {dish.item_code}
                                      </span>
                                    )}
                                    {dish.category?.name && (
                                      <span className="text-[10px] text-muted-foreground">
                                        ({dish.category.name})
                                      </span>
                                    )}
                                    {isChosenInAnotherSlot && (
                                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                        In Slot #{otherSlotIdx + 1}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-xs font-bold text-foreground">
                                    ₹{dish.price || 0}
                                  </span>
                                  {isChosenInThisSlot && (
                                    <Check size={14} className="text-amber-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {assignedCount === 0 ? (
              <span className="text-amber-600 font-medium">
                No favorite dishes assigned yet.
              </span>
            ) : (
              <span className="text-foreground font-semibold">
                {assignedCount} of {TOTAL_HOTBAR_SLOTS} slots configured.
              </span>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>Save Top 12 Favorites</span>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
