import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, VariantOption, AddonOption } from "@/data/mockMenu";
import { getVariantDisplayPrice } from "@/data/mockMenu";

export interface CartItemVariant {
  groupId: string;
  groupName: string;
  option: VariantOption;
}

export interface CartItemAddon {
  groupId: string;
  groupName: string;
  option: AddonOption;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedVariants: CartItemVariant[];
  selectedAddons: CartItemAddon[];
  quantity: number;
  notes?: string;
}

interface CartStore {
  tenantSlug: string;
  branchCode: string;
  items: CartItem[];
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  specialInstructions: string;
  setContext: (tenantSlug: string, branchCode: string) => void;
  addItem: (menuItem: MenuItem, variants?: CartItemVariant[], addons?: CartItemAddon[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  setTableNumber: (num: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setSpecialInstructions: (text: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  pastOrders?: any[];
  addPastOrder?: (order: any) => void;
}

function calcItemPrice(item: CartItem): number {
  if (!item || !item.menuItem) return 0;
  const variants = item.selectedVariants || [];
  const addons = item.selectedAddons || [];
  const basePrice =
    typeof item.menuItem.basePrice === "number"
      ? item.menuItem.basePrice
      : typeof (item.menuItem as any).price === "number"
      ? (item.menuItem as any).price
      : 0;

  const baseCost =
    variants.length > 0 && variants[0]?.option
      ? getVariantDisplayPrice(basePrice, variants[0].option)
      : basePrice;

  const addonsPrice = addons.reduce((s, a) => s + (a?.option?.price ?? 0), 0);
  return (baseCost + addonsPrice) * (item.quantity || 1);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      tenantSlug: "",
      branchCode: "",
      items: [],
      tableNumber: "",
      customerName: "",
      customerPhone: "",
      specialInstructions: "",

      setContext: (tenantSlug, branchCode) => {
        const state = get();
        // If context has actually changed to another tenant/branch and has items, reset to prevent cross-tenant contamination
        if (state.tenantSlug && (state.tenantSlug !== tenantSlug || state.branchCode !== branchCode)) {
          set({
            tenantSlug,
            branchCode,
            items: [],
            specialInstructions: "",
          });
        } else {
          set({ tenantSlug, branchCode });
        }
      },

      addItem: (menuItem, variants = [], addons = []) => {
        const cartItemId = `${menuItem.id}-${variants.map((v) => v.option.id).join(",")}-${addons.map((a) => a.option.id).join(",")}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === cartItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: cartItemId,
                menuItem,
                selectedVariants: variants,
                selectedAddons: addons,
                quantity: 1,
                notes: "",
              },
            ],
          };
        });
      },

      removeItem: (cartItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== cartItemId) })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== cartItemId)
              : state.items.map((i) =>
                  i.id === cartItemId ? { ...i, quantity } : i
                ),
        })),

      updateNotes: (cartItemId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === cartItemId ? { ...i, notes } : i
          ),
        })),

      clearCart: () => set({ items: [], specialInstructions: "" }),
      setTableNumber: (num) => set({ tableNumber: num }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setSpecialInstructions: (text) => set({ specialInstructions: text }),

      getTotal: () => (get().items || []).reduce((total, item) => total + calcItemPrice(item), 0),
      getItemCount: () => (get().items || []).reduce((sum, item) => sum + (item?.quantity || 0), 0),
      pastOrders: [],
      addPastOrder: (order) =>
        set((state) => ({
          pastOrders: [order, ...(state.pastOrders || [])].slice(0, 50),
        })),
    }),
    {
      name: "ssrone-cart-storage",
      partialize: (state) => ({
        tenantSlug: state.tenantSlug,
        branchCode: state.branchCode,
        items: state.items,
        tableNumber: state.tableNumber,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        specialInstructions: state.specialInstructions,
        pastOrders: state.pastOrders,
      }),
    }
  )
);
