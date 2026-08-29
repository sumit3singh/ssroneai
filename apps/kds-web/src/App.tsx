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
  Truck,
  BarChart3,
  SlidersHorizontal
} from "lucide-react";
import KDSTicketCard, { KDSTicket } from "@/components/KDSTicketCard";
import KDSHistoryModal from "@/components/KDSHistoryModal";
import KDSExpoView from "@/components/KDSExpoView";
import KDSPackingView from "@/components/KDSPackingView";
import KDSMonitorView from "@/components/KDSMonitorView";
import { kdsAudio } from "@/utils/kdsAudio";
import { api } from "@ssrone/api-client";

export function App() {
  const [displayMode, setDisplayMode] = useState<"production" | "expo" | "packing" | "dispatch" | "monitor">("production");
  const [activeUnit, setActiveUnit] = useState<"CUH02" | "GGN01">("CUH02");
  const [activeStation, setActiveStation] = useState<string>("all");

  const [isDark, setIsDark] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [orders, setOrders] = useState<KDSTicket[]>([]);
  const [historyOrders, setHistoryOrders] = useState<KDSTicket[]>([]);

  const previousCountRef = useRef<number>(0);

  // Fetch PostgreSQL orders directly from REST API
  const loadOrders = async () => {
    setIsRefreshing(true);
    let loaded: KDSTicket[] = [];

    try {
      const branchId = activeUnit === "CUH02" ? 1 : 2;
      const res = await api.get<any>(`/orders?branch_id=${branchId}`).catch(() => null);

      let orderList: any[] = [];
      if (Array.isArray(res)) {
        orderList = res;
      } else if (res?.items && Array.isArray(res.items)) {
        orderList = res.items;
      }

      if (orderList.length > 0) {
        loaded = orderList.map((o: any) => ({
          id: String(o.id || o.order_number),
          order_number: o.order_number || `ORD-${o.id}`,
          table_number: o.table_name || o.table_number || (o.notes ? o.notes.split(" ")[1] : "T1"),
          order_source: o.source_channel === "customer_web" ? "customer_web" : (o.source_channel === "staff_portal" ? "waiter_pad" : "pos_counter"),
          status: (o.status || "").toLowerCase() === "completed" || (o.status || "").toLowerCase() === "served" ? "completed" : ((o.status || "").toLowerCase() === "preparing" ? "preparing" : "pending"),
          created_at: o.created_at || new Date().toISOString(),
          station: "Main Prep",
          items: (o.items || []).map((it: any) => ({
            name: it.product_name || it.item_name || it.name || "Dish Item",
            quantity: Number(it.quantity || 1),
            variant: it.variant_name || (it.selected_variant ? it.selected_variant.name : undefined),
            addons: Array.isArray(it.selected_addons) ? it.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [],
            kitchen_note: it.preparation_notes || it.kitchen_note,
          })),
        }));
      } else {
        // Fallback local storage sync if DB is empty
        const saved = localStorage.getItem("ssrone_orders");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            loaded = parsed.map((o: any) => ({
              id: String(o.id || o.order_number),
              order_number: o.order_number || `ORD-${o.id}`,
              table_number: o.table_number || "T1",
              order_source: o.order_source || "waiter_pad",
              status: (o.status || "").toLowerCase() === "completed" ? "completed" : ((o.status || "").toLowerCase() === "preparing" ? "preparing" : "pending"),
              created_at: o.created_at || new Date().toISOString(),
              station: "Main Prep",
              items: (o.items || []).map((it: any) => ({
                name: it.product_name || it.item_name || it.name,
                quantity: Number(it.quantity || 1),
                variant: it.selected_variant,
                addons: it.selected_addons,
                kitchen_note: it.kitchen_note,
              })),
            }));
          }
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
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    window.addEventListener("storage", loadOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", loadOrders);
    };
  }, [activeUnit]);

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

  // Station Filter
  const filteredTickets = useMemo(() => {
    return orders.filter((t) => {
      if (activeStation === "all") return true;
      if (activeStation === "pizza") {
        return t.items.some((i) => i.name.toLowerCase().includes("pizza") || i.name.toLowerCase().includes("bread"));
      }
      if (activeStation === "beverages") {
        return t.items.some((i) => i.name.toLowerCase().includes("chai") || i.name.toLowerCase().includes("coffee") || i.name.toLowerCase().includes("tea"));
      }
      if (activeStation === "mains") {
        return t.items.some((i) => i.name.toLowerCase().includes("burger") || i.name.toLowerCase().includes("fries") || i.name.toLowerCase().includes("thali"));
      }
      return true;
    });
  }, [orders, activeStation]);

  // Status Update & Bump Ticket
  const handleUpdateStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pending" ? "preparing" : "completed";
    kdsAudio.playBumpChime();

    try {
      const numId = parseInt(ticketId.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await api.patch(`/orders/${numId}/status?status=${nextStatus}`).catch(() => null);
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
    <div className={`min-h-screen pb-14 transition-colors duration-200 font-sans ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      {/* History Modal */}
      {showHistory && (
        <KDSHistoryModal
          completedTickets={historyOrders}
          onClose={() => setShowHistory(false)}
          onRecallTicket={handleRecallTicket}
        />
      )}

      {/* Top Header */}
      <header className={`sticky top-0 z-40 px-5 py-3 border-b ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300"} shadow-xs flex flex-wrap items-center justify-between gap-3`}>
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <ChefHat size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              SSR ONE AI
              <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold lowercase">kds</span>
            </h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Enterprise Kitchen Operating System</p>
          </div>
        </div>

        {/* 5 Display Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setDisplayMode("production")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
              displayMode === "production" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ChefHat size={13} /> Production
          </button>
          <button
            onClick={() => setDisplayMode("expo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
              displayMode === "expo" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Utensils size={13} /> EXPO Pass
          </button>
          <button
            onClick={() => setDisplayMode("packing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
              displayMode === "packing" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Package size={13} /> Packing
          </button>
          <button
            onClick={() => setDisplayMode("monitor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
              displayMode === "monitor" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={13} /> Monitor
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
          </button>

          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
              isMuted
                ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? "Muted" : "Chime On"}</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <History size={14} />
            <span>History ({historyOrders.length})</span>
          </button>

          <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveUnit("CUH02")}
              className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                activeUnit === "CUH02" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs" : "text-slate-500"
              }`}
            >
              CUH
            </button>
            <button
              onClick={() => setActiveUnit("GGN01")}
              className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                activeUnit === "GGN01" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs" : "text-slate-500"
              }`}
            >
              GGN
            </button>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Main Mode Content */}
      <main className="p-4 sm:p-5 max-w-7xl mx-auto space-y-4">
        {/* MODE 1: PRODUCTION KITCHEN SCREEN */}
        {displayMode === "production" && (
          <div className="space-y-4">
            {/* Station Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {[
                { id: "all", label: "ALL STATIONS" },
                { id: "pizza", label: "PIZZA & GRILL" },
                { id: "beverages", label: "BAR & BEVERAGES" },
                { id: "mains", label: "MAIN COURSES" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setActiveStation(st.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    activeStation === st.id ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-24 space-y-3 max-w-sm mx-auto">
                <MonitorPlay size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
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
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: EXPO PASS SCREEN */}
        {displayMode === "expo" && (
          <KDSExpoView
            tickets={orders}
            onHandover={(id) => handleUpdateStatus(id, "preparing")}
            onRecall={handleRecallTicket}
          />
        )}

        {/* MODE 3: PACKING STATION SCREEN */}
        {displayMode === "packing" && (
          <KDSPackingView
            tickets={orders.filter((t) => t.order_source === "customer_web" || t.order_source === "delivery")}
            onMarkPacked={(id) => handleUpdateStatus(id, "preparing")}
          />
        )}

        {/* MODE 5: MONITOR DASHBOARD */}
        {displayMode === "monitor" && (
          <KDSMonitorView
            tickets={orders}
            completedCount={historyOrders.length}
          />
        )}
      </main>

      {/* Footer KPI Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-5 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 flex justify-between items-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
        <div className="flex gap-4">
          <span>Active Tickets: <strong className="text-blue-600 dark:text-blue-400">{orders.length}</strong></span>
          <span>In Prep: <strong className="text-blue-600 dark:text-blue-400">{preparingCount}</strong></span>
          {overdueCount > 0 && (
            <span className="text-red-600 dark:text-red-400 font-black animate-pulse flex items-center gap-1">
              <AlertCircle size={13} /> Overdue (&gt;10m): {overdueCount}
            </span>
          )}
        </div>

        <div className="text-2xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-black">
          PostgreSQL DB Live SSOT Sync Active
        </div>
      </footer>
    </div>
  );
}

export default App;
