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
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          Daily Sales & Revenue Report
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1" onClick={() => window.print()}>
          <Printer size={13} /> Print Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Gross Subtotal</span>
          <span className="font-mono font-black text-sm text-foreground">₹{totalSub.toFixed(2)}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">GST Tax Collected</span>
          <span className="font-mono font-black text-sm text-foreground">₹{totalTax.toFixed(2)}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Discounts Granted</span>
          <span className="font-mono font-black text-sm text-foreground">₹{totalDisc.toFixed(2)}</span>
        </div>
        <div className="bg-primary/10 border border-primary/30 p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-primary block">Net Cash Realization</span>
          <span className="font-mono font-black text-base text-primary">₹{totalNet.toFixed(2)}</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[10px] font-black uppercase text-muted-foreground">
              <th className="p-2.5">Bill #</th>
              <th className="p-2.5">Time</th>
              <th className="p-2.5">Order Type</th>
              <th className="p-2.5">Payment</th>
              <th className="p-2.5 text-right">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/10">
                <td className="p-2.5 font-mono font-bold text-foreground">#{o.order_number}</td>
                <td className="p-2.5">{new Date(o.created_at || Date.now()).toLocaleTimeString()}</td>
                <td className="p-2.5">{o.order_type || o.order_mode || "DINE_IN"}</td>
                <td className="p-2.5 font-bold text-foreground">{o.payment_method || "CASH"}</td>
                <td className="p-2.5 text-right font-mono font-black text-foreground">₹{getOrderNet(o).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
