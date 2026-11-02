import { useState, useEffect } from "react";
import { sound } from "@/utils/audioFeedback";

import { getDishImage } from "@/utils/dishImages";

export interface MenuItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  category: string;
  categoryId: string;
  basePrice: number;
  selling_price: number;
  isVeg: boolean;
  isBestseller?: boolean;
  image?: string;
  variantGroups?: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price?: number;
      sellingPrice?: number;
    }>;
  }>;
  addonGroups?: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price: number;
      variantPrices?: Record<string, number>;
    }>;
  }>;
}

export interface CartItem {
  cartKey: string;
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  isVeg: boolean;
  image?: string;
  selectedVariant?: { id?: string; name: string; price?: number };
  selectedAddons?: Array<{ id?: string; name: string; price: number; effectivePrice?: number }>;
  kitchenNote?: string;
  category?: string;
  discountAmount?: number;
}

export type TableStatus =
  | "available"
  | "occupied"
  | "preparing"
  | "served"
  | "bill_requested"
  | "reserved"
  | "cleaning";

export interface TableItem {
  id: string | number;
  number: string;
  capacity: number;
  status: TableStatus;
  section: string;
  floor?: string;
  guests?: number;
  running_total?: number;
  active_order_id?: string;
  elapsed_mins?: number;
  waiter_name?: string;
}

export type OrderType = "dine_in" | "takeaway" | "delivery" | "online" | "quick_order";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

type Listener = () => void;

class StaffStoreInstance {
  private listeners: Set<Listener> = new Set();

  // Navigation - Staff 3D Command Hub is the landing screen
  public activeTab: "dashboard" | "floor" | "pos" | "ledger" | "indent" | "kots" = "dashboard";
  public floorViewMode: "floor_plan" | "table_list" = "floor_plan";

  // Table & Order Type
  public selectedTable: string = "T1";
  public guestCount: number = 4;
  public orderType: OrderType = "dine_in";
  public selectedFloor: string = "All Sections";
  public customer: CustomerInfo = { name: "", phone: "" };

  // Cart
  public cart: CartItem[] = [];
  public orderRemark: string = "";
  public discountPercent: number = 0;

  // Catalog Filter & Search
  public selectedCategory: string = "all";
  public searchQuery: string = "";
  public filterMode: "all" | "favourites" | "veg" | "non_veg" | "bestseller" | "new" | "offers" = "all";
  public vegOnly: boolean = false;
  public bestsellersOnly: boolean = false;

  // Preferences
  public isSoundEnabled: boolean = true;
  public isKioskFullscreen: boolean = false;

  // Modals
  public receiptModalData: any | null = null;
  public isCheckoutOpen: boolean = false;
  public isTableTransferOpen: boolean = false;

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public setActiveTab(tab: "dashboard" | "floor" | "pos" | "ledger" | "indent" | "kots") {
    this.activeTab = tab;
    sound.tap();
    this.notify();
  }

  public toggleKioskFullscreen() {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        this.isKioskFullscreen = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        this.isKioskFullscreen = false;
      }
    } catch (_) {}
    this.notify();
  }

  public setFloorViewMode(mode: "floor_plan" | "table_list") {
    this.floorViewMode = mode;
    sound.tap();
    this.notify();
  }

  public setSelectedTable(tbl: string) {
    this.selectedTable = tbl;
    sound.tap();
    this.notify();
  }

  public setGuestCount(count: number) {
    this.guestCount = Math.max(1, Math.min(40, count));
    sound.step();
    this.notify();
  }

  public setOrderType(type: OrderType) {
    this.orderType = type;
    sound.tap();
    this.notify();
  }

  public setSelectedFloor(floor: string) {
    this.selectedFloor = floor;
    sound.tap();
    this.notify();
  }

  public setCustomer(customer: CustomerInfo) {
    this.customer = customer;
    this.notify();
  }

  public setSelectedCategory(cat: string) {
    this.selectedCategory = cat;
    sound.tap();
    this.notify();
  }

  public setSearchQuery(q: string) {
    this.searchQuery = q;
    this.notify();
  }

  public setFilterMode(mode: "all" | "favourites" | "veg" | "non_veg" | "bestseller" | "new" | "offers") {
    this.filterMode = mode;
    sound.tap();
    this.notify();
  }

  public setVegOnly(v: boolean) {
    this.vegOnly = v;
    sound.tap();
    this.notify();
  }

  public setBestsellersOnly(b: boolean) {
    this.bestsellersOnly = b;
    sound.tap();
    this.notify();
  }

  public setOrderRemark(r: string) {
    this.orderRemark = r;
    this.notify();
  }

  public setDiscountPercent(p: number) {
    this.discountPercent = Math.max(0, Math.min(50, p));
    sound.tap();
    this.notify();
  }

  public setReceiptModalData(data: any | null) {
    this.receiptModalData = data;
    this.notify();
  }

  public setIsCheckoutOpen(open: boolean) {
    this.isCheckoutOpen = open;
    sound.tap();
    this.notify();
  }

  public setIsTableTransferOpen(open: boolean) {
    this.isTableTransferOpen = open;
    sound.tap();
    this.notify();
  }

  public toggleSound() {
    this.isSoundEnabled = !this.isSoundEnabled;
    sound.enabled = this.isSoundEnabled;
    sound.tap();
    this.notify();
  }

  public addToCart(item: MenuItem, variant?: any, addons: any[] = [], note?: string) {
    const variantName = variant?.name || "";
    const addonNames = addons.map((a) => a.name).sort().join(", ");
    const cleanNote = (note || "").trim();
    const cartKey = `${item.id}_${variantName}_${addonNames}_${cleanNote}`;

    const variantPrice = variant ? Number(variant.sellingPrice ?? variant.price ?? item.selling_price) : item.selling_price;
    const addonsPrice = addons.reduce((sum, a) => sum + Number(a.effectivePrice ?? a.price ?? 0), 0);
    const unitPrice = variantPrice + addonsPrice;

    const existingIdx = this.cart.findIndex((x) => x.cartKey === cartKey);
    if (existingIdx >= 0) {
      this.cart[existingIdx].quantity += 1;
      sound.step();
    } else {
      this.cart.push({
        cartKey,
        id: item.id,
        name: item.name,
        unitPrice,
        quantity: 1,
        isVeg: item.isVeg,
        image: item.image || getDishImage(item.name, item.category),
        selectedVariant: variant ? { id: variant.id, name: variant.name, price: variantPrice } : undefined,
        selectedAddons: addons.map((a) => ({ id: a.id, name: a.name, price: Number(a.price || 0), effectivePrice: Number(a.effectivePrice || a.price || 0) })),
        kitchenNote: cleanNote,
        category: item.category,
      });
      sound.itemAdd();
    }
    this.notify();
  }

  public updateQuantity(cartKey: string, delta: number) {
    const idx = this.cart.findIndex((x) => x.cartKey === cartKey);
    if (idx >= 0) {
      const next = this.cart[idx].quantity + delta;
      if (next <= 0) {
        this.cart.splice(idx, 1);
        sound.tap();
      } else {
        this.cart[idx].quantity = next;
        sound.step();
      }
      this.notify();
    }
  }

  public removeFromCart(cartKey: string) {
    this.cart = this.cart.filter((x) => x.cartKey !== cartKey);
    sound.tap();
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    this.orderRemark = "";
    this.discountPercent = 0;
    sound.tap();
    this.notify();
  }
}

export const staffStore = new StaffStoreInstance();

export function useStaffPOS() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = staffStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return staffStore;
}
