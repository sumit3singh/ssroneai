import React, { useState, useEffect, useMemo } from "react";
import {
  QrCode,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Utensils,
  ChevronRight,
  X,
  Phone,
  User,
  RotateCcw,
  Coffee,
  Check,
  Zap,
} from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  category_id?: number;
  category_name?: string;
  selling_price: number;
  base_price?: number;
  is_veg?: boolean;
  image_url?: string;
  is_available?: boolean;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  variant?: string;
  notes?: string;
}

interface TokenPass {
  token_code: string;
  customer_name: string;
  customer_phone?: string;
  cart_items: any[];
  subtotal: number;
  is_claimed: boolean;
  claimed_at?: string;
  created_at: string;
}

// Fallback high-quality menu items if backend is cold
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "All Dishes" },
  { id: 2, name: "South Indian" },
  { id: 3, name: "Snacks & Chaat" },
  { id: 4, name: "Beverages" },
  { id: 5, name: "Meals & Combos" },
  { id: 6, name: "Desserts" },
];

const DEFAULT_ITEMS: MenuItem[] = [
  { id: 1, name: "Plain Dosa", category_id: 2, category_name: "South Indian", selling_price: 90, is_veg: true },
  { id: 2, name: "Masala Dosa", category_id: 2, category_name: "South Indian", selling_price: 110, is_veg: true },
  { id: 3, name: "Mysore Masala Dosa", category_id: 2, category_name: "South Indian", selling_price: 130, is_veg: true },
  { id: 4, name: "Steamed Idli (2 Pcs)", category_id: 2, category_name: "South Indian", selling_price: 60, is_veg: true },
  { id: 5, name: "Medu Vada (2 Pcs)", category_id: 2, category_name: "South Indian", selling_price: 75, is_veg: true },
  { id: 6, name: "Pav Bhaji", category_id: 3, category_name: "Snacks & Chaat", selling_price: 120, is_veg: true },
  { id: 7, name: "Paneer Tikka Roll", category_id: 3, category_name: "Snacks & Chaat", selling_price: 140, is_veg: true },
  { id: 8, name: "Filter Coffee (Degree)", category_id: 4, category_name: "Beverages", selling_price: 45, is_veg: true },
  { id: 9, name: "Cold Coffee with Ice Cream", category_id: 4, category_name: "Beverages", selling_price: 160, is_veg: true },
  { id: 10, name: "Fresh Lime Soda", category_id: 4, category_name: "Beverages", selling_price: 65, is_veg: true },
  { id: 11, name: "Special South Thali", category_id: 5, category_name: "Meals & Combos", selling_price: 210, is_veg: true },
  { id: 12, name: "Gulab Jamun (2 Pcs)", category_id: 6, category_name: "Desserts", selling_price: 60, is_veg: true },
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non-veg">("all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Token Ticket
  const [activeToken, setActiveToken] = useState<TokenPass | null>(() => {
    try {
      const saved = localStorage.getItem("ssrone_active_token");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load menu from backend
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const [catsRes, itemsRes] = await Promise.all([
          fetch("/api/v1/restaurant/categories?branch_id=1").catch(() => null),
          fetch("/api/v1/restaurant/menu-items?branch_id=1").catch(() => null),
        ]);

        if (catsRes && catsRes.ok) {
          const catsData = await catsRes.json();
          if (Array.isArray(catsData) && catsData.length > 0) {
            setCategories([{ id: 1, name: "All Dishes" }, ...catsData]);
          }
        }

        if (itemsRes && itemsRes.ok) {
          const itemsData = await itemsRes.json();
          if (Array.isArray(itemsData) && itemsData.length > 0) {
            const normalized: MenuItem[] = itemsData.map((item: any) => ({
              id: item.id,
              name: item.name,
              category_id: item.category_id,
              category_name: item.category_name || item.category?.name,
              selling_price: Number(item.selling_price || item.base_price || 0),
              is_veg: item.is_veg ?? true,
              image_url: item.image_url,
              is_available: item.is_available ?? true,
            }));
            setMenuItems(normalized);
          }
        }
      } catch (e) {
        console.warn("Using offline menu fallback", e);
      }
    };
    loadMenu();
  }, []);

  // Poll token status when active
  useEffect(() => {
    if (!activeToken || activeToken.is_claimed) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/queue-tokens/${activeToken.token_code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.is_claimed && !activeToken.is_claimed) {
            const updated = { ...activeToken, is_claimed: true, claimed_at: data.claimed_at };
            setActiveToken(updated);
            localStorage.setItem("ssrone_active_token", JSON.stringify(updated));
          }
        }
      } catch (err) {
        // quiet poll
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeToken]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== itemId);
    });
  };

  const deleteFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const cartTotalCount = useMemo(
    () => cart.reduce((acc, ci) => acc + ci.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, ci) => acc + ci.item.selling_price * ci.quantity, 0),
    [cart]
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === 1 || item.category_id === selectedCategoryId;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg =
        vegFilter === "all" ||
        (vegFilter === "veg" && item.is_veg) ||
        (vegFilter === "non-veg" && !item.is_veg);
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [menuItems, selectedCategoryId, searchQuery, vegFilter]);

  // Generate Token
  const handleGenerateToken = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        branch_id: 1,
        customer_name: customerName.trim() || "Mobile Guest",
        customer_phone: customerPhone.trim() || undefined,
        table_number: orderType === "takeaway" ? "Takeaway" : "Queue Walk-in",
        cart_items: cart.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.selling_price,
          quantity: ci.quantity,
          is_veg: ci.item.is_veg,
          notes: specialNotes.trim() || undefined,
        })),
        subtotal: cartSubtotal,
      };

      const res = await fetch("/api/v1/orders/queue-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": "1",
        },
        body: JSON.stringify(payload),
      });

      let tokenCode = `${Math.floor(100 + Math.random() * 900)}`;
      let tokenData: any = null;

      if (res.ok) {
        const data = await res.json();
        tokenCode = data.token_code || tokenCode;
        tokenData = data.token;
      }

      const pass: TokenPass = {
        token_code: tokenCode,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        cart_items: payload.cart_items,
        subtotal: cartSubtotal,
        is_claimed: false,
        created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setActiveToken(pass);
      localStorage.setItem("ssrone_active_token", JSON.stringify(pass));
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error("Token creation error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearToken = () => {
    setActiveToken(null);
    localStorage.removeItem("ssrone_active_token");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-emerald-500 selection:text-black">
      {/* Mobile constraint container (max-w-md for native app feel on all devices) */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative pb-28 border-x border-slate-800/60 shadow-2xl bg-[#090d16]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-panel px-4 py-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
                <Zap size={20} className="fill-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  SSR ONE EXPRESS
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Fast Order
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Scan • Pick • Pay at Counter</p>
              </div>
            </div>

            {/* Active Token Badge Link */}
            {activeToken && (
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                  activeToken.is_claimed
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                <span>#{activeToken.token_code}</span>
                <span className="w-2 h-2 rounded-full bg-current"></span>
              </button>
            )}
          </div>

          {/* Search & Veg Toggle */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes (e.g. Dosa, Coffee)..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Quick Veg Filter Pill */}
            <button
              type="button"
              onClick={() =>
                setVegFilter(vegFilter === "all" ? "veg" : vegFilter === "veg" ? "non-veg" : "all")
              }
              className={`h-9 px-3 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                vegFilter === "veg"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                  : vegFilter === "non-veg"
                  ? "bg-red-950/60 border-red-500 text-red-400"
                  : "bg-slate-900 border-slate-700/80 text-slate-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  vegFilter === "veg"
                    ? "bg-emerald-400"
                    : vegFilter === "non-veg"
                    ? "bg-red-400"
                    : "bg-slate-500"
                }`}
              />
              {vegFilter === "all" ? "All" : vegFilter === "veg" ? "Veg" : "Non-Veg"}
            </button>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="sticky top-[106px] z-20 bg-[#090d16]/95 backdrop-blur-md px-3 py-2 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Active Digital Pass View if customer has a live token */}
        {activeToken && (
          <section className="m-3 p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-900 border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles size={14} />
                <span>ACTIVE QUEUE PASS</span>
              </div>
              <button
                type="button"
                onClick={handleClearToken}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw size={11} />
                New Order
              </button>
            </div>

            <div className="py-4 text-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                YOUR COUNTER TOKEN NUMBER
              </p>
              <div className="text-6xl font-black font-mono tracking-tighter text-emerald-400 my-1 drop-shadow-md">
                #{activeToken.token_code}
              </div>
              <p className="text-xs text-slate-300">
                Guest: <span className="font-bold text-white">{activeToken.customer_name}</span> •{" "}
                {activeToken.cart_items.length} Items • ₹{Math.round(activeToken.subtotal)}
              </p>
            </div>

            {/* Status indicator */}
            <div
              className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                activeToken.is_claimed
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
              }`}
            >
              {activeToken.is_claimed ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>CLAIMED BY CASHIER! Food preparing in kitchen 👨‍🍳</span>
                </>
              ) : (
                <>
                  <Clock size={16} className="animate-spin text-amber-400" />
                  <span>Waiting at Cashier Counter... Tell code #{activeToken.token_code}</span>
                </>
              )}
            </div>

            {/* Simulated barcode for optical scanner gun */}
            <div className="mt-3 pt-2 flex flex-col items-center justify-center">
              <div className="h-7 w-48 flex items-center justify-between px-2 bg-white rounded py-1">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${i % 3 === 0 ? "w-1 bg-black" : i % 2 === 0 ? "w-0.5 bg-black" : "w-0.5 bg-transparent"}`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1">
                *TOKEN-{activeToken.token_code}*
              </span>
            </div>
          </section>
        )}

        {/* Menu Items List */}
        <main className="p-3 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Utensils size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No dishes found</p>
              <p className="text-xs text-slate-600">Try searching a different item or category</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const inCart = cart.find((ci) => ci.item.id === item.id);
              const qty = inCart ? inCart.quantity : 0;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    qty > 0
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* Veg / Non-Veg Dot */}
                      <span
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                          item.is_veg
                            ? "border-emerald-500"
                            : "border-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.is_veg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {item.category_name || "Food"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 truncate">{item.name}</h3>
                    <p className="text-sm font-mono font-black text-emerald-400 mt-0.5">
                      ₹{item.selling_price}
                    </p>
                  </div>

                  {/* Quantity Action Pill */}
                  <div className="shrink-0">
                    {qty > 0 ? (
                      <div className="flex items-center bg-emerald-600 rounded-lg text-white font-bold h-8 px-1 shadow-md shadow-emerald-950">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded active:scale-95 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-mono text-xs">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded active:scale-95 transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="h-8 px-3.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-xs font-bold text-slate-200 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* Sticky Floating Bottom Cart Bar */}
        {cartTotalCount > 0 && !isCartOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-3 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="w-full h-13 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black flex items-center justify-between shadow-2xl shadow-emerald-950 border border-emerald-400/30 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center font-mono text-xs">
                    {cartTotalCount}
                  </div>
                  <div className="text-left">
                    <p className="text-xs leading-none font-bold text-emerald-100">View Cart</p>
                    <p className="text-sm font-mono font-black">₹{cartSubtotal}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                  <span>Get Token</span>
                  <ChevronRight size={15} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Slide-Up Cart Drawer Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
            <div className="w-full max-w-md mx-auto glass-sheet rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
              {/* Drawer Header */}
              <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <ShoppingBag size={18} className="text-emerald-400" />
                    Review Pre-Order Cart
                  </h2>
                  <p className="text-xs text-slate-400">
                    {cartTotalCount} items • ₹{cartSubtotal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Order Type Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOrderType("dine-in")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      orderType === "dine-in"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dine-in (At Table)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("takeaway")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      orderType === "takeaway"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Takeaway / Parcel
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2">
                  {cart.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-white truncate">{ci.item.name}</p>
                        <p className="text-xs font-mono font-bold text-emerald-400">
                          ₹{ci.item.selling_price * ci.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(ci.item.id)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold text-white">
                          {ci.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(ci.item)}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFromCart(ci.item.id)}
                          className="w-7 h-7 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guest Details */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300">Your Details (For Order Callout)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name (e.g. Amit)"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone (Optional)"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Kitchen Instructions (Optional)</label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Extra spicy, less oil, pack separately..."
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Total Summary */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-mono">₹{Math.round(cartSubtotal * 0.05)}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-800">
                    <span>To Pay at Counter</span>
                    <span className="font-mono text-emerald-400">
                      ₹{Math.round(cartSubtotal * 1.05)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSubmitting || cart.length === 0}
                  onClick={handleGenerateToken}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Generating Token...</span>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Generate Counter Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
