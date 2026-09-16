import React from "react";
import { AlertCircle, CheckCircle2, BarChart3, Clock, ShieldAlert, Activity } from "lucide-react";
import { KDSTicket } from "./KDSTicketCard";

interface KDSMonitorViewProps {
  tickets: KDSTicket[];
  completedCount: number;
}

export const KDSMonitorView: React.FC<KDSMonitorViewProps> = ({
  tickets,
  completedCount,
}) => {
  const activeCount = tickets.length;
  const preparingCount = tickets.filter((t) => t.status === "preparing").length;
  const queuedCount = tickets.filter((t) => t.status === "pending").length;

  const overdueTickets = tickets.filter((t) => {
    if (!t.created_at) return false;
    const diff = Math.floor((Date.now() - new Date(t.created_at).getTime()) / 60000);
    return diff >= 10;
  });

  const stations = [
    { name: "PIZZA & GRILL", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("pizza") || i.name.toLowerCase().includes("bread"))).length, status: "Normal" },
    { name: "BAR & BEVERAGES", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("chai") || i.name.toLowerCase().includes("coffee") || i.name.toLowerCase().includes("tea"))).length, status: "Normal" },
    { name: "MAIN COURSES", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("burger") || i.name.toLowerCase().includes("fries"))).length, status: "Busy" },
    { name: "PACKING & PASS", active: tickets.length, status: "Active" },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* SLA Performance Header Banner */}
      <div className="bg-gradient-to-r from-[#103B2B] via-[#164e39] to-emerald-950 border border-emerald-800/40 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
            <Activity size={20} className="text-emerald-400" />
            SLA PERFORMANCE & KITCHEN TELEMETRY MONITOR
          </h2>
          <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
            Real-time kitchen station workload tracking, preparation SLA thresholds, and overdue order alerts.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
          <span className="bg-emerald-950/80 text-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-700/50 shadow-2xs">
            Overdue Alerts: <strong className="text-amber-300 text-sm ml-1">{overdueTickets.length}</strong>
          </span>
        </div>
      </div>

      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Total Active Queue</span>
          <p className="font-sans text-2xl font-black text-slate-900 dark:text-white">{activeCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">Cooking In Progress</span>
          <p className="font-sans text-2xl font-black text-sky-600 dark:text-sky-400">{preparingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Queued Orders</span>
          <p className="font-sans text-2xl font-black text-amber-600 dark:text-amber-400">{queuedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed Shift</span>
          <p className="font-sans text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
        </div>
      </div>

      {/* Main Operational Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Station Workload Monitors (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-400" /> KITCHEN STATIONS WORKLOAD MONITOR
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">REAL-TIME TELEMETRY</span>
          </div>

          <div className="space-y-3">
            {stations.map((st) => (
              <div key={st.name} className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white font-mono">{st.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{st.active} Active Tickets</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      st.status === "Busy"
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
                    }`}>
                      ● {st.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, st.active * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Overdue SLA Alerts Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" /> OVERDUE SLA ALERTS (&gt;10 MINS)
            </h3>
            <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400">{overdueTickets.length} ALERTS</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {overdueTickets.map((t) => {
              const elapsedMins = t.created_at
                ? Math.floor((Date.now() - new Date(t.created_at).getTime()) / 60000)
                : 10;

              return (
                <div key={t.id} className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300 space-y-2">
                  <div className="flex items-center justify-between font-mono font-bold text-xs">
                    <span className="text-slate-900 dark:text-white font-extrabold">
                      {t.table_number ? `Table ${t.table_number}` : "Takeaway"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">
                        ⏱️ Overdue {elapsedMins}m
                      </span>
                      <span className="text-rose-700 dark:text-rose-400 font-extrabold">{t.order_number}</span>
                    </div>
                  </div>

                  {/* Items Breakdown with Variants and Addons */}
                  <div className="space-y-1 border-t border-rose-200/60 dark:border-rose-900/60 pt-2">
                    {t.items.map((it: any, idx: number) => {
                      const dishName = (it.name || it.product_name || it.item_name || "Dish Item").trim();
                      
                      const variantName = typeof it.variant === "string"
                        ? it.variant
                        : (it.variant?.name || it.variant_name || "");

                      const rawAddons = it.addons || it.selected_addons || [];
                      const addonStr = Array.isArray(rawAddons)
                        ? rawAddons
                            .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || "")))
                            .filter(Boolean)
                            .join(", ")
                        : "";

                      return (
                        <div key={idx} className="text-xs text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-black text-xs px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded shrink-0">
                            {it.quantity}x
                          </span>
                          <span className="font-bold">{dishName}</span>

                          {variantName && (
                            <span className="inline-block text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                              Option: {variantName}
                            </span>
                          )}

                          {addonStr && (
                            <span className="inline-block text-[10px] font-mono font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              + {addonStr}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {overdueTickets.length === 0 && (
              <div className="text-center py-10 space-y-1 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All tickets within target SLA threshold.</p>
                <p className="text-[11px] text-slate-500">Zero delayed orders in current kitchen queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KDSMonitorView;
