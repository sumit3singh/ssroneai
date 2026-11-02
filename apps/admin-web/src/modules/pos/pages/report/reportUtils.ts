/**
 * SSR ONE AI - Enterprise POS Reports Utilities & Audit Integrity Engine
 * 
 * SSOT for order cancellations, voided items, and financial aggregations.
 * Guarantees zero-leakage of cancelled orders or voided dishes into live revenue,
 * tax ledgers, debt receivables, or kitchen metrics.
 */

export const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

/**
 * Validates whether an order is cancelled, voided, refunded, or deleted.
 */
export const isCancelledOrder = (o: any): boolean => {
  if (!o) return true;
  if (o.is_deleted === true || o.is_cancelled === true) return true;
  const st = String(o.status || "").toLowerCase().trim();
  return (
    st === "cancelled" ||
    st === "void" ||
    st === "voided" ||
    st === "refunded"
  );
};

/**
 * Validates whether a line item is voided or cancelled at POS/KDS.
 */
export const isVoidedItem = (it: any): boolean => {
  if (!it) return true;
  if (it.is_voided === true || it.is_cancelled === true) return true;
  const st = String(it.status || "").toLowerCase().trim();
  if (st === "cancelled" || st === "void" || st === "voided") return true;
  const kdsSt = String(it.kds_status || "").toLowerCase().trim();
  if (kdsSt === "cancelled" || kdsSt === "void" || kdsSt === "voided") return true;
  return false;
};

/**
 * Calculates net payable amount for an order with resilient multi-field fallback.
 */
export const getOrderNet = (o: any): number => {
  if (!o) return 0;
  return safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);
};

export const getOrderSub = (o: any): number => {
  if (!o) return 0;
  return safeNum(o.subtotal ?? (safeNum(o.grand_total) - safeNum(o.tax_amount) + safeNum(o.discount_amount)));
};

export const getOrderTax = (o: any): number => {
  if (!o) return 0;
  return safeNum(o.tax_amount ?? (safeNum(o.cgst_amount) + safeNum(o.sgst_amount)));
};

export const getOrderDisc = (o: any): number => {
  if (!o) return 0;
  return safeNum(o.discount_amount ?? 0);
};
