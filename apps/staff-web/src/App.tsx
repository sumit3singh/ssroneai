import React, { useState, useEffect } from "react";
import {
  Store,
  Tablet,
  LayoutGrid,
  Utensils,
  ChefHat,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Receipt,
  Sparkles,
  Volume2
} from "lucide-react";
import { PosTopBar } from "@/components/PosTopBar";
import { PosCategorySidebar } from "@/components/PosCategorySidebar";
import { PosMenuCatalog } from "@/components/PosMenuCatalog";
import { PosLiveCart } from "@/components/PosLiveCart";
import { PosCustomizationModal } from "@/components/PosCustomizationModal";
import { PosFloorPlan } from "@/components/PosFloorPlan";
import { PosKitchenDisplay } from "@/components/PosKitchenDisplay";
import { PosCheckoutModal } from "@/components/PosCheckoutModal";
import { ThermalReceiptModal } from "@/components/ThermalReceiptModal";
import { PosTerminalHeader } from "@/components/PosTerminalHeader";
import StaffLoginModal from "@/components/StaffLoginModal";
import EmployeeDirectory from "@/components/EmployeeDirectory";
import { RunningOrder } from "@/components/ActiveOrdersTracker";
import { StaffDashboardHub } from "@/components/StaffDashboardHub";
import { StaffLedgerView } from "@/components/StaffLedgerView";
import { StaffIndentModal } from "@/components/StaffIndentModal";
import { LockConfirmModal } from "@/components/LockConfirmModal";

import { useStaffPOS, MenuItem, TableItem } from "@/stores/useStaffPOSStore";
import { sound } from "@/utils/audioFeedback";
import { getAuth, logout, setAuth } from "@ssrone/auth";
import { api } from "@ssrone/api-client";
import {
  fetchCategories,
  fetchMenuItems,
  POS_CATEGORIES,
  COMMERCIAL_MENU_ITEMS
} from "@/utils/menuApi";

