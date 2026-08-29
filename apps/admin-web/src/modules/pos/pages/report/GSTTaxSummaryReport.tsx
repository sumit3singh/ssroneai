import React from "react";
import { Percent, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSOrder } from "../../types";

interface GSTTaxSummaryReportProps {
  orders: POSOrder[];
}

const safeNum = (val: any): number => {
  if (val === null || val === undefined) return 0;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(num) ? 0 : num;
};

export const GSTTaxSummaryReport: React.FC<GSTTaxSummaryReportProps> = ({ orders }) => {
  const totalTaxable = orders.reduce((s, o) => s + safeNum(o.subtotal || 0), 0);
  const totalGst = orders.reduce((s, o) => s + safeNum(o.tax_amount || 0), 0);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          GST & Tax Compliance Summary Report
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1" onClick={() => window.print()}>
          <Printer size={13} /> Print Tax Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Total Taxable Value</span>
          <span className="font-mono font-black text-base text-foreground">₹{totalTaxable.toFixed(2)}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">CGST (2.5%)</span>
          <span className="font-mono font-black text-base text-foreground">₹{cgst.toFixed(2)}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">SGST (2.5%)</span>
          <span className="font-mono font-black text-base text-foreground">₹{sgst.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
