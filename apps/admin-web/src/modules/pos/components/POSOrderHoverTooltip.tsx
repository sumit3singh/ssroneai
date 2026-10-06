import React, { useState, useEffect } from "react";
import { POSOrder } from "../types";
import { renderSafeString } from "../utils/renderSafeString";

interface POSOrderHoverTooltipProps {
  order: POSOrder;
  children: React.ReactNode;
  className?: string;
}

export const POSOrderHoverTooltip: React.FC<POSOrderHoverTooltipProps> = ({ order, children, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState(() => Date.now());

  if (!order) return <>{children}</>;

  const isSettled = ["completed", "settled", "paid", "cancelled"].includes((order.status || "").toLowerCase());

  // Live timer updates once per second when hovered on active order
  useEffect(() => {
    if (!isHovered || isSettled) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isHovered, isSettled]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Position tooltip 15px right and 15px down from cursor, staying within viewport boundaries
    const x = Math.min(e.clientX + 15, window.innerWidth - 330);
    const y = Math.min(e.clientY + 15, window.innerHeight - 380);
    setPos({ x, y });
  };

  const custName = renderSafeString(order.customer_name, "Walk-in Guest");
  const custPhone = renderSafeString(order.customer_phone);
  const tblName = renderSafeString(order.table_name);
  const wtrName = renderSafeString(order.waiter_name);

  const items = order?.items || [];
  const safeNum = (val: any) => {
    const n = parseFloat(String(val));
    return isNaN(n) ? 0 : n;
  };

  const subtotal = safeNum(order.subtotal || items.reduce((sum: number, i: any) => sum + safeNum(i.unit_price || i.price) * safeNum(i.quantity || 1), 0));
  const netAmount = safeNum(order.net_amount || order.grand_total || order.total_amount || subtotal);

  // Source channel detection
  const isFoodApp = ((order.source_channel || (order as any).order_source || "") + "").toLowerCase().includes("customer") ||
    ((order.source_channel || (order as any).order_source || "") + "").toLowerCase().includes("web") ||
    ((order.source_channel || (order as any).order_source || "") + "").toLowerCase().includes("food_app");

  // Order placement time
  const createdDate = order.created_at ? new Date(order.created_at) : null;
  const formattedTime = createdDate && !isNaN(createdDate.getTime())
    ? createdDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;

  // Active running timer calculation
  const startMs = createdDate && !isNaN(createdDate.getTime()) ? createdDate.getTime() : now;
  const diffSec = Math.max(0, Math.floor((now - startMs) / 1000));
  const activeMins = Math.floor(diffSec / 60);
  const activeSecs = diffSec % 60;
  const activeHours = Math.floor(activeMins / 60);
  const timerStr = activeHours > 0
    ? `${activeHours}h ${activeMins % 60}m ${activeSecs}s`
    : `${activeMins}m ${activeSecs}s`;

  // Settled close time & customer stay duration
  const settledRaw = order.settled_at || (order as any).completed_at || order.updated_at;
  const settledDate = settledRaw ? new Date(settledRaw) : null;
  const formattedCloseTime = settledDate && !isNaN(settledDate.getTime())
    ? settledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;

  const endMs = settledDate && !isNaN(settledDate.getTime()) ? settledDate.getTime() : startMs;
  const staySec = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const stayMins = Math.floor(staySec / 60);
  const stayHours = Math.floor(stayMins / 60);
  const stayDurationStr = stayHours > 0
    ? `${stayHours}h ${stayMins % 60}m`
    : `${Math.max(1, stayMins)} mins`;

  const isPaid = (order.payment_status || "").toLowerCase() === "paid";

  return (
    <div
      className={className || "inline-block relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {isHovered && (
        <div
          style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
          className="fixed z-[9999] w-84 bg-card/95 backdrop-blur-md border border-primary/30 shadow-2xl rounded-lg p-3 text-xs pointer-events-none space-y-2 animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {/* Tooltip Header Bar */}
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-black text-xs text-primary">{renderSafeString(order.order_number)}</span>
              {isFoodApp ? (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                  ⭐ Food App
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                  🖥️ POS
                </span>
              )}
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                {(order.order_mode || order.order_type || "DINE_IN").toUpperCase()}
              </span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${
              isSettled
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
            }`}>
              {(order.status || "OPEN").toUpperCase()}
            </span>
          </div>

          {/* Timing & Live Stay Duration Bar */}
          <div className="flex items-center justify-between text-[10px] bg-muted/40 rounded px-2 py-1 border border-border/40 font-mono">
            <span className="flex items-center gap-1 text-muted-foreground">
              <span>🕒 Placed:</span>
              <strong className="text-foreground">{formattedTime || "Just now"}</strong>
            </span>
            {!isSettled ? (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <span>⏱️ Active:</span>
                <span>{timerStr}</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {formattedCloseTime && (
                  <span className="text-muted-foreground">
                    <span>🏁 Closed:</span> <strong className="text-foreground">{formattedCloseTime}</strong>
                  </span>
                )}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>⏱️ Stay: {stayDurationStr}</span>
                </span>
              </div>
            )}
          </div>

          {/* Customer & Table Info */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium flex-wrap gap-1">
            <div className="flex items-center gap-1.5">
              <span>👤 {custName}</span>
              {custPhone && <span className="font-mono text-primary font-bold">📱 {custPhone}</span>}
            </div>
            {tblName && <span>🍽️ Table {tblName}</span>}
            {wtrName && <span>🧑‍🍳 {wtrName}</span>}
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-1 max-h-44 overflow-y-auto pr-0.5 border-t border-b border-border/60 py-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex justify-between border-b border-border/30 pb-0.5">
              <span>Dish / Menu Item</span>
              <span>Qty × Price</span>
            </div>
            {items.length === 0 ? (
              <div className="text-[10px] text-muted-foreground italic py-1 text-center">No items listed in order</div>
            ) : (
              items.map((it: any, idx: number) => {
                const name = it.product_name || it.name || it.item_name || "Dish Item";
                const qty = safeNum(it.quantity || 1);
                const price = safeNum(it.unit_price || it.price || 0);
                const addons = it.selected_addons || it.addons || [];
                const addonStr = Array.isArray(addons)
                  ? addons.map((a: any) => (typeof a === "string" ? a : a.name || a.title || "")).filter(Boolean).join(", ")
                  : "";

                return (
                  <div key={idx} className="flex items-start justify-between text-[11px] font-medium leading-tight py-0.5 border-b border-border/20 last:border-none">
                    <div className="flex-1 pr-2 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-foreground">{name}</span>
                        {it.variant_name && (
                          <span className="text-[9px] font-mono text-primary font-bold">[{it.variant_name}]</span>
                        )}
                      </div>
                      {addonStr && (
                        <div className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold mt-0.5">+ {addonStr}</div>
                      )}
                      {(it.notes || it.preparation_notes || it.special_instructions) && (
                        <div className="text-[9.5px] font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 mt-0.5 font-mono uppercase tracking-tight inline-block">
                          📝 REMARK: {it.notes || it.preparation_notes || it.special_instructions}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-right text-muted-foreground whitespace-nowrap">
                      {qty} × ₹{price} = <strong className="text-foreground font-bold">₹{qty * price}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Financial Summary & Payment Status */}
          <div className="flex items-center justify-between font-extrabold text-xs pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold">Net Payable:</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              }`}>
                {isPaid ? "PAID" : "UNPAID"}
              </span>
            </div>
            <span className="font-mono text-primary text-sm font-black">₹{netAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSOrderHoverTooltip;
