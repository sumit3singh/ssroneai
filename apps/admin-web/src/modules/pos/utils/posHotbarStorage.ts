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
 * Resolves the 12 hotbar slots into actual POSMenuItem objects.
 * If slots are explicitly configured, returns those dishes in exact slot order.
 * If slots are unconfigured, gracefully falls back to popular / bestseller items.
 */
export function resolveHotbarItems(menuItems: POSMenuItem[], slotIds: (number | null)[]): POSMenuItem[] {
  if (!menuItems || menuItems.length === 0) return [];

  const itemMap = new Map<number, POSMenuItem>();
  for (const item of menuItems) {
    if (item && item.id != null) {
      itemMap.set(Number(item.id), item);
    }
  }

  // Check if at least one slot is configured
  const hasConfiguredSlots = slotIds.some((id) => id !== null && itemMap.has(id));

  if (hasConfiguredSlots) {
    const assignedItems: POSMenuItem[] = [];
    for (let i = 0; i < TOTAL_HOTBAR_SLOTS; i++) {
      const id = slotIds[i];
      if (id !== null && itemMap.has(id)) {
        assignedItems.push(itemMap.get(id)!);
      }
    }
    if (assignedItems.length > 0) {
      return assignedItems;
    }
  }

  // Fallback to top popular / bestseller items
  const popular = menuItems.filter(
    (i) => (i.is_popular || (i as any).is_bestseller) && !i.is_deleted && i.is_available !== false
  );
  if (popular.length >= TOTAL_HOTBAR_SLOTS) {
    return popular.slice(0, TOTAL_HOTBAR_SLOTS);
  }
  const popularIds = new Set(popular.map((p) => String(p.id)));
  const remaining = menuItems.filter(
    (i) => !popularIds.has(String(i.id)) && !i.is_deleted && i.is_available !== false
  );
  return [...popular, ...remaining].slice(0, TOTAL_HOTBAR_SLOTS);
}

/**
 * Reactive hook for live hotbar items, instantly re-evaluating on local change or event dispatch.
 */
export function useExpressHotbar(menuItems: POSMenuItem[]): {
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
    return resolveHotbarItems(menuItems, slotIds);
  }, [menuItems, slotIds]);

  return { expressItems, slotIds };
}
