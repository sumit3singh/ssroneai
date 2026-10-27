import { useState, useEffect, useMemo } from "react";
import { POSMenuItem } from "../types";

export const HOTBAR_STORAGE_KEY = "ssr_pos_hotbar_slots";
export const FAVORITES_STORAGE_KEY = "ssr_pos_favorites_slots";
export const BAR_MODE_STORAGE_KEY = "ssr_pos_bar_mode";

export const HOTBAR_EVENT_NAME = "ssr_pos_hotbar_updated";
export const FAVORITES_EVENT_NAME = "ssr_pos_favorites_updated";
export const BAR_MODE_EVENT_NAME = "ssr_pos_bar_mode_updated";

export const TOTAL_HOTBAR_SLOTS = 12;

export type POSBarMode = "favorites" | "hotbar" | "hidden";

function getBranchFavoritesKey(branchId?: number | string): string {
  const resolvedBranch = branchId !== undefined && branchId !== null && branchId !== ""
    ? branchId
    : (typeof window !== "undefined" ? localStorage.getItem("active_branch_id") : null);
  if (resolvedBranch !== undefined && resolvedBranch !== null && resolvedBranch !== "") {
    return `${FAVORITES_STORAGE_KEY}_b${resolvedBranch}`;
  }
  return FAVORITES_STORAGE_KEY;
}

/**
 * Retrieves the stored 12 hotbar slot item IDs from localStorage.
 * Returns an array of exactly 12 items: number (dish ID) or null.
 */
export function getStoredHotbarSlotIds(): (number | null)[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(HOTBAR_STORAGE_KEY) : null;
    if (!raw) return Array(TOTAL_HOTBAR_SLOTS).fill(null);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Array(TOTAL_HOTBAR_SLOTS).fill(null);
    const result: (number | null)[] = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
      result[i] = typeof parsed[i] === "number" ? parsed[i] : null;
    }
    return result;
  } catch {
    return Array(TOTAL_HOTBAR_SLOTS).fill(null);
  }
}

/**
 * Saves the 12 hotbar slot assignments to localStorage and dispatches a cross-tab & reactive event.
 */
export function setStoredHotbarSlotIds(slots: (number | null)[]): void {
  try {
    if (typeof window === "undefined") return;
    const sanitized = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
      sanitized[i] = typeof slots[i] === "number" ? slots[i] : null;
    }
    localStorage.setItem(HOTBAR_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(HOTBAR_EVENT_NAME, { detail: sanitized }));
  } catch (err) {
    console.error("Failed to persist hotbar slot assignments:", err);
  }
}

/**
 * Retrieves the stored 12 favorites slot item IDs from localStorage.
 * Scoped by branch if provided, falls back to global key.
 */
export function getStoredFavoriteSlotIds(branchId?: number | string): (number | null)[] {
  try {
    if (typeof window === "undefined") return Array(TOTAL_HOTBAR_SLOTS).fill(null);
    const branchKey = getBranchFavoritesKey(branchId);
    let raw = localStorage.getItem(branchKey);
    if (!raw && branchKey !== FAVORITES_STORAGE_KEY) {
      // Fallback to legacy/global key
      raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    }
    if (!raw) return Array(TOTAL_HOTBAR_SLOTS).fill(null);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Array(TOTAL_HOTBAR_SLOTS).fill(null);
    const result: (number | null)[] = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
      result[i] = typeof parsed[i] === "number" ? parsed[i] : null;
    }
    return result;
  } catch {
    return Array(TOTAL_HOTBAR_SLOTS).fill(null);
  }
}

/**
 * Saves the 12 favorites slot assignments to localStorage and dispatches a cross-tab reactive event.
 */