export function App() {
  const store = useStaffPOS();

  // Authentication
  const [auth, setAuthState] = useState(() => getAuth());
  const [showLoginModal, setShowLoginModal] = useState(() => !getAuth()?.isLoggedIn);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [isIndentModalOpen, setIsIndentModalOpen] = useState(false);
  const [mobilePosTab, setMobilePosTab] = useState<"menu" | "cart">("menu");

  const promptLockTerminal = () => {
    sound.tap();
    setShowLockConfirm(true);
  };

  const handleConfirmLock = () => {
    logout();
    setAuthState(getAuth());
    setShowLockConfirm(false);
    setShowLoginModal(true);
  };

  // Data states - Initialize with real 28 tables of ssrone
  const [products, setProducts] = useState<MenuItem[]>(COMMERCIAL_MENU_ITEMS);
  const [categories, setCategories] = useState<any[]>(POS_CATEGORIES);
  const [tables, setTables] = useState<TableItem[]>(() => {
    const list: TableItem[] = [];
    // 1. Cabin (10): C-1 to C-10
    for (let i = 1; i <= 10; i++) {
      const isOcc = [2, 5, 7, 8, 10].includes(i);
      list.push({
        id: i,
        number: `C-${i}`,
        capacity: 4,
        status: isOcc ? "occupied" : "available",
        section: "Cabin",
        floor: "Cabin",
        running_total: i === 2 ? 170 : i === 5 ? 440 : i === 7 ? 210 : i === 8 ? 320 : i === 10 ? 680 : undefined,
      });
    }
    // 2. Open Area (6): O-1 to O-6
    for (let i = 1; i <= 6; i++) {
      const isOcc = [1, 4].includes(i);
      list.push({
        id: 10 + i,
        number: `O-${i}`,
        capacity: 6,
        status: isOcc ? "occupied" : "available",
        section: "Open Area",
        floor: "Open Area",
        running_total: i === 1 ? 280 : i === 4 ? 150 : undefined,
      });
    }
    // 3. Hall (6): H-1 to H-6
    for (let i = 1; i <= 6; i++) {
      const isOcc = i === 2;
      list.push({
        id: 16 + i,
        number: `H-${i}`,
        capacity: 4,
        status: isOcc ? "occupied" : "available",
        section: "Hall",
        floor: "Hall",
        running_total: isOcc ? 100 : undefined,
      });
    }
    // 4. Front (6): F-1 to F-6
    for (let i = 1; i <= 6; i++) {
      list.push({
        id: 22 + i,
        number: `F-${i}`,
        capacity: i <= 2 ? 2 : 4,
        status: "available",
        section: "Front",
        floor: "Front",
      });
    }
    return list;
  });

  // Initial 8 running orders matching Screenshot 1 (₹2,350 revenue, 8 occupied, 20 free)
  const [runningOrders, setRunningOrders] = useState<RunningOrder[]>([
    {
      id: "ord-56",
      order_number: "ORD-0056",
      table_number: "C-2",
      branch_id: "1",
      status: "confirmed",
      subtotal: 170,
      total_tax: 0,
      grand_total: 170,
      created_at: new Date(Date.now() - 14 * 60000).toISOString(),
      waiter_name: "Sumit",
      items: [
        { product_name: "Veg Steam Momos (Full)", quantity: 1, unit_price: 170, line_total: 170 },
      ],
    },
    {
      id: "ord-49",
      order_number: "ORD-0049",
      table_number: "C-5",
      branch_id: "1",
      status: "confirmed",
      subtotal: 440,
      total_tax: 0,
      grand_total: 440,
      created_at: new Date(Date.now() - 32 * 60000).toISOString(),
      waiter_name: "Aman",
      items: [
        { product_name: "Paneer Butter Masala", quantity: 1, unit_price: 260, line_total: 260 },
        { product_name: "Butter Naan", quantity: 3, unit_price: 60, line_total: 180 },
      ],
    },
    {
      id: "ord-51",
      order_number: "ORD-0051",
      table_number: "C-7",
      branch_id: "1",
      status: "confirmed",
      subtotal: 210,
      total_tax: 0,
      grand_total: 210,
      created_at: new Date(Date.now() - 20 * 60000).toISOString(),
      waiter_name: "Sumit",
      items: [
        { product_name: "Veg Hakka Noodles", quantity: 1, unit_price: 140, line_total: 140 },
        { product_name: "Cold Coffee", quantity: 1, unit_price: 70, line_total: 70 },
      ],
    },
    {
      id: "ord-52",
      order_number: "ORD-0052",
      table_number: "C-8",
      branch_id: "1",
      status: "confirmed",
      subtotal: 320,
      total_tax: 0,
      grand_total: 320,
      created_at: new Date(Date.now() - 18 * 60000).toISOString(),
      waiter_name: "Aman",
      items: [
        { product_name: "Farmhouse Pizza", quantity: 1, unit_price: 240, line_total: 240 },
        { product_name: "French Fries", quantity: 1, unit_price: 80, line_total: 80 },
      ],
    },
    {
      id: "ord-44",
      order_number: "ORD-0044",
      table_number: "C-10",
      branch_id: "1",
      status: "confirmed",
      subtotal: 680,
      total_tax: 0,
      grand_total: 680,
      created_at: new Date(Date.now() - 40 * 60000).toISOString(),
      waiter_name: "Sumit",
      items: [
        { product_name: "Special Thali Combo", quantity: 2, unit_price: 340, line_total: 680 },
      ],
    },
    {
      id: "ord-48",
      order_number: "ORD-0048",
      table_number: "C-10",
      branch_id: "1",
      status: "confirmed",
      subtotal: 180,
      total_tax: 0,
      grand_total: 180,
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      waiter_name: "Sumit",
      items: [
        { product_name: "Paneer Tikka Roll", quantity: 1, unit_price: 180, line_total: 180 },
      ],
    },
    {
      id: "ord-19",
      order_number: "ORD-0019",
      table_number: "O-1",
      branch_id: "1",
      status: "confirmed",
      subtotal: 280,
      total_tax: 0,
      grand_total: 280,
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      waiter_name: "Aman",
      items: [
        { product_name: "Chilli Paneer Gravy", quantity: 1, unit_price: 200, line_total: 200 },
        { product_name: "Fried Rice", quantity: 1, unit_price: 80, line_total: 80 },
      ],
    },
    {
      id: "ord-23",
      order_number: "ORD-0023",
      table_number: "O-4",
      branch_id: "1",
      status: "confirmed",
      subtotal: 150,
      total_tax: 0,
      grand_total: 150,
      created_at: new Date(Date.now() - 12 * 60000).toISOString(),
      waiter_name: "Sumit",
      items: [
        { product_name: "Spring Rolls", quantity: 1, unit_price: 150, line_total: 150 },
      ],
    },
    {
      id: "ord-31",
      order_number: "ORD-0031",
      table_number: "H-2",
      branch_id: "1",
      status: "confirmed",
      subtotal: 100,
      total_tax: 0,
      grand_total: 100,
      created_at: new Date(Date.now() - 8 * 60000).toISOString(),
      waiter_name: "Aman",
      items: [
        { product_name: "Veg Grilled Sandwich", quantity: 1, unit_price: 100, line_total: 100 },
      ],
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [successOrderBanner, setSuccessOrderBanner] = useState<any | null>(null);

  // Sync auth state
  useEffect(() => {
    const onStorage = () => setAuthState(getAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Fetch live tables, menu items, and running orders from backend
  const loadData = async (overrideBranchId?: number) => {
    setIsRefreshing(true);
    const currentAuth = getAuth();
    const branchParam =
      overrideBranchId ??
      (currentAuth?.user?.branch_id
        ? Number(currentAuth.user.branch_id)
        : Number(localStorage.getItem("active_branch_id") || 1));

    try {
      // 1. Menu items
      const itemsRes = await fetchMenuItems(branchParam);
      if (Array.isArray(itemsRes) && itemsRes.length > 0) {
        setProducts(itemsRes);
      }
    } catch (err) {
      console.warn("Failed fetching products:", err);
    }

    try {
      // 2. Categories
      const catsRes = await fetchCategories(branchParam);
      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setCategories(catsRes);
      }
    } catch (err) {
      console.warn("Failed fetching categories:", err);
    }

    try {
      // 3. Live Running orders
      const ordersRes = await api.get<any>(`/orders?branch_id=${branchParam}&page_size=50`).catch(() => null);
      let orderList: any[] = [];
      if (Array.isArray(ordersRes)) orderList = ordersRes;
      else if (ordersRes?.items && Array.isArray(ordersRes.items)) orderList = ordersRes.items;

      let formattedOrders: RunningOrder[] = [];
      const activeOrderTableMap = new Map<string, RunningOrder>();

      if (orderList.length > 0) {
        formattedOrders = orderList.map((o: any) => ({
          id: String(o.id || o.order_number),
          order_number: o.order_number || `ORD-${o.id}`,
          table_number: o.table_name || (o.table_id ? `Table #${o.table_id}` : "C-1"),
          table_id: o.table_id,
          branch_id: String(o.branch_id || branchParam),
          status: (o.status || "pending").toLowerCase(),
          subtotal: Number(o.subtotal || o.net_amount || 0),
          total_tax: Number(o.tax_amount || 0),
          grand_total: Number(o.net_amount || o.subtotal || 0),
          created_at: o.created_at || new Date().toISOString(),
          waiter_name: o.server_name || o.waiter_name || auth.name || "Captain Sumit",
          items: (o.items || []).map((it: any) => ({
            product_name: it.product_name || it.item_name || it.name || "Dish Item",
            quantity: Number(it.quantity || 1),
            unit_price: Number(it.unit_price || it.price || 0),
            line_total: Number(it.total_price || (it.unit_price || 0) * (it.quantity || 1)),
            selected_variant: it.variant_name || (it.selected_variant ? it.selected_variant.name : undefined),
            selected_addons: Array.isArray(it.selected_addons) ? it.selected_addons.map((a: any) => typeof a === "string" ? a : a.name) : [],
            kitchen_note: it.preparation_notes || it.kitchen_note,
          })),
        }));
        setRunningOrders(formattedOrders);

        // Record which tables have active orders
        formattedOrders.forEach((o) => {
          const s = String(o.status || "").toLowerCase();
          if (s !== "completed" && s !== "cancelled" && s !== "paid") {
            if (o.table_number) activeOrderTableMap.set(o.table_number.toLowerCase().trim(), o);
            if ((o as any).table_id) activeOrderTableMap.set(`id_${(o as any).table_id}`, o);
          }
        });
      } else {
        setRunningOrders([]);
      }

      // 4. Tables
      const tablesRes = await api.get<any>(`/restaurant/tables?branch_id=${branchParam}`).catch(() => null);
      let tableList: any[] = [];
      if (Array.isArray(tablesRes)) tableList = tablesRes;
      else if (tablesRes?.items && Array.isArray(tablesRes.items)) tableList = tablesRes.items;

      if (tableList.length > 0) {
        const formattedTables: TableItem[] = tableList.map((t: any) => {
          const num = t.table_number || t.name || t.code || `T${t.id}`;
          const activeOrder = activeOrderTableMap.get(num.toLowerCase().trim()) || activeOrderTableMap.get(`id_${t.id}`);
          const isOccupied = !!activeOrder;

          return {
            id: String(t.id),
            number: num,
            capacity: t.capacity || 4,
            status: isOccupied ? "occupied" : "available",
            section: t.floor || t.section || "Main Dining",
            floor: t.floor || t.section || "Main Dining",
            guests: isOccupied ? 2 : undefined,
            running_total: activeOrder?.grand_total,
            active_order_id: activeOrder?.order_number,
          };
        });
        setTables(formattedTables);
      }
    } catch (err) {
      console.warn("Failed fetching POS backend data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Compute category item counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const key = p.category || "Other";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Handle dish tap in catalog
  const handleSelectMenuItem = (item: MenuItem, variant?: any) => {
    if (variant) {
      store.addToCart(item, variant);
      return;
    }
    const hasVariants = item.variantGroups && item.variantGroups.length > 0;
    const hasAddons = item.addonGroups && item.addonGroups.length > 0;

    if (hasVariants || hasAddons) {
      sound.tap();
      setCustomizingItem(item);
    } else {
      store.addToCart(item);
    }
  };

  // Handle customized item confirm
  const handleConfirmCustomization = (customizedItem: any) => {
    store.addToCart(
      customizedItem,
      customizedItem.selectedVariant,
      customizedItem.selectedAddons,
      customizedItem.kitchenNote
    );
  };

  // Quick add item by code or multiplier syntax (e.g. 5*1)
  const handleQuickAddItemByCode = (code: string, multiplier: number = 1) => {
    sound.tap();
    const item = products.find(
      (p) => String(p.id) === code || p.code?.toLowerCase() === code.toLowerCase()
    );
    if (item) {
      for (let i = 0; i < multiplier; i++) {
        store.addToCart(item);
      }
    }
  };

  // Dispatch KOT order to Kitchen & Backend
  const handleDispatchKOT = async () => {
    if (store.cart.length === 0 || isSubmittingOrder) return;
    setIsSubmittingOrder(true);

    const subtotal = store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const discountAmount = Math.round((subtotal * store.discountPercent) / 100);
    const taxable = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxable * 0.05);
    const grandTotal = taxable + tax;

    const branchParam = auth.user?.branch_id ? Number(auth.user.branch_id) : 1;

    const apiPayload = {
      branch_id: branchParam,
      table_name: store.selectedTable,
      table_id: parseInt(store.selectedTable.replace(/\D/g, ""), 10) || 1,
      order_type: store.orderType,
      source_channel: "pos",
      status: "CONFIRMED",
      subtotal,
      tax_amount: tax,
      net_amount: grandTotal,
      notes: store.orderRemark
        ? `Table ${store.selectedTable}: ${store.orderRemark}`
        : `Table ${store.selectedTable} (POS Terminal)`,
      items: store.cart.map((it) => ({
        product_id: parseInt(it.id.replace(/\D/g, ""), 10) || 1,
        product_name: it.name,
        name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        variant_name: it.selectedVariant?.name || undefined,
        addons: it.selectedAddons?.map((a) => a.name) || [],
        preparation_notes: it.kitchenNote || undefined,
      })),
    };

    let resolvedOrderNumber = `2627-KOT-${String(Date.now()).slice(-4)}`;

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
      table_number: store.selectedTable,
      branch_id: String(branchParam),
      status: "confirmed",
      subtotal,
      total_tax: tax,
      grand_total: grandTotal,
      created_at: new Date().toISOString(),
      waiter_name: auth.name || "Captain Sumit",
      items: store.cart.map((it) => ({
        product_name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        line_total: it.unitPrice * it.quantity,
        selected_variant: it.selectedVariant?.name,
        selected_addons: it.selectedAddons?.map((a) => a.name),
        kitchen_note: it.kitchenNote,
      })),
    };

    // Update running orders list
    setRunningOrders((prev) => [newOrder, ...prev]);

    // Update table status in floor plan
    setTables((prev) =>
      prev.map((t) =>
        t.number === store.selectedTable
          ? { ...t, status: "occupied", guests: store.guestCount, running_total: grandTotal }
          : t
      )
    );

    // Play triumphant KOT sound
    sound.kotDispatched();

    // Trigger success notification
    const bannerData = {
      orderNumber: resolvedOrderNumber,
      tableName: store.selectedTable,
      grandTotal,
      itemsCount: store.cart.length,
      cartSnapshot: [...store.cart],
      subtotal,
      tax,
    };
    setSuccessOrderBanner(bannerData);

    // Clear cart and reset remark
    store.clearCart();
    setIsSubmittingOrder(false);

    // Auto-dismiss banner after 6s
    setTimeout(() => {
      setSuccessOrderBanner(null);
    }, 6000);
  };

  // Open thermal receipt modal
  const handleOpenPrintPreview = () => {
    if (store.cart.length === 0) return;
    const subtotal = store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const discount = Math.round((subtotal * store.discountPercent) / 100);
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.05);

    store.setReceiptModalData({
      orderNumber: `PREVIEW-${store.selectedTable}`,
      tableName: store.selectedTable,
      guests: store.guestCount,
      waiterName: auth.name || "Captain Sumit",
      branchName: auth.user?.branch_name || "SSR One Restaurant",
      items: store.cart.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.unitPrice,
        variant: it.selectedVariant?.name,
        addons: it.selectedAddons?.map((a) => a.name),
        note: it.kitchenNote,
      })),
      subtotal,
      tax,
      total: taxable + tax,
      orderType: store.orderType,
      createdAt: new Date().toISOString(),
      orderRemark: store.orderRemark,
    });
  };

  // Open checkout modal
  const handleOpenCheckout = () => {
    if (store.cart.length === 0) return;
    store.setIsCheckoutOpen(true);
  };

  // Handle successful checkout
  const handlePaymentSuccess = (paymentDetails: any) => {
    const subtotal = store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const discount = Math.round((subtotal * store.discountPercent) / 100);
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.05);
    const grandTotal = taxable + tax;

    // Show thermal receipt
    store.setReceiptModalData({
      orderNumber: `BILL-${store.selectedTable}-${Date.now().toString().slice(-4)}`,
      tableName: store.selectedTable,
      guests: store.guestCount,
      waiterName: auth.name || "Captain Sumit",
      branchName: auth.user?.branch_name || "SSR One Restaurant",
      items: store.cart.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.unitPrice,
        variant: it.selectedVariant?.name,
        addons: it.selectedAddons?.map((a) => a.name),
        note: it.kitchenNote,
      })),
      subtotal,
      tax,
      total: grandTotal,
      orderType: store.orderType,
      createdAt: new Date().toISOString(),
    });

    // Reset table status to available
    setTables((prev) =>
      prev.map((t) =>
        t.number === store.selectedTable
          ? { ...t, status: "available", running_total: 0, guests: 0 }
          : t
      )
    );

    // Close checkout and clear cart
    store.setIsCheckoutOpen(false);
    store.clearCart();
  };

  // Recall active order into cart to add more items or edit (Admin-Web Parity)
  const handleRecallOrderToCart = (order: RunningOrder) => {
    sound.tap();
    store.clearCart();
    store.setSelectedTable(order.table_number || "C-1");
    store.setOrderType("dine_in");

    (order.items || []).forEach((it: any) => {
      const mockItem: MenuItem = {
        id: `rec-${Math.random().toString(36).slice(2, 7)}`,
        name: it.product_name || it.item_name || "Dish",
        category: "All",
        categoryId: "all",
        basePrice: it.unit_price,
        selling_price: it.unit_price,
        isVeg: true,
      };
      const variant = it.selected_variant ? { id: "var", name: it.selected_variant, price: it.unit_price } : undefined;
      const addons = (it.selected_addons || []).map((a: any) => ({
        id: "add",
        name: typeof a === "string" ? a : a.name,
        price: 0,
      }));
      for (let q = 0; q < (it.quantity || 1); q++) {
        store.addToCart(mockItem, variant, addons, it.kitchen_note);
      }
    });

    store.setActiveTab("pos");
  };

  // Direct table settlement from Table Floor (Admin-Web Parity)
  const handleDirectSettleOrder = async (order: RunningOrder, paymentMethod: string, amount: number) => {
    sound.paymentSuccess();
    const branchParam = auth.user?.branch_id ? Number(auth.user.branch_id) : 1;
    const targetId = order.id ? parseInt(String(order.id).replace(/\D/g, ""), 10) || order.id : order.order_number;

    try {
      await api.patch(`/orders/${targetId}/status`, null, {
        params: {
          status: "completed",
          payment_status: "paid",
          payment_method: paymentMethod,
          amount_paid: amount,
        },
      }).catch(() => null);
    } catch (e) {
      console.warn("Settlement sync error:", e);
    }

    // Free table in local state
    setTables((prev) =>
      prev.map((t) =>
        t.number.toLowerCase() === (order.table_number || "").toLowerCase()
          ? { ...t, status: "available", running_total: 0, guests: 0 }
          : t
      )
    );

    // Remove from runningOrders
    setRunningOrders((prev) =>
      prev.filter((o) => o.order_number !== order.order_number && o.id !== order.id)
    );

    // Show thermal receipt
    store.setReceiptModalData({
      orderNumber: order.order_number,
      tableName: order.table_number,
      guests: 2,
      waiterName: order.waiter_name || auth.name || "Captain Sumit",
      branchName: auth.user?.branch_name || "Baithak Cafe",
      items: order.items.map((it: any) => ({
        name: it.product_name,
        quantity: it.quantity,
        price: it.unit_price,
        variant: it.selected_variant,
        addons: it.selected_addons,
        note: it.kitchen_note,
      })),
      subtotal: order.subtotal,
      tax: order.total_tax,
      total: order.grand_total,
      orderType: "dine_in",
      paymentMethod,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="h-screen bg-pos-bg text-pos-text font-sans select-none flex flex-col overflow-hidden">
      {/* SUCCESS KOT NOTIFICATION BANNER */}
      {successOrderBanner && (
        <div className="px-3 sm:px-5 pt-2 shrink-0 z-30">
          <div className="p-3 sm:p-4 rounded-2xl bg-pos-primary text-white font-bold flex items-center justify-between shadow-lg shadow-pos-primary/20 animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black">
                  KOT #{successOrderBanner.orderNumber} Dispatched to Kitchen!
                </p>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {successOrderBanner.itemsCount} dishes for Table {successOrderBanner.tableName} • ₹{successOrderBanner.grandTotal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  store.setReceiptModalData({
                    orderNumber: successOrderBanner.orderNumber,
                    tableName: successOrderBanner.tableName,
                    guests: store.guestCount,
                    waiterName: auth.name || "Captain Sumit",
                    branchName: auth.user?.branch_name || "Baithak Cafe",
                    items: successOrderBanner.cartSnapshot.map((it: any) => ({
                      name: it.name,
                      quantity: it.quantity,
                      price: it.unitPrice,
                      variant: it.selectedVariant?.name,
                      addons: it.selectedAddons?.map((a: any) => a.name),
                      note: it.kitchenNote,
                    })),
                    subtotal: successOrderBanner.subtotal,
                    tax: successOrderBanner.tax,
                    total: successOrderBanner.grandTotal,
                    orderType: store.orderType,
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Receipt size={13} />
                <span>View KOT</span>
              </button>

              <button
                type="button"
                onClick={() => setSuccessOrderBanner(null)}
                className="px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-xl text-xs font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE (Edge-to-Edge, Full Height Touch Ergonomics) */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* ------------------------------------------------------------------ */}
        {/* TAB 0: 3D STAFF COMMAND HUB (Landing Dashboard)                    */}
        {/* ------------------------------------------------------------------ */}
        {store.activeTab === "dashboard" && (
          <StaffDashboardHub
            authName={auth.name || "Aman"}
            branchName={auth.user?.branch_name || "Baithak Cafe"}
            tables={tables}
            runningOrders={runningOrders}
            onOpenIndent={() => setIsIndentModalOpen(true)}
            onOpenLedger={() => store.setActiveTab("ledger")}
            onLock={promptLockTerminal}
            isRefreshing={isRefreshing}
            onRefresh={() => loadData()}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: ADVANCED TABLE MANAGEMENT & LIVE FLOOR TRACKING             */}
        {/* ------------------------------------------------------------------ */}
        {store.activeTab === "floor" && (
          <PosFloorPlan
            tables={tables}
            runningOrders={runningOrders}
            authName={auth.name || "Aman"}
            branchName={auth.user?.branch_name || "Baithak Cafe"}
            openKotsCount={runningOrders.length}
            onOpenKds={() => store.setActiveTab("kots")}
            onBackToHub={() => store.setActiveTab("dashboard")}
            onLock={promptLockTerminal}
            onSelectTableForOrder={(tableNum) => {
              store.setSelectedTable(tableNum);
              store.setActiveTab("pos");
            }}
            onRecallOrderToCart={handleRecallOrderToCart}
            onSettleOrder={handleDirectSettleOrder}
            onDirectTakeaway={() => {
              store.setOrderType("takeaway");
              store.setSelectedTable("Takeaway");
              store.setActiveTab("pos");
            }}
            onDirectDelivery={() => {
              store.setOrderType("delivery");
              store.setSelectedTable("Delivery");
              store.setActiveTab("pos");
            }}
            onRefreshData={() => loadData()}
            onViewTableBill={(order) => {
              store.setReceiptModalData({
                orderNumber: order.order_number,
                tableName: order.table_number,
                waiterName: order.waiter_name || auth.name,
                branchName: auth.user?.branch_name || "Baithak Cafe",
                items: order.items.map((it: any) => ({
                  name: it.product_name,
                  quantity: it.quantity,
                  price: it.unit_price,
                  variant: it.selected_variant,
                  addons: it.selected_addons,
                  note: it.kitchen_note,
                })),
                subtotal: order.subtotal,
                tax: order.total_tax,
                total: order.grand_total,
                createdAt: order.created_at,
              });
            }}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: STAFF EMPLOYEE LEDGER (ATTENDANCE & SHIFTS)                 */}
        {/* ------------------------------------------------------------------ */}
        {store.activeTab === "ledger" && (
          <StaffLedgerView
            authName={auth.name || "Aman"}
            branchName={auth.user?.branch_name || "Baithak Cafe"}
            onBackToDashboard={() => store.setActiveTab("dashboard")}
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: THE MAIN THREE-PANEL POS INTERFACE (Touch Order Pad)        */}
        {/* ------------------------------------------------------------------ */}
        {store.activeTab === "pos" && (
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            {/* Top Terminal Header with Multiplier, Voice Ordering, Top Cats */}
            <PosTerminalHeader
              authName={auth.name || "Aman"}
              branchName={auth.user?.branch_name || "Baithak Cafe"}
              openKotsCount={runningOrders.length}
              onBackToFloor={() => store.setActiveTab("floor")}
              onOpenSettings={() => store.setActiveTab("dashboard")}
              onLockTerminal={promptLockTerminal}
              onQuickAddItemByCode={handleQuickAddItemByCode}
            />

            {/* 3 Columns Layout: Desktop / Big Touchscreen POS (lg+) shows 3 panels side-by-side; Mobile / Tablet (< lg) supports smooth Menu & Cart flipping */}
            <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden min-h-0 bg-white relative">
              {/* Left Column: Cart / Billing Panel */}
              <div className={`${mobilePosTab === "cart" ? "flex flex-col flex-1" : "hidden"} lg:flex lg:flex-col lg:flex-initial h-full min-h-0`}>
                <PosLiveCart
                  isSubmitting={isSubmittingOrder}
                  onDispatchKOT={handleDispatchKOT}
                  onOpenPrintPreview={handleOpenPrintPreview}
                  onOpenCheckout={handleOpenCheckout}
                  tables={tables}
                  onSwitchTable={(tbl) => store.setSelectedTable(tbl)}
                  waiterName={auth.name || "Aman"}
                  onBackToTables={() => store.setActiveTab("floor")}
                  openKotsCount={runningOrders.length}
                  onOpenKds={() => store.setActiveTab("kots")}
                  onMobileBackToMenu={() => setMobilePosTab("menu")}
                />
              </div>

              {/* Center Column: 5-Column Food Cards Grid with Filter Row */}
              <div className={`${mobilePosTab === "menu" ? "flex flex-1" : "hidden"} lg:flex h-full min-h-0 overflow-hidden`}>
                <PosMenuCatalog
                  products={products}
                  onSelectItem={(item, variant) => {
                    handleSelectMenuItem(item, variant);
                  }}
                />
              </div>

              {/* Right Column: Vertical Categories Rail */}
              <div className={`${mobilePosTab === "menu" ? "flex" : "hidden"} lg:flex h-full min-h-0`}>
                <PosCategorySidebar
                  categories={categories}
                  categoryCounts={categoryCounts}
                />
              </div>

              {/* Floating Bottom Quick Cart Bar for Mobile & Tablets (< lg) */}
              {mobilePosTab === "menu" && store.cart.length > 0 && (
                <div className="lg:hidden absolute bottom-3 left-3 right-3 z-30 bg-slate-900 text-white rounded-2xl p-2.5 shadow-2xl border border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      {store.cart.reduce((s, it) => s + it.quantity, 0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">
                        {store.selectedTable ? `Table ${store.selectedTable}` : store.orderType.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">
                        ₹{store.cart.reduce((s, it) => s + it.unitPrice * it.quantity, 0)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      setMobilePosTab("cart");
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs active:scale-95 transition"
                  >
                    View Cart / Pay &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: KITCHEN DISPLAY SYSTEM (KDS) & KOT PIPELINE                */}
        {/* ------------------------------------------------------------------ */}
        {store.activeTab === "kots" && (
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
            <PosKitchenDisplay
              orders={runningOrders}
              onBack={() => store.setActiveTab("floor")}
              onAppendOrderToTable={(tableNum) => {
                store.setSelectedTable(tableNum);
                store.setActiveTab("pos");
              }}
              onPrintThermalKOT={(order) => {
                store.setReceiptModalData({
                  orderNumber: order.order_number,
                  tableName: order.table_number,
                  waiterName: order.waiter_name || auth.name,
                  branchName: auth.user?.branch_name || "SSR One Restaurant",
                  items: order.items.map((it: any) => ({
                    name: it.product_name,
                    quantity: it.quantity,
                    price: it.unit_price,
                    variant: it.selected_variant,
                    addons: it.selected_addons,
                    note: it.kitchen_note,
                  })),
                  subtotal: order.subtotal,
                  tax: order.total_tax,
                  total: order.grand_total,
                  createdAt: order.created_at,
                });
              }}
              onUpdateOrderStatus={(orderId, nextStatus) => {
                setRunningOrders((prev) =>
                  prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
                );
              }}
            />
          </div>
        )}
      </main>

      {/* 4. MODALS */}
      {/* Advanced Customization Modal */}
      {customizingItem && (
        <PosCustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}

      {/* Fast Checkout & Payment Modal */}
      {store.isCheckoutOpen && (
        <PosCheckoutModal
          orderData={{
            orderNumber: `ORD-${store.selectedTable}-${Date.now().toString().slice(-4)}`,
            tableName: store.selectedTable,
            itemsCount: store.cart.length,
            subtotal: store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
            discount: Math.round(
              (store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) * store.discountPercent) / 100
            ),
            tax: Math.round(
              (Math.max(
                0,
                store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) -
                Math.round(
                  (store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) * store.discountPercent) / 100
                )
              ) * 0.05)
            ),
            total:
              Math.max(
                0,
                store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) -
                Math.round(
                  (store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) * store.discountPercent) / 100
                )
              ) +
              Math.round(
                (Math.max(
                  0,
                  store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) -
                  Math.round(
                    (store.cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0) * store.discountPercent) / 100
                  )
                ) * 0.05)
              ),
          }}
          onClose={() => store.setIsCheckoutOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Thermal 80mm Receipt / KOT Ticket Modal */}
      {store.receiptModalData && (
        <ThermalReceiptModal
          data={store.receiptModalData}
          onClose={() => store.setReceiptModalData(null)}
        />
      )}

      {/* Staff Login / Switch Waiter Modal */}
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

      {/* Staff Petty Cash / Indent Money Request Modal */}
      {isIndentModalOpen && (
        <StaffIndentModal
          authName={auth.name || "Aman"}
          isOpen={isIndentModalOpen}
          onClose={() => setIsIndentModalOpen(false)}
        />
      )}

      {/* Employee Directory */}
      {showDirectory && <EmployeeDirectory onClose={() => setShowDirectory(false)} />}

      {/* Lock / Logout Confirmation Dialog */}
      <LockConfirmModal
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirmLock={handleConfirmLock}
        staffName={auth.name || "Aman"}
        branchName={auth.user?.branch_name || "Baithak Cafe"}
      />
    </div>
  );
}

export default App;
