/**
 * The Baithak POS - Kitchen Display System (KDS) Screen
 * Displays live KOT tickets grouped by kitchen stations with one-tap status transitions.
 */
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  UtensilsCrossed, 
  RefreshCw, 
  ChefHat,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/utils/api-client";


interface KDSItem {
  id: number;
  product_name: string;
  quantity: number;
  notes?: string;
  status: string;
}

interface KDSTicket {
  id: number;
  kot_number: string;
  order_number: string;
  station_name: string;
  table_or_token: string;
  order_type: string;
  created_at: string;
  status: "pending" | "preparing" | "ready" | "completed";
  items: KDSItem[];
}

export const KDSScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStation, setSelectedStation] = useState<string>("ALL");

  const { data: stationsData = [] } = useQuery({
    queryKey: ["kitchen-stations"],
    queryFn: async () => {
      const res: any = await api.get("/orders/stations").catch(() => []);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    }
  });

  const { data: ordersData = [], isLoading, refetch } = useQuery({
    queryKey: ["kds-orders"],
    queryFn: async () => {
      const res: any = await api.get("/orders/?status=in_kitchen").catch(() => []);
      return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
    },
    refetchInterval: 5000
  });

  // Transform backend active orders into KDS Ticket cards
  const tickets: KDSTicket[] = useMemo(() => {
    const safeOrders = Array.isArray(ordersData) ? ordersData : [];
    return safeOrders.map((ord: any) => ({
      id: ord.id,
      kot_number: `KOT-${ord.order_number || ord.id}`,
      order_number: ord.order_number || `ORD-${ord.id}`,
      station_name: ord.items?.[0]?.course || "Main Kitchen",
      table_or_token: ord.notes || "Counter",
      order_type: ord.order_type || "dine_in",
      created_at: ord.created_at || new Date().toISOString(),
      status: ord.status === "in_kitchen" ? "preparing" : "pending",
      items: (ord.items || []).map((it: any) => ({
        id: it.id,
        product_name: it.product_name || it.name || "Item",
        quantity: it.quantity || 1,
        notes: it.preparation_notes,
        status: it.kds_status || "pending"
      }))
    }));
  }, [ordersData]);

  const filteredTickets = useMemo(() => {
    if (selectedStation === "ALL") return tickets;
    return tickets.filter((t) => t.station_name.toLowerCase().includes(selectedStation.toLowerCase()));
  }, [tickets, selectedStation]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return api.patch(`/orders/${id}/status?status=${status}`, null);
    },
    onSuccess: () => {
      toast.success("KOT Ticket status updated!");
      void queryClient.invalidateQueries({ queryKey: ["kds-orders"] });
    }
  });

  const getElapsedTimeStr = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor((now - start) / 60000);
    return `${diffMins} min`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* KDS Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Baithak KDS Display</h1>
            <p className="text-xs text-slate-400">Live Kitchen Display & Multi-Station Routing</p>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 space-x-1">
          <button
            onClick={() => setSelectedStation("ALL")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedStation === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            All Stations ({tickets.length})
          </button>
          {stationsData.map((st: any) => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.name)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedStation === st.name
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <button
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Tickets</span>
        </button>
      </header>

      {/* Main KOT Cards Grid */}
      <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span>Loading live kitchen tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-slate-500 border border-dashed border-slate-800 rounded-3xl p-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500/40 mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">All Kitchen Orders Cleared!</h3>
            <p className="text-xs text-slate-500 mt-1">No active tickets waiting for preparation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTickets.map((t) => {
              const elapsedMins = parseInt(getElapsedTimeStr(t.created_at));
              const isUrgent = elapsedMins > 12;

              return (
                <div
                  key={t.id}
                  className={`flex flex-col bg-slate-900 border rounded-2xl shadow-xl overflow-hidden transition-all ${
                    isUrgent ? "border-rose-500/60 ring-1 ring-rose-500/40" : "border-slate-800"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      isUrgent ? "bg-rose-950/40 border-rose-500/40" : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {t.order_number}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{t.table_or_token}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${
                          isUrgent ? "bg-rose-500 text-white animate-pulse" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getElapsedTimeStr(t.created_at)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                        {t.station_name}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Item List */}
                  <div className="flex-1 p-4 space-y-3">
                    {t.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between border-b border-slate-800/60 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-2">
                          <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{item.product_name}</p>
                            {item.notes && (
                              <p className="text-xs text-amber-300/80 italic mt-0.5">* {item.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center space-x-2">
                    <button
                      onClick={() => updateStatus.mutate({ id: t.id, status: "ready" })}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MARK READY</span>
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: t.id, status: "served" })}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                      title="Mark Served"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
