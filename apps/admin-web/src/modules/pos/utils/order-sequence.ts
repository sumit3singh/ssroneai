/**
 * SSR One AI - Zero-Wait POS Client Sequence & Idempotency Engine
 * Provides deterministic client-side order reference numbers, rolling daily tokens,
 * and cryptographically strong UUIDv4 idempotency keys for instant < 0.1ms generation.
 */

export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayPrefix(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}${mm}${yy}`;
}

/**
 * Returns helper for displaying order number on UI and receipts:
 * If order has daily_order_number (e.g. 1, 2, 3), returns String(daily_order_number)
 * If order_number is "270926-1" or "260927-1", extracts "1"
 * If order_number is "100060", returns "100060"
 */
export function getDisplayOrderNumber(order?: { order_number?: string; daily_order_number?: number | string | null; token_number?: string | null } | null): string {
  if (!order) return "";
  let res = "";
  if (order.daily_order_number !== undefined && order.daily_order_number !== null && String(order.daily_order_number).trim() !== "") {
    res = String(order.daily_order_number);
  } else if (order.token_number && /^\d+$/.test(String(order.token_number).replace(/^#/, ""))) {
    res = String(order.token_number).replace(/^#/, "");
  } else {
    const ordStr = String(order.order_number || "").replace(/^#/, "").trim();
    if (ordStr.includes("-")) {
      const parts = ordStr.split("-");
      if (parts.length === 2 && /^\d+$/.test(parts[1])) {
        res = parts[1];
      } else {
        res = ordStr;
      }
    } else {
      res = ordStr;
    }
  }
  return res.replace(/^#/, "").trim();
}

export function generateLocalOrderNumber(
  _branchId: number | string = 1,
  _orderMode: string = "dine_in"
): string {
  try {
    const today = getTodayDateStr();
    const lastDate = localStorage.getItem("pos_order_date");
    let nextSeq = 1;

    if (lastDate === today) {
      const saved = parseInt(localStorage.getItem("pos_daily_order_seq") || "0", 10);
      nextSeq = saved + 1;
    } else {
      localStorage.setItem("pos_order_date", today);
      nextSeq = 1;
    }

    localStorage.setItem("pos_daily_order_seq", nextSeq.toString());
    const prefix = getTodayPrefix();
    return `${prefix}-${nextSeq}`;
  } catch {
    return `${getTodayPrefix()}-1`;
  }
}

/**
 * Non-mutating preview of the upcoming daily order number (1, 2, 3...).
 * Use for UI rendering and modal props so that re-renders do NOT increment the sequence!
 */
export function peekNextLocalOrderNumber(): string {
  try {
    const today = getTodayDateStr();
    const lastDate = localStorage.getItem("pos_order_date");
    if (lastDate === today) {
      const saved = parseInt(localStorage.getItem("pos_daily_order_seq") || "0", 10);
      return (saved + 1).toString();
    }
    return "1";
  } catch {
    return "1";
  }
}

/**
 * Synchronize local order sequence counter with existing orders loaded from server for today.
 */
export function syncLocalOrderSequenceWithOrders(orders: Array<{ order_number?: string; daily_order_number?: number | null; created_at?: string }>): void {
  try {
    const today = getTodayDateStr();
    let maxSeq = 0;

    for (const ord of orders) {
      if (ord.created_at) {
        const ordDate = ord.created_at.slice(0, 10);
        if (ordDate !== today) continue;
      }

      if (ord.daily_order_number && typeof ord.daily_order_number === "number" && ord.daily_order_number > maxSeq) {
        maxSeq = ord.daily_order_number;
      } else if (ord.order_number) {
        if (ord.order_number.includes("-")) {
          const parts = ord.order_number.split("-");
          const val = parseInt(parts[1], 10);
          if (!isNaN(val) && val > maxSeq) maxSeq = val;
        } else if (/^\d+$/.test(ord.order_number)) {
          const val = parseInt(ord.order_number, 10);
          if (!isNaN(val) && val < 10000 && val > maxSeq) {
            maxSeq = val;
          }
        }
      }
    }

    localStorage.setItem("pos_order_date", today);
    if (maxSeq > 0) {
      localStorage.setItem("pos_daily_order_seq", maxSeq.toString());
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

export function generateDailyTokenNumber(): string {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem("pos_token_date");
    let currentToken = 1;

    if (lastDate === today) {
      const savedCount = parseInt(localStorage.getItem("pos_daily_token_count") || "0", 10);
      currentToken = savedCount + 1;
    } else {
      localStorage.setItem("pos_token_date", today);
      currentToken = 1;
    }

    localStorage.setItem("pos_daily_token_count", currentToken.toString());
    return String(currentToken);
  } catch {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return String(randomNum);
  }
}

