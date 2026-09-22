# 📖 Lesson 5: High-Volume POS & Multi-Channel Systems

Welcome to **Lesson 5**! In this lesson, you will learn the core business logic and algorithms powering **The ssrone POS System**, including Size-Based Addon Pricing, Offline Billing Queuing, and Real-Time Kitchen Display Synchronization.

---

## 1. Size-Based Addon Pricing Algorithm

In high-volume restaurant POS systems, certain addons (like **Cheese Burst**) change price dynamically based on the selected portion size (**Small**, **Medium**, or **Large**).

### Business Rule Example:
- **Base Item**: Farmhouse Pizza (Small: ₹200, Medium: ₹280, Large: ₹360)
- **Addon**: Cheese Burst
  - Default Base Price: ₹50
  - Size Overrides: `{ "Small": 50, "Medium": 80, "Large": 100 }`

### Pricing Algorithm Implementation:

```typescript
export interface AddonOption {
  id: string | number;
  name: string;
  price: number; // Default base price
  variant_prices?: Record<string, number>; // Size overrides
}

/**
 * Calculates the exact dynamic addon price based on the selected portion size.
 */
export function calculateDynamicAddonPrice(
  addon: AddonOption,
  selectedSizeName?: string
): number {
  if (
    selectedSizeName &&
    addon.variant_prices &&
    addon.variant_prices[selectedSizeName] !== undefined
  ) {
    return Number(addon.variant_prices[selectedSizeName]);
  }
  return addon.price || 0;
}

// Example Execution:
const cheeseBurstAddon: AddonOption = {
  id: "ao-cheese-burst",
  name: "Cheese Burst",
  price: 50,
  variant_prices: {
    Small: 50,
    Medium: 80,
    Large: 100,
  },
};

console.log(calculateDynamicAddonPrice(cheeseBurstAddon, "Small"));  // ➔ 50
console.log(calculateDynamicAddonPrice(cheeseBurstAddon, "Medium")); // ➔ 80
console.log(calculateDynamicAddonPrice(cheeseBurstAddon, "Large"));  // ➔ 100
```

---

## 2. Offline Billing & Background Queueing Engine

High-volume POS terminals must never stop working during internet outages. Orders are queued locally in `IndexedDB` or `localStorage` and synchronized automatically when internet connectivity is restored.

```typescript
export interface QueuedOrder {
  id: string;
  timestamp: number;
  payload: any;
  status: "pending" | "syncing" | "synced" | "error";
}

export class OfflineOrderQueue {
  private STORAGE_KEY = "ssrone_offline_orders";

  public getPendingOrders(): QueuedOrder[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  public enqueue(payload: any): QueuedOrder {
    const queue = this.getPendingOrders();
    const order: QueuedOrder = {
      id: `offline-${Date.now()}`,
      timestamp: Date.now(),
      payload,
      status: "pending",
    };
    queue.push(order);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    return order;
  }

  public async syncQueue(apiSubmitFn: (payload: any) => Promise<any>): Promise<number> {
    const queue = this.getPendingOrders();
    let syncedCount = 0;
    const remaining: QueuedOrder[] = [];

    for (const order of queue) {
      try {
        await apiSubmitFn(order.payload);
        syncedCount++;
      } catch (err) {
        console.error("Order sync failed, keeping in queue", order.id, err);
        remaining.push(order);
      }
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining));
    return syncedCount;
  }
}
```

---

## 3. Realtime Kitchen Display (KDS) & WebSockets

When an order is saved in the POS, it must instantly trigger a notification on the target Kitchen Display Station (e.g. **Tandoor**, **Chinese**, **Beverages**).

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

class KDSConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_new_kot(self, kot_data: dict):
        for connection in self.active_connections:
            await connection.send_json({"event": "NEW_KOT", "data": kot_data})

kds_manager = KDSConnectionManager()
```

---

## 🏋️ Lesson 5 Hands-on Exercises
1. Test `calculateDynamicAddonPrice` with 3 different pizza sizes.
2. Implement an offline sync trigger that runs automatically when `window.addEventListener('online')` fires.
