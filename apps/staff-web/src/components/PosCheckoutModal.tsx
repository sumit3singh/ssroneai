import React, { useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Split,
  Printer,
  CheckCircle2,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface PosCheckoutModalProps {
  orderData: {
    orderNumber: string;
    tableName: string;
    itemsCount: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  onClose: () => void;
  onPaymentSuccess: (paymentDetails: {
    method: "cash" | "upi" | "card" | "split";
    amountPaid: number;
    changeAmount: number;
    customerName: string;
    customerPhone: string;
  }) => void;
}

export const PosCheckoutModal: React.FC<PosCheckoutModalProps> = ({
  orderData,
  onClose,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<"cash" | "upi" | "card" | "split">("cash");
  const [cashTendered, setCashTendered] = useState<number>(orderData.total);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const changeReturn = Math.max(0, cashTendered - orderData.total);

  const handleComplete = () => {
    sound.kotDispatched();
    onPaymentSuccess({
      method,
      amountPaid: method === "cash" ? cashTendered : orderData.total,
      changeAmount: method === "cash" ? changeReturn : 0,
      customerName,
      customerPhone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-[32px] w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header (Deep Forest Green & Gold) */}
        <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#144F3C] text-[#E5A93C] flex items-center justify-center font-black shadow-xs border border-[#1C634C]">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                Bill Settlement &amp; Checkout
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                Table {orderData.tableName} • Order #{orderData.orderNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Bill Summary Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] space-y-1.5 text-xs font-mono shadow-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal ({orderData.itemsCount} dishes):</span>
              <span className="font-bold text-slate-800">₹{orderData.subtotal}</span>
            </div>
            {orderData.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Special Discount:</span>
                <span>-₹{orderData.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>GST Taxes (5%):</span>
              <span className="font-bold text-slate-800">₹{orderData.tax}</span>
            </div>
            <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2 border-t border-slate-100">
              <span>Net Payable Total:</span>
              <span className="text-2xl font-mono text-[#0B3B2C] font-black">₹{orderData.total}</span>
            </div>
          </div>

          {/* 1. Payment Method Tabs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Select Payment Mode:
            </span>
            <div className="grid grid-cols-4 gap-1.5 bg-white p-1.5 rounded-2xl border border-[#E8E4DA]">
              {/* Cash */}
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMethod("cash");
                }}
                className={`min-h-[46px] p-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  method === "cash"
                    ? "bg-[#0B3B2C] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Banknote size={16} className={method === "cash" ? "text-[#E5A93C]" : "text-slate-600"} />
                <span>Cash</span>
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMethod("upi");
                }}
                className={`min-h-[46px] p-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  method === "upi"
                    ? "bg-[#0B3B2C] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <QrCode size={16} className={method === "upi" ? "text-[#E5A93C]" : "text-slate-600"} />
                <span>UPI QR</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMethod("card");
                }}
                className={`min-h-[46px] p-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  method === "card"
                    ? "bg-[#0B3B2C] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CreditCard size={16} className={method === "card" ? "text-[#E5A93C]" : "text-slate-600"} />
                <span>Card</span>
              </button>

              {/* Split */}
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setMethod("split");
                }}
                className={`min-h-[46px] p-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                  method === "split"
                    ? "bg-[#0B3B2C] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Split size={16} className={method === "split" ? "text-[#E5A93C]" : "text-slate-600"} />
                <span>Split</span>
              </button>
            </div>
          </div>

          {/* 2. Method Specific Section */}
          {/* A. Cash Quick Presets */}
          {method === "cash" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Cash Tendered &amp; Change Calculator
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.step();
                    setCashTendered(orderData.total);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs font-mono"
                >
                  Exact (₹{orderData.total})
                </button>
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.step();
                      setCashTendered(amt);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono cursor-pointer shadow-2xs ${
                      cashTendered === amt
                        ? "bg-[#0B3B2C] text-white border-[#0B3B2C]"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E4DA]">
                  <span className="text-slate-500 block text-[10px]">Tendered Amount:</span>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full font-black text-base text-slate-900 bg-transparent focus:outline-none mt-0.5"
                  />
                </div>
                <div className="p-3 rounded-xl bg-[#E8F4EC] border border-[#C5E1CE]">
                  <span className="text-[#0B3B2C] block text-[10px] font-bold">Return Change:</span>
                  <span className="font-black text-xl text-[#0B3B2C]">₹{changeReturn}</span>
                </div>
              </div>
            </div>
          )}

          {/* B. UPI QR Code Display */}
          {method === "upi" && (
            <div className="p-4 rounded-2xl bg-white border border-[#E8E4DA] text-center space-y-2">
              <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-[#0B3B2C] rounded-xl flex flex-col items-center justify-center text-white p-2">
                  <QrCode size={54} className="text-[#E5A93C]" />
                  <span className="text-[9px] font-mono mt-1 font-black tracking-wider text-emerald-100">
                    SCAN TO PAY ₹{orderData.total}
                  </span>
                </div>
              </div>
              <p className="text-xs font-mono font-bold text-slate-900">
                VPA: baithak@icici • Order #{orderData.orderNumber}
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F4EC] text-[#0B3B2C] text-[10px] font-black">
                <ShieldCheck size={12} className="text-[#27AE60]" />
                UPI Dynamic QR Ready
              </span>
            </div>
          )}

          {/* 3. Customer Information */}
          <div className="space-y-2 pt-1 border-t border-[#E8E4DA]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Customer Details (Optional WhatsApp Receipt):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest Name..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#E8E4DA] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C]"
                />
              </div>

              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile Number..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-[#E8E4DA] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E8E4DA] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="min-h-[48px] px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 min-h-[48px] px-6 rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] active:scale-[0.985] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#0B3B2C]/20 cursor-pointer transition"
          >
            <CheckCircle2 size={18} className="text-[#E5A93C]" />
            <span>Complete &amp; Settle Bill (₹{orderData.total})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
