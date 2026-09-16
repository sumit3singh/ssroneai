import React from "react";
import { Printer, CheckCircle2, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { POSCartItem } from "../../types";
import { renderSafeString } from "../../../utils/renderSafeString";

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

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  // Dynamic multi-tenant venue details with safe fallbacks
  const venueName = selected_branch?.name || selected_company?.name || "RESTAURANT & CAFE";
  const venueAddress = (selected_branch as any)?.address || (selected_company as any)?.address || "Branch Outlet";
  const venueGstin = (selected_branch as any)?.gstin || (selected_company as any)?.gstin || "";
  const venuePhone = (selected_branch as any)?.phone || (selected_company as any)?.phone || "";
  const venueFssai = (selected_branch as any)?.fssai_number || (selected_company as any)?.fssai_number || "";
  const upiVpa = (selected_branch as any)?.upi_vpa || (selected_company as any)?.upi_vpa || "merchant@upi";

  const custName = renderSafeString(receiptData.customerName);
  const custPhone = renderSafeString(receiptData.customerPhone);
  const custAddress = renderSafeString(receiptData.customerAddress);
  const tableName = renderSafeString(receiptData.tableName);
  const waiterName = renderSafeString(receiptData.waiterName);
  const orderNumber = renderSafeString(receiptData.orderNumber);
  const orderType = renderSafeString(receiptData.orderType);
  const paymentMethod = renderSafeString(receiptData.paymentMethod);

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
          <div className="text-center space-y-0.5 border-b border-dashed border-border pb-2.5">
            <h4 className="font-black text-sm text-foreground tracking-wider uppercase">
              {venueName}
            </h4>
            <p className="text-[10px] text-muted-foreground">{venueAddress}</p>
            {venueGstin && <p className="text-[10px] text-muted-foreground font-bold">GSTIN: {venueGstin}</p>}
            {venueFssai && <p className="text-[10px] text-muted-foreground font-bold">FSSAI: {venueFssai}</p>}
            {venuePhone && <p className="text-[10px] text-muted-foreground font-bold">Tel: {venuePhone}</p>}
          </div>

          {/* Order Details Header */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-border pb-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order No:</span>
              <span className="font-bold text-foreground">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date/Time:</span>
              <span>{receiptData.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Mode:</span>
              <span className="font-bold text-primary uppercase">{orderType}</span>
            </div>
            {tableName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dining Table:</span>
                <span className="font-bold text-foreground">Table {tableName}</span>
              </div>
            )}
            {waiterName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff Server:</span>
                <span>{waiterName}</span>
              </div>
            )}
          </div>

          {/* Customer Details Header Section (When Available) */}
          {(custName || custPhone || custAddress) && (
            <div className="space-y-0.5 text-[11px] border-b border-dashed border-border pb-2 bg-primary/5 p-2 rounded-lg border border-primary/20">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span>👤 Customer Slip Info:</span>
              </div>
              {custName && (
                <div className="flex justify-between font-extrabold text-foreground">
                  <span className="text-muted-foreground font-normal">Customer Name:</span>
                  <span>{custName}</span>
                </div>
              )}
              {custPhone && (
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground font-normal">Mobile Phone:</span>
                  <span className="font-mono text-primary">{custPhone}</span>
                </div>
              )}
              {custAddress && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground font-normal shrink-0">Address:</span>
                  <span className="font-medium text-right text-foreground max-w-[170px] truncate">{custAddress}</span>
                </div>
              )}
            </div>
          )}

          {/* Itemized Table */}
          <div className="space-y-1.5 border-b border-dashed border-border pb-2.5">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase border-b border-border pb-1">
              <span>Item & Size</span>
              <span>Qty x Price</span>
              <span>Amt</span>
            </div>

            {(receiptData.items || []).map((it, idx) => {
              const itemName = renderSafeString(it.name || (it as any).product_name || (it as any).item_name || "Item");
              const variantName = renderSafeString(it.variant_name);
              return (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-foreground">
                    <span className="truncate max-w-[140px]">{itemName}</span>
                    <span>{it.quantity} x ₹{it.unit_price}</span>
                    <span>₹{it.quantity * it.unit_price}</span>
                  </div>
                  {variantName && (
                    <p className="text-[9px] text-primary italic pl-2">Size: {variantName}</p>
                  )}
                  {(() => {
                    const addonsList = it.addons || it.selected_addons || it.addon_options || [];
                    const addonStr = Array.isArray(addonsList)
                      ? addonsList
                          .map((a: any) => (typeof a === "string" ? a : renderSafeString(a?.name || a?.title || a?.addon_name || a?.label)))
                          .filter(Boolean)
                          .join(", ")
                      : "";
                    if (!addonStr) return null;
                    return (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 pl-2">
                        + Addons: {addonStr}
                      </p>
                    );
                  })()}
                </div>
              );
            })}
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
              <span className="text-muted-foreground">GST:</span>
              <span>₹{receiptData.taxAmount}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-foreground border-t border-border pt-1.5">
              <span>Grand Total:</span>
              <span className="text-primary font-mono text-sm">₹{receiptData.netAmount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
              <span>Paid Via:</span>
              <span className="font-bold uppercase text-foreground">{paymentMethod}</span>
            </div>
          </div>


          {/* Bill Footer */}
          <div className="text-center pt-2 border-t border-dashed border-border text-[9px] text-muted-foreground">
            <p className="font-bold">Thank You For Dining With Us!</p>
            <p>Visit Again • Powered by SSR ONE AI</p>
          </div>
        </div>

        {/* Action Buttons (Excluded from physical print via .no-print) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border no-print">
          <Button variant="outline" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-primary text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs active:scale-95">
            <Printer size={14} /> Print 80mm Slip
          </Button>
        </div>
      </div>
    </div>
  );
};
