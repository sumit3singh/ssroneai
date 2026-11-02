import React, { useMemo, useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import {
  isCancelledOrder,
  safeNum,
  getOrderNet,
  getOrderSub,
  getOrderTax,
  getOrderDisc,
} from "./reportUtils";

interface DailySalesReportProps {
  orders: POSOrder[];
  dateLabel?: string;
  onRefresh?: () => void;
}

export const DailySalesReport: React.FC<DailySalesReportProps> = ({
  orders,
  dateLabel = "Today",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<POSOrder | null>(null);

  // Table Pagination State (Default 100 per page for microsecond rendering)
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>("");

  // 1. Comprehensive Filtered Orders List (Searches across Bill #, Table, Waiter, Customer, Phone, Items)
  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        o.order_number?.toLowerCase().includes(term) ||
        o.table_name?.toLowerCase().includes(term) ||
        o.waiter_name?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.toLowerCase().includes(term) ||
        (o.items || []).some((i: any) =>
          (i.name || i.product_name || i.item_name)?.toLowerCase().includes(term)
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
      const isCancelled = isCancelledOrder(o);
      const isCompleted = !isCancelled && (st === "COMPLETED" || st === "PAID" || st === "SERVED");
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "COMPLETED" && isCompleted) ||
        (selectedStatus === "CANCELLED" && isCancelled) ||
        (selectedStatus === "RUNNING" && !isCompleted && !isCancelled);

      return matchesSearch && matchesType && matchesPayment && matchesStatus;
    });
  }, [orders, searchTerm, selectedType, selectedPayment, selectedStatus]);

  // Reset pagination to Page 1 whenever filter parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedPayment, selectedStatus, orders]);

  const isFiltered =
    searchTerm.trim() !== "" ||
    selectedType !== "ALL" ||
    selectedPayment !== "ALL" ||
    selectedStatus !== "ALL";

  // When filters are active, metrics & graphs reflect the filtered subset.
  // When no filter is active, metrics reflect all non-cancelled orders in the selected period.
  const activeAndCompletedOrders = useMemo(() => {
    const baseList = isFiltered ? filteredOrders : orders;
    return baseList.filter((o) => {
      if (selectedStatus === "CANCELLED") return true;
      return !isCancelledOrder(o);
    });
  }, [orders, filteredOrders, isFiltered, selectedStatus]);

  // High-performance single-pass computation for all metrics, payment realization, channels & hourly curve
  const {
    totalNet,
    totalSub,
    totalTax,
    totalDisc,
    paymentBreakdown,
    orderTypeStats,
    hourlyChartData,
  } = useMemo(() => {
    let net = 0;
    let sub = 0;
    let tax = 0;
    let disc = 0;

    let cash = 0;
    let upi = 0;
    let card = 0;
    let debt = 0;

    let dineCount = 0;
    let dineRev = 0;
    let takeCount = 0;
    let takeRev = 0;
    let delivCount = 0;
    let delivRev = 0;

    // Prepopulate standard restaurant operating hours (09:00 to 23:00)
    const hoursMap: Record<number, { hour: string; revenue: number; orders: number }> = {};
    for (let h = 9; h <= 23; h++) {
      const label = `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
      hoursMap[h] = { hour: label, revenue: 0, orders: 0 };
    }

    const len = activeAndCompletedOrders.length;
    for (let i = 0; i < len; i++) {
      const o = activeAndCompletedOrders[i];
      const oNet = getOrderNet(o);
      const oSub = getOrderSub(o);
      const oTax = getOrderTax(o);
      const oDisc = getOrderDisc(o);

      net += oNet;
      sub += oSub;
      tax += oTax;
      disc += oDisc;

      // Order type attribution
      const mode = (o.order_type || o.order_mode || "DINE_IN").toLowerCase();
      if (mode.includes("take")) {
        takeCount++;
        takeRev += oNet;
      } else if (mode.includes("deliv")) {
        delivCount++;
        delivRev += oNet;
      } else {
        dineCount++;
        dineRev += oNet;
      }

      // Payment realization & Udhar
      const isUnpaid = (o.payment_status || "").toLowerCase() === "unpaid";
      const isPartial = (o.payment_status || "").toLowerCase() === "partial";
      const hasBalanceDue = safeNum(o.balance_due) > 0;

      let paid = 0;
      let due = 0;

      if (o.amount_paid !== undefined && o.amount_paid !== null) {
        paid = safeNum(o.amount_paid);
      } else {
        paid = isUnpaid ? 0 : oNet;
      }

      if (hasBalanceDue) {
        due = safeNum(o.balance_due);
      } else if (isUnpaid) {
        due = oNet;
      } else if (isPartial) {
        due = Math.max(0, oNet - paid);
      }

      if (due > 0) {
        debt += due;
      }

      if (paid > 0) {
        const pm = (o.payment_method || "CASH").toUpperCase();
        if (
          pm.includes("UPI") ||
          pm.includes("QR") ||
          pm.includes("GPAY") ||
          pm.includes("PAYTM") ||
          pm.includes("PHONEPE")
        ) {
          upi += paid;
        } else if (pm.includes("CARD")) {
          card += paid;
        } else {
          cash += paid;
        }
      }

      // Hourly velocity aggregation
      const d = new Date(o.created_at || Date.now());
      const h = d.getHours();
      if (!hoursMap[h]) {
        const label = `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;
        hoursMap[h] = { hour: label, revenue: 0, orders: 0 };
      }
      hoursMap[h].revenue += oNet;
      hoursMap[h].orders += 1;
    }

    const sortedHourly = Object.keys(hoursMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((k) => hoursMap[k]);

    return {
      totalNet: net,
      totalSub: sub,
      totalTax: tax,
      totalDisc: disc,
      paymentBreakdown: { cash, upi, card, debt },
      orderTypeStats: {
        dineIn: { count: dineCount, rev: dineRev },
        takeaway: { count: takeCount, rev: takeRev },
        delivery: { count: delivCount, rev: delivRev },
      },
      hourlyChartData: sortedHourly,
    };
  }, [activeAndCompletedOrders]);

  const avgOrderValue =
    activeAndCompletedOrders.length > 0
      ? totalNet / activeAndCompletedOrders.length
      : 0;

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, safeCurrentPage, pageSize]);

  // Smart page numbers windowing
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    pages.push(1);
    if (safeCurrentPage > 3) {
      pages.push("...");
    }
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (safeCurrentPage < totalPages - 2) {
      pages.push("...");
    }
    pages.push(totalPages);
    return pages;
  }, [totalPages, safeCurrentPage]);

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

        <div className="flex items-center gap-3">
          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs bg-background border border-border rounded px-2 py-1 font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>

          <span className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-mono font-bold text-foreground">
              {filteredOrders.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredOrders.length)}
            </span>{" "}
            of <span className="font-mono font-bold text-foreground">{filteredOrders.length.toLocaleString()}</span> orders
          </span>
        </div>
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
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-muted-foreground font-medium">
                  No sales orders recorded matching your filter.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => {
                const isCancelled = (o.status || "").toLowerCase() === "cancelled";
                return (
                  <tr
                    key={o.id}
                    className={`transition-colors ${
                      isCancelled
                        ? "bg-rose-50/70 dark:bg-rose-950/25 border-l-4 border-l-rose-500 hover:bg-rose-100/60 dark:hover:bg-rose-950/35"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      <POSOrderHoverTooltip order={o}>
                        <span className={`${isCancelled ? "text-rose-600 dark:text-rose-400 font-bold" : "text-primary hover:underline"} cursor-pointer inline-flex items-center gap-1.5`}>
                          #{o.order_number}
                          {isCancelled && (
                            <span className="text-[9px] font-mono uppercase bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded tracking-wide shadow-2xs">
                              CANCELLED
                            </span>
                          )}
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
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                        isCancelled
                          ? "bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {o.order_type || o.order_mode || "DINE_IN"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">
                      <div>{o.table_name ? `Table ${o.table_name}` : "Express"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {o.waiter_name ? `Staff: ${o.waiter_name}` : "Counter"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px] truncate">
                      <span className={isCancelled ? "line-through text-rose-600/80 dark:text-rose-400/80 text-[11px]" : "text-muted-foreground text-[11px]"}>
                        {(o.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ") ||
                          "No items recorded"}
                      </span>
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
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {isCancelled ? (
                        <div className="text-right">
                          <span className="line-through text-rose-500/70 text-xs">₹{getOrderNet(o).toFixed(2)}</span>
                          <span className="block text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400">₹0.00 (Cancelled)</span>
                        </div>
                      ) : (
                        <span className="text-foreground">₹{getOrderNet(o).toFixed(2)}</span>
                      )}
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

      {/* Pagination Controls Footer */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border rounded-md px-3.5 py-2.5 text-xs select-none">
          {/* Left: Summary and Page Size */}
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-mono font-bold text-foreground">
                {(safeCurrentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-mono font-bold text-foreground">
                {Math.min(safeCurrentPage * pageSize, filteredOrders.length)}
              </span>{" "}
              of{" "}
              <span className="font-mono font-bold text-foreground">
                {filteredOrders.length.toLocaleString()}
              </span>{" "}
              orders
            </span>

            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs bg-background border border-border rounded px-2 py-1 font-semibold text-foreground focus:outline-hidden cursor-pointer"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={250}>250 per page</option>
                <option value={500}>500 per page</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-foreground"
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-foreground"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((num, idx) => {
                if (num === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 py-1 text-muted-foreground font-mono text-xs"
                    >
                      …
                    </span>
                  );
                }
                const isActive = num === safeCurrentPage;
                return (
                  <button
                    key={`page-${num}`}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[28px] h-7 px-2 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-foreground"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-foreground"
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>

            {/* Jump to Page */}
            {totalPages > 5 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = parseInt(jumpPageInput, 10);
                  if (!isNaN(target) && target >= 1 && target <= totalPages) {
                    setCurrentPage(target);
                    setJumpPageInput("");
                  }
                }}
                className="flex items-center gap-1 ml-2 border-l border-border pl-2"
              >
                <span className="text-muted-foreground text-[11px]">Go:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder={String(safeCurrentPage)}
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  className="w-12 h-7 px-1.5 text-center text-xs font-mono bg-background border border-border rounded focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="h-7 px-2 text-xs font-semibold rounded bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
              {(selectedOrderForModal.items || []).map((item, idx) => {
                const isItemVoided = Boolean(item.is_voided);
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs py-1 border-b border-border/50 ${
                      isItemVoided ? "opacity-75 bg-destructive/5 px-1 rounded" : ""
                    }`}
                  >
                    <div>
                      <span className={`font-medium ${isItemVoided ? "line-through text-destructive" : "text-foreground"}`}>
                        {item.name}
                      </span>
                      {isItemVoided && (
                        <span className="ml-1.5 text-[9px] font-mono uppercase bg-destructive/10 text-destructive border border-destructive/20 px-1 rounded font-bold no-underline inline-block">
                          VOID
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-1.5">
                        x{item.quantity} @ ₹{safeNum(item.unit_price).toFixed(2)}
                      </span>
                    </div>
                    <span className={`font-mono font-semibold ${isItemVoided ? "line-through text-destructive text-[11px]" : "text-foreground"}`}>
                      {isItemVoided ? "₹0.00 (Void)" : `₹${(safeNum(item.unit_price) * safeNum(item.quantity)).toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
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
