import React from "react";
import { Printer, X, Check, Copy } from "lucide-react";
import { sound } from "@/utils/audioFeedback";

interface ThermalReceiptModalProps {
  data: {
    orderNumber: string;
    tableName: string;
    guests?: number;
    waiterName?: string;
    branchName?: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      variant?: string;
      addons?: string[];
      note?: string;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    orderType?: string;
    createdAt?: string;
    orderRemark?: string;
  };
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    sound.tap();
    window.print();
  };

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#F8F6F0] border border-[#E8E4DA] text-slate-800 rounded-[32px] w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B3B2C] text-white border-b border-[#144F3C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#144F3C] text-[#E5A93C] flex items-center justify-center shadow-xs border border-[#1C634C]">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Thermal 80mm KOT / Bill</h3>
              <p className="text-[11px] text-emerald-200/80">Kitchen &amp; Table Ticket Format</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Paper Thermal Receipt Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F6F0] flex justify-center">
          <div className="w-full max-w-[340px] bg-white text-slate-900 font-mono text-xs p-5 rounded-md shadow-md border border-slate-300 select-text">
            {/* Store Title */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
              <h4 className="text-base font-black tracking-tight uppercase">
                {data.branchName || "SSR ONE RESTAURANT"}
              </h4>
              <p className="text-[10px] text-slate-600">SMART TOUCH POS • FLOOR TICKET</p>
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-slate-900 text-white text-[11px] font-bold rounded">
                KOT: {data.orderNumber}
              </div>
            </div>

            {/* Meta Table Info */}
            <div className="py-2.5 text-[11px] border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold">TABLE:</span>
                <span className="font-black text-sm">{data.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span>GUESTS:</span>
                <span>{data.guests || 2} Pax</span>
              </div>
              <div className="flex justify-between">
                <span>SERVER:</span>
                <span>{data.waiterName || "Staff Server"}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>DATE/TIME:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>TYPE:</span>
                <span className="uppercase font-bold">{data.orderType || "DINE-IN"}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase pb-1 border-b border-slate-200">
                <span className="w-8">QTY</span>
                <span className="flex-1">ITEM</span>
                <span className="w-16 text-right">AMOUNT</span>
              </div>
              <div className="space-y-1.5 pt-1.5">
                {data.items.map((it, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between items-start">
                      <span className="w-8 font-bold">{it.quantity}x</span>
                      <span className="flex-1 font-semibold pr-1">{it.name}</span>
                      <span className="w-16 text-right font-bold">₹{it.price * it.quantity}</span>
                    </div>
                    {it.variant && (
                      <p className="text-[10px] text-slate-500 pl-8">↳ {it.variant}</p>
                    )}
                    {it.addons && it.addons.length > 0 && (
                      <p className="text-[10px] text-slate-500 pl-8">↳ + {it.addons.join(", ")}</p>
                    )}
                    {it.note && (
                      <p className="text-[10px] text-amber-700 italic pl-8 font-bold">
                        * Note: {it.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Remark */}
            {data.orderRemark && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded my-1">
                <span className="font-bold">INSTRUCTIONS:</span> {data.orderRemark}
              </div>
            )}

            {/* Totals */}
            <div className="py-2.5 space-y-1 text-xs border-b border-dashed border-slate-400">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{data.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span>₹{Math.round(data.tax / 2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span>₹{Math.round(data.tax / 2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-300">
                <span>GRAND TOTAL:</span>
                <span>₹{data.total}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-1">
              <div className="font-mono text-xs tracking-widest text-slate-400">
                * {data.orderNumber} *
              </div>
              <p className="text-[9px] text-slate-400">Thank you! Powered by SSR One AI POS</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-pos-bg border-t border-pos-border flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.tap();
              navigator.clipboard?.writeText(
                `KOT #${data.orderNumber} for Table ${data.tableName} - Total: ₹${data.total}`
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="min-h-[46px] px-4 rounded-2xl bg-white border border-[#E8E4DA] text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition hover:bg-slate-50"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? "Copied" : "Copy KOT"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 min-h-[46px] px-5 rounded-2xl bg-[#0B3B2C] hover:bg-[#072E22] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#0B3B2C]/20 cursor-pointer transition active:scale-[0.98]"
          >
            <Printer size={16} className="text-[#E5A93C]" />
            <span>Print Thermal KOT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
