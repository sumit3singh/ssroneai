import React, { useState, useEffect } from "react";
import { Clock, Check, Play, AlertCircle } from "lucide-react";

export interface KDSTicketItem {
  name: string;
  quantity: number;
  variant?: string;
  addons?: string[];
  kitchen_note?: string;
  station?: string;
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
  items: KDSTicketItem[];
}

interface KDSTicketCardProps {
  ticket: KDSTicket;
  onUpdateStatus: (ticketId: string, currentStatus: string) => void;
}

export const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  ticket,
  onUpdateStatus,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isOverdue = minutes >= 10;
  const isWarning = minutes >= 5 && minutes < 10;
  const isPreparing = ticket.status === "preparing";

  let headerStyle = "bg-slate-50 border-b border-slate-200 text-slate-900";
  let timerBadge = "bg-slate-200/80 text-slate-700 font-mono font-bold";
  let statusTag = "Pending";

  if (isOverdue) {
    headerStyle = "bg-rose-50 border-b border-rose-200 text-rose-900";
    timerBadge = "bg-rose-100 text-rose-800 font-mono font-black animate-pulse border border-rose-300";
    statusTag = "OVERDUE (>10m)";
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between overflow-hidden">
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
        {ticket.items.map((item, idx) => (
          <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-start gap-2.5">
              <span className="font-mono font-black text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded border border-slate-200 dark:border-slate-700 shrink-0">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white block leading-snug">
                  {item.name}
                </span>

                {item.variant && (
                  <span className="inline-block text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    Option: {item.variant}
                  </span>
                )}

                {item.addons && item.addons.length > 0 && (
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                    + {item.addons.join(", ")}
                  </div>
                )}

                {item.kitchen_note && (
                  <div className="mt-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md p-2 text-xs text-amber-900 dark:text-amber-300 font-medium flex items-center gap-1.5">
                    <AlertCircle size={13} className="shrink-0 text-amber-600" />
                    <span>Note: {item.kitchen_note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Action with 44px touch target (Sky Blue) */}
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
