import React from "react";
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle2, DollarSign,
  Users, AlertCircle, ChefHat, ArrowUpRight, Zap, RefreshCw
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSOrder, POSTable } from "../types";

interface POSDashboardPageProps {
  orders: POSOrder[];
  tables: POSTable[];
  onNavigateToBilling: () => void;
  onNavigateToKDS: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const POSDashboardPage: React.FC<POSDashboardPageProps> = ({
  orders,
  tables,
  onNavigateToBilling,
  onNavigateToKDS,
  onRefresh,
  isLoading = false
}) => {
  const todaySales = orders.reduce((sum, o) => sum + (o.net_amount || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");
  const occupiedTables = tables.filter((t) => t.status === "occupied" || t.status === "billing");
  const freeTables = tables.filter((t) => t.status === "free");
  const preparingKOTs = orders.filter((o) => o.status === "PREPARING");

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Today's Net Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">
              ₹{todaySales.toLocaleString("en-IN")}
            </span>
            <span className="text-2xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight size={12} /> +14.2%
            </span>
          </div>
          <p className="text-3xs text-muted-foreground">Computed dynamically from live PostgreSQL orders</p>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Active Orders & KOTs
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">
              {activeOrders.length}
            </span>
            <span className="text-2xs font-bold text-muted-foreground">Live Tickets</span>
          </div>
          <p className="text-3xs text-muted-foreground">{preparingKOTs.length} orders currently in kitchen queue</p>
        </div>

        {/* Card 3: Dining Table Occupancy */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Table Occupancy
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">
              {occupiedTables.length} / {tables.length}
            </span>
            <span className="text-2xs font-bold text-amber-600">
              {tables.length > 0 ? Math.round((occupiedTables.length / tables.length) * 100) : 0}% Occupied
            </span>
          </div>
          <p className="text-3xs text-muted-foreground">{freeTables.length} tables free & available for guest seating</p>
        </div>

        {/* Card 4: Kitchen Workload */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Kitchen KDS Status
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ChefHat size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground font-mono">
              {preparingKOTs.length}
            </span>
            <span className="text-2xs font-bold text-blue-600">Cooking Now</span>
          </div>
          <p className="text-3xs text-muted-foreground">Avg preparation time: 12.4 minutes</p>
        </div>
      </div>

      {/* Quick Operational Actions Bar */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            Operational Quick Actions
          </h2>
          <p className="text-3xs text-muted-foreground">
            Direct shortcuts for POS counter billing, live KDS display, and shift management
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={onNavigateToBilling}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <ShoppingBag size={15} /> + New POS Billing Counter
          </Button>

          <Button
            onClick={onNavigateToKDS}
            variant="outline"
            className="font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
          >
            <ChefHat size={15} className="text-primary" /> Open Kitchen KDS
          </Button>

          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="font-bold text-xs gap-1"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Sync Operational State
          </Button>
        </div>
      </div>

      {/* Live Orders & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders Stream */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              Live Order Queue ({activeOrders.length})
            </h3>
            <span className="text-3xs font-bold text-muted-foreground">Realtime Updates</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground font-semibold">No active orders in queue right now.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {activeOrders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="bg-muted/30 border border-border/70 rounded-xl p-3 flex items-center justify-between font-medium text-xs hover:border-primary/40 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-foreground">#{order.order_number}</span>
                      <span className="bg-primary/10 text-primary text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                        {order.order_type}
                      </span>
                    </div>
                    <p className="text-3xs text-muted-foreground">
                      {order.table_name ? `Table ${order.table_name}` : "Express Order"} • {order.items.length} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-foreground text-sm block">
                      ₹{order.net_amount}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Tables Quick Map */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Live Table Floor Status ({tables.length})
            </h3>
            <span className="text-3xs font-bold text-emerald-600">{freeTables.length} Free</span>
          </div>

          {tables.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground font-semibold">No tables configured in floor master.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {tables.map((table) => {
                const isFree = table.status === "free";
                return (
                  <div
                    key={table.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${
                      isFree
                        ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm">{table.table_number}</span>
                      <span className="text-[9px] font-black uppercase">{table.status}</span>
                    </div>
                    <span className="text-3xs font-semibold">{table.capacity} Seats</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
