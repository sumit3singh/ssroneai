import React from "react";
import { Utensils, Printer } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSOrder } from "../types";

interface ItemSalesReportProps {
  orders: POSOrder[];
}

export const ItemSalesReport: React.FC<ItemSalesReportProps> = ({ orders }) => {
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};

  orders.forEach((o) => {
    o.items.forEach((i) => {
      if (!itemMap[i.name]) {
        itemMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
      }
      itemMap[i.name].qty += i.quantity;
      itemMap[i.name].revenue += i.unit_price * i.quantity;
    });
  });

  const sortedItems = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          Item & Dish Sales Analytics
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1">
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
                <td className="p-2.5 text-right font-mono font-black text-foreground">₹{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
