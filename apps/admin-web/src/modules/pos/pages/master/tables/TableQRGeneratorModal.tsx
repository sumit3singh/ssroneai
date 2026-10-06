import React, { useState, useMemo, useRef } from "react";
import { QrCode, Download, Printer, Check, CheckSquare, Square, Copy, Sparkles, ExternalLink, ShieldCheck, RefreshCw, X } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSTable } from "../../../types";
import { tablesApi } from "../../../api/tables.api";
import { useAuthStore } from "@ssrone/auth";
import { generateQRCodeSVG, generateQRCodeDataUrl } from "@ssrone/utils";
import { toast } from "sonner";

interface TableQRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: POSTable[];
  initialSelectedTable?: POSTable | null;
  onRefreshTables?: () => void;
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

  // Domain for customer food web app
  const defaultDomain = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : "http://localhost:3000";

  const [customerWebBaseUrl, setCustomerWebBaseUrl] = useState<string>(() => {
    // If on production / railway, match the domain pattern
    if (typeof window !== "undefined" && window.location.hostname.endsWith(".railway.app")) {
      return "https://customer-food-production.up.railway.app";
    }
    return defaultDomain;
  });

  const [selectedTableIds, setSelectedTableIds] = useState<Set<number | string>>(() => {
    if (initialSelectedTable) return new Set([initialSelectedTable.id]);
    return new Set(tables.map((t) => t.id));
  });

  const [isSaving, setIsSaving] = useState(false);
  const [standeeTheme, setStandeeTheme] = useState<"card" | "tent">("card");
  const printRef = useRef<HTMLDivElement>(null);

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

  // Save QR Code URLs to PostgreSQL Database
  const handleSaveToDatabase = async () => {
    if (tables.length === 0) return;
    setIsSaving(true);
    try {
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

  // Native Browser Print to PDF
  const handlePrint = () => {
    if (selectedTablesList.length === 0) {
      toast.error("No Tables Selected", { description: "Please select at least one table to print standees." });
      return;
    }
    window.print();
  };

  // Download individual SVG/PNG
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
    <>
      {/* ── PRINT-ONLY STYLES & CONTAINER ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-standees-container, #print-standees-container * {
            visibility: visible;
          }
          #print-standees-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
            background: white !important;
            color: black !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* Hidden printable DOM container */}
      <div id="print-standees-container" className="hidden print:block">
        <div className="grid grid-cols-2 gap-8">
          {selectedTablesList.map((table, idx) => {
            const qrUrl = getTableQrUrl(table.table_number, table.id);
            const qrSvg = generateQRCodeSVG(qrUrl, { size: 280, includeMargin: false });
            return (
              <div
                key={table.id}
                className={`border-2 border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-between text-center bg-white shadow-none ${
                  (idx + 1) % 4 === 0 ? "page-break" : ""
                }`}
                style={{ minHeight: "125mm", pageBreakInside: "avoid" }}
              >
                {/* Brand Header */}
                <div>
                  <div className="text-xl font-black tracking-tight uppercase text-slate-900 mb-0.5">
                    {branchName}
                  </div>
                  <div className="text-xs text-slate-600 font-semibold uppercase tracking-widest">
                    Digital Dining Experience
                  </div>
                </div>

                {/* Table Number Pill */}
                <div className="my-3 py-1.5 px-6 rounded-full bg-slate-900 text-white font-black text-xl tracking-wider uppercase">
                  Table {table.table_number}
                </div>

                {/* QR Code SVG */}
                <div
                  className="p-3 bg-white rounded-2xl border-2 border-slate-200 inline-block my-2"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                {/* Scan Instruction */}
                <div>
                  <div className="font-extrabold text-sm text-slate-900 mb-1">
                    📱 Scan Camera to View Menu & Order
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Compatible with iPhone & Android Camera · No App Download Required
                  </div>
                </div>

                {/* Footer URL */}
                <div className="text-[9px] text-slate-400 font-mono mt-2 truncate max-w-[240px]">
                  {qrUrl}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── INTERACTIVE MODAL DIALOG ── */}
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
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Configuration & Controls Bar */}
          <div className="px-5 py-3 border-b border-border bg-background grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
            <div className="md:col-span-7 flex flex-col gap-1">
              <label className="font-semibold text-muted-foreground text-[11px] flex items-center gap-1">
                Customer Food Web Destination URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customerWebBaseUrl}
                  onChange={(e) => setCustomerWebBaseUrl(e.target.value)}
                  placeholder="https://order.yourdomain.com"
                  className="flex-1 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => setCustomerWebBaseUrl(defaultDomain)}
                  className="px-2 py-1 text-[11px] border border-border rounded bg-card hover:bg-muted font-medium transition"
                  title="Reset to local port"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="md:col-span-5 flex items-center justify-end gap-2 pt-2 md:pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToDatabase}
                disabled={isSaving || tables.length === 0}
                className="gap-1.5 text-xs font-semibold"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} className="text-emerald-500" />}
                Save to Database
              </Button>

              <Button
                size="sm"
                onClick={handlePrint}
                disabled={selectedTablesList.length === 0}
                className="gap-1.5 text-xs font-semibold shadow-xs"
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
                          className="px-2 py-1 text-[10px] font-semibold border border-border rounded hover:bg-muted flex items-center gap-1 transition"
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
                          className="px-2 py-1 text-[10px] font-semibold border border-border rounded hover:bg-muted flex items-center gap-1 transition"
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
              Ready for high-DPI acrylic stands, stickers, and wooden table cards.
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
