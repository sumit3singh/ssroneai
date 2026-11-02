import React, { useState } from "react";
import {
  Wallet,
  X,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Receipt,
  Flame,
  Coffee,
  ShoppingBag
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface StaffIndentModalProps {
  authName: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface IndentRequest {
  id: string;
  amount: number;
  category: string;
  remarks: string;
  isUrgent: boolean;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "settled";
}

const COMMON_PURCHASES = [
  { name: "5L Fresh Milk", amount: 330, category: "Milk & Dairy" },
  { name: "Commercial LPG Cylinder", amount: 1850, category: "LPG Gas" },
  { name: "Ice Bags (20kg)", amount: 150, category: "Ice & Cold" },
  { name: "Fresh Coriander & Mint", amount: 120, category: "Vegetables" },
  { name: "Refined Oil Can", amount: 1450, category: "Grocery" },
  { name: "Dishwash & Cleaning", amount: 250, category: "Cleaning" },
];

export const StaffIndentModal: React.FC<StaffIndentModalProps> = ({
  authName,
  isOpen,
  onClose,
}) => {
  const [requests, setRequests] = useState<IndentRequest[]>(() => {
    try {
      const saved = localStorage.getItem("staff_indent_requests");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        id: "ind-101",
        amount: 330,
        category: "Milk & Dairy",
        remarks: "Need 5 liters milk for tea and shake counter",
        isUrgent: true,
        requestedBy: authName || "Captain Aman",
        requestedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        status: "approved",
      },
    ];
  });

  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Milk & Dairy");
  const [remarks, setRemarks] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    sound.kotDispatched();
    const newReq: IndentRequest = {
      id: `ind-${Date.now().toString().slice(-4)}`,
      amount: numAmount,
      category,
      remarks: remarks.trim() || `Cash request for ${category}`,
      isUrgent,
      requestedBy: authName || "Staff Member",
      requestedAt: new Date().toISOString(),
      status: "pending",
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    try {
      localStorage.setItem("staff_indent_requests", JSON.stringify(updated));
    } catch (_) {}

    setAmount("");
    setRemarks("");
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const selectQuickPurchase = (p: typeof COMMON_PURCHASES[0]) => {
    sound.tap();
    setAmount(String(p.amount));
    setCategory(p.category);
    setRemarks(p.name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none">
      <div className="bg-[#F8F6F0] rounded-[32px] max-w-xl w-full border border-[#E8E4DA] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#144F3C] border border-[#1C634C] text-[#E5A93C] flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E5A93C] block">
                Petty Cash / Staff Indent
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Request Money for Restaurant Needs
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Success Banner */}
          {submittedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>Money request submitted successfully! Manager notified for instant cash payout.</span>
            </div>
          )}

          {/* Quick Common Purchase Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Common Purchases:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COMMON_PURCHASES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => selectQuickPurchase(p)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition cursor-pointer active:scale-95 text-xs"
                >
                  <span className="font-bold text-slate-800 block truncate">{p.name}</span>
                  <span className="font-mono font-bold text-amber-700">₹{p.amount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Request Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Required Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    className="w-full h-10 pl-7 pr-3 rounded-lg bg-white border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Purchase Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Milk & Dairy">Milk & Dairy Products</option>
                  <option value="LPG Gas">Commercial LPG Gas Cylinder</option>
                  <option value="Vegetables">Fresh Vegetables & Herbs</option>
                  <option value="Ice & Cold">Ice Bags & Cold Storage</option>
                  <option value="Grocery">Daily Grocery & Cooking Oil</option>
                  <option value="Cleaning">Cleaning & Packaging Supplies</option>
                  <option value="Emergency Repair">Emergency Kitchen Repair</option>
                  <option value="Miscellaneous">Miscellaneous Cafe Need</option>
                </select>
              </div>
            </div>

            {/* Remarks / Purpose */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Item Description / Purpose
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specific items to buy (e.g. 5L milk, 2 packets tea powder)..."
                className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Urgent Checkbox & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span className="flex items-center gap-1">
                  <span className="text-rose-600">⚡ Urgent</span> - Needed immediately for running kitchen
                </span>
              </label>

              <button
                type="submit"
                className="min-h-[46px] px-6 rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#0B3B2C]/20 transition"
              >
                <Plus size={16} className="text-[#E5A93C]" />
                <span>Submit Money Request</span>
              </button>
            </div>
          </form>

          {/* Recent Money Requests History */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Recent Requests Today:
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {requests.map((req) => (
                <div key={req.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-sm">
                        ₹{req.amount}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.category}
                      </span>
                      {req.isUrgent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 font-mono">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-0.5 text-[11px]">{req.remarks}</p>
                    <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                      Requested by {req.requestedBy} • {new Date(req.requestedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase shrink-0 border ${
                      req.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {req.status === "approved" ? "Handed Over" : "Pending Approval"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Requested by: <strong className="text-slate-800">{authName || "Staff"}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
