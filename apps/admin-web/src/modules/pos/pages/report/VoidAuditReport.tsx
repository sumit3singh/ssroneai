import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Printer,
  Download,
  Search,
  DollarSign,
  FileX,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface VoidAuditReportProps {
  orders: POSOrder[];
  dateLabel?: string;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const VoidAuditReport: React.FC<VoidAuditReportProps> = ({
  orders,
  dateLabel = "Today",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "cancelled" | "discounted">("all");

  // Filter cancelled or discounted orders
  const auditOrders = useMemo(() => {
    return orders.filter((o) => {
      const isCancelled = (o.status || "").toLowerCase() === "cancelled";
      const hasDiscount = safeNum(o.discount_amount) > 0;
      if (filterType === "cancelled") return isCancelled;
      if (filterType === "discounted") return hasDiscount;
      return isCancelled || hasDiscount;
    });
  }, [orders, filterType]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return auditOrders;
    const term = searchTerm.toLowerCase();
    return auditOrders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(term) ||
        o.table_name?.toLowerCase().includes(term) ||
        o.waiter_name?.toLowerCase().includes(term) ||
        (o.items || []).some((i) => i.name?.toLowerCase().includes(term))
    );
  }, [auditOrders, searchTerm]);

  // Key KPI Metrics
  const stats = useMemo(() => {
    const cancelledList = orders.filter(
      (o) => (o.status || "").toLowerCase() === "cancelled"
    );
    const discountedList = orders.filter((o) => safeNum(o.discount_amount) > 0);

    const lostRevenue = cancelledList.reduce(
      (s, o) => s + safeNum(o.net_amount || o.subtotal || 0),
      0
    );
    const totalDiscounts = discountedList.reduce(
      (s, o) => s + safeNum(o.discount_amount || 0),
      0
    );
    const totalGross = orders.reduce(
      (s, o) => s + safeNum(o.subtotal || o.net_amount || 0),
      0
    );

    const leakageRatio =
      totalGross > 0 ? ((lostRevenue + totalDiscounts) / totalGross) * 100 : 0;

    return {
      cancelledCount: cancelledList.length,
      discountedCount: discountedList.length,
      lostRevenue,
      totalDiscounts,
      leakageRatio,
    };
  }, [orders]);

  const handleExportCSV = () => {
    const headers = [
      "Bill #",
      "Timestamp",
      "Order Type",
      "Table",
      "Waiter",
      "Status",
      "Gross Subtotal (INR)",
      "Discount Granted (INR)",
      "Net Amount (INR)",
      "Item Details",
    ];

    const rows = filteredOrders.map((o) => [
      `"#${o.order_number}"`,
      `"${new Date(o.created_at || Date.now()).toLocaleString()}"`,
      o.order_type || "DINE_IN",
      `"${o.table_name || "Express"}"`,
      `"${o.waiter_name || "Self"}"`,
      o.status || "COMPLETED",
      safeNum(o.subtotal).toFixed(2),
      safeNum(o.discount_amount).toFixed(2),
      safeNum(o.net_amount).toFixed(2),
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
      `pos_void_discount_audit_${new Date().toISOString().slice(0, 10)}.csv`
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
            <ShieldAlert size={14} className="text-destructive" />
            Void, Cancellation & Discount Leakage Audit
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Audit trail of cancelled orders, voided KOT tickets, and promotional discounts ({dateLabel})
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
        {/* Cancelled Bills */}
        <div className="bg-card border border-destructive/30 p-3 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-destructive block">
              Cancelled / Void Orders
            </span>
            <FileX size={14} className="text-destructive" />
          </div>
          <span className="font-mono font-bold text-lg text-destructive">
            {stats.cancelledCount} Bills
          </span>
          <span className="text-[10px] text-muted-foreground">
            Lost Revenue: ₹{stats.lostRevenue.toFixed(2)}
          </span>
        </div>

        {/* Discounted Bills */}
        <div className="bg-card border border-amber-500/30 p-3 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
              Discounted Invoices
            </span>
            <Tag size={14} className="text-amber-500" />
          </div>
          <span className="font-mono font-bold text-lg text-amber-600 dark:text-amber-400">
            {stats.discountedCount} Bills
          </span>
          <span className="text-[10px] text-muted-foreground">
            Deductions: ₹{stats.totalDiscounts.toFixed(2)}
          </span>
        </div>

        {/* Total Lost & Waived Value */}
        <div className="bg-card border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Combined Waived & Lost Value
          </span>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{(stats.lostRevenue + stats.totalDiscounts).toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Discounts + Cancelled KOTs
          </span>
        </div>

        {/* Leakage Ratio */}
        <div className="bg-muted/40 border border-border p-3 rounded-md space-y-1">
          <span className="text-[10px] uppercase font-semibold text-foreground block">
            Gross Leakage Ratio
          </span>
          <span className="font-mono font-bold text-lg text-foreground">
            {stats.leakageRatio.toFixed(2)}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            Target benchmark: &lt; 3.0%
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by Bill #, Waiter, Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto border border-border rounded-md p-0.5 bg-muted/30 text-xs">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Audit Records ({auditOrders.length})
          </button>
          <button
            onClick={() => setFilterType("cancelled")}
            className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "cancelled"
                ? "bg-background text-destructive shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cancellations ({stats.cancelledCount})
          </button>
          <button
            onClick={() => setFilterType("discounted")}
            className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === "discounted"
                ? "bg-background text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discounts ({stats.discountedCount})
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto border border-border rounded-md bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
              <th className="py-2.5 px-3">Bill #</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Order Type</th>
              <th className="py-2.5 px-3">Table / Staff</th>
              <th className="py-2.5 px-3">Ordered Dishes</th>
              <th className="py-2.5 px-3 text-right">Discount</th>
              <th className="py-2.5 px-3 text-right">Net Value</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                  No voided or discounted orders found for this filter.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isCancelled = (o.status || "").toLowerCase() === "cancelled";
                const hasDiscount = safeNum(o.discount_amount) > 0;
                return (
                  <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      #{o.order_number}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono">
                      {new Date(o.created_at || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-medium">
                      {o.order_type || "DINE_IN"}
                    </td>
                    <td className="py-2.5 px-3 text-foreground">
                      <div>{o.table_name ? `Table ${o.table_name}` : "Express"}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {o.waiter_name ? `Waiter: ${o.waiter_name}` : "Direct Counter"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px] truncate text-muted-foreground">
                      {(o.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ") ||
                        "No items recorded"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      {hasDiscount ? `-₹${safeNum(o.discount_amount).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      ₹{safeNum(o.net_amount).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          isCancelled
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {o.status || "COMPLETED"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
