import React, { useState, useMemo } from "react";
import {
  Clock,
  Printer,
  ChefHat,
  Plus,
  Search,
  Filter
} from "lucide-react";

export interface RunningOrder {
  id: string;
  order_number: string;
  table_number: string;
  branch_id?: string;
  status: "pending" | "preparing" | "served" | "billed" | "ready" | string;
  subtotal: number;
  total_tax: number;
  grand_total: number;
  created_at: string;
  waiter_name?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    kitchen_note?: string;
    selected_variant?: string;
    selected_addons?: string[];
    kds_status?: string;
    is_served?: boolean;
  }>;
}

interface ActiveOrdersTrackerProps {
  orders: RunningOrder[];
  onSelectTableForAppend?: (tableNumber: string) => void;
  onPrintTicket?: (order: RunningOrder) => void;
  onMarkServed?: (orderId: string) => void;
}

export const ActiveOrdersTracker: React.FC<ActiveOrdersTrackerProps> = ({
  orders,
  onSelectTableForAppend,
  onPrintTicket,
  onMarkServed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table_wise" | "order_wise">("table_wise");
  const [statusFilter, setStatusFilter] = useState<"all" | "cooking" | "ready">("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ord.table_number || "").toLowerCase().includes(q) ||
        (ord.order_number || "").toLowerCase().includes(q) ||
        (ord.waiter_name || "").toLowerCase().includes(q) ||
        ord.items.some((it) => (it.product_name || "").toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const st = (ord.status || "").toLowerCase();
      if (statusFilter === "cooking" && (st !== "preparing" && st !== "in_kitchen")) return false;
      if (statusFilter === "ready" && st !== "ready") return false;

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const tableGroupedOrders = useMemo(() => {
    const map = new Map<string, RunningOrder[]>();
    filteredOrders.forEach((o) => {
      const tbl = o.table_number || "Takeaway";
      if (!map.has(tbl)) map.set(tbl, []);
      map.get(tbl)!.push(o);
    });
    return Array.from(map.entries());
  }, [filteredOrders]);

  return (
    <div className="space-y-3 p-1">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ChefHat size={16} className="text-primary" /> Waiter Serving Tracker
          </h3>
          <p className="text-xs text-muted-foreground">Table orders & kitchen readiness status</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs">
            <button
              onClick={() => setViewMode("table_wise")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "table_wise" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Table-Wise
            </button>
            <button
              onClick={() => setViewMode("order_wise")}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                viewMode === "order_wise" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Order Tickets
            </button>
          </div>

          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
            {filteredOrders.length} Active
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Table #, Order #, Waiter, or Dish..."
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1 inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs shrink-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition ${
              statusFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("cooking")}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition ${
              statusFilter === "cooking" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Cooking
          </button>
          <button
            onClick={() => setStatusFilter("ready")}
            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition ${
              statusFilter === "ready" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Ready
          </button>
        </div>
      </div>

      {/* Views */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border rounded-md bg-muted/20 space-y-1">
          <ChefHat size={28} className="mx-auto text-muted-foreground/50" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">No Active Orders</h4>
          <p className="text-xs text-muted-foreground">All tables served and clear.</p>
        </div>
      ) : viewMode === "table_wise" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tableGroupedOrders.map(([tableNum, tblOrders]) => {
            const totalItemsCount = tblOrders.reduce((sum, o) => sum + o.items.length, 0);
            const totalTableAmount = tblOrders.reduce((sum, o) => sum + o.grand_total, 0);

            return (
              <div
                key={tableNum}
                className="p-3 rounded-md bg-card border border-border shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      Table {tableNum}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {tblOrders.length} tickets ({totalItemsCount} items)
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{Math.round(totalTableAmount)}
                  </span>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {tblOrders.map((ord) => (
                    <div key={ord.id} className="space-y-1 bg-muted/30 p-2 rounded border border-border/50 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                        <span>{ord.order_number}</span>
                        <span className="capitalize text-foreground font-medium">{ord.status}</span>
                      </div>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs font-medium text-foreground">
                          <span>{it.quantity}x {it.product_name}</span>
                          <span className="font-mono text-muted-foreground">₹{it.line_total}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  {onSelectTableForAppend && (
                    <button
                      onClick={() => onSelectTableForAppend(tableNum)}
                      className="w-full py-1 px-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <Plus size={12} /> Add Items
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredOrders.map((ord) => {
            const createdTime = ord.created_at ? new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";

            return (
              <div
                key={ord.id}
                className="p-3 rounded-md bg-card border border-border shadow-xs space-y-2 flex flex-col justify-between text-xs"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="font-bold">Table {ord.table_number}</span>
                      <span className="text-[11px] text-muted-foreground uppercase">({ord.status})</span>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{ord.order_number}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[11px] text-muted-foreground block">{createdTime}</span>
                    <span className="font-semibold text-foreground">₹{Math.round(ord.grand_total)}</span>
                  </div>
                </div>

                <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex items-start justify-between text-xs font-medium">
                      <span>{it.quantity}x {it.product_name}</span>
                      <span className="font-mono text-muted-foreground">₹{it.line_total}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  {onSelectTableForAppend && (
                    <button
                      onClick={() => onSelectTableForAppend(ord.table_number)}
                      className="flex-1 py-1 px-2 rounded bg-muted hover:bg-muted/80 text-foreground text-xs font-medium flex items-center justify-center gap-1 border border-border cursor-pointer transition"
                    >
                      <Plus size={12} /> Add Items
                    </button>
                  )}
                  {onPrintTicket && (
                    <button
                      onClick={() => onPrintTicket(ord)}
                      className="py-1 px-2 rounded bg-background hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center gap-1 border border-border cursor-pointer transition"
                    >
                      <Printer size={12} /> Print KOT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveOrdersTracker;
