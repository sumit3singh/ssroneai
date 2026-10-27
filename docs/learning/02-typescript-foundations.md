# Lesson 02: Strict TypeScript, Monorepo Path Aliases & Shared Types
> **Target Audience**: Main Lead Engineer & Software Architect  
> **Repository Context**: `SSR One AI` (`e:/2026/ssr_one_ai`)  
> **Prerequisites**: [Lesson 01: Monorepo Architecture](file:///e:/2026/ssr_one_ai/docs/learning/01-monorepo-pnpm-turbo.md)

---

## 1. What It Is (Simple Explanation & Real-Life Analogy)

**TypeScript** is a strongly typed programming language that builds directly on JavaScript by adding static type definitions. It runs at development time (inside your IDE like VS Code and in your build pipeline), checking every variable, function parameter, and object property to catch bugs before your code ever runs in a browser or hits a production customer.

### Real-Life Analogy
Imagine a restaurant kitchen order ticket:
* **Plain JavaScript**: A waiter scribbles on a blank napkin: *"Food: 2, Spicy: yes, Table: maybe"*. The chef has to guess whether "Food" means Pizza or Biryani, what number 2 means, and where to deliver it. A customer ends up with the wrong dish and the billing machine crashes.
* **Strict TypeScript**: Every waiter is given a standardized, pre-printed carbon-copy order form. The form has strict boxes: `DishName: [Enum: Pizza | Burger | Biryani]`, `Quantity: [Integer > 0]`, `TableId: [Required String]`. If the waiter leaves `DishName` blank or writes `"two"` instead of the number `2`, the system physically rejects the ticket before the order can ever reach the kitchen.

In SSR One AI, TypeScript is our strict contract ensuring that a bill computed in `apps/admin-web` uses the exact same fields, decimal types, and validation rules as the backend FastAPI database response.

---

## 2. Why This Project Uses It (The Problem It Solves & Alternatives)

### The Problem It Solves in SSR One AI
In a multi-tenant SaaS POS platform managing money, inventory, and restaurant billing:
1. **Financial Disasters Prevented**: If an order item property is named `unit_price` in the backend, but a developer writes `item.price` or `item.unitPrice` in the frontend, plain JavaScript would silently evaluate it to `undefined`. `undefined * 2` calculates to `NaN` (Not a Number), producing a printed bill of `₹NaN` and corrupting the financial ledger! TypeScript catches this typing mistake instantly and refuses to compile.
2. **Refactoring Fear Abolished**: When we add a new status to our POS order workflow (like `"in_kitchen"` for KDS), TypeScript immediately highlights every single screen, table component, and filter across all 8 web apps that needs to handle this new status.
3. **Single Source of Truth (`packages/types`)**: All shared domain models (`UserProfile`, `Order`, `OrderItem`, `OrderStatus`, `Branch`) are declared in one central place: [packages/types/src/index.ts](file:///e:/2026/ssr_one_ai/packages/types/src/index.ts).

### Alternatives Considered & Why Rejected
* **Plain JavaScript**: Unacceptable for enterprise hospitality software handling payments, room bookings, and tax invoices.
* **JSDoc type annotations**: Verbose, fragile, and lacks compiler-level guarantees across monorepo package boundaries.
* **Strict TypeScript (Chosen)**: Full compile-time safety with zero runtime overhead (TypeScript compiles away into pure, clean JavaScript).

---

## 3. Core Concepts (From Zero to Architect)

### Concept A: Static Types vs Runtime Values
* **Runtime**: What happens in the browser when a user clicks a button. JavaScript is running. TypeScript does not exist here.
* **Compile-Time**: What happens in your editor and during `pnpm run build`. TypeScript analyzes the code structure without running it.

### Concept B: Interfaces vs Type Aliases
* **`interface`**: Best for defining the shape of objects and entities that can be extended.
  ```typescript
  export interface BaseEntity {
    id: string;
    created_at: string;
    is_deleted: boolean;
  }
  export interface TenantEntity extends BaseEntity {
    tenant_id: string;
  }
  ```
* **`type`**: Best for union literals, primitives, and complex computed types.
  ```typescript
  export type OrderStatus =
    | "draft" | "confirmed" | "in_kitchen"
    | "ready" | "served" | "completed"
    | "cancelled" | "refunded";
  ```

### Concept C: Generics (`<T>`) — Reusable Type Blueprints
A generic is a type placeholder that you pass into an interface, just like passing an argument into a function.
In our API client, an API response is never just a generic object; it wraps a specific data payload:
```typescript
export interface PaginatedResponse<T> {
  items: T[];       // Array of whatever type T is (e.g. OrderItem[] or UserProfile[])
  total: number;
  page: number;
  page_size: number;
}
```
If you request orders: `PaginatedResponse<OrderItem>`, `items` is strictly typed as an array of `OrderItem`!

### Concept D: Strict Null Checking (`strict: true`)
In standard JavaScript, accessing a property on `null` crashes your app with: `TypeError: Cannot read properties of null`.
In SSR One AI, `"strict": true` is enabled. If a user might be logged out:
```typescript
user: UserProfile | null;
```
TypeScript **forces** you to check `if (!user) return;` before reading `user.email`. This eliminates 95% of frontend runtime crashes.

---

## 4. Syntax & Configuration Breakdown

### 1. `tsconfig.base.json` (The Master Compiler Contract)
Located at the monorepo root: [tsconfig.base.json](file:///e:/2026/ssr_one_ai/tsconfig.base.json). Every app and package extends this file:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "SSR One AI Base Config",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Compiler Flag Deep-Dive:
* `"target": "ES2022"`: Compiles TypeScript into modern JavaScript supported by modern browsers (supports native async/await, optional chaining `?.`, nullish coalescing `??`).
* `"moduleResolution": "bundler"`: Modern Vite/Rollup resolution mode. Enables importing packages directly through package.json `exports` maps.
* `"strict": true`: Turns on ALL strict type checking flags:
  - `noImplicitAny`: You cannot write `function add(a, b)` without declaring their types.
  - `strictNullChecks`: `null` and `undefined` are not assignable to strings or numbers unless explicitly declared with a union (`string | null`).
* `"noEmit": true`: TypeScript does **not** compile `.ts` files into `.js` files on disk. Instead, **Vite** does the ultra-fast transpilation, while TypeScript is used purely for type-checking (`tsc --noEmit`).

---

## 5. How It Is Used in OUR Project (Real Code & Flow)

### 1. The Single Source of Truth: [packages/types/src/index.ts](file:///e:/2026/ssr_one_ai/packages/types/src/index.ts)

Let's examine our real domain models in the code:

```typescript
// Line 8-18 in packages/types/src/index.ts
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_deleted: boolean;
}

export interface TenantEntity extends BaseEntity {
  tenant_id: string;
}
```

Notice the inheritance: Every table in our PostgreSQL database that belongs to a restaurant tenant inherits from `TenantEntity`. It automatically has `id`, `created_at`, `updated_at`, `is_deleted`, and `tenant_id`.

Now look at our real POS order definitions:

```typescript
// Line 110-130 in packages/types/src/index.ts
export type OrderStatus =
  | "draft" | "confirmed" | "in_kitchen"
  | "ready" | "served" | "completed"
  | "cancelled" | "refunded";

export type OrderType =
  | "dine_in" | "takeaway" | "delivery"
  | "room_service" | "banquet" | "online";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  kds_status: string;
  modifiers: unknown[];
}
```

### 2. How the Type Flows into `admin-web` POS Billing:
1. In `apps/admin-web/package.json`:
   ```json
   "dependencies": {
     "@ssrone/types": "workspace:*"
   }
   ```
2. In `apps/admin-web/src/modules/pos/pages/terminal/POSTerminalPage.tsx`:
   ```typescript
   import type { OrderItem, OrderStatus } from "@ssrone/types";

   // If a developer tries to set status to "cooking":
   const currentStatus: OrderStatus = "cooking"; 
   // ❌ TypeScript Error: Type '"cooking"' is not assignable to type 'OrderStatus'.
   // Did you mean "in_kitchen"?
   ```
3. This guarantees that no rogue string ever enters the billing system!

---

## 6. Common Mistakes & Gotchas (What Breaks & How to Debug)

### Mistake 1: The Lazy `any` Poison
* **What happens**: A developer writes:
  ```typescript
  const handleOrder = (data: any) => {
    console.log(data.total_amont); // Typo! Should be total_amount
  }
  ```
  `any` turns off all TypeScript checking for that variable and everything it touches. The error slips into production silently.
* **The Lead Developer Rule**: Never use `any`. Use `unknown` if the type is truly uncertain, and narrow it using type guards:
  ```typescript
  if (typeof data === "object" && data !== null && "total_amount" in data) { ... }
  ```

### Mistake 2: Type vs Value Confusion
* **What happens**: Writing:
  ```typescript
  import { OrderStatus } from "@ssrone/types";
  console.log(OrderStatus); // ❌ Runtime Error: OrderStatus is not defined!
  ```
* **Why**: `OrderStatus` is a TypeScript `type`, not a JavaScript variable! Types are completely erased during build.
* **Fix**: Use `import type { OrderStatus } from "@ssrone/types"` to make it clear it is compile-time only.

### Mistake 3: Non-Null Assertion Abuse (`!`)
* **What happens**: Writing:
  ```typescript
  const userEmail = authState.user!.email;
  ```
  The exclamation mark `!` tells TypeScript: *"Trust me, I swear this is never null."* If the user session expired and `authState.user` is `null`, your application immediately white-screens with a crash.
* **Fix**: Use optional chaining: `authState.user?.email ?? "Guest"`.

---

## 7. Best Practices & Performance Tips for POS Systems

1. **Keep Types in `@ssrone/types` Zero-Dependency**:
   `packages/types` must never import React, Axios, or external libraries. It must remain pure TypeScript definitions so that both frontend apps and backend generators can consume it effortlessly.
2. **Use Discriminated Unions for Complex POS States**:
   Instead of one giant object with 20 optional fields, use discriminated unions:
   ```typescript
   type PaymentMethod =
     | { type: "cash"; tendered_amount: number; change_due: number }
     | { type: "upi"; transaction_ref: string; qr_code_id: string }
     | { type: "card"; last_four: string; auth_code: string };
   ```
3. **Run Typecheck in CI**:
   Our GitHub Actions workflow runs:
   ```bash
   pnpm run type-check
   ```
   This compiles all 8 applications in parallel in under 15 seconds.

---

## 8. Hands-On Practice Exercises

### Exercise 1 (Easy):
In [packages/types/src/index.ts](file:///e:/2026/ssr_one_ai/packages/types/src/index.ts), locate `OrderType`. Add a new order type called `"drive_thru"`.

### Exercise 2 (Medium):
Write a generic TypeScript interface called `ApiResponse<T>` that represents our standard FastAPI backend payload:
* `success`: boolean
* `data`: T
* `message`: string
* `timestamp`: string

### Exercise 3 (Hard):
Inspect the `OrderItem` interface in [packages/types/src/index.ts](file:///e:/2026/ssr_one_ai/packages/types/src/index.ts#L119). Currently, `modifiers` is typed as `unknown[]`. Define a strongly typed `DishModifier` interface:
* `modifier_id`: string
* `name`: string (e.g. "Extra Cheese")
* `price`: number
* `is_default`: boolean
Then update `OrderItem` so `modifiers` is strictly `DishModifier[]`.

<details>
<summary><strong>Click to View Solutions</strong></summary>

#### Solution 1:
```typescript
export type OrderType =
  | "dine_in" | "takeaway" | "delivery"
  | "room_service" | "banquet" | "online"
  | "drive_thru";
```

#### Solution 2:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}
```

#### Solution 3:
```typescript
export interface DishModifier {
  modifier_id: string;
  name: string;
  price: number;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  kds_status: string;
  modifiers: DishModifier[];
}
```
</details>

---

## 9. Self-Test & Feynman Active Recall

### 5 Recall Questions:
1. What does `"noEmit": true` in `tsconfig.base.json` tell the TypeScript compiler to do?
2. What is the fundamental difference between an `interface` and a `type` alias?
3. Why is using `any` considered dangerous in financial POS software?
4. How does TypeScript's `strictNullChecks` prevent the classic "white screen of death"?
5. In the generic type `PaginatedResponse<T>`, what does `<T>` represent?

### 2 Feynman Prompts:
* *Prompt 1*: Explain to an intern why writing `item.unit_price!` (using the non-null assertion operator) is like cutting the brake lines of a car because you assume the light will always be green.
* *Prompt 2*: Explain how shared TypeScript types eliminate communication bugs between the frontend engineer building the mobile QR menu and the backend engineer writing the FastAPI order endpoint.

---

## 10. Architect's Cheat Sheet (One-Screen Summary)

```typescript
// ─── TYPESCRIPT ESSENTIAL SYNTAX ─────────────────────────────
// Union Literal
type KitchenStatus = "pending" | "cooking" | "ready";

// Object Interface with Optional & Readonly
interface Table {
  readonly id: string;           // Cannot be reassigned
  table_number: number;
  capacity: number;
  guest_name?: string;           // Optional (string | undefined)
}

// Generics (Reusable Container)
interface Envelope<T> {
  status: "ok" | "error";
  payload: T;
}

// Type Narrowing (Discriminated Union)
type Payment = 
  | { mode: "CASH"; amount: number }
  | { mode: "ONLINE"; razorpay_payment_id: string };

function processPayment(p: Payment) {
  if (p.mode === "CASH") {
    console.log(p.amount);               // ✅ TypeScript knows amount exists
  } else {
    console.log(p.razorpay_payment_id);  // ✅ TypeScript knows razorpay exists
  }
}

// ─── MONOREPO COMMANDS ──────────────────────────────────────
pnpm run type-check       # Runs tsc across all apps & packages
```

---
*Next Lesson: **[Lesson 03: Multi-Stage Docker Builds, Dev/Prod Compose & Linux Dependencies](file:///e:/2026/ssr_one_ai/docs/learning/03-docker-and-compose.md)***
