import React, { useMemo, useState } from "react";
import {
  Utensils,
  Printer,
  Download,
  Search,
  ArrowUpDown,
  Filter,
  Flame,
  Award,
  CircleDot,
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

interface ItemSalesReportProps {
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

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#6366F1",
];

export const ItemSalesReport: React.FC<ItemSalesReportProps> = ({
  orders,
  categories = [],
  menuItems = [],
  dateLabel = "Today",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [vegFilter, setVegFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [sortBy, setSortBy] = useState<"revenue" | "qty">("revenue");

  // Map item details from catalog
  const menuItemLookup = useMemo(() => {
    const map = new Map<string, POSMenuItem>();
    menuItems.forEach((m) => {
      if (m.id) map.set(String(m.id), m);
      if (m.name) map.set(m.name.trim().toLowerCase(), m);
    });
    return map;
  }, [menuItems]);

  const categoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(String(c.id), c.name);
    });
    return map;
  }, [categories]);

  // Aggregate dish sales from orders
  const itemAnalytics = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        qty: number;
        revenue: number;
        categoryName: string;
        isVeg: boolean;
      }
    > = {};

    let grandTotalRevenue = 0;
    let grandTotalQty = 0;

    orders.forEach((o) => {
      if ((o.status || "").toLowerCase() === "cancelled") return;

      (o.items || []).forEach((i: any) => {
        const name = i.product_name || i.name || i.item_name || "Dish Item";
        const id = i.item_id || i.product_id;
        const catalogItem =
          (id && menuItemLookup.get(String(id))) ||
          menuItemLookup.get(name.trim().toLowerCase());

        const qty = safeNum(i.quantity || 1);
        const price = safeNum(i.unit_price || i.price || 0);
        const rev = price * qty;

        grandTotalRevenue += rev;
        grandTotalQty += qty;

        const catName =
          (catalogItem?.category_id &&
            categoryLookup.get(String(catalogItem.category_id))) ||
          catalogItem?.category ||
          i.category ||
          "Specialities";

        const isVeg =
          catalogItem?.is_veg ?? i.is_veg ?? !name.toLowerCase().includes("chicken");

        if (!map[name]) {
          map[name] = {
            name,
            qty: 0,
            revenue: 0,
            categoryName: catName,
            isVeg,
          };
        }

        map[name].qty += qty;
        map[name].revenue += rev;
      });
    });

    const allItems = Object.values(map).map((item) => ({
      ...item,
      avgPrice: item.qty > 0 ? item.revenue / item.qty : 0,
      share: grandTotalRevenue > 0 ? (item.revenue / grandTotalRevenue) * 100 : 0,
    }));

    return {
      items: allItems,
      grandTotalRevenue,
      grandTotalQty,
      distinctDishesCount: allItems.length,
      topDish: [...allItems].sort((a, b) => b.revenue - a.revenue)[0] || null,
    };
  }, [orders, menuItemLookup, categoryLookup]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...itemAnalytics.items];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.categoryName.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter((i) => i.categoryName === selectedCategory);
    }

    if (vegFilter === "VEG") {
      result = result.filter((i) => i.isVeg);
    } else if (vegFilter === "NON_VEG") {
      result = result.filter((i) => !i.isVeg);
    }

    result.sort((a, b) => {
      if (sortBy === "revenue") return b.revenue - a.revenue;
      return b.qty - a.qty;
    });

    return result;
  }, [itemAnalytics.items, searchTerm, selectedCategory, vegFilter, sortBy]);

  // Top 6 for chart
  const topDishesForChart = useMemo(() => {
    return [...itemAnalytics.items]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [itemAnalytics.items]);

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Dish Name",
      "Type",
      "Category",
      "Quantity Sold",
      "Avg Unit Price (INR)",
      "Gross Revenue (INR)",
      "Revenue Share (%)",
    ];

    const rows = filteredAndSortedItems.map((item, idx) => [
      idx + 1,
      `"${item.name}"`,
      item.isVeg ? "Veg" : "Non-Veg",
      `"${item.categoryName}"`,
      item.qty,
      item.avgPrice.toFixed(2),
      item.revenue.toFixed(2),
      item.share.toFixed(1) + "%",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `item_sales_analytics_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct categories present
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    itemAnalytics.items.forEach((i) => set.add(i.categoryName));
    return Array.from(set);
  }, [itemAnalytics.items]);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Utensils size={14} className="text-primary" />
            Dish Performance & Item Sales Velocity
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Menu engineering analytics, popularity ranking, and portion volumes ({dateLabel})
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
        {/* Top Seller */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              #1 Best-Selling Dish
            </span>
            <Award size={14} className="text-amber-500" />
          </div>
          <span className="font-bold text-base text-foreground truncate block">
            {itemAnalytics.topDish?.name || "N/A"}
          </span>
          <span className="text-[10px] text-primary font-mono font-medium">
            {itemAnalytics.topDish
              ? `${itemAnalytics.topDish.qty} portions • ₹${itemAnalytics.topDish.revenue.toFixed(2)}`
              : "0 portions"}
          </span>
        </div>

        {/* Total Portions Sold */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Portions Sold
            </span>
            <Flame size={14} className="text-emerald-500" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            {itemAnalytics.grandTotalQty} Items
          </span>
          <span className="text-[10px] text-muted-foreground">
            Across {itemAnalytics.distinctDishesCount} distinct menu dishes
          </span>
        </div>

        {/* Avg Dish Price */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Average Realized Dish Price
            </span>
            <ArrowUpDown size={14} className="text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹
            {itemAnalytics.grandTotalQty > 0
              ? (itemAnalytics.grandTotalRevenue / itemAnalytics.grandTotalQty).toFixed(2)
              : "0.00"}
          </span>
          <span className="text-[10px] text-muted-foreground">Per individual portion</span>
        </div>

        {/* Gross Dish Sales */}
        <div className="bg-muted/40 border border-border p-3.5 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-primary block">
            Gross Item Realization
          </span>
          <span className="font-mono font-bold text-xl text-primary">
            ₹{itemAnalytics.grandTotalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Excluding package/service charges
          </span>
        </div>
      </div>

      {/* Top Dishes Recharts Visual Ranking */}
      {topDishesForChart.length > 0 && (
        <div className="bg-card border border-border rounded-md p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Top 6 Revenue Generating Dishes
            </span>
            <span className="text-[10px] text-muted-foreground">Gross Sales in ₹</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDishesForChart}
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
                  width={130}
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
                  {topDishesForChart.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-hidden cursor-pointer text-foreground"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Veg / Non-Veg Toggle */}
          <div className="inline-flex border border-border rounded-md p-0.5 bg-muted/30 text-xs">
            <button
              onClick={() => setVegFilter("ALL")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                vegFilter === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter("VEG")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                vegFilter === "VEG"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setVegFilter("NON_VEG")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                vegFilter === "NON_VEG"
                  ? "bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-1 self-start sm:self-auto text-xs text-muted-foreground">
          <span>Sort by:</span>
          <button
            onClick={() => setSortBy("revenue")}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              sortBy === "revenue"
                ? "bg-primary/10 text-primary font-bold"
                : "hover:text-foreground"
            }`}
          >
            Revenue (₹)
          </button>
          <span>•</span>
          <button
            onClick={() => setSortBy("qty")}
            className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              sortBy === "qty"
                ? "bg-primary/10 text-primary font-bold"
                : "hover:text-foreground"
            }`}
          >
            Quantity
          </button>
        </div>
      </div>

      {/* Item Performance Table */}
      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3">Dish Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-center">Portions Sold</th>
              <th className="py-2.5 px-3 text-right">Avg Unit Price</th>
              <th className="py-2.5 px-3 text-right">Gross Revenue</th>
              <th className="py-2.5 px-3 text-right">Revenue Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground font-medium">
                  No dish sales matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        item.isVeg ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-muted text-muted-foreground border border-border text-[10px] font-medium px-1.5 py-0.5 rounded">
                      {item.categoryName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-foreground">
                    {item.qty}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                    ₹{item.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    ₹{item.revenue.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, item.share))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-foreground">
                        {item.share.toFixed(1)}%
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
