import React from "react";
import { AlertCircle, CheckCircle2, BarChart3 } from "lucide-react";
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
      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Total Active Queue</span>
          <p className="font-sans text-2xl font-black text-slate-900 dark:text-white">{activeCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400">Cooking In Progress</span>
          <p className="font-sans text-2xl font-black text-sky-700 dark:text-sky-400">{preparingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">Queued Orders</span>
          <p className="font-sans text-2xl font-black text-amber-700 dark:text-amber-400">{queuedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-500">Completed Shift</span>
          <p className="font-sans text-2xl font-black text-slate-900 dark:text-white">{completedCount}</p>
        </div>
      </div>

      {/* Main Operational Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Station Workload Monitors (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-sky-600 dark:text-sky-400" /> KITCHEN STATIONS WORKLOAD MONITOR
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">REAL-TIME TELEMETRY</span>
          </div>

          <div className="space-y-3">
            {stations.map((st) => (
              <div key={st.name} className="space-y-2 p-3.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-white font-mono">{st.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 dark:text-slate-300">{st.active} Active Tickets</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                      st.status === "Busy"
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
                        : "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800"
                    }`}>
                      ● {st.status}
                    </span>
                  </div>
                </div>

                {/* Sky Blue Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 dark:bg-sky-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, st.active * 25))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Overdue SLA Alerts Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" /> OVERDUE SLA ALERTS (&gt;10 MINS)
            </h3>
            <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400">{overdueTickets.length} ALERTS</span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
            {overdueTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300 space-y-1">
                <div className="flex items-center justify-between font-mono font-bold text-xs">
                  <span>{t.table_number ? `Table ${t.table_number}` : "Takeaway"}</span>
                  <span className="text-rose-700 dark:text-rose-400 font-extrabold">{t.order_number}</span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {t.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                </p>
              </div>
            ))}

            {overdueTickets.length === 0 && (
              <div className="text-center py-10 space-y-1 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-sky-600" />
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