export function setStoredFavoriteSlotIds(slots: (number | null)[], branchId?: number | string): void {
  try {
    if (typeof window === "undefined") return;
    const sanitized = Array(TOTAL_HOTBAR_SLOTS).fill(null);
    for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
      sanitized[i] = typeof slots[i] === "number" ? slots[i] : null;
    }
    const branchKey = getBranchFavoritesKey(branchId);
    localStorage.setItem(branchKey, JSON.stringify(sanitized));
    // Also save to global key for single-branch / shared default
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(sanitized));

    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT_NAME, { detail: sanitized }));
  } catch (err) {
    console.error("Failed to persist favorites slot assignments:", err);
  }
}

/**
 * Retrieves the currently active bar mode ("favorites" | "hotbar" | "hidden").
 * Defaults to "favorites" as requested.
 */
export function getStoredBarMode(): POSBarMode {
  try {
    if (typeof window === "undefined") return "favorites";
    const saved = localStorage.getItem(BAR_MODE_STORAGE_KEY);
    if (saved === "hotbar" || saved === "hidden" || saved === "favorites") {
      return saved;
    }
    // Backward compatibility: check if user had previously collapsed the hotbar
    const oldCollapsed = localStorage.getItem("pos_hotbar_collapsed");
    if (oldCollapsed === "true") {
      return "hidden";
    }
    return "favorites";
  } catch {
    return "favorites";
  }
}

/**
 * Saves the active bar mode to localStorage and triggers cross-tab reactive event.
 */
export function setStoredBarMode(mode: POSBarMode): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(BAR_MODE_STORAGE_KEY, mode);
    localStorage.setItem("pos_hotbar_collapsed", String(mode === "hidden"));
    window.dispatchEvent(new CustomEvent(BAR_MODE_EVENT_NAME, { detail: mode }));
  } catch (err) {
    console.error("Failed to persist bar mode:", err);
  }
}

/**
 * Resolves the favorites slots into actual POSMenuItem objects in slot order.
 * Returns only the filled, available, non-deleted items (preserving slot order).
 */
export function resolveFavoriteItems(
  menuItems: POSMenuItem[],
  slotIds?: (number | null)[]
): POSMenuItem[] {
  if (!menuItems || menuItems.length === 0) return [];
  const currentSlots = slotIds && slotIds.length === TOTAL_HOTBAR_SLOTS
    ? slotIds
    : getStoredFavoriteSlotIds();

  const itemMap = new Map<number, POSMenuItem>();
  for (const item of menuItems) {
    if (item && !item.is_deleted && item.is_available !== false) {
      itemMap.set(Number(item.id), item);
    }
  }

  const result: POSMenuItem[] = [];
  for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
    const id = currentSlots[i];
    if (id !== null && id !== undefined && itemMap.has(id)) {
      result.push(itemMap.get(id)!);
    }
  }
  return result;
}

/**
 * Resolves the top 12 hotbar dishes into actual POSMenuItem objects.
 * Ranks automatically by most-sold order item counts and popular/bestseller status.
 */
export function resolveHotbarItems(
  menuItems: POSMenuItem[],
  slotIds?: (number | null)[],
  orders?: any[]
): POSMenuItem[] {
  if (!menuItems || menuItems.length === 0) return [];

  // Filter available, non-deleted items
  const validItems = menuItems.filter(
    (i) => i && !i.is_deleted && i.is_available !== false
  );
  if (validItems.length === 0) return [];

  // Tally sales from orders if orders array is provided
  const salesMap = new Map<number, number>();
  if (orders && Array.isArray(orders)) {
    for (const o of orders) {
      if (o && Array.isArray(o.items)) {
        for (const it of o.items) {
          const rawId = it.item_id || it.product_id || it.id;
          const numId = Number(rawId);
          if (!isNaN(numId) && numId > 0) {
            const qty = Number(it.quantity || 1);
            salesMap.set(numId, (salesMap.get(numId) || 0) + (isNaN(qty) ? 1 : qty));
          }
        }
      }
    }
  }

  // Sort dishes: highest sales count first, then is_popular / is_bestseller flag, then sort_order
  const ranked = [...validItems].sort((a, b) => {
    const salesA = salesMap.get(Number(a.id)) || 0;
    const salesB = salesMap.get(Number(b.id)) || 0;
    if (salesB !== salesA) return salesB - salesA;

    const popA = a.is_popular || (a as any).is_bestseller ? 1 : 0;
    const popB = b.is_popular || (b as any).is_bestseller ? 1 : 0;
    if (popB !== popA) return popB - popA;

    return (a.sort_order || 999) - (b.sort_order || 999);
  });

  return ranked.slice(0, TOTAL_HOTBAR_SLOTS);
}

