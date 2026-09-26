import React, { useEffect } from "react";
import { Printer, ChefHat, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { renderSafeString } from "../../../utils/renderSafeString";
import { cleanTableName, formatItemWithVariantAndAddons } from "../../../utils/posPrintFormatters";
import { safePrintWithFullscreenRestore } from "../../../utils/printUtils";

export interface StationKOTItem {
  cart_id?: string;
  item_id?: number | string;
  name: string;
  quantity: number;
  variant_name?: string;
  addons?: any[];
  notes?: string;
  is_veg?: boolean;
}

export interface StationKOTSlip {
  stationName: string;
  stationCode?: string;
  printerName?: string;
  orderNumber: string;
  orderType: string;
  tableName?: string;
  waiterName?: string;
  kotType: "NEW" | "UPDATE";
  kotSeq?: number;
  timestamp: string;
  items: StationKOTItem[];
}

interface ThermalKOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  slips: StationKOTSlip[];
}

export const ThermalKOTModal: React.FC<ThermalKOTModalProps> = ({
  isOpen,
  onClose,
  slips,
}) => {
  const { selected_branch, selected_company } = useAuthStore();
  const venueName = selected_branch?.name || selected_company?.name || "RESTAURANT & CAFE";

  useEffect(() => {
    if (isOpen && slips && slips.length > 0) {
      const timer = setTimeout(() => {
        safePrintWithFullscreenRestore();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, slips]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !slips || slips.length === 0) return null;

  const handlePrint = () => {
    safePrintWithFullscreenRestore();
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
          .no-print, .no-print * {
            display: none !important;
          }
          #thermal-kot-printable-area, #thermal-kot-printable-area * {
            visibility: visible !important;
          }
          #thermal-kot-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            overflow: visible !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: monospace, sans-serif !important;
            font-size: 11px !important;
            border: none !important;
            box-shadow: none !important;
          }
          .kot-station-slip {
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 2mm 1mm 4mm 1mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .kot-station-slip:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-5 space-y-3 shadow-modal flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5 no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <ChefHat size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <span>Kitchen Station KOT Print</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
                  {slips.length} Station{slips.length > 1 ? "s" : ""}
                </span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                80mm Ultra-Compact Minimal-Waste Ticket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Preview on Screen / Printable Area for Printer */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 max-h-[65vh]">
          <div id="thermal-kot-printable-area" className="space-y-3">
            {slips.map((slip, idx) => {
              const rawTable = cleanTableName(slip.tableName);
              const displayTable = rawTable || (slip.orderType || "N/A");
              const totalQty = slip.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

              return (
                <div
                  key={`${slip.stationName}-${slip.orderNumber}-${idx}`}
                  className="kot-station-slip bg-white text-black p-3 rounded-lg border border-neutral-300 shadow-2xs font-mono text-[11px] leading-tight space-y-1.5"
                >
                  {/* Station Name */}
                  <div className="text-center font-black text-sm uppercase">
                    {slip.stationName}
                  </div>

                  {/* Table & Order No on One Line */}
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>TABLE: {displayTable}</span>
                    <span>ORDER NO: {slip.orderNumber}</span>
                  </div>

                  {/* Time */}
                  <div className="text-[10px] text-neutral-600">
                    TIME: {slip.timestamp}
                  </div>

                  {/* Dashed Divider */}
                  <div className="border-b border-dashed border-black my-1" />

                  {/* Items List */}
                  <div className="space-y-1 py-0.5">
                    {slip.items.map((it, itemIdx) => {
                      const itemTitle = formatItemWithVariantAndAddons(
                        it.name,
                        it.variant_name,
                        it.addons,
                        "spaced"
                      );

                      return (
                        <div key={`${it.name}-${itemIdx}`} className="space-y-0.5">
                          <div className="flex items-start justify-between font-black text-xs text-neutral-900">
                            <span className="flex-1 pr-2">{itemTitle}</span>
                            <span className="whitespace-nowrap">QTY: {it.quantity}</span>
                          </div>
                          {it.notes && it.notes.trim() && (
                            <div className="text-[10px] font-bold text-neutral-800">
                              Remark: {it.notes.trim()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>


                  {/* Bottom Divider */}
                  <div className="border-b border-dashed border-black mt-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (Excluded from physical print) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border no-print">
          <Button variant="outline" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs active:scale-95">
            <Printer size={14} /> Re-Print KOT ({slips.length} Stations)
          </Button>
        </div>
      </div>
    </div>
  );
};
