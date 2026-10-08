import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  User,
  Phone,
  FileText,
  RotateCcw,
  Check,
  Receipt,
  QrCode,
  ArrowRight,
  Flame,
  Coffee,
  CircleDot
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
  description?: string;
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
  notes?: string;
}

interface TokenPass {
  token_code: string;
  order_id?: string | number;
  order_number?: string;
  table_number: string;
  customer_name: string;
  customer_phone?: string;
  special_instructions?: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    is_veg?: boolean;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "placed" | "preparing" | "ready" | "served" | "completed";
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
  {
    id: 1,
    name: "Plain Dosa",
    category_id: 2,
    category_name: "South Indian",
    selling_price: 90,
    is_veg: true,
    description: "Crispy golden crepe served with sambar & coconut chutney",
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Masala Dosa",
    category_id: 2,
    category_name: "South Indian",
    selling_price: 110,
    is_veg: true,
    description: "Crispy crepe stuffed with spiced potato masala",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Mysore Masala Dosa",
    category_id: 2,
    category_name: "South Indian",
    selling_price: 130,
    is_veg: true,
    description: "With spicy red chili garlic chutney spread inside",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    name: "Steamed Idli (2 Pcs)",
    category_id: 2,
    category_name: "South Indian",
    selling_price: 60,
    is_veg: true,
    description: "Soft fluffy steamed rice cakes with piping hot sambar",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    name: "Medu Vada (2 Pcs)",
    category_id: 2,
    category_name: "South Indian",
    selling_price: 75,
    is_veg: true,
    description: "Crispy lentil donuts fried to golden perfection",
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    name: "Pav Bhaji",
    category_id: 3,
    category_name: "Snacks & Chaat",
    selling_price: 120,
    is_veg: true,
    description: "Buttery spiced vegetable mash served with toasted butter pav",
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 7,
    name: "Paneer Tikka Roll",
    category_id: 3,
    category_name: "Snacks & Chaat",
    selling_price: 140,
    is_veg: true,
    description: "Char-grilled cottage cheese wrapped in fresh flatbread with mint mayo",
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 8,
    name: "Filter Coffee (Degree)",
    category_id: 4,
    category_name: "Beverages",
    selling_price: 45,
    is_veg: true,
    description: "Traditional South Indian frothy chicory brew in brass dabarah",
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 9,
    name: "Cold Coffee with Ice Cream",
    category_id: 4,
    category_name: "Beverages",
    selling_price: 160,
    is_veg: true,
    description: "Creamy iced espresso topped with vanilla scoop & cocoa dusting",
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 10,
    name: "Special South Thali",
    category_id: 5,
    category_name: "Meals & Combos",
    selling_price: 210,
    is_veg: true,
    description: "Rice, sambar, rasam, 2 poriyals, curd, papad, poori, sweet",
    image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 11,
    name: "Gulab Jamun (2 Pcs)",
    category_id: 6,
    category_name: "Desserts",
    selling_price: 60,
    is_veg: true,
    description: "Warm melt-in-mouth milk dumplings soaked in cardamom rose syrup",
    image_url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=80",
  },
];

