import React, { useState } from "react";
import { Clock, ChefHat, CheckCircle2, RefreshCw, X, Receipt, Edit3, ArrowRight } from "lucide-react";
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

  const filteredOrders = orders.filter((o) => isStatusMatch(o.status, filterStatus));

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
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ChefHat size={22} className="text-indigo-600 dark:text-indigo-400" />
              Live Order & KOT Status Tracker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track running table orders, monitor kitchen prep state, and edit or recall bills.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
          {[
            { id: "ALL", label: "All Active Orders", count: orders.length },
            { id: "KOT_SENT", label: "KOT Sent", count: orders.filter((o) => isStatusMatch(o.status, "KOT_SENT")).length },
            { id: "IN_KITCHEN", label: "In Kitchen", count: orders.filter((o) => isStatusMatch(o.status, "IN_KITCHEN")).length },
            { id: "READY", label: "Ready", count: orders.filter((o) => isStatusMatch(o.status, "READY")).length },
            { id: "COMPLETED", label: "Settled", count: orders.filter((o) => isStatusMatch(o.status, "COMPLETED")).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
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

        {/* Orders List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <ChefHat size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                No active orders found matching this status.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id || order.order_number}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-indigo-500/40 transition-all shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.status || "KOT_SENT")}
                    <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {order.order_mode || order.order_type || "DINE_IN"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    {order.table_name && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                        Table: {order.table_name}
                      </span>
                    )}
                    {order.waiter_name && <span>Waiter: {order.waiter_name}</span>}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {order.items?.map((item: any, idx: number) => (
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
                      {item.addons && item.addons.length > 0 && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">
                          +{item.addons.map((a: any) => a.name).join(", ")}
                        </span>
                      )}
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                        ×{item.quantity}
                      </span>
                    </span>
                  ))}
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
                        className="h-8 text-2xs font-extrabold gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit Order</span>
                      </Button>
                    )}

                    {onPrintReceipt && (
                      <Button
                        size="sm"
                        onClick={() => onPrintReceipt(order)}
                        className="h-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-2xs font-extrabold gap-1 cursor-pointer"
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
