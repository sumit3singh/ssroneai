import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChefHat,
  Clock,
  Check,
  Play,
  Moon,
  Sun,
  MonitorPlay,
  Volume2,
  VolumeX,
  History,
  RefreshCw,
  AlertCircle,
  Utensils,
  Package,
  BarChart3,
  Flame,
  LogOut
} from "lucide-react";
import KDSTicketCard, { KDSTicket } from "@/components/KDSTicketCard";
import KDSHistoryModal from "@/components/KDSHistoryModal";
import KDSExpoView from "@/components/KDSExpoView";
import KDSPackingView from "@/components/KDSPackingView";
import KDSMonitorView from "@/components/KDSMonitorView";
import KDSAggregatedView from "@/components/KDSAggregatedView";
import KDSRecipeModal from "@/components/KDSRecipeModal";
import { KDSLoginModal } from "@/components/KDSLoginModal";
import { getAuth, logout } from "@ssrone/auth";
import { kdsAudio } from "@/utils/kdsAudio";
import { api } from "@ssrone/api-client";

export function App() {
  const [displayMode, setDisplayMode] = useState<"production" | "aggregated" | "expo" | "packing" | "monitor">("production");
  const [activeStation, setActiveStation] = useState<string>("all");
  const [dbStations, setDbStations] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(() => !getAuth()?.isLoggedIn);

  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [orders, setOrders] = useState<KDSTicket[]>([]);
  const [historyOrders, setHistoryOrders] = useState<KDSTicket[]>([]);

  const previousCountRef = useRef<number>(0);

  // Derive active branch dynamically from authenticated staff user
  const auth = getAuth();
  const activeBranchId = auth?.user?.branch_id
    ? Number(auth.user.branch_id)
    : Number(localStorage.getItem("active_branch_id") || 2);
  const activeBranchName = auth?.user?.branch_name || `Branch #${activeBranchId}`;

  const handleLogout = () => {
    logout();
    setShowLoginModal(true);
  };

  // Fetch PostgreSQL active kitchen stations directly from REST API
  const loadKitchenStations = async () => {
    try {
      const res = await api.get<any>(`/restaurant/kitchen-stations?branch_id=${activeBranchId}`).catch(() => []);
      const stationList = Array.isArray(res) ? res : (res?.data || []);
      setDbStations(stationList);
    } catch (err) {
      console.warn("Failed to load PostgreSQL kitchen stations for KDS", err);
    }
  };

  // Fetch PostgreSQL live kitchen orders directly from REST API
  const loadOrders = async () => {
    setIsRefreshing(true);
    let loaded: KDSTicket[] = [];

    try {
      // Primary Endpoint: Dedicated KDS Live Orders API
      let res = await api.get<any>(`/orders/kds/live?branch_id=${activeBranchId}`).catch(async () => {
        return await api.get<any>(`/orders?branch_id=${activeBranchId}&page_size=100`).catch(() => null);
      });

      let orderList: any[] = [];
      if (Array.isArray(res)) {
        orderList = res;
      } else if (res?.items && Array.isArray(res.items)) {
        orderList = res.items;
      }

      // Secondary Fallback: If no orders returned for branch_id, query tenant-wide active orders
      if (orderList.length === 0) {
        res = await api.get<any>(`/orders/kds/live`).catch(async () => {
          return await api.get<any>(`/orders?sort_order=asc&page_size=100`).catch(() => null);
        });
        if (Array.isArray(res)) {
          orderList = res;
        } else if (res?.items && Array.isArray(res.items)) {
          orderList = res.items;
        }
      }

      if (orderList.length > 0) {
        loaded = orderList.map((o: any) => ({
          id: String(o.id || o.order_number),
          order_number: o.order_number || `ORD-${o.id}`,
          table_number: o.table_number || o.table_name || (o.table_id ? `T${o.table_id}` : "Takeaway"),
          order_source: o.order_source || o.source_channel || "POS Billing",
          order_type: o.order_type || "dine_in",
          status: (o.status || "").toLowerCase() === "completed" || (o.status || "").toLowerCase() === "served" ? "completed" : ((o.status || "").toLowerCase() === "preparing" || (o.status || "").toLowerCase() === "in_kitchen" ? "preparing" : "pending"),
          created_at: o.created_at || new Date().toISOString(),
          station: o.kds_station || o.station || "Main Prep",
          is_alerted: Boolean(o.is_alerted || (o.notes || "").includes("[SUPERVISOR ALERT]")),
          items: (o.items || []).map((it: any) => ({
            id: it.id,
            name: it.product_name || it.item_name || it.name || "Dish Item",
            quantity: Number(it.quantity || 1),
            variant: it.variant_name || (it.selected_variant ? it.selected_variant.name : undefined),
            addons: Array.isArray(it.selected_addons) ? it.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [],
            kitchen_note: it.preparation_notes || it.kitchen_note || o.notes || "",
            kds_status: it.kds_status || "pending",
            kds_station: it.kds_station || o.kds_station || "",
          })),
        }));

        if (loaded.some((t) => t.is_alerted)) {
          kdsAudio.playAlertChime();
        }
      }
    } catch (err) {
      console.warn("Failed to load PostgreSQL orders for KDS", err);
    } finally {
      setIsRefreshing(false);
    }

    // Deduplicate loaded orders by order_number or id
    const uniqueMap = new Map<string, KDSTicket>();
    loaded.forEach((ticket) => {
      const key = ticket.order_number || ticket.id;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, ticket);
      }
    });
    const uniqueOrders = Array.from(uniqueMap.values());

    const active = uniqueOrders.filter((t) => t.status !== "completed" && t.status !== "ready");
    const completed = uniqueOrders.filter((t) => t.status === "completed" || t.status === "ready");

    if (previousCountRef.current > 0 && active.length > previousCountRef.current) {
      kdsAudio.playNewOrderChime();
    }
    previousCountRef.current = active.length;

    setOrders(active);
    if (completed.length > 0) {
      setHistoryOrders(completed);
    }
  };

  useEffect(() => {
    loadKitchenStations();
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    window.addEventListener("storage", loadOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadOrders);
    };
  }, [activeBranchId]);

  // Keyboard Shortcuts Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (orders.length > 0) {
          const first = orders[0];
          handleUpdateStatus(first.id || first.order_number, first.status);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [orders]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    kdsAudio.setMuted(next);
  };

  // Station Filter matched dynamically against PostgreSQL kitchen stations
  const filteredTickets = useMemo(() => {
    if (activeStation === "all") return orders;
    const targetLower = activeStation.toLowerCase();

    return orders
      .map((t) => {
        const matchingItems = (t.items || []).filter((i: any) => {
          const itemStation = (i.kds_station || i.station || t.station || "").toLowerCase();
          const itemName = (i.name || "").toLowerCase();

          if (itemStation) {
            return itemStation.includes(targetLower) || targetLower.includes(itemStation);
          }
          if (targetLower.includes("italian") || targetLower.includes("pizza")) {
            return itemName.includes("pizza") || itemName.includes("pasta") || itemName.includes("bread") || itemName.includes("italian");
          }
          if (targetLower.includes("drink") || targetLower.includes("beverage") || targetLower.includes("bar")) {
            return itemName.includes("chai") || itemName.includes("coffee") || itemName.includes("tea") || itemName.includes("drink") || itemName.includes("shake") || itemName.includes("beverage") || itemName.includes("coke") || itemName.includes("pepsi");
          }
          if (targetLower.includes("main") || targetLower.includes("kitchen")) {
            return !itemName.includes("pizza") && !itemName.includes("chai") && !itemName.includes("coffee") && !itemName.includes("tea");
          }
          return false;
        });

        if (matchingItems.length === 0) return null;
        return {
          ...t,
          items: matchingItems
        };
      })
      .filter((t): t is KDSTicket => t !== null);
  }, [orders, activeStation]);

  // Status Update & Bump Ticket
  const handleUpdateStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "preparing" : "completed";
    kdsAudio.playBumpChime();

    try {
      const numId = parseInt(ticketId.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await api.patch(`/orders/kds/item-status`, { order_id: numId, status: nextStatus }).catch(() => {
          return api.patch(`/orders/${numId}/status?status=${nextStatus}`).catch(() => null);
        });
      }
    } catch (err) {
      console.warn("Status update warning:", err);
    }

    if (nextStatus === "completed") {
      const bumpedTicket = orders.find((o) => o.id === ticketId);
      if (bumpedTicket) {
        setHistoryOrders((prev) => [{ ...bumpedTicket, status: "completed" }, ...prev]);
      }
      setOrders((prev) => prev.filter((o) => o.id !== ticketId));

      try {
        const saved = localStorage.getItem("ssrone_orders");
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = parsed.map((o: any) =>
            o.id === ticketId || o.order_number === ticketId ? { ...o, status: "completed" } : o
          );
          localStorage.setItem("ssrone_orders", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {
        // Ignore
      }
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === ticketId ? { ...o, status: "preparing" } : o))
      );
    }
  };

  const handleRecallTicket = async (ticketId: string) => {
    const recalled = historyOrders.find((h) => h.id === ticketId || h.order_number === ticketId);
    if (recalled) {
      try {
        const numId = parseInt(ticketId.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          await api.patch(`/orders/${numId}/status?status=preparing`).catch(() => null);
        }
      } catch (err) {
        console.warn("Recall warning:", err);
      }

      setHistoryOrders((prev) => prev.filter((h) => h.id !== ticketId && h.order_number !== ticketId));
      setOrders((prev) => [{ ...recalled, status: "preparing" }, ...prev]);
      kdsAudio.playNewOrderChime();
    }
  };

  const preparingCount = orders.filter((t) => t.status === "preparing").length;
  const overdueCount = orders.filter((t) => {
    if (!t.created_at) return false;
    const diff = Math.floor((Date.now() - new Date(t.created_at).getTime()) / 60000);
    return diff >= 10;
  }).length;

  return (
    <div className={`min-h-screen pb-16 font-sans transition-colors duration-200 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#FAF9F5] text-slate-900"}`}>
      {/* History Modal */}
      {showHistory && (
        <KDSHistoryModal
          completedTickets={historyOrders}
          onClose={() => setShowHistory(false)}
          onRecallTicket={handleRecallTicket}
        />
      )}

      {/* Recipe Instructions Modal */}
      {selectedRecipeItem && (
        <KDSRecipeModal
          itemName={selectedRecipeItem}
          onClose={() => setSelectedRecipeItem(null)}
        />
      )}

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Title & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#103B2B] flex items-center justify-center text-white shadow-xs shrink-0">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              SSR ONE AI
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                KOS OPERATING SYSTEM
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Multi-Stage QSR Kitchen Operations System</p>
          </div>
        </div>

        {/* 5 Operational View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setDisplayMode("production")}
            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              displayMode === "production" ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ChefHat size={14} /> Cook KDS
          </button>

          <button
            onClick={() => setDisplayMode("aggregated")}
            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              displayMode === "aggregated" ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame size={14} /> Batch Prep
          </button>

          <button
            onClick={() => setDisplayMode("expo")}
            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              displayMode === "expo" ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Utensils size={14} /> EXPO Pass
          </button>

          <button
            onClick={() => setDisplayMode("packing")}
            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              displayMode === "packing" ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Package size={14} /> Packing
          </button>

          <button
            onClick={() => setDisplayMode("monitor")}
            className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              displayMode === "monitor" ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={14} /> SLA Manager
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            disabled={isRefreshing}
            className="min-h-[36px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="Refresh Orders"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
          </button>

          <button
            onClick={toggleMute}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isMuted
                ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900"
            }`}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isMuted ? "Muted" : "Chime On"}</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <History size={15} />
            <span>History ({historyOrders.length})</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-extrabold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Branch #{activeBranchId} ({activeBranchName})</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="min-h-[36px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-2xs"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={handleLogout}
            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Logout Chef"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
        {/* MODE 1: PRODUCTION KITCHEN SCREEN (COOK KDS) */}
        {displayMode === "production" && (
          <div className="space-y-4">
            {/* Dynamic Station Filter Buttons from PostgreSQL */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-xl w-fit shadow-2xs overflow-x-auto max-w-full">
              {[{ id: "all", name: "ALL STATIONS" }, ...dbStations].map((st: any) => {
                const stId = String(st.name || st.id || "all");
                const stLabel = String(st.name || st.id || "ALL STATIONS").toUpperCase();
                return (
                  <button
                    key={stId}
                    onClick={() => setActiveStation(stId)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                      activeStation === stId ? "bg-[#103B2B] text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {stLabel}
                  </button>
                );
              })}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-20 space-y-3 max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
                <MonitorPlay size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  No Active Kitchen Tickets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Orders from Waiter Pads, POS Billing, or Customer QR stream here live from PostgreSQL DB.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTickets.map((ticket) => (
                  <KDSTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onUpdateStatus={handleUpdateStatus}
                    onSelectRecipeItem={(name) => setSelectedRecipeItem(name)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: BATCH PREP AGGREGATED VIEW */}
        {displayMode === "aggregated" && (
          <KDSAggregatedView
            orders={orders}
            onCompleteItemBatch={(name) => console.log("Completed batch prep for:", name)}
          />
        )}

        {/* MODE 3: EXPO PASS SCREEN */}
        {displayMode === "expo" && (
          <KDSExpoView
            tickets={orders}
            onHandover={(id) => handleUpdateStatus(id, "preparing")}
            onRecall={handleRecallTicket}
          />
        )}

        {/* MODE 4: PACKING STATION SCREEN */}
        {displayMode === "packing" && (
          <KDSPackingView
            tickets={orders.filter((t) => t.order_source === "customer_web" || t.order_source === "delivery" || t.order_type === "takeaway")}
            onMarkPacked={(id) => handleUpdateStatus(id, "preparing")}
          />
        )}

        {/* MODE 5: MONITOR DASHBOARD (COMMAND CENTER) */}
        {displayMode === "monitor" && (
          <KDSMonitorView
            tickets={orders}
            completedCount={historyOrders.length}
          />
        )}
      </main>

      {/* Sticky Bottom KPI Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-6 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex justify-between items-center text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-2xs z-30">
        <div className="flex items-center gap-5">
          <span>Active Tickets: <strong className="text-slate-900 dark:text-white font-extrabold">{orders.length}</strong></span>
          <span>In Prep: <strong className="text-emerald-800 dark:text-emerald-400 font-extrabold">{preparingCount}</strong></span>
          {overdueCount > 0 && (
            <span className="text-rose-700 dark:text-rose-400 font-black animate-pulse flex items-center gap-1.5">
              <AlertCircle size={14} /> Overdue (&gt;10m): {overdueCount}
            </span>
          )}
        </div>

        <div className="bg-[#103B2B] text-white px-3 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          <span>PostgreSQL DB Live KOS Pipeline Active</span>
        </div>
      </footer>

      <KDSLoginModal
        isOpen={showLoginModal}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default App;
