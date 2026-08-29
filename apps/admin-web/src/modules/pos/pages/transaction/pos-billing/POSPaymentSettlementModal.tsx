import React, { useState } from "react";
import { CreditCard, Banknote, QrCode, User, X, Check, Calculator, Receipt } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { PaymentMethod } from "../../types";

interface POSPaymentSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  netAmount: number;
  customerName?: string;
  onConfirmSettlement: (paymentMethod: PaymentMethod, tenderAmount: number, changeAmount: number) => Promise<void>;
  isSubmitting?: boolean;
}

export const POSPaymentSettlementModal: React.FC<POSPaymentSettlementModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  netAmount: rawNetAmount,
  customerName = "Walk-in Guest",
  onConfirmSettlement,
  isSubmitting = false,
}) => {
  const netAmount = typeof rawNetAmount === "number" ? rawNetAmount : (parseFloat(String(rawNetAmount)) || 0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH");
  const [tenderAmount, setTenderAmount] = useState<string>(String(netAmount));
  const [customNotes, setCustomNotes] = useState<string>("");

  if (!isOpen) return null;

  const numTender = parseFloat(tenderAmount) || 0;
  const changeDue = Math.max(0, numTender - netAmount);

  const handleTenderQuickAdd = (amt: number) => {
    setTenderAmount(String(amt));
  };

  const handleExactTender = () => {
    setTenderAmount(String(netAmount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === "CASH" && numTender < netAmount) {
      toast.error(`Tender amount (₹${numTender}) is less than net bill amount (₹${netAmount})`);
      return;
    }
    await onConfirmSettlement(selectedMethod, numTender, changeDue);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div>
            <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt size={22} className="text-emerald-600 dark:text-emerald-400" />
              Settle Payment for Bill #{orderNumber}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customer: <span className="font-bold text-slate-700 dark:text-slate-200">{customerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bill Total Display */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
              Total Amount Payable
            </span>
            <span className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
              ₹{netAmount.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-3xs font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              Tax Included
            </span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "CASH", label: "Cash", icon: Banknote, color: "emerald" },
              { id: "UPI", label: "UPI / QR", icon: QrCode, color: "sky" },
              { id: "CARD", label: "Card", icon: CreditCard, color: "indigo" },
              { id: "CUSTOMER_TAB", label: "CRM Credit", icon: User, color: "purple" },
            ].map((method) => {
              const IconComp = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <IconComp size={20} />
                  <span className="text-xs font-black">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender & Change Return Calculator */}
        {selectedMethod === "CASH" && (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Cash Tender Received
              </label>
              <button
                type="button"
                onClick={handleExactTender}
                className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Exact Amount (₹{netAmount.toFixed(0)})
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="number"
                value={tenderAmount}
                onChange={(e) => setTenderAmount(e.target.value)}
                placeholder="Enter Cash Given"
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[100, 200, 500, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleTenderQuickAdd(amt)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-black text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Change Due Output */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-3">
              <span className="text-xs font-black uppercase text-slate-500">Return Change to Customer:</span>
              <span
                className={`font-mono font-black text-lg ${
                  changeDue > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                }`}
              >
                ₹{changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-extrabold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Check size={16} />
            {isSubmitting ? "Processing..." : `Settle & Complete Bill (₹${netAmount.toFixed(0)})`}
          </button>
        </div>
      </div>
    </div>
  );
};
