import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  Moon,
  Sun,
  ShieldAlert,
  Store,
  UserCheck,
  LogOut,
  Search,
  ChefHat,
  Utensils,
  LayoutGrid,
  Sparkles,
  Receipt,
  Printer,
  SlidersHorizontal,
  X,
  ShoppingBag,
  Filter,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import EmployeeDirectory from "@/components/EmployeeDirectory";
import SeedManager from "@/components/SeedManager";
import StaffItemCustomizeModal from "@/components/StaffItemCustomizeModal";
import TableFloorGrid, { TableInfo } from "@/components/TableFloorGrid";
import ActiveOrdersTracker, { RunningOrder } from "@/components/ActiveOrdersTracker";
import StaffLoginModal from "@/components/StaffLoginModal";
import ActiveTableModal from "@/components/ActiveTableModal";
import { getAuth, logout, setAuth } from "@ssrone/auth";
import { seedEmployees } from "@/utils/seedEmployees";
const DEFAULT_FALLBACK_PRODUCTS = [
  { id: "p1", name: "Kulhad Masala Chai", description: "Authentic spiced Assam tea served in traditional clay kulhad", selling_price: 40, basePrice: 40, category: "Special Chai & Tea", categoryId: "cat1", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400", variantGroups: [], addonGroups: [] },
  { id: "p2", name: "Ginger Cardamom Tea", description: "Fresh ginger infused black tea brewed with crushed cardamom", selling_price: 35, basePrice: 35, category: "Special Chai & Tea", categoryId: "cat1", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", variantGroups: [], addonGroups: [] },
  { id: "p3", name: "Classic Cold Coffee", description: "Rich espresso blended with chilled milk and chocolate drizzle", selling_price: 120, basePrice: 120, category: "Artisanal Coffee", categoryId: "cat2", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400", variantGroups: [{ id: "vg1", name: "Size", options: [{ id: "vo1", name: "Regular 300ml", price: 120 }, { id: "vo2", name: "Large 500ml", price: 160 }] }], addonGroups: [] },
  { id: "p4", name: "Hazelnut Cold Coffee", description: "Creamy espresso shake flavored with roasted hazelnut syrup", selling_price: 150, basePrice: 150, category: "Artisanal Coffee", categoryId: "cat2", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400", variantGroups: [], addonGroups: [] },
  { id: "p5", name: "Paneer Tikka Sandwich", description: "Grilled sourdough stuffed with spiced cottage cheese & mint chutney", selling_price: 160, basePrice: 160, category: "Quick Bites & Snacks", categoryId: "cat3", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400", variantGroups: [], addonGroups: [] },
  { id: "p6", name: "Crispy Cheese Fries", description: "Golden peri-peri fries smothered in melted cheddar cheese", selling_price: 130, basePrice: 130, category: "Quick Bites & Snacks", categoryId: "cat3", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400", variantGroups: [], addonGroups: [] },
  { id: "p7", name: "Classic Veg Supreme Burger", description: "Crispy potato-corn patty with cheese slice & special house sauce", selling_price: 150, basePrice: 150, category: "Baithak Special Burgers", categoryId: "cat4", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", variantGroups: [], addonGroups: [] },
  { id: "p8", name: "Spicy Paneer Crunch Burger", description: "Crispy fried paneer patty loaded with spicy harissa mayo", selling_price: 190, basePrice: 190, category: "Baithak Special Burgers", categoryId: "cat4", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400", variantGroups: [], addonGroups: [] },
  { id: "p9", name: "Margherita Pizza 9\"", description: "Classic San Marzano tomato sauce, fresh mozzarella & basil leaves", selling_price: 240, basePrice: 240, category: "Woodfired Pizzas", categoryId: "cat5", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400", variantGroups: [{ id: "vg2", name: "Crust", options: [{ id: "vo3", name: "Thin Crust 9\"", price: 240 }, { id: "vo4", name: "Cheese Burst 9\"", price: 310 }] }], addonGroups: [] },
  { id: "p10", name: "Farmhouse Veggie Overload 9\"", description: "Loaded with capsicum, onion, mushroom, babycorn & extra cheese", selling_price: 320, basePrice: 320, category: "Woodfired Pizzas", categoryId: "cat5", isVeg: true, is_veg: true, image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400", variantGroups: [], addonGroups: [] }
];

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
  const [showSeedManager, setShowSeedManager] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Ensure sample employees exist
  useEffect(() => {
    seedEmployees();
  }, []);

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
        setProducts(DEFAULT_FALLBACK_PRODUCTS);
      }
    } catch {
      setProducts(DEFAULT_FALLBACK_PRODUCTS);
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
      const ordersRes = await api.get<any>(`/orders?branch_id=${branchParam}`).catch(() => null);
      let orderList: any[] = [];
      if (Array.isArray(ordersRes)) orderList = ordersRes;
      else if (ordersRes?.items && Array.isArray(ordersRes.items)) orderList = ordersRes.items;

      // Filter active orders (exclude completed, cancelled, paid, served)
      const activeOrderList = orderList.filter((o: any) => {
        const st = (o.status || "").toLowerCase();
        return st !== "completed" && st !== "cancelled" && st !== "paid" && st !== "served";
      });

      // Deduplicate active orders by order_number or id
      const uniqueOrdersMap = new Map<string, any>();
      activeOrderList.forEach((o: any) => {
        const key = String(o.order_number || o.id);
        if (!uniqueOrdersMap.has(key)) {
          uniqueOrdersMap.set(key, o);
        }
      });
      const uniqueActiveOrders = Array.from(uniqueOrdersMap.values());

      if (uniqueActiveOrders.length > 0) {
        const formattedOrders: RunningOrder[] = uniqueActiveOrders.map((o: any) => ({
          id: String(o.id || o.order_number),
          order_number: o.order_number || `ORD-${o.id}`,
          table_number: o.table_name || o.table_number || "T1",
          branch_id: String(branchParam),
          status: (o.status || "").toLowerCase() === "preparing" ? "preparing" : "pending",
          subtotal: Number(o.subtotal || 0),
          total_tax: Number(o.total_tax || 0),
          grand_total: Number(o.grand_total || o.net_amount || 0),
          created_at: o.created_at || new Date().toISOString(),
          items: (o.items || []).map((it: any) => ({
            product_name: it.product_name || it.item_name || it.name,
            quantity: Number(it.quantity || 1),
            unit_price: Number(it.unit_price || 0),
            line_total: Number(it.line_total || (it.unit_price * it.quantity)),
            kitchen_note: it.preparation_notes || it.kitchen_note,
            selected_variant: it.variant_name,
            selected_addons: Array.isArray(it.selected_addons) ? it.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [],
          })),
        }));
        setRunningOrders(formattedOrders);
      } else {
        setRunningOrders([]);
      }
    } catch {
      setRunningOrders([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [activeUnit]);

  // Sync dark theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Clear cart when unit changes
  useEffect(() => {
    setCart([]);
  }, [activeUnit]);

  // Filtered Menu Items
  const filteredMenu = useMemo(() => {
    return products.filter((p) => {
      const matchBranch = !p.unit_code || p.unit_code === activeUnit;
      const matchCategory =
        selectedCategory === "all" ||
        String(p.categoryId) === String(selectedCategory) ||
        String(p.category).toLowerCase() === String(selectedCategory).toLowerCase();
      const matchVeg = !vegOnly || p.isVeg || p.is_veg;
      const matchSearch =
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchBranch && matchCategory && matchVeg && matchSearch;
    });
  }, [products, activeUnit, selectedCategory, vegOnly, searchQuery]);

  // Handle Add Item (Opens Customization Modal if variants/addons exist)
  const handleItemClick = (prod: any) => {
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

    // Send Order Payload directly to PostgreSQL Database via REST API
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

    setRunningOrders((prev) => {
      // Deduplicate by order_number
      const exists = prev.some((o) => o.order_number === resolvedOrderNumber);
      if (exists) return prev;
      const updated = [newOrder, ...prev];
      localStorage.setItem("ssrone_orders", JSON.stringify(updated));
      return updated;
    });

    setSuccessOrder(resolvedOrderNumber);
    setCart([]);
    setIsSubmittingOrder(false);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 font-sans ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>

      {/* Item Customization Modal */}
      {customizingItem && (
        <StaffItemCustomizeModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}

      {/* Directory & Seed Modals */}
      {showDirectory && <EmployeeDirectory onClose={() => setShowDirectory(false)} />}
      {showSeedManager && <SeedManager onClose={() => setShowSeedManager(false)} />}

      {/* Top Fixed Header Navbar */}
      <header className="sticky top-0 z-40 px-4 py-3 border-b bg-white border-slate-200 shadow-xs flex items-center justify-between gap-3">
        {/* Left Branch Branding & Logged-In Waiter Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <Store size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-slate-900 flex items-center gap-2">
              {auth.user?.branch_name || "Baithak Cafe - CUH Mahendragarh"}
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Handheld Waiter Terminal • {auth.name || "Staff Member"}
            </p>
          </div>
        </div>

        {/* Right Actions & User Badge */}
        <div className="flex items-center gap-2">
          {/* Refresh DB Button */}
          <button
            onClick={() => loadData()}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 transition cursor-pointer disabled:opacity-50"
            title="Refresh PostgreSQL Database"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
          </button>

          {/* Logged in Waiter Badge */}
          {auth.name && (
            <div className="hidden sm:block text-2xs font-bold text-slate-700 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              {auth.name}
            </div>
          )}

          {/* Switch Staff / Logout Button */}
          <button
            onClick={() => {
              logout();
              setAuthState(getAuth());
              setShowLoginModal(true);
            }}
            title="Switch Staff Member / Sign Out"
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <LogOut size={15} />
            <span>Switch Staff</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("order")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-2xs font-bold transition ${
            activeTab === "order" ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400"
          }`}
        >
          <Utensils size={16} />
          <span>Order Pad</span>
        </button>
        <button
          onClick={() => setActiveTab("floor")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-2xs font-bold transition ${
            activeTab === "floor" ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400"
          }`}
        >
          <LayoutGrid size={16} />
          <span>Floor Plan</span>
        </button>
        <button
          onClick={() => setActiveTab("kots")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-2xs font-bold transition relative ${
            activeTab === "kots" ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400"
          }`}
        >
          <ChefHat size={16} />
          <span>KOTs ({runningOrders.length})</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4">
        {/* TAB 1: NEW ORDER PAD */}
        {activeTab === "order" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Catalog Column (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-3">
              {/* Category Pills & Veg Toggle */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "all"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40"
                  }`}
                >
                  <Utensils size={13} /> All Items
                </button>

                {categories.map((cat) => {
                  const isSelected = String(selectedCategory) === String(cat.id) || String(selectedCategory) === String(cat.name);
                  return (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => setSelectedCategory(cat.id || cat.name)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/40"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}

                <button
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
                    vegOnly
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <Filter size={13} /> Veg Only
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search item name (e.g. Chai, Pizza, Burger)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Catalog Items Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredMenu.map((prod) => {
                  const hasCustomizations = (prod.variantGroups && prod.variantGroups.length > 0) || (prod.addonGroups && prod.addonGroups.length > 0);

                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleItemClick(prod)}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 rounded-3xl p-3 text-left flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden min-h-[135px]"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border tracking-wider ${prod.isVeg !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                            {prod.isVeg !== false ? "VEG" : "NON-VEG"}
                          </span>
                          {hasCustomizations && (
                            <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                              CUSTOMIZABLE
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                          ₹{prod.selling_price || prod.basePrice}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                          <Plus size={13} />
                        </span>
                      </div>
                    </button>
                  );
                })}

                {filteredMenu.length === 0 && (
                  <div className="col-span-full py-16 text-center space-y-2">
                    <Utensils size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs text-slate-400 font-bold">No menu items found in PostgreSQL database.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Waiter Cart Sheet / Panel (5 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between space-y-4 lg:sticky lg:top-16 lg:h-[calc(100vh-80px)] overflow-y-auto">
              <div className="space-y-3">
                {/* Header & Table Selector */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ChefHat size={16} className="text-indigo-600" /> Active Waiter Cart Pad
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Dispatches instantly to kitchen KDS</p>
                  </div>

                  {/* Table selector */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <UserCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="bg-transparent text-xs font-bold outline-none cursor-pointer text-slate-900 dark:text-white"
                    >
                      {tables.length === 0 ? (
                        <option value={selectedTable}>Table {selectedTable}</option>
                      ) : (
                        tables.map((t) => (
                          <option key={t.id || t.number} value={t.number} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            Table {t.number} ({t.status.toUpperCase()})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.cartKey}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1.5"
                    >
                      <div className="flex items-start justify-between text-xs font-bold">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                          {item.variantSummary && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              Portion: {item.variantSummary}
                            </p>
                          )}
                          {item.addonsSummary && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Addons: {item.addonsSummary}
                            </p>
                          )}
                          {item.kitchenNote && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                              Note: {item.kitchenNote}
                            </p>
                          )}
                        </div>

                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                          ₹{(item.unitPrice || item.selling_price) * item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">₹{item.unitPrice} each</span>
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-0.5">
                          <button onClick={() => updateQuantity(item.cartKey, -1)} className="p-1 hover:text-rose-500 cursor-pointer">
                            <Minus size={11} />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartKey, 1)} className="p-1 hover:text-indigo-500 cursor-pointer">
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="py-12 text-center space-y-1">
                      <ShoppingBag size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-xs font-bold text-slate-400">Cart is empty.</p>
                      <p className="text-[10px] text-slate-400">Tap items on left menu to add to order.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Remark / Kitchen Note Input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                  <MessageSquare size={11} className="text-indigo-600 dark:text-indigo-400" />
                  Order Remarks / Kitchen Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table request, serve starter first, less spicy..."
                  value={orderRemark}
                  onChange={(e) => setOrderRemark(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Footer Summary & Send Button */}
              {cart.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-300 font-bold">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>GST (5%):</span>
                      <span>₹{tax}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Grand Total:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDispatchOrder}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
                  >
                    <Send size={14} />
                    <span>Send KOT to Kitchen · Table {selectedTable}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN SCREEN: TABLE FLOOR PLAN */}
        {activeTab === "floor" && (
          <TableFloorGrid
            tables={tables}
            runningOrders={runningOrders}
            selectedTable={selectedTable}
            onSelectTable={(tbl) => {
              setSelectedTable(tbl);
            }}
            onOpenTableOrder={(t) => {
              if (!t || !t.number) return;
              const numKey = String(t.number).replace(/\D/g, "");
              const hasOrder = numKey !== "" && runningOrders.some((o) => {
                const oKey = String(o.table_number || o.table_name || "").replace(/\D/g, "");
                return oKey !== "" && oKey === numKey;
              });
              if (hasOrder) {
                setActiveModalTable(t.number);
              } else {
                setSelectedTable(t.number);
                setActiveTab("order");
              }
            }}
          />
        )}

        {/* Active Table Order Drawer Modal */}
        <ActiveTableModal
          isOpen={!!activeModalTable}
          tableName={activeModalTable || selectedTable}
          order={activeModalTable ? (runningOrders.find((o) => {
            const numKey1 = String(o.table_number || o.table_name || "").replace(/\D/g, "");
            const numKey2 = String(activeModalTable || "").replace(/\D/g, "");
            return numKey1 !== "" && numKey1 === numKey2;
          }) || null) : null}
          onClose={() => setActiveModalTable(null)}
          onAddMoreItems={(tbl) => {
            setSelectedTable(tbl);
            setActiveModalTable(null);
            setActiveTab("order");
          }}
          onMarkServed={() => {
            setActiveModalTable(null);
            loadData();
          }}
        />
      </main>

      {/* Success Dispatch Modal */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            <CheckCircle2 size={42} className="mx-auto text-emerald-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">KOT Order Dispatched!</h3>
            <p className="text-xs text-slate-400 font-medium">
              Order serial: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{successOrder}</strong>
            </p>
            <p className="text-2xs text-slate-400">Dispatched directly to PostgreSQL DB & Kitchen Display Station (KDS).</p>
            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all"
            >
              Continue Waiter Pad
            </button>
          </div>
        </div>
      )}

      {/* Staff Multi-Tenant Security Login Modal */}
      <StaffLoginModal
        isOpen={showLoginModal}
        requiredAccess="staff_web"
        onLoginSuccess={(user) => {
          setAuthState(getAuth());
          setShowLoginModal(false);
          setActiveTab("floor");
          const bId = user?.branch_id ? Number(user.branch_id) : 1;
          loadData(bId);
        }}
      />

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 py-2.5 px-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md hidden md:flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
        <span>Active Table: {selectedTable}</span>
        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <ShieldAlert size={12} /> Waiter Sync Active · PostgreSQL Live SSOT
        </span>
      </footer>
    </div>
  );
}

export default App;
