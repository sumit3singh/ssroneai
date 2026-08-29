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

  // Color Coding for Chef Clarity
  let headerBg = "bg-slate-800 text-white";
  let timerClass = "text-slate-300";

  if (isOverdue) {
    headerBg = "bg-red-600 text-white";
    timerClass = "text-white font-black animate-pulse";
  } else if (isWarning) {
    headerBg = "bg-amber-600 text-white";
    timerClass = "text-white font-bold";
  } else if (isPreparing) {
    headerBg = "bg-blue-600 text-white";
    timerClass = "text-white font-bold";
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 ${headerBg} flex items-center justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black uppercase tracking-wide">
              {ticket.table_number ? `Table ${ticket.table_number}` : "Takeaway"}
            </span>
            <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded uppercase">
              {ticket.order_source === "customer_web" ? "QR Order" : ticket.order_source === "waiter_pad" ? "Waiter Pad" : "POS"}
            </span>
          </div>
          <p className="font-mono text-[10px] opacity-80 font-bold">{ticket.order_number}</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1 font-mono text-sm ${timerClass}`}>
          <Clock size={14} />
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Item List */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
        {ticket.items.map((item, idx) => (
          <div key={idx} className="border-b border-slate-100 dark:border-slate-800/80 pb-2.5 last:border-0 last:pb-0">
            <div className="flex items-start gap-2.5">
              <span className="font-mono font-black text-sm px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md shrink-0">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">
                  {item.name}
                </span>

                {item.variant && (
                  <span className="inline-block text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    Option: {item.variant}
                  </span>
                )}

                {item.addons && item.addons.length > 0 && (
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    + {item.addons.join(", ")}
                  </div>
                )}

                {item.kitchen_note && (
                  <div className="mt-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0 text-amber-600" />
                    <span>Note: {item.kitchen_note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bump Button */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onUpdateStatus(ticket.id || ticket.order_number, ticket.status)}
          className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
            isPreparing
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
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
