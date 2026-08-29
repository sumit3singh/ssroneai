import React, { useState, useEffect, useMemo } from "react";
import { ChefHat, Clock, Check, RefreshCw, Flame, User, MessageSquare, Utensils, AlertTriangle } from "lucide-react";
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { POSOrder } from "../../../types";

interface KitchenDisplayPageProps {
  orders?: POSOrder[];
  onRefresh?: () => void;
}

export const KitchenDisplayPage: React.FC<KitchenDisplayPageProps> = ({
  orders: propOrders = [],
  onRefresh
}) => {
  const [stationFilter, setStationFilter] = useState("ALL");
  const [fetchedOrders, setFetchedOrders] = useState<POSOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bumpingId, setBumpingId] = useState<number | string | null>(null);

  const stations = ["ALL", "Main Kitchen", "Chinese & Tandoor", "Beverages & Bar", "Bakery & Desserts"];

  const loadKDSOrders = async () => {
    setIsLoading(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const url = activeBranchId ? `/orders?branch_id=${activeBranchId}` : "/orders";
      const res = await api.get<any>(url);
      const list = Array.isArray(res) ? res : res?.items || [];
      setFetchedOrders(list);
    } catch (err) {
      console.error("Failed to load KDS orders from server", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKDSOrders();
    const interval = setInterval(loadKDSOrders, 4000); // 4s auto live refresh
    return () => clearInterval(interval);
  }, []);

  // Merge prop orders and fetched orders with strict deduplication by order_number or id
  const allOrdersMap = new Map<string, POSOrder>();
  [...fetchedOrders, ...propOrders].forEach((o) => {
    if (o && (o.id || o.order_number)) {
      const key = String(o.order_number || o.id);
      if (!allOrdersMap.has(key)) {
        allOrdersMap.set(key, o);
      }
    }
  });
  const allOrders = Array.from(allOrdersMap.values());

  // Filter active preparation tickets (exclude completed & cancelled)
  const kitchenOrders = useMemo(() => {
    return allOrders.filter((o) => {
      const st = (o.status || "").toLowerCase();
      return st !== "completed" && st !== "cancelled" && st !== "paid" && st !== "served";
    });
  }, [allOrders]);

  const handleStartPrep = async (orderId: number | string, orderNum: string) => {
    setBumpingId(orderId);
    try {
      const numId = parseInt(String(orderId).replace(/\D/g, ""), 10);
      await api.patch(`/orders/${numId || orderId}/status?status=in_kitchen`);
      toast.info(`KOT Ticket #${orderNum} is now IN KITCHEN preparation!`);
      await loadKDSOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to start prep:", err);
      const detail = err?.response?.data?.detail || err?.message || "Failed to update ticket status";
      toast.error(detail);
    } finally {
      setBumpingId(null);
    }
  };

  const handleBumpOrder = async (orderId: number | string, orderNum: string) => {
    setBumpingId(orderId);
    try {
      const numId = parseInt(String(orderId).replace(/\D/g, ""), 10);
      await api.patch(`/orders/${numId || orderId}/status?status=ready`);
      toast.success(`KOT Ticket #${orderNum} marked READY FOR SERVING!`);
      await loadKDSOrders();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to bump order:", err);
      const detail = err?.response?.data?.detail || err?.message || "Failed to update ticket status";
      toast.error(detail);
    } finally {
      setBumpingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-5">
      {/* Header & Station Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-black text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            Kitchen Operating System (Live KDS Stream)
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Realtime preparation tickets routed dynamically to kitchen stations • PostgreSQL DB Live Stream
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Station Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-muted/60 p-1 rounded-xl border border-border">
            {stations.map((s) => (
              <button
                key={s}
                onClick={() => setStationFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-2xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  stationFilter === s ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={loadKDSOrders}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Refresh KDS Tickets"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {/* Live KOT Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl space-y-3">
          <ChefHat size={38} className="mx-auto text-muted-foreground/50" />
          <div>
            <h4 className="font-black text-sm text-foreground uppercase tracking-wider">KITCHEN QUEUE CLEAR</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              All active KOT tickets have been prepared and served. Orders dispatched from POS Billing or Waiter Pads will stream here live.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const isBumping = String(bumpingId) === String(order.id);
            const notesText = order.notes || order.special_instructions;

            const createdDate = order.created_at ? new Date(order.created_at) : new Date();
            const elapsedMins = Math.floor((Date.now() - createdDate.getTime()) / 60000);
            const isOverdue = elapsedMins >= 10;
            const isWarning = elapsedMins >= 5 && elapsedMins < 10;
            const isPreparing = (order.status || "").toLowerCase() === "in_kitchen" || (order.status || "").toLowerCase() === "preparing";

            let headerBg = "bg-slate-800 text-white";
            if (isOverdue) headerBg = "bg-red-600 text-white animate-pulse";
            else if (isWarning) headerBg = "bg-amber-600 text-white";
            else if (isPreparing) headerBg = "bg-blue-600 text-white";

            return (
              <div
                key={order.id || order.order_number}
                className="bg-card border-2 border-border hover:border-primary/50 rounded-2xl overflow-hidden shadow-card flex flex-col justify-between transition-all"
              >
                {/* Ticket Top Header */}
                <div className={`p-3.5 ${headerBg} flex items-center justify-between`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm uppercase tracking-wide">
                        {order.table_name ? `Table T${order.table_name}` : (order.table_number ? `Table ${order.table_number}` : "Takeaway")}
                      </span>
                      <span className="text-[9px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded uppercase">
                        {order.source_channel === "customer_web" ? "QR Order" : order.source_channel === "staff_portal" ? "Waiter Pad" : "POS Billing"}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] opacity-80 font-bold mt-0.5">{order.order_number}</p>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs font-bold">
                    <Clock size={13} />
                    <span>{elapsedMins > 0 ? `${elapsedMins}m ago` : "Just now"}</span>
                  </div>
                </div>

                {/* Ticket Content */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Waiter & Customer Info */}
                  {(order.customer_name || order.waiter_name) && (
                    <div className="flex items-center justify-between text-2xs font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/60">
                      {order.customer_name && <span className="flex items-center gap-1"><User size={11} /> {order.customer_name}</span>}
                      {order.waiter_name && <span className="flex items-center gap-1"><ChefHat size={11} /> {order.waiter_name}</span>}
                    </div>
                  )}

                  {/* Preparation Notes */}
                  {notesText && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold p-2 rounded-xl flex items-start gap-1.5">
                      <AlertTriangle size={13} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>Note: {notesText}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => {
                      const itemName = item.product_name || item.name || item.item_name || "Dish Item";
                      const variantName = item.variant_name || (item.selected_variant ? item.selected_variant.name : undefined);
                      const addonsList = Array.isArray(item.selected_addons) ? item.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [];

                      return (
                        <div key={idx} className="flex items-start justify-between text-xs font-bold text-foreground bg-muted/20 p-2.5 rounded-xl border border-border/50">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="font-mono font-black text-xs px-2 py-0.5 bg-card border border-border rounded-md shrink-0 text-primary">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="block font-bold text-foreground leading-snug">{itemName}</span>
                              {variantName && (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-mono font-bold">
                                  Option: {variantName}
                                </span>
                              )}
                              {addonsList.length > 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono font-bold">
                                  + {addonsList.join(", ")}
                                </span>
                              )}
                              {item.preparation_notes && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 block italic">
                                  "{item.preparation_notes}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bump Action Buttons */}
                <div className="p-3 bg-muted/20 border-t border-border grid grid-cols-2 gap-2">
                  <Button
                    disabled={isBumping || isPreparing}
                    onClick={() => handleStartPrep(order.id, order.order_number)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-2xs uppercase py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Flame size={13} />
                    <span>{isPreparing ? "COOKING" : "START PREP"}</span>
                  </Button>

                  <Button
                    disabled={isBumping}
                    onClick={() => handleBumpOrder(order.id, order.order_number)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xs uppercase py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Check size={13} />
                    <span>{isBumping ? "BUMPING..." : "MARK READY"}</span>
                  </Button>
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
