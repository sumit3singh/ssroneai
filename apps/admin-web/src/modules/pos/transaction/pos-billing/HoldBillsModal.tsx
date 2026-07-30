import React from "react";
import { Pause, Play, X, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSCartItem } from "../../types";

export interface HeldBill {
  id: string;
  customerName?: string;
  orderType: string;
  tableName?: string;
  items: POSCartItem[];
  subtotal: number;
  heldAt: string;
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
            <Pause size={18} className="text-amber-500" />
            Held / Paused POS Counter Bills ({heldBills.length})
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {heldBills.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground">No held bills currently saved in memory.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {heldBills.map((bill) => (
              <div key={bill.id} className="bg-muted/30 border border-border/70 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-foreground">
                      {bill.tableName ? `Table ${bill.tableName}` : bill.customerName || "Walk-in Guest"}
                    </span>
                    <span className="bg-amber-500/10 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                      {bill.orderType}
                    </span>
                  </div>
                  <p className="text-3xs text-muted-foreground mt-0.5">
                    {bill.items.length} items • Held at {bill.heldAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-foreground mr-2">₹{bill.subtotal}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      onRecallBill(bill);
                      onClose();
                    }}
                    className="bg-primary text-white text-2xs font-bold gap-1"
                  >
                    <Play size={12} /> Recall Bill
                  </Button>
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
