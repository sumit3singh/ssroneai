import React, { useState } from "react";
import { Printer, CheckCircle2, X, MessageSquare } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";
import { POSCartItem } from "../../../types";
import { renderSafeString } from "../../../utils/renderSafeString";
import { safePrintWithFullscreenRestore } from "../../../utils/printUtils";
import {
  cleanTableName,
  cleanString,
  formatBranchAddress,
  formatItemWithVariantAndAddons,
} from "../../../utils/posPrintFormatters";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    orderNumber: string;
    orderType: string;
    tableName?: string;
    waiterName?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
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
  receiptData,
}) => {
  const { selected_branch, selected_company } = useAuthStore();
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(false);

  React.useEffect(() => {
    if (receiptData?.customerPhone) {
      setPhoneInput(String(receiptData.customerPhone));
    } else {
      setPhoneInput("");
    }
    setShowPhoneInput(false);
  }, [receiptData]);

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    safePrintWithFullscreenRestore();
  };

  // Dynamic multi-tenant venue details with safe fallbacks
  const venueName = cleanString(selected_branch?.name || selected_company?.name || "BAITHAK CAFE CUH");
  const venueAddress = formatBranchAddress((selected_branch as any)?.address || (selected_company as any)?.address);
  const venueGstin = cleanString((selected_branch as any)?.gstin || (selected_company as any)?.gstin);
  const venuePhone = cleanString((selected_branch as any)?.phone || (selected_company as any)?.phone);
  const venueFssai = cleanString((selected_branch as any)?.fssai_number || (selected_company as any)?.fssai_number);

  const custName = cleanString(receiptData.customerName);
  const custPhone = cleanString(receiptData.customerPhone);
  const custAddress = cleanString(receiptData.customerAddress);
  const cleanTable = cleanTableName(receiptData.tableName);
  const waiterName = cleanString(receiptData.waiterName);
  const orderNumber = cleanString(receiptData.orderNumber);
  const orderType = cleanString(receiptData.orderType);
  const paymentMethod = cleanString(receiptData.paymentMethod);

  const handleSendWhatsApp = () => {
    const rawPhone = (phoneInput || custPhone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      setShowPhoneInput(true);
      toast.error("Please enter a valid 10-digit mobile number for WhatsApp");
      return;
    }
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const lines: string[] = [];
    lines.push("╔═══════════════════════════════════╗");
    lines.push(`   🍽️ *${venueName.toUpperCase()}*`);
    lines.push("╚═══════════════════════════════════╝");
    if (venueAddress) lines.push(`📍 *Address:* ${venueAddress}`);
    if (venueGstin) lines.push(`🧾 *Gst:* ${venueGstin}`);
    if (venuePhone) lines.push(`📞 *Mobile no.* ${venuePhone}`);
    lines.push("------------------------------------");
    lines.push(`*Order No:* ${orderNumber} ,*Mode:* ${orderType}`);
    lines.push(`*Date/Time:* ${receiptData.timestamp}`);
    if (cleanTable) lines.push(`*Dining Table:* ${cleanTable}`);
    lines.push("------------------------------------");
    lines.push(`👤 *Customer Name:* ${custName || "Walk-in Guest"}`);
    lines.push("------------------------------------");
    lines.push("*ITEM & SIZE*        *QTY X PRICE*   *AMT*");
    lines.push("------------------------------------");

    (receiptData.items || []).forEach((it) => {
      const rawName = renderSafeString(it.name || (it as any).product_name || (it as any).item_name || "Item");
      const variantName = renderSafeString(it.variant_name);
      const addonsList = it.addons || (it as any).selected_addons || (it as any).addon_options || [];
      const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");
      const qtyPriceStr = `${it.quantity} x ₹${Number(it.unit_price).toFixed(2)}`;
      const amtStr = `₹${(it.quantity * it.unit_price).toFixed(0)}`;

      lines.push(`• *${itemTitle}*`);
      lines.push(`   ${qtyPriceStr} = ${amtStr}`);
    });

    lines.push("------------------------------------");
    lines.push(`Subtotal: ₹${receiptData.subtotal}`);
    if (receiptData.packagingChargeTotal > 0) {
      lines.push(`Packaging Fee: +₹${receiptData.packagingChargeTotal}`);
    }
    if (receiptData.discountAmount > 0) {
      lines.push(`Discount: -₹${receiptData.discountAmount}`);
    }
    lines.push(`GST: ₹${receiptData.taxAmount}`);
    lines.push(`*Grand Total: ₹${receiptData.netAmount}*`);
    if (paymentMethod) {
      lines.push(`Paid Via: ${paymentMethod}`);
    }
    lines.push("------------------------------------");
    lines.push("✨ *Thank You For Dining With Us! Visit Again* ✨");

    const message = lines.join("\n");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    toast.success(`WhatsApp receipt opened for +${cleanPhone}!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      {/* Thermal Print Injected CSS for physical 80mm ESC/POS thermal printers */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable-area, #thermal-receipt-printable-area * {
            visibility: visible !important;
          }
          #thermal-receipt-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 6px !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: monospace, sans-serif !important;
            font-size: 11px !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-5 space-y-3 shadow-modal flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="font-extrabold text-sm text-foreground">
              Settled & Printable Receipt
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
            <X size={17} />
          </button>
        </div>

        {/* Printable Thermal Receipt Box */}
        <div
          id="thermal-receipt-printable-area"
          className="bg-amber-500/5 dark:bg-slate-950 border border-border rounded-2xl p-4 space-y-3 font-mono text-2xs overflow-y-auto max-h-[460px] shadow-inner"
        >
          {/* Dynamic Restaurant Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-neutral-400 dark:border-neutral-600 print:border-black pb-2">
            <h4 className="font-black text-sm text-foreground tracking-wider uppercase">
              {venueName}
            </h4>
            {venueAddress && <p className="text-[10px] text-muted-foreground print:text-black">Address: {venueAddress}</p>}
            {venueGstin && <p className="text-[10px] text-muted-foreground print:text-black font-bold">Gst: {venueGstin}</p>}
            {venuePhone && <p className="text-[10px] text-muted-foreground print:text-black font-bold">Mobile no. {venuePhone}</p>}
            {venueFssai && <p className="text-[10px] text-muted-foreground print:text-black font-bold">FSSAI: {venueFssai}</p>}
          </div>

          {/* Order Details Header */}
          <div className="space-y-0.5 text-[11px] border-b border-dashed border-neutral-400 dark:border-neutral-600 print:border-black pb-2">
            <div className="font-bold text-foreground">
              Order No: {orderNumber} ,Mode: {orderType}
            </div>
            <div className="text-muted-foreground print:text-black">
              Date/Time: {receiptData.timestamp}
            </div>
            {cleanTable && (
              <div className="font-bold text-foreground">
                Dining Table: {cleanTable}
              </div>
            )}
            {waiterName && (
              <div className="text-muted-foreground print:text-black text-[10px]">
                Server: {waiterName}
              </div>
            )}
          </div>

          {/* Customer Details Header Section */}
          <div className="space-y-0.5 text-[11px] border-b border-dashed border-neutral-400 dark:border-neutral-600 print:border-black pb-2">
            <div className="font-extrabold text-foreground">
              👤Customer Name: {custName || "Walk-in Guest"}
            </div>
            {custPhone && (
              <div className="text-[10px] text-muted-foreground print:text-black">
                Mobile Phone: {custPhone}
              </div>
            )}
            {custAddress && (
              <div className="text-[10px] text-muted-foreground print:text-black truncate">
                Address: {custAddress}
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="space-y-1.5 border-b border-dashed border-neutral-400 dark:border-neutral-600 print:border-black pb-2.5">
            <div className="flex justify-between text-[10px] font-black text-foreground uppercase border-b border-neutral-300 dark:border-neutral-700 print:border-black pb-1">
              <span className="flex-1">ITEM & SIZE</span>
              <span className="text-right px-2">QTY X PRICE</span>
              <span className="w-14 text-right">AMT</span>
            </div>

            {(receiptData.items || []).map((it, idx) => {
              const rawName = renderSafeString(it.name || (it as any).product_name || (it as any).item_name || "Item");
              const variantName = renderSafeString(it.variant_name);
              const addonsList = it.addons || (it as any).selected_addons || (it as any).addon_options || [];
              const itemTitle = formatItemWithVariantAndAddons(rawName, variantName, addonsList, "compact");
              const qtyPriceStr = `${it.quantity} x ₹${Number(it.unit_price).toFixed(2)}`;
              const amtStr = `₹${(it.quantity * it.unit_price).toFixed(0)}`;

              return (
                <div key={idx} className="flex justify-between items-baseline text-[11px] font-bold text-foreground">
                  <span className="flex-1 pr-2 break-words leading-tight">{itemTitle}</span>
                  <span className="text-right px-2 whitespace-nowrap text-muted-foreground print:text-black">{qtyPriceStr}</span>
                  <span className="w-14 text-right whitespace-nowrap">{amtStr}</span>
                </div>
              );
            })}
          </div>

          {/* Financial Totals */}
          <div className="space-y-1 pt-1 text-[11px] border-b border-dashed border-neutral-400 dark:border-neutral-600 print:border-black pb-2">
            <div className="flex justify-between text-muted-foreground print:text-black">
              <span>Subtotal:</span>
              <span>₹{receiptData.subtotal}</span>
            </div>
            {receiptData.packagingChargeTotal > 0 && (
              <div className="flex justify-between text-amber-600 print:text-black">
                <span>Packaging:</span>
                <span>+₹{receiptData.packagingChargeTotal}</span>
              </div>
            )}
            {receiptData.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 print:text-black font-bold">
                <span>Discount:</span>
                <span>-₹{receiptData.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground print:text-black">
              <span>GST:</span>
              <span>₹{receiptData.taxAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-foreground border-t border-neutral-300 dark:border-neutral-700 print:border-black pt-1">
              <span>Grand Total:</span>
              <span className="text-primary print:text-black font-mono text-sm">₹{receiptData.netAmount}</span>
            </div>
            {paymentMethod && (
              <div className="flex justify-between text-[10px] text-muted-foreground print:text-black pt-0.5">
                <span>Paid Via:</span>
                <span className="font-bold uppercase text-foreground">{paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Bill Footer */}
          <div className="text-center pt-2 text-[10px] font-bold text-muted-foreground print:text-black">
            <p>Thank You For Dining With Us! Visit Again</p>
          </div>
        </div>

        {/* Action Buttons (Excluded from physical print via .no-print) */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border no-print">
          {showPhoneInput && (
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs animate-in fade-in">
              <MessageSquare size={14} className="text-emerald-600 shrink-0" />
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSendWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 font-bold"
              >
                Send
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between gap-1.5">
            <Button variant="outline" onClick={onClose} className="text-xs cursor-pointer">
              Close
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                onClick={() => {
                  if (!custPhone && !phoneInput) {
                    setShowPhoneInput(true);
                  } else {
                    handleSendWhatsApp();
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <MessageSquare size={14} /> WhatsApp Bill
              </Button>
              <Button onClick={handlePrint} className="bg-primary text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs active:scale-95">
                <Printer size={14} /> Print 80mm Slip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
