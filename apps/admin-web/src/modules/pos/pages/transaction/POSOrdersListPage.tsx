import React, { useState, useEffect } from "react";
import { 
  Receipt, Search, Filter, Clock, ChefHat, CheckCircle2, 
  XCircle, Edit3, ArrowRight, RefreshCw, Plus, Printer, Laptop, Smartphone, ClipboardList,
  Maximize2, Minimize2, LayoutGrid
} from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { POSOrder } from "../../types";
import { useNavigate } from "@tanstack/react-router";
import { POSTableQuickSettleModal } from "./tables-ops/POSTableQuickSettleModal";
import { ThermalReceiptModal } from "./pos-billing/ThermalReceiptModal";
import { POSOrderHoverTooltip } from "../../components/POSOrderHoverTooltip";
import { renderSafeString } from "../../utils/renderSafeString";
import { IndianLiveClock } from "../../components/IndianLiveClock";
import { syncLocalOrderSequenceWithOrders } from "../../utils/order-sequence";

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

const getLocalDateString = (dateVal: any): string => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface POSOrdersListPageProps {
  orders?: POSOrder[];
  onRefresh?: () => void;
  onOptimisticOrderSettle?: (orderNumber: string, tableId?: number | string) => void;
  isFullScreenPOS?: boolean;
  onToggleFullScreen?: () => void;
  customers?: any[];
  onRefreshCustomers?: () => Promise<void>;
  onRecallOrderToCart?: (order: POSOrder) => void | Promise<void>;
  onSwitchView?: (view: "billing" | "tables" | "orders" | "kds" | "shift") => void;
}

