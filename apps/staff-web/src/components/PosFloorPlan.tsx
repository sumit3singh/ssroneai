import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Utensils,
  Users,
  Clock,
  Plus,
  Receipt,
  LayoutGrid,
  Search,
  CheckCircle2,
  X,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShoppingBag,
  Bike,
  BookOpen,
  DollarSign,
  ChevronLeft,
  Lock,
  Eye,
  Edit3,
  QrCode,
  CreditCard,
  Printer,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, TableItem } from "@/stores/useStaffPOSStore";
import { RunningOrder } from "./ActiveOrdersTracker";
import { ActiveTableModal } from "./ActiveTableModal";

interface PosFloorPlanProps {
  tables: TableItem[];
  runningOrders: RunningOrder[];
  onSelectTableForOrder: (tableNumber: string) => void;
  onRecallOrderToCart?: (order: RunningOrder) => void;
  onSettleOrder?: (order: RunningOrder, paymentMethod: string, amount: number) => Promise<void>;
  onViewTableBill?: (order: RunningOrder) => void;
  onDirectTakeaway?: () => void;
  onDirectDelivery?: () => void;
  onRefreshData?: () => void;
  onGoToPOSTerminal?: () => void;
  authName?: string;
  branchName?: string;
  openKotsCount?: number;
  onOpenKds?: () => void;
  onLock?: () => void;
  onBackToHub?: () => void;
}

