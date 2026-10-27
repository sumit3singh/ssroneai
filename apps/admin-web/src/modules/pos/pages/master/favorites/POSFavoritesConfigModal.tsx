import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
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
  Info
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { POSMenuItem } from "../../../types";
import {
  TOTAL_HOTBAR_SLOTS,
  getStoredFavoriteSlotIds,
  setStoredFavoriteSlotIds,
  resolveHotbarItems
} from "../../../utils/posHotbarStorage";

interface POSFavoritesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: POSMenuItem[];
  orders?: any[];
  branchId?: number | string;
}

export const POSFavoritesConfigModal: React.FC<POSFavoritesConfigModalProps> = ({
  isOpen,
  onClose,
  menuItems = [],
  orders = [],
  branchId
}) => {
  // 12 slots state: array of 12 (number | null)
  const [slots, setSlots] = useState<(number | null)[]>(() =>
    getStoredFavoriteSlotIds(branchId)
  );
  // Active dropdown open state for row (null if none open)
  const [activeDropdownRow, setActiveDropdownRow] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSlots(getStoredFavoriteSlotIds(branchId));
      setActiveDropdownRow(null);
      setSearchQueries({});
    }
  }, [isOpen, branchId]);

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
              <Star size={20} className="fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Top 12 Favorites Quick Bar Setup
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {assignedCount} / {TOTAL_HOTBAR_SLOTS} Configured
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign your 12 favorite speed-billing items to shortcut keys (Shift+F1 to Shift+F12).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-muted/10 border-b border-border gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info size={14} className="text-primary shrink-0" />
            <span>
              Favorites appear on top of POS Billing. Click any slot to choose a menu dish.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillBestsellers}
              className="text-xs font-semibold gap-1.5 h-8 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
              title="Automatically populate empty slots with highest-selling dishes"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Fill with Top Bestsellers</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs font-semibold gap-1.5 h-8 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              title="Reset all 12 slots"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </Button>
          </div>
        </div>

        {/* 2-Column Table Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-muted/40 rounded-lg text-[11px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
            <div className="col-span-3 sm:col-span-2">Column 1: Slot / Key</div>
            <div className="col-span-9 sm:col-span-10">Column 2: Selected Favorite Menu Item</div>
          </div>

          {/* 12 Slot Rows */}
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
                className={`grid grid-cols-12 gap-3 items-center p-2.5 rounded-lg border transition-all ${
                  currentDish
                    ? "bg-card border-border hover:border-amber-500/40 shadow-2xs"
                    : "bg-muted/15 border-dashed border-border/80 hover:bg-muted/30"
                }`}
              >
                {/* Column 1: Counting 1 to 12 & Shortcut Key */}
                <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-md font-mono font-black text-xs flex items-center justify-center shrink-0 border ${
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
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {shortcutKey}
                    </span>
                  </div>
                </div>

                {/* Column 2: Menu Item Selector */}
                <div className="col-span-9 sm:col-span-10 relative" ref={isDropdownOpen ? dropdownRef : undefined}>
                  {currentDish ? (
                    // Assigned Dish Card
                    <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 gap-2">
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">
                              {currentDish.name}
                            </span>
                            {currentDish.item_code && (
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                                {currentDish.item_code}
                              </span>
                            )}
                            {currentDish.category?.name && (
                              <span className="text-[10px] text-muted-foreground">
                                • {currentDish.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Price & Change/Clear Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                          ₹{currentDish.price || 0}
                        </span>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDropdownRow(slotIndex)}
                          className="h-7 px-2 text-[11px] font-semibold gap-1 cursor-pointer"
                        >
                          <ArrowUpDown size={11} />
                          <span>Change</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleClearSlot(slotIndex)}
                          className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from this slot"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Empty Slot - Click to Select Button
                    <button
                      type="button"
                      onClick={() => setActiveDropdownRow(slotIndex)}
                      className="w-full flex items-center justify-between p-2 rounded-md bg-background hover:bg-muted/40 border border-dashed border-border hover:border-primary/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                        <Utensils size={13} className="text-muted-foreground/60 group-hover:text-primary" />
                        <span className="text-xs font-medium">
                          Click to select a menu dish for Slot #{slotNumber}...
                        </span>
                      </div>
                      <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground" />
                    </button>
                  )}

                  {/* Searchable Dish Selection Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-100">
                      {/* Search & Category Filter Header */}
                      <div className="p-2 border-b border-border bg-muted/30 space-y-1.5">
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
                            placeholder={`Search dish for Slot #${slotNumber} by name or code...`}
                            icon={<Search size={13} />}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Category filter pills */}
                        {uniqueCategories.length > 0 && (
                          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setSelectedCategoryFilter("all")}
                              className={`px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors ${
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
                                className={`px-2 py-0.5 rounded cursor-pointer shrink-0 transition-colors ${
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
                          <div className="p-4 text-center text-xs text-muted-foreground">
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
                                className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors cursor-pointer ${
                                  isChosenInThisSlot
                                    ? "bg-amber-500/15 text-foreground font-bold"
                                    : "hover:bg-muted/80 text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
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
                                    <span className="text-xs font-medium truncate">
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

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {assignedCount === 0 ? (
              <span className="text-amber-600">No favorite dishes assigned yet.</span>
            ) : (
              <span className="text-foreground font-semibold">
                {assignedCount} of {TOTAL_HOTBAR_SLOTS} slots configured.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
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
      </div>
    </div>
  );
};
