import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChefHat,
  Clock,
  Check,
  RefreshCw,
  Flame,
  User,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Filter
} from "lucide-react";
import { Button, PageHeader } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { POSOrder } from "../../../types";

interface KitchenStationItem {
  id: number | string;
  name: string;
  code: string;
  printer_name?: string;
  station_type?: string;
  is_active?: boolean;
}

interface KitchenDisplayPageProps {
  orders?: POSOrder[];
  onRefresh?: () => void;
}

// Web Audio API KOT Chime Synthesizer
const playKitchenChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio Context fallback
  }
};

export const KitchenDisplayPage: React.FC<KitchenDisplayPageProps> = ({
  orders: propOrders = [],
  onRefresh
}) => {
  const [stationFilter, setStationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "PREPARING" | "READY" | "HISTORY">("ACTIVE");
  const [dbStations, setDbStations] = useState<KitchenStationItem[]>([]);
  const [fetchedOrders, setFetchedOrders] = useState<POSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bumpingId, setBumpingId] = useState<number | string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previousOrderCountRef = useRef<number>(0);

  // Fetch dynamic kitchen stations from PostgreSQL DB
  const loadKitchenStations = async () => {
    try {
      const res = await api.get<KitchenStationItem[]>("/restaurant/kitchen-stations");
      if (Array.isArray(res)) {
        setDbStations(res.filter((s) => s.is_active !== false));
      }
    } catch (err) {
      console.error("Failed to fetch kitchen stations:", err);
    }
  };

  // Fetch live KOT orders in FIFO creation order
  const loadKDSOrders = async () => {
    setIsLoading(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const url = activeBranchId
        ? `/orders?branch_id=${activeBranchId}&sort_order=asc&page_size=100`
        : "/orders?sort_order=asc&page_size=100";
      const res = await api.get<any>(url);
      const list = Array.isArray(res) ? res : res?.items || [];

      if (!isMuted && list.length > previousOrderCountRef.current && previousOrderCountRef.current > 0) {
        playKitchenChime();
        toast("New KOT Order Received", { description: "Kitchen ticket queue updated." });
      }
      previousOrderCountRef.current = list.length;
      setFetchedOrders(list);
    } catch (err) {
      console.error("Failed to load KDS orders from server", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKitchenStations();
    loadKDSOrders();
    const interval = setInterval(loadKDSOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  // Deduplicate orders
  const allOrdersMap = new Map<string, POSOrder>();
  [...fetchedOrders, ...propOrders].forEach((o) => {
    if (o && (o.id || o.order_number)) {
      const key = String(o.order_number || o.id);
      if (!allOrdersMap.has(key)) {
        allOrdersMap.set(key, o);
      }
    }
  });

  // Strict FIFO queue sorting by creation timestamp
  const allOrders = Array.from(allOrdersMap.values()).sort((a, b) => {
    const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tA - tB;
  });

  // Filter orders and split line items per station
  const filteredOrders = useMemo(() => {
    return allOrders
      .map((o) => {
        const st = (o.status || "").toLowerCase();
        const isCompleted = st === "completed" || st === "served" || st === "paid" || st === "cancelled";

        if (statusFilter === "ACTIVE" && isCompleted) return null;
        if (statusFilter === "PREPARING" && st !== "in_kitchen" && st !== "preparing") return null;
        if (statusFilter === "READY" && st !== "ready") return null;
        if (statusFilter === "HISTORY" && !isCompleted) return null;

        if (stationFilter !== "ALL") {
          const targetStationLower = stationFilter.toLowerCase();
          const matchingItems = (o.items || []).filter((it: any) => {
            const itemStation = (it.kds_station || it.kdsStation || "").toLowerCase();
            return !itemStation || itemStation.includes(targetStationLower) || targetStationLower.includes(itemStation);
          });

          if (matchingItems.length === 0) return null;

          return {
            ...o,
            items: matchingItems
          };
        }

        return o;
      })
      .filter((o): o is POSOrder => o !== null);
  }, [allOrders, statusFilter, stationFilter]);

  // Keyboard bump shortcut (Space or 1 key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" || e.key === "1") {
        e.preventDefault();
        if (filteredOrders.length > 0) {
          const topOrder = filteredOrders[0];
          const st = (topOrder.status || "").toLowerCase();
          if (st === "ready") {
            handleCompleteOrder(topOrder.id, topOrder.order_number);
          } else if (st === "in_kitchen" || st === "preparing") {
            handleBumpOrder(topOrder.id, topOrder.order_number);
          } else {
            handleStartPrep(topOrder.id, topOrder.order_number);
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredOrders]);

  const handleStartPrep = async (orderId: number | string, orderNum: string) => {
    setBumpingId(orderId);
    try {
      const numId = parseInt(String(orderId).replace(/\D/g, ""), 10);
      await api.patch(`/orders/${numId || orderId}/status?status=in_kitchen`);
      toast.info(`Ticket #${orderNum} marked In Kitchen`);
      await loadKDSOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update status");
    } finally {
      setBumpingId(null);
    }
  };

  const handleBumpOrder = async (orderId: number | string, orderNum: string) => {
    setBumpingId(orderId);
    try {
      const numId = parseInt(String(orderId).replace(/\D/g, ""), 10);
      await api.patch(`/orders/${numId || orderId}/status?status=ready`);
      toast.success(`Ticket #${orderNum} marked Ready`);
      await loadKDSOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update status");
    } finally {
      setBumpingId(null);
    }
  };

  const handleCompleteOrder = async (orderId: number | string, orderNum: string) => {
    setBumpingId(orderId);
    try {
      const numId = parseInt(String(orderId).replace(/\D/g, ""), 10);
      await api.patch(`/orders/${numId || orderId}/status?status=completed`);
      toast.success(`Ticket #${orderNum} Completed`);
      await loadKDSOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to complete order");
    } finally {
      setBumpingId(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const activeQueueCount = allOrders.filter((o) => {
    const st = (o.status || "").toLowerCase();
    return st !== "completed" && st !== "cancelled" && st !== "paid" && st !== "served";
  }).length;

  const preparingCount = allOrders.filter((o) => {
    const st = (o.status || "").toLowerCase();
    return st === "in_kitchen" || st === "preparing";
  }).length;

  const readyCount = allOrders.filter((o) => {
    const st = (o.status || "").toLowerCase();
    return st === "ready";
  }).length;

  return (
    <div className="bg-background text-foreground space-y-4 p-2 sm:p-4">
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Kitchen Display Stream (KDS)"
        description="FIFO timestamp queue • Station-wise item split routing"
        icon={<ChefHat size={18} />}
        badge="FIFO Queue"
        actions={
          <>
            {/* Status Filters */}
            <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === "ACTIVE" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active ({activeQueueCount})
              </button>
              <button
                onClick={() => setStatusFilter("PREPARING")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === "PREPARING" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cooking ({preparingCount})
              </button>
              <button
                onClick={() => setStatusFilter("READY")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === "READY" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ready ({readyCount})
              </button>
              <button
                onClick={() => setStatusFilter("HISTORY")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === "HISTORY" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Recall
              </button>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={() => {
                loadKitchenStations();
                loadKDSOrders();
              }}
              disabled={isLoading}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer hidden sm:block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </>
        }
      />

      {/* ── Kitchen Station Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-border/50">
        <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1 shrink-0">
          <Filter size={12} /> Station:
        </span>
        <button
          onClick={() => setStationFilter("ALL")}
          className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-all ${
            stationFilter === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All Stations
        </button>

        {dbStations.length > 0 ? (
          dbStations.map((st) => {
            const isActive = stationFilter === st.name;
            return (
              <button
                key={st.id}
                onClick={() => setStationFilter(st.name)}
                className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.name}
              </button>
            );
          })
        ) : (
          <button
            onClick={() => setStationFilter("Main Kitchen")}
            className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-all ${
              stationFilter === "Main Kitchen"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Main Kitchen
          </button>
        )}
      </div>

      {/* ── KOT Order Grid Stream ──────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-lg space-y-2 bg-muted/20">
          <ChefHat size={32} className="mx-auto text-muted-foreground/50" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Kitchen Queue Clear</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {statusFilter === "HISTORY"
              ? "No completed orders in history."
              : `No active orders matching station "${stationFilter}". Incoming orders will stream here automatically.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredOrders.map((order, orderIdx) => {
            const isBumping = String(bumpingId) === String(order.id);
            const notesText = order.notes || order.special_instructions;

            const createdDate = order.created_at ? new Date(order.created_at) : new Date();
            const elapsedMins = Math.floor((Date.now() - createdDate.getTime()) / 60000);
            const isOverdue = elapsedMins >= 10;
            const isWarning = elapsedMins >= 5 && elapsedMins < 10;
            const isPreparing = (order.status || "").toLowerCase() === "in_kitchen" || (order.status || "").toLowerCase() === "preparing";
            const isReady = (order.status || "").toLowerCase() === "ready";

            // Clean, simple card header & badge styles
            let headerBg = "bg-muted/50 text-foreground border-border";
            let statusText = "Pending";
            let statusBadge = "bg-muted text-muted-foreground border-border";

            if (isOverdue && !isReady) {
              headerBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
              statusText = "Overdue";
              statusBadge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-mono";
            } else if (isWarning && !isReady) {
              headerBg = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
              statusText = "Priority";
              statusBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono";
            } else if (isPreparing) {
              headerBg = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
              statusText = "Cooking";
              statusBadge = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-mono";
            } else if (isReady) {
              headerBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
              statusText = "Ready";
              statusBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono";
            }

            const orderTypeLabel = order.order_type
              ? order.order_type.replace("_", " ").toUpperCase()
              : (order.table_name || order.table_number ? "Dine In" : "Takeaway");

            const channelLabel = order.source_channel === "customer_web"
              ? "QR Code"
              : order.source_channel === "staff_portal"
              ? "Waiter Pad"
              : "POS Counter";

            return (
              <div
                key={order.id || order.order_number}
                className="bg-card border border-border rounded-md overflow-hidden flex flex-col justify-between shadow-2xs transition-colors hover:border-primary/40"
              >
                {/* Header Bar */}
                <div className={`px-3 py-2 ${headerBg} border-b space-y-1`}>
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono font-semibold bg-background px-1.5 py-0.2 rounded border border-border text-foreground">
                        #{orderIdx + 1}
                      </span>
                      <span className="font-semibold truncate text-foreground">
                        {order.table_name ? `Table ${order.table_name}` : (order.table_number ? `Table ${order.table_number}` : orderTypeLabel)}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${statusBadge}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="truncate">{order.order_number}</span>
                    <span className="shrink-0">{elapsedMins > 0 ? `${elapsedMins}m ago` : "Just now"}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-3 space-y-2.5 flex-1 text-xs">
                  {/* Channel info */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-border/50 font-medium">
                    <span>{channelLabel}</span>
                    {order.customer_name ? (
                      <span className="truncate text-foreground font-medium">{order.customer_name}</span>
                    ) : order.waiter_name ? (
                      <span className="truncate text-foreground font-medium">Waiter: {order.waiter_name}</span>
                    ) : null}
                  </div>

                  {/* Notes */}
                  {notesText && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] p-2 rounded flex items-start gap-1 font-medium">
                      <AlertTriangle size={13} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>Note: {notesText}</span>
                    </div>
                  )}

                  {/* Line Items */}
                  <div className="space-y-1.5 divide-y divide-border/40">
                    {order.items?.map((item: any, idx: number) => {
                      const itemName = item.product_name || item.name || item.item_name || "Dish Item";
                      const variantName = item.variant_name || (item.selected_variant ? (typeof item.selected_variant === "string" ? item.selected_variant : item.selected_variant.name) : undefined);
                      const addonsList = Array.isArray(item.selected_addons)
                        ? item.selected_addons.map((a: any) => (typeof a === "string" ? a : a.name))
                        : [];

                      return (
                        <div key={idx} className="pt-1.5 first:pt-0 space-y-0.5">
                          <div className="flex items-start justify-between gap-1 text-xs">
                            <span className="font-semibold text-foreground">
                              {item.quantity}x {itemName}
                            </span>
                            {item.kds_station && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded border border-border">
                                {item.kds_station}
                              </span>
                            )}
                          </div>

                          {variantName && (
                            <p className="text-[11px] text-muted-foreground font-medium">
                              • Option: {variantName}
                            </p>
                          )}
                          {addonsList.length > 0 && (
                            <p className="text-[11px] text-muted-foreground font-medium">
                              • Addons: {addonsList.join(", ")}
                            </p>
                          )}
                          {item.preparation_notes && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                              "{item.preparation_notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-2 bg-muted/20 border-t border-border grid grid-cols-2 gap-2 text-xs">
                  <button
                    disabled={isBumping || isPreparing || isReady}
                    onClick={() => handleStartPrep(order.id, order.order_number)}
                    className={`py-1 px-2 rounded font-medium text-xs border cursor-pointer transition-colors ${
                      isPreparing
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    }`}
                  >
                    {isPreparing ? "Cooking" : "Start Prep"}
                  </button>

                  {isReady ? (
                    <button
                      disabled={isBumping}
                      onClick={() => handleCompleteOrder(order.id, order.order_number)}
                      className="py-1 px-2 rounded font-medium text-xs bg-muted text-foreground hover:bg-muted/80 border border-border cursor-pointer transition-colors"
                    >
                      {isBumping ? "Closing..." : "Close Ticket"}
                    </button>
                  ) : (
                    <button
                      disabled={isBumping}
                      onClick={() => handleBumpOrder(order.id, order.order_number)}
                      className="py-1 px-2 rounded font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600 cursor-pointer transition-colors"
                    >
                      {isBumping ? "Updating..." : "Mark Ready"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplayPage;
