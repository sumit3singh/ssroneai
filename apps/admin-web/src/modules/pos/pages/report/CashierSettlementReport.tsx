import React, { useMemo, useState } from "react";
import {
  DollarSign,
  Printer,
  Download,
  CreditCard,
  QrCode,
  Coins,
  Receipt,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Lock,
  BookOpen,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";
import { POSReportThermalSlip } from "./POSReportThermalSlip";

interface CashierSettlementReportProps {
  orders: POSOrder[];
  dateLabel?: string;
  branchName?: string;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const CashierSettlementReport: React.FC<CashierSettlementReportProps> = ({
  orders,
  dateLabel = "Today",
  branchName = "Baithak Cafe (CUH)",
}) => {
  // Cash Drawer Reconciliation State
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [pettyCash, setPettyCash] = useState<number>(0);
  const [actualCashCounted, setActualCashCounted] = useState<number>(2000);
  const [cashierName, setCashierName] = useState<string>("Admin Cashier");

  const validOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.status || "").toLowerCase() !== "cancelled"
    );
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.status || "").toLowerCase() === "cancelled"
    );
  }, [orders]);

  const getOrderNet = (o: POSOrder) =>
    safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);

  // Payment Breakdown
  const cashSales = useMemo(() => {
    return validOrders
      .filter((o) => (o.payment_method || "CASH").toUpperCase() === "CASH")
      .reduce((s, o) => s + (o.amount_paid !== undefined && o.amount_paid !== null ? Number(o.amount_paid) : getOrderNet(o)), 0);
  }, [validOrders]);

  const upiSales = useMemo(() => {
    return validOrders
      .filter((o) => {
        const pm = (o.payment_method || "").toUpperCase();
        return pm === "UPI" || pm === "QR";
      })
      .reduce((s, o) => s + (o.amount_paid !== undefined && o.amount_paid !== null ? Number(o.amount_paid) : getOrderNet(o)), 0);
  }, [validOrders]);

  const cardSales = useMemo(() => {
    return validOrders
      .filter((o) => (o.payment_method || "").toUpperCase() === "CARD")
      .reduce((s, o) => s + (o.amount_paid !== undefined && o.amount_paid !== null ? Number(o.amount_paid) : getOrderNet(o)), 0);
  }, [validOrders]);

  const debtSales = useMemo(() => {
    return validOrders.reduce((s, o) => {
      const bal = safeNum(o.balance_due);
      if (bal > 0) return s + bal;
      const pm = (o.payment_method || "").toUpperCase();
      if (pm === "CREDIT_ACCOUNT" || pm === "DEBT") return s + getOrderNet(o);
      return s;
    }, 0);
  }, [validOrders]);

  const totalSettlementConcessions = useMemo(() => {
    return validOrders.reduce((sum, o: any) => {
      const disc = safeNum(o.metadata_payload?.settlement_discount || 0);
      return sum + disc;
    }, 0);
  }, [validOrders]);

  const totalSales = cashSales + upiSales + cardSales + debtSales;

  // Drawer Reconciliation
  const expectedCashInDrawer = openingFloat + cashSales - pettyCash;
  const discrepancy = actualCashCounted - expectedCashInDrawer;
  const isExactOrSurplus = discrepancy >= 0;

  // Initialize actual cash counted to expected on first calculate if at default
  React.useEffect(() => {
    if (actualCashCounted === 2000 && expectedCashInDrawer !== 2000) {
      setActualCashCounted(expectedCashInDrawer);
    }
  }, [expectedCashInDrawer]);

  const handleExportCSV = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Report Date", `"${dateLabel}"`],
      ["Branch Name", `"${branchName}"`],
      ["Cashier / Operator", `"${cashierName}"`],
      ["Total Valid Orders", validOrders.length],
      ["Total Cancelled Orders", cancelledOrders.length],
      ["Total Invoiced / Realized Sales (INR)", totalSales.toFixed(2)],
      ["Cash Sales (INR)", cashSales.toFixed(2)],
      ["UPI / QR Sales (INR)", upiSales.toFixed(2)],
      ["Card Sales (INR)", cardSales.toFixed(2)],
      ["Customer Debt / Udhar (INR)", debtSales.toFixed(2)],
      ["Settlement Concessions / Underpayment Round-Offs (INR)", totalSettlementConcessions.toFixed(2)],
      ["Opening Cash Float (INR)", openingFloat.toFixed(2)],
      ["Petty Cash Payouts (INR)", pettyCash.toFixed(2)],
      ["Expected Cash in Drawer (INR)", expectedCashInDrawer.toFixed(2)],
      ["Actual Cash Counted (INR)", actualCashCounted.toFixed(2)],
      ["Cash Variance / Discrepancy (INR)", discrepancy.toFixed(2)],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cashier_settlement_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calculator size={14} className="text-primary" />
            Cashier Shift Closeout & Official Z-Report
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Cash drawer balance reconciliation and end-of-shift payment settlements ({dateLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={handleExportCSV}
          >
            <Download size={13} /> Export CSV
          </Button>
          <Button
            size="sm"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7 bg-primary text-primary-foreground"
            onClick={handlePrintZReport}
          >
            <Printer size={13} /> Print Thermal Z-Report
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Cash Realization */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Cash Realization
            </span>
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins size={14} />
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{cashSales.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {validOrders.filter((o) => (o.payment_method || "CASH").toUpperCase() === "CASH").length} Cash Bills
          </span>
        </div>

        {/* UPI / QR Realization */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              UPI / QR Realization
            </span>
            <div className="p-1 rounded bg-primary/10 text-primary">
              <QrCode size={14} />
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{upiSales.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">Direct Bank Settlements</span>
        </div>

        {/* Card Realization */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Card Realization
            </span>
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CreditCard size={14} />
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{cardSales.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">POS EDC Terminals</span>
        </div>

        {/* Customer Debt / Udhar Realization */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Debt / Udhar Invoiced
            </span>
            <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen size={14} />
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">
            ₹{debtSales.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">Credit Ledger Accounts</span>
        </div>

        {/* Net Realized Turnover */}
        <div className="bg-muted/40 border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-primary block">
              Total Realized Sales
            </span>
            <Receipt size={14} className="text-primary" />
          </div>
          <span className="font-mono font-bold text-xl text-primary">
            ₹{totalSales.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {validOrders.length} Invoices Settled
          </span>
        </div>
      </div>

      {/* Cash Drawer Reconciliation Interactive Panel */}
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={13} className="text-primary" />
            Physical Cash Drawer Audit & Variance Calculation
          </h4>
          <span className="text-[10px] text-muted-foreground">
            Shift Operator: <input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px] font-medium text-foreground w-28 ml-1"
            />
          </span>
        </div>

        {totalSettlementConcessions > 0 && (
          <div className="text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-md flex items-center justify-between">
            <span>⚡ Underpayment Settlement Concessions (Discounts adjusted to close bills e.g. ₹240 → ₹200):</span>
            <span className="font-mono font-bold">₹{totalSettlementConcessions.toFixed(2)}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1: Opening Float */}
          <div className="bg-muted/30 border border-border rounded-md p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              1. Opening Cash Float
            </span>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground font-mono mr-1">₹</span>
              <input
                type="number"
                min="0"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(safeNum(e.target.value))}
                className="w-full bg-background border border-border rounded px-2 py-1 text-sm font-mono font-bold text-foreground"
              />
            </div>
            <p className="text-[9px] text-muted-foreground">Initial cash at shift start</p>
          </div>

          {/* Step 2: Cash Inflow */}
          <div className="bg-muted/30 border border-border rounded-md p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              2. Cash Sales Inflow
            </span>
            <div className="py-1">
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +₹{cashSales.toFixed(2)}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground">Auto-calculated from bills</p>
          </div>

          {/* Step 3: Petty Cash Outflow */}
          <div className="bg-muted/30 border border-border rounded-md p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              3. Petty Cash / Paid Out
            </span>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground font-mono mr-1">₹</span>
              <input
                type="number"
                min="0"
                value={pettyCash}
                onChange={(e) => setPettyCash(safeNum(e.target.value))}
                className="w-full bg-background border border-border rounded px-2 py-1 text-sm font-mono font-bold text-destructive"
              />
            </div>
            <p className="text-[9px] text-muted-foreground">Expenses or vendor payouts</p>
          </div>

          {/* Step 4: Expected Drawer Balance */}
          <div className="bg-muted/50 border border-border rounded-md p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-foreground block">
              4. Expected in Drawer
            </span>
            <div className="py-1">
              <span className="text-base font-mono font-bold text-foreground">
                ₹{expectedCashInDrawer.toFixed(2)}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground">Float + Cash - Payouts</p>
          </div>

          {/* Step 5: Actual Counted Cash */}
          <div className="bg-background border-2 border-primary/40 rounded-md p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-primary block">
              5. Actual Physical Cash
            </span>
            <div className="flex items-center">
              <span className="text-xs text-primary font-mono mr-1">₹</span>
              <input
                type="number"
                min="0"
                value={actualCashCounted}
                onChange={(e) => setActualCashCounted(safeNum(e.target.value))}
                className="w-full bg-background border border-primary/40 rounded px-2 py-1 text-sm font-mono font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-[9px] text-muted-foreground">Counted notes & coins</p>
          </div>
        </div>

        {/* Discrepancy Status Banner */}
        <div
          className={`p-3 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
            discrepancy === 0
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : discrepancy > 0
              ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {isExactOrSurplus ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <div>
              <span className="text-xs font-semibold uppercase">
                {discrepancy === 0
                  ? "Cash Drawer Perfectly Balanced (Zero Variance)"
                  : discrepancy > 0
                  ? "Cash Drawer Surplus / Overage"
                  : "Cash Drawer Shortage Detected"}
              </span>
              <p className="text-[11px] opacity-90">
                {discrepancy === 0
                  ? "Physical counted cash matches expected calculations to the rupee."
                  : discrepancy > 0
                  ? `Physical cash exceeds book balance by ₹${discrepancy.toFixed(2)}.`
                  : `Drawer is short by ₹${Math.abs(discrepancy).toFixed(2)}. Verify void receipts or unrecorded payouts.`}
              </p>
            </div>
          </div>

          <div className="font-mono font-bold text-base whitespace-nowrap self-end sm:self-auto">
            {discrepancy >= 0
              ? `+₹${discrepancy.toFixed(2)}`
              : `-₹${Math.abs(discrepancy).toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* Hidden Component That Renders Only When Printing (Thermal 80mm Z-Report) */}
      <POSReportThermalSlip
        orders={orders}
        branchName={branchName}
        cashierName={cashierName}
        dateLabel={dateLabel}
        openingFloat={openingFloat}
        pettyCash={pettyCash}
        actualCashCounted={actualCashCounted}
      />
    </div>
  );
};
