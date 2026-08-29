# 📖 Lesson 4: Modern Frontend Architecture (React 19 & TypeScript)

Welcome to **Lesson 4**! In this lesson, you will learn modern frontend development using **TypeScript**, **React 19**, **Zustand** state management, and **TanStack Query** (React Query).

---

## 1. Strict TypeScript for Enterprise Applications

TypeScript prevents entire classes of runtime errors (`TypeError: Cannot read properties of undefined`) by providing static type safety.

```typescript
// Interface definitions for POS Cart
export interface VariantOption {
  id: number | string;
  name: string;
  priceAdjustment: number;
}

export interface AddonOption {
  id: number | string;
  name: string;
  price: number;
  variant_prices?: Record<string, number>; // Size-based price overrides
}

export interface CartItem {
  id: string;
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
  selectedVariantName?: string;
  selectedAddonDetails: Array<{ name: string; price: number }>;
}
```

---

## 2. React Hooks & Component State

React components render UI deterministically based on state and props.

```tsx
import { useState, useMemo } from "react";

interface CounterProps {
  initialCount?: number;
  onCountChange?: (count: number) => void;
}

export function Counter({ initialCount = 1, onCountChange }: CounterProps) {
  const [quantity, setQuantity] = useState<number>(initialCount);

  const handleIncrement = () => {
    const next = quantity + 1;
    setQuantity(next);
    onCountChange?.(next);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const next = quantity - 1;
      setQuantity(next);
      onCountChange?.(next);
    }
  };

  return (
    <div className="flex items-center gap-2 border rounded-xl p-1">
      <button onClick={handleDecrement} className="px-2 py-1 bg-muted rounded font-bold">-</button>
      <span className="font-mono text-sm font-bold w-6 text-center">{quantity}</span>
      <button onClick={handleIncrement} className="px-2 py-1 bg-primary text-white rounded font-bold">+</button>
    </div>
  );
}
```

---

## 3. Global State Management with Zustand

Zustand provides a simple, unopinionated, fast state management store for sharing auth state and organizational context across your web app.

```typescript
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  selectedBranch: { id: number; name: string } | null;
  setAccessToken: (token: string) => void;
  setSelectedBranch: (branch: { id: number; name: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("ssrone_access_token"),
  selectedBranch: null,
  setAccessToken: (token) => {
    localStorage.setItem("ssrone_access_token", token);
    set({ accessToken: token });
  },
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  logout: () => {
    localStorage.removeItem("ssrone_access_token");
    set({ accessToken: null, selectedBranch: null });
  },
}));
```

---

## 4. Server State Sync with TanStack Query (React Query)

TanStack Query manages fetching, caching, synchronizing, and updating server state seamlessly.

```tsx
import { useQuery } from "@tanstack/react-[#2. React Hooks & Component State]";
import { api } from "@/shared/utils/api-client";

export function useMenuCatalog(branchId?: number) {
  return useQuery({
    queryKey: ["menu-catalog", branchId],
    queryFn: async () => {
      return await api.get<MenuItem[]>("/restaurant/menu-items", { branch_id: branchId });
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
```

---

## 🏋️ Lesson 4 Hands-on Exercises
1. Build a custom React hook `useDebounce(value, delay)` to debounce search queries in the POS grid.
2. Create a TypeScript interface for `TableOrder` and calculate order total using `useMemo`.
