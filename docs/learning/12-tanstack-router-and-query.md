# Lesson 12: Type-Safe TanStack Router, TanStack Query Cache & Invalidation
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 02: Strict TypeScript](file:///e:/2026/ssr_one_ai/docs/learning/02-typescript-foundations.md), [Lesson 11: React 19 & Vite](file:///e:/2026/ssr_one_ai/docs/learning/11-react-19-and-vite.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**TanStack Router** is a 100% type-safe client-side routing library for React. It manages browser URL navigation, route matching, search parameters, and nested layouts with end-to-end TypeScript autocomplete. **TanStack Query (React Query)** is a powerful asynchronous server-state management library. It automatically fetches, deduplicates, caches, updates, and garbage-collects backend API data in the browser so your frontend never has to manually manage loading spinners or duplicate network requests.

### Real-Life Analogy
Imagine the front desk and waiter paging system in a busy multi-floor restaurant:
* **The Messy Way (Manual `useEffect` + String Routing)**: A waiter wants to look up the dessert menu. They run down two flights of stairs to the kitchen, wait 3 minutes for a paper list, run back up, and hand it to the guest. Two minutes later, another guest asks for the exact same menu. The waiter runs all the way down to the kitchen again! Meanwhile, if a guest asks for "Room 101" and the receptionist misreads the handwritten sign and types `/rooms/one-zero-one`, the guest is sent into a dark broom closet (404 error).
* **TanStack Router + TanStack Query**: Every waiter carries a digital tablet with a smart local cache. The first time the dessert menu is requested, the tablet fetches it once and keeps it warm in memory for 5 minutes. The next 20 guests who ask see the menu in **0 milliseconds** without touching the kitchen! And TanStack Router ensures that every link, room number, and tab parameter is strictly verified by TypeScript: you physically cannot type an invalid URL in your code.

In SSR One AI, TanStack Query ensures our POS terminal loads menu items instantly from cache, while TanStack Router coordinates seamless, type-safe navigation across POS, KDS, Hotel Rooms, and Accounting.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
1. **Network Burst Prevention (Deduplication & Stale-While-Revalidate)**: When a cashier switches between the Table View and the Billing View, plain `useEffect` would fire 5 redundant API calls every single time. TanStack Query serves the data instantly from its warm in-memory cache (`staleTime: 5 mins`) while revalidating quietly in the background.
2. **Deterministic Cache Invalidation**: When a manager edits a dish price or adds an item in Menu Master, they call `queryClient.invalidateQueries({ queryKey: ["menu-items"] })`. Instantly, the POS terminal, customer digital menu, and KDS refresh their data in real time!
3. **Type-Safe Search Parameters**: POS terminals use URL search parameters like `?tab=active&branch_id=1&floor=2`. TanStack Router validates search params with Zod schemas. If a parameter is missing or wrong, TypeScript flags it before you hit save.
4. **Code-Split Lazy Loading**: Look at lines 23–48 in [apps/admin-web/src/app/routes/index.tsx](file:///e:/2026/ssr_one_ai/apps/admin-web/src/app/routes/index.tsx#L23-L48). Secondary modules (Hotel, PG, HR, Payroll, AI Copilot) are dynamically lazy-loaded using `React.lazy()`. The cashier only downloads the POS billing code on startup, keeping the initial bundle under 150KB!

### Alternatives Considered & Why Rejected
* **Redux / Redux Toolkit**: Bloated boilerplate for server state; requires writing actions, reducers, and selectors just to fetch a menu.
* **React Router v6**: Relies on string-based paths (`navigate("/pos/terminal")`), which easily introduces broken 404 links during refactorings.
* **TanStack Router & Query (Chosen)**: Full TypeScript safety, automatic background garbage collection, and zero-boilerplate data fetching.

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: Server State vs Client State
* **Client State (Zustand)**: Ephemeral UI state that exists only on this specific device (e.g. current cart items, modal popup open/closed, active theme).
* **Server State (TanStack Query)**: Data that actually lives in the remote PostgreSQL database (e.g. list of orders, menu categories, hotel room inventory). It is owned by the server and can change without your browser knowing.

### Concept B: The Query Lifecycle (`staleTime` vs `gcTime`)
* **`staleTime` (Freshness Window)**: How long fetched data is considered "fresh". While fresh, TanStack Query will **never** make a network request; it reads straight from browser RAM. (In SSR One AI, configured to **5 minutes**).
* **`gcTime` (Garbage Collection Time)**: How long inactive data stays in browser memory after all components unmount before being deleted. (In SSR One AI, configured to **30 minutes**).

### Concept C: The Query Key Hierarchy
A `queryKey` is a unique serializable array that acts as the cache key:
```typescript
["orders", branchId, { status: "in_kitchen" }]
```
If `branchId` changes from `1` to `2`, TanStack Query automatically fetches Branch 2's orders and stores them in a separate cache slot!

### Concept D: Mutations & Optimistic Updates
* **Query** (`useQuery`): Read operations (`GET`).
* **Mutation** (`useMutation`): Write operations (`POST`, `PUT`, `DELETE`).
* **Optimistic Update**: When a waiter clicks "Cancel Item", the UI immediately removes the item from the screen *before* the backend responds. If the server approves, nothing changes. If the server rejects, TanStack Query automatically rolls back the screen to its previous state with a toast alert!

---

## 4. Syntax & Feature Breakdown

### 1. The `useQuery` Hook
```tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@ssrone/api-client";

export function useMenuItems(branchId: string) {
  return useQuery({
    queryKey: ["menu-items", branchId],
    queryFn: async () => {
      const res = await api.get(`/restaurant/menu?branch_id=${branchId}`);
      return res.data;
    },
    enabled: Boolean(branchId), // Only run query if branchId is truthy
  });
}
```

### 2. The `useMutation` Hook & Cache Invalidation
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrderPayload: CreateOrderDTO) => {
      const res = await api.post("/orders", newOrderPayload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order punched successfully!");
      // Invalidate orders cache so the Table and KDS screens refetch immediately!
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create order");
    },
  });
}
```

---

## 5. How It Is Used in OUR Project (Real Code & Flow)

### 1. Global QueryClient Configuration: [apps/admin-web/src/app/providers/index.tsx](file:///e:/2026/ssr_one_ai/apps/admin-web/src/app/providers/index.tsx)

```typescript
// Lines 10-26 in apps/admin-web/src/app/providers/index.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes in-memory freshness
      gcTime: 1000 * 60 * 30,         // 30 minutes garbage collection
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status: number } })?.response?.status;
        // Never retry client errors (401 Unauthorized, 403 Forbidden, 404 Not Found)
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;      // Retry network drops max twice
      },
      refetchOnWindowFocus: false,    // Crucial for POS! Avoids refetch spikes on tab switch
    },
    mutations: {
      retry: false,                   // Never retry failed payments or bill generation automatically!
    },
  },
});
```

#### Why `refetchOnWindowFocus: false` is Essential for POS:
In standard web apps, clicking away from the browser and coming back triggers an automatic background refetch. In a busy restaurant where a cashier flips between the billing screen and a calculator window, unexpected refetches could overwrite unsaved table notes or reset cart scroll positions. Disabling `refetchOnWindowFocus` guarantees stable, distraction-free billing.

---

### 2. Code-Split Route Tree: [apps/admin-web/src/app/routes/index.tsx](file:///e:/2026/ssr_one_ai/apps/admin-web/src/app/routes/index.tsx)

```typescript
// Lines 5-26 in apps/admin-web/src/app/routes/index.tsx
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { POSPage, KDSScreen } from "@/modules/pos";

