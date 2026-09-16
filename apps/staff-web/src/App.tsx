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
  MessageSquare
} from "lucide-react";
import EmployeeDirectory from "@/components/EmployeeDirectory";
import StaffItemCustomizeModal from "@/components/StaffItemCustomizeModal";
import TableFloorGrid, { TableInfo } from "@/components/TableFloorGrid";
import ActiveOrdersTracker, { RunningOrder } from "@/components/ActiveOrdersTracker";
import StaffLoginModal from "@/components/StaffLoginModal";
import ActiveTableModal from "@/components/ActiveTableModal";
import { getAuth, logout } from "@ssrone/auth";
import { api } from "@ssrone/api-client";
import { fetchCategories, fetchMenuItems } from "@/utils/menuApi";



export function App() {
  const [activeTab, setActiveTab] = useState<"order" | "floor" | "kots">("floor");
  const [activeUnit, setActiveUnit] = useState<"CUH02" | "GGN01">("CUH02");
  const [selectedTable, setSelectedTable] = useState("T1");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderRemark, setOrderRemark] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(() => !getAuth()?.isLoggedIn);
  const [activeModalTable, setActiveModalTable] = useState<string | null>(null);

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

  // Fetch Menu Items, Categories, Tables & Orders directly from PostgreSQL DB via REST API
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
      notes: orderRemark ? `Table ${selectedTable}: ${orderRemark}` : `Table ${selectedTable} (Waiter pad order)`,
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
    }, 4000);
  };

  return (
    <div className={`min-h-screen pb-20 font-sans transition-colors duration-200 ${isDark ? "bg-slate-950 text-slate-100" : "bg-[#FAF9F5] text-slate-900"}`}>

      {/* Staff Login Modal */}
      {showLoginModal && (
        <StaffLoginModal
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

      {/* Rule 17: Top Fixed Header Navbar */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-2xs flex items-center justify-between gap-3">
        {/* Left Branch Branding & Logged-In Waiter Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-2xs shrink-0">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {auth.user?.branch_name || "Baithak Cafe - CUH Mahendragarh"}
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              Handheld Waiter Terminal • {auth.name || "Staff Member"}
            </p>
          </div>
        </div>

        {/* Right Actions & User Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={isRefreshing}
            className="min-h-[36px] p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh PostgreSQL Database"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-sky-600" : ""} />
          </button>

          {auth.name && (
            <div className="hidden sm:block text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              {auth.name}
            </div>
          )}

          <button
            onClick={() => {
              logout();
              setAuthState(getAuth());
              setShowLoginModal(true);
            }}
            title="Switch Staff Member / Sign Out"
            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
          >
            <LogOut size={15} />
            <span>Switch Staff</span>
          </button>
        </div>
      </header>

      {/* Rule 15: Mobile Bottom Navigation Bar (min 44px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-2xs">
        <button
          onClick={() => setActiveTab("order")}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-lg text-[10px] font-bold transition ${
            activeTab === "order" ? "bg-sky-600 text-white" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <Utensils size={16} />
          <span>Order Pad</span>
        </button>
        <button
          onClick={() => setActiveTab("floor")}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-lg text-[10px] font-bold transition ${
            activeTab === "floor" ? "bg-sky-600 text-white" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <LayoutGrid size={16} />
          <span>Floor Plan</span>
        </button>
        <button
          onClick={() => setActiveTab("kots")}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-lg text-[10px] font-bold transition ${
            activeTab === "kots" ? "bg-sky-600 text-white" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <ChefHat size={16} />
          <span>KOTs ({runningOrders.length})</span>
        </button>
      </div>

      {/* Desktop Main Navigation Tabs */}
      <div className="hidden md:flex items-center justify-between px-6 pt-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveTab("floor")}
            className={`min-h-[38px] px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "floor" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <LayoutGrid size={14} /> Floor Plan Grid
          </button>
          <button
            onClick={() => setActiveTab("order")}
            className={`min-h-[38px] px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "order" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Utensils size={14} /> Take Order (Table {selectedTable})
          </button>
          <button
            onClick={() => setActiveTab("kots")}
            className={`min-h-[38px] px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "kots" ? "bg-sky-600 text-white shadow-2xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <ChefHat size={14} /> Active KOT Streams ({runningOrders.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="p-3 sm:p-5 max-w-7xl mx-auto space-y-4">
        {/* TAB 1: NEW ORDER PAD */}
        {activeTab === "order" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Catalog Column (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              {/* Category Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-xl shadow-2xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "all"
                      ? "bg-sky-600 text-white shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 text-slate-700"
                  }`}
                >
                  <Utensils size={13} /> All Items
                </button>

                {categories.map((cat) => {
                  const isSelected = String(selectedCategory) === String(cat.id) || String(selectedCategory) === String(cat.name);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-sky-600 text-white shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 text-slate-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectItem(prod)}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs hover:border-sky-500 transition text-left flex flex-col justify-between min-h-[110px] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white leading-snug">
                          {prod.name}
                        </span>
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${prod.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium">{prod.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                        ₹{prod.selling_price || prod.basePrice}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        + Add
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Summary Column (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Utensils size={15} className="text-sky-600" /> Order Cart — Table {selectedTable}
                  </h3>
                  <span className="text-2xs font-mono font-bold text-slate-500">{cart.length} Items</span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <Utensils size={28} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">Order Cart Empty</p>
                    <p className="text-[11px] text-slate-400">Select dishes from the menu catalog to begin.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.cartKey} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">{item.name}</span>
                          <span className="font-mono text-2xs text-slate-500">₹{item.unitPrice} each</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateQuantity(item.cartKey, -1)} className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                            -
                          </button>
                          <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartKey, 1)} className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rule 4, 19 & 20: Primary Dispatch Button (Sky Blue) */}
              <div className="pt-3 border-t border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500">Grand Total (incl. tax):</span>
                  <span className="text-base font-black text-sky-600 dark:text-sky-400">₹{grandTotal}</span>
                </div>

                <button
                  onClick={handleDispatchOrder}
                  disabled={cart.length === 0 || isSubmittingOrder}
                  className="w-full min-h-[44px] py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>DISPATCH ORDER TO KITCHEN</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLOOR PLAN GRID */}
        {activeTab === "floor" && (
          <TableFloorGrid
            tables={tables}
            runningOrders={runningOrders}
            selectedTable={selectedTable}
            onSelectTable={(tblNum) => {
              setSelectedTable(tblNum);
              setActiveTab("order");
            }}
          />
        )}

        {/* TAB 3: RUNNING KOTS */}
        {activeTab === "kots" && (
          <ActiveOrdersTracker orders={runningOrders} />
        )}
      </main>

      {/* Rule 18 & 43: Sticky Footer Bar */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-6 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-md flex justify-between items-center text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 shadow-2xs z-30">
        <div className="flex items-center gap-4">
          <span>Active Table: <strong className="text-slate-900 dark:text-white font-extrabold">Table {selectedTable}</strong></span>
          <span>Running Orders: <strong className="text-sky-700 dark:text-sky-400 font-extrabold">{runningOrders.length}</strong></span>
        </div>

        <div className="bg-sky-600 text-white px-3 py-1 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          <span>WAITER SYNC ACTIVE • POSTGRESQL LIVE SSOT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
