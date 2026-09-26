import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Printer,
  Download,
  Search,
  Receipt,
  Users,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { POSOrder, POSCartItem } from "../../types";
import { POSOrderHoverTooltip } from "../../components/POSOrderHoverTooltip";

interface DailySalesReportProps {
  orders: POSOrder[];
  dateLabel?: string;
  onRefresh?: () => void;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const DailySalesReport: React.FC<DailySalesReportProps> = ({
  orders,
  dateLabel = "Today",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<POSOrder | null>(null);

  const getOrderNet = (o: POSOrder) =>
    safeNum(o.net_amount ?? o.grand_total ?? o.total_amount ?? 0);
  const getOrderSub = (o: POSOrder) => safeNum(o.subtotal ?? 0);
  const getOrderTax = (o: POSOrder) => safeNum(o.tax_amount ?? 0);
  const getOrderDisc = (o: POSOrder) => safeNum(o.discount_amount ?? 0);

  // Filter out cancelled for revenue metrics
  const activeAndCompletedOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.status || "").toLowerCase() !== "cancelled"
    );
  }, [orders]);

  // Financial aggregates
  const totalNet = useMemo(
    () => activeAndCompletedOrders.reduce((sum, o) => sum + getOrderNet(o), 0),
    [activeAndCompletedOrders]
  );
  const totalSub = useMemo(
    () => activeAndCompletedOrders.reduce((sum, o) => sum + getOrderSub(o), 0),
    [activeAndCompletedOrders]
  );
  const totalTax = useMemo(
    () => activeAndCompletedOrders.reduce((sum, o) => sum + getOrderTax(o), 0),
    [activeAndCompletedOrders]
  );
  const totalDisc = useMemo(
    () => activeAndCompletedOrders.reduce((sum, o) => sum + getOrderDisc(o), 0),
    [activeAndCompletedOrders]
  );

  const avgOrderValue =
    activeAndCompletedOrders.length > 0
      ? totalNet / activeAndCompletedOrders.length
      : 0;

  // Payment Breakdown with exact tender attribution and Udhar (Debt) segregation
  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let debt = 0;

    activeAndCompletedOrders.forEach((o: any) => {
      const net = getOrderNet(o);
      const isUnpaid = (o.payment_status || "").toLowerCase() === "unpaid";
      const isPartial = (o.payment_status || "").toLowerCase() === "partial";
      const hasBalanceDue = safeNum(o.balance_due) > 0;

      let paid = 0;
      let due = 0;

      if (o.amount_paid !== undefined && o.amount_paid !== null) {
        paid = safeNum(o.amount_paid);
      } else {
        paid = isUnpaid ? 0 : net;
      }

      if (hasBalanceDue) {
        due = safeNum(o.balance_due);
      } else if (isUnpaid) {
        due = net;
      } else if (isPartial) {
        due = Math.max(0, net - paid);
      }

      if (due > 0) {
        debt += due;
      }

      if (paid > 0) {
        const pm = (o.payment_method || "CASH").toUpperCase();
        if (pm.includes("UPI") || pm.includes("QR") || pm.includes("GPAY") || pm.includes("PAYTM") || pm.includes("PHONEPE")) {
          upi += paid;
        } else if (pm.includes("CARD")) {
          card += paid;
        } else {
          cash += paid;
        }
      }
    });

    return { cash, upi, card, debt };
  }, [activeAndCompletedOrders]);

  // Hourly velocity chart data (09:00 to 23:00)
  const hourlyChartData = useMemo(() => {
    const hoursMap: Record<number, { hour: string; revenue: number; orders: number }> = {};

    // Prepopulate standard restaurant operating hours
    for (let h = 9; h <= 23; h++) {
      const label = `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
      hoursMap[h] = { hour: label, revenue: 0, orders: 0 };
    }

    activeAndCompletedOrders.forEach((o) => {
      const d = new Date(o.created_at || Date.now());
      const h = d.getHours();
      if (!hoursMap[h]) {
        const label = `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
        hoursMap[h] = { hour: label, revenue: 0, orders: 0 };
      }
      hoursMap[h].revenue += getOrderNet(o);
      hoursMap[h].orders += 1;
    });

    return Object.keys(hoursMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((k) => hoursMap[k]);
  }, [activeAndCompletedOrders]);

  // Order Type Distribution
  const orderTypeStats = useMemo(() => {
    const dineIn = activeAndCompletedOrders.filter(
      (o) => (o.order_type || o.order_mode || "").toLowerCase().includes("dine")
    );
    const takeaway = activeAndCompletedOrders.filter(
      (o) => (o.order_type || o.order_mode || "").toLowerCase().includes("take")
    );
    const delivery = activeAndCompletedOrders.filter(
      (o) => (o.order_type || o.order_mode || "").toLowerCase().includes("deliv")
    );

    const dineInRev = dineIn.reduce((s, o) => s + getOrderNet(o), 0);
    const takeRev = takeaway.reduce((s, o) => s + getOrderNet(o), 0);
    const delivRev = delivery.reduce((s, o) => s + getOrderNet(o), 0);

    return {
      dineIn: { count: dineIn.length, rev: dineInRev },
      takeaway: { count: takeaway.length, rev: takeRev },
      delivery: { count: delivery.length, rev: delivRev },
    };
  }, [activeAndCompletedOrders]);

  // Filtered orders for table
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchTerm.trim() ||
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.waiter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.items || []).some((i) =>
          i.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const mode = (o.order_type || o.order_mode || "DINE_IN").toUpperCase();
      const matchesType =
        selectedType === "ALL" ||
        (selectedType === "DINE_IN" && mode.includes("DINE")) ||
        (selectedType === "TAKEAWAY" && mode.includes("TAKE")) ||
        (selectedType === "DELIVERY" && mode.includes("DELIV"));

      const pm = (o.payment_method || "CASH").toUpperCase();
      const hasDebt = Number(o.balance_due || 0) > 0 || pm === "CREDIT_ACCOUNT" || pm === "DEBT";
      const matchesPayment =
        selectedPayment === "ALL" ||
        (selectedPayment === "CASH" && pm === "CASH") ||
        (selectedPayment === "UPI" && (pm === "UPI" || pm === "QR")) ||
        (selectedPayment === "CARD" && pm === "CARD") ||
        (selectedPayment === "DEBT" && hasDebt);

      const st = (o.status || "COMPLETED").toUpperCase();
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "COMPLETED" &&
          (st === "COMPLETED" || st === "PAID" || st === "SERVED")) ||
        (selectedStatus === "CANCELLED" && st === "CANCELLED") ||
        (selectedStatus === "RUNNING" && st !== "COMPLETED" && st !== "CANCELLED");

      return matchesSearch && matchesType && matchesPayment && matchesStatus;
    });
  }, [orders, searchTerm, selectedType, selectedPayment, selectedStatus]);

  const handleExportCSV = () => {
    const headers = [
      "Bill #",
      "Date & Time",
      "Order Type",
      "Table",
      "Waiter",
      "Payment Mode",
      "Status",
      "Gross Subtotal (INR)",
      "Discount (INR)",
      "Tax (INR)",
      "Net Realized Amount (INR)",
      "Items Breakdown",
    ];

    const rows = filteredOrders.map((o) => [
      `"#${o.order_number}"`,
      `"${new Date(o.created_at || Date.now()).toLocaleString("en-IN")}"`,
      o.order_type || o.order_mode || "DINE_IN",
      `"${o.table_name || "Express"}"`,
      `"${o.waiter_name || "Direct"}"`,
      o.payment_method || "CASH",
      o.status || "COMPLETED",
      getOrderSub(o).toFixed(2),
      getOrderDisc(o).toFixed(2),
      getOrderTax(o).toFixed(2),
      getOrderNet(o).toFixed(2),
      `"${(o.items || []).map((i) => `${i.name} (x${i.quantity})`).join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `daily_sales_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary" />
            Daily Sales & Revenue Ledger ({dateLabel})
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Synchronized live from PostgreSQL database ledger • {activeAndCompletedOrders.length} settled transactions
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
            <Printer size={13} /> Print Summary
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Net Cash Realization */}
        <div className="bg-muted/40 border border-primary/30 p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-primary block">
              Net Realized Sales
            </span>
            <div className="p-1 rounded bg-primary/10 text-primary">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-xl text-primary">
              ₹{totalNet.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20 font-medium">
              Live
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            {activeAndCompletedOrders.length} completed customer orders
          </span>
        </div>

        {/* Gross Subtotal & AOV */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Gross Subtotal (Pre-Tax)
            </span>
            <Receipt size={14} className="text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground block">
            ₹{totalSub.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            AOV (Avg Order): <span className="font-mono font-semibold text-foreground">₹{avgOrderValue.toFixed(2)}</span>
          </span>
        </div>

        {/* GST Tax Collected */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              GST Tax Collected
            </span>
            <span className="text-[9px] font-mono font-semibold text-primary bg-primary/10 px-1 rounded">
              CGST + SGST
            </span>
          </div>
          <span className="font-mono font-bold text-lg text-foreground block">
            ₹{totalTax.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            CGST: ₹{(totalTax / 2).toFixed(2)} • SGST: ₹{(totalTax / 2).toFixed(2)}
          </span>
        </div>

        {/* Discounts & Settlement Concessions */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Discounts & Concessions
            </span>
            <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400">
              {totalSub > 0 ? ((totalDisc / totalSub) * 100).toFixed(1) : 0}% deduction
            </span>
          </div>
          <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400 block">
            ₹{totalDisc.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Promos & round-off concessions
          </span>
        </div>

        {/* Outstanding Customer Debt (Udhar) */}
        <div className="bg-card border border-amber-500/30 p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
              Customer Debt (Udhar)
            </span>
            <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookOpen size={14} />
            </div>
          </div>
          <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400 block">
            ₹{paymentBreakdown.debt.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            Receivable credit balances
          </span>
        </div>
      </div>

      {/* Hourly Sales Velocity & Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Velocity Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                Hourly Sales Velocity Curve
              </span>
              <span className="text-[10px] text-muted-foreground">
                Revenue trends across operational hours (Peak Rush: Lunch 1-3 PM, Dinner 7-10 PM)
              </span>
            </div>
            <Clock size={14} className="text-muted-foreground" />
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `₹${v}`}
                  width={45}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${safeNum(val).toFixed(2)}`, "Sales"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Channel & Payment Mix Card (1 Column) */}
        <div className="bg-card border border-border rounded-md p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block border-b border-border pb-1">
              Order Channels & Payment Mix
            </span>

            {/* Channels */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users size={12} className="text-primary" /> Dine-In:
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {orderTypeStats.dineIn.count} bills (₹{orderTypeStats.dineIn.rev.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShoppingBag size={12} className="text-emerald-500" /> Takeaway:
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {orderTypeStats.takeaway.count} bills (₹{orderTypeStats.takeaway.rev.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" /> Delivery:
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {orderTypeStats.delivery.count} bills (₹{orderTypeStats.delivery.rev.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Payment Realization Mix */}
          <div className="pt-2.5 border-t border-border space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
              Payment Realization
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
              <div className="bg-muted/30 border border-border p-1.5 rounded">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Cash</span>
                <span className="font-mono font-bold text-xs text-foreground block">₹{paymentBreakdown.cash.toFixed(0)}</span>
              </div>
              <div className="bg-muted/30 border border-border p-1.5 rounded">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">UPI / QR</span>
                <span className="font-mono font-bold text-xs text-foreground block">₹{paymentBreakdown.upi.toFixed(0)}</span>
              </div>
              <div className="bg-muted/30 border border-border p-1.5 rounded">
                <span className="text-[9px] uppercase font-bold text-muted-foreground block">Card</span>
                <span className="font-mono font-bold text-xs text-foreground block">₹{paymentBreakdown.card.toFixed(0)}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-1.5 rounded">
                <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Debt (Udhar)</span>
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 block">₹{paymentBreakdown.debt.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search Bill #, Waiter, Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Order Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-hidden cursor-pointer text-foreground"
          >
            <option value="ALL">All Order Types</option>
            <option value="DINE_IN">Dine-In</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-hidden cursor-pointer text-foreground"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">Cash Only</option>
            <option value="UPI">UPI / QR Only</option>
            <option value="CARD">Card Only</option>
            <option value="DEBT">Debt / Udhar Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-hidden cursor-pointer text-foreground"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="COMPLETED">Completed / Settled</option>
            <option value="RUNNING">Running / Kitchen</option>
            <option value="CANCELLED">Void / Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-muted-foreground">
          Showing <span className="font-mono font-bold text-foreground">{filteredOrders.length}</span> of {orders.length} orders
        </span>
      </div>

      {/* Main Orders Ledger Table */}
      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Bill #</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Table / Staff</th>
              <th className="py-2.5 px-3">Items Summary</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
              <th className="py-2.5 px-3 text-right">Discount</th>
              <th className="py-2.5 px-3 text-right">Tax</th>
              <th className="py-2.5 px-3 text-right">Net Amount</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-muted-foreground font-medium">
                  No sales orders recorded matching your filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isCancelled = (o.status || "").toLowerCase() === "cancelled";
                return (
                  <tr
                    key={o.id}
                    className={`hover:bg-muted/40 transition-colors ${
                      isCancelled ? "opacity-60 bg-muted/20" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      <POSOrderHoverTooltip order={o}>
                        <span className="text-primary hover:underline cursor-pointer">
                          #{o.order_number}
                        </span>
                      </POSOrderHoverTooltip>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">
                      {new Date(o.created_at || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-muted text-muted-foreground border border-border text-[10px] font-mono px-1.5 py-0.5 rounded uppercase">
                        {o.order_type || o.order_mode || "DINE_IN"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">
                      <div>{o.table_name ? `Table ${o.table_name}` : "Express"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {o.waiter_name ? `Staff: ${o.waiter_name}` : "Counter"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px] truncate text-muted-foreground">
                      {(o.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ") ||
                        "No items recorded"}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] border border-border">
                        {o.payment_method || "CASH"}
                      </span>
                      {Number(o.balance_due || 0) > 0 && (
                        <span className="block mt-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                          Due: ₹{Number(o.balance_due).toFixed(2)} (Udhar)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      ₹{getOrderSub(o).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {getOrderDisc(o) > 0 ? (
                        <div>
                          <div>-₹{getOrderDisc(o).toFixed(2)}</div>
                          {((o as any).metadata_payload?.settlement_discount || 0) > 0 && (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded block">
                              Concession: ₹{Number((o as any).metadata_payload.settlement_discount).toFixed(0)}
                            </span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      ₹{getOrderTax(o).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      ₹{getOrderNet(o).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedOrderForModal(o)}
                        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                        title="View Full Order Breakdown"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Bill Receipt Modal */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Order #{selectedOrderForModal.order_number}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(selectedOrderForModal.created_at || Date.now()).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded border border-border">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Type:</span>
                <span className="font-semibold text-foreground capitalize">
                  {selectedOrderForModal.order_type || "Dine In"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Table / Waiter:</span>
                <span className="font-semibold text-foreground">
                  {selectedOrderForModal.table_name ? `Table ${selectedOrderForModal.table_name}` : "Express"}{" "}
                  {selectedOrderForModal.waiter_name ? `(${selectedOrderForModal.waiter_name})` : ""}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Payment:</span>
                <span className="font-semibold text-foreground">
                  {selectedOrderForModal.payment_method || "CASH"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase block">Status:</span>
                <span className="font-semibold text-foreground capitalize">
                  {selectedOrderForModal.status || "Completed"}
                </span>
              </div>
            </div>

            {/* Line items list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Ordered Dishes & Addons:
              </span>
              {(selectedOrderForModal.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-border/50"
                >
                  <div>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-1.5">
                      x{item.quantity} @ ₹{safeNum(item.unit_price).toFixed(2)}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{(safeNum(item.unit_price) * safeNum(item.quantity)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="border-t border-border pt-2.5 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Gross Subtotal:</span>
                <span className="font-mono">₹{getOrderSub(selectedOrderForModal).toFixed(2)}</span>
              </div>
              {getOrderDisc(selectedOrderForModal) > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                  <span>Discount & Concessions:</span>
                  <span className="font-mono">-₹{getOrderDisc(selectedOrderForModal).toFixed(2)}</span>
                </div>
              )}
              {Number((selectedOrderForModal as any).metadata_payload?.settlement_discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <span>↳ Underpayment Settlement Concession:</span>
                  <span className="font-mono font-bold">-₹{Number((selectedOrderForModal as any).metadata_payload.settlement_discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>GST Tax:</span>
                <span className="font-mono">₹{getOrderTax(selectedOrderForModal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-primary border-t border-border pt-1">
                <span>Net Total Realized:</span>
                <span className="font-mono">₹{getOrderNet(selectedOrderForModal).toFixed(2)}</span>
              </div>
              {Number((selectedOrderForModal as any).balance_due || 0) > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded mt-1 border border-amber-500/20">
                  <span>Customer Debt / Udhar Remaining:</span>
                  <span className="font-mono">₹{Number((selectedOrderForModal as any).balance_due).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs cursor-pointer"
                onClick={() => setSelectedOrderForModal(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
