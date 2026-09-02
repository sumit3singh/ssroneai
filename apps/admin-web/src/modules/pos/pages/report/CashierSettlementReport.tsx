import React from "react";
import { DollarSign, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface CashierSettlementReportProps {
  orders: POSOrder[];
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const CashierSettlementReport: React.FC<CashierSettlementReportProps> = ({ orders }) => {
  const getOrderNet = (o: POSOrder) => safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);

  const cashSales = orders
    .filter((o) => (o.payment_method || "CASH").toUpperCase() === "CASH")
    .reduce((s, o) => s + getOrderNet(o), 0);

  const upiSales = orders
    .filter((o) => (o.payment_method || "").toUpperCase() === "UPI" || (o.payment_method || "").toUpperCase() === "QR")
    .reduce((s, o) => s + getOrderNet(o), 0);

  const cardSales = orders
    .filter((o) => (o.payment_method || "").toUpperCase() === "CARD")
    .reduce((s, o) => s + getOrderNet(o), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Cashier & Payment Mode Settlement Report
        </h3>
        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 cursor-pointer" onClick={() => window.print()}>
          <Printer size={13} /> Print Settlement
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Cash Collected</span>
          <span className="font-mono font-bold text-lg text-foreground">₹{cashSales.toFixed(2)}</span>
        </div>
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">UPI / QR Realization</span>
          <span className="font-mono font-bold text-lg text-foreground">₹{upiSales.toFixed(2)}</span>
        </div>
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Card Realization</span>
          <span className="font-mono font-bold text-lg text-foreground">₹{cardSales.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
