import React, { useState } from "react";
import { Users, X, Check, CreditCard, Banknote, QrCode } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tableName: string;
  itemsCount: number;
  onSettleSplit: (shares: { person: number; amount: number; method: string }[]) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  tableName,
  itemsCount,
  onSettleSplit,
}) => {
  const [splitCount, setSplitCount] = useState(2);
  const [paidPersons, setPaidPersons] = useState<{ [key: number]: string }>({});

  if (!isOpen) return null;

  const perPersonAmount = Math.ceil(totalAmount / splitCount);

  const togglePersonPaid = (personNum: number, method: string) => {
    sound.tap();
    setPaidPersons((prev) => ({
      ...prev,
      [personNum]: prev[personNum] === method ? "" : method,
    }));
  };

  const allPaid = Array.from({ length: splitCount }, (_, i) => i + 1).every(
    (num) => !!paidPersons[num]
  );

  const handleFinish = () => {
    sound.kotDispatched();
    const shares = Array.from({ length: splitCount }, (_, i) => i + 1).map((num) => ({
      person: num,
      amount: perPersonAmount,
      method: paidPersons[num] || "cash",
    }));
    onSettleSplit(shares);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E4DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Split Bill Calculator
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Table {tableName} • Grand Total ₹{totalAmount}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Split Count Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Split Equally Between Diners
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    sound.step();
                    setSplitCount(num);
                    setPaidPersons({});
                  }}
                  className={`h-11 rounded-2xl font-mono text-xs font-black cursor-pointer transition active:scale-95 ${
                    splitCount === num
                      ? "bg-[#0B3B2C] text-white shadow-sm"
                      : "bg-white border border-[#E8E4DA] text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {num} Guests
                </button>
              ))}
            </div>
          </div>

          {/* Amount per person banner */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Each Guest Pays
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B3B2C] block">
              ₹{perPersonAmount}
            </span>
            <span className="text-[11px] text-slate-500">
              ({splitCount} shares × ₹{perPersonAmount} ≈ ₹{totalAmount})
            </span>
          </div>

          {/* Person Breakdown List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Record Guest Payments
            </span>
            {Array.from({ length: splitCount }, (_, i) => i + 1).map((personNum) => {
              const currentMethod = paidPersons[personNum];
              return (
                <div
                  key={personNum}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                    currentMethod
                      ? "bg-[#E8F4EC] border-[#27AE60]/40"
                      : "bg-white border-[#E8E4DA]"
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">
                      Guest #{personNum}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0B3B2C]">
                      ₹{perPersonAmount}
                    </span>
                  </div>

                  {/* Payment method selector for this guest */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => togglePersonPaid(personNum, "cash")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        currentMethod === "cash"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Banknote size={12} />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePersonPaid(personNum, "upi")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        currentMethod === "upi"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <QrCode size={12} />
                      <span>UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePersonPaid(personNum, "card")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        currentMethod === "card"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <CreditCard size={12} />
                      <span>Card</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8E4DA] flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-500 block">Status:</span>
            <strong className="text-[#0B3B2C] font-black">
              {Object.values(paidPersons).filter(Boolean).length} of {splitCount} Paid
            </strong>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 min-h-[46px] rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#0B3B2C]/20 transition cursor-pointer"
          >
            <Check size={16} />
            <span>Complete Split Settlement</span>
          </button>
        </div>
      </div>
    </div>
  );
};