export const POSOrdersListPage: React.FC<POSOrdersListPageProps> = ({
  orders: propOrders,
  onRefresh,
  onOptimisticOrderSettle,
  isFullScreenPOS = false,
  onToggleFullScreen,
  customers = [],
  onRefreshCustomers,
  onRecallOrderToCart,
  onSwitchView
}) => {
  const navigate = useNavigate();

  const goToView = (target: "billing" | "tables" | "orders" | "kds" | "shift") => {
    if (onSwitchView) {
      onSwitchView(target);
    } else {
      navigate({ to: `/pos/transaction/${target}` });
    }
  };
  const [internalOrders, setInternalOrders] = useState<POSOrder[]>([]);
  const orders = propOrders && propOrders.length > 0 ? propOrders : internalOrders;
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  // Date Presets Helpers
  const getTodayStr = () => getLocalDateString(new Date());
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  const [fromDate, setFromDate] = useState<string>(getTodayStr());
  const [toDate, setToDate] = useState<string>(getTodayStr());
  const [orderModeFilter, setOrderModeFilter] = useState<string>("ALL");
  const [orderSourceFilter, setOrderSourceFilter] = useState<string>("ALL");

  const handleSetToday = () => {
    const today = getTodayStr();
    setFromDate(today);
    setToDate(today);
  };

  const handleSetYesterday = () => {
    const yest = getYesterdayStr();
    setFromDate(yest);
    setToDate(yest);
  };

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
  };

  // Settlement & Receipt Modal State
  const [selectedOrderForSettle, setSelectedOrderForSettle] = useState<POSOrder | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const isValidBranch = activeBranchId && activeBranchId !== "undefined" && activeBranchId !== "null" && activeBranchId !== "0";
      const param = isValidBranch ? `?branch_id=${activeBranchId}` : "";
      const res = await api.get<any>(`/orders${param}`);
      const list = Array.isArray(res) ? res : res?.items || [];
      if (list && list.length > 0) {
        syncLocalOrderSequenceWithOrders(list);
      }
      setInternalOrders(list);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to fetch live orders", err);
      toast.error("Failed to load orders from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const matchStatus = (ordStatus: string | undefined, filter: string) => {
    const st = (ordStatus || "").toLowerCase();
    if (filter === "ALL") return true;
    if (filter === "OPEN") return st === "open" || st === "kot_sent" || st === "pending" || st === "draft";
    if (filter === "KITCHEN") return st === "in_kitchen" || st === "preparing" || st === "kitchen";
    if (filter === "READY") return st === "ready" || st === "served" || st === "prepared";
    if (filter === "COMPLETED") return st === "completed" || st === "paid" || st === "settled";
    if (filter === "CANCELLED") return st === "cancelled" || st === "canceled";
    return true;
  };

  const isUnsettled = (status?: string) => {
    const st = (status || "").toLowerCase();
    return !["completed", "paid", "settled", "cancelled", "canceled"].includes(st);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setFromDate("");
    setToDate("");
    setOrderModeFilter("ALL");
    setOrderSourceFilter("ALL");
    toast.success("Filters reset to default!");
  };

  // Base filtered orders before applying status tab filter (ensures status tab counts re-calculate dynamically!)
  const baseFilteredOrders = React.useMemo(() => {
    return orders.filter((ord) => {
      const matchesSearch =
        !search ||
        ord.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        (ord.customer_name && ord.customer_name.toLowerCase().includes(search.toLowerCase())) ||
        (ord.table_name && ord.table_name.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      // Local Date Matching (YYYY-MM-DD)
      const ordDate = getLocalDateString(ord.created_at);
      if (fromDate && ordDate && ordDate < fromDate) return false;
      if (toDate && ordDate && ordDate > toDate) return false;

      // Order Mode Filter
      if (orderModeFilter !== "ALL") {
        const modeUpper = (ord.order_mode || ord.order_type || "DINE_IN").toUpperCase();
        if (modeUpper !== orderModeFilter) return false;
      }

      // Order Source Filter
      if (orderSourceFilter !== "ALL") {
        const src = (ord.source_channel || (ord as any).order_source || "pos").toLowerCase();
        if (orderSourceFilter === "POS" && (src.includes("customer") || src.includes("waiter"))) return false;
        if (orderSourceFilter === "CUSTOMER" && (!src.includes("customer") && !src.includes("web") && !src.includes("qr") && !src.includes("app"))) return false;
        if (orderSourceFilter === "WAITER" && (!src.includes("waiter") && !src.includes("pad"))) return false;
      }

      return true;
    });
  }, [orders, search, fromDate, toDate, orderModeFilter, orderSourceFilter]);

  // Dynamic Tab Counts derived strictly from active filters!
  const tabCounts = React.useMemo(() => {
    return {
      ALL: baseFilteredOrders.length,
      OPEN: baseFilteredOrders.filter((o) => matchStatus(o.status, "OPEN")).length,
      KITCHEN: baseFilteredOrders.filter((o) => matchStatus(o.status, "KITCHEN")).length,
      READY: baseFilteredOrders.filter((o) => matchStatus(o.status, "READY")).length,
      COMPLETED: baseFilteredOrders.filter((o) => matchStatus(o.status, "COMPLETED")).length,
      CANCELLED: baseFilteredOrders.filter((o) => matchStatus(o.status, "CANCELLED")).length,
    };
  }, [baseFilteredOrders]);

  // Final filtered orders applying selected status tab
  const filteredOrders = React.useMemo(() => {
    return baseFilteredOrders.filter((ord) => matchStatus(ord.status, statusFilter));
  }, [baseFilteredOrders, statusFilter]);

  // SORTING RULE: ALWAYS UNSETTLED BILLS AT TOP!
  const sortedOrders = React.useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const aUnsettled = isUnsettled(a.status);
      const bUnsettled = isUnsettled(b.status);
      if (aUnsettled && !bUnsettled) return -1;
      if (!aUnsettled && bUnsettled) return 1;

      const dateA = a.created_at ? new Date(a.created_at).getTime() : safeNum(a.id);
      const dateB = b.created_at ? new Date(b.created_at).getTime() : safeNum(b.id);
      return dateB - dateA;
    });
  }, [filteredOrders]);

  const handleEditOrderInCart = async (ord: POSOrder) => {
    try {
      localStorage.setItem("edit_pos_order", JSON.stringify(ord));
      if (onRecallOrderToCart) {
        await onRecallOrderToCart(ord);
      } else {
        toast.success(`Order #${ord.order_number} loaded into Billing Cart!`);
      }
      goToView("billing");
    } catch (err) {
      toast.error("Failed to load order into cart");
    }
  };

  const handleOpenSettleModal = (ord: POSOrder) => {
    setSelectedOrderForSettle(ord);
    setIsSettleModalOpen(true);
  };

  const handleConfirmSettle = async (method: string, tender: number, change: number) => {
    if (!selectedOrderForSettle) return;
    setIsSettling(true);
    try {
      // 1. Optimistic settle & table free (< 0.1ms)
      onOptimisticOrderSettle?.(selectedOrderForSettle.order_number, selectedOrderForSettle.table_id);

      await api.patch(`/orders/${selectedOrderForSettle.id}/status?status=completed`);
      toast.success(`Bill #${selectedOrderForSettle.order_number} settled via ${method}!`);
      
      setReceiptData({
        orderNumber: selectedOrderForSettle.order_number,
        orderType: selectedOrderForSettle.order_mode?.toUpperCase() || selectedOrderForSettle.order_type || "DINE_IN",
        tableName: selectedOrderForSettle.table_name,
        waiterName: selectedOrderForSettle.waiter_name,
        items: selectedOrderForSettle.items || [],
        subtotal: selectedOrderForSettle.subtotal || 0,
        packagingChargeTotal: selectedOrderForSettle.packaging_charge || 0,
        taxAmount: selectedOrderForSettle.tax_amount || 0,
        discountAmount: selectedOrderForSettle.discount_amount || 0,
        netAmount: selectedOrderForSettle.net_amount || selectedOrderForSettle.grand_total || 0,
        paymentMethod: method,
        timestamp: new Date().toLocaleString()
      });
      
      setIsSettleModalOpen(false);
      setIsReceiptModalOpen(true);
      fetchOrders();
      onRefresh?.();
    } catch (err) {
      toast.error("Failed to complete order settlement");
    } finally {
      setIsSettling(false);
    }
  };

  const handleCancelOrder = async (id: number | string, num: string) => {
    if (!window.confirm(`Are you sure you want to void/cancel Order #${num}? Orders are never deleted to maintain audit integrity.`)) return;
    try {
      const ordToCancel = orders.find(o => String(o.id) === String(id) || o.order_number === num);
      onOptimisticOrderSettle?.(num, ordToCancel?.table_id);

      await api.patch(`/orders/${id}/status?status=cancelled`);
      toast.success(`Order #${num} marked as Cancelled (Soft Void)`);
      fetchOrders();
      onRefresh?.();
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "KOT_SENT":
      case "PENDING":
      case "OPEN":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase">
            KOT Sent
          </span>
        );
      case "IN_KITCHEN":
      case "PREPARING":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 uppercase">
            In Kitchen
          </span>
        );
      case "READY":
      case "SERVED":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 uppercase">
            Ready / Served
          </span>
        );
      case "COMPLETED":
      case "PAID":
      case "SETTLED":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20 uppercase">
            Settled
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 uppercase">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-muted text-muted-foreground border-border uppercase">
            {status || "Active"}
          </span>
        );
    }
  };

  const getSourceBadge = (sourceChannel: string | undefined) => {
    const src = (sourceChannel || "pos").toLowerCase();
    if (src.includes("customer") || src.includes("web") || src.includes("qr") || src.includes("app")) {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
          <Smartphone size={10} /> Customer App
        </span>
      );
    }
    if (src.includes("waiter") || src.includes("pad")) {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1">
          <ClipboardList size={10} /> Waiter App
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 inline-flex items-center gap-1">
        <Laptop size={10} /> ERP POS Counter
      </span>
    );
  };

  return (
    <div className={isFullScreenPOS ? "h-full overflow-y-auto pr-1 select-none space-y-3" : ""}>
      <PageContainer>
        {/* Standardized Enterprise Page Header */}
        <PageHeader
          title="Live Orders & Bill Settlement Management"
          description="Multi-Channel Order Tracking (ERP POS, Waiter App, Customer App) & Bill Settlement Control"
          icon={<Receipt size={18} />}
          badge={`${filteredOrders.length} of ${baseFilteredOrders.length} Orders`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchOrders}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                title="Refresh Order List"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
              <IndianLiveClock compact className="hidden sm:inline-flex" />
              {onToggleFullScreen && (
                <Button
                  variant={isFullScreenPOS ? "danger" : "secondary"}
                  size="sm"
                  onClick={onToggleFullScreen}
                  className="h-8 gap-1 text-xs font-bold rounded cursor-pointer px-2.5 shadow-2xs"
                >
                  {isFullScreenPOS ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  {isFullScreenPOS ? "Exit Fullscreen" : "Kiosk Fullscreen (F11)"}
                </Button>
              )}
              <Button
                onClick={() => goToView("tables")}
                className="h-8 gap-1 text-xs font-bold rounded cursor-pointer px-2.5 shadow-xs bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 active:scale-95"
              >
                <LayoutGrid size={13} /> Table Floor
              </Button>
              <Button
                onClick={() => goToView("billing")}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> New Counter Order
              </Button>
            </div>
          }
        />

      {/* Filter Tabs & Search & Advanced Filters */}
      <div className="space-y-2 bg-card border border-border rounded-md p-3">
        {/* Row 1: Status Tabs & Keyword Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { id: "ALL", label: "All Orders", count: tabCounts.ALL },
              { id: "OPEN", label: "Open / KOT Sent", count: tabCounts.OPEN },
              { id: "KITCHEN", label: "In Kitchen", count: tabCounts.KITCHEN },
              { id: "READY", label: "Ready / Served", count: tabCounts.READY },
              { id: "COMPLETED", label: "Settled", count: tabCounts.COMPLETED },
              { id: "CANCELLED", label: "Cancelled", count: tabCounts.CANCELLED },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] ml-1 opacity-80">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-56 shrink-0">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order #, Customer..."
              className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Row 2: Advanced Multi-Filters (Date Range, Order Mode, Source Channel & Reset) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 bg-background border border-border rounded px-2 py-0.5">
            <span className="text-[11px] font-medium text-muted-foreground">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-xs font-mono font-semibold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-background border border-border rounded px-2 py-0.5">
            <span className="text-[11px] font-medium text-muted-foreground">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-xs font-mono font-semibold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSetToday}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                fromDate === getTodayStr() && toDate === getTodayStr()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Today
            </button>
            <button
              onClick={handleSetYesterday}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                fromDate === getYesterdayStr() && toDate === getYesterdayStr()
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={handleClearDates}
              className="px-2 py-0.5 rounded text-[11px] font-semibold border bg-background text-muted-foreground border-border hover:bg-muted cursor-pointer"
            >
              All Dates
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-background border border-border rounded px-2 py-0.5">
            <span className="text-[11px] font-medium text-muted-foreground">Mode:</span>
            <select
              value={orderModeFilter}
              onChange={(e) => setOrderModeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="DINE_IN">🍽️ Dine-In</option>
              <option value="TAKEAWAY">🛍️ Takeaway</option>
              <option value="DELIVERY">🚚 Delivery</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-background border border-border rounded px-2 py-0.5">
            <span className="text-[11px] font-medium text-muted-foreground">Source:</span>
            <select
              value={orderSourceFilter}
              onChange={(e) => setOrderSourceFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="POS">💻 ERP POS Counter</option>
              <option value="CUSTOMER">📱 Customer App</option>
              <option value="WAITER">📝 Waiter App</option>
            </select>
          </div>

          {(fromDate || toDate || orderModeFilter !== "ALL" || orderSourceFilter !== "ALL" || search || statusFilter !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold px-2 py-1 rounded bg-muted/80 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 border border-border transition-colors cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Order Source Channel</th>
                <th className="py-2.5 px-3">Mode / Table</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Dishes & Menu Items</th>
                <th className="py-2.5 px-3">Waiter</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Net Amount</th>
                <th className="py-2.5 px-3 text-center">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground font-medium">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((ord) => {
                  const isSettled = ["completed", "paid", "settled"].includes((ord.status || "").toLowerCase());
                  const isCancelled = (ord.status || "").toLowerCase() === "cancelled";

                  return (
                    <tr key={ord.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                        <POSOrderHoverTooltip order={ord}>
                          <span className="text-primary hover:underline cursor-pointer">{ord.order_number}</span>
                        </POSOrderHoverTooltip>
                      </td>
                      <td className="py-2.5 px-3 font-medium">
                        {getSourceBadge(ord.source_channel || (ord as any).order_source)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const rawMode = (ord.order_mode || ord.order_type || "DINE_IN").toUpperCase();
                            const isDelivery = rawMode.includes("DELIV") || rawMode === "DELIVERY";
                            const isTakeaway = rawMode.includes("TAKE") || rawMode.includes("PICKUP") || rawMode === "TAKEAWAY";
                            const isDineIn = !isTakeaway && !isDelivery;
                            const tblRaw = ord.table_name || (ord.table_id ? `Table #${ord.table_id}` : "");

                            return (
                              <>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                  isDineIn ? "bg-primary/10 text-primary border-primary/20" :
                                  isTakeaway ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                }`}>
                                  {isDelivery ? "🚚 DELIVERY" : isTakeaway ? "🛍️ TAKEAWAY" : "🍷 DINE_IN"}
                                </span>
                                {isDineIn && (
                                  tblRaw ? (
                                    <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                                      ({tblRaw.startsWith("Table") ? tblRaw : `Table ${tblRaw}`})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                      (No Table)
                                    </span>
                                  )
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-medium">
                        {(() => {
                          const cName = renderSafeString(ord.customer_name);
                          const cPhone = renderSafeString(ord.customer_phone);
                          if (cName && cName !== "Walk-in Guest") {
                            return (
                              <div>
                                <div className="font-semibold text-foreground">{cName}</div>
                                {cPhone && (
                                  <div className="text-[10px] font-mono text-muted-foreground">📱 {cPhone}</div>
                                )}
                              </div>
                            );
                          }
                          return <span className="text-muted-foreground text-[11px] font-medium">Walk-in Guest</span>;
                        })()}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((item: any, i: number) => {
                              const itemAddons = item.addons || item.selected_addons || item.addon_options || [];
                              const addonStr = Array.isArray(itemAddons)
                                ? itemAddons.map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || ""))).filter(Boolean).join(", ")
                                : "";
                              return (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 bg-muted text-foreground px-1.5 py-0.2 rounded text-[11px] font-medium border border-border"
                                >
                                  <span>{item.name || item.product_name || item.item_name || "Item"}</span>
                                  {item.variant_name && (
                                    <span className="text-[9px] font-mono text-primary bg-primary/10 px-1 rounded-xs font-bold">
                                      [{item.variant_name}]
                                    </span>
                                  )}
                                  {addonStr && (
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                                      +{addonStr}
                                    </span>
                                  )}
                                  {(item.notes || item.preparation_notes || item.special_instructions) && (
                                    <span className="text-[9px] font-mono font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded-xs border border-slate-300 dark:border-slate-700 uppercase">
                                      📝 {item.notes || item.preparation_notes || item.special_instructions}
                                    </span>
                                  )}
                                  <span className="font-mono text-muted-foreground font-bold">
                                    ×{item.quantity}
                                  </span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">No item details</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {ord.waiter_name || "-"}
                      </td>
                      <td className="py-2.5 px-3">
                        {getStatusBadge(ord.status)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                        ₹{safeNum(ord.net_amount || ord.grand_total || ord.total_amount).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Settle Bill Button (Primary control for unpaid orders) */}
                          {!isSettled && !isCancelled ? (
                            <Button
                              onClick={() => handleOpenSettleModal(ord)}
                              size="sm"
                              className="h-7 px-2.5 text-[11px] font-bold gap-1 cursor-pointer shadow-2xs"
                            >
                              <CheckCircle2 size={12} />
                              <span>Settle Bill</span>
                            </Button>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-muted text-muted-foreground border-border font-semibold">
                              {isCancelled ? "Cancelled" : "Settled"}
                            </span>
                          )}

                          {/* Edit Order in Cart (Allowed for open unpaid orders) */}
                          {!isSettled && !isCancelled && (
                            <button
                              onClick={() => handleEditOrderInCart(ord)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                              title="Recall & Edit Order in POS Cart"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}

                          {/* Thermal Receipt Print */}
                          <button
                            onClick={() => {
                              const ordCust = customers.find((c) => String(c.id) === String(ord.customer_id)) || {
                                name: ord.customer_name,
                                phone: ord.customer_phone,
                                address: ord.customer_address
                              };
                              setReceiptData({
                                orderNumber: renderSafeString(ord.order_number),
                                orderType: renderSafeString(ord.order_mode || ord.order_type || "DINE_IN").toUpperCase(),
                                tableName: renderSafeString(ord.table_name),
                                waiterName: renderSafeString(ord.waiter_name),
                                customerName: renderSafeString(ordCust?.name || ord.customer_name),
                                customerPhone: renderSafeString(ordCust?.phone || ord.customer_phone),
                                customerAddress: renderSafeString(ordCust?.address || ord.customer_address),
                                items: ord.items || [],
                                subtotal: ord.subtotal || 0,
                                packagingChargeTotal: ord.packaging_charge || 0,
                                taxAmount: ord.tax_amount || 0,
                                discountAmount: ord.discount_amount || 0,
                                netAmount: ord.net_amount || ord.grand_total || 0,
                                paymentMethod: renderSafeString(ord.payment_method, "CASH"),
                                timestamp: new Date().toLocaleString()
                              });
                              setIsReceiptModalOpen(true);
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                            title="Print Thermal Bill Receipt"
                          >
                            <Printer size={14} />
                          </button>

                          {/* Cancel / Void Order (Soft cancel - Orders are NEVER deleted) */}
                          {!isSettled && !isCancelled && (
                            <button
                              onClick={() => handleCancelOrder(ord.id, ord.order_number)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                              title="Soft Void / Cancel Order (Audited)"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified POS Bill Quick Settlement Modal */}
      {selectedOrderForSettle && (
        <POSTableQuickSettleModal
          isOpen={isSettleModalOpen}
          order={selectedOrderForSettle}
          onClose={() => setIsSettleModalOpen(false)}
          onSuccess={() => {
            fetchOrders();
            onRefresh?.();
          }}
          onPrintReceipt={(receiptPayload) => {
            setReceiptData(receiptPayload);
            setIsReceiptModalOpen(true);
          }}
          customers={customers}
          onRefreshCustomers={onRefreshCustomers}
        />
      )}

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </PageContainer>
    </div>
  );
};
