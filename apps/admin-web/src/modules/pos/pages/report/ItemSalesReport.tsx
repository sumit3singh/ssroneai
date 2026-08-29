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
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          Item & Dish Sales Analytics
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1" onClick={() => window.print()}>
          <Printer size={13} /> Print Item Report
        </Button>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[10px] font-black uppercase text-muted-foreground">
              <th className="p-2.5">Dish Name</th>
              <th className="p-2.5 text-center">Total Quantity Sold</th>
              <th className="p-2.5 text-right">Gross Item Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
            {sortedItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10">
                <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                <td className="p-2.5 text-center font-mono font-bold">{item.qty}</td>
                <td className="p-2.5 text-right font-mono font-black text-foreground">₹{item.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
