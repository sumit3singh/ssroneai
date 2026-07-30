import React from "react";
import { Percent, Printer } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSOrder } from "../types";

interface GSTTaxSummaryReportProps {
  orders: POSOrder[];
}

export const GSTTaxSummaryReport: React.FC<GSTTaxSummaryReportProps> = ({ orders }) => {
  const totalTaxable = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
  const totalGst = orders.reduce((s, o) => s + (o.tax_amount || 0), 0);
  const cgst = Math.round(totalGst / 2);
  const sgst = Math.round(totalGst / 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
          GST & Tax Compliance Summary Report
        </h3>
        <Button size="sm" variant="outline" className="font-bold text-xs gap-1">
          <Printer size={13} /> Print Tax Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">Total Taxable Value</span>
          <span className="font-mono font-black text-base text-foreground">₹{totalTaxable}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">CGST (2.5%)</span>
          <span className="font-mono font-black text-base text-foreground">₹{cgst}</span>
        </div>
        <div className="bg-muted/30 border border-border p-3 rounded-xl">
          <span className="text-3xs uppercase font-bold text-muted-foreground block">SGST (2.5%)</span>
          <span className="font-mono font-black text-base text-foreground">₹{sgst}</span>
        </div>
      </div>
    </div>
  );
};
