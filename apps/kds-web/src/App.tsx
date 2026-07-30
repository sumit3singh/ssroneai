import { useState, useEffect, useMemo } from "react";
import { ChefHat, Clock, Sparkles, Check, Play, Moon, Sun, ArrowRight, ShieldAlert, MonitorPlay } from "lucide-react";

export function App() {
  const [activeUnit, setActiveUnit] = useState<"CUH02" | "GGN01">("CUH02");
  const [isDark, setIsDark] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/v1/orders?status=in_kitchen");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.items || []);
        return;
      }
    } catch (err) {
      console.warn("Backend orders API call failed", err);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Active tickets filtered
  const activeTickets = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = o.status !== "completed" && o.status !== "cancelled" && o.status !== "delivered";
      return matchStatus;
    }).sort((a, b) => new Date(a.created_at || a.date || Date.now()).getTime() - new Date(b.created_at || b.date || Date.now()).getTime());
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "confirmed" || currentStatus === "pending" ? "preparing" : "completed";
    try {
      await fetch(`/api/v1/orders/${orderId}/status?status=${nextStatus}`, { method: "PATCH" });
      loadOrders();
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };


  const getElapsedTime = (createdAt: string) => {
    if (!createdAt) return "0m ago";
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return diff > 0 ? `${diff}m ago` : "Just now";
  };

  const getTimerColor = (createdAt: string) => {
    if (!createdAt) return "text-slate-400";
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (diff > 15) return "text-red-500 font-extrabold animate-pulse";
    if (diff > 8) return "text-amber-500 font-bold";
    return "text-emerald-500";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Top Header */}
      <header className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-xs`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <ChefHat size={20} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-wider uppercase flex items-center gap-1.5">
              The Baithak
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-black tracking-normal lowercase">kds</span>
            </h1>
            <p className="text-3xs text-slate-400 uppercase tracking-widest font-bold mt-0.5">Real-Time Kitchen Ticket Dashboard</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Unit Toggle Switches */}
          <div className={`flex p-1 rounded-xl border ${isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-100 border-slate-200"} gap-1`}>
            <button
              onClick={() => setActiveUnit("CUH02")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                activeUnit === "CUH02"
                  ? `${isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-2xs border border-slate-200"}`
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Haryana (CUH02)
            </button>
            <button
              onClick={() => setActiveUnit("GGN01")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                activeUnit === "GGN01"
                  ? `${isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-2xs border border-slate-200"}`
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Gurugram (GGN01)
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl border ${isDark ? "border-slate-800 bg-slate-900 hover:bg-slate-850" : "border-slate-200 bg-white hover:bg-slate-50"} cursor-pointer text-slate-400 hover:text-primary`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="p-6">
        {activeTickets.length === 0 ? (
          <div className="text-center py-24 space-y-4 max-w-sm mx-auto">
            <MonitorPlay size={40} className="mx-auto text-slate-300 dark:text-slate-700 animate-bounce" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Clear! No Active Tickets</h3>
            <p className="text-3xs text-slate-400/80 leading-normal">
              New orders placed via the restaurant POS or the customer mobile app will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeTickets.map((ticket) => {
              const isPreparing = ticket.status === "preparing";
              return (
                <div 
                  key={ticket.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-card transition-all duration-300 ${
                    isPreparing 
                      ? `${isDark ? "bg-emerald-950/10 border-emerald-500/30" : "bg-emerald-50/20 border-emerald-200"}` 
                      : `${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-4 border-b flex items-start justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <div>
                      <p className="text-2xs font-mono font-bold text-primary">{ticket.order_number}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-1 inline-block ${
                        ticket.order_source === "customer_web" 
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}>
                        {ticket.order_source === "customer_web" ? "Web App" : "POS Table"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-2xs font-semibold">
                      <Clock size={11} className={getTimerColor(ticket.created_at)} />
                      <span className={getTimerColor(ticket.created_at)}>{getElapsedTime(ticket.created_at)}</span>
                    </div>
                  </div>

                  {/* Ticket Items List */}
                  <div className="p-4 flex-1 space-y-2.5">
                    {ticket.items && ticket.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between text-xs font-semibold">
                        <div className="flex gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isDark ? "bg-slate-850 text-slate-300" : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-foreground">{item.product_name || item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* KDS Action Button */}
                  <div className="p-3 bg-muted/10 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleUpdateStatus(ticket.id || ticket.order_number, ticket.status)}
                      className={`w-full py-2.5 rounded-xl text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isPreparing
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-primary hover:bg-primary/95 text-white"
                      }`}
                    >
                      {isPreparing ? (
                        <>
                          <Check size={13} />
                          <span>Mark Cooked</span>
                        </>
                      ) : (
                        <>
                          <Play size={11} />
                          <span>Start Cooking</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer KPI Status */}
      <footer className={`fixed bottom-0 left-0 right-0 py-3 px-6 border-t flex justify-between items-center text-3xs font-bold uppercase tracking-wider ${
        isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
      }`}>
        <div className="flex gap-4">
          <span>Active Tickets: {activeTickets.length}</span>
          <span>Preparing: {activeTickets.filter(t => t.status === "preparing").length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <Sparkles size={11} className="animate-pulse" />
          <span>SaaS Sync: Active</span>
        </div>
      </footer>

    </div>
  );
}
export default App;
