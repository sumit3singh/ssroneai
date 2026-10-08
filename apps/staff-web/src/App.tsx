import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Minus,
  Send,
  Moon,
  Sun,
  Store,
  LogOut,
  Search,
  ChefHat,
  Utensils,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Volume2,
  VolumeX,
  Tablet,
  CheckCircle2,
  Users,
  ShoppingBag,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowRight
} from "lucide-react";
import EmployeeDirectory from "@/components/EmployeeDirectory";
import StaffItemCustomizeModal from "@/components/StaffItemCustomizeModal";
import TableFloorGrid, { TableInfo } from "@/components/TableFloorGrid";
import ActiveOrdersTracker, { RunningOrder } from "@/components/ActiveOrdersTracker";
import StaffLoginModal from "@/components/StaffLoginModal";
import { getAuth, logout, setAuth } from "@ssrone/auth";
import { api } from "@ssrone/api-client";
import { fetchCategories, fetchMenuItems } from "@/utils/menuApi";

// Web Audio synthesizer for crisp tablet touch feedback
function playTouchSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // quiet ignore if audio context locked
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<"floor" | "order" | "kots">("floor");
  const [activeUnit, setActiveUnit] = useState<"CUH02" | "GGN01">("CUH02");
  const [selectedTable, setSelectedTable] = useState("T1");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderRemark, setOrderRemark] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(() => !getAuth()?.isLoggedIn);

  // Tablet touch-screen special state
  const [isTabletTouchMode, setIsTabletTouchMode] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [runningOrders, setRunningOrders] = useState<RunningOrder[]>([]);

  const [isDark, setIsDark] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<any | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const [auth, setAuthState] = useState(() => getAuth());
  const [showDirectory, setShowDirectory] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    const onStorage = () => setAuthState(getAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Play audio on tap if sound is enabled
  const handleTapFeedback = () => {
    if (isSoundEnabled) {
      playTouchSound();
    }
  };

  // Fetch Menu Items, Categories, Tables & Orders directly from backend
  const loadData = async (overrideBranchId?: number | any) => {
    setIsRefreshing(true);
    const currentAuth = getAuth();
    const validOverride = typeof overrideBranchId === "number" && !isNaN(overrideBranchId) ? overrideBranchId : null;
    const branchParam = validOverride ?? (
      currentAuth?.user?.branch_id
        ? Number(currentAuth.user.branch_id)
        : Number(localStorage.getItem("active_branch_id") || 1)
    );

    try {
      const itemsRes = await fetchMenuItems(branchParam).catch(() => []);
      if (Array.isArray(itemsRes) && itemsRes.length > 0) {
        const formatted = itemsRes.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          description: item.description,
          category: item.category_name || item.category_id || "Specialties",
          categoryId: String(item.categoryId || item.category_id || "all"),
          selling_price: Number(item.basePrice || item.price || item.selling_price || 180),
          basePrice: Number(item.basePrice || item.price || 180),
          isVeg: item.isVeg !== false && item.is_veg !== false,
          is_veg: item.is_veg !== false && item.isVeg !== false,
          unit_code: String(branchParam),
          image: item.imageUrl || item.image_url || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
          variantGroups: item.variantGroups || item.variant_groups || [],
          addonGroups: item.addonGroups || item.addon_groups || [],
        }));
        setProducts(formatted);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }

    try {
      const catsRes = await fetchCategories(branchParam).catch(() => []);
      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setCategories(catsRes);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }

    try {
      const tablesRes = await api.get<any>(`/restaurant/tables?branch_id=${branchParam}`).catch(() => null);
      let tableList: any[] = [];
      if (Array.isArray(tablesRes)) tableList = tablesRes;
      else if (tablesRes?.items && Array.isArray(tablesRes.items)) tableList = tablesRes.items;

      const formattedTables: TableInfo[] = tableList.map((t: any) => ({
        id: String(t.id),
        number: t.table_number || t.name || t.code || `T${t.id}`,
        capacity: t.capacity || 4,
        status: (t.status || "available").toLowerCase() === "occupied" ? "occupied" : "available",
        section: t.section || "Main Dining",
      }));
      setTables(formattedTables);
    } catch {
      setTables([]);
    }

    try {
      const ordersRes = await api.get<any>(`/orders?branch_id=${branchParam}&page_size=50`).catch(() => null);
      let orderList: any[] = [];
      if (Array.isArray(ordersRes)) orderList = ordersRes;
      else if (ordersRes?.items && Array.isArray(ordersRes.items)) orderList = ordersRes.items;

      const formattedOrders: RunningOrder[] = orderList.map((o: any) => ({
        id: String(o.id || o.order_number),
        order_number: o.order_number || `ORD-${o.id}`,
        table_number: o.table_name || o.table_number || "T1",
        branch_id: String(o.branch_id || branchParam),
        status: (o.status || "pending").toLowerCase() as RunningOrder["status"],
        subtotal: Number(o.subtotal || o.net_amount || 0),
        total_tax: Number(o.tax_amount || 0),
        grand_total: Number(o.net_amount || o.subtotal || 0),
        created_at: o.created_at || new Date().toISOString(),
        items: (o.items || []).map((it: any) => ({
          id: String(it.id || it.product_id),
          item_name: it.product_name || it.item_name || it.name || "Dish Item",
          quantity: Number(it.quantity || 1),
          unit_price: Number(it.unit_price || it.price || 0),
          total_price: Number(it.total_price || (it.unit_price || 0) * (it.quantity || 1)),
          selected_variant: it.variant_name || (it.selected_variant ? it.selected_variant.name : undefined),
          selected_addons: Array.isArray(it.selected_addons) ? it.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [],
        })),
      }));
      setRunningOrders(formattedOrders);
    } catch {
      setRunningOrders([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Menu Items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (vegOnly && !p.isVeg) return false;
      if (selectedCategory !== "all") {
        const catMatch = String(p.categoryId) === String(selectedCategory) || String(p.category).toLowerCase() === String(selectedCategory).toLowerCase();
        if (!catMatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, vegOnly]);

  const handleSelectItem = (prod: any) => {
    handleTapFeedback();
    const hasVariants = prod.variantGroups && prod.variantGroups.length > 0;
    const hasAddons = prod.addonGroups && prod.addonGroups.length > 0;

    if (hasVariants || hasAddons) {
      setCustomizingItem(prod);
    } else {
      addToCartDirect(prod);
    }
  };

  const addToCartDirect = (prod: any) => {
    const itemKey = prod.id;
    setCart((prev) => {
      const existing = prev.find((x) => x.cartKey === itemKey);
      if (existing) {
        return prev.map((x) => (x.cartKey === itemKey ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [
        ...prev,
        {
          ...prod,
          cartKey: itemKey,
          quantity: 1,
          unitPrice: prod.selling_price || prod.basePrice || 150,
        },
      ];
    });
  };

  const handleConfirmCustomization = (customizedItem: any) => {
    handleTapFeedback();
    const variantName = customizedItem.selectedVariant?.name || "";
    const addonNames = (customizedItem.selectedAddons || []).map((a: any) => a.name).join(", ");
    const cartKey = `${customizedItem.id}_${variantName}_${addonNames}_${customizedItem.kitchenNote}`;

    setCart((prev) => {
      const existing = prev.find((x) => x.cartKey === cartKey);
      if (existing) {
        return prev.map((x) =>
          x.cartKey === cartKey ? { ...x, quantity: x.quantity + customizedItem.quantity } : x
        );
      }
      return [
        ...prev,
        {
          ...customizedItem,
          cartKey,
          quantity: customizedItem.quantity,
          unitPrice: customizedItem.unitPrice,
          variantSummary: variantName,
          addonsSummary: addonNames,
          kitchenNote: customizedItem.kitchenNote,
        },
      ];
    });
  };

  const updateQuantity = (cartKey: string, change: number) => {
    handleTapFeedback();
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.cartKey === cartKey) {
            const next = x.quantity + change;
            return next > 0 ? { ...x, quantity: next } : null;
          }
          return x;
        })
        .filter(Boolean)
    );
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice || item.selling_price) * item.quantity, 0);
  }, [cart]);

  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + tax;

  const handleDispatchOrder = async () => {
    if (cart.length === 0 || isSubmittingOrder) return;
    handleTapFeedback();
    setIsSubmittingOrder(true);

    const branchParam = activeUnit === "CUH02" ? 1 : 2;

    const apiPayload = {
      branch_id: branchParam,
      table_name: selectedTable,
      table_id: parseInt(selectedTable.replace(/\D/g, ""), 10) || 1,
      order_type: "dine_in",
      source_channel: "staff_portal",
      status: "PENDING",
      subtotal: subtotal,
      tax_amount: tax,
      net_amount: grandTotal,
      notes: orderRemark ? `Table ${selectedTable}: ${orderRemark}` : `Table ${selectedTable} (Waiter tablet)`,
      items: cart.map((it) => ({
        product_id: parseInt(it.id.replace(/\D/g, ""), 10) || 1,
        product_name: it.name,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice || it.selling_price,
        variant_name: it.variantSummary || undefined,
        addons: it.addonsSummary ? [it.addonsSummary] : [],
        preparation_notes: it.kitchenNote || undefined,
      })),
    };

    let resolvedOrderNumber = `2627-${activeUnit}-ORD-${String(runningOrders.length + 1).padStart(4, "0")}`;

    try {
      const res = await api.post<any>("/orders", apiPayload).catch(() => null);
      if (res && (res.order_number || res.id)) {
        resolvedOrderNumber = res.order_number || `ORD-${res.id}`;
      }
    } catch (err) {
      console.warn("Backend order creation warning:", err);
    }

    const newOrder: RunningOrder = {
      id: `ord-staff-${Date.now()}`,
      order_number: resolvedOrderNumber,
      table_number: selectedTable,
      branch_id: activeUnit,
      status: "pending",
      subtotal,
      total_tax: tax,
      grand_total: grandTotal,
      created_at: new Date().toISOString(),
      items: cart.map((it) => ({
        id: it.cartKey,
        item_name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice || it.selling_price,
        total_price: (it.unitPrice || it.selling_price) * it.quantity,
        selected_variant: it.variantSummary,
        selected_addons: it.addonsSummary ? [it.addonsSummary] : [],
      })),
    };

    setRunningOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setOrderRemark("");
    setSuccessOrder(resolvedOrderNumber);
    setIsSubmittingOrder(false);
    setActiveTab("kots");

    setTimeout(() => {
      setSuccessOrder(null);
    }, 4500);
  };

  return (
    <div className={`min-h-screen pb-16 font-sans transition-colors duration-200 select-none ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#FAF9F5] text-slate-900"}`}>

      {/* Staff Login Modal */}
      {showLoginModal && (
        <StaffLoginModal
          isOpen={showLoginModal}
          onLoginSuccess={(userData) => {
            setAuth({
              token: "staff-token-" + Date.now(),
              name: userData.name,
              isLoggedIn: true,
              user: userData,
            });
            setAuthState(getAuth());
            setShowLoginModal(false);
          }}
        />
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <StaffItemCustomizeModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}

      {/* Directory Modal */}
      {showDirectory && <EmployeeDirectory onClose={() => setShowDirectory(false)} />}

      {/* Top Tablet-Optimized Header Navbar */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-2xs flex items-center justify-between gap-3">
        {/* Left Branding & Tablet Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {auth.user?.branch_name || "Baithak Cafe"}
              {isTabletTouchMode && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  <Tablet size={11} /> Tablet Mode
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Tablet Waiter POS • {auth.name || "Serving Staff"}
            </p>
          </div>
        </div>

        {/* Right Tablet Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Feedback Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              handleTapFeedback();
            }}
            title={isSoundEnabled ? "Touch audio feedback ON" : "Touch audio feedback MUTED"}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              isSoundEnabled
                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
            }`}
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Refresh Database */}
          <button
            type="button"
            onClick={() => {
              handleTapFeedback();
              loadData();
            }}
            disabled={isRefreshing}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh Menu & Orders"
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin text-sky-600" : ""} />
          </button>

          {/* Active Waiter Badge */}
          {auth.name && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{auth.name}</span>
            </div>
          )}

          {/* Switch Waiter / Lock Button */}
          <button
            type="button"
            onClick={() => {
              handleTapFeedback();
              logout();
              setAuthState(getAuth());
              setShowLoginModal(true);
            }}
            title="Lock Tablet / Switch Staff"
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 transition cursor-pointer flex items-center gap-2 text-xs font-bold shadow-2xs"
          >
            <Lock size={15} />
            <span className="hidden sm:inline">Switch Staff</span>
          </button>
        </div>
      </header>

      {/* Main Tablet Navigation Bar: 48px+ Touch Targets */}
      <div className="px-4 sm:px-6 pt-3 pb-1 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => {
              handleTapFeedback();
              setActiveTab("floor");
            }}
            className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "floor"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid size={18} />
            <span>Floor Plan ({tables.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleTapFeedback();
              setActiveTab("order");
            }}
            className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "order"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Utensils size={18} />
            <span>Table {selectedTable} Order</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-sky-700 font-mono text-[10px] font-black flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              handleTapFeedback();
              setActiveTab("kots");
            }}
            className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "kots"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <ChefHat size={18} />
            <span>Kitchen KOTs ({runningOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="p-3 sm:p-5 max-w-7xl mx-auto space-y-4">
        {/* Success KOT Toast Banner */}
        {successOrder && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={24} />
              <div>
                <p className="text-sm font-black">KOT Dispatched Successfully!</p>
                <p className="text-xs text-emerald-100">Order #{successOrder} for Table {selectedTable} sent to kitchen.</p>
              </div>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: TABLE FLOOR PLAN (Touch-Friendly Table Grid)          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "floor" && (
          <TableFloorGrid
            tables={tables}
            runningOrders={runningOrders}
            selectedTable={selectedTable}
            onSelectTable={(tblNum) => {
              handleTapFeedback();
              setSelectedTable(tblNum);
              setActiveTab("order");
            }}
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: ORDER PAD (Tablet Landscape Split Screen / Portrait)  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "order" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Catalog Column (Left 7 cols on tablet landscape) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              {/* Quick Table Switcher Bar for tablet rush hours */}
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-xs font-bold uppercase text-slate-400 shrink-0">Switch:</span>
                  {tables.map((t) => {
                    const isCurrent = selectedTable === t.number;
                    return (
                      <button
                        key={t.id || t.number}
                        type="button"
                        onClick={() => {
                          handleTapFeedback();
                          setSelectedTable(t.number);
                        }}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                          isCurrent
                            ? "bg-sky-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {t.number}
                      </button>
                    );
                  })}
                </div>

                <div className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-xs font-black border border-sky-200 dark:border-sky-800">
                  Table {selectedTable}
                </div>
              </div>

              {/* Search & Veg Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes (e.g. Dosa, Chai, Thali)..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleTapFeedback();
                    setVegOnly(!vegOnly);
                  }}
                  className={`min-h-[44px] px-4 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    vegOnly
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${vegOnly ? "bg-white" : "bg-emerald-500"}`} />
                  Veg Only
                </button>
              </div>

              {/* Category Filter Pills (min 44px touch height) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-2xl shadow-2xs no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    handleTapFeedback();
                    setSelectedCategory("all");
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer flex items-center gap-2 ${
                    selectedCategory === "all"
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Utensils size={14} /> All Dishes
                </button>

                {categories.map((cat) => {
                  const isSelected = String(selectedCategory) === String(cat.id) || String(selectedCategory) === String(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        handleTapFeedback();
                        setSelectedCategory(cat.name);
                      }}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition cursor-pointer ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Menu Dishes Touch Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectItem(prod)}
                    className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 rounded-2xl shadow-2xs text-left flex flex-col justify-between min-h-[125px] transition cursor-pointer active:scale-[0.98]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {prod.name}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${prod.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono text-sm sm:text-base font-black text-sky-600 dark:text-sky-400">
                        ₹{prod.selling_price || prod.basePrice}
                      </span>
                      <span className="min-h-[32px] px-3 rounded-lg text-xs font-black bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                        <Plus size={12} strokeWidth={3} /> Add
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart & KOT Summary Column (Right 5 cols on tablet landscape) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4 sticky top-20">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Utensils size={17} className="text-sky-600" />
                      Table {selectedTable} Order Pad
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">Touchscreen Order Punch</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                    {cart.length} Dishes
                  </span>
                </div>

                {/* Cart Items List with Large Touch Steppers (40px) */}
                {cart.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 space-y-2">
                    <ShoppingBag size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Pad Empty</p>
                    <p className="text-[11px] text-slate-400">Tap dishes on the menu to add to Table {selectedTable}.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.cartKey}
                        className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                            {item.name}
                          </span>
                          <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                            ₹{item.unitPrice * item.quantity}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              (₹{item.unitPrice} each)
                            </span>
                          </span>
                        </div>

                        {/* Large Touch Steppers: 38px touch area */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 active:scale-95 transition cursor-pointer shadow-2xs"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="w-7 text-center font-mono font-black text-sm text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black hover:bg-sky-700 active:scale-95 transition cursor-pointer shadow-2xs"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Kitchen Remark Note */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={orderRemark}
                    onChange={(e) => setOrderRemark(e.target.value)}
                    placeholder="Kitchen remark (e.g. Less spicy, pack parcel)..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Total & Large 52px Dispatch Button */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (5%):</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-base text-sky-600 dark:text-sky-400 font-mono">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={cart.length === 0 || isSubmittingOrder}
                  onClick={handleDispatchOrder}
                  className="w-full min-h-[52px] py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Send size={18} />
                  <span>
                    {isSubmittingOrder ? "DISPATCHING KOT..." : `DISPATCH KOT TO KITCHEN (TABLE ${selectedTable})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: RUNNING KOTS                                          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "kots" && (
          <ActiveOrdersTracker orders={runningOrders} />
        )}
      </main>
    </div>
  );
}

export default App;
