import React from "react";
import { renderSafeString } from "../utils/renderSafeString";
import { useAuthStore } from "@ssrone/auth";

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

interface ThermalKOTPrintableAreaProps {
  slips: StationKOTSlip[];
}

export const ThermalKOTPrintableArea: React.FC<ThermalKOTPrintableAreaProps> = ({ slips }) => {
  const { selected_branch, selected_company } = useAuthStore();
  const venueName = selected_branch?.name || selected_company?.name || "RESTAURANT & CAFE";

  if (!slips || slips.length === 0) return null;

  return (
    <div id="thermal-kot-printable-container" className="hidden print:block">
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-kot-printable-container, #thermal-kot-printable-container * {
            visibility: visible !important;
          }
          #thermal-kot-printable-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            border: none !important;
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
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {slips.map((slip, idx) => {
        const totalQty = slip.items.reduce((sum, it) => sum + it.quantity, 0);
        const isUpdate = slip.kotType === "UPDATE";

        return (
          <div key={`${slip.stationName}-${slip.orderNumber}-${idx}`} className="kot-station-slip">
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>
                {venueName}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "900",
                  letterSpacing: "0.5px",
                  marginTop: "2px",
                  borderTop: "1px dashed #000",
                  borderBottom: "1px dashed #000",
                  padding: "3px 0",
                }}
              >
                {isUpdate ? "⚡ RUNNING KOT (ORDER UPDATE) ⚡" : "★ KITCHEN ORDER TICKET (KOT) ★"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "900",
                  marginTop: "3px",
                  background: "#000",
                  color: "#fff",
                  padding: "2px 4px",
                  display: "inline-block",
                  borderRadius: "2px",
                }}
              >
                STATION: {slip.stationName.toUpperCase()}
              </div>
              {slip.printerName && (
                <div style={{ fontSize: "9px", marginTop: "1px", color: "#333" }}>
                  PRINTER: {slip.printerName}
                </div>
              )}
            </div>

            {/* Order Details Metadata */}
            <div
              style={{
                fontSize: "10.5px",
                borderBottom: "1px dashed #000",
                paddingBottom: "4px",
                marginBottom: "5px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>ORDER #:</strong> {slip.orderNumber}</span>
                <span><strong>MODE:</strong> {slip.orderType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
                <span><strong>TABLE:</strong> {slip.tableName ? `Table ${slip.tableName}` : "N/A"}</span>
                <span><strong>KOT TYPE:</strong> {isUpdate ? "RUNNING ADD-ON" : "NEW ORDER"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
                <span><strong>DATE/TIME:</strong> {slip.timestamp}</span>
                {slip.waiterName && <span><strong>SERVER:</strong> {slip.waiterName}</span>}
              </div>
            </div>

            {/* Items Column Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "900",
                fontSize: "10px",
                borderBottom: "1px solid #000",
                paddingBottom: "2px",
                marginBottom: "4px",
              }}
            >
              <span style={{ width: "40px" }}>QTY</span>
              <span style={{ flex: 1 }}>ITEM / SPECIFICATIONS</span>
            </div>

            {/* Station Items List */}
            <div style={{ marginBottom: "6px" }}>
              {slip.items.map((it, itemIdx) => {
                const addonsList = it.addons || [];
                const addonStr = Array.isArray(addonsList)
                  ? addonsList
                      .map((a: any) => (typeof a === "string" ? a : renderSafeString(a?.name || a?.title || a?.label)))
                      .filter(Boolean)
                      .join(", ")
                  : "";

                return (
                  <div
                    key={`${it.name}-${itemIdx}`}
                    style={{
                      marginBottom: "5px",
                      paddingBottom: "4px",
                      borderBottom: "1px dotted #ccc",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      {/* Prominent Quantity */}
                      <div
                        style={{
                          width: "36px",
                          fontWeight: "900",
                          fontSize: "13px",
                          lineHeight: "1.1",
                          flexShrink: 0,
                        }}
                      >
                        {it.quantity} x
                      </div>

                      {/* Item Name & Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "900", fontSize: "12px", lineHeight: "1.2" }}>
                          {it.name}
                        </div>

                        {it.variant_name && (
                          <div style={{ fontSize: "10px", fontStyle: "italic", marginTop: "1px" }}>
                            ↳ Size/Variant: <strong>{it.variant_name}</strong>
                          </div>
                        )}

                        {addonStr && (
                          <div style={{ fontSize: "9.5px", marginTop: "1px" }}>
                            ↳ Addons: {addonStr}
                          </div>
                        )}

                        {it.notes && it.notes.trim() && (
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: "900",
                              marginTop: "2px",
                              padding: "1px 3px",
                              border: "1px dashed #000",
                              background: "#eee",
                            }}
                          >
                            *** NOTE: {it.notes.trim().toUpperCase()} ***
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div
              style={{
                borderTop: "1px dashed #000",
                paddingTop: "4px",
                textAlign: "center",
                fontSize: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                <span>ITEMS COUNT: {slip.items.length}</span>
                <span>TOTAL QTY: {totalQty}</span>
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "10px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                }}
              >
                {isUpdate
                  ? ">>> PREPARE ONLY NEW ADDED ITEMS ABOVE <<<"
                  : ">>> NEW ORDER: PREPARE IMMEDIATELY <<<"}
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "8px",
                  color: "#666",
                  borderTop: "1px dotted #999",
                  paddingTop: "2px",
                }}
              >
                - - - - - - - - - - TEAR / CUT HERE - - - - - - - - - -
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
