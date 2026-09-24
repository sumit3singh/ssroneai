import React, { useState, useEffect, useMemo, useRef } from "react";
import { Zap, X, Search, Check, Sparkles, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { POSMenuItem, POSCategory } from "../../../types";
import {
  getStoredHotbarSlotIds,
  setStoredHotbarSlotIds,
  TOTAL_HOTBAR_SLOTS
} from "../../../utils/posHotbarStorage";

interface POSHotbarSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: POSMenuItem[];
  categories?: POSCategory[];
  onSaveMenuItem?: (itemData: Partial<POSMenuItem>) => Promise<void>;
}

export const POSHotbarSetupModal: React.FC<POSHotbarSetupModalProps> = ({
  isOpen,
  onClose,
  menuItems = [],
  categories = [],
  onSaveMenuItem,
}) => {
  // Array of 12 slot items (dish IDs or null)
  const [slots, setSlots] = useState<(number | null)[]>(() => getStoredHotbarSlotIds());
  // Active search slot index (0..11) being searched, or null
  const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Re-sync slots when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredHotbarSlotIds();
      // If all slots are empty, try auto-populating from is_popular items
      const hasAny = stored.some((id) => id !== null);
      if (!hasAny && menuItems.length > 0) {
        const popular = menuItems.filter((i) => i.is_popular && !i.is_deleted);
        const autoSlots: (number | null)[] = Array(TOTAL_HOTBAR_SLOTS).fill(null);
        popular.slice(0, TOTAL_HOTBAR_SLOTS).forEach((item, idx) => {
          autoSlots[idx] = item.id;
        });
        setSlots(autoSlots);
      } else {
        setSlots(stored);
      }
      setActiveSearchSlot(null);
      setSlotSearchQuery("");
    }
  }, [isOpen, menuItems]);

  // Focus search input when activeSearchSlot changes
  useEffect(() => {
    if (activeSearchSlot !== null) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [activeSearchSlot]);

  // Map of dish by ID for 0ms fast lookup
  const itemMap = useMemo(() => {
    const map = new Map<number, POSMenuItem>();
    for (const item of menuItems) {
      if (item && item.id != null) {
        map.set(Number(item.id), item);
      }
    }
    return map;
  }, [menuItems]);

  // Search filtered items for the active slot combobox
  const filteredSearchDishes = useMemo(() => {
    if (activeSearchSlot === null) return [];
    const query = slotSearchQuery.trim().toLowerCase();
    
    // Set of currently selected IDs in other slots to avoid duplicates
    const usedIds = new Set(
      slots.filter((id, idx) => id !== null && idx !== activeSearchSlot) as number[]
    );

    return menuItems
      .filter((item) => {
        if (!item || item.is_deleted) return false;
        if (usedIds.has(item.id)) return false;
        if (!query) return true;
        const nameMatch = item.name.toLowerCase().includes(query);
        const codeMatch = (item.item_code || "").toLowerCase().includes(query);
        const descMatch = (item.description || "").toLowerCase().includes(query);
        return nameMatch || codeMatch || descMatch;
      })
      .slice(0, 15);
  }, [menuItems, activeSearchSlot, slotSearchQuery, slots]);

  if (!isOpen) return null;

  const handleAssignDish = (slotIdx: number, dish: POSMenuItem) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = dish.id;
      return next;
    });
    setActiveSearchSlot(null);
    setSlotSearchQuery("");
  };

  const handleClearSlot = (slotIdx: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    if (activeSearchSlot === slotIdx) {
      setActiveSearchSlot(null);
      setSlotSearchQuery("");
    }
  };

  const handleAutoFillPopular = () => {
    const popular = menuItems.filter((i) => i.is_popular && !i.is_deleted);
    const popularIds = new Set(popular.map((p) => p.id));
    const remaining = menuItems.filter((i) => !popularIds.has(i.id) && !i.is_deleted);
    const combined = [...popular, ...remaining].slice(0, TOTAL_HOTBAR_SLOTS);

    const autoSlots: (number | null)[] = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    combined.forEach((item, idx) => {
      autoSlots[idx] = item.id;
    });
    setSlots(autoSlots);
    toast.info("Slots populated with top selling dishes");
  };

  const handleClearAllSlots = () => {
    setSlots(Array(TOTAL_HOTBAR_SLOTS).fill(null));
    setActiveSearchSlot(null);
    setSlotSearchQuery("");
  };

  const handleSaveAndSync = async () => {
    setIsSaving(true);
    try {
      // 1. Save locally and dispatch event
      setStoredHotbarSlotIds(slots);

      // 2. Persist to database if onSaveMenuItem is provided
      if (onSaveMenuItem) {
        const assignedIds = new Set(slots.filter((id): id is number => id !== null));
        
        // Update assigned items with is_popular = true and their sort order
        for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
          const dishId = slots[i];
          if (dishId !== null) {
            const dish = itemMap.get(dishId);
            if (dish) {
              await onSaveMenuItem({
                ...dish,
                is_popular: true,
                sort_order: i + 1,
              }).catch((e) => console.warn(`Failed to sync dish ${dishId} to DB:`, e));
            }
          }
        }

        // Unset is_popular on items that were previously popular but now removed from hotbar
        const previouslyPopular = menuItems.filter(
          (m) => m.is_popular && !assignedIds.has(m.id)
        );
        for (const dish of previouslyPopular) {
          await onSaveMenuItem({
            ...dish,
            is_popular: false,
          }).catch((e) => console.warn(`Failed to unset is_popular for ${dish.id}:`, e));
        }
      }

      toast.success("Express Hotbar updated! Slots F1–F12 ready for 1-touch billing.", {
        icon: "⚡",
      });
      onClose();
    } catch (err: any) {
      console.error("Hotbar save failure:", err);
      toast.error("Failed to save hotbar assignments");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Zap size={20} className="fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Express Hotbar Configuration (F1 – F12)
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  12 Slots
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assign fast-moving items directly to F1–F12 keys for 1-touch order entry on the billing screen.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-5 py-2.5 bg-muted/20 border-b border-border flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Quick Actions:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAutoFillPopular}
              className="text-xs h-7 gap-1.5 cursor-pointer"
            >
              <Sparkles size={12} className="text-amber-500" /> Auto-Fill Top Dishes
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllSlots}
              className="text-xs h-7 text-muted-foreground hover:text-destructive gap-1 cursor-pointer"
            >
              <Trash2 size={12} /> Clear All
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <HelpCircle size={13} className="text-primary" />
            <span>Shortcut: Press <kbd className="px-1 rounded bg-muted border border-border font-mono font-bold text-[10px]">Shift+F1</kbd> to <kbd className="px-1 rounded bg-muted border border-border font-mono font-bold text-[10px]">Shift+F12</kbd> during billing</span>
          </div>
        </div>

        {/* Slots Grid Container */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {slots.map((assignedDishId, idx) => {
              const slotNumber = idx + 1;
              const keyBadge = `F${slotNumber}`;
              const shiftBadge = `⇧F${slotNumber}`;
              const assignedDish = assignedDishId ? itemMap.get(assignedDishId) : null;
              const isSearching = activeSearchSlot === idx;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition-all ${
                    assignedDish
                      ? "bg-card border-border/80 hover:border-primary/40 shadow-2xs"
                      : "bg-muted/30 border-dashed border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Slot Key Badge */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-12 h-11 rounded-md bg-primary/10 border border-primary/20 text-primary">
                      <span className="font-mono font-extrabold text-xs">{keyBadge}</span>
                      <span className="font-mono text-[9px] text-muted-foreground font-semibold">
                        {shiftBadge}
                      </span>
                    </div>

                    {/* Middle Section: Assigned Dish or Search Input */}
                    <div className="flex-1 min-w-0">
                      {isSearching ? (
                        <div className="relative">
                          <div className="flex items-center gap-1.5 bg-background border border-primary rounded-md px-2 py-1 shadow-xs">
                            <Search size={14} className="text-primary shrink-0" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={slotSearchQuery}
                              onChange={(e) => setSlotSearchQuery(e.target.value)}
                              placeholder="Search dish by name or code..."
                              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  setActiveSearchSlot(null);
                                  setSlotSearchQuery("");
                                } else if (e.key === "Enter" && filteredSearchDishes.length > 0) {
                                  handleAssignDish(idx, filteredSearchDishes[0]);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSearchSlot(null);
                                setSlotSearchQuery("");
                              }}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none"
                            >
                              <X size={13} />
                            </button>
                          </div>

                          {/* Autocomplete Dropdown Popover */}
                          <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-popover border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-border">
                            {filteredSearchDishes.length === 0 ? (
                              <div className="p-3 text-center text-xs text-muted-foreground">
                                No matching dishes found for "{slotSearchQuery}"
                              </div>
                            ) : (
                              filteredSearchDishes.map((dish) => (
                                <button
                                  key={dish.id}
                                  type="button"
                                  onClick={() => handleAssignDish(idx, dish)}
                                  className="w-full p-2 text-left hover:bg-muted/80 flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs border-none bg-transparent"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span
                                      className={`h-2.5 w-2.5 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
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
                                    <span className="font-mono text-[10px] font-bold text-primary px-1 rounded bg-primary/10 border border-primary/20 shrink-0">
                                      {dish.item_code || `P${dish.id}`}
                                    </span>
                                    <span className="font-medium text-foreground truncate">
                                      {dish.name}
                                    </span>
                                  </div>
                                  <span className="font-mono font-bold text-xs text-foreground shrink-0">
                                    ₹{dish.selling_price || dish.base_price || 0}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      ) : assignedDish ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`h-3 w-3 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
                                assignedDish.is_veg
                                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                  : "border-rose-600 bg-rose-50 dark:bg-rose-950/40"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  assignedDish.is_veg ? "bg-emerald-600" : "bg-rose-600"
                                }`}
                              />
                            </span>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-foreground truncate">
                                  {assignedDish.name}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10 border border-primary/20">
                                  {assignedDish.item_code || `P${assignedDish.id}`}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                ₹{assignedDish.selling_price || assignedDish.base_price || 0}
                                {assignedDish.kds_station ? ` • ${assignedDish.kds_station}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSearchSlot(idx);
                                setSlotSearchQuery("");
                              }}
                              className="px-2 py-0.5 text-[11px] font-medium rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors border border-border bg-background"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearSlot(idx)}
                              title="Clear slot"
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors border-none bg-transparent"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSearchSlot(idx);
                            setSlotSearchQuery("");
                          }}
                          className="w-full py-2 px-3 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-background border border-dashed border-border hover:border-primary/40 text-left flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Search size={13} className="text-muted-foreground" />
                            <span>Click to search and assign dish...</span>
                          </span>
                          <span className="text-[10px] font-mono text-primary font-bold">+ Assign</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            {slots.filter((id) => id !== null).length} of {TOTAL_HOTBAR_SLOTS} slots configured
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAndSync}
              disabled={isSaving}
              className="text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              <Check size={14} /> {isSaving ? "Saving..." : "Save & Sync Hotbar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
