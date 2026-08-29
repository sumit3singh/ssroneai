/**
 * Offline Database Synchronization Engine
 * Captures offline transactions into local queue and syncs to PostgreSQL database on reconnect.
 */
import { api } from "@ssrone/api-client";

export interface PendingOfflineAction {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  payload: unknown;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = "ssrone_offline_sync_queue";

export const getOfflineQueue = (): PendingOfflineAction[] => {
  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  payload: unknown
): PendingOfflineAction => {
  const queue = getOfflineQueue();
  const newAction: PendingOfflineAction = {
    id: `OFFLINE_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    endpoint,
    method,
    payload,
    timestamp: Date.now(),
  };

  queue.push(newAction);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newAction;
};

export const syncOfflineQueueToDatabase = async (): Promise<{
  syncedCount: number;
  failedCount: number;
}> => {
  if (!navigator.onLine) return { syncedCount: 0, failedCount: 0 };

  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

  let syncedCount = 0;
  let failedCount = 0;
  const remainingQueue: PendingOfflineAction[] = [];

  for (const action of queue) {
    try {
      if (action.method === "POST") {
        await api.post(action.endpoint, action.payload);
      } else if (action.method === "PUT") {
        await api.put(action.endpoint, action.payload);
      } else if (action.method === "PATCH") {
        await api.patch(action.endpoint, action.payload);
      } else if (action.method === "DELETE") {
        await api.delete(action.endpoint);
      }
      syncedCount++;
    } catch {
      failedCount++;
      remainingQueue.push(action);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  return { syncedCount, failedCount };
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineQueueToDatabase();
  });
}
