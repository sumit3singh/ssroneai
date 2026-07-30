import { useState, useEffect, useMemo } from "react";
import { ClipboardList, Plus, Minus, Send, CheckCircle2, Moon, Sun, ShieldAlert, Store, UserCheck, LogOut } from "lucide-react";
import LoginPanel from "@/components/LoginPanel";
import EmployeeDirectory from "@/components/EmployeeDirectory";
import SeedManager from "@/components/SeedManager";
import { getAuth, logout } from "@/stores/auth";
import { seedEmployees } from "@/utils/seedEmployees";

export function App() {
  const [activeUnit, setActiveUnit] = useState<"CUH02" | "GGN01">("CUH02");
  const [selectedTable, setSelectedTable] = useState("T1");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [auth, setAuth] = useState(() => getAuth());
  const [showDirectory, setShowDirectory] = useState(false);
  const [showSeedManager, setShowSeedManager] = useState(false);

  // ensure sample employees exist
  useEffect(() => {
    seedEmployees();
  }, []);

  useEffect(() => {
    const onStorage = () => setAuth(getAuth());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const loadData = () => {
    // Load products
    const rawProds = localStorage.getItem("baithak_products");
    if (rawProds) setProducts(JSON.parse(rawProds));

    // Load tables
    const rawTables = localStorage.getItem("baithak_tables");
    if (rawTables) setTables(JSON.parse(rawTables));
  };

  useEffect(() => {
    loadData();
    // Add storage listener for changes
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Clear cart when unit switches
  useEffect(() => {
    setCart([]);
  }, [activeUnit]);

  // Filtered Menu
  const filteredMenu = useMemo(() => {
    return products.filter((p) => {
      const matchBranch = p.unit_code === activeUnit;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [products, activeUnit, searchQuery]);

  const addToCart = (prod: any) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === prod.id);
      if (existing) {
        return prev.map((x) => (x.id === prod.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((prev) =>
      prev.map((x) => {
        if (x.id === id) {
          const next = x.quantity + change;
          return next > 0 ? { ...x, quantity: next } : null;
        }
        return x;
      }).filter(Boolean)
    );
  };

  const handleDispatchOrder = () => {
    if (cart.length === 0) return;

    const savedOrders = localStorage.getItem("baithak_orders");
    const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];

    // Generate SAP order number prefix
    const ordCount = currentOrders.filter((o: any) => o.order_number && o.order_number.includes(`-${activeUnit}-`)).length + 1;
    const ordSeq = String(ordCount).padStart(4, "0");
    const resolvedOrderNumber = `2627-${activeUnit}-ORD-${ordSeq}`;

    const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const newOrder = {
      id: `ord-staff-${Date.now()}`,
      order_number: resolvedOrderNumber,
      branch_id: activeUnit,
      order_type: "dine_in",
      order_source: "staff_portal", // waiter order source
      status: "pending",
      payment_status: "unpaid",
      subtotal,
      discount_amount: 0,
      total_tax: tax,
      grand_total: total,
      amount_paid: 0,
      balance_due: total,
      notes: `Table ${selectedTable} (Waiter order)`,
      items: cart.map((it) => ({
        product_name: it.name,
        quantity: it.quantity,
        unit_price: it.selling_price,
        line_total: it.selling_price * it.quantity,
      })),
      created_at: new Date().toISOString(),
    };

    currentOrders.push(newOrder);
    localStorage.setItem("baithak_orders", JSON.stringify(currentOrders));

    // Also write a mock invoice for admin billing sync
    const savedInvs = localStorage.getItem("baithak_invoices");
    const currentInvs = savedInvs ? JSON.parse(savedInvs) : [];
    const invCount = currentInvs.filter((i: any) => i.number && i.number.includes(`-${activeUnit}-`)).length + 1;
    const invSeq = String(invCount).padStart(4, "0");
    const resolvedInvoiceNumber = `2627-${activeUnit}-INV-${invSeq}`;

    currentInvs.push({
      id: `inv-${Date.now()}`,
      number: resolvedInvoiceNumber,
      customer: `Table ${selectedTable} (Dine-In)`,
      date: new Date().toISOString().slice(0, 10),
      amount: total,
      status: "unpaid",
    });
    localStorage.setItem("baithak_invoices", JSON.stringify(currentInvs));

    setSuccessOrder(resolvedOrderNumber);
    setCart([]);
    // dispatch storage event to notify KDS
    window.dispatchEvent(new Event("storage"));
  };

  const grandTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0) * 1.05;
  }, [cart]);

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>

      {/* Show login panel when not authenticated */}
      {!auth.role && <LoginPanel onLogin={() => setAuth(getAuth())} />}

      {/* Employee directory modal for user role */}
      {showDirectory && <EmployeeDirectory onClose={() => setShowDirectory(false)} />}
      {showSeedManager && <SeedManager onClose={() => setShowSeedManager(false)} />}

      {/* Top Header */}
      <header className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} shadow-xs`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <ClipboardList size={16} />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wider uppercase flex items-center gap-1">
              Baithak Staff
              <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-black tracking-normal lowercase">waiter</span>
            </h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Mobile Handheld Order Pad</p>
          </div>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-1.5 rounded-lg border ${isDark ? "border-slate-850 bg-slate-950" : "border-slate-200 bg-slate-100"} text-slate-400`}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <div className="flex items-center gap-2">
          {auth.role === 'employee' && <div className="text-2xs font-bold">Signed in: {auth.name}</div>}
          {auth.role === 'user' && (
            <>
              <button onClick={() => setShowDirectory(true)} className="px-3 py-1 rounded bg-muted/20 text-sm">Employee Directory</button>
              <button onClick={() => setShowSeedManager(true)} className="px-3 py-1 rounded bg-muted/20 text-sm">Seed Manager</button>
            </>
          )}
          {auth.role && (
            <button onClick={() => { logout(); setAuth(getAuth()); }} title="Sign out" className="p-1.5 rounded-lg border bg-transparent text-slate-400">
              <LogOut size={14} />
            </button>
          )}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 rounded-lg border ${isDark ? "border-slate-850 bg-slate-950" : "border-slate-200 bg-slate-100"} text-slate-400`}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Selector Area */}
      <div className="p-4 space-y-3 font-sans">

        {/* Unit Selector Toggle */}
        <div className={`p-3 border rounded-2xl flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Store size={13} /> Active Unit
          </span>
          <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border/40 gap-1">
            <button
              onClick={() => setActiveUnit("CUH02")}
              className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${activeUnit === "CUH02" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400"
                }`}
            >
              CUH02
            </button>
            <button
              onClick={() => setActiveUnit("GGN01")}
              className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${activeUnit === "GGN01" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-400"
                }`}
            >
              GGN01
            </button>
          </div>
        </div>

        {/* Table Selector */}
        <div className={`p-3 border rounded-2xl flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <UserCheck size={13} /> Select Table
          </span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-foreground"
          >
            {tables.length > 0 ? (
              tables.map(t => <option key={t.id} value={t.number} className="bg-card text-foreground">{t.number}</option>)
            ) : (
              ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"].map(t => (
                <option key={t} value={t} className="bg-card text-foreground">{t}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Order Workspace */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Menu Catalog Panel */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs p-2.5 rounded-xl border ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
              } outline-none focus:ring-1 focus:ring-primary`}
          />

          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredMenu.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod)}
                className={`p-3 border rounded-xl text-left flex flex-col justify-between min-h-[90px] ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs hover:bg-slate-50"
                  }`}
              >
                <span className="text-3xs text-muted-foreground uppercase font-black">{prod.category}</span>
                <div className="mt-2">
                  <h4 className="text-2xs font-bold leading-tight truncate text-foreground">{prod.name}</h4>
                  <p className="text-2xs font-black text-primary mt-0.5">₹{prod.selling_price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Waiter Cart Panel */}
        <div className={`p-4 border rounded-2xl flex flex-col justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="space-y-4">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">Active Waiter Pad</h3>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs font-semibold">
                  <div className="min-w-0 flex-1">
                    <p className="text-2xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">₹{item.selling_price} each</p>
                  </div>

                  <div className="flex items-center border border-border rounded-lg bg-card text-foreground">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={10} /></button>
                    <span className="px-2 text-2xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={10} /></button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <p className="text-3xs text-slate-400 text-center py-10 font-bold">Select items to begin ordering.</p>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-black">
                <span>Estimated Total:</span>
                <span>₹{Math.round(grandTotal)}</span>
              </div>
              <button
                onClick={handleDispatchOrder}
                className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl text-2xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send size={11} />
                Send Order to Kitchen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-xs p-6 rounded-2xl text-center border shadow-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 animate-bounce" />
            <h3 className="text-xs font-black text-foreground uppercase tracking-wide">Order Dispatched!</h3>
            <p className="text-[10px] text-slate-400 mt-1">Order serial: <strong className="text-primary">{successOrder}</strong></p>
            <p className="text-[10px] text-slate-400 mt-0.5">Ticket printed and queued in KDS station.</p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="mt-4 px-4 py-2 bg-primary text-white text-2xs font-bold rounded-lg shadow-sm hover:bg-primary/95 cursor-pointer"
            >
              Continue Waiter Pad
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className={`fixed bottom-0 left-0 right-0 py-3 px-4 border-t flex justify-between items-center text-[9px] font-bold uppercase tracking-wider ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
        }`}>
        <span>Table Active: {selectedTable}</span>
        <span className="flex items-center gap-1 text-primary"><ShieldAlert size={10} /> Waiter Sync Active</span>
      </footer>

    </div>
  );
}
export default App;
