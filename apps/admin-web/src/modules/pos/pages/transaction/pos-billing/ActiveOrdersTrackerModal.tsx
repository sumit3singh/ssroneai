import React, { useState } from "react";
import { Clock, ChefHat, CheckCircle2, RefreshCw, X, Receipt, Edit3, Utensils, User } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../../types";

interface ActiveOrdersTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: POSOrder[];
  onRecallOrderToCart?: (order: POSOrder) => void;
  onPrintReceipt?: (order: POSOrder) => void;
}

export const ActiveOrdersTrackerModal: React.FC<ActiveOrdersTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onRecallOrderToCart,
  onPrintReceipt
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterMode, setFilterMode] = useState<string>("ALL");

  if (!isOpen) return null;

  const isStatusMatch = (status: string, targetTab: string) => {
    const s = (status || "").toUpperCase();
    if (targetTab === "ALL") return true;
    if (targetTab === "KOT_SENT") return s === "KOT_SENT" || s === "PENDING" || s === "OPEN";
    if (targetTab === "IN_KITCHEN") return s === "IN_KITCHEN" || s === "PREPARING";
    if (targetTab === "READY") return s === "READY" || s === "SERVED";
    if (targetTab === "COMPLETED") return s === "COMPLETED" || s === "PAID";
    return true;
  };

  const isModeMatch = (modeStr: string, targetMode: string) => {
    if (targetMode === "ALL") return true;
    const m = (modeStr || "").toLowerCase();
    return m === targetMode.toLowerCase();
  };

  const filteredOrders = orders.filter((o) =>
    isStatusMatch(o.status, filterStatus) &&
    isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode)
  );

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "KOT_SENT":
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
            <Clock size={11} /> KOT Sent
          </span>
        );
      case "IN_KITCHEN":
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase animate-pulse">
            <ChefHat size={11} /> In Kitchen
          </span>
        );
      case "READY":
      case "SERVED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 size={11} /> Ready
          </span>
        );
      case "COMPLETED":
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 size={11} /> Settled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-500 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <ChefHat size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Live Order & KOT Status Tracker
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {orders.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track running table orders, monitor kitchen prep state, and edit or print receipts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Mode & Status Filter Controls */}
        <div className="space-y-2 shrink-0">
          {/* Order Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mr-1">Type:</span>
            {[
              { id: "ALL", label: "All Types", icon: "🍽️" },
              { id: "dine_in", label: "Dine-In", icon: "🍷" },
              { id: "takeaway", label: "Takeaway", icon: "🛍️" },
              { id: "delivery", label: "Delivery", icon: "🚚" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMode(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  filterMode === m.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
                <span className="font-mono text-[10px] opacity-80">
                  ({orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", m.id)).length})
                </span>
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 mr-1">Status:</span>
            {[
              { id: "ALL", label: "All Statuses", count: orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode)).length },
              { id: "KOT_SENT", label: "KOT Sent", count: orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode) && isStatusMatch(o.status, "KOT_SENT")).length },
              { id: "IN_KITCHEN", label: "In Kitchen", count: orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode) && isStatusMatch(o.status, "IN_KITCHEN")).length },
              { id: "READY", label: "Ready", count: orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode) && isStatusMatch(o.status, "READY")).length },
              { id: "COMPLETED", label: "Settled", count: orders.filter((o) => isModeMatch(o.order_mode || o.order_type || "dine_in", filterMode) && isStatusMatch(o.status, "COMPLETED")).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono bg-white/20 dark:bg-black/20 px-1.5 py-0.2 rounded-md text-[10px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <ChefHat size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                No active orders found matching status "{filterStatus}".
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id || order.order_number}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-indigo-500/40 transition-all shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {order.order_number}
                    </span>
                    {getStatusBadge(order.status || "KOT_SENT")}
                    <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Utensils size={10} />
                      {order.order_mode || order.order_type || "DINE_IN"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    {order.table_name && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        Table: {order.table_name}
                      </span>
                    )}
                    {order.waiter_name && (
                      <span className="flex items-center gap-1">
                        <User size={11} /> Waiter: {order.waiter_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {order.items?.map((item: any, idx: number) => {
                    const itemAddons = item.addons || item.selected_addons || item.addon_options || [];
                    const addonText = Array.isArray(itemAddons)
                      ? itemAddons
                          .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || "")))
                          .filter(Boolean)
                          .join(", ")
                      : "";
                    return (
                      <span
                        key={idx}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                      >
                        <span>{item.name || item.product_name || item.item_name || "Item"}</span>
                        {item.variant_name && (
                          <span className="text-[9px] font-mono text-primary bg-primary/10 px-1 rounded-xs">
                            [{item.variant_name}]
                          </span>
                        )}
                        {addonText && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                            +{addonText}
                          </span>
                        )}
                        {(item.notes || item.preparation_notes || item.special_instructions) && (
                          <span className="text-[9px] font-mono font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 uppercase">
                            📝 {item.notes || item.preparation_notes || item.special_instructions}
                          </span>
                        )}
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                          ×{item.quantity}
                        </span>
                      </span>
                    );
                  })}
                </div>


                {/* Footer & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    Total: <span className="text-indigo-600 dark:text-indigo-400">₹{order.net_amount || order.subtotal || 0}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onRecallOrderToCart && !["completed", "paid", "cancelled"].includes((order.status || "").toLowerCase()) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onRecallOrderToCart(order);
                          onClose();
                        }}
                        className="h-8 text-2xs font-extrabold gap-1 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                      >
                        <Edit3 size={13} />
                        <span>Edit Order</span>
                      </Button>
                    )}

                    {onPrintReceipt && (
                      <Button
                        size="sm"
                        onClick={() => onPrintReceipt(order)}
                        className="h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-2xs font-extrabold gap-1 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100"
                      >
                        <Receipt size={13} />
                        <span>Print Bill</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
