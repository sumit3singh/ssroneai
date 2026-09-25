import React from "react";
import ReactDOM from "react-dom";
import { renderSafeString } from "../utils/renderSafeString";
import { cleanTableName, formatItemWithVariantAndAddons } from "../utils/posPrintFormatters";

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
  if (!slips || slips.length === 0) return null;

  const content = (
    <div id="thermal-kot-printable-container">
      <style>{`
        @media screen {
          #thermal-kot-printable-container {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          /* Hide entire web app and any non-print elements */
          #root, .no-print {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 80mm !important;
          }
          #thermal-kot-printable-container {
            display: block !important;
            position: static !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm 3mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
            box-sizing: border-box !important;
          }
          .kot-station-slip {
            display: block !important;
            width: 100% !important;
            padding-bottom: 6mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .kot-station-slip:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>

      {slips.map((slip, idx) => {
        const rawTable = cleanTableName(slip.tableName);
        const displayTable = rawTable || (slip.orderType || "N/A");
        const totalQty = slip.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

        return (
          <div key={`${slip.stationName}-${slip.orderNumber}-${idx}`} className="kot-station-slip">
            {/* 1. Kitchen Station Name */}
            <div
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "900",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              {slip.stationName}
            </div>

            {/* 2. Table Name & Order No on One Line */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "2px",
              }}
            >
              <span>TABLE: {displayTable}</span>
              <span>ORDER NO: {slip.orderNumber}</span>
            </div>

            {/* 3. Time */}
            <div style={{ fontSize: "11px", marginBottom: "4px" }}>
              TIME: {slip.timestamp}
            </div>

            {/* 4. Dashed Divider */}
            <div style={{ borderBottom: "1px dashed #000000", marginBottom: "6px" }} />

            {/* 5. Menu Items with Inlined Variant & Addons */}
            <div style={{ fontSize: "12px", lineHeight: "1.3" }}>
              {slip.items.map((it, itemIdx) => {
                const itemTitle = formatItemWithVariantAndAddons(
                  it.name,
                  it.variant_name,
                  it.addons,
                  "spaced"
                );

                return (
                  <div key={`${it.name}-${itemIdx}`} style={{ marginBottom: "5px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        fontWeight: "900",
                        fontSize: "12.5px",
                      }}
                    >
                      <span style={{ flex: 1, paddingRight: "8px" }}>{itemTitle}</span>
                      <span style={{ whiteSpace: "nowrap" }}>QTY: {it.quantity}</span>
                    </div>

                    {it.notes && it.notes.trim() && (
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: "700",
                          marginTop: "1px",
                          color: "#111",
                        }}
                      >
                        Remark: {it.notes.trim()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 6. Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "11px",
                marginTop: "6px",
                paddingTop: "4px",
              }}
            >
              <span>ITEMS: {slip.items.length}</span>
              <span>TOTAL QTY: {totalQty}</span>
            </div>

            {/* 7. Bottom Dashed Divider */}
            <div style={{ borderBottom: "1px dashed #000000", marginTop: "4px", marginBottom: "6px" }} />
          </div>
        );
      })}
    </div>
  );

  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
};

/**
 * Directly prints KOT slips using a dedicated hidden iframe.
 * Bypasses Chrome/Edge fullscreen and kiosk-mode viewport scaling bugs,
 * ensuring slips always render at true 80mm width without blank pages or microscopic shrinking.
 */
export async function printKOTSlipsDirectly(slips: StationKOTSlip[]) {
  if (!slips || slips.length === 0) return;

  const slipsHtml = slips.map((slip) => {
    const rawTable = cleanTableName(slip.tableName);
    const displayTable = rawTable || (slip.orderType || "N/A");
    const totalQty = slip.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

    const itemsHtml = slip.items.map((it) => {
      const itemTitle = formatItemWithVariantAndAddons(
        it.name,
        it.variant_name,
        it.addons,
        "spaced"
      );

      return `
        <div style="margin-bottom: 5px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; font-weight: 900; font-size: 12.5px;">
            <span style="flex: 1; padding-right: 8px;">${itemTitle}</span>
            <span style="white-space: nowrap;">QTY: ${it.quantity}</span>
          </div>
          ${it.notes && it.notes.trim() ? `<div style="font-size: 10.5px; font-weight: 700; margin-top: 1px; color: #111;">Remark: ${it.notes.trim()}</div>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div class="kot-station-slip">
        <div style="text-align: center; font-size: 16px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px;">
          ${slip.stationName}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 2px;">
          <span>TABLE: ${displayTable}</span>
          <span>ORDER NO: ${slip.orderNumber}</span>
        </div>
        <div style="font-size: 11px; margin-bottom: 4px;">
          TIME: ${slip.timestamp}
        </div>
        <div style="border-bottom: 1px dashed #000000; margin-bottom: 6px;"></div>
        <div style="font-size: 12px; line-height: 1.3;">
          ${itemsHtml}
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-top: 6px; padding-top: 4px;">
          <span>ITEMS: ${slip.items.length}</span>
          <span>TOTAL QTY: ${totalQty}</span>
        </div>
        <div style="border-bottom: 1px dashed #000000; margin-top: 4px; margin-bottom: 6px;"></div>
      </div>
    `;
  }).join("");

  let iframe = document.getElementById("thermal-kot-silent-frame") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "thermal-kot-silent-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "80mm";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);
  }

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc) {
    window.print();
    return;
  }

  frameDoc.open();
  frameDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Kitchen Station KOT</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.35 !important;
          }
          .kot-station-slip {
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm 3mm 8mm 3mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .kot-station-slip:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        </style>
      </head>
      <body>
        ${slipsHtml}
      </body>
    </html>
  `);
  frameDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("Iframe print error, falling back to window.print()", e);
      window.print();
    }
  }, 100);
}
