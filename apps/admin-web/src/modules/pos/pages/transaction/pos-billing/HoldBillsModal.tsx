import React from "react";
import { Pause, Play, X, Trash2, Clock, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSCartItem } from "../../types";

export interface HeldBill {
  id: string;
  customerName?: string;
  orderType: string;
  tableName?: string;
  items: POSCartItem[];
  subtotal: number;
  heldAt: string;
  selectedTableId?: number | string | null;
  selectedCustomerId?: number | string | null;
  selectedWaiterId?: number | string | null;
  orderNotes?: string;
  discountType?: "amount" | "percent";
  discountValue?: number;
  applyGst?: boolean;
}

interface HoldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBill[];
  onRecallBill: (bill: HeldBill) => void;
  onDeleteBill: (id: string) => void;
}

export const HoldBillsModal: React.FC<HoldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onRecallBill,
  onDeleteBill
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Pause size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Held & Paused Bills
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {heldBills.length} Paused
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recall held bills back into cart or discard paused transactions.
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

        {/* List of Held Bills */}
        {heldBills.length === 0 ? (
          <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Pause size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No held bills saved in POS memory.</p>
            <p className="text-xs text-slate-400">Use <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono border">F1</kbd> to hold bills while taking new orders.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
            {heldBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-all shadow-2xs group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {bill.tableName ? `Table ${bill.tableName}` : bill.customerName || "Walk-in Guest"}
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <UtensilsCrossed size={10} />
                      {bill.orderType}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="flex flex-wrap items-center gap-1 text-2xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold flex items-center gap-1">
                      <ShoppingBag size={11} className="text-slate-400" />
                      {bill.items.reduce((acc, i) => acc + i.quantity, 0)} Items:
                    </span>
                    <span className="truncate max-w-[280px] font-medium text-slate-600 dark:text-slate-300">
                      {bill.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    Held at {bill.heldAt}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-2 sm:pt-0">
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                    ₹{bill.subtotal}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => {
                        onRecallBill(bill);
                        onClose();
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs h-8 px-3 rounded-xl shadow-md shadow-amber-500/20 gap-1.5 cursor-pointer"
                    >
                      <Play size={13} fill="currentColor" /> Recall Bill
                    </Button>
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors cursor-pointer"
                      title="Discard Held Bill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
