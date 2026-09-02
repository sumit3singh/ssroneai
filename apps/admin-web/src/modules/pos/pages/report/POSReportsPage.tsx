import React, { useState } from "react";
import { BarChart3, TrendingUp, Printer } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
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
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="POS Realtime Analytics & Reports Center"
        description="Computed dynamically from transactional PostgreSQL database queries"
        icon={<BarChart3 size={18} />}
        badge="Realtime Analytics"
        actions={
          <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs">
            <button
              onClick={() => setActiveReportTab("daily")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeReportTab === "daily" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Sales
            </button>
            <button
              onClick={() => setActiveReportTab("items")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeReportTab === "items" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dish Sales
            </button>
            <button
              onClick={() => setActiveReportTab("settlement")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeReportTab === "settlement" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cashier Settlement
            </button>
            <button
              onClick={() => setActiveReportTab("gst")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeReportTab === "gst" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              GST & Tax Summary
            </button>
          </div>
        }
      />

      {/* Main Report Sub-Module Render */}
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
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
    </PageContainer>
  );
};
