import React from "react";
import ReactDOM from "react-dom";
import { renderSafeString } from "../utils/renderSafeString";
import { useAuthStore } from "@ssrone/auth";
import { usePOSPrinterStore } from "../store/printer.store";
import {
  cleanTableName,
  cleanString,
  formatBranchAddress,
  formatItemWithVariantAndAddons,
} from "../utils/posPrintFormatters";

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

export interface CustomerReceiptPayload {
  orderNumber: string;
  orderType: string;
  tableName?: string;
  waiterName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price?: number;
    selling_price?: number;
    variant_name?: string;
  }>;
  subtotal: number;
  packagingChargeTotal?: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentMethod: string;
  timestamp: string;
}

interface POSPrintPortalProps {
  printType: "KOT" | "RECEIPT" | null;
  kotSlips?: StationKOTSlip[];
  receiptData?: CustomerReceiptPayload | null;
}

export const POSPrintPortal: React.FC<POSPrintPortalProps> = ({
  printType,
  kotSlips,
  receiptData,
}) => {
  const { selected_branch, selected_company } = useAuthStore();
  const { settings } = usePOSPrinterStore();

  const venueName =
    settings.customerReceiptHeader?.trim() ||
    selected_branch?.name ||
    selected_company?.name ||
    "BAITHAK CAFE CUH";
  const venueAddress = formatBranchAddress(
    (selected_branch as any)?.address || (selected_company as any)?.address
  );
  const venueGstin = cleanString(
    (selected_branch as any)?.gstin || (selected_company as any)?.gstin
  );
  const venueFssai = cleanString(
    (selected_branch as any)?.fssai_number || (selected_company as any)?.fssai_number
  );
  const venuePhone = cleanString(
    (selected_branch as any)?.phone || (selected_company as any)?.phone
  );

  if (!printType) return null;
  if (printType === "KOT" && (!kotSlips || kotSlips.length === 0)) return null;
  if (printType === "RECEIPT" && !receiptData) return null;

  const is58mm =
    printType === "KOT"
      ? settings.kotPaperWidth === "58mm"
      : settings.customerPaperWidth === "58mm";

  const printableContent = (
    <div
      id="pos-thermal-print-portal"
      className={`hidden print:block ${is58mm ? "paper-58mm" : "paper-80mm"}`}
    >
      <style>{`
        @media print {
          @page {
            size: ${is58mm ? "58mm 297mm" : "80mm 297mm"};
            margin: 0mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide application UI entirely */
          #root, .no-print {
            display: none !important;
          }
          /* Normal flow print container for genuine CSS Paged Media support */
          #pos-thermal-print-portal {
            display: block !important;
            position: static !important;
            width: ${is58mm ? "48mm" : "72mm"} !important;
            max-width: ${is58mm ? "48mm" : "72mm"} !important;
            margin: 0 auto !important;
            padding: 2mm 1mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace, sans-serif !important;
            font-size: ${is58mm ? "9.5px" : "11px"} !important;
            line-height: 1.25 !important;
            box-sizing: border-box !important;
          }
          /* Clean Station Slip Page Breaks (Multi-Slip Auto-Cut) */
          .pos-station-cut-page {
            display: block !important;
            width: 100% !important;
            padding: 2mm 1mm 6mm 1mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
          }
          .pos-station-cut-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {/* 1. KITCHEN ORDER TICKET (KOT) PRINTING */}
      {printType === "KOT" && kotSlips && (
        <>
          {settings.kotPrintMode === "single_consolidated" ? (
            /* Consolidated KOT (all items on one ticket grouped by station) */
            <div className="pos-station-cut-page">
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>
                  {venueName}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "900",
                    borderTop: "1px dashed #000",
                    borderBottom: "1px dashed #000",
                    padding: "3px 0",
                    marginTop: "2px",
                  }}
                >
                  ★ CONSOLIDATED KITCHEN TICKET ★
                </div>
                <div style={{ fontSize: "10px", marginTop: "2px" }}>
                  ORDER #{kotSlips[0]?.orderNumber} • {kotSlips[0]?.orderType}
                </div>
                {kotSlips[0]?.tableName && (
                  <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                    TABLE: {kotSlips[0].tableName}
                  </div>
                )}
                <div style={{ fontSize: "9px", color: "#333" }}>
                  {kotSlips[0]?.timestamp}
                </div>
              </div>

              {kotSlips.map((slip, sIdx) => (
                <div key={`cons-st-${sIdx}`} style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontWeight: "900",
                      fontSize: "11.5px",
                      background: "#000",
                      color: "#fff",
                      padding: "2px 4px",
                      borderRadius: "2px",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    STATION: {slip.stationName}
                  </div>
                  {slip.items.map((it, itIdx) => (
                    <div
                      key={`cons-item-${itIdx}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                        borderBottom: "1px dotted #ccc",
                        paddingBottom: "2px",
                      }}
                    >
                      <span style={{ width: "32px", fontWeight: "900", fontSize: "12px" }}>
                        {it.quantity}x
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "11.5px" }}>{it.name}</div>
                        {it.variant_name && (
                          <div style={{ fontSize: "9.5px", fontStyle: "italic" }}>
                            ↳ {it.variant_name}
                          </div>
                        )}
                        {it.notes && (
                          <div style={{ fontSize: "9.5px", fontWeight: "bold", background: "#eee", padding: "1px 2px" }}>
                            *** {it.notes} ***
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: "4px", fontSize: "9px" }}>
                - - - - - - - - TEAR / CUT HERE - - - - - - - -
              </div>
            </div>
          ) : (
            /* Separate Slips Per Kitchen Station (Default: each gets its own page & hardware cut) */
            kotSlips.map((slip, idx) => {
              const totalQty = slip.items.reduce((sum, it) => sum + it.quantity, 0);
              const isUpdate = slip.kotType === "UPDATE";

              return (
                <div
                  key={`${slip.stationName}-${slip.orderNumber}-${idx}`}
                  className="pos-station-cut-page"
                >
                  {/* Slip Header */}
                  <div style={{ textAlign: "center", marginBottom: "4px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>
                      {venueName}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "900",
                        letterSpacing: "0.5px",
                        marginTop: "2px",
                        borderTop: "1px dashed #000",
                        borderBottom: "1px dashed #000",
                        padding: "3px 0",
                      }}
                    >
                      {isUpdate ? "⚡ RUNNING KOT (UPDATE) ⚡" : "★ KITCHEN ORDER TICKET (KOT) ★"}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: "900",
                        marginTop: "3px",
                        background: "#000",
                        color: "#fff",
                        padding: "2px 6px",
                        display: "inline-block",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      STATION: {slip.stationName}
                    </div>
                    {slip.printerName && (
                      <div style={{ fontSize: "9px", marginTop: "1px", color: "#333" }}>
                        PRINTER: {slip.printerName}
                      </div>
                    )}
                  </div>

                  {/* Metadata Box */}
                  <div
                    style={{
                      fontSize: "10px",
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
                      <span><strong>STATUS:</strong> {isUpdate ? "ADD-ON" : "NEW"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
                      <span><strong>TIME:</strong> {slip.timestamp}</span>
                      {slip.waiterName && <span><strong>SERVER:</strong> {slip.waiterName}</span>}
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "900",
                        fontSize: "9.5px",
                        borderBottom: "1px solid #000",
                        paddingBottom: "2px",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ width: "36px" }}>QTY</span>
                      <span style={{ flex: 1 }}>ITEM / NOTES</span>
                    </div>

                    {slip.items.map((it, itemIdx) => {
                      const addonsList = it.addons || [];
                      const addonStr = Array.isArray(addonsList)
                        ? addonsList
                            .map((a: any) =>
                              typeof a === "string"
                                ? a
                                : renderSafeString(a?.name || a?.title || a?.label)
                            )
                            .filter(Boolean)
                            .join(", ")
                        : "";

                      return (
                        <div
                          key={`${it.name}-${itemIdx}`}
                          style={{
                            marginBottom: "4px",
                            paddingBottom: "3px",
                            borderBottom: "1px dotted #ccc",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start" }}>
                            <span
                              style={{
                                width: "36px",
                                fontWeight: "900",
                                fontSize: "13px",
                                lineHeight: "1.1",
                                flexShrink: 0,
                              }}
                            >
                              {it.quantity} x
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "900", fontSize: "11.5px", lineHeight: "1.2" }}>
                                {it.name}
                              </div>
                              {it.variant_name && (
                                <div style={{ fontSize: "9.5px", fontStyle: "italic", marginTop: "1px" }}>
                                  ↳ {it.variant_name}
                                </div>
                              )}
                              {addonStr && (
                                <div style={{ fontSize: "9px", marginTop: "1px" }}>
                                  ↳ Addons: {addonStr}
                                </div>
                              )}
                              {it.notes && it.notes.trim() && (
                                <div
                                  style={{
                                    fontSize: "9.5px",
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

                  {/* Footer & Tear Line */}
                  <div
                    style={{
                      borderTop: "1px dashed #000",
                      paddingTop: "3px",
                      textAlign: "center",
                      fontSize: "9.5px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                      <span>ITEMS: {slip.items.length}</span>
                      <span>TOTAL QTY: {totalQty}</span>
                    </div>
                    <div style={{ marginTop: "3px", fontWeight: "900" }}>
                      {isUpdate ? ">>> PREPARE NEW ITEMS ONLY <<<" : ">>> PREPARE IMMEDIATELY <<<"}
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "8.5px", color: "#444" }}>
                      ✂ - - - - - TEAR / CUT HERE - - - - - ✂
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      {/* 2. CUSTOMER FINAL BILL / CASHIER RECEIPT PRINTING */}
      {printType === "RECEIPT" && receiptData && (
        <div className="pos-station-cut-page">
          {/* Receipt Header */}
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "900", textTransform: "uppercase", margin: 0 }}>
              {venueName}
            </h3>
            {venueAddress && <div style={{ fontSize: "9.5px", color: "#333" }}>{venueAddress}</div>}
            {settings.customerShowGstin && venueGstin && (
              <div style={{ fontSize: "9.5px", fontWeight: "bold" }}>GSTIN: {venueGstin}</div>
            )}
            {settings.customerShowFssai && venueFssai && (
              <div style={{ fontSize: "9.5px", fontWeight: "bold" }}>FSSAI: {venueFssai}</div>
            )}
            {venuePhone && <div style={{ fontSize: "9.5px" }}>Tel: {venuePhone}</div>}
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: "900",
                borderTop: "1px dashed #000",
                borderBottom: "1px dashed #000",
                padding: "2px 0",
                marginTop: "3px",
              }}
            >
              TAX INVOICE / CASH BILL
            </div>
          </div>

          {/* Invoice Metadata */}
          <div
            style={{
              fontSize: "10px",
              borderBottom: "1px dashed #000",
              paddingBottom: "4px",
              marginBottom: "5px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span><strong>BILL #:</strong> {receiptData.orderNumber}</span>
              <span><strong>MODE:</strong> {receiptData.orderType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
              <span><strong>DATE:</strong> {receiptData.timestamp}</span>
              {settings.customerShowTableWaiter && receiptData.tableName && (
                <span><strong>TABLE:</strong> {cleanTableName(receiptData.tableName)}</span>
              )}
            </div>
            {settings.customerShowTableWaiter && receiptData.waiterName && (
              <div style={{ marginTop: "1px" }}>
                <span><strong>SERVER:</strong> {receiptData.waiterName}</span>
              </div>
            )}
            {(receiptData.customerName || receiptData.customerPhone) && (
              <div style={{ marginTop: "1px", borderTop: "1px dotted #ccc", paddingTop: "2px" }}>
                {receiptData.customerName && <div><strong>CUSTOMER:</strong> {receiptData.customerName}</div>}
                {receiptData.customerPhone && <div><strong>PHONE:</strong> {receiptData.customerPhone}</div>}
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div style={{ marginBottom: "6px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "900",
                fontSize: "9.5px",
                borderBottom: "1px solid #000",
                paddingBottom: "2px",
                marginBottom: "3px",
              }}
            >
              <span style={{ width: "28px" }}>QTY</span>
              <span style={{ flex: 1 }}>ITEM & SIZE</span>
              <span style={{ width: "45px", textAlign: "right" }}>AMOUNT</span>
            </div>

            {receiptData.items.map((item, idx) => {
              const unitPrice = item.selling_price ?? item.price ?? 0;
              const totalLine = unitPrice * item.quantity;
              const itemTitle = formatItemWithVariantAndAddons(
                item.name,
                item.variant_name,
                (item as any).addons,
                "compact"
              );
              return (
                <div
                  key={`bill-item-${idx}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10.5px",
                    marginBottom: "3px",
                  }}
                >
                  <span style={{ width: "28px", fontWeight: "bold" }}>{item.quantity}x</span>
                  <span style={{ flex: 1, paddingRight: "4px" }}>
                    {itemTitle}
                  </span>
                  <span style={{ width: "45px", textAlign: "right", fontWeight: "bold" }}>
                    ₹{totalLine > 0 ? totalLine : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals & Tax Breakdown */}
          <div
            style={{
              borderTop: "1px dashed #000",
              paddingTop: "4px",
              fontSize: "10.5px",
              marginBottom: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal:</span>
              <span>₹{receiptData.subtotal}</span>
            </div>
            {Number(receiptData.packagingChargeTotal || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Packaging:</span>
                <span>₹{receiptData.packagingChargeTotal}</span>
              </div>
            )}
            {Number(receiptData.discountAmount || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Discount:</span>
                <span>-₹{receiptData.discountAmount}</span>
              </div>
            )}
            {Number(receiptData.taxAmount || 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>GST / Tax:</span>
                <span>₹{receiptData.taxAmount}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "900",
                fontSize: "13px",
                borderTop: "1px solid #000",
                paddingTop: "3px",
                marginTop: "2px",
              }}
            >
              <span>NET PAYABLE:</span>
              <span>₹{receiptData.netAmount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", marginTop: "2px" }}>
              <span>Payment Mode:</span>
              <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                {receiptData.paymentMethod}
              </span>
            </div>
          </div>

          {/* Footer Thank You */}
          <div
            style={{
              borderTop: "1px dashed #000",
              paddingTop: "4px",
              textAlign: "center",
              fontSize: "9px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {settings.customerReceiptFooter || "Thank You For Dining With Us! Visit Again"}
            </div>
            <div style={{ marginTop: "6px", fontSize: "8.5px", color: "#444" }}>
              ✂ - - - - - TEAR / CUT HERE - - - - - ✂
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(printableContent, document.body);
};
