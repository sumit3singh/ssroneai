/**
 * SSR One AI POS - Offline Order Queue Manager
 * Buffers orders taken while offline and auto-syncs when online connection is restored.
 */
import { toast } from "sonner";
import { api } from "@ssrone/api-client";


const QUEUE_STORAGE_KEY = "ssrone_pos_offline_queue_v1";

export interface OfflineOrderPayload {
  localId: string;
  timestamp: string;
  branch_id: string;
  order_type: string;
  source_channel: string;
  items: Array<{
    product_id?: string;
    menu_item_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    modifiers?: any[];
  }>;
  notes?: string;
}

export class OfflineQueueManager {
  private static getQueue(): OfflineOrderPayload[] {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading offline queue", e);
      return [];
    }
  }

  private static saveQueue(queue: OfflineOrderPayload[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("Error saving offline queue", e);
    }
  }

  public static enqueueOrder(order: Omit<OfflineOrderPayload, "localId" | "timestamp">): OfflineOrderPayload {
    const queue = this.getQueue();
    const payload: OfflineOrderPayload = {
      ...order,
      localId: `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    queue.push(payload);
    this.saveQueue(queue);
    toast.warning(`Network offline: Order saved locally (#${payload.localId})`);
    return payload;
  }

  public static getPendingCount(): number {
    return this.getQueue().length;
  }

  public static async syncPendingOrders(): Promise<{ synced: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    toast.info(`Syncing ${queue.length} offline order(s)...`);
    let synced = 0;
    let failed = 0;
    const remaining: OfflineOrderPayload[] = [];

    for (const item of queue) {
      try {
        await api.post("/orders/", {
          branch_id: item.branch_id,
          order_type: item.order_type,
          source_channel: item.source_channel || "pos",
          items: item.items,
          notes: item.notes ? `[Synced from offline #${item.localId}] ${item.notes}` : `[Synced from offline #${item.localId}]`,
        });
        synced++;
      } catch (err) {
        console.error(`Failed to sync offline order ${item.localId}`, err);
        failed++;
        remaining.push(item);
      }
    }

    this.saveQueue(remaining);
    if (synced > 0) {
      toast.success(`Successfully synced ${synced} offline order(s)!`);
    }
    if (failed > 0) {
      toast.error(`Failed to sync ${failed} order(s). Retrying automatically.`);
    }

    return { synced, failed };
  }

  public static initAutoSync(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      toast.success("Connection restored! Initiating offline queue sync.");
      void this.syncPendingOrders();
    });
  }
}
