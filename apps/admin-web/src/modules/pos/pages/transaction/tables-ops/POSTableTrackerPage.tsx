import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Edit3,
  Plus,
  Search,
  Receipt,
  Eye,
  RefreshCw,
  Layers,
  UtensilsCrossed,
  TrendingUp,
  X,
  ClipboardList,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Truck,
  BookOpen
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { POSOrder, POSTable, POSWaiter } from "../../../types";
import { IndianLiveClock } from "../../../components/IndianLiveClock";
import { POSTableQuickSettleModal } from "./POSTableQuickSettleModal";
import { CustomerDebtRegisterModal } from "../../../components/CustomerDebtRegisterModal";
import { POSOrderHoverTooltip } from "../../../components/POSOrderHoverTooltip";
import { renderSafeString } from "../../../utils/renderSafeString";

interface POSTableTrackerPageProps {
  tables: POSTable[];
  orders: POSOrder[];
  waiters?: POSWaiter[];
  customers?: any[];
  onRefreshCustomers?: () => Promise<void>;
  onRecallOrderToCart?: (order: POSOrder) => void;
  onSelectTableForNewOrder?: (tableId: number | string) => void;
  onSelectOrderModeForNewOrder?: (mode: "takeaway" | "delivery" | "dine_in") => void;
  onRefresh?: () => void;
  onOptimisticOrderSettle?: (orderNumber: string, tableId?: number | string) => void;
  isFullScreenPOS?: boolean;
  onToggleFullScreen?: () => void;
  onSwitchView?: (view: "billing" | "tables" | "orders" | "kds" | "shift") => void;
}

