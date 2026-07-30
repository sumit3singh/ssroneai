import { useState, useEffect, useMemo } from "react";
import { Smartphone, QrCode, Award, Wallet, ClipboardList, RefreshCw, UserCheck, ShieldCheck, Heart, User, MapPin } from "lucide-react";

export function App() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("cust-1");

  const loadData = () => {
    const rawCusts = localStorage.getItem("baithak_customers");
    if (rawCusts) setCustomers(JSON.parse(rawCusts));

    const rawOrders = localStorage.getItem("baithak_orders");
    if (rawOrders) setOrders(JSON.parse(rawOrders));
  };

  useEffect(() => {
    loadData();
    window.addEventListener("storage", loadData);
    const interval = setInterval(loadData, 4000);
    return () => {
      window.removeEventListener("storage", loadData);
      clearInterval(interval);
    };
  }, []);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0] || {
      first_name: "Rahul",
      last_name: "Sharma",
      loyalty_tier: "VIP",
      loyalty_points: 420,
      wallet_balance: 1500,
      phone: "9876543201"
    };
  }, [customers, selectedCustomerId]);

  const customerOrders = useMemo(() => {
    return orders.filter(o => {
      // match by notes or customer name matches
      const nameMatch = o.notes && o.notes.toLowerCase().includes(activeCustomer.first_name.toLowerCase());
      return nameMatch;
    }).sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  }, [orders, activeCustomer]);

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-md w-full">
      
      {/* Simulation Persona Selector */}
      <div className="w-full bg-slate-800/80 border border-slate-700/60 p-4 rounded-3xl space-y-2 text-xs text-slate-300 font-sans">
        <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1">
          <UserCheck size={12} className="text-primary" />
          Simulate Logged-in Guest Profile
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer font-bold"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900">
              {c.first_name} {c.last_name} ({c.loyalty_tier.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Smartphone Device Mockup Wrapper */}
      <div className="border-[10px] border-slate-950 rounded-[44px] shadow-2xl overflow-hidden max-w-[320px] w-full min-h-[600px] bg-slate-950 flex flex-col justify-between relative font-sans text-slate-300">
        
        {/* Notch / Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-b-xl z-50 flex justify-center items-center">
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Mobile Status Bar */}
        <div className="px-5 pt-3 pb-1 flex justify-between items-center text-[9px] font-bold text-slate-400 bg-slate-900 z-10">
          <span>12:00 PM</span>
          <div className="flex gap-1.5 items-center">
            <span>5G</span>
            <div className="w-4 h-2 bg-slate-700 rounded-sm p-[1px] flex"><div className="bg-emerald-400 w-full rounded-[1px]"/></div>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto bg-slate-900 px-4 py-3 space-y-4 scrollbar-hide pb-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-widest uppercase text-slate-100">The Baithak Club</h2>
            <div className="p-1 rounded-lg bg-slate-800/40 border border-slate-700/40 text-primary">
              <Heart size={12} fill="currentColor" />
            </div>
          </div>

          {/* Guest Profile Card */}
          <div className="bg-gradient-to-br from-primary via-primary/95 to-slate-900 border border-primary/20 p-4 rounded-2xl shadow-lg relative overflow-hidden space-y-3">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Award size={96} />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-slate-300">Club Member</p>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{activeCustomer.first_name} {activeCustomer.last_name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                {activeCustomer.loyalty_tier}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-slate-300">
              <div>
                <p className="text-[8px] uppercase tracking-wider text-slate-400">Club Balance</p>
                <div className="flex items-center gap-1 mt-1 text-slate-100 font-bold">
                  <Wallet size={12} className="text-amber-500" />
                  <span className="text-xs">₹{activeCustomer.wallet_balance || 0}</span>
                </div>
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider text-slate-400">Loyalty Points</p>
                <div className="flex items-center gap-1 mt-1 text-slate-100 font-bold">
                  <Award size={12} className="text-amber-500" />
                  <span className="text-xs">{activeCustomer.loyalty_points || 0} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick QR Table Order Button */}
          <div className="bg-slate-850 border border-slate-700/50 p-4 rounded-2xl space-y-2 text-center">
            <QrCode className="mx-auto text-primary" size={24} />
            <h4 className="text-2xs font-bold text-slate-100">Dine-In Table Ordering</h4>
            <p className="text-[9px] text-slate-400 leading-normal">
              Scan the QR code displayed at your restaurant table to place orders directly.
            </p>
            <a
              href="http://localhost:8080/order/table/T4"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md transition hover:bg-primary/95"
            >
              Scan Table T4
            </a>
          </div>

          {/* Recent Orders Timeline */}
          <div className="space-y-2 font-sans">
            <h4 className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
              <ClipboardList size={11} /> Order History
            </h4>
            <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
              {customerOrders.map((ord: any) => (
                <div key={ord.id} className="p-3 bg-slate-850/50 border border-slate-800 rounded-xl flex items-center justify-between text-[10px]">
                  <div>
                    <p className="font-bold text-slate-200">{ord.order_number}</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">{new Date(ord.created_at || ord.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-200">₹{ord.grand_total}</p>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-400 mt-0.5 block">{ord.status}</span>
                  </div>
                </div>
              ))}
              
              {customerOrders.length === 0 && (
                <p className="text-[8px] text-slate-500 text-center py-6">No orders found for this member profile.</p>
              )}
            </div>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-900 flex justify-around text-slate-500 text-[9px] font-black uppercase tracking-widest">
          <span className="text-primary flex flex-col items-center gap-0.5"><User size={13} /> Home</span>
          <span className="flex flex-col items-center gap-0.5"><MapPin size={13} /> Outlets</span>
        </div>

      </div>

      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/20 px-3 py-1 rounded-full">
        <ShieldCheck size={12} className="text-primary" />
        <span>SaaS Client Secured</span>
      </div>

    </div>
  );
}
export default App;
