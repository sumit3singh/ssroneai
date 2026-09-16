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

export function getTodayDDMMYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

export function generateLocalOrderNumber(
  _branchId: number | string = 1,
  _orderMode: string = "dine_in"
): string {
  const ddmmyy = getTodayDDMMYY();

  try {
    const lastDate = localStorage.getItem("pos_order_seq_date");
    let currentSeq = 1;

    if (lastDate === ddmmyy) {
      const savedCount = parseInt(localStorage.getItem("pos_daily_order_seq") || "0", 10);
      currentSeq = savedCount + 1;
    } else {
      localStorage.setItem("pos_order_seq_date", ddmmyy);
      currentSeq = 1;
    }

    localStorage.setItem("pos_daily_order_seq", currentSeq.toString());
    return `${ddmmyy}${String(currentSeq).padStart(3, "0")}`;
  } catch {
    return `${ddmmyy}001`;
  }
}

/**
 * Synchronize local order sequence counter with existing orders loaded from server.
 * Ensures that if orders like 150926005 exist on the server, local counter advances past 5.
 */
export function syncLocalOrderSequenceWithOrders(orders: Array<{ order_number?: string }>): void {
  try {
    const ddmmyy = getTodayDDMMYY();
    let maxSeq = 0;

    for (const ord of orders) {
      const numStr = ord?.order_number;
      if (numStr && numStr.startsWith(ddmmyy) && numStr.length >= 9 && /^\d+$/.test(numStr)) {
        const seqVal = parseInt(numStr.slice(ddmmyy.length), 10);
        if (!isNaN(seqVal) && seqVal > maxSeq) {
          maxSeq = seqVal;
        }
      }
    }

    if (maxSeq > 0) {
      const savedCount = parseInt(localStorage.getItem("pos_daily_order_seq") || "0", 10);
      if (maxSeq > savedCount) {
        localStorage.setItem("pos_order_seq_date", ddmmyy);
        localStorage.setItem("pos_daily_order_seq", maxSeq.toString());
      }
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
    return `#${String(currentToken).padStart(3, "0")}`;
  } catch {
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `#${randomNum}`;
  }
}

