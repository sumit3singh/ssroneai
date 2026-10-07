import React, { useState, useMemo } from "react";
import { QrCode, Download, CheckSquare, Square, Copy, Sparkles, ShieldCheck, RefreshCw, X, FileDown, Check } from "lucide-react";
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

function getDefaultCustomerWebUrl(tenantSlug: string): string {
  if (typeof window !== "undefined") {
    try {
      if (tenantSlug) {
        const savedTenant = localStorage.getItem(`customer_food_web_url_${tenantSlug}`);
        if (savedTenant && savedTenant.trim()) return savedTenant.trim();
      }
      const saved = localStorage.getItem("customer_food_web_url");
      if (saved && saved.trim()) return saved.trim();

      const host = window.location.hostname;
      // If hosted on Railway, point to the companion customer-food app
      if (host.endsWith(".railway.app")) {
        if (host.startsWith("admin-web-")) {
          return `https://${host.replace("admin-web-", "customer-food-")}`;
        }
        return "https://customer-food-web-production.up.railway.app";
      }
      // If hosted on custom subdomain, e.g. pos.company.com -> food.company.com
      if (host.startsWith("pos.") || host.startsWith("admin.")) {
        const domain = host.replace(/^(pos|admin)\./, "food.");
        return `${window.location.protocol}//${domain}`;
      }
      // Local development
      if (host === "localhost" || host === "127.0.0.1") {
        return `${window.location.protocol}//${host}:3002`;
      }
      return "https://customer-food-web-production.up.railway.app";
    } catch {
      return "https://customer-food-web-production.up.railway.app";
    }
  }
  return "https://customer-food-web-production.up.railway.app";
}

