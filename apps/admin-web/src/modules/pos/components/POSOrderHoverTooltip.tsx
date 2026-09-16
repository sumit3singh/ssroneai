import React, { useState } from "react";
import { POSOrder } from "../types";
import { renderSafeString } from "../utils/renderSafeString";

interface POSOrderHoverTooltipProps {
  order: POSOrder;
  children: React.ReactNode;
}

export const POSOrderHoverTooltip: React.FC<POSOrderHoverTooltipProps> = ({ order, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Position tooltip 15px right and 15px down from cursor, staying within viewport boundaries
    const x = Math.min(e.clientX + 15, window.innerWidth - 330);
    const y = Math.min(e.clientY + 15, window.innerHeight - 360);
    setPos({ x, y });
  };

  if (!order) return <>{children}</>;

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

  return (
    <div
      className="inline-block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {isHovered && (
        <div
          style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
          className="fixed z-[9999] w-80 bg-card/95 backdrop-blur-md border border-primary/30 shadow-2xl rounded-lg p-3 text-xs pointer-events-none space-y-2 animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {/* Tooltip Header Bar */}
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-xs text-primary">{renderSafeString(order.order_number)}</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                {(order.order_mode || order.order_type || "DINE_IN").toUpperCase()}
              </span>
            </div>
            <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              {(order.status || "OPEN").toUpperCase()}
            </span>
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
          <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5 border-t border-b border-border/60 py-1.5">
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

          {/* Financial Summary */}
          <div className="flex items-center justify-between font-extrabold text-xs pt-0.5">
            <span className="text-muted-foreground font-semibold">Net Payable</span>
            <span className="font-mono text-primary text-sm font-black">₹{netAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
