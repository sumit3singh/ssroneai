import { create } from "zustand";
import { POSCartItem, POSMenuItem, POSVariantOption } from "../types";

interface CartState {
  cartItems: POSCartItem[];
  addItem: (item: POSMenuItem, variant?: POSVariantOption) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],

  addItem: (item, variant) =>
    set((state) => {
      const price = variant ? Number(variant.sellingPrice ?? variant.price) : (item.selling_price || item.base_price);
      const cartId = variant ? `cart-${Date.now()}-${variant.id}` : `cart-${Date.now()}-${item.id}`;

      const existing = state.cartItems.find(
        (c) => c.item_id === item.id && c.selected_variant?.id === variant?.id
      );

      if (existing) {
        return {
          cartItems: state.cartItems.map((c) =>
            c.cart_id === existing.cart_id ? { ...c, quantity: c.quantity + 1 } : c
          )
        };
      }

      return {
        cartItems: [
          ...state.cartItems,
          {
            cart_id: cartId,
            item_id: item.id,
            name: variant ? `${item.name} (${variant.name})` : item.name,
            unit_price: price,
            quantity: 1,
            selected_variant: variant,
            is_veg: item.is_veg
          }
        ]
      };
    }),

  updateQuantity: (cartId, delta) =>
    set((state) => ({
      cartItems: state.cartItems
        .map((c) => {
          if (c.cart_id !== cartId) return c;
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        })
        .filter(Boolean) as POSCartItem[]
    })),

  removeItem: (cartId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((c) => c.cart_id !== cartId)
    })),

  clearCart: () => set({ cartItems: [] })
}));
