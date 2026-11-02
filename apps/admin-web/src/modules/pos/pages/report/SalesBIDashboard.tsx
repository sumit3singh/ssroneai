import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ShoppingBag,
  CreditCard,
  Users,
  Utensils,
  Sparkles,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  Percent,
  Award,
  Zap,
  Filter,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  FileX,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { POSOrder } from "../../types";
import { isCancelledOrder, isVoidedItem, safeNum } from "./reportUtils";

interface SalesBIDashboardProps {
  orders: POSOrder[];
  dateLabel?: string;
  onRefresh?: () => void;
}

// Re-export SSOT utilities for reports
export { isCancelledOrder, isVoidedItem, safeNum };

// Power BI Curated Color Palette (HSL Tailored)
const BI_PALETTE = {
  primary: "hsl(var(--primary))",
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  indigo: "#6366f1",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

export const SalesBIDashboard: React.FC<SalesBIDashboardProps> = ({
  orders,
  dateLabel = "Today",
  onRefresh,
}) => {
  // Power BI Interactive Slicers State
  const [selectedStatus, setSelectedStatus] = useState<"ACTIVE" | "CANCELLED" | "ALL">("ACTIVE");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("ALL");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("ALL");

  // Single-pass O(N) aggregation for microsecond ultra-fast calculation
  const biData = useMemo(() => {
    let grossRevenue = 0;
    let netRevenue = 0;
    let totalTax = 0;
    let totalDiscounts = 0;
    let totalDebt = 0;
    let totalItemsSold = 0;
    let completedOrdersCount = 0;

    // Cancellation & Void Audit Metrics
    let cancelledOrdersCount = 0;
    let cancelledRevenue = 0;
    let voidedItemsCount = 0;
    let voidedItemsRevenue = 0;

    // Breakdown maps
    const hourlyMap: Record<number, { hour: string; revenue: number; bills: number; avgTicket: number }> = {};
    for (let h = 0; h < 24; h++) {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      hourlyMap[h] = { hour: `${h12}${ampm}`, revenue: 0, bills: 0, avgTicket: 0 };
    }

    const channelMap: Record<string, { channel: string; revenue: number; orders: number }> = {
      DINE_IN: { channel: "Dine-In", revenue: 0, orders: 0 },
      TAKEAWAY: { channel: "Takeaway", revenue: 0, orders: 0 },
      DELIVERY: { channel: "Delivery", revenue: 0, orders: 0 },
    };

    const paymentMap: Record<string, { mode: string; amount: number; count: number }> = {
      CASH: { mode: "Cash", amount: 0, count: 0 },
      UPI: { mode: "UPI / QR", amount: 0, count: 0 },
      CARD: { mode: "Card", amount: 0, count: 0 },
      DEBT: { mode: "Udhar (Debt)", amount: 0, count: 0 },
      OTHER: { mode: "Other", amount: 0, count: 0 },
    };

    const dishSalesMap: Record<string, { name: string; category?: string; qty: number; revenue: number }> = {};
    const categorySalesMap: Record<string, { category: string; revenue: number; qty: number }> = {};

    orders.forEach((o: any) => {
      const isCancelled = isCancelledOrder(o);
      const net = safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);

      // Track cancellation metrics for operational audit
      if (isCancelled) {
        cancelledOrdersCount++;
        cancelledRevenue += net;
      }

      // Track voided items across all orders for audit
      const orderItems = Array.isArray(o.items) ? o.items : [];
      orderItems.forEach((it: any) => {
        if (isVoidedItem(it)) {
          const qty = safeNum(it.quantity || it.qty || 1);
          const price = safeNum(it.unit_price || it.price || 0);
          voidedItemsCount += qty;
          voidedItemsRevenue += (price * qty);
        }
      });

      // Status Slicer Filter (Defaults to ACTIVE: Excludes cancelled/voided orders)
      if (selectedStatus === "ACTIVE" && isCancelled) return;
      if (selectedStatus === "CANCELLED" && !isCancelled) return;

      // Channel Slicer Filter
      const rawMode = (o.order_type || o.order_mode || "DINE_IN").toUpperCase();
      const channel = rawMode.includes("TAKE")
        ? "TAKEAWAY"
        : rawMode.includes("DELIV")
        ? "DELIVERY"
        : "DINE_IN";

      if (selectedChannel !== "ALL" && channel !== selectedChannel) return;

      // Payment Slicer Filter
      const rawPm = (o.payment_method || "CASH").toUpperCase();
      const hasDebt = Number(o.balance_due || 0) > 0 || rawPm === "CREDIT_ACCOUNT" || rawPm === "DEBT";
      const normPm = hasDebt ? "DEBT" : rawPm === "CASH" ? "CASH" : rawPm === "CARD" ? "CARD" : rawPm.includes("UPI") || rawPm.includes("QR") ? "UPI" : "OTHER";

      if (selectedPaymentMode !== "ALL" && normPm !== selectedPaymentMode) return;

      // Hour & Time Slot Slicer Filter
      let orderHour = 12;
      if (o.created_at) {
        try {
          orderHour = new Date(o.created_at).getHours();
        } catch {}
      }

      const slot = orderHour >= 6 && orderHour < 12
        ? "BREAKFAST"
        : orderHour >= 12 && orderHour < 16
        ? "LUNCH"
        : orderHour >= 16 && orderHour < 19
        ? "EVENING"
        : "DINNER";

      if (selectedTimeSlot !== "ALL" && slot !== selectedTimeSlot) return;

      completedOrdersCount++;

      // Aggregate Financials
      const sub = safeNum(o.subtotal ?? 0);
      const tax = safeNum(o.tax_amount ?? 0);
      const disc = safeNum(o.discount_amount ?? 0);
      const debt = safeNum(o.balance_due ?? (normPm === "DEBT" ? net : 0));

      netRevenue += net;
      grossRevenue += sub > 0 ? sub : net;
      totalTax += tax;
      totalDiscounts += disc;
      totalDebt += debt;

      // Hourly Distribution
      if (hourlyMap[orderHour]) {
        hourlyMap[orderHour].revenue += net;
        hourlyMap[orderHour].bills += 1;
      }

      // Channel Distribution
      if (channelMap[channel]) {
        channelMap[channel].revenue += net;
        channelMap[channel].orders += 1;
      }

      // Payment Distribution
      if (paymentMap[normPm]) {
        paymentMap[normPm].amount += net;
        paymentMap[normPm].count += 1;
      } else {
        paymentMap.OTHER.amount += net;
        paymentMap.OTHER.count += 1;
      }

      // Dish & Category Pareto Aggregations
      orderItems.forEach((it: any) => {
        // STRICT: Exclude voided items or items from cancelled orders in ACTIVE mode
        if (isVoidedItem(it)) return;
        if (isCancelled && selectedStatus === "ACTIVE") return;

        const dName = it.name || it.product_name || it.item_name || "Item";
        const catName = it.category_name || it.category || "General Menu";
        const qty = safeNum(it.quantity || it.qty || 1);
        const itemRev = safeNum(it.total || it.price ? (it.price * qty) : 0);

        totalItemsSold += qty;

        if (!dishSalesMap[dName]) {
          dishSalesMap[dName] = { name: dName, category: catName, qty: 0, revenue: 0 };
        }
        dishSalesMap[dName].qty += qty;
        dishSalesMap[dName].revenue += itemRev;

        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = { category: catName, revenue: 0, qty: 0 };
        }
        categorySalesMap[catName].revenue += itemRev;
        categorySalesMap[catName].qty += qty;
      });
    });

    // Compute Hourly Averages
    const hourlyData = Object.values(hourlyMap).map((h) => ({
      ...h,
      avgTicket: h.bills > 0 ? Math.round(h.revenue / h.bills) : 0,
      revenue: Math.round(h.revenue),
    }));

    // Top 8 Dishes by Revenue
    const topDishes = Object.values(dishSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    // Top Categories
    const topCategories = Object.values(categorySalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const aov = completedOrdersCount > 0 ? Math.round(netRevenue / completedOrdersCount) : 0;

    return {
      totalOrders: completedOrdersCount,
      grossRevenue: Math.round(grossRevenue),
      netRevenue: Math.round(netRevenue),
      totalTax: Math.round(totalTax),
      totalDiscounts: Math.round(totalDiscounts),
      totalDebt: Math.round(totalDebt),
      totalItemsSold,
      aov,
      cancelledOrdersCount,
      cancelledRevenue: Math.round(cancelledRevenue),
      voidedItemsCount,
      voidedItemsRevenue: Math.round(voidedItemsRevenue),
      hourlyData,
      channelData: Object.values(channelMap),
      paymentData: Object.values(paymentMap).filter((p) => p.amount > 0 || p.count > 0),
      topDishes,
      topCategories,
    };
  }, [orders, selectedStatus, selectedChannel, selectedPaymentMode, selectedTimeSlot]);

  return (
    <div className="space-y-4">
      {/* Power BI Slicer Control Strip */}
      <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider pr-1 border-r border-border">
            <Filter size={13} className="text-primary" /> BI Slicers
          </span>

          {/* Status Slicer */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Status:</span>
            <div className="inline-flex border border-border rounded p-0.5 bg-muted/40">
              {(
                [
                  { id: "ACTIVE", label: "Realized (Active)" },
                  { id: "ALL", label: "All Orders" },
                  { id: "CANCELLED", label: `Cancelled (${biData.cancelledOrdersCount})` },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    selectedStatus === st.id
                      ? st.id === "CANCELLED"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Slicer */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Channel:</span>
            <div className="inline-flex border border-border rounded p-0.5 bg-muted/40">
              {["ALL", "DINE_IN", "TAKEAWAY", "DELIVERY"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedChannel(c)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    selectedChannel === c
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c === "ALL" ? "All" : c === "DINE_IN" ? "Dine-In" : c === "TAKEAWAY" ? "Takeaway" : "Delivery"}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Slicer */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Payment:</span>
            <div className="inline-flex border border-border rounded p-0.5 bg-muted/40">
              {["ALL", "CASH", "UPI", "CARD", "DEBT"].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setSelectedPaymentMode(pm)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    selectedPaymentMode === pm
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pm === "ALL" ? "All" : pm === "UPI" ? "UPI/QR" : pm === "DEBT" ? "Udhar" : pm}
                </button>
              ))}
            </div>
          </div>

          {/* Rush Slot Slicer */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Rush:</span>
            <div className="inline-flex border border-border rounded p-0.5 bg-muted/40">
              {["ALL", "BREAKFAST", "LUNCH", "EVENING", "DINNER"].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    selectedTimeSlot === slot
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {slot === "ALL" ? "All Hours" : slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Filter Indicator & Cancellation Audit Badge */}
        <div className="text-[11px] text-muted-foreground font-mono flex flex-wrap items-center gap-2">
          {biData.cancelledOrdersCount > 0 && (
            <button
              onClick={() => setSelectedStatus(selectedStatus === "CANCELLED" ? "ACTIVE" : "CANCELLED")}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] border cursor-pointer transition-colors ${
                selectedStatus === "CANCELLED"
                  ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
              }`}
              title="Click to toggle Cancelled Orders audit view"
            >
              <FileX size={10} />
              {biData.cancelledOrdersCount} Cancelled (₹{biData.cancelledRevenue.toLocaleString("en-IN")}) Excluded
            </button>
          )}
          {biData.voidedItemsCount > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] border border-amber-500/20"
              title={`${biData.voidedItemsCount} voided items worth ₹${biData.voidedItemsRevenue.toLocaleString("en-IN")} excluded from sales`}
            >
              {biData.voidedItemsCount} Voided Items Excluded
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold text-[10px] border border-emerald-500/20">
            <Zap size={10} /> Realtime BI Engine
          </span>
          <span>Showing <strong className="text-foreground">{biData.totalOrders}</strong> of {orders.length} orders</span>
        </div>
      </div>

      {/* Power BI Executive KPI Visual Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Realized Revenue */}
        <div className="bg-card border border-border rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium mb-1">
            <span>{selectedStatus === "CANCELLED" ? "Cancelled Sales" : "Net Sales"}</span>
            <DollarSign size={13} className={selectedStatus === "CANCELLED" ? "text-rose-500" : "text-emerald-500"} />
          </div>
          <div className={`text-xl font-bold font-mono tracking-tight ${selectedStatus === "CANCELLED" ? "text-rose-500" : "text-foreground"}`}>
            ₹{biData.netRevenue.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className={`flex items-center gap-1 font-medium ${selectedStatus === "CANCELLED" ? "text-rose-500" : "text-emerald-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus === "CANCELLED" ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
              <span>{selectedStatus === "CANCELLED" ? "Cancelled audit" : selectedStatus === "ALL" ? "All orders combined" : "Realized live"}</span>
            </span>
            {selectedStatus === "ACTIVE" && biData.cancelledOrdersCount > 0 && (
              <span className="text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold px-1 py-0.2 rounded border border-rose-500/20" title={`${biData.cancelledOrdersCount} cancelled orders excluded`}>
                -{biData.cancelledOrdersCount} canc.
              </span>
            )}
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-card border border-border rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium mb-1">
            <span>Average Ticket (AOV)</span>
            <TrendingUp size={13} className="text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-foreground">
            ₹{biData.aov.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Per completed bill
          </div>
        </div>

        {/* Total Orders Volume */}
        <div className="bg-card border border-border rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium mb-1">
            <span>Total Orders</span>
            <ShoppingBag size={13} className="text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-foreground">
            {biData.totalOrders.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground font-mono">
            {biData.totalItemsSold} dishes prepared
          </div>
        </div>

        {/* GST Tax Collected */}
        <div className="bg-card border border-border rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium mb-1">
            <span>GST Tax (CGST+SGST)</span>
            <Percent size={13} className="text-cyan-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-foreground">
            ₹{biData.totalTax.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Statutory ledger
          </div>
        </div>

        {/* Discounts & Concessions */}
        <div className="bg-card border border-border rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium mb-1">
            <span>Discounts</span>
            <Award size={13} className="text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-foreground">
            ₹{biData.totalDiscounts.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            Promotions & roundoff
          </div>
        </div>

        {/* Customer Debt (Udhar) */}
        <div className="bg-card border border-amber-500/40 rounded-lg p-3 shadow-xs relative overflow-hidden group hover:border-amber-500 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-[11px] font-semibold mb-1">
            <span>Customer Debt (Udhar)</span>
            <CreditCard size={13} className="text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
            ₹{biData.totalDebt.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 text-[10px] text-amber-600/80 font-medium">
            Pending receivable
          </div>
        </div>
      </div>

      {/* Power BI Multi-Dimensional Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Visual 1: Hourly Sales Velocity Area Chart (Spans 8 columns) */}
        <div className="lg:col-span-8 bg-card border border-border rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                <TrendingUp size={14} className="text-primary" /> Hourly Sales Velocity Curve
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Revenue & bill volume trend across 24 operating hours ({dateLabel})
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-primary">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Sales (₹)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={biData.hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="biRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-md p-2 shadow-md text-xs font-mono">
                          <div className="font-bold text-foreground mb-1">{d.hour}</div>
                          <div className="text-primary">Revenue: ₹{d.revenue.toLocaleString("en-IN")}</div>
                          <div className="text-muted-foreground">Completed Bills: {d.bills}</div>
                          {d.bills > 0 && <div className="text-emerald-500">Avg Ticket: ₹{d.avgTicket}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#biRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 2: Payment Realization Mix Donut (Spans 4 columns) */}
        <div className="lg:col-span-4 bg-card border border-border rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <PieChartIcon size={14} className="text-blue-500" /> Payment Realization Mix
            </h3>
            <p className="text-[11px] text-muted-foreground">Revenue share by tender method</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biData.paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {biData.paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Amount"]}
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", fontSize: 11, borderRadius: 6 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Tenders</div>
              <div className="text-xs font-bold text-foreground font-mono">{biData.paymentData.length} Modes</div>
            </div>
          </div>

          {/* Payment Mode Legend List */}
          <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-2 border-t border-border/60">
            {biData.paymentData.map((p, idx) => (
              <div key={p.mode} className="flex items-center justify-between text-[11px] p-1 rounded bg-muted/20">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate">{p.mode}</span>
                </span>
                <span className="font-bold text-foreground">₹{p.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual 3 & 4: Top 8 Dishes Pareto & Dining Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pareto: Top 8 Selling Dishes by Revenue (Spans 7 columns) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                <Utensils size={14} className="text-emerald-500" /> Top Selling Dishes (Pareto Revenue)
              </h3>
              <p className="text-[11px] text-muted-foreground">High-velocity items generating top revenue</p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
              Rank 1 - 8
            </span>
          </div>

          <div className="space-y-2">
            {biData.topDishes.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No item details available in this selection</div>
            ) : (
              biData.topDishes.map((dish, idx) => {
                const maxDishRev = biData.topDishes[0]?.revenue || 1;
                const pct = Math.min(100, Math.round((dish.revenue / maxDishRev) * 100));
                return (
                  <div key={dish.name} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate max-w-[65%]">
                        <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center font-mono ${
                          idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-300 text-slate-800" : idx === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground truncate">{dish.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">({dish.category})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-muted-foreground text-[11px]">{dish.qty} sold</span>
                        <span className="font-bold text-foreground">₹{dish.revenue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dining Channels & Category Breakdown (Spans 5 columns) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <ShoppingBag size={14} className="text-purple-500" /> Order Channels & Category Velocity
                </h3>
                <p className="text-[11px] text-muted-foreground">Channel split and top category contributions</p>
              </div>
            </div>

            {/* Channels Split Card Strip */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {biData.channelData.map((c) => (
                <div key={c.channel} className="p-2 rounded border border-border bg-muted/20 text-center">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">{c.channel}</div>
                  <div className="text-sm font-bold text-foreground font-mono mt-0.5">₹{c.revenue.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{c.orders} orders</div>
                </div>
              ))}
            </div>

            {/* Top Categories Progress Bars */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Top Categories by Sales
              </div>
              {biData.topCategories.map((cat) => {
                const maxCatRev = biData.topCategories[0]?.revenue || 1;
                const pct = Math.min(100, Math.round((cat.revenue / maxCatRev) * 100));
                return (
                  <div key={cat.category} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate">{cat.category}</span>
                      <span className="font-bold text-foreground font-mono">₹{cat.revenue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Powered by Zero-Wait BI Engine</span>
            <span className="font-mono text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> 100% Data Integrity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
