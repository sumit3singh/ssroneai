import React, { useState } from "react";
import { ChefHat, Clock, CheckCircle2, AlertCircle, Filter, Check } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSOrder } from "../../types";

interface KitchenDisplayPageProps {
  orders: POSOrder[];
  onBumpOrder?: (orderId: string | number) => void;
}

export const KitchenDisplayPage: React.FC<KitchenDisplayPageProps> = ({
  orders,
  onBumpOrder
}) => {
  const [stationFilter, setStationFilter] = useState("ALL");

  const stations = ["ALL", "Main Kitchen", "Chinese & Tandoor", "Beverages & Bar", "Bakery & Desserts"];

  const kitchenOrders = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED");

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-5">
      {/* Header & Station Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            Kitchen Display System (Live KDS Stream)
          </h3>
          <p className="text-3xs text-muted-foreground">
            Realtime preparation tickets routed dynamically to kitchen stations
          </p>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-muted/60 p-1 rounded-xl border border-border">
          {stations.map((s) => (
            <button
              key={s}
              onClick={() => setStationFilter(s)}
              className={`px-3 py-1 rounded-lg text-2xs font-extrabold transition-all ${
                stationFilter === s ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Live KOT Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl space-y-2">
          <ChefHat size={32} className="mx-auto text-muted-foreground/60" />
          <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">Kitchen Queue Clear</h4>
          <p className="text-xs text-muted-foreground">All pending KOT tickets have been prepared and served.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => (
            <div
              key={order.id}
              className="bg-muted/30 border border-border/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-card hover:border-primary/50 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">#{order.order_number}</span>
                    {order.table_name && (
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        T-{order.table_name}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-2xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Clock size={11} /> 8m
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-sm bg-card border border-border px-2 py-0.5 rounded-md">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onBumpOrder && onBumpOrder(order.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check size={14} /> Bump / Ready
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
