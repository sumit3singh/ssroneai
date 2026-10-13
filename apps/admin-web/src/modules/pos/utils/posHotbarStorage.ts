import { useState, useEffect, useMemo } from "react";
import { POSMenuItem } from "../types";

export const HOTBAR_STORAGE_KEY = "ssr_pos_hotbar_slots";
export const HOTBAR_EVENT_NAME = "ssr_pos_hotbar_updated";
export const TOTAL_HOTBAR_SLOTS = 12;

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

