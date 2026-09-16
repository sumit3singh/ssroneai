import React, { useEffect } from "react";
import { Printer, ChefHat, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { renderSafeString } from "../../../utils/renderSafeString";

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
        window.print();
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
    window.print();
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
            padding: 6px 8px 16px 8px !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
            border-bottom: 1px dashed #000000 !important;
          }
          .kot-station-slip:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
            border-bottom: none !important;
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
                80mm Station-Wise Thermal Kitchen Order Tickets
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
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 max-h-[65vh]">
          <div id="thermal-kot-printable-area" className="space-y-4">
            {slips.map((slip, idx) => {
              const totalQty = slip.items.reduce((sum, it) => sum + it.quantity, 0);
              const isUpdate = slip.kotType === "UPDATE";

              return (
                <div
                  key={`${slip.stationName}-${slip.orderNumber}-${idx}`}
                  className="kot-station-slip bg-white text-black p-4 rounded-xl border border-border shadow-xs text-xs font-mono space-y-2"
                >
                  {/* Station Header */}
                  <div className="text-center pb-2 border-b border-dashed border-black/60">
                    <p className="font-bold text-[10px] tracking-wider uppercase text-neutral-600">{venueName}</p>
                    <div className="font-black text-sm uppercase tracking-wide my-1 py-1 border-y border-black">
                      {isUpdate ? "⚡ RUNNING KOT (ORDER UPDATE) ⚡" : "★ KITCHEN ORDER TICKET (KOT) ★"}
                    </div>
                    <div className="bg-black text-white px-2 py-0.5 rounded text-xs font-black inline-block uppercase">
                      STATION: {slip.stationName}
                    </div>
                    {slip.printerName && (
                      <p className="text-[9px] text-neutral-600 mt-0.5 font-mono">
                        PRINTER: {slip.printerName}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-[10px] space-y-0.5 border-b border-dashed border-black/60 pb-2">
                    <div className="flex justify-between font-bold">
                      <span>ORDER #: {slip.orderNumber}</span>
                      <span>MODE: {slip.orderType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TABLE: {slip.tableName ? `Table ${slip.tableName}` : "N/A"}</span>
                      <span className="font-bold">{isUpdate ? "RUNNING ADD-ON" : "NEW ORDER"}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>TIME: {slip.timestamp}</span>
                      {slip.waiterName && <span>SERVER: {slip.waiterName}</span>}
                    </div>
                  </div>

                  {/* Column Header */}
                  <div className="flex justify-between font-black text-[10px] border-b border-black pb-1">
                    <span className="w-8">QTY</span>
                    <span className="flex-1">ITEM / SPECIFICATIONS</span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 py-1">
                    {slip.items.map((it, itemIdx) => {
                      const addonsList = it.addons || [];
                      const addonStr = Array.isArray(addonsList)
                        ? addonsList
                            .map((a: any) => (typeof a === "string" ? a : renderSafeString(a?.name || a?.title || a?.label)))
                            .filter(Boolean)
                            .join(", ")
                        : "";

                      return (
                        <div key={`${it.name}-${itemIdx}`} className="border-b border-dotted border-neutral-300 pb-1.5">
                          <div className="flex items-start">
                            <span className="w-8 font-black text-sm leading-tight text-neutral-900">
                              {it.quantity}x
                            </span>
                            <div className="flex-1">
                              <p className="font-black text-xs leading-tight text-neutral-900">{it.name}</p>
                              {it.variant_name && (
                                <p className="text-[9.5px] italic text-neutral-700">↳ Size: {it.variant_name}</p>
                              )}
                              {addonStr && (
                                <p className="text-[9px] text-neutral-600">↳ Addons: {addonStr}</p>
                              )}
                              {it.notes && it.notes.trim() && (
                                <p className="text-[9.5px] font-black mt-0.5 bg-neutral-100 p-1 border border-dashed border-black">
                                  *** NOTE: {it.notes.trim().toUpperCase()} ***
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slip Footer */}
                  <div className="border-t border-dashed border-black/60 pt-2 text-center text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>ITEMS: {slip.items.length}</span>
                      <span>TOTAL QTY: {totalQty}</span>
                    </div>
                    <div className="font-black uppercase text-[10px] mt-1 text-black">
                      {isUpdate
                        ? ">>> PREPARE ONLY NEW ADDED ITEMS ABOVE <<<"
                        : ">>> NEW ORDER: PREPARE IMMEDIATELY <<<"}
                    </div>
                    <p className="text-[8px] text-neutral-400 mt-2 border-t border-dotted border-neutral-300 pt-1">
                      - - - - - - - - - - TEAR / CUT HERE - - - - - - - - - -
                    </p>
                  </div>
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
