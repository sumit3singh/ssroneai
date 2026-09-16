import React, { useMemo, useState } from "react";
import {
  Percent,
  Printer,
  Download,
  FileCheck,
  Building2,
  Receipt,
  Scale,
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface GSTTaxSummaryReportProps {
  orders: POSOrder[];
  dateLabel?: string;
  gstin?: string;
  legalName?: string;
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const GSTTaxSummaryReport: React.FC<GSTTaxSummaryReportProps> = ({
  orders,
  dateLabel = "Today",
  gstin = "06AAACS1234F1Z8",
  legalName = "SSR Enterprise Hospitality & Food Tech LLP",
}) => {
  const [activeView, setActiveView] = useState<"summary" | "invoices">("summary");

  // Filter completed/paid orders
  const validOrders = useMemo(() => {
    return orders.filter(
      (o) => (o.status || "").toLowerCase() !== "cancelled"
    );
  }, [orders]);

  // Aggregate Tax Calculations
  const taxStats = useMemo(() => {
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalTax = 0;
    let totalGrossInvoice = 0;

    // Slabs map
    let slab5Taxable = 0;
    let slab5Tax = 0;
    let slab18Taxable = 0;
    let slab18Tax = 0;
    let slab0Taxable = 0;

    validOrders.forEach((o) => {
      const net = safeNum(o.net_amount ?? o.subtotal);
      const tax = safeNum(o.tax_amount);
      const sub = safeNum(o.subtotal) || (net - tax);

      totalTaxable += sub;
      totalTax += tax;
      totalGrossInvoice += net;

      // In restaurant POS standard, standard tax is 5% (2.5% CGST + 2.5% SGST)
      const halfTax = tax / 2;
      totalCgst += halfTax;
      totalSgst += halfTax;

      if (tax > 0) {
        // Approximate slab based on rate or default to 5%
        const rate = sub > 0 ? Math.round((tax / sub) * 100) : 5;
        if (rate >= 15) {
          slab18Taxable += sub;
          slab18Tax += tax;
        } else {
          slab5Taxable += sub;
          slab5Tax += tax;
        }
      } else {
        slab0Taxable += sub;
      }
    });

    return {
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      totalGrossInvoice,
      slab5: { taxable: slab5Taxable, cgst: slab5Tax / 2, sgst: slab5Tax / 2, tax: slab5Tax },
      slab18: { taxable: slab18Taxable, cgst: slab18Tax / 2, sgst: slab18Tax / 2, tax: slab18Tax },
      slab0: { taxable: slab0Taxable, tax: 0 },
    };
  }, [validOrders]);

  const handleExportGSTR1CSV = () => {
    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Invoice Value (INR)",
      "Place of Supply",
      "Reverse Charge",
      "Applicable % of Tax Rate",
      "Taxable Value (INR)",
      "Central Tax (CGST)",
      "State Tax (SGST)",
      "Integrated Tax (IGST)",
      "Cess Amount",
    ];

    const rows = validOrders.map((o) => {
      const tax = safeNum(o.tax_amount);
      const net = safeNum(o.net_amount);
      const sub = safeNum(o.subtotal) || (net - tax);
      const rate = sub > 0 ? (tax / sub) * 100 : 5;

      return [
        `"#${o.order_number}"`,
        `"${new Date(o.created_at || Date.now()).toLocaleDateString("en-IN")}"`,
        net.toFixed(2),
        `"06-Haryana"`,
        `"N"`,
        `${Math.round(rate)}%`,
        sub.toFixed(2),
        (tax / 2).toFixed(2),
        (tax / 2).toFixed(2),
        "0.00",
        "0.00",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gstr1_sales_register_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Scale size={14} className="text-primary" />
            GST Compliance & Statutory Tax Summary
          </h3>
          <p className="text-[11px] text-muted-foreground">
            GSTIN: <span className="font-mono font-semibold text-foreground">{gstin}</span> • {legalName} ({dateLabel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={handleExportGSTR1CSV}
          >
            <Download size={13} /> GSTR-1 CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
            onClick={() => window.print()}
          >
            <Printer size={13} /> Print Tax Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Taxable Value */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Taxable Value (Turnover)
            </span>
            <Building2 size={14} className="text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{taxStats.totalTaxable.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            From {validOrders.length} valid tax invoices
          </span>
        </div>

        {/* CGST */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Central Tax (CGST 2.5%)
            </span>
            <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1 rounded">
              2.5%
            </span>
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{taxStats.totalCgst.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Central GST Output Liability
          </span>
        </div>

        {/* SGST */}
        <div className="bg-card border border-border p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              State Tax (SGST 2.5%)
            </span>
            <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1 rounded">
              2.5%
            </span>
          </div>
          <span className="font-mono font-bold text-lg text-foreground">
            ₹{taxStats.totalSgst.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            State / UT GST Output Liability
          </span>
        </div>

        {/* Total Tax Collected */}
        <div className="bg-muted/50 border border-primary/30 p-3.5 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-primary block">
              Total GST Output Collected
            </span>
            <Receipt size={14} className="text-primary" />
          </div>
          <span className="font-mono font-bold text-xl text-primary">
            ₹{taxStats.totalTax.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Gross Invoiced: ₹{taxStats.totalGrossInvoice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveView("summary")}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
            activeView === "summary"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Statutory Tax Slabs Matrix
        </button>
        <button
          onClick={() => setActiveView("invoices")}
          className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
            activeView === "invoices"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Invoice-Level Tax Register ({validOrders.length})
        </button>
      </div>

      {activeView === "summary" ? (
        /* Tax Slabs Table */
        <div className="overflow-x-auto border border-border rounded-md bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Tax Slab & Description</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable Turnover</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
                <th className="py-2.5 px-3 text-right">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              <tr className="hover:bg-muted/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-foreground">
                  Food & Restaurant Services (Standard)
                </td>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                  5.0% (2.5% + 2.5%)
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.slab5.taxable.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹{taxStats.slab5.cgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹{taxStats.slab5.sgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                  ₹{taxStats.slab5.tax.toFixed(2)}
                </td>
              </tr>

              <tr className="hover:bg-muted/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-foreground">
                  Beverages & Luxury Services
                </td>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                  18.0% (9.0% + 9.0%)
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.slab18.taxable.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹{taxStats.slab18.cgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹{taxStats.slab18.sgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                  ₹{taxStats.slab18.tax.toFixed(2)}
                </td>
              </tr>

              <tr className="hover:bg-muted/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-foreground">
                  Nil-Rated / Exempt Items
                </td>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                  0.0%
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.slab0.taxable.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹0.00
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                  ₹0.00
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                  ₹0.00
                </td>
              </tr>

              <tr className="bg-muted/30 font-bold border-t border-border">
                <td colSpan={2} className="py-2.5 px-3 text-foreground uppercase text-[11px]">
                  Consolidated Grand Total
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.totalTaxable.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.totalCgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-foreground">
                  ₹{taxStats.totalSgst.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                  ₹{taxStats.totalTax.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Invoices Register Table */
        <div className="overflow-x-auto border border-border rounded-md bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <th className="py-2.5 px-3">Bill #</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Order Type</th>
                <th className="py-2.5 px-3 text-right">Taxable Subtotal</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
                <th className="py-2.5 px-3 text-right">Total GST</th>
                <th className="py-2.5 px-3 text-right">Invoice Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {validOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-medium">
                    No tax invoices recorded for this date period.
                  </td>
                </tr>
              ) : (
                validOrders.map((o) => {
                  const tax = safeNum(o.tax_amount);
                  const net = safeNum(o.net_amount);
                  const sub = safeNum(o.subtotal) || (net - tax);
                  return (
                    <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                        #{o.order_number}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono">
                        {new Date(o.created_at || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 text-foreground font-medium">
                        {o.order_type || "DINE_IN"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        ₹{sub.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        ₹{(tax / 2).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        ₹{(tax / 2).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        ₹{tax.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">
                        ₹{net.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
