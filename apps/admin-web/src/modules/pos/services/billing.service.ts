import { POSCartItem } from "../types/billing";

export const billingService = {
  calculateSubtotal: (items: POSCartItem[]): number => {
    return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  },

  calculateGST: (subtotal: number, taxRate: number = 0.05): number => {
    return Math.round(subtotal * taxRate);
  },

  calculateNetTotal: (subtotal: number, taxAmount: number, discountAmount: number): number => {
    return Math.max(0, subtotal + taxAmount - discountAmount);
  }
};
