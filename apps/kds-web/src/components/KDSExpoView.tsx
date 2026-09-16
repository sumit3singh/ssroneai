import React from "react";
import { CheckCircle2, Clock, Utensils, AlertTriangle, ArrowRight, RotateCcw, PackageCheck } from "lucide-react";
import { KDSTicket } from "./KDSTicketCard";

interface KDSExpoViewProps {
  tickets: KDSTicket[];
  onHandover: (ticketId: string) => void;
  onRecall: (ticketId: string) => void;
}

export const KDSExpoView: React.FC<KDSExpoViewProps> = ({
  tickets,
  onHandover,
  onRecall,
}) => {
  return (
    <div className="space-y-4">
      {/* EXPO Pass Header Banner */}
      <div className="bg-gradient-to-r from-[#103B2B] via-[#164e39] to-emerald-950 border border-emerald-800/40 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Utensils size={18} className="text-emerald-400" />
            EXPO PASS & ORDER CONSOLIDATION STATION
          </h2>
          <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
            Monitors item preparation progress across all kitchen stations before final handover.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold shrink-0">
          <span className="bg-emerald-950/80 text-emerald-200 px-3.5 py-1.5 rounded-xl border border-emerald-700/50 shadow-2xs">
            Pass Orders: <strong className="text-white text-sm ml-1">{tickets.length}</strong>
          </span>
        </div>
      </div>


      {/* EXPO Order Consolidation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => {
          const totalItems = ticket.items.reduce((sum, i) => sum + i.quantity, 0);
          const isPreparing = ticket.status === "preparing";

          return (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                      {ticket.table_number ? `Table ${ticket.table_number}` : "Takeaway"}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {ticket.order_source === "customer_web" ? "QR Order" : ticket.order_source === "waiter_pad" ? "Waiter Pad" : "POS"}
                    </span>
                  </div>
                  <p className="font-mono text-2xs text-slate-400 font-bold mt-0.5">{ticket.order_number}</p>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${isPreparing ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
                    {isPreparing ? "COOKING IN PROGRESS" : "READY FOR HANDOVER"}
                  </span>
                </div>
              </div>

              {/* Items Breakdown List */}
              <div className="space-y-2 flex-1 max-h-[260px] overflow-y-auto">
                {ticket.items.map((item: any, idx: number) => {
                  const dishName = (item.name || item.product_name || item.item_name || "Dish Item").trim();
                  
                  // Extract portion size variant
                  const variantName = typeof item.variant === "string"
                    ? item.variant
                    : (item.variant?.name || item.variant_name || "");

                  // Extract extra addons array
                  const rawAddons = item.addons || item.selected_addons || [];
                  const addonStr = Array.isArray(rawAddons)
                    ? rawAddons
                        .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || "")))
                        .filter(Boolean)
                        .join(", ")
                    : "";

                  return (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block leading-snug">
                              {dishName}
                            </span>
                            {variantName && (
                              <span className="inline-block text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 mt-0.5">
                                Option: {variantName}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 shrink-0">
                          <CheckCircle2 size={11} /> READY
                        </span>
                      </div>

                      {addonStr && (
                        <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-0.5 inline-block">
                          + Addons: {addonStr}
                        </div>
                      )}

                      {item.kitchen_note && (
                        <div className="text-[10px] font-medium text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 p-1 rounded border border-amber-300 dark:border-amber-800">
                          Note: {item.kitchen_note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Action Footer */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onHandover(ticket.id || ticket.order_number)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition"
                >
                  <CheckCircle2 size={15} />
                  <span>{ticket.order_source === "customer_web" ? "SEND TO PACKING" : "HANDOVER TO WAITER"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRecall(ticket.id || ticket.order_number)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 transition cursor-pointer"
                  title="Recall Order"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-2">
            <Utensils size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No active orders awaiting EXPO pass handover.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KDSExpoView;
