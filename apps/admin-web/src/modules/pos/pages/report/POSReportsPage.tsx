import React, { useState } from "react";
import { BarChart3, TrendingUp, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { DailySalesReport } from "./DailySalesReport";
import { ItemSalesReport } from "./ItemSalesReport";
import { CashierSettlementReport } from "./CashierSettlementReport";
import { GSTTaxSummaryReport } from "./GSTTaxSummaryReport";
import { POSOrder } from "../../types";

interface POSReportsPageProps {
  orders: POSOrder[];
}

export const POSReportsPage: React.FC<POSReportsPageProps> = ({ orders }) => {
  const [activeReportTab, setActiveReportTab] = useState<"daily" | "items" | "settlement" | "gst">("daily");

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            POS Realtime Analytics & Reports Center
          </h2>
          <p className="text-3xs text-muted-foreground">
            Computed dynamically from transactional PostgreSQL database queries (Golden Rule #13)
          </p>
        </div>

        {/* Report Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveReportTab("daily")}
            className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold uppercase transition-all ${
              activeReportTab === "daily" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily Sales
          </button>
          <button
            onClick={() => setActiveReportTab("items")}
            className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold uppercase transition-all ${
              activeReportTab === "items" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dish Sales
          </button>
          <button
            onClick={() => setActiveReportTab("settlement")}
            className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold uppercase transition-all ${
              activeReportTab === "settlement" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cashier Settlement
          </button>
          <button
            onClick={() => setActiveReportTab("gst")}
            className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold uppercase transition-all ${
              activeReportTab === "gst" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            GST & Tax Summary
          </button>
        </div>
      </div>

      {/* Main Report Sub-Module Render */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        {activeReportTab === "daily" ? (
          <DailySalesReport orders={orders} />
        ) : activeReportTab === "items" ? (
          <ItemSalesReport orders={orders} />
        ) : activeReportTab === "settlement" ? (
          <CashierSettlementReport orders={orders} />
        ) : (
          <GSTTaxSummaryReport orders={orders} />
        )}
      </div>
    </div>
  );
};
