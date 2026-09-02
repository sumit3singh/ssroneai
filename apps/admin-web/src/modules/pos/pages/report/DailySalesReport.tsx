import React from "react";
import { TrendingUp, DollarSign, Calendar, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface DailySalesReportProps {
  orders: POSOrder[];
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const DailySalesReport: React.FC<DailySalesReportProps> = ({ orders }) => {
  const getOrderNet = (o: POSOrder) => safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);
  const getOrderSub = (o: POSOrder) => safeNum(o.subtotal ?? 0);
  const getOrderTax = (o: POSOrder) => safeNum(o.tax_amount ?? 0);
  const getOrderDisc = (o: POSOrder) => safeNum(o.discount_amount ?? 0);

  const totalNet = orders.reduce((sum, o) => sum + getOrderNet(o), 0);
  const totalSub = orders.reduce((sum, o) => sum + getOrderSub(o), 0);
  const totalTax = orders.reduce((sum, o) => sum + getOrderTax(o), 0);
  const totalDisc = orders.reduce((sum, o) => sum + getOrderDisc(o), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Daily Sales & Revenue Report
        </h3>
        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 cursor-pointer" onClick={() => window.print()}>
          <Printer size={13} /> Print Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Gross Subtotal</span>
          <span className="font-mono font-bold text-base text-foreground">₹{totalSub.toFixed(2)}</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">GST Tax Collected</span>
          <span className="font-mono font-bold text-base text-foreground">₹{totalTax.toFixed(2)}</span>
        </div>
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-muted-foreground block">Discounts Granted</span>
          <span className="font-mono font-bold text-base text-foreground">₹{totalDisc.toFixed(2)}</span>
        </div>
        <div className="bg-muted/50 border border-border p-3 rounded-md space-y-1">
          <span className="text-[11px] uppercase font-semibold text-primary block">Net Cash Realization</span>
          <span className="font-mono font-bold text-lg text-primary">₹{totalNet.toFixed(2)}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Bill #</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Order Type</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                  No sales orders recorded today.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-foreground">#{o.order_number}</td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono">{new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="py-2.5 px-3 text-foreground font-medium">{o.order_type || o.order_mode || "DINE_IN"}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-foreground">{o.payment_method || "CASH"}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">₹{getOrderNet(o).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