// Code-Split Secondary Modules (Lazy Loaded on Navigation)
const HotelPage = lazy(() => import("@/modules/hotel").then(m => ({ default: m.HotelPage })));
const InventoryPage = lazy(() => import("@/modules/inventory").then(m => ({ default: m.InventoryPage })));
const FinancePage = lazy(() => import("@/modules/finance").then(m => ({ default: m.FinancePage })));
```

Notice the architectural priority:
* **Eagerly Loaded**: `POSPage` and `KDSScreen` are imported statically at the top. When the cashier opens the app, the POS terminal is ready **instantly with 0ms delay**.
* **Lazy Loaded**: `HotelPage`, `InventoryPage`, `FinancePage`, and `Payroll` are wrapped in `React.lazy()`. Their JavaScript chunks are only downloaded over the network if and when a manager clicks on those tabs.

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: Unstable Query Keys (Passing Objects Directly)
* **What happens**: Writing:
  ```typescript
  useQuery({ queryKey: ["orders", { date: new Date() }], ... }) // ❌ INFINITE REFETCH LOOP!
  ```
* **Why**: In JavaScript, `new Date()` generates a new object identity on every single render. TanStack Query thinks the key changed and fetches again in an infinite loop.
* **Fix**: Use stable strings or ISO format: `["orders", selectedDate.toISOString().split("T")[0]]`.

### Mistake 2: Forgetting to Return the Promise in `queryFn`
* **What happens**: Writing:
  ```typescript
  queryFn: () => { api.get("/dishes"); } // Missing return!
  ```
  The query resolves to `undefined` and your screen displays empty data.
* **Fix**: Always return the promise or use `async`/`await`:
  ```typescript
  queryFn: async () => (await api.get("/dishes")).data
  ```

### Mistake 3: Over-Invalidating the Cache
* **What happens**: Running `queryClient.invalidateQueries()` with no key after placing an order.
* **Why**: This invalidates **every single cached query** across the entire platform (settings, user profile, branches, tables, menu, reports), causing 20 simultaneous network requests that spike backend CPU.
* **Fix**: Be specific with your query keys: `queryClient.invalidateQueries({ queryKey: ["orders", activeBranchId] })`.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Centralize Query Keys in an Enum or Factory**:
   Never scatter raw strings like `"menu"` across 20 files. Use a key factory:
   ```typescript
   export const orderKeys = {
     all: ["orders"] as const,
     lists: () => [...orderKeys.all, "list"] as const,
     list: (branchId: string) => [...orderKeys.lists(), branchId] as const,
     detail: (id: string) => [...orderKeys.all, "detail", id] as const,
   };
   ```
2. **Use `select` for Data Transformation**:
   If an endpoint returns 50 menu items, but your component only needs vegetarian dishes, use the `select` option:
   ```typescript
   useQuery({
     queryKey: ["menu"],
     queryFn: fetchMenu,
     select: (dishes) => dishes.filter((d) => d.is_veg),
   });
   ```
   If a non-veg dish price changes, this component will **not even re-render**!
3. **Inspect Queries with React Query Devtools**:
   In local development, notice line 47 in `providers/index.tsx`:
   ```typescript
   {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
   ```
   Click the floating flower icon in your browser to inspect every cached query, view stale timers, and manually trigger invalidations live.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
Write a custom hook `useTableList(branchId: string)` that fetches tables from `/restaurant/tables?branch_id=${branchId}` with a query key of `["tables", branchId]`.

### Exercise 2 (Medium):
Write a mutation hook `useUpdateTableStatus()` that:
1. Calls `api.patch("/restaurant/tables/" + tableId, { status: newStatus })`.
2. On success, invalidates the `["tables"]` cache and triggers a Sonner success toast: `"Table status updated"`.

### Exercise 3 (Hard):
Inspect `apps/admin-web/src/app/routes/index.tsx`. Explain why `createRootRoute` uses `<Outlet />` and trace how TanStack Router renders the `POSPage` component when the URL matches `/pos`.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@ssrone/api-client";

export function useTableList(branchId: string) {
  return useQuery({
    queryKey: ["tables", branchId],
    queryFn: async () => {
      const res = await api.get(`/restaurant/tables?branch_id=${branchId}`);
      return res.data;
    },
    enabled: Boolean(branchId),
  });
}
```

#### Solution 2:
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, status }: { tableId: string; status: string }) => {
      const res = await api.patch(`/restaurant/tables/${tableId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Table status updated");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: () => {
      toast.error("Failed to update table status");
    },
  });
}
```

#### Solution 3:
1. `createRootRoute`: Defines the top-level master layout of the entire web app (contains sidebar, header navigation, and global dialogs).
2. `<Outlet />`: A placeholder component that tells React: *"Render the matched child route right here inside the layout"*.
3. When the browser navigates to `/pos`:
   - TanStack Router matches the route definition `createRoute({ getParentRoute: () => rootRoute, path: "/pos", component: POSPage })`.
   - TanStack Router mounts `POSPage` inside the `<Outlet />` placeholder of the root route.
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. What is the difference between `staleTime` and `gcTime` in TanStack Query?
2. Why is `refetchOnWindowFocus: false` critical in a POS billing interface?
3. What is the purpose of `queryClient.invalidateQueries()`?
4. How does TanStack Router's `<Outlet />` component work?
5. Why are secondary modules in `admin-web` wrapped in `React.lazy()`?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to a junior frontend developer why caching data in TanStack Query is superior to storing API responses in a global Redux store.
* *Prompt 2*: Explain what "Optimistic UI" is using the analogy of sending a WhatsApp message that shows a checkmark immediately before the message reaches the cell tower.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```tsx
// ─── TANSTACK QUERY ARCHITECT PATTERNS ───────────────────────
// 1. Fetching Server State
const { data, isLoading, error } = useQuery({
  queryKey: ["dishes", branchId],
  queryFn: () => api.get(`/dishes?branch=${branchId}`).then(r => r.data),
  staleTime: 1000 * 60 * 5, // Fresh for 5 mins
});

// 2. Mutating & Invalidating
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newDish) => api.post("/dishes", newDish),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["dishes"] });
  },
});

// ─── TANSTACK ROUTER SETUP ───────────────────────────────────
const rootRoute = createRootRoute({ component: () => <Outlet /> });
const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos",
  component: POSPage,
});
const router = createRouter({ routeTree: rootRoute.addChildren([posRoute]) });
```

---
*Next Lesson: **[Lesson 13: Zustand Stores, Dexie.js IndexedDB & 0ms Zero-Wait Offline POS](file:///e:/2026/ssr_one_ai/docs/learning/13-zustand-and-dexie-pos.md)***
