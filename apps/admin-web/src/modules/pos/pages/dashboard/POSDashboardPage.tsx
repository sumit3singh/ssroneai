import React from "react";
import {
  TrendingUp, ShoppingBag, Clock, DollarSign,
  Users, ChefHat, ArrowUpRight, Zap, RefreshCw, Layers
} from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { POSOrder, POSTable } from "../../types";

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
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="POS Operational Summary"
        description="Realtime operational metrics, live order queue, and floor table status"
        icon={<TrendingUp size={18} />}
        badge="Live Ledger"
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={onNavigateToBilling}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <ShoppingBag size={14} /> + New POS Billing Counter
            </Button>
            <Button
              onClick={onNavigateToKDS}
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <ChefHat size={14} /> Open Kitchen KDS
            </Button>
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} /> Sync
            </Button>
          </div>
        }
      />

      {/* Top Banner KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Net Sales
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground tracking-tight">
              ₹{todaySales.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              +14.2%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Live PostgreSQL database ledger</p>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Orders & KOTs
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground tracking-tight">
              {activeOrders.length}
            </span>
            <span className="text-xs text-muted-foreground">Live Tickets</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{preparingKOTs.length} orders cooking in kitchen</p>
        </div>

        {/* Card 3: Dining Table Occupancy */}
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Table Occupancy
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <Users size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground tracking-tight">
              {occupiedTables.length} / {tables.length}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
              {tables.length > 0 ? Math.round((occupiedTables.length / tables.length) * 100) : 0}% Occupied
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">{freeTables.length} tables available</p>
        </div>

        {/* Card 4: Kitchen Workload */}
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Kitchen KDS Status
            </span>
            <div className="p-1 rounded bg-muted text-muted-foreground">
              <ChefHat size={15} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-foreground tracking-tight">
              {preparingKOTs.length}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">Cooking</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Avg prep time: 12.4 mins</p>
        </div>
      </div>

      {/* Live Orders & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Orders Stream */}
        <div className="bg-card border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" />
              Live Order Queue ({activeOrders.length})
            </h3>
            <span className="text-[10px] text-muted-foreground">Realtime KOT Stream</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-md">
              <p className="text-xs text-muted-foreground font-medium">No active orders in queue right now.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-none">
              {activeOrders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="bg-muted/30 border border-border rounded-md p-2.5 flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-foreground">#{order.order_number}</span>
                      <span className="bg-muted text-muted-foreground border border-border text-[9px] font-mono px-1.5 py-0.2 rounded uppercase">
                        {order.order_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {order.table_name ? `Table ${order.table_name}` : "Express Order"} • {order.items.length} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground text-xs block">
                      ₹{order.net_amount}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground capitalize">
                      {(order.status || "").toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Tables Quick Map */}
        <div className="bg-card border border-border rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-muted-foreground" />
              Live Table Floor Status ({tables.length})
            </h3>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{freeTables.length} Free</span>
          </div>

          {tables.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-md">
              <p className="text-xs text-muted-foreground font-medium">No tables configured in floor master.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-none">
              {tables.map((table) => {
                const isFree = table.status === "free";
                return (
                  <div
                    key={table.id}
                    className={`p-2.5 rounded-md border flex flex-col justify-between h-16 transition-colors ${isFree
                        ? "bg-card border-emerald-500/30 text-foreground"
                        : "bg-muted/40 border-amber-500/30 text-foreground"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isFree ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {table.table_number}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">{table.status}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{table.capacity} Seats</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
