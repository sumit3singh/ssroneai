import React from "react";
import { POSOrder } from "../../types";

interface POSReportThermalSlipProps {
  orders: POSOrder[];
  branchName?: string;
  cashierName?: string;
  dateLabel: string;
  openingFloat: number;
  pettyCash: number;
  actualCashCounted: number;
}

export const POSReportThermalSlip: React.FC<POSReportThermalSlipProps> = ({
  orders,
  branchName = "Baithak Cafe (CUH)",
  cashierName = "Admin Cashier",
  dateLabel,
  openingFloat,
  pettyCash,
  actualCashCounted,
}) => {
  const safeNum = (v: any) => {
    if (!v) return 0;
    const n = typeof v === "number" ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const completedOrders = orders.filter(
    (o) => (o.status || "").toLowerCase() !== "cancelled"
  );
  const cancelledOrders = orders.filter(
    (o) => (o.status || "").toLowerCase() === "cancelled"
  );

  const grossSales = completedOrders.reduce((s, o) => s + safeNum(o.subtotal || o.net_amount || 0), 0);
  const totalTax = completedOrders.reduce((s, o) => s + safeNum(o.tax_amount || 0), 0);
  const totalDiscounts = completedOrders.reduce((s, o) => s + safeNum(o.discount_amount || 0), 0);
  const netSales = completedOrders.reduce((s, o) => s + safeNum(o.net_amount || 0), 0);

  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  let debtSales = 0;

  completedOrders.forEach((o: any) => {
    const net = safeNum(o.net_amount || o.grand_total || 0);
    const isUnpaid = (o.payment_status || "").toLowerCase() === "unpaid";
    const isPartial = (o.payment_status || "").toLowerCase() === "partial";
    const hasBalanceDue = safeNum(o.balance_due) > 0;

    let paid = 0;
    let due = 0;

    if (o.amount_paid !== undefined && o.amount_paid !== null) {
      paid = safeNum(o.amount_paid);
    } else {
      paid = isUnpaid ? 0 : net;
    }

    if (hasBalanceDue) {
      due = safeNum(o.balance_due);
    } else if (isUnpaid) {
      due = net;
    } else if (isPartial) {
      due = Math.max(0, net - paid);
    }

    if (due > 0) {
      debtSales += due;
    }

    if (paid > 0) {
      const pm = (o.payment_method || "CASH").toUpperCase();
      if (pm.includes("UPI") || pm.includes("QR") || pm.includes("GPAY") || pm.includes("PAYTM") || pm.includes("PHONEPE")) {
        upiSales += paid;
      } else if (pm.includes("CARD")) {
        cardSales += paid;
      } else {
        cashSales += paid;
      }
    }
  });

  const settlementConcessions = completedOrders.reduce((s, o: any) => {
    return s + safeNum(o.metadata_payload?.settlement_discount || 0);
  }, 0);

  const expectedCash = openingFloat + cashSales - pettyCash;
  const cashDiscrepancy = actualCashCounted - expectedCash;

  const nowStr = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="hidden print:block font-mono text-black bg-white p-4 max-w-[320px] mx-auto text-xs leading-tight">
      {/* Header */}
      <div className="text-center space-y-1 mb-3">
        <h2 className="font-bold text-base uppercase tracking-wider">{branchName}</h2>
        <p className="text-[10px] uppercase">SSR ONE AI - POS ENTERPRISE V2.0</p>
        <p className="font-bold text-sm border-y border-dashed border-black py-1 my-1">
          DAILY POS Z-REPORT (DAY CLOSE)
        </p>
        <p className="text-[10px]">Generated: {nowStr}</p>
        <p className="text-[10px]">Report Period: {dateLabel}</p>
        <p className="text-[10px]">Cashier / Operator: {cashierName}</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Transaction Volumes */}
      <div className="space-y-1 my-2">
        <div className="flex justify-between">
          <span>Settled Bills:</span>
          <span className="font-bold">{completedOrders.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Cancelled Bills:</span>
          <span className="font-bold">{cancelledOrders.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Average Ticket Size:</span>
          <span>₹{completedOrders.length > 0 ? (netSales / completedOrders.length).toFixed(2) : "0.00"}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Financial Summary */}
      <div className="space-y-1 my-2">
        <div className="flex justify-between">
          <span>Gross Subtotal:</span>
          <span>₹{grossSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discounts Given:</span>
          <span>-₹{totalDiscounts.toFixed(2)}</span>
        </div>
        {settlementConcessions > 0 && (
          <div className="flex justify-between text-[10px]">
            <span>(Underpay Concessions):</span>
            <span>-₹{settlementConcessions.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Taxes Collected:</span>
          <span>+₹{totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-black pt-1">
          <span>NET REALIZED SALES:</span>
          <span>₹{netSales.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Payment Modes */}
      <div className="space-y-1 my-2">
        <p className="font-bold uppercase text-[11px]">Payment Collections:</p>
        <div className="flex justify-between">
          <span>• Cash Collections:</span>
          <span className="font-bold">₹{cashSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>• UPI / QR Collections:</span>
          <span className="font-bold">₹{upiSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>• Card Collections:</span>
          <span className="font-bold">₹{cardSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>• Customer Debt (Udhar):</span>
          <span className="font-bold">₹{debtSales.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Cash Drawer Reconciliation */}
      <div className="space-y-1 my-2">
        <p className="font-bold uppercase text-[11px]">Cash Drawer Audit:</p>
        <div className="flex justify-between">
          <span>Opening Float:</span>
          <span>₹{openingFloat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>+ Cash Sales:</span>
          <span>₹{cashSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>- Petty Cash / Paid Out:</span>
          <span>₹{pettyCash.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-dashed border-black pt-0.5">
          <span>Expected Cash in Drawer:</span>
          <span>₹{expectedCash.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Actual Physical Cash:</span>
          <span className="font-bold">₹{actualCashCounted.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xs pt-1">
          <span>Discrepancy (Over/Short):</span>
          <span>
            {cashDiscrepancy >= 0
              ? `+₹${cashDiscrepancy.toFixed(2)} (OK)`
              : `-₹${Math.abs(cashDiscrepancy).toFixed(2)} (SHORT)`}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-4" />

      {/* Sign-off Blocks */}
      <div className="pt-6 space-y-6 text-[10px]">
        <div className="border-t border-black pt-1 flex justify-between">
          <span>Cashier Signature</span>
          <span>Manager / Audit Sign-off</span>
        </div>
        <p className="text-center italic text-[9px]">
          *** END OF DAY Z-REPORT ***
        </p>
      </div>
    </div>
  );
};
