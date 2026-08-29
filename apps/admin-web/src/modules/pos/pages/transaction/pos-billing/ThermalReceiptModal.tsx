import React from "react";
import { Printer, CheckCircle2, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSCartItem } from "../../types";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    orderNumber: string;
    orderType: string;
    tableName?: string;
    waiterName?: string;
    items: POSCartItem[];
    subtotal: number;
    packagingChargeTotal: number;
    taxAmount: number;
    discountAmount: number;
    netAmount: number;
    paymentMethod: string;
    timestamp: string;
  } | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData
}) => {
  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-modal flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <h3 className="font-display font-extrabold text-sm text-foreground">
              Payment Completed & Settled
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div className="bg-amber-500/5 dark:bg-slate-950 border border-border rounded-2xl p-4 space-y-3 font-mono text-2xs overflow-y-auto max-h-[420px] shadow-inner">
          <div className="text-center space-y-1 border-b border-dashed border-border pb-3">
            <h4 className="font-display font-black text-sm text-foreground tracking-wider uppercase">
              BAITHAK CAFE & RESTO
            </h4>
            <p className="text-[10px] text-muted-foreground">CUH Campus, Mahendragarh, HR</p>
            <p className="text-[10px] text-muted-foreground font-bold">GSTIN: 06ABCDE1234F1Z5</p>
            <p className="text-[10px] text-muted-foreground font-bold">Tel: +91 98765 43210</p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order #:</span>
              <span className="font-bold text-foreground">{receiptData.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date/Time:</span>
              <span>{receiptData.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Mode:</span>
              <span className="font-bold text-primary uppercase">{receiptData.orderType}</span>
            </div>
            {receiptData.tableName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dining Table:</span>
                <span className="font-bold text-foreground">Table #{receiptData.tableName}</span>
              </div>
            )}
            {receiptData.waiterName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff Server:</span>
                <span>{receiptData.waiterName}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-1.5 border-b border-dashed border-border pb-3">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              <span>Item & Size</span>
              <span>Qty x Price</span>
              <span>Amt</span>
            </div>

            {receiptData.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-foreground">
                  <span className="truncate max-w-[140px]">{it.name}</span>
                  <span>{it.quantity} x ₹{it.unit_price}</span>
                  <span>₹{it.quantity * it.unit_price}</span>
                </div>
                {it.variant_name && (
                  <p className="text-[9px] text-primary italic pl-2">Size: {it.variant_name}</p>
                )}
                {it.addons && it.addons.length > 0 && (
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 pl-2">
                    + {it.addons.map((a: any) => a.name).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>₹{receiptData.subtotal}</span>
            </div>
            {receiptData.packagingChargeTotal > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Packaging Fee:</span>
                <span>+₹{receiptData.packagingChargeTotal}</span>
              </div>
            )}
            {receiptData.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-₹{receiptData.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (5%):</span>
              <span>₹{receiptData.taxAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-foreground border-t border-border pt-1.5">
              <span>Grand Total:</span>
              <span className="text-primary font-mono text-sm">₹{receiptData.netAmount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
              <span>Paid Via:</span>
              <span className="font-bold uppercase text-foreground">{receiptData.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-border text-[9px] text-muted-foreground">
            <p className="font-bold">Thank You For Dining With Us!</p>
            <p>Visit Again • Powered by SSR ONE AI</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold text-xs gap-1.5">
            <Printer size={15} /> Print Thermal Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