function exportPdfViaIframe(contentHtml: string) {
  let iframe = document.getElementById("standees-pdf-iframe") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "standees-pdf-iframe";
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
      console.error("Standees PDF print failed", err);
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
  const { tenant_slug, selected_branch, user } = useAuthStore();

  const tenantSlug = tenant_slug || (user as any)?.tenant_slug || "baithak-cafe";
  const branchCode = selected_branch?.code || "BAITHAK-CUH";
  const branchName = selected_branch?.name || "Main Dining";

  const [customerWebBaseUrl, setCustomerWebBaseUrl] = useState<string>(() =>
    getDefaultCustomerWebUrl(tenantSlug)
  );

  const [selectedTableIds, setSelectedTableIds] = useState<Set<number | string>>(() => {
    if (initialSelectedTable) return new Set([initialSelectedTable.id]);
    return new Set(tables.map((t) => t.id));
  });

  const [isSaving, setIsSaving] = useState(false);

  // Generate lightweight, ultra-high scannability Table QR URL
  // Omitting redundant query parameters keeps QR version low (V4-V6), making modules huge and bold for instant scanning
  const getTableQrUrl = (tableNumber: string) => {
    const base = customerWebBaseUrl.replace(/\/+$/, "");
    return `${base}/t/${encodeURIComponent(tenantSlug)}/b/${encodeURIComponent(branchCode)}/table/${encodeURIComponent(tableNumber)}`;
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
      if (tenantSlug) {
        localStorage.setItem(`customer_food_web_url_${tenantSlug}`, val);
      }
    } catch {}
  };

  // Save QR Code URLs to PostgreSQL Database
  const handleSaveToDatabase = async () => {
    if (tables.length === 0) return;
    setIsSaving(true);
    try {
      localStorage.setItem("customer_food_web_url", customerWebBaseUrl);
      if (tenantSlug) {
        localStorage.setItem(`customer_food_web_url_${tenantSlug}`, customerWebBaseUrl);
      }
      const payload = tables.map((t) => ({
        table_id: t.id,
        qr_code_url: getTableQrUrl(t.table_number),
      }));

      const res = await tablesApi.saveBatchTableQRs(payload);
      toast.success("QR Codes Saved to Database", {
        description: `Successfully synchronized ${res.updated_count || payload.length} table QR codes into dining_tables for ${branchName}.`,
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

  // High-DPI A4 Standees PDF Export (2 Standees per Page)
  const handleExportPdf = () => {
    if (selectedTablesList.length === 0) {
      toast.error("No Tables Selected", { description: "Please select at least one table to generate standees PDF." });
      return;
    }

    try {
      localStorage.setItem("customer_food_web_url", customerWebBaseUrl);
      if (tenantSlug) {
        localStorage.setItem(`customer_food_web_url_${tenantSlug}`, customerWebBaseUrl);
      }
    } catch {}

    const cardsHtml = selectedTablesList.map((table, idx) => {
      const qrUrl = getTableQrUrl(table.table_number);
      const qrSvg = generateQRCodeSVG(qrUrl, { size: 320, includeMargin: true });
      const isPageBreak = (idx + 1) % 2 === 0 && idx < selectedTablesList.length - 1;

      return `
        <div class="a4-standee-card">
          <div class="header-band">
            <div class="shop-title">${branchName}</div>
            <div class="shop-sub">Digital Dining Experience</div>
          </div>
          <div class="table-pill">TABLE ${table.table_number}</div>
          <div class="table-meta">${table.section || "Dining Floor"} · ${table.capacity || 4} Guests</div>
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
          <title>Table Standees PDF - ${branchName}</title>
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
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            }
            .a4-grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 10mm !important;
            }
            .a4-standee-card {
              border: 2.5px solid #0f172a !important;
              border-radius: 24px !important;
              padding: 9mm 8mm !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 4mm !important;
              background: #ffffff !important;
            }
            .shop-title {
              font-size: 22px !important;
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
              letter-spacing: 1.5px !important;
            }
            .table-pill {
              font-size: 24px !important;
              font-weight: 900 !important;
              padding: 6px 28px !important;
              background: #0f172a !important;
              color: #ffffff !important;
              border-radius: 9999px !important;
              margin: 8px 0 3px 0 !important;
              letter-spacing: 0.5px !important;
            }
            .table-meta {
              font-size: 11.5px !important;
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
              width: 230px !important;
              height: 230px !important;
            }
            .qr-box svg {
              width: 100% !important;
              height: 100% !important;
              display: block !important;
            }
            .cta-bold {
              font-size: 14.5px !important;
              font-weight: 900 !important;
              color: #0f172a !important;
              margin-top: 5px !important;
            }
            .cta-sub {
              font-size: 11px !important;
              font-weight: 600 !important;
              color: #64748b !important;
              margin-top: 2px !important;
            }
            .url-hint {
              font-size: 9px !important;
              font-family: monospace !important;
              color: #94a3b8 !important;
              word-break: break-all !important;
              margin-top: 6px !important;
              max-width: 110mm !important;
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
    exportPdfViaIframe(fullHtml);
  };

  // Download individual SVG
  const handleDownloadSingleQR = (table: POSTable) => {
    const url = getTableQrUrl(table.table_number);
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
                Generate high-scannability QR codes for {branchName} ({tenantSlug})
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
                placeholder="https://customer-food-web-production.up.railway.app"
                className="flex-1 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleUpdateUrl(getDefaultCustomerWebUrl(tenantSlug))}
                className="px-2 py-1 text-[11px] border border-border rounded bg-card hover:bg-muted font-medium transition cursor-pointer"
                title="Reset to default URL"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2 pt-2 md:pt-4">
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
              onClick={handleExportPdf}
              disabled={selectedTablesList.length === 0}
              className="gap-1.5 text-xs font-bold shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FileDown size={15} /> Export Standees PDF ({selectedTablesList.length})
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
              <span>Optimized 4x-Scannability QR · Works with any Tenant, Branch & Host</span>
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tables.map((table) => {
              const isSelected = selectedTableIds.has(table.id);
              const qrUrl = getTableQrUrl(table.table_number);
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
                      {table.section || "Main Floor"} · {table.capacity} Guests
                    </p>
                  </div>

                  {/* Vector QR Code */}
                  <div
                    className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs my-2.5 transition-transform hover:scale-105"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />

                  {/* Destination URL & Actions */}
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
            A4 Standees PDF ready · Select tables and click <b>Export Standees PDF</b> (choose "Save as PDF" in print dialog).
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