export const POSTableTrackerPage: React.FC<POSTableTrackerPageProps> = ({
  tables = [],
  orders = [],
  waiters = [],
  customers = [],
  onRefreshCustomers,
  onRecallOrderToCart,
  onSelectTableForNewOrder,
  onSelectOrderModeForNewOrder,
  onPrintReceipt,
  onRefresh,
  onOptimisticOrderSettle,
  isFullScreenPOS = false,
  onToggleFullScreen,
  onSwitchView
}) => {
  const navigate = useNavigate();

  const goToView = (target: "billing" | "tables" | "orders" | "kds" | "shift") => {
    if (onSwitchView) {
      onSwitchView(target);
    } else {
      navigate({ to: `/pos/transaction/${target}` });
    }
  };
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [previewOrderModal, setPreviewOrderModal] = useState<POSOrder | null>(null);
  const [selectedSettleOrder, setSelectedSettleOrder] = useState<POSOrder | null>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isDebtRegisterOpen, setIsDebtRegisterOpen] = useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Global Keyboard listener for fast Table Search (/ or Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.key === "/" && !isInputActive) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStartOrderMode = (mode: "takeaway" | "delivery") => {
    try {
      localStorage.setItem("selected_pos_order_mode", mode);
      localStorage.removeItem("selected_pos_table_id");
      localStorage.removeItem("edit_pos_order");
      toast.info(`Starting new ${mode === "takeaway" ? "Takeaway" : "Delivery"} order...`);
      if (onSelectOrderModeForNewOrder) {
        onSelectOrderModeForNewOrder(mode);
      }
      goToView("billing");
    } catch (err) {
      goToView("billing");
    }
  };

  const handleSearchSubmitOnEnter = () => {
    if (!searchTerm.trim()) return;
    const term = searchTerm.trim().toLowerCase();

    // 1. Search in tables
    const matchingTable = tables.find(
      (t) =>
        t.table_number.toLowerCase() === term ||
        t.table_number.toLowerCase().includes(term)
    );

    if (matchingTable) {
      const activeOrd = getActiveOrderForTable(matchingTable);
      handleTableClick(matchingTable, activeOrd);
      setSearchTerm("");
      return;
    }

    // 2. Search in active orders by order number or customer phone/name
    const matchingOrder = activeOrders.find(
      (o) =>
        (o.order_number || "").toLowerCase().includes(term) ||
        renderSafeString(o.customer_name).toLowerCase().includes(term) ||
        renderSafeString(o.customer_phone).includes(term)
    );

    if (matchingOrder) {
      try {
        localStorage.setItem("edit_pos_order", JSON.stringify(matchingOrder));
        if (onRecallOrderToCart) {
          onRecallOrderToCart(matchingOrder);
        }
        goToView("billing");
        setSearchTerm("");
      } catch (err) {
        goToView("billing");
      }
    }
  };

  // Filter active orders (status not completed/paid/cancelled)
  const activeOrders = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return !["completed", "paid", "cancelled"].includes(s);
  });

  // Helper to find ALL active orders for a given table (Multi-Order / Table Sharing)
  const getAllActiveOrdersForTable = (table: POSTable): POSOrder[] => {
    return activeOrders.filter((ord) => {
      const mode = (ord.order_mode || ord.order_type || "DINE_IN").toLowerCase();
      if (mode.includes("take") || mode.includes("pickup") || mode.includes("deliv")) return false;

      if (ord.table_id && String(ord.table_id) === String(table.id)) return true;

      if (ord.table_name && table.table_number) {
        const cleanOrd = ord.table_name.replace(/\s+/g, "").toLowerCase();
        const cleanTbl = table.table_number.replace(/\s+/g, "").toLowerCase();
        if (cleanOrd === cleanTbl) return true;
      }
      return false;
    });
  };

  // Helper for single active order fallback
  const getActiveOrderForTable = (table: POSTable): POSOrder | undefined => {
    const list = getAllActiveOrdersForTable(table);
    return list.length > 0 ? list[0] : undefined;
  };

  // Active Takeaway and Delivery Orders (Non-table active orders)
  const activeTakeawayOrders = activeOrders.filter((ord) => {
    const mode = (ord.order_mode || ord.order_type || "").toLowerCase();
    return mode.includes("take") || mode.includes("pickup");
  });

  const activeDeliveryOrders = activeOrders.filter((ord) => {
    const mode = (ord.order_mode || ord.order_type || "").toLowerCase();
    return mode.includes("deliv");
  });

  // Group tables by section
  const sectionMap: Record<string, POSTable[]> = {};
  tables.forEach((table) => {
    const secName = table.section?.trim() || "Main Dining";
    if (!sectionMap[secName]) {
      sectionMap[secName] = [];
    }
    sectionMap[secName].push(table);
  });

  const availableSections = Object.keys(sectionMap);

  // Filter sections based on selected tab
  const displaySections =
    selectedSection === "ALL"
      ? availableSections
      : availableSections.filter((s) => s.toLowerCase() === selectedSection.toLowerCase());

  // Count occupied vs free tables
  let occupiedCount = 0;
  let freeCount = 0;
  let activeRevenueTotal = 0;

  tables.forEach((table) => {
    const tableOrds = getAllActiveOrdersForTable(table);
    if (tableOrds.length > 0) {
      occupiedCount++;
      tableOrds.forEach((ord) => {
        activeRevenueTotal += Number(ord.net_amount || ord.subtotal || 0);
      });
    } else {
      freeCount++;
    }
  });

  // Add takeaway & delivery revenue to active total
  activeTakeawayOrders.concat(activeDeliveryOrders).forEach((ord) => {
    activeRevenueTotal += Number(ord.net_amount || ord.subtotal || 0);
  });

  // Handle clicking an Occupied Table -> Recalls order to cart in Edit mode
  const handleTableClick = (table: POSTable, activeOrder?: POSOrder) => {
    const rawTableId = table?.id !== undefined && table?.id !== null ? table.id : table?.table_number;
    if (activeOrder) {
      try {
        localStorage.setItem("edit_pos_order", JSON.stringify(activeOrder));
        if (rawTableId) {
          localStorage.setItem("selected_pos_table_id", String(rawTableId));
        }
        localStorage.setItem("selected_pos_order_mode", "dine_in");
        if (onRecallOrderToCart) {
          onRecallOrderToCart(activeOrder);
        } else {
          goToView("billing");
        }
      } catch (err) {
        console.error("Failed to load order for table", err);
        toast.error("Failed to load table order into cart");
      }
    } else {
      // Free Table -> Start new order with this table pre-selected
      try {
        if (rawTableId) {
          localStorage.setItem("selected_pos_table_id", String(rawTableId));
        }
        localStorage.setItem("selected_pos_order_mode", "dine_in");
        localStorage.removeItem("edit_pos_order");
        toast.info(`Selected Table ${table.table_number}. Starting new order...`);
        if (onSelectTableForNewOrder && rawTableId) {
          onSelectTableForNewOrder(rawTableId);
        } else {
          goToView("billing");
        }
      } catch (e) {
        goToView("billing");
      }
    }
  };

  return (
    <div className={`space-y-2.5 flex flex-col ${isFullScreenPOS ? "h-full" : "h-[calc(100vh-4.25rem)]"} overflow-hidden select-none font-sans`}>
      {/* IDE-Style Minimal Control Header Bar */}
      <div className="bg-card border border-border rounded-lg p-2.5 shrink-0 space-y-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Header Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-muted text-foreground rounded-md border border-border">
              <LayoutGrid size={16} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm text-foreground tracking-tight flex items-center gap-2">
                Table Floor Grid & Live Tracker
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE ⚡
                </span>
              </h2>
            </div>
          </div>

          {/* KPI Counters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-muted/60 text-muted-foreground rounded-md border border-border font-medium">
                Total: <strong className="text-foreground font-bold">{tables.length}</strong>
              </span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/30 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                Occupied: <strong>{occupiedCount}</strong>
              </span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md border border-emerald-500/30 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                Free: <strong>{freeCount}</strong>
              </span>
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-muted text-foreground rounded-md border border-border font-bold">
                Active: <strong className="text-primary">₹{activeRevenueTotal.toLocaleString("en-IN")}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <IndianLiveClock compact className="hidden sm:inline-flex" />
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 text-xs font-semibold rounded-md px-2 cursor-pointer hover:bg-muted"
                  title="Refresh Table States"
                >
                  <RefreshCw size={13} />
                </Button>
              )}
              {onToggleFullScreen && (
                <Button
                  variant={isFullScreenPOS ? "destructive" : "outline"}
                  size="sm"
                  onClick={onToggleFullScreen}
                  className="h-8 gap-1 text-xs font-semibold rounded-md cursor-pointer px-2"
                >
                  {isFullScreenPOS ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span className="hidden sm:inline">{isFullScreenPOS ? "Exit Fullscreen" : "Fullscreen"}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToView("orders")}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer px-2.5"
              >
                <ClipboardList size={13} />
                <span className="hidden sm:inline">Active Orders</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDebtRegisterOpen(true)}
                className="h-8 gap-1.5 text-xs font-bold rounded-md cursor-pointer px-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20 shadow-2xs"
                title="Open Customer Debt Register (Udhar Khata)"
              >
                <BookOpen size={13} />
                <span>Customer Debt (Udhar)</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => goToView("billing")}
                className="h-8 gap-1.5 text-xs font-bold rounded-md cursor-pointer px-3 bg-primary text-primary-foreground hover:opacity-90"
              >
                <UtensilsCrossed size={13} />
                <span>POS Terminal</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Section Filters & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-border">
          {/* Section Filter Rectangular Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedSection("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                selectedSection === "ALL"
                  ? "bg-foreground text-background border-foreground font-bold"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              All Zones ({tables.length})
            </button>
            {availableSections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedSection.toLowerCase() === sec.toLowerCase()
                    ? "bg-foreground text-background border-foreground font-bold"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {sec} ({sectionMap[sec]?.length || 0})
              </button>
            ))}
          </div>

          {/* Right Section: Takeaway / Delivery Shortcuts & Keyboard Searchable Table Input */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStartOrderMode("takeaway")}
                className="h-8 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                title="Start New Takeaway Order"
              >
                <ShoppingBag size={13} />
                <span>Takeaway</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartOrderMode("delivery")}
                className="h-8 px-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                title="Start New Delivery Order"
              >
                <Truck size={13} />
                <span>Delivery</span>
              </button>
            </div>

            {/* Keyboard Searchable Table Input */}
            <div className="relative w-56 shrink-0">
              <Input
                id="pos-table-search-input"
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmitOnEnter();
                  } else if (e.key === "Escape") {
                    setSearchTerm("");
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Search table or order #..."
                icon={<Search size={13} className="text-muted-foreground" />}
                className="h-8 text-xs font-medium bg-background border-border rounded-md pr-16"
              />
              {searchTerm ? (
                <kbd className="absolute right-1.5 top-1.5 px-1 py-0.2 rounded bg-muted border border-border text-[9px] font-mono font-bold pointer-events-none select-none">
                  Enter ↵
                </kbd>
              ) : (
                <kbd className="absolute right-1.5 top-1.5 px-1 py-0.2 rounded bg-muted border border-border text-[9px] font-mono font-bold text-muted-foreground pointer-events-none select-none">
                  / or Ctrl+K
                </kbd>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Floor Rectangular Tiles Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
        {displaySections.length === 0 ? (
          <div className="bg-card border border-border rounded-md p-6 text-center text-muted-foreground space-y-1">
            <AlertCircle size={24} className="mx-auto text-muted-foreground/50" />
            <p className="font-semibold text-xs text-foreground">No dining tables found matching filter.</p>
          </div>
        ) : (
          displaySections.map((secName) => {
            const secTables = sectionMap[secName] || [];
            const filteredTables = secTables.filter((t) => {
              const activeOrd = getActiveOrderForTable(t);
              const matchesSearch =
                t.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (activeOrd && activeOrd.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (activeOrd && activeOrd.waiter_name && activeOrd.waiter_name.toLowerCase().includes(searchTerm.toLowerCase()));
              return matchesSearch;
            });

            if (filteredTables.length === 0) return null;

            return (
              <div key={secName} className="space-y-2">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h3 className="font-sans font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-primary rounded-xs inline-block"></span>
                    {secName}
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      ({filteredTables.length})
                    </span>
                  </h3>
                </div>

                {/* Grid Layout of Rectangular IDE Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                  {filteredTables.map((table) => {
                    const tableOrds = getAllActiveOrdersForTable(table);
                    const activeOrd = getActiveOrderForTable(table);
                    const isOccupied = tableOrds.length > 0;
                    const isReserved = !isOccupied && table.status === "reserved";
                    const isCleaning = !isOccupied && table.status === "cleaning";
                    const totalRev = tableOrds.reduce((sum, o) => sum + Number(o.net_amount || o.subtotal || 0), 0);

                    return (
                      <div
                        key={table.id}
                        onClick={() => handleTableClick(table, activeOrd)}
                        className={`group relative rounded-md border p-2.5 sm:p-3 flex flex-col justify-between min-h-[96px] transition-all duration-150 cursor-pointer bg-card text-foreground shadow-2xs ${
                          isOccupied
                            ? "border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/20 border-l-4 border-l-amber-500 hover:border-amber-600 hover:shadow-xs"
                            : isReserved
                            ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10"
                            : isCleaning
                            ? "border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/20 hover:shadow-xs"
                        }`}
                      >
                        {/* Tile Header: Table Name & Capacity */}
                        <div className="flex items-center justify-between gap-1 border-b border-border/50 pb-1.5 min-w-0">
                          <span className="font-sans font-extrabold text-sm text-foreground truncate min-w-0">
                            {table.table_number}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border shrink-0 ${
                            isOccupied
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {table.capacity || 4} Seats
                          </span>
                        </div>

                        {/* Tile Body: Live Order Status & Total */}
                        {isOccupied && tableOrds.length > 0 ? (
                          <div className="my-auto py-1 space-y-1 w-full min-w-0 overflow-hidden">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300 min-w-0">
                              <span>₹{totalRev.toLocaleString("en-IN")}</span>
                              <span className="text-[10px] font-normal text-muted-foreground shrink-0">
                                ({tableOrds.length} ord)
                              </span>
                            </div>
                            <div className="space-y-1 overflow-hidden scrollbar-none min-w-0">
                              {tableOrds.map((ord) => (
                                <POSOrderHoverTooltip key={ord.id} order={ord}>
                                  <div className="bg-background border border-border rounded p-1 text-[10px] font-mono flex items-center justify-between gap-1 overflow-hidden min-w-0 shadow-2xs">
                                    <span className="truncate min-w-0 font-bold text-foreground">{ord.order_number}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTableClick(table, ord);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground text-foreground border border-border cursor-pointer text-[9px] font-sans font-bold transition-all shrink-0"
                                        title="Edit Cart"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSettleOrder(ord);
                                          setIsSettleModalOpen(true);
                                        }}
                                        className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer text-[9px] font-sans font-bold shadow-2xs transition-all shrink-0"
                                        title="Settle Bill"
                                      >
                                        Settle
                                      </button>
                                    </div>
                                  </div>
                                </POSOrderHoverTooltip>
                              ))}
                            </div>
                          </div>
                        ) : isReserved ? (
                          <div className="my-auto text-center py-2">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              RESERVED
                            </span>
                          </div>
                        ) : isCleaning ? (
                          <div className="my-auto text-center py-2">
                            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                              CLEANING
                            </span>
                          </div>
                        ) : (
                          <div className="my-auto text-center py-2">
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">
                              AVAILABLE
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Live Takeaway & Delivery IDE Command Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-border">
          {/* Active Takeaway Orders */}
          <div className="bg-card border border-border rounded-md p-2.5 space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <span className="font-sans font-bold text-xs text-foreground flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-amber-500" /> Active Takeaway ({activeTakeawayOrders.length})
              </span>
              <button
                type="button"
                onClick={() => handleStartOrderMode("takeaway")}
                className="px-2 py-0.5 rounded bg-muted hover:bg-foreground hover:text-background text-foreground border border-border text-[10px] font-bold cursor-pointer"
              >
                + Takeaway
              </button>
            </div>
            {activeTakeawayOrders.length === 0 ? (
              <p className="text-2xs text-muted-foreground italic py-1">No active takeaway orders running.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-none">
                {activeTakeawayOrders.map((ord) => (
                  <POSOrderHoverTooltip key={ord.id} order={ord}>
                    <div className="bg-background border border-border rounded p-2 text-xs flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-primary">{ord.order_number}</span>
                        <span className="font-extrabold text-foreground">₹{ord.net_amount || ord.subtotal || 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        👤 {renderSafeString(ord.customer_name, "Walk-in Guest")}
                      </p>
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          onClick={() => {
                            localStorage.setItem("edit_pos_order", JSON.stringify(ord));
                            if (onRecallOrderToCart) {
                              onRecallOrderToCart(ord);
                            }
                            goToView("billing");
                          }}
                          className="flex-1 py-0.5 rounded bg-muted hover:bg-accent hover:text-accent-foreground text-foreground border border-border text-[10px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSettleOrder(ord);
                            setIsSettleModalOpen(true);
                          }}
                          className="flex-1 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  </POSOrderHoverTooltip>
                ))}
              </div>
            )}
          </div>

          {/* Active Delivery Orders */}
          <div className="bg-card border border-border rounded-md p-2.5 space-y-2">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <span className="font-sans font-bold text-xs text-foreground flex items-center gap-1.5">
                <Truck size={13} className="text-indigo-500" /> Active Delivery ({activeDeliveryOrders.length})
              </span>
              <button
                type="button"
                onClick={() => handleStartOrderMode("delivery")}
                className="px-2 py-0.5 rounded bg-muted hover:bg-foreground hover:text-background text-foreground border border-border text-[10px] font-bold cursor-pointer"
              >
                + Delivery
              </button>
            </div>
            {activeDeliveryOrders.length === 0 ? (
              <p className="text-2xs text-muted-foreground italic py-1">No active delivery orders running.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-none">
                {activeDeliveryOrders.map((ord) => (
                  <POSOrderHoverTooltip key={ord.id} order={ord}>
                    <div className="bg-background border border-border rounded p-2 text-xs flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-primary">{ord.order_number}</span>
                        <span className="font-extrabold text-foreground">₹{ord.net_amount || ord.subtotal || 0}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        👤 {renderSafeString(ord.customer_name, "Delivery Guest")}
                      </p>
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          onClick={() => {
                            localStorage.setItem("edit_pos_order", JSON.stringify(ord));
                            if (onRecallOrderToCart) {
                              onRecallOrderToCart(ord);
                            }
                            goToView("billing");
                          }}
                          className="flex-1 py-0.5 rounded bg-muted hover:bg-accent hover:text-accent-foreground text-foreground border border-border text-[10px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSettleOrder(ord);
                            setIsSettleModalOpen(true);
                          }}
                          className="flex-1 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  </POSOrderHoverTooltip>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Order Items Preview Modal */}
      {previewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-sm p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <span className="text-[9px] font-bold uppercase text-muted-foreground">Order Preview</span>
                <h3 className="font-sans font-bold text-sm text-foreground flex items-center gap-1.5">
                  Order {previewOrderModal.order_number}
                </h3>
              </div>
              <button
                onClick={() => setPreviewOrderModal(null)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {previewOrderModal.items && previewOrderModal.items.length > 0 ? (
                previewOrderModal.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs font-medium py-1 border-b border-border/40">
                    <div>
                      <p className="text-foreground text-xs font-semibold">{item.name || item.product_name || item.item_name || "Item"}</p>
                      {item.variant_name && <span className="text-[9px] text-muted-foreground">({item.variant_name})</span>}
                    </div>
                    <div className="text-right font-mono text-xs">
                      <p className="text-foreground">x{item.quantity}</p>
                      <p className="text-muted-foreground">₹{Number(item.unit_price || item.price || 0) * item.quantity}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No items listed in order preview.</p>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase text-muted-foreground font-bold">Total Amount</p>
                <p className="text-sm font-bold text-foreground font-mono">
                  ₹{Number(previewOrderModal.net_amount || previewOrderModal.subtotal || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const ord = previewOrderModal;
                  setPreviewOrderModal(null);
                  handleTableClick({ id: ord.table_id || "table", table_number: ord.table_name || "Table", capacity: 4, status: "occupied" }, ord);
                }}
                className="gap-1 text-xs font-bold rounded-md cursor-pointer h-8"
              >
                <Edit3 size={12} /> Edit Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Table Settle Order Modal */}
      {selectedSettleOrder && (
        <POSTableQuickSettleModal
          order={selectedSettleOrder}
          isOpen={isSettleModalOpen}
          onClose={() => {
            setIsSettleModalOpen(false);
            setSelectedSettleOrder(null);
          }}
          onSuccess={() => {
            onRefresh?.();
          }}
          onOptimisticOrderSettle={onOptimisticOrderSettle}
          onPrintReceipt={onPrintReceipt}
          customers={customers}
          onRefreshCustomers={onRefreshCustomers}
        />
      )}

      {/* Customer Debt Register (Udhar Khata) Modal */}
      <CustomerDebtRegisterModal
        isOpen={isDebtRegisterOpen}
        onClose={() => setIsDebtRegisterOpen(false)}
        onPrintReceipt={onPrintReceipt}
        onRefreshData={onRefresh}
      />
    </div>
  );
};
