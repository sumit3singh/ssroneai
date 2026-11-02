import React, { useState } from "react";
import {
  ChefHat,
  Clock,
  Printer,
  CheckCircle2,
  Plus,
  Flame,
  Bell,
  Search,
  Filter,
  Utensils
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { RunningOrder } from "./ActiveOrdersTracker";

interface TouchKOTTrackerProps {
  orders: RunningOrder[];
  onAppendOrderToTable: (tableNumber: string) => void;
  onPrintThermalKOT: (order: RunningOrder) => void;
  onMarkServed?: (orderId: string) => void;
}

export const TouchKOTTracker: React.FC<TouchKOTTrackerProps> = ({
  orders,
  onAppendOrderToTable,
  onPrintThermalKOT,
  onMarkServed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "cooking" | "ready">("all");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const match =
        !q ||
        (o.table_number || "").toLowerCase().includes(q) ||
        (o.order_number || "").toLowerCase().includes(q) ||
        o.items.some((it: any) =>
          (it.product_name || it.item_name || "").toLowerCase().includes(q)
        );
      if (!match) return false;

      const st = (o.status || "").toLowerCase();
      if (statusFilter === "cooking" && st !== "preparing" && st !== "pending") return false;
      if (statusFilter === "ready" && st !== "ready") return false;

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const readyToServeCount = orders.filter((o) => (o.status || "").toLowerCase() === "ready").length;

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Readiness Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ChefHat size={20} />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white">
              Kitchen KOT Live Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Real-time kitchen display sync & food pickup alerts
            </p>
          </div>
        </div>

        {readyToServeCount > 0 && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-pulse">
            <Bell size={16} className="text-emerald-400" />
            <span>{readyToServeCount} Orders Ready for Table Delivery!</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Table or KOT #..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setStatusFilter("all");
            }}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All KOTs ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              setStatusFilter("cooking");
            }}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === "cooking"
                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame size={13} /> Cooking
          </button>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              setStatusFilter("ready");
            }}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === "ready"
                ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell size={13} /> Ready ({readyToServeCount})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-dashed border-white/10 rounded-3xl p-8 space-y-2">
          <ChefHat size={36} className="mx-auto text-slate-600" />
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
            No Active KOTs
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All kitchen tickets have been cleared or no active orders match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredOrders.map((ord) => {
            const status = (ord.status || "pending").toLowerCase();
            const isReady = status === "ready";
            const isPreparing = status === "preparing" || status === "cooking";
            const isServed = status === "served";

            let statusBadge = "bg-sky-500/20 text-sky-300 border-sky-500/30";
            let statusLabel = "PENDING / RECEIVED";
            let statusIcon = <Clock size={12} />;

            if (isPreparing) {
              statusBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
              statusLabel = "COOKING IN KITCHEN";
              statusIcon = <Flame size={12} className="animate-bounce" />;
            } else if (isReady) {
              statusBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/20";
              statusLabel = "READY TO SERVE";
              statusIcon = <Bell size={12} className="animate-pulse" />;
            } else if (isServed) {
              statusBadge = "bg-slate-800 text-slate-400 border-slate-700";
              statusLabel = "SERVED TO GUEST";
              statusIcon = <CheckCircle2 size={12} />;
            }

            // Elapsed time calculation
            const elapsed = ord.created_at
              ? Math.max(0, Math.round((Date.now() - new Date(ord.created_at).getTime()) / 60000))
              : 5;

            return (
              <div
                key={ord.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between space-y-3 shadow-xl transition relative overflow-hidden ${
                  isReady
                    ? "bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/50"
                    : "bg-slate-900 border-white/10 hover:border-white/20"
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 text-white font-mono font-black text-xs flex items-center justify-center border border-white/10">
                        {ord.table_number}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-white">
                          Table {ord.table_number}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">
                          KOT #{ord.order_number}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${statusBadge}`}
                      >
                        {statusIcon}
                        <span>{statusLabel}</span>
                      </span>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-end gap-1">
                        <Clock size={10} /> {elapsed}m ago
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
                    {ord.items.map((it: any, idx: number) => {
                      const itemName = it.product_name || it.item_name || it.name || "Dish Item";
                      return (
                        <div key={idx} className="flex items-start justify-between text-xs">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-bold text-slate-200">
                              {it.quantity}x {itemName}
                            </span>
                            {it.selected_variant && (
                              <span className="block text-[10px] text-sky-400 font-mono">
                                ↳ {it.selected_variant}
                              </span>
                            )}
                            {it.selected_addons && it.selected_addons.length > 0 && (
                              <span className="block text-[10px] text-emerald-400 font-mono">
                                ↳ + {it.selected_addons.join(", ")}
                              </span>
                            )}
                            {it.kitchen_note && (
                              <span className="block text-[10px] text-amber-400 italic">
                                * {it.kitchen_note}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-400 text-xs shrink-0">
                            ₹{it.line_total || it.total_price || (it.unit_price * it.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Total & Action Buttons */}
                <div className="pt-2.5 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Total KOT Amount:</span>
                    <span className="font-black text-sm text-sky-400">
                      ₹{ord.grand_total}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {/* Add more dishes to this table */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.tap();
                        onAppendOrderToTable(ord.table_number);
                      }}
                      className="flex-1 min-h-[38px] px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-white/10"
                    >
                      <Plus size={13} />
                      <span>Add Dishes</span>
                    </button>

                    {/* Print KOT */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.tap();
                        onPrintThermalKOT(ord);
                      }}
                      title="Print Thermal KOT Ticket"
                      className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer transition active:scale-95 border border-white/10"
                    >
                      <Printer size={15} />
                    </button>

                    {/* Mark Served Button if Ready */}
                    {isReady && onMarkServed && (
                      <button
                        type="button"
                        onClick={() => {
                          sound.itemAdd();
                          onMarkServed(ord.id);
                        }}
                        className="min-h-[38px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-md shadow-emerald-600/30"
                      >
                        <CheckCircle2 size={14} />
                        <span>Served</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
