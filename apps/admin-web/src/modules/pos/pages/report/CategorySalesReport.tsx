import React, { useMemo } from "react";
import {
  Layers,
  Printer,
  Download,
  UtensilsCrossed,
  DollarSign,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { POSOrder, POSCategory, POSMenuItem } from "../../types";

interface CategorySalesReportProps {
  orders: POSOrder[];
  categories?: POSCategory[];
  menuItems?: POSMenuItem[];
  dateLabel?: string;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

const PALETTE = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export const CategorySalesReport: React.FC<CategorySalesReportProps> = ({
  orders,
  categories = [],
  menuItems = [],
  dateLabel = "Today",
}) => {
  // Map item ID or name to its category
  const itemToCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((m) => {
      const cat = categories.find((c) => String(c.id) === String(m.category_id));
      const catName = cat?.name || m.category || "General Menu";
      if (m.id) map.set(String(m.id), catName);
      if (m.name) map.set(m.name.trim().toLowerCase(), catName);
    });
    return map;
  }, [menuItems, categories]);

  // Aggregate sales by category
  const categoryStats = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        qty: number;
        revenue: number;
        itemCount: Set<string>;
      }
    > = {};

    let totalRev = 0;

    orders.forEach((o) => {
      if ((o.status || "").toLowerCase() === "cancelled") return;

      (o.items || []).forEach((i: any) => {
        const itemName = i.product_name || i.name || i.item_name || "Dish Item";
        const itemId = i.item_id || i.product_id;
        let catName =
          (itemId && itemToCategoryMap.get(String(itemId))) ||
          itemToCategoryMap.get(itemName.trim().toLowerCase()) ||
          i.category ||
          "Other Specialities";

        const qty = safeNum(i.quantity || 1);
        const price = safeNum(i.unit_price || i.price || 0);
        const rev = price * qty;
        totalRev += rev;

        if (!map[catName]) {
          map[catName] = {
            name: catName,
            qty: 0,
            revenue: 0,
            itemCount: new Set<string>(),
          };
        }

        map[catName].qty += qty;
        map[catName].revenue += rev;
        map[catName].itemCount.add(itemName);
      });
    });

    const list = Object.values(map)
      .map((c) => ({
        name: c.name,
        qty: c.qty,
        revenue: c.revenue,
        distinctItems: c.itemCount.size,
        percentage: totalRev > 0 ? (c.revenue / totalRev) * 100 : 0,
        avgPrice: c.qty > 0 ? c.revenue / c.qty : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      list,
      totalRevenue: totalRev,
      totalQty: list.reduce((s, c) => s + c.qty, 0),
      topCategory: list[0] || null,
    };
  }, [orders, itemToCategoryMap]);

  const handleExportCSV = () => {
    const headers = [
      "Category Name",
      "Distinct Dishes",
      "Total Quantity Sold",
      "Gross Revenue (INR)",
      "Sales Contribution (%)",
      "Avg Unit Price (INR)",
    ];
    const rows = categoryStats.list.map((c) => [
      `"${c.name}"`,
      c.distinctItems,
      c.qty,
      c.revenue.toFixed(2),
      c.percentage.toFixed(1) + "%",
      c.avgPrice.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `category_sales_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-primary" />
            Category-Wise Revenue Share & Contribution
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Analysis of menu categories, item velocity, and revenue share ({dateLabel})
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
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Top Category */}
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Top Performing Category
          </span>
          <span className="font-bold text-base text-foreground truncate block">
            {categoryStats.topCategory?.name || "N/A"}
          </span>
          <span className="text-[10px] text-primary font-mono font-medium">
            ₹{categoryStats.topCategory ? categoryStats.topCategory.revenue.toFixed(2) : "0.00"} (
            {categoryStats.topCategory?.percentage.toFixed(1)}% of total)
          </span>
        </div>

        {/* Categories Active */}
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Active Menu Categories
          </span>
          <span className="font-mono font-bold text-base text-foreground">
            {categoryStats.list.length} Categories
          </span>
          <span className="text-[10px] text-muted-foreground">
            Contributing to active bills
          </span>
        </div>

        {/* Category Items Volume */}
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Total Units Sold
          </span>
          <span className="font-mono font-bold text-base text-foreground">
            {categoryStats.totalQty} Portions
          </span>
          <span className="text-[10px] text-muted-foreground">Across all categories</span>
        </div>

        {/* Category Revenue */}
        <div className="bg-muted/40 border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-primary block">
            Net Category Revenue
          </span>
          <span className="font-mono font-bold text-lg text-primary">
            ₹{categoryStats.totalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Direct dish collections
          </span>
        </div>
      </div>

      {/* Category Chart Visualization */}
      {categoryStats.list.length > 0 && (
        <div className="bg-card border border-border rounded-md p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Category Revenue Comparison (Top Categories)
            </span>
            <span className="text-[10px] text-muted-foreground">Gross Sales in ₹</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryStats.list.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${safeNum(val).toFixed(2)}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {categoryStats.list.slice(0, 8).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PALETTE[index % PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Category Name</th>
              <th className="py-2.5 px-3 text-center">Dishes Sold</th>
              <th className="py-2.5 px-3 text-center">Total Quantity</th>
              <th className="py-2.5 px-3 text-right">Avg Unit Price</th>
              <th className="py-2.5 px-3 text-right">Gross Revenue</th>
              <th className="py-2.5 px-3 text-right">Share of Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {categoryStats.list.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">
                  No category sales recorded for the selected period.
                </td>
              </tr>
            ) : (
              categoryStats.list.map((cat, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                    />
                    {cat.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                    {cat.distinctItems} items
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-foreground">
                    {cat.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    ₹{cat.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    ₹{cat.revenue.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, cat.percentage))}%`,
                            backgroundColor: PALETTE[idx % PALETTE.length],
                          }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-foreground">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