export default function App() {
  // Navigation active view: 'menu' | 'cart' | 'token'
  // Strictly replaces user profile with live token detail!
  const [activeTab, setActiveTab] = useState<"menu" | "cart" | "token">("menu");

  // Detect Table from URL QR Scan (?table=T1 or ?table_number=T-01)
  const [scannedTable, setScannedTable] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTable =
        params.get("table") ||
        params.get("table_number") ||
        params.get("table_id") ||
        params.get("t");
      if (urlTable) {
        const cleaned = urlTable.toUpperCase().startsWith("T") ? urlTable.toUpperCase() : `T-${urlTable}`;
        localStorage.setItem("ssrone_dinein_table", cleaned);
        return cleaned;
      }
      const saved = localStorage.getItem("ssrone_dinein_table");
      return saved || "T-01";
    } catch {
      return "T-01";
    }
  });

  // State
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non-veg">("all");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Token Pass stored in local storage
  const [activeToken, setActiveToken] = useState<TokenPass | null>(() => {
    try {
      const saved = localStorage.getItem("ssrone_active_dinein_token");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load Menu from backend
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
              image_url: item.image_url || item.image,
              description: item.description,
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

  // Poll active token status every 3 seconds
  useEffect(() => {
    if (!activeToken || activeToken.status === "completed") return;

    const interval = setInterval(async () => {
      try {
        if (activeToken.order_id) {
          const res = await fetch(`/api/v1/orders/${activeToken.order_id}`);
          if (res.ok) {
            const data = await res.json();
            const rawStatus = (data.status || "").toLowerCase();
            let resolvedStatus: TokenPass["status"] = "placed";
            if (rawStatus.includes("prep") || rawStatus.includes("kitchen") || rawStatus === "confirmed") {
              resolvedStatus = "preparing";
            } else if (rawStatus.includes("ready")) {
              resolvedStatus = "ready";
            } else if (rawStatus.includes("served") || rawStatus.includes("delivered")) {
              resolvedStatus = "served";
            } else if (rawStatus.includes("complete") || rawStatus.includes("settled")) {
              resolvedStatus = "completed";
            }

            if (resolvedStatus !== activeToken.status) {
              const updated: TokenPass = { ...activeToken, status: resolvedStatus };
              setActiveToken(updated);
              localStorage.setItem("ssrone_active_dinein_token", JSON.stringify(updated));
            }
          }
        }
      } catch {
        // quiet poll
      }
    }, 3000);

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

  // Dine-in tax calculation (5% GST standard)
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartGrandTotal = cartSubtotal + cartTax;

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === 1 || item.category_id === selectedCategoryId;
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVeg =
        vegFilter === "all" ||
        (vegFilter === "veg" && item.is_veg) ||
        (vegFilter === "non-veg" && !item.is_veg);
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [menuItems, selectedCategoryId, searchQuery, vegFilter]);

  // Place Dine-in Order and Generate Live Token
  const handleCheckoutAndGenerateToken = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const tableClean = scannedTable.trim() || "T-01";
      const tableIdNum = parseInt(tableClean.replace(/\D/g, ""), 10) || 1;

      // Single option: strictly dine_in under table QR code
      const orderPayload = {
        branch_id: 1,
        table_id: tableIdNum,
        table_name: tableClean,
        order_type: "dine_in",
        source_channel: "token_order_web",
        customer_name: customerName.trim() || `Guest at Table ${tableClean}`,
        customer_phone: customerPhone.trim() || undefined,
        special_instructions: specialInstructions.trim() || undefined,
        notes: `Dine-in Token Order at ${tableClean}`,
        subtotal: cartSubtotal,
        tax_amount: cartTax,
        net_amount: cartGrandTotal,
        items: cart.map((ci) => ({
          product_id: ci.item.id,
          name: ci.item.name,
          quantity: ci.quantity,
          unit_price: ci.item.selling_price,
          total_price: ci.item.selling_price * ci.quantity,
          is_veg: ci.item.is_veg,
          notes: ci.notes || specialInstructions.trim() || undefined,
        })),
      };

      let generatedTokenCode = `${Math.floor(10 + Math.random() * 90)}`;
      let createdOrderId: any = null;
      let createdOrderNumber: string | undefined = undefined;

      // Call backend order API
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": "1",
        },
        body: JSON.stringify(orderPayload),
      }).catch(() => null);

      if (res && res.ok) {
        const orderData = await res.json();
        createdOrderId = orderData.id;
        createdOrderNumber = orderData.order_number;
        if (orderData.token_number || orderData.daily_order_number) {
          generatedTokenCode = String(orderData.token_number || orderData.daily_order_number);
        } else if (orderData.order_number) {
          const parts = orderData.order_number.split("-");
          generatedTokenCode = parts[parts.length - 1] || generatedTokenCode;
        }
      }

      const pass: TokenPass = {
        token_code: generatedTokenCode,
        order_id: createdOrderId,
        order_number: createdOrderNumber || `TKN-${generatedTokenCode}`,
        table_number: tableClean,
        customer_name: orderPayload.customer_name,
        customer_phone: orderPayload.customer_phone,
        special_instructions: specialInstructions.trim() || undefined,
        items: cart.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.selling_price,
          quantity: ci.quantity,
          is_veg: ci.item.is_veg,
        })),
        subtotal: cartSubtotal,
        tax_amount: cartTax,
        total_amount: cartGrandTotal,
        status: "placed",
        created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setActiveToken(pass);
      localStorage.setItem("ssrone_active_dinein_token", JSON.stringify(pass));
      setCart([]);
      // Switch view directly to Token Detail!
      setActiveTab("token");
    } catch (err) {
      console.error("Token order creation failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewOrder = () => {
    setActiveToken(null);
    localStorage.removeItem("ssrone_active_dinein_token");
    setActiveTab("menu");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-emerald-500 selection:text-black">
      {/* Container max-w-md: Native app feel */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative pb-20 border-x border-slate-800/80 shadow-2xl bg-[#090d16]">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 glass-panel px-4 py-3 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
                <Utensils size={20} className="fill-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  BAITHAK CAFE
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Dine-In
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <QrCode size={11} className="text-emerald-400" />
                  Table QR Dine-In Ordering
                </p>
              </div>
            </div>

            {/* Scanned Table Pill (Auto-assigned via QR Code) */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-black">{scannedTable}</span>
            </div>
          </div>

          {/* Under Table Dine-In Guarantee Banner */}
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Ordering under <strong className="text-white font-bold">{scannedTable}</strong>
            </span>
            <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
              Dine-In Only
            </span>
          </div>

          {/* Search & Veg Filter (when on menu tab) */}
          {activeTab === "menu" && (
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes (e.g. Dosa, Coffee)..."
                  className="w-full h-9 pl-9 pr-7 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
          )}
        </header>

        {/* Categories Bar (visible on menu tab) */}
        {activeTab === "menu" && (
          <div className="sticky top-[138px] z-20 bg-[#090d16]/95 backdrop-blur-md px-3 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: MENU TAB */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "menu" && (
          <main className="p-3 space-y-2.5 flex-1">
            {/* Active Token notification banner if guest has token running */}
            {activeToken && (
              <div
                onClick={() => setActiveTab("token")}
                className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between cursor-pointer hover:bg-emerald-950/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-black text-sm">
                    #{activeToken.token_code}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Live Token #{activeToken.token_code} Running</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Table {activeToken.table_number} • Tap to view kitchen progress
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-emerald-400" />
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-slate-500 space-y-2">
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
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      qty > 0
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm"
                        : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/80"
                    }`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800 bg-slate-800"
                        loading="lazy"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 ${
                            item.is_veg ? "border-emerald-500" : "border-red-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_veg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {item.category_name || "Special"}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 truncate">{item.name}</h3>
                      {item.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-medium">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs font-mono font-black text-emerald-400 mt-1">
                        ₹{item.selling_price}
                      </p>
                    </div>

                    {/* Quantity Action Pill */}
                    <div className="shrink-0">
                      {qty > 0 ? (
                        <div className="flex items-center bg-emerald-600 rounded-xl text-white font-bold h-9 px-1 shadow-md shadow-emerald-950">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded-lg active:scale-95 transition"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-black">{qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-emerald-700 rounded-lg active:scale-95 transition"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="h-8 px-3.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-xs font-black text-slate-200 active:scale-95 transition flex items-center gap-1 cursor-pointer"
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
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: CART & CHECKOUT TAB */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "cart" && (
          <main className="p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-400" />
                  Table Dine-In Order Cart
                </h2>
                <p className="text-xs text-slate-400">
                  Strictly Dine-In at <span className="text-emerald-400 font-bold">{scannedTable}</span>
                </p>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 size={13} />
                  Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <ShoppingBag size={36} className="mx-auto text-slate-600" />
                <p className="text-sm font-bold text-white">Your cart is empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Scan menu dishes for table {scannedTable} to place your order and receive your kitchen token.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("menu")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer"
                >
                  Browse Dishes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2">
                  {cart.map((ci) => (
                    <div
                      key={ci.item.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ci.item.is_veg ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <p className="text-xs font-bold text-white truncate">{ci.item.name}</p>
                        </div>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          ₹{ci.item.selling_price * ci.quantity}
                          <span className="text-[10px] text-slate-500 ml-1 font-normal">
                            (₹{ci.item.selling_price} × {ci.quantity})
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeFromCart(ci.item.id)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold text-white">
                          {ci.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(ci.item)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFromCart(ci.item.id)}
                          className="w-7 h-7 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 flex items-center justify-center ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Single Option Banner: Dine-In At Table (No takeaway option) */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Utensils size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Order Mode</p>
                      <p className="text-[10px] text-slate-400">Strictly Dine-In (Table {scannedTable})</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Confirmed
                  </span>
                </div>

                {/* Guest Details */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-300">Guest Information (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Guest Name (e.g. Rahul)"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Mobile (Optional)"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Kitchen Special Instructions */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <FileText size={13} className="text-slate-400" />
                    Kitchen Cooking Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less spicy, sambar on the side, extra crispy..."
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Bill Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({cartTotalCount} items)</span>
                    <span className="font-mono">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5%)</span>
                    <span className="font-mono">₹{cartTax}</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-400">₹{cartGrandTotal}</span>
                  </div>
                </div>

                {/* Confirm & Get Token Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCheckoutAndGenerateToken}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-emerald-950 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Placing Dine-In Order & Generating Token...</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Place Dine-In Order & Get Token</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: TOKEN DETAIL TAB (Replaces User Profile)                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "token" && (
          <main className="p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-400" />
                  My Token Details
                </h2>
                <p className="text-xs text-slate-400">
                  Live Counter & Kitchen Ticket Status
                </p>
              </div>

              {activeToken && (
                <button
                  type="button"
                  onClick={handleStartNewOrder}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <RotateCcw size={12} />
                  New Token
                </button>
              )}
            </div>

            {!activeToken ? (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <Receipt size={40} className="mx-auto text-slate-600" />
                <p className="text-sm font-bold text-white">No Active Token Pass</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You do not have an active dine-in order. Place an order from the menu under table {scannedTable} to get your live kitchen token.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("menu")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer"
                >
                  Open Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Digital Token Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    YOUR DINE-IN TOKEN NUMBER
                  </p>

                  <div className="text-7xl font-black font-mono tracking-tighter text-emerald-400 my-2 drop-shadow-lg">
                    #{activeToken.token_code}
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                    <span>Table: <strong className="text-white font-black">{activeToken.table_number}</strong></span>
                    <span>•</span>
                    <span>Time: <strong className="text-white font-mono">{activeToken.created_at}</strong></span>
                  </div>

                  {/* 3-Step Live Kitchen Progress Tracker */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-left">
                      Order Status Track
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Step 1: Placed */}
                      <div
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                          activeToken.status === "placed"
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        <Clock size={16} />
                        <span className="text-[10px] font-black uppercase">Received</span>
                      </div>

                      {/* Step 2: Preparing */}
                      <div
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                          activeToken.status === "preparing"
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                            : activeToken.status === "ready" || activeToken.status === "served"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-600"
                        }`}
                      >
                        <ChefHat size={16} />
                        <span className="text-[10px] font-black uppercase">In Kitchen</span>
                      </div>

                      {/* Step 3: Served */}
                      <div
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1 ${
                          activeToken.status === "ready" || activeToken.status === "served"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-600"
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase">
                          {activeToken.status === "ready" ? "Ready" : "Served"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Breakdown */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                    <span>Ordered Dishes ({activeToken.items.length})</span>
                    <span className="font-mono text-emerald-400">Total: ₹{activeToken.total_amount}</span>
                  </div>

                  <div className="space-y-2">
                    {activeToken.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              it.is_veg ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          <span className="text-white font-medium">
                            {it.name} <span className="text-slate-500">× {it.quantity}</span>
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-300">
                          ₹{it.price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeToken.special_instructions && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">Chef Note:</span>{" "}
                      {activeToken.special_instructions}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("menu")}
                    className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Order More Items for Table {activeToken.table_number}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewOrder}
                    className="w-full h-10 rounded-xl bg-transparent hover:bg-slate-900 text-slate-400 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Clear & Start Fresh Order</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* BOTTOM NAVIGATION BAR (Replaces Profile with Token Detail)        */}
        {/* ------------------------------------------------------------------ */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-transparent pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl">
            {/* 1. Menu Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-xl transition cursor-pointer ${
                activeTab === "menu" ? "text-emerald-400 font-black" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Utensils size={18} />
              <span className="text-[10px] font-bold">Menu</span>
            </button>

            {/* 2. Cart Tab with Badge */}
            <button
              type="button"
              onClick={() => setActiveTab("cart")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-xl transition relative cursor-pointer ${
                activeTab === "cart" ? "text-emerald-400 font-black" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <ShoppingBag size={18} />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">Cart</span>
            </button>

            {/* 3. Token Detail Tab (Replaces Profile) */}
            <button
              type="button"
              onClick={() => setActiveTab("token")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 rounded-xl transition relative cursor-pointer ${
                activeTab === "token" ? "text-emerald-400 font-black" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Receipt size={18} />
                {activeToken && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-bold">
                {activeToken ? `Token #${activeToken.token_code}` : "Token Detail"}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
