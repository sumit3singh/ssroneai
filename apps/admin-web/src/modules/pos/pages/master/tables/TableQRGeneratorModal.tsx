import React, { useState, useMemo, useRef } from "react";
import { QrCode, Download, Printer, Check, CheckSquare, Square, Copy, Sparkles, ExternalLink, ShieldCheck, RefreshCw, X, FileText } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSTable } from "../../../types";
import { tablesApi } from "../../../api/tables.api";
import { useAuthStore } from "@ssrone/auth";
import { generateQRCodeSVG } from "@ssrone/utils";
import { toast } from "sonner";

interface TableQRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: POSTable[];
  initialSelectedTable?: POSTable | null;
  onRefreshTables?: () => void;
}

function getDefaultCustomerWebUrl(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("customer_food_web_url");
      if (saved && saved.trim()) return saved.trim();

      const host = window.location.hostname;
      // If on Railway, convert admin-web-production-... to customer-food-production-...
      if (host.endsWith(".railway.app")) {
        if (host.startsWith("admin-web-")) {
          return `https://${host.replace("admin-web-", "customer-food-")}`;
        }
        return "https://customer-food-production.up.railway.app";
      }
      return `${window.location.protocol}//${host}:3000`;
    } catch {
      return "http://localhost:3000";
    }
  }
  return "http://localhost:3000";
}

function printStandeesViaIframe(contentHtml: string) {
  let iframe = document.getElementById("standees-print-iframe") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "standees-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0px";
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
  frameDoc.write(contentHtml);
  frameDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Standees iframe print failed", err);
      window.print();
    }
  }, 350);
}

