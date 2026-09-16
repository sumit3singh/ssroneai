/**
 * The ssrone – Offline Store (Dexie.js / IndexedDB)
 * Blueprint §7: Offline Engine — POS works without internet,
 * queues transactions locally, syncs when connection restores.
 */
import Dexie, { type Table } from "dexie";

export interface OfflineOrder {
  id?: number;
  localId: string;
  branchId: string;
  orderData: object;
  createdAt: string;
  synced: boolean;
  syncAttempts: number;
  error?: string;
}

export interface CachedProduct {
  id: string | number;
  name: string;
  item_code?: string;
  short_description?: string;
  price: number;
  base_price?: number;
  selling_price?: number;
  category_id?: number | string;
  category?: string;
  isVeg: boolean;
  is_veg?: boolean;
  is_popular?: boolean;
  is_bestseller?: boolean;
  is_available?: boolean;
  branchId: string;
  raw_item_data?: any;
  cachedAt: string;
}

export interface CachedCategory {
  id: string | number;
  name: string;
  slug?: string;
  code?: string;
  sort_order?: number;
  branchId: string;
  cachedAt: string;
}

export interface CachedCustomer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  branchId: string;
  cachedAt: string;
}

export interface SyncQueueItem {
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
  cachedCategories!: Table<CachedCategory>;
  cachedCustomers!: Table<CachedCustomer>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("SSRONE_POS");
    this.version(2).stores({
      offlineOrders: "++id, localId, branchId, synced, createdAt",
      cachedProducts: "id, branchId, category_id, cachedAt",
      cachedCategories: "id, branchId, cachedAt",
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

/** Get pending unsynced order count */
export async function getPendingOrderCount(): Promise<number> {
  return offlineDB.offlineOrders.filter((item) => !item.synced).count();
}

/** Cache full product and category catalog for offline POS browsing */
export async function cacheCatalog(branchId: string, items: any[], categories: any[]): Promise<void> {
  try {
    const now = new Date().toISOString();
    if (items && items.length > 0) {
      const mappedItems: CachedProduct[] = items.map((i) => ({
        id: i.id,
        name: i.name,
        item_code: i.item_code,
        short_description: i.short_description,
        price: Number(i.selling_price || i.base_price || i.price || 0),
        base_price: Number(i.base_price || 0),
        selling_price: Number(i.selling_price || i.price || 0),
        category_id: i.category_id,
        category: i.category?.name || "",
        isVeg: Boolean(i.is_veg),
        is_veg: Boolean(i.is_veg),
        is_popular: Boolean(i.is_popular || i.is_bestseller),
        is_available: i.is_available !== false,
        branchId: String(branchId),
        raw_item_data: i,
        cachedAt: now,
      }));
      await offlineDB.cachedProducts.bulkPut(mappedItems);
    }

    if (categories && categories.length > 0) {
      const mappedCats: CachedCategory[] = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        code: c.code,
        sort_order: c.sort_order,
        branchId: String(branchId),
        cachedAt: now,
      }));
      await offlineDB.cachedCategories.bulkPut(mappedCats);
    }
  } catch (err) {
    console.warn("[Dexie] Catalog caching error:", err);
  }
}

/** Retrieve cached catalog for a branch during offline mode */
export async function getCachedCatalog(branchId: string): Promise<{ items: any[]; categories: any[] }> {
  try {
    const products = await offlineDB.cachedProducts.where("branchId").equals(String(branchId)).toArray();
    const categories = await offlineDB.cachedCategories.where("branchId").equals(String(branchId)).toArray();
    return {
      items: products.map((p) => p.raw_item_data || p),
      categories,
    };
  } catch (err) {
    console.warn("[Dexie] Error reading cached catalog:", err);
    return { items: [], categories: [] };
  }
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
