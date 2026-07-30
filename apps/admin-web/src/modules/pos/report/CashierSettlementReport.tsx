import React from "react";
import { DollarSign, Printer } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSOrder } from "../types";

interface CashierSettlementReportProps {
  orders: POSOrder[];
}

export const CashierSettlementReport: React.FC<CashierSettlementReportProps> = ({ orders }) => {
  const cashSales = orders.filter((o) => o.payment_method === "CASH").reduce((s, o) => s + o.net_amount, 0);
  const upiSales = orders.filter((o) => o.payment_method === "UPI").reduce((s, o) => s + o.net_amount, 0);
  const cardSales = orders.filter((o) => o.payment_method === "CARD").reduce((s, o) => s + o.net_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          Cashier & Payment Mode Settlement Report
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1">
          <Printer size={13} /> Print Settlement
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Cash Collected</span>
          <span className="font-mono font-black text-base text-foreground">₹{cashSales}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">UPI / QR Realization</span>
          <span className="font-mono font-black text-base text-blue-600 dark:text-blue-400">₹{upiSales}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Card Realization</span>
          <span className="font-mono font-black text-base text-purple-600 dark:text-purple-400">₹{cardSales}</span>
        </div>
      </div>
    </div>
  );
};
