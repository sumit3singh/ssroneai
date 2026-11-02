import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import { api } from "@ssrone/api-client";
import { DailySalesReport } from "./DailySalesReport";
import { ItemSalesReport } from "./ItemSalesReport";
import { CashierSettlementReport } from "./CashierSettlementReport";
import { GSTTaxSummaryReport } from "./GSTTaxSummaryReport";
import { CategorySalesReport } from "./CategorySalesReport";
import { VoidAuditReport } from "./VoidAuditReport";
import { CustomerDebtReport } from "./CustomerDebtReport";
import { SalesBIDashboard } from "./SalesBIDashboard";
import { POSOrder, POSCategory, POSMenuItem, POSTable, POSWaiter } from "../../types";

export type ReportTabKey = "dashboard" | "daily" | "items" | "categories" | "settlement" | "gst" | "audit" | "debt";

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

// Helpers for Indian Standard Time (UTC+5:30) date computation
const getISTDate = (offsetDays: number = 0): string => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  if (offsetDays !== 0) {
    istDate.setDate(istDate.getDate() + offsetDays);
  }
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getISTMonthStart = (): string => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

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

  // Date Range Filter State (defaults to 'today' for microsecond instant render)
  const [dateRangePreset, setDateRangePreset] = useState<
    "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom"
  >("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Total DB order count (persisted across period queries)
  const [totalDbOrdersCount, setTotalDbOrdersCount] = useState<number>(() => orders.length);

  // In-memory cache for ultra-fast (0ms) period switching
  const periodCacheRef = useRef<Map<string, POSOrder[]>>(new Map());

  // Active period orders currently displayed
  const [periodOrders, setPeriodOrders] = useState<POSOrder[]>(() => orders);
  const [isFetchingPeriod, setIsFetchingPeriod] = useState<boolean>(false);

  // Dedicated period-based fetcher that queries PostgreSQL with targeted date ranges
  const fetchOrdersForPeriod = useCallback(async (
    preset: "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom",
    customStart?: string,
    customEnd?: string,
    forceRefresh: boolean = false
  ) => {
    const bId = selectedBranch?.id ? Number(selectedBranch.id) : null;
    const cacheKey = `${bId || "all"}_${preset}_${customStart || ""}_${customEnd || ""}`;

    // 0ms Cache Hit: If already cached and not forced, return immediately
    if (!forceRefresh && periodCacheRef.current.has(cacheKey)) {
      const cached = periodCacheRef.current.get(cacheKey)!;
      setPeriodOrders(cached);
      return;
    }

    let queryParams = bId ? `branch_id=${bId}` : "";
    const todayStr = getISTDate(0);

    if (preset === "today") {
      queryParams += `${queryParams ? "&" : ""}start_date=${todayStr}&end_date=${todayStr}&unlimited=true`;
    } else if (preset === "yesterday") {
      const yestStr = getISTDate(-1);
      queryParams += `${queryParams ? "&" : ""}start_date=${yestStr}&end_date=${yestStr}&unlimited=true`;
    } else if (preset === "last7") {
      const sevenDaysAgo = getISTDate(-6);
      queryParams += `${queryParams ? "&" : ""}start_date=${sevenDaysAgo}&end_date=${todayStr}&unlimited=true`;
    } else if (preset === "thisMonth") {
      const monthStart = getISTMonthStart();
      queryParams += `${queryParams ? "&" : ""}start_date=${monthStart}&end_date=${todayStr}&unlimited=true`;
    } else if (preset === "custom") {
      if (!customStart) return;
      const endStr = customEnd || customStart;
      queryParams += `${queryParams ? "&" : ""}start_date=${customStart}&end_date=${endStr}&unlimited=true`;
    } else if (preset === "all") {
      queryParams += `${queryParams ? "&" : ""}unlimited=true`;
    }

    setIsFetchingPeriod(true);
    try {
      const res = await api.get<any>(`/orders?${queryParams}`);
      const list: POSOrder[] = Array.isArray(res) ? res : (res?.items || res?.data || []);
      if (res?.total && typeof res.total === "number") {
        setTotalDbOrdersCount(res.total);
      }
      periodCacheRef.current.set(cacheKey, list);
      setPeriodOrders(list);
    } catch (err) {
      console.warn("Failed to fetch orders for period:", preset, err);
      // Fallback: If "today" and fetch fails, use props orders
      if (preset === "today" && orders.length > 0) {
        setPeriodOrders(orders);
      }
    } finally {
      setIsFetchingPeriod(false);
    }
  }, [selectedBranch?.id, orders]);

  // Handle Preset Selection
  const handlePresetSelect = (preset: "all" | "today" | "yesterday" | "last7" | "thisMonth" | "custom") => {
    setDateRangePreset(preset);
    if (preset !== "custom") {
      fetchOrdersForPeriod(preset);
    }
  };

  // Sync on branch switch or mount
  useEffect(() => {
    if (orders.length > 0) {
      const bId = selectedBranch?.id ? Number(selectedBranch.id) : null;
      periodCacheRef.current.set(`${bId || "all"}_today__`, orders);
    }
    fetchOrdersForPeriod(dateRangePreset, customStartDate, customEndDate);
  }, [selectedBranch?.id]);

  // Sync on custom dates change
  useEffect(() => {
    if (dateRangePreset === "custom" && customStartDate) {
      fetchOrdersForPeriod("custom", customStartDate, customEndDate);
    }
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Determine initial tab from route URL
  const determineTabFromPath = (path: string): ReportTabKey => {
    if (path.includes("sales-dashboard") || path.includes("sales-bi")) return "dashboard";
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
    if (tab === "dashboard") targetPath = "/pos/reports/sales-dashboard";
    else if (tab === "items") targetPath = "/pos/reports/item-sales";
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

  const handleManualSync = async () => {
    periodCacheRef.current.clear();
    onRefresh?.();
    await fetchOrdersForPeriod(dateRangePreset, customStartDate, customEndDate, true);
  };

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
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold gap-1.5 cursor-pointer h-7"
              onClick={handleManualSync}
              disabled={isLoading || isFetchingPeriod}
            >
              <RefreshCw size={13} className={isLoading || isFetchingPeriod ? "animate-spin" : ""} />
              Sync
            </Button>

            {/* Sub-module Tab Navigation */}
            <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs overflow-x-auto">
              <button
                onClick={() => handleTabSwitch("dashboard")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeReportTab === "dashboard"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 size={12} />
                Sales BI Dashboard
              </button>
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
              onClick={() => handlePresetSelect("all")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Available ({totalDbOrdersCount > 0 ? totalDbOrdersCount.toLocaleString() : (periodOrders.length > 0 ? periodOrders.length : "...")})
            </button>
            <button
              onClick={() => handlePresetSelect("today")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "today"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePresetSelect("yesterday")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "yesterday"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handlePresetSelect("last7")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "last7"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePresetSelect("thisMonth")}
              className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                dateRangePreset === "thisMonth"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handlePresetSelect("custom")}
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

        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
          {isFetchingPeriod && <RefreshCw size={11} className="animate-spin text-primary" />}
          <span>
            {isFetchingPeriod ? (
              <span className="text-primary font-medium">Fetching ledger...</span>
            ) : (
              <>Loaded <span className="font-bold text-foreground">{periodOrders.length}</span> records</>
            )}
          </span>
        </div>
      </div>

      {/* Main Report Sub-Module Render */}
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        {activeReportTab === "dashboard" ? (
          <SalesBIDashboard orders={periodOrders} dateLabel={dateLabel} onRefresh={handleManualSync} />
        ) : activeReportTab === "daily" ? (
          <DailySalesReport orders={periodOrders} dateLabel={dateLabel} onRefresh={handleManualSync} />
        ) : activeReportTab === "items" ? (
          <ItemSalesReport
            orders={periodOrders}
            categories={categories}
            menuItems={menuItems}
            dateLabel={dateLabel}
          />
        ) : activeReportTab === "categories" ? (
          <CategorySalesReport
            orders={periodOrders}
            categories={categories}
            menuItems={menuItems}
            dateLabel={dateLabel}
          />
        ) : activeReportTab === "settlement" ? (
          <CashierSettlementReport
            orders={periodOrders}
            dateLabel={dateLabel}
            branchName={branchName}
          />
        ) : activeReportTab === "gst" ? (
          <GSTTaxSummaryReport
            orders={periodOrders}
            dateLabel={dateLabel}
            legalName={branchName}
          />
        ) : activeReportTab === "debt" ? (
          <CustomerDebtReport orders={periodOrders} dateLabel={dateLabel} onRefresh={handleManualSync} />
        ) : (
          <VoidAuditReport orders={periodOrders} dateLabel={dateLabel} />
        )}
      </div>
    </PageContainer>
  );
};
