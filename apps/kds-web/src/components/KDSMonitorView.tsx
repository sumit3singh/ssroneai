import React from "react";
import { Activity, Clock, Flame, AlertCircle, CheckCircle2, ChefHat, BarChart3 } from "lucide-react";
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

  const avgPrepTime = "07:45 mins";

  const stations = [
    { name: "PIZZA & GRILL", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("pizza") || i.name.toLowerCase().includes("bread"))).length, status: "Normal" },
    { name: "BAR & BEVERAGES", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("chai") || i.name.toLowerCase().includes("coffee") || i.name.toLowerCase().includes("tea"))).length, status: "Normal" },
    { name: "MAIN COURSES", active: tickets.filter((t) => t.items.some((i) => i.name.toLowerCase().includes("burger") || i.name.toLowerCase().includes("fries"))).length, status: "Busy" },
    { name: "PACKING & PASS", active: tickets.length, status: "Active" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Active Queue</span>
          <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">{activeCount}</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 shadow-2xs space-y-1 text-blue-700 dark:text-blue-300">
          <span className="text-[10px] font-mono font-bold uppercase text-blue-500">Cooking In Progress</span>
          <p className="font-mono text-2xl font-black">{preparingCount}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 shadow-2xs space-y-1 text-amber-700 dark:text-amber-300">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-500">Queued Orders</span>
          <p className="font-mono text-2xl font-black">{queuedCount}</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-2xs space-y-1 text-emerald-700 dark:text-emerald-300">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">Completed Shift</span>
          <p className="font-mono text-2xl font-black">{completedCount}</p>
        </div>
      </div>

      {/* Main Operational Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Station Workload Monitors (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600" /> KITCHEN STATIONS WORKLOAD MONITOR
            </h3>
            <span className="text-2xs font-mono font-bold text-slate-400">REAL-TIME TELEMETRY</span>
          </div>

          <div className="space-y-4">
            {stations.map((st) => (
              <div key={st.name} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white font-mono">{st.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{st.active} Active Tickets</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black">
                      ● {st.status}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, st.active * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Overdue SLA Alerts Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" /> OVERDUE SLA ALERTS (&gt;10 MINS)
            </h3>
            <span className="text-2xs font-mono font-bold text-red-500">{overdueTickets.length} ALERTS</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {overdueTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-xs">
                  <span>{t.table_number ? `Table ${t.table_number}` : "Takeaway"}</span>
                  <span className="text-red-600 font-black">{t.order_number}</span>
                </div>
                <p className="text-xs font-medium">
                  {t.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                </p>
              </div>
            ))}

            {overdueTickets.length === 0 && (
              <div className="text-center py-10 space-y-1 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All tickets within target SLA threshold.</p>
                <p className="text-2xs">Zero delayed orders in current kitchen queue.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KDSMonitorView;
