import React, { useState, useMemo, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  TrendingUp,
  Utensils,
  Calculator,
  Percent,
  Layers,
  ShieldAlert,
  Calendar,
  RefreshCw,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { DailySalesReport } from "./DailySalesReport";
import { ItemSalesReport } from "./ItemSalesReport";
import { CashierSettlementReport } from "./CashierSettlementReport";
import { GSTTaxSummaryReport } from "./GSTTaxSummaryReport";
import { CategorySalesReport } from "./CategorySalesReport";
import { VoidAuditReport } from "./VoidAuditReport";
import { CustomerDebtReport } from "./CustomerDebtReport";
import { POSOrder, POSCategory, POSMenuItem, POSTable, POSWaiter } from "../../types";

export type ReportTabKey = "daily" | "items" | "categories" | "settlement" | "gst" | "audit" | "debt";

interface POSReportsPageProps {
  orders: POSOrder[];
  categories?: POSCategory[];
  menuItems?: POSMenuItem[];
  tables?: POSTable[];
  waiters?: POSWaiter[];
  selectedBranch?: any;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const POSReportsPage: React.FC<POSReportsPageProps> = ({
  orders,
  categories = [],
  menuItems = [],
  tables = [],
  waiters = [],
  selectedBranch,
  onRefresh,
  isLoading = false,
}) => {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState?.location?.pathname || "/pos/reports/daily-sales";

  // Determine initial tab from route URL
  const determineTabFromPath = (path: string): ReportTabKey => {
    if (path.includes("item-sales")) return "items";
    if (path.includes("cashier-settlement")) return "settlement";
    if (path.includes("gst-summary")) return "gst";
    if (path.includes("categories") || path.includes("category-sales")) return "categories";
    if (path.includes("debt") || path.includes("udhar")) return "debt";
    if (path.includes("audit") || path.includes("void")) return "audit";
    return "daily";
  };

  const [activeReportTab, setActiveReportTab] = useState<ReportTabKey>(() =>
    determineTabFromPath(currentPath)
  );

  // Sync state if URL changes externally (e.g. sidebar navigation)
  useEffect(() => {
    const tab = determineTabFromPath(currentPath);
    setActiveReportTab(tab);
  }, [currentPath]);

  // Handle tab switch and synchronize router URL
  const handleTabSwitch = (tab: ReportTabKey) => {
    setActiveReportTab(tab);
    let targetPath = "/pos/reports/daily-sales";
    if (tab === "items") targetPath = "/pos/reports/item-sales";
    else if (tab === "categories") targetPath = "/pos/reports/categories";
    else if (tab === "settlement") targetPath = "/pos/reports/cashier-settlement";
    else if (tab === "gst") targetPath = "/pos/reports/gst-summary";
    else if (tab === "debt") targetPath = "/pos/reports/debt";
    else if (tab === "audit") targetPath = "/pos/reports/void-audit";

    // Update browser URL and router state seamlessly
    try {
      navigate({ to: targetPath as any }).catch(() => {
        window.history.pushState(null, "", targetPath);
      });
    } catch {
      window.history.pushState(null, "", targetPath);
    }
  };

  // Date Range Filter State
  const [dateRangePreset, setDateRangePreset] = useState<
    "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom"
  >("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Filter orders according to active date range
  const filteredOrders = useMemo(() => {
    if (dateRangePreset === "all") return orders;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

    return orders.filter((o) => {
      const orderDate = new Date(o.created_at || Date.now()).getTime();

      if (dateRangePreset === "today") {
        return orderDate >= todayStart && orderDate <= todayEnd;
      }
      if (dateRangePreset === "yesterday") {
        const yStart = todayStart - 24 * 60 * 60 * 1000;
        const yEnd = todayStart - 1;
        return orderDate >= yStart && orderDate <= yEnd;
      }
      if (dateRangePreset === "last7") {
        const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;
        return orderDate >= sevenDaysAgo;
      }
      if (dateRangePreset === "thisMonth") {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return orderDate >= monthStart;
      }
      if (dateRangePreset === "custom") {
        if (!customStartDate) return true;
        const cStart = new Date(customStartDate).getTime();
        const cEnd = customEndDate
          ? new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1
          : cStart + 24 * 60 * 60 * 1000 - 1;
        return orderDate >= cStart && orderDate <= cEnd;
      }
      return true;
    });
  }, [orders, dateRangePreset, customStartDate, customEndDate]);

  // Label for active date range
  const dateLabel = useMemo(() => {
    switch (dateRangePreset) {
      case "all":
        return "All Time";
      case "today":
        return "Today (" + new Date().toLocaleDateString("en-IN") + ")";
      case "yesterday":
        return "Yesterday";
      case "last7":
        return "Last 7 Days";
      case "thisMonth":
        return "This Month";
      case "custom":
        return `${customStartDate || "Start"} to ${customEndDate || "Now"}`;
    }
  }, [dateRangePreset, customStartDate, customEndDate]);

  const branchName = selectedBranch?.name || "Baithak Cafe (CUH)";

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="POS Realtime Analytics & Reports Center"
        description={`Transactional intelligence, cashier reconciliation, and tax analytics • Branch: ${branchName}`}
        icon={<BarChart3 size={18} className="text-primary" />}
        badge="Enterprise V2.0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Sync live database button */}
            {onRefresh && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                Sync
              </Button>
            )}

            {/* Sub-module Tab Navigation */}
            <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs overflow-x-auto">
              <button
                onClick={() => handleTabSwitch("daily")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "daily"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp size={12} />
                Daily Sales
              </button>
              <button
                onClick={() => handleTabSwitch("items")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "items"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Utensils size={12} />
                Dish Sales
              </button>
              <button
                onClick={() => handleTabSwitch("categories")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "categories"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers size={12} />
                Category Share
              </button>
              <button
                onClick={() => handleTabSwitch("settlement")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "settlement"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calculator size={12} />
                Cashier Settlement
              </button>
              <button
                onClick={() => handleTabSwitch("gst")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "gst"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Percent size={12} />
                GST & Tax
              </button>
              <button
                onClick={() => handleTabSwitch("debt")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "debt"
                    ? "bg-amber-500 text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen size={12} />
                Customer Debt (Udhar)
              </button>
              <button
                onClick={() => handleTabSwitch("audit")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "audit"
                    ? "bg-background text-destructive shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldAlert size={12} />
                Void Audit
              </button>
            </div>
          </div>
        }
      />

      {/* Date Range Control Bar */}
      <div className="bg-card border border-border rounded-md px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Calendar size={13} className="text-primary" /> Period:
          </span>
          <div className="inline-flex border border-border rounded-md p-0.5 bg-muted/30">
            <button
              onClick={() => setDateRangePreset("all")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Available ({orders.length})
            </button>
            <button
              onClick={() => setDateRangePreset("today")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "today"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRangePreset("yesterday")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "yesterday"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateRangePreset("last7")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "last7"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRangePreset("thisMonth")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "thisMonth"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRangePreset("custom")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "custom"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {dateRangePreset === "custom" && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
            />
          </div>
        )}

        <div className="text-[11px] text-muted-foreground font-mono">
          Loaded <span className="font-bold text-foreground">{filteredOrders.length}</span> records
        </div>
      </div>

      {/* Main Report Sub-Module Render */}
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        {activeReportTab === "daily" ? (
          <DailySalesReport orders={filteredOrders} dateLabel={dateLabel} onRefresh={onRefresh} />
        ) : activeReportTab === "items" ? (
          <ItemSalesReport
            orders={filteredOrders}
            categories={categories}
            menuItems={menuItems}
            dateLabel={dateLabel}
          />
        ) : activeReportTab === "categories" ? (
          <CategorySalesReport
            orders={filteredOrders}
            categories={categories}
            menuItems={menuItems}
            dateLabel={dateLabel}
          />
        ) : activeReportTab === "settlement" ? (
          <CashierSettlementReport
            orders={filteredOrders}
            dateLabel={dateLabel}
            branchName={branchName}
          />
        ) : activeReportTab === "gst" ? (
          <GSTTaxSummaryReport
            orders={filteredOrders}
            dateLabel={dateLabel}
            legalName={branchName}
          />
        ) : activeReportTab === "debt" ? (
          <CustomerDebtReport orders={filteredOrders} dateLabel={dateLabel} onRefresh={onRefresh} />
        ) : (
          <VoidAuditReport orders={filteredOrders} dateLabel={dateLabel} />
        )}
      </div>
    </PageContainer>
  );
};
