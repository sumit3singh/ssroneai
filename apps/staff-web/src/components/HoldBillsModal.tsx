import React, { useState } from "react";
import { Pause, Play, Trash2, X, Clock, ShoppingBag, Plus } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

export interface HeldBill {
  id: string;
  orderNumber: string;
  tableName: string;
  items: any[];
  subtotal: number;
  total: number;
  heldAt: string;
  note?: string;
}

interface HoldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBill[];
  onRecallBill: (bill: HeldBill) => void;
  onDeleteHeldBill: (id: string) => void;
  onHoldCurrentCart: (note: string) => void;
  canHoldCurrentCart: boolean;
  currentTable: string;
}

export const HoldBillsModal: React.FC<HoldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onRecallBill,
  onDeleteHeldBill,
  onHoldCurrentCart,
  canHoldCurrentCart,
  currentTable,
}) => {
  const [newNote, setNewNote] = useState("");
  const [showNewHoldForm, setShowNewHoldForm] = useState(false);

  if (!isOpen) return null;

  const handleConfirmHoldCurrent = () => {
    sound.tap();
    onHoldCurrentCart(newNote.trim() || `Held for Table ${currentTable}`);
    setNewNote("");
    setShowNewHoldForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-xs">
              <Pause size={18} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Held Bills &amp; Suspended Orders
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {heldBills.length} order{heldBills.length === 1 ? "" : "s"} currently paused
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Quick Action: Hold Current Active Cart */}
          {canHoldCurrentCart && !showNewHoldForm && (
            <button
              type="button"
              onClick={() => setShowNewHoldForm(true)}
              className="w-full p-3 rounded-2xl bg-white border-2 border-dashed border-[#0B3B2C]/30 hover:border-[#0B3B2C] text-[#0B3B2C] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
            >
              <Plus size={16} />
              <span>Hold Current Order for Table {currentTable}</span>
            </button>
          )}

          {/* New Hold Form */}
          {showNewHoldForm && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] space-y-2.5 shadow-2xs">
              <span className="text-xs font-black text-slate-900 block">
                Hold Current Order (Table {currentTable})
              </span>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Reason or customer name (e.g., Guest stepped out to ATM)..."
                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewHoldForm(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmHoldCurrent}
                  className="px-4 py-1.5 rounded-xl bg-[#0B3B2C] text-white text-xs font-black"
                >
                  Confirm Hold
                </button>
              </div>
            </div>
          )}

          {/* Held Bills List */}
          {heldBills.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Pause size={32} className="mx-auto opacity-40" />
              <p className="text-xs font-bold">No bills currently on hold.</p>
              <p className="text-[11px]">When a guest steps away or delays payment, hold their cart here to free up the terminal.</p>
            </div>
          ) : (
            heldBills.map((bill) => (
              <div
                key={bill.id}
                className="p-3.5 rounded-2xl bg-white border border-[#E8E4DA] shadow-xs flex items-center justify-between gap-3 hover:border-[#0B3B2C]/40 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-[#0B3B2C] text-white text-[10px] font-black uppercase font-mono">
                      Table {bill.tableName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      #{bill.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold truncate mt-1">
                    {bill.note || "No note provided"}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                    <span>{bill.items.length} items</span>
                    <span>•</span>
                    <span className="font-black text-slate-900">₹{bill.total}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(bill.heldAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Recall Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      onRecallBill(bill);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#0B3B2C] hover:bg-[#072E22] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    <Play size={13} fill="currentColor" />
                    <span>Recall</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      onDeleteHeldBill(bill.id);
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer transition"
                    title="Delete held bill"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
