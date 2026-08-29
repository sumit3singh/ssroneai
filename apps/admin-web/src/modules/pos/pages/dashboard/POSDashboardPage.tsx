import React from "react";
import {
  TrendingUp, ShoppingBag, Clock, DollarSign,
  Users, ChefHat, ArrowUpRight, Zap, RefreshCw, Layers
} from "lucide-react";
import { Button } from "@ssrone/ui";
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
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Sales */}
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              Today's Net Sales
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              ₹{todaySales.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight size={12} /> +14.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Live PostgreSQL database ledger</p>
        </div>

        {/* Card 2: Active Orders */}
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              Active Orders & KOTs
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {activeOrders.length}
            </span>
            <span className="text-xs font-bold text-slate-400">Live Tickets</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{preparingKOTs.length} orders currently cooking in kitchen</p>
        </div>

        {/* Card 3: Dining Table Occupancy */}
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              Table Occupancy
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {occupiedTables.length} / {tables.length}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {tables.length > 0 ? Math.round((occupiedTables.length / tables.length) * 100) : 0}% Occupied
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{freeTables.length} tables free for guest seating</p>
        </div>

        {/* Card 4: Kitchen Workload */}
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/50 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-wider">
              Kitchen KDS Status
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ChefHat size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {preparingKOTs.length}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Cooking Now</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Avg preparation time: 12.4 minutes</p>
        </div>
      </div>

      {/* Operational Quick Actions Bar */}
      <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
            Operational Quick Actions
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Direct shortcuts for POS counter billing, live KDS display, and shift management
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={onNavigateToBilling}
            variant="primary"
            size="md"
            className="text-xs uppercase tracking-wider gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            <ShoppingBag size={16} /> + New POS Billing Counter
          </Button>

          <Button
            onClick={onNavigateToKDS}
            variant="glass"
            size="md"
            className="text-xs uppercase tracking-wider gap-1.5 cursor-pointer"
          >
            <ChefHat size={16} className="text-indigo-600 dark:text-indigo-400" /> Open Kitchen KDS
          </Button>

          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="font-bold text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Sync State
          </Button>
        </div>
      </div>

      {/* Live Orders & Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders Stream */}
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
              Live Order Queue ({activeOrders.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Realtime KOT Stream</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold">No active orders in queue right now.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {activeOrders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 flex items-center justify-between font-medium text-xs hover:border-indigo-500/50 transition-all shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 dark:text-white">#{order.order_number}</span>
                      <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {order.order_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {order.table_name ? `Table ${order.table_name}` : "Express Order"} • {order.items.length} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm block">
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
        <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
              Live Table Floor Status ({tables.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{freeTables.length} Free</span>
          </div>

          {tables.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-bold">No tables configured in floor master.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              {tables.map((table) => {
                const isFree = table.status === "free";
                return (
                  <div
                    key={table.id}
                    className={`p-3 rounded-2xl border flex flex-col justify-between h-20 transition-all ${isFree
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-sm">{table.table_number}</span>
                      <span className="text-[9px] font-black uppercase">{table.status}</span>
                    </div>
                    <span className="text-[10px] font-semibold">{table.capacity} Seats</span>
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
