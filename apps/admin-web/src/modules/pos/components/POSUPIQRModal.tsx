import React, { useEffect } from "react";
import { QrCode, CheckCircle2, X, Volume2, Sparkles, Smartphone, ShieldCheck } from "lucide-react";
import { Button } from "@ssrone/ui";
import { DynamicUpiQrCode } from "./DynamicUpiQrCode";
import { playPaymentSuccessSound } from "@ssrone/utils";

interface POSUPIQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber: string;
  onConfirmPayment: () => void;
  vpa?: string;
  merchantName?: string;
}

export const POSUPIQRModal: React.FC<POSUPIQRModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderNumber,
  onConfirmPayment,
  vpa = "merchant@upi",
  merchantName = "SSR One Restaurant",
}) => {
  if (!isOpen) return null;

  const handleSoundboxTest = () => {
    playPaymentSuccessSound();
  };

  const handleSettlePaid = () => {
    playPaymentSuccessSound();
    onConfirmPayment();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Dynamic UPI QR</h3>
              <p className="text-[10px] text-muted-foreground font-mono">Bill #{orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payable Amount
            </span>
            <div className="text-3xl font-black font-mono text-primary flex items-center justify-center">
              <span>₹{amount.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
            <DynamicUpiQrCode
              amount={amount}
              orderNumber={orderNumber}
              vpa={vpa}
              payeeName={merchantName}
              size={180}
            />
          </div>

          {/* Supported Apps Badges */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-medium">
            <span className="px-2 py-0.5 rounded bg-muted border border-border">GPay</span>
            <span className="px-2 py-0.5 rounded bg-muted border border-border">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-muted border border-border">Paytm</span>
            <span className="px-2 py-0.5 rounded bg-muted border border-border">BHIM</span>
          </div>

          {/* Offline Soundbox Indicator */}
          <div className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
              <Volume2 size={14} className="animate-pulse" />
              <span>Smart Soundbox Chime Ready</span>
            </div>
            <button
              type="button"
              onClick={handleSoundboxTest}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Test Chime
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSettlePaid}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
          >
            <CheckCircle2 size={15} />
            <span>Mark Received</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
