import React from "react";
import { Utensils, Check, Plus, X, Clock, ShoppingBag, ChefHat, Sparkles } from "lucide-react";
import { RunningOrder } from "./ActiveOrdersTracker";
import { api } from "@ssrone/api-client";

interface ActiveTableModalProps {
  isOpen: boolean;
  order: RunningOrder | null;
  tableName: string;
  onClose: () => void;
  onAddMoreItems: (tableNumber: string) => void;
  onMarkServed: () => void;
}

export const ActiveTableModal: React.FC<ActiveTableModalProps> = ({
  isOpen,
  order,
  tableName,
  onClose,
  onAddMoreItems,
  onMarkServed,
}) => {
  if (!isOpen) return null;

  const handleServeOrder = async () => {
    if (order && order.id) {
      try {
        const numId = parseInt(String(order.id).replace(/\D/g, ""), 10);
        await api.patch(`/orders/${numId || order.id}/status?status=served`);
      } catch (err) {
        console.warn("Update status error:", err);
      }
    }
    onMarkServed();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-black">
              <Utensils size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                Table {tableName} • Active Dining Order
              </h3>
              <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">
                {order ? order.order_number : "Running Table Order"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Running Items List */}
        {order && order.items && order.items.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {it.quantity}x
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{it.product_name || it.item_name}</span>
                    </div>
                    {it.selected_variant && (
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold pl-8">
                        Option: {it.selected_variant}
                      </p>
                    )}
                    {it.selected_addons && it.selected_addons.length > 0 && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold pl-8">
                        + {it.selected_addons.join(", ")}
                      </p>
                    )}
                    {it.kitchen_note && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic pl-8">
                        "{it.kitchen_note}"
                      </p>
                    )}
                  </div>

                  <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                    ₹{it.line_total || it.total_price || (it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 font-mono text-xs text-slate-700 dark:text-slate-200 font-bold">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>GST (5%):</span>
                <span>₹{order.total_tax}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>Total Running Bill:</span>
                <span className="text-rose-600 dark:text-rose-400">₹{order.grand_total}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <ShoppingBag size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold text-slate-400">No active items for Table {tableName}.</p>
          </div>
        )}

        {/* Modal Footer Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onAddMoreItems(tableName)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus size={15} />
            <span>+ Add More Items</span>
          </button>

          <button
            onClick={handleServeOrder}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Check size={15} />
            <span>Mark Served</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveTableModal;
