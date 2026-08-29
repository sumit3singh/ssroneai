import React, { useState } from "react";
import { Package, CheckSquare, Square, CheckCircle2, ShoppingBag } from "lucide-react";
import { KDSTicket } from "./KDSTicketCard";

interface KDSPackingViewProps {
  tickets: KDSTicket[];
  onMarkPacked: (ticketId: string) => void;
}

export const KDSPackingView: React.FC<KDSPackingViewProps> = ({
  tickets,
  onMarkPacked,
}) => {
  const [checklistState, setChecklistState] = useState<Record<string, Record<string, boolean>>>({});

  const defaultChecklist = [
    "Dishes Packed",
    "Extra Sauces & Dips",
    "Paper Tissues",
    "Cutlery & Spoons",
    "Carry Bag Sealed",
  ];

  const toggleCheck = (ticketId: string, item: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || {}),
        [item]: !prev[ticketId]?.[item],
      },
    }));
  };

  const isAllChecked = (ticketId: string) => {
    const ticketState = checklistState[ticketId] || {};
    return defaultChecklist.every((c) => ticketState[c] === true);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Package size={18} className="text-emerald-500" />
            PACKING STATION & TAKEAWAY VERIFICATION
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Interactive packing checklist for Takeaway & Delivery orders to prevent missing items.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Orders to Pack: <strong className="text-emerald-400">{tickets.length}</strong>
          </span>
        </div>
      </div>

      {/* Packing Order Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => {
          const allChecked = isAllChecked(ticket.id || ticket.order_number);

          return (
            <div
              key={ticket.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
            >
              {/* Ticket Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white block">
                    TOKEN #{ticket.order_number.slice(-4)}
                  </span>
                  <p className="font-mono text-2xs text-slate-400 font-bold">{ticket.order_number}</p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {ticket.order_source === "customer_web" ? "TAKEAWAY" : "DELIVERY"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Dish Items:</p>
                {ticket.items.map((item, idx) => (
                  <div key={idx} className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono font-black text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {item.quantity}x
                    </span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Packing Checklist */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Packing Checklist:</p>
                <div className="space-y-1.5">
                  {defaultChecklist.map((checkItem) => {
                    const checked = checklistState[ticket.id || ticket.order_number]?.[checkItem] || false;
                    return (
                      <button
                        key={checkItem}
                        type="button"
                        onClick={() => toggleCheck(ticket.id || ticket.order_number, checkItem)}
                        className={`w-full text-left text-xs font-bold p-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
                          checked
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {checked ? <CheckSquare size={15} className="text-emerald-600 shrink-0" /> : <Square size={15} className="text-slate-400 shrink-0" />}
                        <span>{checkItem}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mark Packed Action Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onMarkPacked(ticket.id || ticket.order_number)}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                    allChecked
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{allChecked ? "MARK FULLY PACKED" : "FORCE MARK PACKED"}</span>
                </button>
              </div>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-2">
            <Package size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No active takeaway/delivery orders awaiting packing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KDSPackingView;