/**
 * Reactive hook for live hotbar items, instantly re-evaluating on local change or event dispatch.
 */
export function useExpressHotbar(
  menuItems: POSMenuItem[],
  orders?: any[]
): {
  expressItems: POSMenuItem[];
  slotIds: (number | null)[];
} {
  const [slotIds, setSlotIds] = useState<(number | null)[]>(() => getStoredHotbarSlotIds());

  useEffect(() => {
    const handleUpdate = () => {
      setSlotIds(getStoredHotbarSlotIds());
    };
    window.addEventListener(HOTBAR_EVENT_NAME, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(HOTBAR_EVENT_NAME, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const expressItems = useMemo(() => {
    return resolveHotbarItems(menuItems, slotIds, orders);
  }, [menuItems, slotIds, orders]);

  return { expressItems, slotIds };
}

/**
 * Unified reactive hook for both Favorites Bar and Express Hotbar.
 */
export function usePOSQuickBar(
  menuItems: POSMenuItem[],
  orders?: any[],
  branchId?: number | string
): {
  barMode: POSBarMode;
  setBarMode: (mode: POSBarMode) => void;
  favoriteSlots: (number | null)[];
  favoriteItems: POSMenuItem[];
  hotbarItems: POSMenuItem[];
  activeItems: POSMenuItem[];
} {
  const [barMode, setBarModeState] = useState<POSBarMode>(() => getStoredBarMode());
  const [favoriteSlots, setFavoriteSlots] = useState<(number | null)[]>(() =>
    getStoredFavoriteSlotIds(branchId)
  );
  const [hotbarSlots, setHotbarSlots] = useState<(number | null)[]>(() => getStoredHotbarSlotIds());

  useEffect(() => {
    const handleFavUpdate = () => setFavoriteSlots(getStoredFavoriteSlotIds(branchId));
    const handleHotbarUpdate = () => setHotbarSlots(getStoredHotbarSlotIds());
    const handleModeUpdate = () => setBarModeState(getStoredBarMode());

    window.addEventListener(FAVORITES_EVENT_NAME, handleFavUpdate);
    window.addEventListener(HOTBAR_EVENT_NAME, handleHotbarUpdate);
    window.addEventListener(BAR_MODE_EVENT_NAME, handleModeUpdate);
    window.addEventListener("storage", () => {
      handleFavUpdate();
      handleHotbarUpdate();
      handleModeUpdate();
    });

    return () => {
      window.removeEventListener(FAVORITES_EVENT_NAME, handleFavUpdate);
      window.removeEventListener(HOTBAR_EVENT_NAME, handleHotbarUpdate);
      window.removeEventListener(BAR_MODE_EVENT_NAME, handleModeUpdate);
    };
  }, [branchId]);

  const setBarMode = (mode: POSBarMode) => {
    setBarModeState(mode);
    setStoredBarMode(mode);
  };

  const favoriteItems = useMemo(() => {
    return resolveFavoriteItems(menuItems, favoriteSlots);
  }, [menuItems, favoriteSlots]);

  const hotbarItems = useMemo(() => {
    return resolveHotbarItems(menuItems, hotbarSlots, orders);
  }, [menuItems, hotbarSlots, orders]);

  const activeItems = useMemo(() => {
    if (barMode === "hotbar") return hotbarItems;
    return favoriteItems;
  }, [barMode, favoriteItems, hotbarItems]);

  return {
    barMode,
    setBarMode,
    favoriteSlots,
    favoriteItems,
    hotbarItems,
    activeItems,
  };
}


