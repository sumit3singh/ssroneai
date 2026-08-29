import React from "react";
import { Clock, Printer, CheckCircle2, AlertCircle, ChefHat, Plus, Receipt } from "lucide-react";

export interface RunningOrder {
  id: string;
  order_number: string;
  table_number: string;
  branch_id?: string;
  status: "pending" | "preparing" | "served" | "billed";
  subtotal: number;
  total_tax: number;
  grand_total: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    kitchen_note?: string;
    selected_variant?: string;
    selected_addons?: string[];
  }>;
}

interface ActiveOrdersTrackerProps {
  orders: RunningOrder[];
  onSelectTableForAppend?: (tableNumber: string) => void;
  onPrintTicket?: (order: RunningOrder) => void;
}

export const ActiveOrdersTracker: React.FC<ActiveOrdersTrackerProps> = ({
  orders,
  onSelectTableForAppend,
  onPrintTicket,
}) => {
  const displayOrders: RunningOrder[] = orders;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ChefHat className="text-indigo-600 dark:text-indigo-400" size={18} /> Active KOTs & Running Table Orders
          </h3>
          <p className="text-xs text-slate-400 font-medium">Real-time status tracking for Kitchen Display & Billing</p>
        </div>
        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          {displayOrders.length} Running Tickets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayOrders.map((ord) => {
          let statusBadge = "bg-amber-500/10 text-amber-600 border-amber-500/20";
          let statusText = "KOT QUEUED";

          if (ord.status === "preparing") {
            statusBadge = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
            statusText = "KITCHEN PREPARING";
          } else if (ord.status === "served") {
            statusBadge = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            statusText = "SERVED";
          } else if (ord.status === "billed") {
            statusBadge = "bg-slate-500/10 text-slate-600 border-slate-500/20";
            statusText = "BILLED / UNPAID";
          }

          const createdTime = new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={ord.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-3 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">Table {ord.table_number}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider font-mono ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-400 font-bold mt-0.5">{ord.order_number}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> {createdTime}
                  </span>
                  <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">
                    ₹{Math.round(ord.grand_total)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {ord.items.map((it, idx) => (
                  <div key={idx} className="flex items-start justify-between text-xs font-semibold">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {it.quantity}x {it.product_name}
                      </p>
                      {it.selected_addons && it.selected_addons.length > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          + {it.selected_addons.join(", ")}
                        </p>
                      )}
                      {it.kitchen_note && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                          Note: {it.kitchen_note}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                      ₹{it.line_total}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {onSelectTableForAppend && (
                  <button
                    onClick={() => onSelectTableForAppend(ord.table_number)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus size={12} /> Add Items
                  </button>
                )}
                {onPrintTicket && (
                  <button
                    onClick={() => onPrintTicket(ord)}
                    className="py-2 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-500/20 cursor-pointer transition"
                  >
                    <Printer size={12} /> Print KOT
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveOrdersTracker;
