import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface PastOrder {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "delivered" | "cancelled" | "preparing";
  tableNumber?: string;
  deliveryAddress?: string;
  rating?: number;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  otpSent: boolean;
  orderMode: "dine-in" | "delivery";
  deliveryAddress: string;
  pastOrders: PastOrder[];
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  loyaltyPoints: number;
  totalOrders: number;
  login: (user: User) => void;
  logout: () => void;
  setOtpSent: (v: boolean) => void;
  setOrderMode: (mode: "dine-in" | "delivery") => void;
  setDeliveryAddress: (addr: string) => void;
  addPastOrder: (order: PastOrder) => void;
  rateOrder: (orderId: string, rating: number) => void;
  updateName: (name: string) => void;
  setLoyalty: (tier: "bronze" | "silver" | "gold" | "platinum", points: number) => void;
  addLoyaltyPoints: (points: number) => void;
  redeemLoyaltyPoints: (points: number) => void;
}

const mockPastOrders: PastOrder[] = [
  {
    id: "ORD-A1B2C3",
    date: "2026-02-08",
    items: [
      { name: "Cheese Burst Pizza (Large)", quantity: 1, price: 449 },
      { name: "Cold Coffee", quantity: 2, price: 258 },
    ],
    total: 742,
    status: "delivered",
    tableNumber: "3",
    rating: 5,
  },
  {
    id: "ORD-D4E5F6",
    date: "2026-02-05",
    items: [
      { name: "Paneer Butter Masala", quantity: 1, price: 249 },
      { name: "Butter Naan", quantity: 3, price: 147 },
      { name: "Mango Lassi", quantity: 1, price: 99 },
    ],
    total: 520,
    status: "delivered",
    deliveryAddress: "123 MG Road, Delhi",
  },
  {
    id: "ORD-G7H8I9",
    date: "2026-02-01",
    items: [
      { name: "Veg Momos (Fried)", quantity: 2, price: 338 },
      { name: "Masala Chai", quantity: 2, price: 98 },
    ],
    total: 458,
    status: "delivered",
    tableNumber: "7",
    rating: 4,
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      otpSent: false,
      orderMode: "dine-in",
      deliveryAddress: "",
      pastOrders: mockPastOrders,
      loyaltyTier: "bronze",
      loyaltyPoints: 0,
      totalOrders: 0,

      login: (user) => set({ user, isLoggedIn: true }),
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
          otpSent: false,
          loyaltyTier: "bronze",
          loyaltyPoints: 0,
          totalOrders: 0,
        }),
      setOtpSent: (v) => set({ otpSent: v }),
      setOrderMode: (mode) => set({ orderMode: mode }),
      setDeliveryAddress: (addr) => set({ deliveryAddress: addr }),
      addPastOrder: (order) =>
        set((s) => ({
          pastOrders: [order, ...s.pastOrders],
          totalOrders: s.totalOrders + 1,
        })),
      rateOrder: (orderId, rating) =>
        set((s) => ({
          pastOrders: s.pastOrders.map((o) =>
            o.id === orderId ? { ...o, rating } : o
          ),
        })),
      updateName: (name) =>
        set((s) => ({
          user: s.user ? { ...s.user, name } : null,
        })),
      setLoyalty: (tier, points) => set({ loyaltyTier: tier, loyaltyPoints: points }),
      addLoyaltyPoints: (points) =>
        set((s) => {
          const newPoints = s.loyaltyPoints + points;
          const newTier =
            newPoints >= 1000 ? "platinum" : newPoints >= 500 ? "gold" : newPoints >= 200 ? "silver" : "bronze";
          return { loyaltyPoints: newPoints, loyaltyTier: newTier };
        }),
      redeemLoyaltyPoints: (points) =>
        set((s) => ({
          loyaltyPoints: Math.max(0, s.loyaltyPoints - points),
        })),
    }),
    {
      name: "baithak-auth",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        pastOrders: state.pastOrders,
        loyaltyTier: state.loyaltyTier,
        loyaltyPoints: state.loyaltyPoints,
        totalOrders: state.totalOrders,
        orderMode: state.orderMode,
        deliveryAddress: state.deliveryAddress,
      }),
    }
  )
);