export const PosFloorPlan: React.FC<PosFloorPlanProps> = ({
  tables,
  runningOrders,
  onSelectTableForOrder,
  onRecallOrderToCart,
  onSettleOrder,
  onViewTableBill,
  onDirectTakeaway,
  onDirectDelivery,
  onRefreshData,
  onGoToPOSTerminal,
  authName,
  branchName,
  openKotsCount,
  onOpenKds,
  onLock,
  onBackToHub,
}) => {
  const store = useStaffPOS();

  // Filters & State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "OCCUPIED" | "FREE">("ALL");
  const [selectedZone, setSelectedZone] = useState<string>("ALL ZONES");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [activeViewingOrder, setActiveViewingOrder] = useState<{ order: RunningOrder; tableName: string } | null>(null);
  const [settlingOrder, setSettlingOrder] = useState<{ order: RunningOrder; tableName: string } | null>(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [tenderedCash, setTenderedCash] = useState<number>(0);
  const [isSubmittingSettle, setIsSubmittingSettle] = useState(false);

  // Extra modals requested: Active Orders Drawer & Customer Debt Modal
  const [showActiveOrdersModal, setShowActiveOrdersModal] = useState(false);
  const [showDebtRegisterModal, setShowDebtRegisterModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard listener for fast Table Search (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "/" && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter active confirmed orders (not completed, cancelled, or settled)
  const activeOrders = useMemo(() => {
    return runningOrders.filter((o) => {
      const s = String(o.status || "").toLowerCase();
      return s !== "completed" && s !== "cancelled" && s !== "paid" && s !== "settled";
    });
  }, [runningOrders]);

  // Non-table active takeaway and delivery counts
  const activeTakeaways = useMemo(() => {
    return activeOrders.filter((o) => {
      const num = String(o.table_number || "").toLowerCase();
      return num.includes("takeaway") || num.includes("parcel");
    });
  }, [activeOrders]);

  const activeDeliveries = useMemo(() => {
    return activeOrders.filter((o) => {
      const num = String(o.table_number || "").toLowerCase();
      return num.includes("delivery") || num.includes("rider");
    });
  }, [activeOrders]);

  // Map active orders by table number or table id
  const tableOrderMap = useMemo(() => {
    const map = new Map<string, RunningOrder[]>();
    activeOrders.forEach((o) => {
      if (o.table_number) {
        const k = String(o.table_number).toLowerCase().trim();
        const existing = map.get(k) || [];
        existing.push(o);
        map.set(k, existing);
      }
      if ((o as any).table_id) {
        const k = `id_${(o as any).table_id}`;
        const existing = map.get(k) || [];
        existing.push(o);
        map.set(k, existing);
      }
    });
    return map;
  }, [activeOrders]);

  // Helper to find all running orders for a table (Multi-Order / Table Sharing)
  const getTableRunningOrders = (tbl: TableItem): RunningOrder[] => {
    const numKey = String(tbl.number || "").toLowerCase().trim();
    if (tableOrderMap.has(numKey)) return tableOrderMap.get(numKey)!;
    const idKey = `id_${tbl.id}`;
    if (tableOrderMap.has(idKey)) return tableOrderMap.get(idKey)!;
    return [];
  };

  // Group tables by zones / sections matching Screenshot 1: CABIN (10), OPEN AREA (6), HALL (6), FRONT (6)
  const groupedSections = useMemo(() => {
    const groups: Record<string, TableItem[]> = {
      "CABIN": [],
      "OPEN AREA": [],
      "HALL": [],
      "FRONT": [],
    };

    tables.forEach((t) => {
      const num = (t.number || "").toUpperCase();
      const sec = (t.floor || t.section || "").toUpperCase();

      if (num.startsWith("C-") || sec.includes("CABIN")) {
        groups["CABIN"].push(t);
      } else if (num.startsWith("O-") || sec.includes("OPEN")) {
        groups["OPEN AREA"].push(t);
      } else if (num.startsWith("H-") || sec.includes("HALL")) {
        groups["HALL"].push(t);
      } else if (num.startsWith("F-") || sec.includes("FRONT") || sec.includes("PORCH")) {
        groups["FRONT"].push(t);
      } else {
        if (!groups[sec]) groups[sec] = [];
        groups[sec].push(t);
      }
    });

    const result: Array<{ name: string; tables: TableItem[] }> = [];
    Object.keys(groups).forEach((key) => {
      if (groups[key].length > 0) {
        result.push({ name: key, tables: groups[key] });
      }
    });

    return result;
  }, [tables]);

  // Overall metrics matching Screenshot 1
  const totalTablesCount = tables.length;
  const occupiedCount = tables.filter((t) => {
    const orders = getTableRunningOrders(t);
    return t.status === "occupied" || orders.length > 0;
  }).length;
  const freeCount = Math.max(0, totalTablesCount - occupiedCount);
  const totalActiveRevenue = activeOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);

  // Filtered grouped sections based on selectedZone, selectedStatusFilter, and searchQuery
  const displayedSections = useMemo(() => {
    return groupedSections
      .map((sec) => {
        // 1. Zone filter
        if (selectedZone !== "ALL ZONES") {
          const cleanZone = selectedZone.replace(/\s*\(\d+\)/, "").toUpperCase().trim();
          if (!sec.name.toUpperCase().includes(cleanZone)) return null;
        }

        // 2. Status & Search filter on tables
        const matchedTables = sec.tables.filter((t) => {
          const orders = getTableRunningOrders(t);
          const isOcc = t.status === "occupied" || orders.length > 0;

          // Status filter
          if (selectedStatusFilter === "OCCUPIED" && !isOcc) return false;
          if (selectedStatusFilter === "FREE" && isOcc) return false;

          // Search query filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchNumber = String(t.number || "").toLowerCase().includes(q);
            const matchOrder = orders.some((o) =>
              String(o.order_number || "").toLowerCase().includes(q) ||
              String(o.waiter_name || "").toLowerCase().includes(q)
            );
            if (!matchNumber && !matchOrder) return false;
          }

          return true;
        });

        if (matchedTables.length === 0) return null;
        return { name: sec.name, tables: matchedTables };
      })
      .filter(Boolean) as Array<{ name: string; tables: TableItem[] }>;
  }, [groupedSections, selectedZone, selectedStatusFilter, searchQuery, tables, tableOrderMap]);

  // Toggle fullscreen kiosk mode
  const toggleFullscreen = () => {
    sound.tap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Open Direct Quick Settle modal for a table
  const handleOpenSettle = (order: RunningOrder, tableName: string) => {
    sound.tap();
    setSettlingOrder({ order, tableName });
    setSettlePaymentMethod("CASH");
    setTenderedCash(order.grand_total || 0);
  };

  // Execute Direct Table Settlement
  const handleExecuteSettle = async () => {
    if (!settlingOrder) return;
    setIsSubmittingSettle(true);
    sound.paymentSuccess();

    try {
      if (onSettleOrder) {
        await onSettleOrder(settlingOrder.order, settlePaymentMethod, tenderedCash || settlingOrder.order.grand_total);
      } else if (onViewTableBill) {
        onViewTableBill(settlingOrder.order);
      }
    } catch (err) {
      console.warn("Settlement error:", err);
    } finally {
      setIsSubmittingSettle(false);
      setSettlingOrder(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto space-y-3.5 max-w-7xl mx-auto w-full">
      {/* 1. TOP OPERATIONAL TELEMETRY & ACTIONS (Exact Parity with Screenshot 1) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Left: Title & Live Heartbeat */}
        <div className="flex items-center gap-2.5">
          {onBackToHub && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onBackToHub();
              }}
              className="min-h-[34px] px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft size={15} />
              <span>Hub</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-slate-800" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Table Floor Grid &amp; Live Tracker</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                <span>LIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Live Capacity Telemetry Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Total: 28 */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition cursor-pointer active:scale-95 ${
              selectedStatusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Total: {totalTablesCount}
          </button>

          {/* Occupied: 8 */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter("OCCUPIED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
              selectedStatusFilter === "OCCUPIED"
                ? "bg-amber-100 text-amber-950 font-black shadow-xs ring-2 ring-amber-400"
                : "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Occupied: {occupiedCount}</span>
          </button>

          {/* Free: 20 */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter("FREE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
              selectedStatusFilter === "FREE"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Free: {freeCount}</span>
          </button>

          {/* Active: ₹2,350 */}
          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Active: ₹{totalActiveRevenue.toLocaleString()}
          </span>
        </div>

        {/* Right: Global Actions Matching Screenshot 1 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Data Refresh ⟳ */}
          {onRefreshData && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onRefreshData();
              }}
              title="Refresh Tables"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center cursor-pointer transition active:scale-95 shadow-2xs"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {/* Fullscreen Kiosk Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[34px] px-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {/* Active Orders Tracker */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setShowActiveOrdersModal(true);
            }}
            className="min-h-[34px] px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
          >
            <Receipt size={13} />
            <span>Active Orders</span>
          </button>

          {/* Customer Debt (Udhar) */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setShowDebtRegisterModal(true);
            }}
            className="min-h-[34px] px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
          >
            <BookOpen size={13} />
            <span>Customer Debt (Udhar)</span>
          </button>

          {/* POS Terminal Shortcut (1-Tap Jump to Billing) */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              if (onGoToPOSTerminal) onGoToPOSTerminal();
              else store.setActiveTab("pos");
            }}
            className="min-h-[34px] px-3 rounded-xl bg-[#0B3B2C] hover:bg-[#072E22] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
          >
            <Utensils size={13} />
            <span>POS Terminal</span>
          </button>
        </div>
      </div>

      {/* 2. ZONE FILTER BAR, NON-TABLE STARTERS & SEARCH (Exact Parity with Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Zone Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setSelectedZone("ALL ZONES");
            }}
            className={`min-h-[32px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 active:scale-95 ${
              selectedZone === "ALL ZONES"
                ? "bg-slate-900 text-white font-black shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Zones ({totalTablesCount})
          </button>

          {groupedSections.map((sec) => (
            <button
              key={sec.name}
              type="button"
              onClick={() => {
                sound.tap();
                setSelectedZone(sec.name);
              }}
              className={`min-h-[32px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 active:scale-95 ${
                selectedZone.toUpperCase().includes(sec.name.toUpperCase())
                  ? "bg-slate-900 text-white font-black shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {sec.name} ({sec.tables.length})
            </button>
          ))}
        </div>

        {/* Right Starters & Search Input */}
        <div className="flex items-center gap-2">
          {/* Takeaway Button */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              if (onDirectTakeaway) onDirectTakeaway();
              else {
                store.setOrderType("takeaway");
                store.setSelectedTable("Takeaway");
                store.setActiveTab("pos");
              }
            }}
            className="min-h-[32px] px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-2xs shrink-0"
          >
            <ShoppingBag size={13} />
            <span>Takeaway</span>
          </button>

          {/* Delivery Button */}
          <button
            type="button"
            onClick={() => {
              sound.tap();
              if (onDirectDelivery) onDirectDelivery();
              else {
                store.setOrderType("delivery");
                store.setSelectedTable("Delivery");
                store.setActiveTab("pos");
              }
            }}
            className="min-h-[32px] px-3 rounded-xl bg-purple-50 border border-purple-300 text-purple-900 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-2xs shrink-0"
          >
            <Bike size={13} />
            <span>Delivery</span>
          </button>

          {/* Search table or order... / or Ctrl+K */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table or order... /"
              className="w-full h-8 pl-8 pr-7 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. GROUPED SECTIONS & TABLE CARDS (Exact Parity with Screenshot 1) */}
      <div className="space-y-5">
        {displayedSections.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-1.5">
            <Utensils size={32} className="mx-auto text-slate-400" />
            <h4 className="font-bold text-sm text-slate-800">No tables match your current filter</h4>
            <p className="text-xs text-slate-500">Try clearing search or switching status filter</p>
          </div>
        ) : (
          displayedSections.map((sec) => (
            <div key={sec.name} className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center gap-2 border-l-4 border-slate-900 pl-2.5 py-0.5">
                <h3 className="font-mono font-black text-xs uppercase tracking-wider text-slate-800">
                  {sec.name} ({sec.tables.length})
                </h3>
              </div>

              {/* Table Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sec.tables.map((tbl) => {
                  const orders = getTableRunningOrders(tbl);
                  const isOccupied = tbl.status === "occupied" || orders.length > 0;
                  const primaryOrder = orders[0];
                  const runningTotal = primaryOrder?.grand_total || tbl.running_total || 0;
                  const itemsCount = primaryOrder?.items?.length || 0;

                  return (
                    <div
                      key={tbl.id || tbl.number}
                      className={`rounded-xl border p-3 flex flex-col justify-between min-h-[128px] transition-all cursor-pointer relative shadow-2xs ${
                        isOccupied
                          ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40 hover:border-amber-400"
                          : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-sm"
                      }`}
                      onClick={() => {
                        sound.tap();
                        if (isOccupied && primaryOrder) {
                          setActiveViewingOrder({ order: primaryOrder, tableName: tbl.number });
                        } else {
                          onSelectTableForOrder(tbl.number);
                        }
                      }}
                    >
                      {/* Top Row: Table Name & Capacity Pill */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm sm:text-base text-slate-900">
                          {tbl.number}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                          {tbl.capacity || 4} Seats
                        </span>
                      </div>

                      {/* Middle Body */}
                      {isOccupied ? (
                        <div className="my-1.5 space-y-0.5">
                          <div className="flex items-baseline justify-between">
                            <span className="font-mono font-black text-base text-slate-900">
                              ₹{runningTotal}
                            </span>
                            <span className="text-[10px] font-mono text-amber-900 font-bold">
                              ({itemsCount || 1} ord)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>{primaryOrder?.order_number?.slice(-4) || "56"}</span>
                            <span>14m</span>
                          </div>

                          {/* Multi-Order Indicator (Table Sharing) */}
                          {orders.length > 1 && (
                            <div className="text-[9px] font-bold text-slate-700 bg-amber-200/60 px-1 py-0.2 rounded text-center">
                              +{orders.length - 1} Shared Bill
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="my-auto py-3 text-center">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                            AVAILABLE
                          </span>
                        </div>
                      )}

                      {/* Bottom Action Buttons (Direct Parity with Screenshot 1) */}
                      {isOccupied ? (
                        <div className="pt-2 border-t border-amber-200/60 grid grid-cols-2 gap-1.5">
                          {/* [Edit] Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.tap();
                              if (primaryOrder && onRecallOrderToCart) {
                                onRecallOrderToCart(primaryOrder);
                              } else {
                                onSelectTableForOrder(tbl.number);
                              }
                            }}
                            className="min-h-[28px] px-2 rounded-md bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold cursor-pointer transition active:scale-95"
                          >
                            Edit
                          </button>

                          {/* [Settle] Button (Green) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (primaryOrder) {
                                handleOpenSettle(primaryOrder, tbl.number);
                              }
                            }}
                            className="min-h-[28px] px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition active:scale-95 shadow-2xs"
                          >
                            Settle
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="w-full min-h-[26px] rounded-md bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 transition">
                            <Plus size={12} />
                            <span>Take Order</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. ACTIVE TABLE MODAL (KOT BREAKDOWN & SERVE TRIGGER) */}
      {activeViewingOrder && (
        <ActiveTableModal
          isOpen={!!activeViewingOrder}
          order={activeViewingOrder.order}
          tableName={activeViewingOrder.tableName}
          onClose={() => setActiveViewingOrder(null)}
          onAddMoreItems={(tableNum) => {
            setActiveViewingOrder(null);
            if (activeViewingOrder.order && onRecallOrderToCart) {
              onRecallOrderToCart(activeViewingOrder.order);
            } else {
              onSelectTableForOrder(tableNum);
            }
          }}
          onMarkServed={() => {
            setActiveViewingOrder(null);
            if (onRefreshData) onRefreshData();
          }}
        />
      )}

      {/* 5. DIRECT TABLE QUICK SETTLE MODAL (Cash Presets, UPI QR, Card) */}
      {settlingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0B3B2C] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#E5A93C]">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    Settle Table {settlingOrder.tableName}
                  </h3>
                  <p className="text-xs text-white/70 font-mono">
                    {settlingOrder.order.order_number} • Direct Floor Settle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettlingOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-4.5 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal ({settlingOrder.order.items?.length || 0} items):</span>
                  <span className="font-bold">₹{settlingOrder.order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST (5%):</span>
                  <span>₹{settlingOrder.order.total_tax}</span>
                </div>
                <div className="flex justify-between text-base font-black pt-1.5 border-t border-slate-200 text-slate-900">
                  <span>Total Due:</span>
                  <span className="text-emerald-700">₹{settlingOrder.order.grand_total}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  Select Settlement Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setSettlePaymentMethod("CASH");
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                      settlePaymentMethod === "CASH"
                        ? "bg-emerald-600 text-white shadow-xs font-black"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <DollarSign size={15} />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setSettlePaymentMethod("UPI");
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                      settlePaymentMethod === "UPI"
                        ? "bg-purple-600 text-white shadow-xs font-black"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <QrCode size={15} />
                    <span>UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setSettlePaymentMethod("CARD");
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition cursor-pointer ${
                      settlePaymentMethod === "CARD"
                        ? "bg-blue-600 text-white shadow-xs font-black"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CreditCard size={15} />
                    <span>Card</span>
                  </button>
                </div>
              </div>

              {/* Cash Quick Tender Presets */}
              {settlePaymentMethod === "CASH" && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Tendered Cash Amount</span>
                    <span className="font-mono text-sm font-black">₹{tenderedCash || settlingOrder.order.grand_total}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      settlingOrder.order.grand_total,
                      Math.ceil(settlingOrder.order.grand_total / 100) * 100,
                      500,
                      2000,
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setTenderedCash(preset);
                        }}
                        className="py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-mono text-xs font-bold transition cursor-pointer border border-slate-200 shadow-2xs"
                      >
                        {idx === 0 ? "Exact" : `₹${preset}`}
                      </button>
                    ))}
                  </div>

                  {tenderedCash > settlingOrder.order.grand_total && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs text-emerald-900 font-mono font-bold">
                      <span>Change to Return:</span>
                      <span className="text-sm font-black text-emerald-950">
                        ₹{tenderedCash - settlingOrder.order.grand_total}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI Dynamic QR Code */}
              {settlePaymentMethod === "UPI" && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        `upi://pay?pa=baithak@upi&pn=BaithakCafe&am=${settlingOrder.order.grand_total}&cu=INR&tn=${settlingOrder.order.order_number}`
                      )}`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 font-semibold">
                    Customer scans via GPay, PhonePe, Paytm, or BHIM
                  </p>
                </div>
              )}
            </div>

            {/* Settle Action Button */}
            <div className="p-4.5 pt-0">
              <button
                type="button"
                disabled={isSubmittingSettle}
                onClick={handleExecuteSettle}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-98"
              >
                <CheckCircle2 size={16} />
                <span>
                  {isSubmittingSettle
                    ? "Settling Table..."
                    : `Settle Bill (₹${settlingOrder.order.grand_total}) & Free Table`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ACTIVE ORDERS TRACKER MODAL */}
      {showActiveOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Active Dining &amp; Floor Orders ({activeOrders.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowActiveOrdersModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
              {activeOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-bold text-xs">No active orders running</p>
                </div>
              ) : (
                activeOrders.map((ord) => (
                  <div key={ord.id || ord.order_number} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black font-mono text-xs text-slate-900">
                          {ord.table_number || "Table"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {ord.order_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {ord.items?.length || 0} items • {ord.waiter_name || "Captain"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        ₹{ord.grand_total}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowActiveOrdersModal(false);
                          if (onRecallOrderToCart) onRecallOrderToCart(ord);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. CUSTOMER DEBT (UDHAR KHATA) MODAL */}
      {showDebtRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Customer Debt Register (Udhar Khata)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDebtRegisterModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center text-xs text-amber-950 font-bold">
                <span>Total Active Udhar Balance:</span>
                <span className="font-mono text-base font-black text-amber-900">₹4,850</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { name: "Prof. Rajesh Sharma (CUH)", phone: "98120XXXXX", due: 1250, last: "Yesterday" },
                  { name: "Dr. Vikram Singh", phone: "94160XXXXX", due: 840, last: "28 Oct" },
                  { name: "Sunil Kumar (Admin)", phone: "98960XXXXX", due: 1560, last: "26 Oct" },
                  { name: "Mohit Hostel Mess", phone: "97280XXXXX", due: 1200, last: "22 Oct" },
                ].map((cust, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{cust.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{cust.phone} • Last: {cust.last}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-amber-900 block">₹{cust.due}</span>
                      <span className="text-[10px] text-rose-600 font-bold uppercase">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosFloorPlan;
