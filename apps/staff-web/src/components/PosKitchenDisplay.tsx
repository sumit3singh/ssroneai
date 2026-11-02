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
  AlertTriangle,
  Utensils,
  ChevronLeft
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { RunningOrder } from "./ActiveOrdersTracker";

interface PosKitchenDisplayProps {
  orders: RunningOrder[];
  onAppendOrderToTable: (tableNumber: string) => void;
  onPrintThermalKOT: (order: RunningOrder) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onBack?: () => void;
}

export const PosKitchenDisplay: React.FC<PosKitchenDisplayProps> = ({
  orders,
  onAppendOrderToTable,
  onPrintThermalKOT,
  onUpdateOrderStatus,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (o.table_number || "").toLowerCase().includes(q) ||
        (o.order_number || "").toLowerCase().includes(q) ||
        o.items.some((it: any) =>
          (it.product_name || it.item_name || "").toLowerCase().includes(q)
        )
      );
    });
  }, [orders, searchQuery]);

  // Group orders into KDS columns
  const newOrders = filteredOrders.filter((o) => (o.status || "pending").toLowerCase() === "pending");
  const preparingOrders = filteredOrders.filter(
    (o) => (o.status || "").toLowerCase() === "preparing" || (o.status || "").toLowerCase() === "cooking"
  );
  const readyOrders = filteredOrders.filter((o) => (o.status || "").toLowerCase() === "ready");
  const servedOrders = filteredOrders.filter((o) => (o.status || "").toLowerCase() === "served");

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Live KDS Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-pos-border shadow-2xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onBack();
              }}
              className="min-h-[36px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 border border-slate-200"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-pos-primary-light text-pos-primary flex items-center justify-center shrink-0">
            <ChefHat size={22} />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-pos-text">
              Kitchen Display System (KDS) & KOT Tracker
            </h3>
            <p className="text-xs text-pos-muted">
              Live floor order preparation pipeline & table pickup alerts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pos-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Table # or KOT #..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-pos-bg border border-pos-border text-xs text-pos-text placeholder-pos-muted focus:outline-none focus:ring-1 focus:ring-pos-primary"
          />
        </div>
      </div>

      {/* 4 COLUMNS KDS PIPELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-pos-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h4 className="font-black text-xs uppercase tracking-wider text-pos-text">
                New Tickets
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-6 text-center text-pos-muted text-xs bg-white rounded-2xl border border-dashed border-pos-border">
                No new tickets
              </div>
            ) : (
              newOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  onAppendOrderToTable={onAppendOrderToTable}
                  onPrintThermalKOT={onPrintThermalKOT}
                  onUpdateStatus={onUpdateOrderStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING (Cooking on Wok / Oven) */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-pos-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-amber-600 animate-bounce" />
              <h4 className="font-black text-xs uppercase tracking-wider text-pos-text">
                Cooking / Prep
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-6 text-center text-pos-muted text-xs bg-white rounded-2xl border border-dashed border-pos-border">
                No tickets preparing
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  onAppendOrderToTable={onAppendOrderToTable}
                  onPrintThermalKOT={onPrintThermalKOT}
                  onUpdateStatus={onUpdateOrderStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE (Pickup Counter Alert) */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-emerald-700 animate-pulse" />
              <h4 className="font-black text-xs uppercase tracking-wider text-emerald-900">
                Ready to Serve
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-6 text-center text-pos-muted text-xs bg-white rounded-2xl border border-dashed border-pos-border">
                No plated tickets waiting
              </div>
            ) : (
              readyOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  onAppendOrderToTable={onAppendOrderToTable}
                  onPrintThermalKOT={onPrintThermalKOT}
                  onUpdateStatus={onUpdateOrderStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: SERVED */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white border border-pos-border shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-pos-muted" />
              <h4 className="font-black text-xs uppercase tracking-wider text-pos-text">
                Delivered / Served
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-pos-bg text-pos-muted border border-pos-border">
              {servedOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {servedOrders.length === 0 ? (
              <div className="p-6 text-center text-pos-muted text-xs bg-white rounded-2xl border border-dashed border-pos-border">
                No completed items yet
              </div>
            ) : (
              servedOrders.map((ord) => (
                <KdsTicketCard
                  key={ord.id}
                  order={ord}
                  onAppendOrderToTable={onAppendOrderToTable}
                  onPrintThermalKOT={onPrintThermalKOT}
                  onUpdateStatus={onUpdateOrderStatus}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual KOT Ticket Card
const KdsTicketCard: React.FC<{
  order: RunningOrder;
  onAppendOrderToTable: (t: string) => void;
  onPrintThermalKOT: (o: RunningOrder) => void;
  onUpdateStatus?: (id: string, st: string) => void;
}> = ({ order, onAppendOrderToTable, onPrintThermalKOT, onUpdateStatus }) => {
  const status = (order.status || "pending").toLowerCase();
  const isPending = status === "pending";
  const isPreparing = status === "preparing" || status === "cooking";
  const isReady = status === "ready";
  const isServed = status === "served";

  // Elapsed duration in minutes
  const elapsed = order.created_at
    ? Math.max(0, Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000))
    : 4;

  const isDelayed = elapsed > 20;

  return (
    <div
      className={`p-3.5 rounded-2xl border bg-white shadow-2xs flex flex-col justify-between space-y-3 transition ${
        isReady
          ? "border-emerald-500 ring-2 ring-emerald-500/30"
          : isDelayed
          ? "border-rose-400 bg-rose-50/20"
          : "border-pos-border hover:border-pos-primary"
      }`}
    >
      {/* Ticket Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-pos-primary text-white font-mono font-black text-xs flex items-center justify-center">
              {order.table_number}
            </span>
            <div>
              <h4 className="font-black text-sm text-pos-text">
                Table {order.table_number}
              </h4>
              <p className="text-[10px] font-mono text-pos-muted">
                KOT #{order.order_number}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isDelayed
                  ? "bg-rose-100 text-rose-800"
                  : elapsed > 12
                  ? "bg-amber-100 text-amber-800"
                  : "bg-pos-bg text-pos-muted"
              }`}
            >
              <Clock size={11} /> {elapsed}m
            </span>
            {isDelayed && (
              <span className="block text-[9px] font-mono font-bold text-rose-600 mt-0.5">
                RUSH / DELAYED
              </span>
            )}
          </div>
        </div>

        {/* Ticket Items */}
        <div className="mt-2.5 pt-2 border-t border-pos-border space-y-1.5">
          {order.items.map((it: any, idx: number) => {
            const name = it.product_name || it.item_name || it.name || "Dish Item";
            return (
              <div key={idx} className="flex items-start justify-between text-xs">
                <div className="min-w-0 flex-1 pr-1">
                  <span className="font-extrabold text-pos-text">
                    {it.quantity}x {name}
                  </span>
                  {it.selected_variant && (
                    <span className="block text-[10px] text-pos-primary font-mono font-bold">
                      ↳ {it.selected_variant}
                    </span>
                  )}
                  {it.selected_addons && it.selected_addons.length > 0 && (
                    <span className="block text-[10px] text-emerald-800 font-mono">
                      ↳ + {it.selected_addons.join(", ")}
                    </span>
                  )}
                  {it.kitchen_note && (
                    <span className="block text-[10px] text-amber-800 italic font-semibold">
                      * {it.kitchen_note}
                    </span>
                  )}
                </div>
                <span className="font-mono text-pos-muted text-xs shrink-0">
                  ₹{it.line_total || it.total_price || (it.unit_price * it.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Action Buttons (Large Touch Hitboxes) */}
      <div className="pt-2 border-t border-pos-border space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-pos-muted">Amount:</span>
          <span className="font-black text-sm text-pos-text">₹{order.grand_total}</span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {/* Action 1: Progress Status */}
          {isPending && onUpdateStatus && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onUpdateStatus(order.id, "preparing");
              }}
              className="flex-1 min-h-[36px] px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
            >
              <Flame size={13} />
              <span>Start Cooking</span>
            </button>
          )}

          {isPreparing && onUpdateStatus && (
            <button
              type="button"
              onClick={() => {
                sound.itemAdd();
                onUpdateStatus(order.id, "ready");
              }}
              className="flex-1 min-h-[36px] px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
            >
              <Bell size={13} />
              <span>Mark Ready</span>
            </button>
          )}

          {isReady && onUpdateStatus && (
            <button
              type="button"
              onClick={() => {
                sound.itemAdd();
                onUpdateStatus(order.id, "served");
              }}
              className="flex-1 min-h-[36px] px-2 rounded-xl bg-pos-primary hover:bg-pos-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
            >
              <CheckCircle2 size={13} />
              <span>Deliver to Table</span>
            </button>
          )}

          {/* Action 2: Reprint Thermal Ticket */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onPrintThermalKOT(order);
            }}
            title="Print Thermal Ticket"
            className="min-h-[36px] px-2.5 rounded-xl border border-pos-border bg-pos-bg hover:bg-slate-200 text-pos-text flex items-center justify-center cursor-pointer transition active:scale-95 shadow-2xs"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
