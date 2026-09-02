import React from "react";
import { Utensils, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface ItemSalesReportProps {
  orders: POSOrder[];
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const ItemSalesReport: React.FC<ItemSalesReportProps> = ({ orders }) => {
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};

  orders.forEach((o) => {
    (o.items || []).forEach((i: any) => {
      const name = i.product_name || i.name || i.item_name || "Dish Item";
      const qty = safeNum(i.quantity);
      const price = safeNum(i.unit_price || i.price);
      if (!itemMap[name]) {
        itemMap[name] = { name, qty: 0, revenue: 0 };
      }
      itemMap[name].qty += qty;
      itemMap[name].revenue += price * qty;
    });
  });

  const sortedItems = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Item & Dish Sales Analytics
        </h3>
        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 cursor-pointer" onClick={() => window.print()}>
          <Printer size={13} /> Print Item Report
        </Button>
      </div>

      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Dish Name</th>
              <th className="py-2.5 px-3 text-center">Total Quantity Sold</th>
              <th className="py-2.5 px-3 text-right">Gross Item Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground font-medium">
                  No item sales data available.
                </td>
              </tr>
            ) : (
              sortedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground">{item.name}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">{item.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">₹{item.revenue.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
