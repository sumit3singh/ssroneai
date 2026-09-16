import React, { useState, useEffect } from "react";
import { Clock, Check, Play, AlertCircle, BellRing } from "lucide-react";

export interface KDSTicketItem {
  id?: number;
  name: string;
  quantity: number;
  variant?: string;
  addons?: string[];
  kitchen_note?: string;
  station?: string;
  kds_status?: string;
}

export interface KDSTicket {
  id: string;
  order_number: string;
  table_number?: string;
  order_source?: string;
  order_type?: string;
  status: "pending" | "preparing" | "ready" | "completed";
  created_at: string;
  station?: string;
  is_alerted?: boolean;
  items: KDSTicketItem[];
}

interface KDSTicketCardProps {
  ticket: KDSTicket;
  onUpdateStatus: (ticketId: string, currentStatus: string) => void;
  onSelectRecipeItem?: (itemName: string) => void;
}

export const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  ticket,
  onUpdateStatus,
  onSelectRecipeItem,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const calculateElapsed = () => {
      if (!ticket.created_at) return;
      const start = new Date(ticket.created_at).getTime();
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsedSeconds(diff);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [ticket.created_at]);

  const toggleItemCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isOverdue = minutes >= 10;
  const isWarning = minutes >= 5 && minutes < 10;
  const isPreparing = ticket.status === "preparing";
  const isAlerted = Boolean(ticket.is_alerted);

  let headerStyle = "bg-slate-50 border-b border-slate-200 text-slate-900";
  let timerBadge = "bg-slate-200/80 text-slate-700 font-mono font-bold";
  let statusTag = "Pending";

  if (isAlerted || isOverdue) {
    headerStyle = "bg-rose-100 dark:bg-rose-950/80 border-b border-rose-300 text-rose-950 dark:text-rose-200 animate-pulse";
    timerBadge = "bg-rose-500 text-white font-mono font-black animate-bounce border border-rose-600 shadow-xs";
    statusTag = isAlerted ? "SUPERVISOR ALERT!" : "OVERDUE (>10m)";
  } else if (isWarning) {
    headerStyle = "bg-amber-50 border-b border-amber-200 text-amber-900";
    timerBadge = "bg-amber-100 text-amber-800 font-mono font-bold border border-amber-300";
    statusTag = "Warning (5m+)";
  } else if (isPreparing) {
    headerStyle = "bg-sky-50 border-b border-sky-200 text-sky-950";
    timerBadge = "bg-sky-100 text-sky-800 font-mono font-bold border border-sky-300";
    statusTag = "Cooking";
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-xl shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${
      isAlerted ? "border-2 border-rose-500 shadow-lg shadow-rose-500/20 animate-pulse" : "border-slate-200/80 dark:border-slate-800"
    }`}>
      {/* Supervisor Emergency Alert Banner */}
      {isAlerted && (
        <div className="bg-rose-600 text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-1.5">
            <BellRing size={14} className="animate-bounce" />
            <span>MANAGER EXPEDITE ALERT</span>
          </div>
          <span>LOOK INTO DISH</span>
        </div>
      )}
      {/* Header Bar */}
      <div className={`px-4 py-3 ${headerStyle} flex items-center justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
              {ticket.table_number ? `Table ${ticket.table_number}` : "Takeaway"}
            </span>
            <span className="text-[10px] font-mono font-bold bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {ticket.order_source === "customer_web" ? "QR Order" : ticket.order_source === "waiter_pad" ? "Waiter Pad" : "POS"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[11px] text-slate-500 font-semibold">{ticket.order_number}</span>
            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">• {statusTag}</span>
          </div>
        </div>

        {/* Timer Box */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${timerBadge}`}>
          <Clock size={13} />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Item List */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
        {ticket.items.map((item, idx) => {
          const isItemDone = checkedItems[idx] || item.kds_status === "ready";

          return (
            <div
              key={idx}
              className={`border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0 transition-opacity ${
                isItemDone ? "opacity-40 line-through" : ""
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(isItemDone)}
                  onChange={() => toggleItemCheck(idx)}
                  className="mt-1 w-4 h-4 cursor-pointer text-sky-600 rounded border-slate-300"
                />
                <span className="font-mono font-black text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-200 dark:border-slate-700 shrink-0">
                  {item.quantity}x
                </span>
                <div className="flex-1">
                  <span
                    onClick={() => onSelectRecipeItem?.(item.name)}
                    className="font-bold text-xs text-slate-900 dark:text-white block leading-snug cursor-pointer hover:text-sky-500 hover:underline"
                    title="Click to view recipe steps"
                  >
                    {item.name} 📖
                  </span>

                  {(() => {
                    const vName = typeof item.variant === "string" ? item.variant : (item.variant?.name || item.variant_name || "");
                    if (!vName) return null;
                    return (
                      <div className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 mt-0.5 inline-block">
                        Option: {vName}
                      </div>
                    );
                  })()}

                  {(() => {
                    const rawAddons = item.addons || item.selected_addons || [];
                    const addonStr = Array.isArray(rawAddons)
                      ? rawAddons
                          .map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || "")))
                          .filter(Boolean)
                          .join(", ")
                      : "";
                    if (!addonStr) return null;
                    return (
                      <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-0.5 block">
                        + Addons: {addonStr}
                      </div>
                    );
                  })()}


                  {item.kitchen_note && (
                    <div className="mt-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md p-2 text-xs text-amber-900 dark:text-amber-300 font-medium flex items-center gap-1.5">
                      <AlertCircle size={13} className="shrink-0 text-amber-600" />
                      <span>Note: {item.kitchen_note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action with 44px touch target */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onUpdateStatus(ticket.id || ticket.order_number, ticket.status)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer bg-sky-600 hover:bg-sky-700 text-white active:scale-[0.99]"
        >
          {isPreparing ? (
            <>
              <Check size={16} />
              <span>MARK READY / BUMP</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>START COOKING</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KDSTicketCard;
