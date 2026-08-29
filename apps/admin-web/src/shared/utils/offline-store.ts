/**
 * The ssrone – Offline Store (Dexie.js / IndexedDB)
 * Blueprint §7: Offline Engine — POS works without internet,
 * queues transactions locally, syncs when connection restores.
 */
import Dexie, { type Table } from "dexie";

interface OfflineOrder {
  id?: number;
  localId: string;
  branchId: string;
  orderData: object;
  createdAt: string;
  synced: boolean;
  syncAttempts: number;
  error?: string;
}

interface CachedProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  branchId: string;
  cachedAt: string;
}

interface CachedCustomer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  branchId: string;
  cachedAt: string;
}

interface SyncQueueItem {
  id?: number;
  entityType: string;   // "order" | "payment" | "stock_adjustment"
  entityId: string;
  payload: object;
  endpoint: string;
  method: string;
  createdAt: string;
  attempts: number;
}

class ssroneOfflineDB extends Dexie {
  offlineOrders!: Table<OfflineOrder>;
  cachedProducts!: Table<CachedProduct>;
  cachedCustomers!: Table<CachedCustomer>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("SSRONE_POS");
    this.version(1).stores({
      offlineOrders: "++id, localId, branchId, synced, createdAt",
      cachedProducts: "id, branchId, category, cachedAt",
      cachedCustomers: "id, phone, branchId, cachedAt",
      syncQueue: "++id, entityType, entityId, attempts, createdAt",
    });
  }
}

export const offlineDB = new ssroneOfflineDB();

/** Save an order locally when offline */
export async function saveOfflineOrder(branchId: string, orderData: object): Promise<string> {
  const localId = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await offlineDB.offlineOrders.add({
    localId,
    branchId,
    orderData,
    createdAt: new Date().toISOString(),
    synced: false,
    syncAttempts: 0,
  });
  return localId;
}

/** Get all pending (unsynced) offline orders */
export async function getPendingOrders(): Promise<OfflineOrder[]> {
  return offlineDB.offlineOrders.where("synced").equals(0).toArray();
}

/** Cache product catalog for offline browsing */
export async function cacheProducts(products: CachedProduct[]): Promise<void> {
  await offlineDB.cachedProducts.bulkPut(products);
}

/** Get cached products for a branch */
export async function getCachedProducts(branchId: string): Promise<CachedProduct[]> {
  return offlineDB.cachedProducts.where("branchId").equals(branchId).toArray();
}

/** Add item to sync queue */
export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "attempts" | "createdAt">): Promise<void> {
  await offlineDB.syncQueue.add({
    ...item,
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
}

/** Process sync queue — call when connection is restored */
export async function processSyncQueue(apiBase: string, token: string): Promise<{ synced: number; failed: number }> {
  const pending = await offlineDB.syncQueue.toArray();
  let synced = 0, failed = 0;

  for (const item of pending) {
    try {
      const res = await fetch(`${apiBase}${item.endpoint}`, {
        method: item.method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(item.payload),
      });
      if (res.ok) {
        await offlineDB.syncQueue.delete(item.id!);
        synced++;
      } else {
        await offlineDB.syncQueue.update(item.id!, { attempts: item.attempts + 1 });
        failed++;
      }
    } catch {
      await offlineDB.syncQueue.update(item.id!, { attempts: item.attempts + 1 });
      failed++;
    }
  }

  return { synced, failed };
}