export const TableQRGeneratorModal: React.FC<TableQRGeneratorModalProps> = ({
  isOpen,
  onClose,
  tables = [],
  initialSelectedTable = null,
  onRefreshTables,
}) => {
  const { tenant_slug, selected_branch, selected_company, user } = useAuthStore();

  const tenantSlug = tenant_slug || "baithak-cafe";
  const branchCode = selected_branch?.code || "BAITHAK-CUH";
  const branchName = selected_branch?.name || "Main Campus Outlet";
  const companyId = selected_company?.id || 1;
  const branchId = selected_branch?.id || 1;
  const tenantId = user?.tenant_id || 1;

  const [customerWebBaseUrl, setCustomerWebBaseUrl] = useState<string>(() => getDefaultCustomerWebUrl());
  const [printFormat, setPrintFormat] = useState<"thermal" | "a4">("thermal");

  const [selectedTableIds, setSelectedTableIds] = useState<Set<number | string>>(() => {
    if (initialSelectedTable) return new Set([initialSelectedTable.id]);
    return new Set(tables.map((t) => t.id));
  });

  const [isSaving, setIsSaving] = useState(false);

  // Generate Table QR URL
  const getTableQrUrl = (tableNumber: string, tableId: number | string) => {
    const base = customerWebBaseUrl.replace(/\/+$/, "");
    return `${base}/t/${tenantSlug}/b/${branchCode}/table/${encodeURIComponent(tableNumber)}?company_id=${companyId}&branch_id=${branchId}&tenant_id=${tenantId}&table_id=${tableId}`;
  };

  const selectedTablesList = useMemo(() => {
    return tables.filter((t) => selectedTableIds.has(t.id));
  }, [tables, selectedTableIds]);

  const handleToggleSelectAll = () => {
    if (selectedTableIds.size === tables.length) {
      setSelectedTableIds(new Set());
    } else {
      setSelectedTableIds(new Set(tables.map((t) => t.id)));
    }
  };

  const handleToggleTable = (id: number | string) => {
    const next = new Set(selectedTableIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTableIds(next);
  };

  const handleUpdateUrl = (val: string) => {
    setCustomerWebBaseUrl(val);
    try {
      localStorage.setItem("customer_food_web_url", val);
    } catch {}
  };

  // Save QR Code URLs to PostgreSQL Database
  const handleSaveToDatabase = async () => {
    if (tables.length === 0) return;
    setIsSaving(true);
    try {
      localStorage.setItem("customer_food_web_url", customerWebBaseUrl);
      const payload = tables.map((t) => ({
        table_id: t.id,
        qr_code_url: getTableQrUrl(t.table_number, t.id),
      }));

      const res = await tablesApi.saveBatchTableQRs(payload);
      toast.success("QR Codes Saved to Database", {
        description: `Successfully synchronized ${res.updated_count || payload.length} table QR codes into PostgreSQL dining_tables.`,
      });
      if (onRefreshTables) onRefreshTables();
    } catch (err: any) {
      toast.error("Failed to Save QR Codes", {
        description: err?.response?.data?.detail || err?.message || "Could not update database records.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // High-DPI Iframe Print: Never Blank, Supports 80mm POS Thermal & A4 Desktop
  const handlePrint = () => {
    if (selectedTablesList.length === 0) {
      toast.error("No Tables Selected", { description: "Please select at least one table to print standees." });
      return;
    }

    try {
      localStorage.setItem("customer_food_web_url", customerWebBaseUrl);
    } catch {}

    if (printFormat === "thermal") {
      // 80mm Thermal Standee Slip for POS roll printers (like RETSOL RPT82)
      const slipsHtml = selectedTablesList.map((table) => {
        const qrUrl = getTableQrUrl(table.table_number, table.id);
        const qrSvg = generateQRCodeSVG(qrUrl, { size: 240, includeMargin: true });
        return `
          <div class="thermal-standee-slip">
            <div class="shop-title">${branchName}</div>
            <div class="shop-sub">Digital Dining Experience</div>
            <div class="table-pill">TABLE ${table.table_number}</div>
            <div class="table-meta">${table.section || "Main Dining"} · ${table.capacity || 4} Guests</div>
            <div class="qr-container">${qrSvg}</div>
            <div class="cta-bold">📱 Scan Camera to View Menu & Order</div>
            <div class="cta-sub">Compatible with iPhone & Android · No App Required</div>
            <div class="url-hint">${qrUrl}</div>
          </div>
        `;
      }).join("");

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Table Standees (80mm Thermal)</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              * {
                box-sizing: border-box !important;
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              }
              .thermal-standee-slip {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                max-width: 76mm !important;
                margin: 0 auto !important;
                padding: 6mm 3mm 8mm 3mm !important;
                text-align: center !important;
                border-bottom: 2px dashed #000000 !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .thermal-standee-slip:last-child {
                border-bottom: none !important;
                page-break-after: auto !important;
              }
              .shop-title {
                font-size: 16px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                letter-spacing: -0.3px !important;
                line-height: 1.2 !important;
              }
              .shop-sub {
                font-size: 10px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                color: #444444 !important;
                margin-top: 2px !important;
                letter-spacing: 0.5px !important;
              }
              .table-pill {
                display: inline-block !important;
                font-size: 18px !important;
                font-weight: 900 !important;
                background: #000000 !important;
                color: #ffffff !important;
                padding: 4px 16px !important;
                border-radius: 9999px !important;
                margin: 6px 0 2px 0 !important;
                letter-spacing: 0.5px !important;
              }
              .table-meta {
                font-size: 10.5px !important;
                font-weight: 600 !important;
                color: #555555 !important;
                margin-bottom: 4px !important;
              }
              .qr-container {
                display: block !important;
                background: #ffffff !important;
                padding: 2px !important;
                margin: 4px auto !important;
                width: 180px !important;
                height: 180px !important;
              }
              .qr-container svg {
                width: 100% !important;
                height: 100% !important;
                display: block !important;
              }
              .cta-bold {
                font-size: 12px !important;
                font-weight: 900 !important;
                margin-top: 5px !important;
                line-height: 1.3 !important;
              }
              .cta-sub {
                font-size: 9.5px !important;
                font-weight: 600 !important;
                color: #333333 !important;
                margin-top: 2px !important;
              }
              .url-hint {
                font-size: 8px !important;
                font-family: monospace !important;
                color: #666666 !important;
                word-break: break-all !important;
                margin-top: 5px !important;
                max-width: 68mm !important;
              }
            </style>
          </head>
          <body>
            ${slipsHtml}
          </body>
        </html>
      `;
      printStandeesViaIframe(fullHtml);
    } else {
      // A4 Sheet Cards (2 per page)
      const cardsHtml = selectedTablesList.map((table, idx) => {
        const qrUrl = getTableQrUrl(table.table_number, table.id);
        const qrSvg = generateQRCodeSVG(qrUrl, { size: 300, includeMargin: false });
        const isPageBreak = (idx + 1) % 2 === 0;
        return `
          <div class="a4-standee-card">
            <div class="shop-title">${branchName}</div>
            <div class="shop-sub">Digital Dining Experience</div>
            <div class="table-pill">TABLE ${table.table_number}</div>
            <div class="table-meta">${table.section || "Main Dining"} · ${table.capacity || 4} Guests</div>
            <div class="qr-box">${qrSvg}</div>
            <div class="cta-bold">📱 Scan Camera to View Menu & Order</div>
            <div class="cta-sub">Compatible with iPhone & Android · No App Download Required</div>
            <div class="url-hint">${qrUrl}</div>
          </div>
          ${isPageBreak ? '<div style="page-break-after: always; break-after: page;"></div>' : ''}
        `;
      }).join("");

      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Table Standees (A4 Cards)</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 12mm 10mm;
              }
              * {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              }
              .a4-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 10mm !important;
              }
              .a4-standee-card {
                border: 3px solid #0f172a !important;
                border-radius: 24px !important;
                padding: 8mm 6mm !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 6mm !important;
              }
              .shop-title {
                font-size: 20px !important;
                font-weight: 900 !important;
                text-transform: uppercase !important;
                letter-spacing: -0.5px !important;
                margin-bottom: 2px !important;
              }
              .shop-sub {
                font-size: 11px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                color: #475569 !important;
                letter-spacing: 1px !important;
              }
              .table-pill {
                font-size: 22px !important;
                font-weight: 900 !important;
                padding: 5px 24px !important;
                background: #0f172a !important;
                color: #ffffff !important;
                border-radius: 9999px !important;
                margin: 8px 0 2px 0 !important;
              }
              .table-meta {
                font-size: 11px !important;
                font-weight: 600 !important;
                color: #64748b !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
              }
              .qr-box {
                padding: 10px !important;
                background: #ffffff !important;
                border: 2px solid #e2e8f0 !important;
                border-radius: 20px !important;
                margin: 8px auto !important;
                width: 220px !important;
                height: 220px !important;
              }
              .qr-box svg {
                width: 100% !important;
                height: 100% !important;
                display: block !important;
              }
              .cta-bold {
                font-size: 14px !important;
                font-weight: 900 !important;
                color: #0f172a !important;
                margin-top: 4px !important;
              }
              .cta-sub {
                font-size: 11px !important;
                font-weight: 500 !important;
                color: #64748b !important;
                margin-top: 2px !important;
              }
              .url-hint {
                font-size: 9px !important;
                font-family: monospace !important;
                color: #94a3b8 !important;
                word-break: break-all !important;
                margin-top: 6px !important;
                max-width: 100mm !important;
              }
            </style>
          </head>
          <body>
            <div class="a4-grid">
              ${cardsHtml}
            </div>
          </body>
        </html>
      `;
      printStandeesViaIframe(fullHtml);
    }
  };

  // Download individual SVG
  const handleDownloadSingleQR = (table: POSTable) => {
    const url = getTableQrUrl(table.table_number, table.id);
    const svgString = generateQRCodeSVG(url, { size: 512, includeMargin: true });
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `Table-${table.table_number}-QR.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success(`Downloaded QR for Table ${table.table_number}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <QrCode size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Table QR Codes & Printable Standees
              </h2>
              <p className="text-xs text-muted-foreground">
                Generate unique digital dining QR codes for tables in {branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Configuration & Controls Bar */}
        <div className="px-5 py-3 border-b border-border bg-background grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
          <div className="md:col-span-6 flex flex-col gap-1">
            <label className="font-semibold text-muted-foreground text-[11px] flex items-center gap-1">
              Customer Food Web Destination URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customerWebBaseUrl}
                onChange={(e) => handleUpdateUrl(e.target.value)}
                placeholder="https://customer-food-production.up.railway.app"
                className="flex-1 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleUpdateUrl(getDefaultCustomerWebUrl())}
                className="px-2 py-1 text-[11px] border border-border rounded bg-card hover:bg-muted font-medium transition cursor-pointer"
                title="Reset to default URL"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-4">
            {/* Print Mode Selector */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPrintFormat("thermal")}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  printFormat === "thermal"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Format for 80mm POS Thermal Roll Printer (RETSOL RPT82)"
              >
                🧾 80mm Thermal (RETSOL)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat("a4")}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  printFormat === "a4"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Format for A4 Sheet Cards / Acrylic Standees"
              >
                📄 A4 Cards
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToDatabase}
              disabled={isSaving || tables.length === 0}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} className="text-emerald-500" />}
              Save to Database
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              disabled={selectedTablesList.length === 0}
              className="gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Printer size={14} /> Print Standees ({selectedTablesList.length})
            </Button>
          </div>
        </div>

        {/* Body: Table Cards & QR Preview Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Selection Toolbar */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition cursor-pointer"
            >
              {selectedTableIds.size === tables.length && tables.length > 0 ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} className="text-muted-foreground" />
              )}
              <span>Select All Tables ({selectedTablesList.length}/{tables.length})</span>
            </button>

            <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
              <Sparkles size={13} className="text-amber-500" />
              <span>Encodes Tenant, Company, Branch, & Table Number</span>
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map((table) => {
              const isSelected = selectedTableIds.has(table.id);
              const qrUrl = getTableQrUrl(table.table_number, table.id);
              const qrSvg = generateQRCodeSVG(qrUrl, { size: 160, includeMargin: true });

              return (
                <div
                  key={table.id}
                  onClick={() => handleToggleTable(table.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-center text-center ${
                    isSelected
                      ? "bg-primary/5 border-primary/60 shadow-sm"
                      : "bg-card border-border hover:border-border/80 opacity-70"
                  }`}
                >
                  {/* Checkbox indicator */}
                  <div className="absolute top-3 left-3">
                    {isSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} className="text-muted-foreground" />
                    )}
                  </div>

                  {/* Table Title & Section */}
                  <div className="pt-1">
                    <div className="font-bold text-sm text-foreground flex items-center justify-center gap-1.5">
                      <span>Table {table.table_number}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">
                      {table.section || "Main Dining"} · {table.capacity} Guests
                    </p>
                  </div>

                  {/* Vector QR Code */}
                  <div
                    className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs my-2.5 transition-transform hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />

                  {/* Destination URL & Download */}
                  <div className="w-full space-y-2">
                    <div className="text-[9px] font-mono text-muted-foreground bg-muted/60 p-1.5 rounded truncate text-left" title={qrUrl}>
                      {qrUrl}
                    </div>

                    <div className="flex items-center gap-1.5 justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(qrUrl);
                          toast.success(`Copied URL for Table ${table.table_number}`);
                        }}
                        className="px-2 py-1 text-[10px] font-semibold border border-border rounded hover:bg-muted flex items-center gap-1 transition cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy size={11} /> Copy Link
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingleQR(table);
                        }}
                        className="px-2 py-1 text-[10px] font-semibold border border-border rounded hover:bg-muted flex items-center gap-1 transition cursor-pointer"
                        title="Download SVG"
                      >
                        <Download size={11} /> SVG
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
          <div className="text-muted-foreground text-[11px]">
            Ready for {printFormat === "thermal" ? "80mm POS Thermal receipt roll printers" : "A4 acrylic stands and desktop printers"}.
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
