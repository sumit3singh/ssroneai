import React, { useMemo } from "react";
import { Flame, CheckCircle, Clock, Utensils, AlertCircle } from "lucide-react";
import { KDSTicket } from "./KDSTicketCard";

interface KDSAggregatedViewProps {
  orders: KDSTicket[];
  onCompleteItemBatch?: (itemName: string) => void;
}

interface AggregatedItem {
  key: string;
  name: string;
  variant?: string;
  addons: string[];
  totalQty: number;
  dineInQty: number;
  takeawayQty: number;
  deliveryQty: number;
  orderNumbers: string[];
  kitchenNotes: string[];
}

export default function KDSAggregatedView({ orders = [], onCompleteItemBatch }: KDSAggregatedViewProps) {
  // Aggregate items across all active kitchen orders by (Name + Variant + Addons)
  const aggregatedItems = useMemo(() => {
    const map = new Map<string, AggregatedItem>();

    if (!Array.isArray(orders)) return [];

    orders.forEach((order) => {
      if (!order || !order.items || !Array.isArray(order.items)) return;
      if (order.status === "completed" || order.status === "ready") return;

      order.items.forEach((item: any) => {
        if (!item) return;
        const dishName = String(item.name || item.product_name || item.item_name || "Dish Item").trim();
        
        // Extract variant option name
        const variantName = typeof item.variant === "string"
          ? item.variant
          : (item.variant?.name || item.variant_name || "");

        // Extract addons string array
        const rawAddons = item.addons || item.selected_addons || [];
        const addonsList = Array.isArray(rawAddons)
          ? rawAddons
              .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || "")))
              .filter(Boolean)
          : [];

        // Build unique aggregation key
        const key = `${dishName}__${variantName}__${[...addonsList].sort().join(",")}`;

        const existing = map.get(key) || {
          key,
          name: dishName,
          variant: variantName,
          addons: addonsList,
          totalQty: 0,
          dineInQty: 0,
          takeawayQty: 0,
          deliveryQty: 0,
          orderNumbers: [],
          kitchenNotes: [],
        };

        existing.totalQty += Number(item.quantity || 1);

        if (order.order_type === "dine_in" || order.order_source === "waiter_pad") {
          existing.dineInQty += Number(item.quantity || 1);
        } else if (order.order_type === "takeaway") {
          existing.takeawayQty += Number(item.quantity || 1);
        } else {
          existing.deliveryQty += Number(item.quantity || 1);
        }

        if (order.order_number && !existing.orderNumbers.includes(order.order_number)) {
          existing.orderNumbers.push(order.order_number);
        }

        if (item.kitchen_note && !existing.kitchenNotes.includes(item.kitchen_note)) {
          existing.kitchenNotes.push(item.kitchen_note);
        }

        map.set(key, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [orders]);


  return (
    <div className="space-y-4">
      {/* Header SLA Summary Banner */}
      <div className="bg-gradient-to-r from-[#103B2B] via-[#164e39] to-emerald-950 border border-emerald-800/40 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
              BATCH PRODUCTION QUEUE (VARIANT & ADDON AGGREGATION)
            </h3>
            <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
              Items grouped by dish name, size portion, and extra addons across {orders.length} active kitchen tickets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-center shrink-0">
          <div>
            <div className="text-xl sm:text-2xl font-black text-orange-500 font-mono">
              {aggregatedItems.reduce((acc, curr) => acc + curr.totalQty, 0)}
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Portions
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-sky-500 font-mono">
              {aggregatedItems.length}
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Unique Prep Batches
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Aggregated Items */}
      {aggregatedItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xs space-y-3">
          <Utensils size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">No Active Kitchen Production Items</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            New KOT orders submitted from POS or Customer Menu will appear aggregated here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aggregatedItems.map((item) => (
            <div
              key={item.key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="space-y-2.5">
                {/* Header Title & Quantity Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                      {item.name}
                    </h4>
                    {/* Portion Size Variant Chip */}
                    {item.variant && (
                      <span className="inline-block text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 mt-1">
                        Option: {item.variant}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black font-mono text-white bg-orange-600 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                    ×{item.totalQty}
                  </div>
                </div>

                {/* Extra Addons List Badge */}
                {item.addons && item.addons.length > 0 && (
                  <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                    + Addons: {item.addons.join(", ")}
                  </div>
                )}

                {/* Channel Breakdown */}
                <div className="flex flex-wrap gap-1 text-[10px] font-bold pt-0.5">
                  {item.dineInQty > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Dine-in: {item.dineInQty}
                    </span>
                  )}
                  {item.takeawayQty > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Takeaway: {item.takeawayQty}
                    </span>
                  )}
                  {item.deliveryQty > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Online: {item.deliveryQty}
                    </span>
                  )}
                </div>

                {/* Order Numbers List */}
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <strong className="text-slate-700 dark:text-slate-300">Orders:</strong> {item.orderNumbers.join(", ")}
                </div>

                {/* Kitchen Special Instructions */}
                {item.kitchenNotes.length > 0 && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-1">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{item.kitchenNotes.join(" | ")}</span>
                  </div>
                )}
              </div>

              {/* Mark Batch Prepared Action Button */}
              {onCompleteItemBatch && (
                <button
                  type="button"
                  onClick={() => onCompleteItemBatch(item.key)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
                >
                  <CheckCircle size={14} />
                  <span>MARK BATCH PREPARED</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
