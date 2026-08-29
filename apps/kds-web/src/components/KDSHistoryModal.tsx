import React from "react";
import { X, RotateCcw, CheckCircle } from "lucide-react";
import { KDSTicket } from "./KDSTicketCard";

interface KDSHistoryModalProps {
  completedTickets: KDSTicket[];
  onClose: () => void;
  onRecallTicket: (ticketId: string) => void;
}

export const KDSHistoryModal: React.FC<KDSHistoryModalProps> = ({
  completedTickets,
  onClose,
  onRecallTicket,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-xl p-5 shadow-xl space-y-4 max-h-[80vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-600" />
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              Completed Kitchen Tickets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {completedTickets.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                    {t.table_number ? `Table ${t.table_number}` : "Takeaway"}
                  </span>
                  <span className="font-mono text-2xs text-slate-400 font-bold">
                    {t.order_number}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  {t.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onRecallTicket(t.id || t.order_number);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-2xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shrink-0"
              >
                <RotateCcw size={12} />
                <span>Recall</span>
              </button>
            </div>
          ))}

          {completedTickets.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400 font-bold">
              No completed tickets in history.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KDSHistoryModal;
