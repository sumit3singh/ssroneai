import React, { useState, useEffect, useRef, useCallback } from "react";
import { KitchenDisplayPage } from "./kot-kds/KitchenDisplayPage";
import { POSShiftPage } from "./POSShiftPage";
import { useRouterState } from "@tanstack/react-router";
import { ChefHat, RefreshCw, CheckCircle2, Clock, Maximize2, Minimize2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { useAuthStore } from "@ssrone/auth";
import { POSCategory, POSMenuItem, POSTable, POSWaiter, POSCartItem, OrderType, PaymentMethod, POSOrder, getParsedVariantGroups, getParsedAddonGroups } from "../../types";
import { POSItemGrid } from "./POSItemGrid";
import { POSCartPanel, OrderMode } from "./POSCartPanel";
import { POSVariantAddonModal } from "./POSVariantAddonModal";
import { HoldBillsModal, HeldBill } from "./pos-billing/HoldBillsModal";
import { ThermalReceiptModal } from "./pos-billing/ThermalReceiptModal";
import { ThermalKOTPrintableArea, StationKOTSlip, printKOTSlipsDirectly } from "../../components/ThermalKOTPrintableArea";
import { ActiveOrdersTrackerModal } from "./pos-billing/ActiveOrdersTrackerModal";
import { POSQueueTokenModal } from "./pos-billing/POSQueueTokenModal";
import { POSTableTrackerPage } from "./tables-ops/POSTableTrackerPage";
import { POSTableTrackerModal } from "./tables-ops/POSTableTrackerModal";
import { POSOrdersListPage } from "./POSOrdersListPage";
import { POSUPIQRModal } from "../../components/POSUPIQRModal";
import { playPaymentSuccessSound } from "@ssrone/utils";
import { usePOSShortcuts, useBarcodeScanner, useAsyncPrintQueue, useZeroWaitOrderSync } from "../../hooks";
import { renderSafeString } from "../../utils/renderSafeString";
import { generateLocalOrderNumber, peekNextLocalOrderNumber, generateDailyTokenNumber, generateIdempotencyKey } from "../../utils/order-sequence";
import { resolveHotbarItems, getStoredHotbarSlotIds } from "../../utils/posHotbarStorage";
import { cacheCatalog } from "@/shared/utils/offline-store";

export type POSVirtualTab = "billing" | "tables" | "orders" | "kds" | "shift";

const getInitialVirtualTab = (path: string): POSVirtualTab => {
  if (path.includes("/tables") || path.includes("/table-tracker")) return "tables";
  if (path.includes("/orders")) return "orders";
  if (path.includes("/kds")) return "kds";
  if (path.includes("/shift") || path.includes("/history")) return "shift";
  return "billing";
};

interface POSTransactionSectionProps {
  categories: POSCategory[];
  menuItems: POSMenuItem[];
  tables: POSTable[];
  waiters: POSWaiter[];
  orders: POSOrder[];
  onCreateOrder: (order: Partial<POSOrder>) => Promise<void>;
  onOptimisticOrderCreate?: (
    optimisticOrder: POSOrder,
    tableUpdate?: { tableId: number | string; status: POSTable["status"] }
  ) => void;
  onOptimisticOrderSettle?: (orderNumber: string, tableId?: number | string) => void;
  onRefresh?: (serverOrder?: any) => void;
  isLoading?: boolean;
}

export const POSTransactionSection: React.FC<POSTransactionSectionProps> = ({
  categories = [],
  menuItems = [],
  tables = [],
  waiters = [],
  orders = [],
  onCreateOrder,
  onOptimisticOrderCreate,
  onOptimisticOrderSettle,
  onRefresh,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos/transaction/billing";

  // In-Place Virtual Tab Switching State (Instant < 0.2ms swaps without router remount)
  const [activeVirtualTab, setActiveVirtualTab] = useState<POSVirtualTab>(() => getInitialVirtualTab(currentPath));

  const switchVirtualTab = useCallback((targetTab: POSVirtualTab) => {
    setActiveVirtualTab(targetTab);
    try {
      const targetUrl =
        targetTab === "billing"
          ? "/pos/transaction/billing"
          : targetTab === "tables"
          ? "/pos/transaction/tables"
          : targetTab === "orders"
          ? "/pos/transaction/orders"
          : targetTab === "kds"
          ? "/pos/transaction/kds"
          : "/pos/transaction/shift";
      if (typeof window !== "undefined") {
        if (window.location.pathname !== targetUrl) {
          window.history.replaceState(null, "", targetUrl);
        }
        window.dispatchEvent(new CustomEvent("pos:tab-changed", { detail: { tab: targetTab, url: targetUrl } }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const tabFromUrl = getInitialVirtualTab(currentPath);
    setActiveVirtualTab((prev) => (prev !== tabFromUrl ? tabFromUrl : prev));
  }, [currentPath]);

  // Broadcast current virtual tab on mount and whenever it changes so AppShell stays in sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pos:tab-changed", { detail: { tab: activeVirtualTab } }));
    }
  }, [activeVirtualTab]);

  // Global event listener for instant tab switching & table refresh from AppShell navbar
  useEffect(() => {
    const handleSwitchTabEvent = (e: Event) => {
      const ce = e as CustomEvent<{ tab: POSVirtualTab; fullscreen?: boolean }>;
      if (ce.detail?.tab) {
        switchVirtualTab(ce.detail.tab);
        if (ce.detail.fullscreen) {
          setIsFullScreenPOS(true);
          try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } catch {}
        }
      }
    };
    const handleSetFullscreenEvent = (e: Event) => {
      const ce = e as CustomEvent<{ fullscreen: boolean }>;
      if (ce.detail && typeof ce.detail.fullscreen === "boolean") {
        setIsFullScreenPOS(ce.detail.fullscreen);
        try {
          if (ce.detail.fullscreen) {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } else {
            if (document.fullscreenElement && document.exitFullscreen) {
              document.exitFullscreen().catch(() => {});
            }
          }
        } catch {}
      }
    };
    const handleRefreshTablesEvent = () => {
      onRefresh?.();
    };

    window.addEventListener("pos:switch-tab", handleSwitchTabEvent);
    window.addEventListener("pos:set-fullscreen", handleSetFullscreenEvent);
    window.addEventListener("pos:refresh-tables", handleRefreshTablesEvent);
    return () => {
      window.removeEventListener("pos:switch-tab", handleSwitchTabEvent);
      window.removeEventListener("pos:set-fullscreen", handleSetFullscreenEvent);
      window.removeEventListener("pos:refresh-tables", handleRefreshTablesEvent);
    };
  }, [switchVirtualTab, onRefresh]);

  const selectedBranch = useAuthStore((s: any) => s.selected_branch);
  const activeBranchId = selectedBranch?.id || localStorage.getItem("active_branch_id") || 1;
  const { syncOrderInBackground } = useZeroWaitOrderSync(activeBranchId);

  // Auto-cache active catalog to Dexie IndexedDB for 0ms offline availability
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      void cacheCatalog(String(activeBranchId), menuItems, categories);
    }
  }, [menuItems, categories, activeBranchId]);

  const isKDSView = activeVirtualTab === "kds";
  const isShiftView = activeVirtualTab === "shift";
  const isTablesTrackerView = activeVirtualTab === "tables";
  const isOrdersView = activeVirtualTab === "orders";

  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>("DINE_IN");
  const [orderMode, setOrderMode] = useState<OrderMode>(() => {
    try {
      const mode = localStorage.getItem("selected_pos_order_mode");
      if (mode && (mode.toLowerCase() === "takeaway" || mode.toLowerCase() === "delivery")) {
        return mode.toLowerCase() as OrderMode;
      }
    } catch {}
    return "dine_in";
  });
  const [selectedTableId, setSelectedTableId] = useState<number | string>(() => {
    try {
      const mode = localStorage.getItem("selected_pos_order_mode");
      if (mode && mode.toLowerCase() !== "dine_in") return "";
      return localStorage.getItem("selected_pos_table_id") || "";
    } catch {
      return "";
    }
  });
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<"menu" | "cart">("menu");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isFullScreenPOS, setIsFullScreenPOS] = useState<boolean>(() => {
    try {
      return typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false;
    } catch {
      return false;
    }
  });

  // Check if navigation requested Fullscreen Kiosk Mode on path change
  useEffect(() => {
    try {
      if (sessionStorage.getItem("pos_open_kiosk_fullscreen") === "true") {
        sessionStorage.removeItem("pos_open_kiosk_fullscreen");
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    } catch {}
  }, [currentPath]);

  // Customer Management State
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>("");
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const loadCustomers = async () => {
    try {
      const res = await api.get<any>("/customers");
      const list = Array.isArray(res) ? res : res?.items || [];
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load CRM customers", err);
    }
  };

  useEffect(() => {
    loadCustomers();
    // Silent background sync of upcoming serial order number from server
    api.get<{ next_order_number: string }>("/orders/next-number-preview", {
      params: { branch_id: activeBranchId }
    }).then((res) => {
      const nextNum = res?.next_order_number;
      if (nextNum && /^\d{6}$/.test(nextNum)) {
        const val = parseInt(nextNum, 10);
        if (val >= 100001) {
          const currentLocal = parseInt(localStorage.getItem("pos_serial_order_seq") || "0", 10);
          if (val - 1 > currentLocal) {
            localStorage.setItem("pos_serial_order_seq", (val - 1).toString());
          }
        }
      }
    }).catch(() => {});
  }, [activeBranchId]);

  // Kitchen Stations Registry & KOT Slips for Station-Wise Thermal Routing
  const [kitchenStations, setKitchenStations] = useState<any[]>([]);
  const [activeKOTSlips, setActiveKOTSlips] = useState<StationKOTSlip[]>([]);
  const baselineOrderItemsRef = useRef<Record<string, number>>({});

  const loadKitchenStations = async () => {
    try {
      const res = await api.get<any[]>("/restaurant/kitchen-stations");
      const list = Array.isArray(res) ? res : [];
      setKitchenStations(list);
    } catch (err) {
      console.warn("Failed to load kitchen stations for KOT routing", err);
    }
  };

  useEffect(() => {
    loadKitchenStations();
  }, []);

  const resolveItemKitchenStation = useCallback((item: POSCartItem): { name: string; code?: string; printer?: string } => {
    const rawStation = item.kds_station?.trim();
    if (rawStation) {
      const matched = kitchenStations.find(
        (s) => s.name?.toLowerCase() === rawStation.toLowerCase() || s.code?.toLowerCase() === rawStation.toLowerCase()
      );
      if (matched) return { name: matched.name, code: matched.code, printer: matched.printer_name };
      return { name: rawStation };
    }

    const menuItem = menuItems.find(
      (m) => String(m.id) === String(item.item_id) || m.name?.trim().toLowerCase() === item.name?.trim().toLowerCase()
    );
    if (menuItem?.kds_station?.trim()) {
      const rawKds = menuItem.kds_station.trim();
      const matched = kitchenStations.find(
        (s) => s.name?.toLowerCase() === rawKds.toLowerCase() || s.code?.toLowerCase() === rawKds.toLowerCase()
      );
      if (matched) return { name: matched.name, code: matched.code, printer: matched.printer_name };
      return { name: rawKds };
    }

    const cat = categories.find((c) => String(c.id) === String(menuItem?.category_id));
    if (cat) {
      const matchedCat = kitchenStations.find(
        (s) =>
          s.name?.toLowerCase() === cat.name?.toLowerCase() ||
          s.code?.toLowerCase() === cat.name?.toLowerCase() ||
          (Array.isArray(s.categories) && s.categories.some((sc: any) => String(sc) === String(cat.id) || String(sc).toLowerCase() === cat.name?.toLowerCase()))
      );
      if (matchedCat) return { name: matchedCat.name, code: matchedCat.code, printer: matchedCat.printer_name };
    }

    const defaultStation = kitchenStations.find((s) => s.is_active !== false) || kitchenStations[0];
    return {
      name: defaultStation?.name || cat?.name || menuItem?.category_name || "Indian Kitchen",
      code: defaultStation?.code,
      printer: defaultStation?.printer_name,
    };
  }, [kitchenStations, menuItems, categories]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    setIsSavingCustomer(true);
    try {
      const activeCompanyId = localStorage.getItem("active_company_id");
      const activeBranchId = localStorage.getItem("active_branch_id");
      const res = await api.post<any>("/customers", {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        address: newCustAddress.trim() || undefined,
        email: newCustEmail.trim() || undefined,
        company_id: activeCompanyId ? Number(activeCompanyId) : undefined,
        branch_id: activeBranchId ? Number(activeBranchId) : undefined,
      });
      toast.success(`Customer "${newCustName}" created & selected!`);
      if (res && res.id) {
        setCustomers(prev => [res, ...prev.filter(c => String(c.id) !== String(res.id))]);
        setSelectedCustomerId(res.id);
      }
      setNewCustName("");
      setNewCustPhone("");
      setNewCustAddress("");
      setNewCustEmail("");
      setIsCreateCustomerModalOpen(false);
      loadCustomers().catch(() => {});
    } catch (err: any) {
      console.error("Failed to create customer", err);
      toast.error(err?.response?.data?.detail || "Failed to create customer");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleOpenCreateCustomerWithSearchTerm = (term: string) => {
    const cleanTerm = term.trim();
    if (/^\d+$/.test(cleanTerm)) {
      setNewCustPhone(cleanTerm);
      setNewCustName("");
    } else {
      setNewCustName(cleanTerm);
      setNewCustPhone("");
    }
    setNewCustAddress("");
    setNewCustEmail("");
    setIsCreateCustomerModalOpen(true);
  };

  // Modals state
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    try {
      const saved = localStorage.getItem("pos_held_bills");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isQueueTokenModalOpen, setIsQueueTokenModalOpen] = useState(false);
  const [recalledOrderNumber, setRecalledOrderNumber] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);

  // Global Alt+Q Queue Token Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "q" || e.key === "Q")) {
        e.preventDefault();
        setIsQueueTokenModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  // Save held bills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pos_held_bills", JSON.stringify(heldBills));
    } catch (e) {
      console.error("Failed to save held bills", e);
    }
  }, [heldBills]);


  // Keep active selectedTableId & orderMode synchronized with localStorage
  useEffect(() => {
    try {
      if (orderMode === "dine_in" && selectedTableId) {
        localStorage.setItem("selected_pos_table_id", String(selectedTableId));
        localStorage.setItem("selected_pos_order_mode", "dine_in");
      } else if (orderMode !== "dine_in") {
        localStorage.removeItem("selected_pos_table_id");
        localStorage.setItem("selected_pos_order_mode", orderMode);
      }
    } catch (e) {}
  }, [selectedTableId, orderMode]);

  // Check for pending order to edit from Order Tracker Page, preselected mode, or selected table
  useEffect(() => {
    // Reset left dish grid search term & category filter when navigating views
    setSearchTerm("");
    setSelectedCategoryId(null);
    try {
      const pendingEdit = localStorage.getItem("edit_pos_order");
      if (pendingEdit) {
        const order = JSON.parse(pendingEdit);
        localStorage.removeItem("edit_pos_order");
        handleRecallOrderToCart(order);
        return;
      }
      const preselectedTableId = localStorage.getItem("selected_pos_table_id");
      const preselectedOrderMode = localStorage.getItem("selected_pos_order_mode");

      if (preselectedOrderMode && (preselectedOrderMode.toLowerCase() === "takeaway" || preselectedOrderMode.toLowerCase() === "delivery")) {
        const mode = preselectedOrderMode.toLowerCase() as OrderMode;
        setOrderMode(mode);
        setSelectedTableId("");
        setSelectedWaiterId("");
      } else if (preselectedTableId) {
        setSelectedTableId(preselectedTableId);
        setSelectedWaiterId("");
        setOrderMode("dine_in");
      } else if (preselectedOrderMode) {
        const mode = preselectedOrderMode.toLowerCase() as OrderMode;
        setOrderMode(mode);
        if (mode !== "dine_in") {
          setSelectedTableId("");
          setSelectedWaiterId("");
        }
      }
    } catch (e) {
      console.error("Failed to load edit_pos_order or table_id", e);
    }
  }, [currentPath]);



  const toggleKioskFullScreen = () => {
    try {
      const next = !isFullScreenPOS;
      setIsFullScreenPOS(next);
      localStorage.setItem("pos_kiosk_fullscreen", next ? "true" : "false");
      if (next) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch (err) {
      console.error("toggleKioskFullScreen error:", err);
    }
  };

  // Sync React state with native browser fullscreen change events (F11, browser exit)
  // Keeps Kiosk mode active during print dialogs and only exits on explicit user action
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      if (isFs) {
        setIsFullScreenPOS(true);
        localStorage.setItem("pos_kiosk_fullscreen", "true");
      } else if (localStorage.getItem("pos_kiosk_fullscreen") !== "true") {
        setIsFullScreenPOS(false);
      }
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Decoupled Background Thermal Print Queue Engine
  const { enqueuePrintJob } = useAsyncPrintQueue();

  // Hardware USB Barcode Scanner Wedge Engine
  const { isScannerActive } = useBarcodeScanner({
    menuItems,
    onScanSuccess: (item) => handleAddToCart(item),
    enabled: true,
  });

  // Keyboard Shortcuts Hook
  usePOSShortcuts({
    onSearchFocus: () => {
      const input = document.getElementById("pos-menu-search-input");
      if (input) input.focus();
    },
    onFocusCustomer: () => {
      const el = document.getElementById("pos-customer-combobox-trigger");
      if (el) {
        el.click();
      }
    },
    onFocusTable: () => {
      if (activeVirtualTab === "tables") {
        switchVirtualTab("billing");
        return;
      }
      if (orderMode !== "dine_in") {
        setOrderMode("dine_in");
      }
      setTimeout(() => {
        const el = document.getElementById("pos-table-combobox-trigger");
        if (el) {
          el.click();
        } else {
          switchVirtualTab("tables");
        }
      }, 40);
    },
    onFocusCategory: () => {
      window.dispatchEvent(new CustomEvent("pos-focus-category"));
    },
    onFocusDiscount: () => {
      const el = document.getElementById("pos-discount-input") as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select();
      }
    },
    onFocusRemark: () => {
      window.dispatchEvent(new CustomEvent("pos-focus-remark"));
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(".pos-item-remark-input");
        if (inputs.length > 0) {
          inputs[inputs.length - 1].focus();
          inputs[inputs.length - 1].select();
        }
      }, 50);
    },
    onSetOrderMode: (mode) => {
      setOrderMode(mode);
      toast.info(`Switched to ${mode.replace("_", " ").toUpperCase()}`, { icon: "📋" });
    },
    onCyclePayment: () => {
      setPaymentMethod((prev) => {
        const methods: PaymentMethod[] = ["CASH", "UPI", "CARD"];
        const nextIdx = (methods.indexOf(prev) + 1) % methods.length;
        const next = methods[nextIdx];
        toast.info(`Payment Method: ${next}`, { icon: "💳" });
        return next;
      });
    },
    onGenerateToken: () => {
      setIsQueueTokenModalOpen(true);
    },
    onHoldBill: () => {
      handleHoldBill();
    },
    onSendKOT: () => {
      if (cartItems.length > 0) {
        handlePlaceOrderKOT();
      } else {
        toast.error("Cart is empty - add items first before sending KOT");
      }
    },
    onSettleBill: () => {
      if (cartItems.length > 0) {
        handleSettleAndPay(paymentMethod);
      } else {
        toast.error("Cart is empty - add items first before settling bill");
      }
    },
    onAddExpressItem: (index: number) => {
      const slotIds = getStoredHotbarSlotIds();
      const expressItems = resolveHotbarItems(menuItems, slotIds);
      if (expressItems[index]) {
        handleAddToCart(expressItems[index]);
        toast.success(`Quick Added: ${expressItems[index].name}`, { icon: "⚡" });
      }
    },
    onViewHeldBills: () => setIsHoldModalOpen(true),
    onViewActiveOrders: () => setIsTrackerModalOpen(true),
    onToggleKioskFullScreen: toggleKioskFullScreen,
    onNavigateTables: () => {
      const el = document.getElementById("pos-table-combobox-trigger");
      if (el && orderMode === "dine_in") {
        el.click();
      } else {
        switchVirtualTab("tables");
      }
    },
    onNavigateOrders: () => switchVirtualTab("orders"),
    onQuickPay: () => {
      if (cartItems.length > 0) {
        handleSettleAndPay("CASH");
      } else {
        toast.error("Cart is empty - add items first");
      }
    },
    onClearCart: () => {
      if (cartItems.length > 0) {
        setCartItems([]);
        toast.info("Cart cleared");
      }
    },
    onRemoveLastItem: () => {
      setCartItems((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    },
    onAdjustQuantity: (delta: number) => {
      setCartItems((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const newQty = last.quantity + delta;
        if (newQty <= 0) {
          return prev.slice(0, -1);
        }
        return prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, quantity: newQty } : item));
      });
    },
    onRemoveItem: () => {
      setCartItems((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    },
  });

  // Variant & Addons selector modal state (Cart-Anchored)
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<POSMenuItem | null>(null);
  const [selectedVariantOption, setSelectedVariantOption] = useState<any>(null);
  const [selectedAddonOptions, setSelectedAddonOptions] = useState<any[]>([]);
  const [activeAddonCartId, setActiveAddonCartId] = useState<string | null>(null);

  const lastCartAdditionRef = React.useRef<{ time: number; fingerprint: string }>({ time: 0, fingerprint: "" });

  const isRapidDuplicateAddition = (fingerprintKey: string): boolean => {
    const now = Date.now();
    if (
      lastCartAdditionRef.current.fingerprint === fingerprintKey &&
      now - lastCartAdditionRef.current.time < 200
    ) {
      return true;
    }
    lastCartAdditionRef.current = { time: now, fingerprint: fingerprintKey };
    return false;
  };

  const getCartFingerprint = (itemId: number | string, variant: any, addons: any[]): string => {
    const vId = variant ? (variant.name ?? variant.id ?? "default") : "default";
    const addonIds = (addons || [])
      .map((a) => (typeof a === "string" ? a : (a?.name ?? a?.id ?? a?.title ?? "")))
      .filter(Boolean)
      .sort()
      .join("_");
    return `item_${itemId}_var_${vId}_addons_${addonIds || "none"}`;
  };

  // Center Menu Click: Instant 0ms Tap-To-Cart (No Center Popups!)
  const handleAddToCart = (item: POSMenuItem, explicitVariant?: any) => {
    const variantGroups = getParsedVariantGroups(item);
    const addonGroups = getParsedAddonGroups(item);
    const normalizedItem: POSMenuItem = {
      ...item,
      variant_groups: variantGroups,
      addon_groups: addonGroups
    };

    // Pick explicit clicked variant size OR default variant OR null
    const targetVariant =
      explicitVariant ||
      (variantGroups.length > 0
        ? (variantGroups[0]?.options?.find((o: any) => o.is_default) || variantGroups[0]?.options?.[0] || null)
        : null);

    const varPrice = targetVariant
      ? Number(targetVariant.sellingPrice ?? targetVariant.price ?? normalizedItem.selling_price ?? normalizedItem.base_price)
      : Number(normalizedItem.selling_price || normalizedItem.base_price);
    const varName = targetVariant?.name || "";
    const fingerprintKey = getCartFingerprint(normalizedItem.id, targetVariant, []);

    if (isRapidDuplicateAddition(fingerprintKey)) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.fingerprint_key === fingerprintKey);
      if (existingIndex > -1) {
        return prev.map((c, i) =>
          i === existingIndex ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          cart_id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
          fingerprint_key: fingerprintKey,
          item_id: normalizedItem.id,
          name: normalizedItem.name,
          variant_name: varName,
          addons: [],
          selected_addons: [],
          unit_price: varPrice,
          packaging_charge: normalizedItem.packaging_charge || 10,
          quantity: 1,
          selected_variant: targetVariant,
          is_veg: normalizedItem.is_veg,
          kds_station: normalizedItem.kds_station
        }
      ];
    });
  };

  // Open Addons Customizer For A Cart Item
  const handleOpenCartItemAddons = (cartId: string) => {
    const cartItem = cartItems.find((c) => c.cart_id === cartId);
    if (!cartItem) return;
    const menuItem = menuItems.find((m) => String(m.id) === String(cartItem.item_id));
    if (!menuItem) return;

    const variantGroups = getParsedVariantGroups(menuItem);
    const addonGroups = getParsedAddonGroups(menuItem);
    const normalizedItem: POSMenuItem = {
      ...menuItem,
      variant_groups: variantGroups,
      addon_groups: addonGroups
    };

    const matchedVariant = cartItem.selected_variant || (cartItem.variant_name ? variantGroups[0]?.options?.find((o: any) => o.name === cartItem.variant_name) : null) || variantGroups[0]?.options?.[0] || null;

    setActiveAddonCartId(cartId);
    setSelectedItemForVariant(normalizedItem);
    setSelectedVariantOption(matchedVariant);
    setSelectedAddonOptions(cartItem.addons || cartItem.selected_addons || []);
  };

  const handleCancelVariantAddonModal = () => {
    setActiveAddonCartId(null);
    setSelectedItemForVariant(null);
    setSelectedVariantOption(null);
    setSelectedAddonOptions([]);
  };

  const handleConfirmVariantAndAddonsToCart = () => {
    if (!selectedItemForVariant) return;

    // Modifying addons for an existing cart line item
    if (activeAddonCartId) {
      const targetCartId = activeAddonCartId;
      const targetCartItem = cartItems.find((c) => c.cart_id === targetCartId);
      if (targetCartItem) {
        const effectiveVariant = selectedVariantOption || targetCartItem.selected_variant || null;
        const basePrice = effectiveVariant
          ? Number(effectiveVariant.sellingPrice ?? effectiveVariant.price ?? selectedItemForVariant.base_price)
          : Number(selectedItemForVariant.selling_price || selectedItemForVariant.base_price);

        const getAddonPrice = (addonOpt: any): number => {
          if (effectiveVariant && effectiveVariant.name) {
            const variantName = effectiveVariant.name;
            const vp = addonOpt.variantPrices || addonOpt.variant_prices;
            if (vp && typeof vp === "object" && vp[variantName] !== undefined) {
              return Number(vp[variantName]);
            }
          }
          return Number(addonOpt.price || 0);
        };

        const addonsPrice = selectedAddonOptions.reduce((sum, a) => sum + getAddonPrice(a), 0);
        const totalPrice = basePrice + addonsPrice;
        const newFingerprint = getCartFingerprint(
          targetCartItem.item_id,
          effectiveVariant,
          selectedAddonOptions
        );

        // Check if another line item in the cart already has this exact same fingerprint!
        const duplicateIndex = cartItems.findIndex(
          (c) => c.cart_id !== targetCartId && c.fingerprint_key === newFingerprint
        );

        if (duplicateIndex > -1) {
          // Merge with the existing line
          setCartItems((prev) =>
            prev
              .map((c, idx) =>
                idx === duplicateIndex
                  ? { ...c, quantity: c.quantity + targetCartItem.quantity }
                  : c
              )
              .filter((c) => c.cart_id !== targetCartId)
          );
          toast.success(`Merged with existing line item for ${targetCartItem.name}`, { icon: "✨" });
        } else {
          // Update this line item in place
          setCartItems((prev) =>
            prev.map((c) =>
              c.cart_id === targetCartId
                ? {
                    ...c,
                    fingerprint_key: newFingerprint,
                    addons: selectedAddonOptions,
                    selected_addons: selectedAddonOptions,
                    unit_price: totalPrice,
                  }
                : c
            )
          );
          toast.success(`Addons updated for ${targetCartItem.name}`, { icon: "✨" });
        }
      }
      handleCancelVariantAddonModal();
      return;
    }

    // Direct Addon/Variant Confirmation Fallback
    const basePrice = selectedVariantOption
      ? Number(selectedVariantOption.sellingPrice ?? selectedVariantOption.price ?? selectedItemForVariant.base_price)
      : Number(selectedItemForVariant.selling_price || selectedItemForVariant.base_price);

    const getAddonPrice = (addonOpt: any): number => {
      if (selectedVariantOption && selectedVariantOption.name) {
        const variantName = selectedVariantOption.name;
        const vp = addonOpt.variantPrices || addonOpt.variant_prices;
        if (vp && typeof vp === "object" && vp[variantName] !== undefined) {
          return Number(vp[variantName]);
        }
      }
      return Number(addonOpt.price || 0);
    };

    const addonsPrice = selectedAddonOptions.reduce((sum, a) => sum + getAddonPrice(a), 0);
    const totalPrice = basePrice + addonsPrice;
    const variantName = selectedVariantOption ? selectedVariantOption.name : "";
    const fingerprintKey = getCartFingerprint(selectedItemForVariant.id, selectedVariantOption, selectedAddonOptions);

    if (isRapidDuplicateAddition(fingerprintKey)) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.fingerprint_key === fingerprintKey);
      if (existingIndex > -1) {
        return prev.map((c, i) =>
          i === existingIndex ? { ...c, quantity: c.quantity + 1 } : c
        );
      }

      return [
        ...prev,
        {
          cart_id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
          fingerprint_key: fingerprintKey,
          item_id: selectedItemForVariant.id,
          name: selectedItemForVariant.name,
          variant_name: variantName,
          addons: selectedAddonOptions,
          selected_addons: selectedAddonOptions,
          unit_price: totalPrice,
          packaging_charge: selectedItemForVariant.packaging_charge || 10,
          quantity: 1,
          selected_variant: selectedVariantOption,
          is_veg: selectedItemForVariant.is_veg,
          kds_station: selectedItemForVariant.kds_station
        }
      ];
    });

    handleCancelVariantAddonModal();
  };

  const toggleAddonSelection = (addonOpt: any) => {
    setSelectedAddonOptions((prev) => {
      const exists = prev.some((a) => (a.id && a.id === addonOpt.id) || a.name === addonOpt.name);
      return exists
        ? prev.filter((a) => (a.id ? a.id !== addonOpt.id : a.name !== addonOpt.name))
        : [...prev, addonOpt];
    });
  };

  const handleUpdateQty = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((c) => {
          if (c.cart_id !== cartId) return c;
          const newQty = c.quantity + delta;
          return newQty > 0 ? { ...c, quantity: newQty } : null;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const handleSetDirectQty = (cartId: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((c) => (c.cart_id === cartId ? { ...c, quantity: Math.max(1, newQty) } : c))
    );
  };

  const handleEditCartItem = (cartItem: POSCartItem) => {
    handleOpenCartItemAddons(cartItem.cart_id);
  };

  const handleRemoveCartItem = (cartId: string) => {
    const itemToRemove = cartItems.find((c) => c.cart_id === cartId);
    if (!itemToRemove) return;
    const removedIndex = cartItems.findIndex((c) => c.cart_id === cartId);
    setCartItems((prev) => prev.filter((c) => c.cart_id !== cartId));

    toast.info(`Removed ${itemToRemove.item_name}`, {
      duration: 3500,
      action: {
        label: "Undo",
        onClick: () => {
          setCartItems((prev) => {
            const next = [...prev];
            const insertIdx = Math.min(removedIndex, next.length);
            next.splice(insertIdx, 0, itemToRemove);
            return next;
          });
          toast.success(`Restored ${itemToRemove.item_name}`);
        },
      },
    });
  };

  const handleSwapCartItemVariant = (cartId: string, newVariant: any) => {
    setCartItems((prev) => {
      const targetIndex = prev.findIndex((c) => c.cart_id === cartId);
      if (targetIndex === -1) return prev;
      const currentItem = prev[targetIndex];
      const menuItem = menuItems.find((m) => String(m.id) === String(currentItem.item_id) || m.name?.trim().toLowerCase() === currentItem.name?.trim().toLowerCase());
      if (!menuItem) return prev;

      const newBasePrice = Number(newVariant.sellingPrice ?? newVariant.price ?? menuItem.selling_price ?? menuItem.base_price ?? (menuItem as any).price ?? 0);
      const getAddonPrice = (addonOpt: any): number => {
        const optName = (typeof addonOpt === "string" ? addonOpt : (addonOpt?.name || addonOpt?.title || "")).trim();
        if (typeof addonOpt === "number") return addonOpt;
        if (newVariant && newVariant.name && typeof addonOpt === "object" && addonOpt !== null) {
          const vp = addonOpt.variantPrices || addonOpt.variant_prices;
          if (vp && typeof vp === "object" && vp[newVariant.name] !== undefined) {
            return Number(vp[newVariant.name]);
          }
        }
        if (typeof addonOpt === "object" && addonOpt !== null) {
          if (addonOpt.calculatedPrice !== undefined && Number(addonOpt.calculatedPrice) >= 0) return Number(addonOpt.calculatedPrice);
          if (addonOpt.price !== undefined && Number(addonOpt.price) >= 0) return Number(addonOpt.price);
        }
        // If addonOpt is a string or fallback to menuItem's addon_groups
        if (menuItem) {
          const groups = getParsedAddonGroups(menuItem);
          for (const g of groups) {
            const found = (g.options || []).find((o: any) => (o.name || "").trim().toLowerCase() === optName.toLowerCase());
            if (found) {
              if (newVariant && newVariant.name) {
                const vp = found.variantPrices || found.variant_prices;
                if (vp && typeof vp === "object" && vp[newVariant.name] !== undefined) {
                  return Number(vp[newVariant.name]);
                }
              }
              return Number(found.price || 0);
            }
          }
        }
        return 0;
      };

      const addonsPrice = (currentItem.addons || []).reduce((sum: number, a: any) => sum + getAddonPrice(a), 0);
      const newTotalPrice = newBasePrice + addonsPrice;
      const newFingerprint = getCartFingerprint(menuItem.id, newVariant, currentItem.addons || []);

      const duplicateIndex = prev.findIndex((c, idx) => idx !== targetIndex && c.fingerprint_key === newFingerprint);
      if (duplicateIndex > -1) {
        return prev
          .map((c, idx) => (idx === duplicateIndex ? { ...c, quantity: c.quantity + currentItem.quantity } : c))
          .filter((_, idx) => idx !== targetIndex);
      }

      return prev.map((c, idx) =>
        idx === targetIndex
          ? {
              ...c,
              item_id: menuItem.id,
              variant_name: newVariant.name || "",
              selected_variant: newVariant,
              unit_price: newTotalPrice,
              fingerprint_key: newFingerprint,
            }
          : c
      );
    });
    toast.success(`Size swapped to ${newVariant.name || ""}`, { icon: "⚡" });
  };

  const handleToggleCartItemAddon = (cartId: string, addonOpt: any) => {
    setCartItems((prev) => {
      const targetIndex = prev.findIndex((c) => c.cart_id === cartId);
      if (targetIndex === -1) return prev;
      const currentItem = prev[targetIndex];
      const menuItem = menuItems.find(
        (m) => String(m.id) === String(currentItem.item_id) || m.name?.trim().toLowerCase() === currentItem.name?.trim().toLowerCase()
      );

      const getAddonName = (a: any): string => (typeof a === "string" ? a : (a?.name || a?.title || a?.label || "")).trim();
      const getAddonId = (a: any): string | number | undefined => (typeof a === "object" && a !== null ? a.id : undefined);

      const targetAddonName = getAddonName(addonOpt);
      const targetAddonId = getAddonId(addonOpt);

      const currentAddons = Array.isArray(currentItem.addons)
        ? currentItem.addons
        : (Array.isArray(currentItem.selected_addons) ? currentItem.selected_addons : []);

      const exists = currentAddons.some((a: any) => {
        const aId = getAddonId(a);
        const aName = getAddonName(a);
        if (targetAddonId && aId && String(aId) === String(targetAddonId)) return true;
        return aName.toLowerCase() === targetAddonName.toLowerCase();
      });

      const updatedAddons = exists
        ? currentAddons.filter((a: any) => {
            const aId = getAddonId(a);
            const aName = getAddonName(a);
            if (targetAddonId && aId && String(aId) === String(targetAddonId)) return false;
            return aName.toLowerCase() !== targetAddonName.toLowerCase();
          })
        : [...currentAddons, addonOpt];

      const effectiveVariant = currentItem.selected_variant;

      // Determine the addon price dynamically
      const getAddonPrice = (opt: any): number => {
        const optName = getAddonName(opt);
        const optId = getAddonId(opt);
        if (typeof opt === "number") return opt;
        if (opt && typeof opt === "object") {
          if (effectiveVariant && effectiveVariant.name) {
            const vp = opt.variantPrices || opt.variant_prices;
            if (vp && typeof vp === "object" && vp[effectiveVariant.name] !== undefined) {
              return Number(vp[effectiveVariant.name]);
            }
          }
          if (opt.calculatedPrice !== undefined && Number(opt.calculatedPrice) >= 0) {
            return Number(opt.calculatedPrice);
          }
          if (opt.price !== undefined && Number(opt.price) >= 0) {
            return Number(opt.price);
          }
        }
        // Fallback to searching in menuItem's addon_groups
        if (menuItem) {
          const groups = getParsedAddonGroups(menuItem);
          for (const g of groups) {
            const found = (g.options || []).find(
              (o: any) => (o.id && optId && String(o.id) === String(optId)) || getAddonName(o).toLowerCase() === optName.toLowerCase()
            );
            if (found) {
              if (effectiveVariant && effectiveVariant.name) {
                const vp = found.variantPrices || found.variant_prices;
                if (vp && typeof vp === "object" && vp[effectiveVariant.name] !== undefined) {
                  return Number(vp[effectiveVariant.name]);
                }
              }
              return Number(found.price || 0);
            }
          }
        }
        return 0;
      };

      // Determine base price without addons
      let basePrice = 0;
      if (menuItem) {
        if (effectiveVariant && (effectiveVariant.sellingPrice !== undefined || effectiveVariant.price !== undefined || effectiveVariant.name)) {
          const variantGroups = getParsedVariantGroups(menuItem);
          const matchedVar = variantGroups[0]?.options?.find((o: any) => o.name === effectiveVariant.name);
          basePrice = matchedVar
            ? Number(matchedVar.sellingPrice ?? matchedVar.price ?? menuItem.selling_price ?? menuItem.base_price)
            : Number(effectiveVariant.sellingPrice ?? effectiveVariant.price ?? menuItem.selling_price ?? menuItem.base_price);
        } else {
          basePrice = Number(menuItem.selling_price || menuItem.base_price || (menuItem as any).price || 0);
        }
      } else {
        const oldAddonsPrice = currentAddons.reduce((sum: number, a: any) => sum + getAddonPrice(a), 0);
        basePrice = Math.max(0, currentItem.unit_price - oldAddonsPrice);
      }

      const addonsPrice = updatedAddons.reduce((sum: number, a: any) => sum + getAddonPrice(a), 0);
      const newTotalPrice = basePrice + addonsPrice;
      const newFingerprint = getCartFingerprint(
        menuItem ? menuItem.id : currentItem.item_id,
        effectiveVariant,
        updatedAddons
      );

      // Check if another line in the cart already has this exact same fingerprint
      const duplicateIndex = prev.findIndex((c, idx) => idx !== targetIndex && c.fingerprint_key === newFingerprint);
      if (duplicateIndex > -1) {
        toast.info(`Merged with existing line for ${currentItem.name}`);
        return prev
          .map((c, idx) => (idx === duplicateIndex ? { ...c, quantity: c.quantity + currentItem.quantity } : c))
          .filter((_, idx) => idx !== targetIndex);
      }

      return prev.map((c, idx) =>
        idx === targetIndex
          ? {
              ...c,
              item_id: menuItem ? menuItem.id : c.item_id,
              addons: updatedAddons,
              selected_addons: updatedAddons,
              unit_price: newTotalPrice,
              fingerprint_key: newFingerprint,
            }
          : c
      );
    });
  };

  // State for Dual Discount, GST Toggle & Kitchen Order Notes
  const [applyGst, setApplyGst] = useState<boolean>(false); // DEFAULT UNSELECTED as requested!
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>("");

  const handleUpdateItemNotes = (cartId: string, notes: string) => {
    setCartItems((prev) =>
      prev.map((c) => (c.cart_id === cartId ? { ...c, notes } : c))
    );
  };

  const setDiscountAmount = (val: number) => {
    setDiscountValue(val);
    setDiscountType("amount");
  };

  // Billing Totals Calculations
  const subtotal = cartItems.reduce((sum, c) => sum + c.unit_price * c.quantity, 0);
  
  // Dual Discount Calculation (% or ₹)
  const discountAmount = discountType === "percent"
    ? Math.round((subtotal * Math.min(100, Math.max(0, discountValue || 0))) / 100)
    : Math.min(subtotal, Math.max(0, discountValue || 0));

  const rawPackagingCharge = cartItems.reduce((sum, c) => sum + (c.packaging_charge || 10) * c.quantity, 0);
  const packagingChargeTotal = orderMode === "dine_in" ? 0 : Math.min(rawPackagingCharge, 40);
  const taxableAmount = subtotal + packagingChargeTotal - discountAmount;
  
  // Optional GST (5%) — Default Unselected (₹0 unless checked by cashier)
  const taxAmount = applyGst ? Math.round(Math.max(0, taxableAmount) * 0.05) : 0;
  const netAmount = Math.max(0, taxableAmount + taxAmount);

  // Customer-Facing Display (CFD) Synchronization via BroadcastChannel
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("ssrone_cfd_sync");
        channel.postMessage({
          type: "CART_UPDATE",
          cartItems: cartItems.map((c) => ({
            cart_id: c.cart_id,
            name: c.name,
            variant_name: c.variant_name,
            quantity: c.quantity,
            unit_price: c.unit_price,
            is_veg: c.is_veg,
          })),
          subtotal,
          discountAmount,
          taxAmount,
          netAmount,
          orderMode,
        });
        channel.close();
      }
    } catch {}
  }, [cartItems, subtotal, discountAmount, taxAmount, netAmount, orderMode]);

  const handleSetOrderMode = (mode: OrderMode) => {
    setOrderMode(mode);
    if (mode !== "dine_in") {
      setSelectedTableId("");
      setSelectedWaiterId("");
    }
  };

  // Hold Current Bill
  const handleHoldBill = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty - cannot hold bill");
      return;
    }
    if (orderMode === "dine_in" && !selectedTableId) {
      toast.error("Please select a dining table for Dine-In orders!");
      return;
    }
    if (orderMode === "delivery" && !selectedCustomerId) {
      toast.error("Customer Name & Mobile Number are REQUIRED for Delivery orders! Please select or create a customer.");
      setIsCreateCustomerModalOpen(true);
      return;
    }
    const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
    const matchedCust = customers.find((c) => String(c.id) === String(selectedCustomerId));
    const newHeld: HeldBill = {
      id: `hold-${Date.now()}`,
      orderType: orderMode.toUpperCase(),
      tableName: selectedTable?.table_number,
      items: [...cartItems],
      subtotal,
      heldAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      selectedTableId,
      selectedCustomerId,
      selectedWaiterId,
      orderNotes,
      discountType,
      discountValue,
      applyGst,
      customerName: matchedCust ? matchedCust.name : undefined,
    };
    setHeldBills((prev) => [newHeld, ...prev]);
    setCartItems([]);
    setSelectedTableId("");
    setSelectedCustomerId("");
    setSelectedWaiterId("");
    setOrderNotes("");
    setRecalledOrderNumber(null);
    setDiscountAmount(0);

    toast.success(`Bill held successfully! (${newHeld.items.length} items paused)`);
  };

  const handleRecallBill = (bill: HeldBill) => {
    setCartItems(bill.items);
    setOrderMode((bill.orderType.toLowerCase() as OrderMode) || "dine_in");
    if (bill.selectedTableId !== undefined) setSelectedTableId(bill.selectedTableId || "");
    if (bill.selectedCustomerId !== undefined) setSelectedCustomerId(bill.selectedCustomerId || "");
    if (bill.selectedWaiterId !== undefined) setSelectedWaiterId(bill.selectedWaiterId || "");
    if (bill.orderNotes !== undefined) setOrderNotes(bill.orderNotes || "");
    if (bill.discountType !== undefined) setDiscountType(bill.discountType);
    if (bill.discountValue !== undefined) setDiscountValue(bill.discountValue);
    if (bill.applyGst !== undefined) setApplyGst(bill.applyGst);
    setHeldBills((prev) => prev.filter((h) => h.id !== bill.id));
    toast.success("Held bill loaded into cart!");
  };

  const handleRecallOrderToCart = async (order: POSOrder) => {
    try {
      const st = (order.status || "").toLowerCase();
      if (st === "completed" || st === "paid" || st === "settled") {
        toast.error(`🚫 Order #${order.order_number} is fully closed & settled! Completed orders cannot be modified.`);
        return;
      }

      let targetOrder = order;
      let rawItems = targetOrder.items || (targetOrder as any).order_items || (targetOrder as any).line_items || [];

      // Fallback: If local order object lacks items, try fetching full order from DB or finding in orders list
      if (!rawItems || rawItems.length === 0) {
        if (targetOrder.id) {
          try {
            const res = await api.get<any>(`/orders/${targetOrder.id}`);
            if (res && (res.items || res.order_items)) {
              targetOrder = res;
              rawItems = res.items || res.order_items || [];
            }
          } catch (fetchErr) {
            console.warn("Failed to fetch full order details from API, trying local search", fetchErr);
          }
        }
        if (!rawItems || rawItems.length === 0) {
          const foundInProp = orders.find(
            (o) =>
              (targetOrder.id && String(o.id) === String(targetOrder.id)) ||
              (targetOrder.order_number && o.order_number === targetOrder.order_number)
          );
          if (foundInProp && (foundInProp.items || (foundInProp as any).order_items)) {
            targetOrder = foundInProp;
            rawItems = foundInProp.items || (foundInProp as any).order_items || [];
          }
        }
      }

      if (!rawItems || rawItems.length === 0) {
        toast.error("No items found in this order.");
        return;
      }

      const formattedCart: POSCartItem[] = rawItems.map((item: any, idx: number) => {
        const rawItemId = item.item_id || item.product_id || item.menu_item_id;
        const itemName = item.name || item.product_name || item.item_name || item.menu_item_name || item.title || "Dish Item";
        const matchedMenuItem = menuItems.find(
          (m) =>
            (rawItemId && String(m.id) === String(rawItemId)) ||
            m.name?.trim().toLowerCase() === itemName?.trim().toLowerCase()
        );
        const resolvedItemId = matchedMenuItem ? matchedMenuItem.id : (rawItemId || item.id || (idx + 1));
        const varName = item.variant_name || (item.selected_variant ? item.selected_variant.name : undefined);
        const variantGroups = matchedMenuItem ? getParsedVariantGroups(matchedMenuItem) : [];
        const matchedVariant = varName ? variantGroups[0]?.options?.find((o: any) => o.name === varName) : null;
        const selectedVariant = matchedVariant || item.selected_variant || (varName ? { name: varName, price: item.unit_price } : undefined);

        const addons = Array.isArray(item.addons) ? item.addons : (Array.isArray(item.selected_addons) ? item.selected_addons : []);
        let unitPrice = Number(item.unit_price || item.price || (item.line_total && item.quantity ? Number(item.line_total) / Number(item.quantity) : 0));
        if (!unitPrice || unitPrice <= 0) {
          const fallbackBase = matchedVariant
            ? Number(matchedVariant.sellingPrice ?? matchedVariant.price ?? matchedMenuItem?.base_price ?? 0)
            : Number(matchedMenuItem?.selling_price || matchedMenuItem?.base_price || 0);
          unitPrice = fallbackBase;
        }
        const qty = Number(item.quantity || item.qty || 1);

        const fingerprintKey = getCartFingerprint(
          resolvedItemId,
          selectedVariant,
          addons
        );

        return {
          cart_id: `cart-${Date.now()}-${idx}-${Math.random().toString().slice(-4)}`,
          fingerprint_key: fingerprintKey,
          item_id: resolvedItemId,
          name: matchedMenuItem ? matchedMenuItem.name : itemName,
          variant_name: varName,
          addons: addons,
          unit_price: unitPrice,
          packaging_charge: Number(item.packaging_charge || (matchedMenuItem ? matchedMenuItem.packaging_charge : 0) || 0),
          quantity: qty,
          selected_variant: selectedVariant,
          is_veg: matchedMenuItem ? matchedMenuItem.is_veg : (item.is_veg ?? true),
          notes: item.notes || item.preparation_notes || item.special_instructions || "",
          kds_station: matchedMenuItem?.kds_station || item.kds_station || (item as any).station_name
        };
      });

      setCartItems(formattedCart);
      if (targetOrder.order_number) {
        setRecalledOrderNumber(targetOrder.order_number);
      }

      // Snapshot the baseline quantities for delta-item tracking on updated orders
      const baselineMap: Record<string, number> = {};
      formattedCart.forEach((it) => {
        const key = it.fingerprint_key || `${it.item_id}-${it.variant_name || ""}`;
        baselineMap[key] = (baselineMap[key] || 0) + it.quantity;
      });
      baselineOrderItemsRef.current = baselineMap;

      const rawMode = (targetOrder.order_mode || targetOrder.order_type || "dine_in").toLowerCase();
      if (rawMode.includes("take") || rawMode.includes("pickup")) {
        setOrderMode("takeaway");
        setSelectedTableId("");
        setSelectedWaiterId("");
      } else if (rawMode.includes("deliv")) {
        setOrderMode("delivery");
        setSelectedTableId("");
        setSelectedWaiterId("");
      } else {
        setOrderMode("dine_in");
        const matchedTable = tables.find(
          (t) =>
            (targetOrder.table_id && String(t.id) === String(targetOrder.table_id)) ||
            (targetOrder.table_name && t.table_number?.trim().toLowerCase() === targetOrder.table_name?.trim().toLowerCase())
        );
        const targetTableId = matchedTable ? matchedTable.id : (targetOrder.table_id || targetOrder.table_name || "");
        if (targetTableId) {
          setSelectedTableId(targetTableId);
        }
        if (targetOrder.waiter_id) {
          setSelectedWaiterId(targetOrder.waiter_id);
        }
      }

      if (targetOrder.customer_id) {
        setSelectedCustomerId(targetOrder.customer_id);
      } else if (targetOrder.customer_phone || targetOrder.customer_name) {
        const matchedCust = customers.find(
          (c: any) =>
            (targetOrder.customer_phone && c.phone === targetOrder.customer_phone) ||
            (targetOrder.customer_name && c.name?.toLowerCase() === targetOrder.customer_name?.toLowerCase())
        );
        if (matchedCust) {
          setSelectedCustomerId(matchedCust.id);
        }
      }

      if (targetOrder.notes) {
        setOrderNotes(targetOrder.notes);
      }
      if (targetOrder.discount_amount) {
        setDiscountAmount(Number(targetOrder.discount_amount));
      }
      if (targetOrder.tax_amount && Number(targetOrder.tax_amount) > 0) {
        setApplyGst(true);
      } else {
        setApplyGst(false);
      }

      toast.success(`Order #${targetOrder.order_number} loaded into cart for editing!`);
      setActiveMobileTab("cart");
    } catch (err: any) {
      console.error("Failed to recall order to cart", err);
      toast.error(`Failed to load order into cart: ${err?.message || "Unknown error"}`);
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    setRecalledOrderNumber(null);
    setDiscountAmount(0);
    setSelectedCustomerId("");
    setOrderNotes("");
    baselineOrderItemsRef.current = {};
    setActiveKOTSlips([]);
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("ssrone_cfd_sync");
        channel.postMessage({ type: "CLEAR_CART" });
        channel.close();
      }
    } catch {}
    toast.info("Cart cleared. Switched to New Order mode.");
  };

  const handleDeleteHeldBill = (id: string) => {
    setHeldBills((prev) => prev.filter((h) => h.id !== id));
    toast.success("Held bill deleted.");
  };

  // Send Order to KDS & Kitchen Station Thermal Printers ("Place Order & Print KOT")
  // Zero-Wait Architecture: Optimistic UI mutation (< 1.2ms) + Background Sync
  const handlePlaceOrderKOT = async () => {
    if (isSubmittingRef.current) return;
    if (cartItems.length === 0) return;
    if (orderMode === "dine_in" && !selectedTableId) {
      toast.error("Please select a dining table for Dine-In orders!");
      return;
    }
    if (orderMode === "delivery" && !selectedCustomerId) {
      toast.error("Customer Name & Mobile Number are REQUIRED for Delivery orders! Please select or create a customer.");
      setIsCreateCustomerModalOpen(true);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setTimeout(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }, 800);

    const startTime = performance.now();

    // 1. Generate client-side token & local order number & UUIDv4 idempotency key (< 0.1ms)
    const idempotencyKey = generateIdempotencyKey();
    const isUpdate = Boolean(recalledOrderNumber);
    const orderNum = recalledOrderNumber || undefined;
    const assignedNum = orderNum || generateLocalOrderNumber(activeBranchId, orderMode);
    const tokenNum = generateDailyTokenNumber();

    const isDineIn = orderMode === "dine_in";
    const selectedTable = isDineIn
      ? tables.find((t) => String(t.id) === String(selectedTableId) || String(t.table_number).toLowerCase() === String(selectedTableId).toLowerCase())
      : null;
    const selectedWaiter = isDineIn
      ? waiters.find((w) => String(w.id) === String(selectedWaiterId))
      : null;
    const selectedCust = customers.find((c) => String(c.id) === String(selectedCustomerId));

    const cartBackup = [...cartItems];

    // 2. Dispatch Station-Wise Thermal KOT Print Jobs (Instant Auto-Print, Zero Extra Clicks)
    // Determine delta items if order is being updated (recalledOrderNumber)
    const deltaItemsToPrint: POSCartItem[] = [];
    if (isUpdate) {
      const baseline = baselineOrderItemsRef.current || {};
      const consumedBaseline: Record<string, number> = { ...baseline };

      cartBackup.forEach((item) => {
        const key = item.fingerprint_key || `${item.item_id}-${item.variant_name || ""}`;
        const prevQty = consumedBaseline[key] || 0;
        if (item.quantity > prevQty) {
          const deltaQty = item.quantity - prevQty;
          deltaItemsToPrint.push({
            ...item,
            quantity: deltaQty,
          });
          consumedBaseline[key] = item.quantity;
        } else {
          consumedBaseline[key] = prevQty - item.quantity;
        }
      });
    } else {
      // Completely new order: all items in cart print to stations
      deltaItemsToPrint.push(...cartBackup);
    }

    // Partition delta items by their mapped kitchen station
    const stationSlipsMap: Record<string, StationKOTSlip> = {};
    deltaItemsToPrint.forEach((it) => {
      const st = resolveItemKitchenStation(it);
      if (!stationSlipsMap[st.name]) {
        stationSlipsMap[st.name] = {
          stationName: st.name,
          stationCode: st.code,
          printerName: st.printer,
          orderNumber: assignedNum,
          orderType: orderMode.toUpperCase(),
          tableName: selectedTable?.table_number,
          waiterName: selectedWaiter?.name,
          kotType: isUpdate ? "UPDATE" : "NEW",
          timestamp: new Date().toLocaleString(),
          items: [],
        };
      }
      stationSlipsMap[st.name].items.push({
        cart_id: it.cart_id,
        item_id: it.item_id,
        name: it.name,
        quantity: it.quantity,
        variant_name: it.variant_name,
        addons: it.addons,
        notes: it.notes,
        is_veg: it.is_veg,
      });
    });

    const generatedSlips = Object.values(stationSlipsMap);

    // Auto-Trigger Kitchen Station-wise Thermal Print directly via isolated print preview (Zero Popup, Zero Fullscreen scaling bug)
    if (generatedSlips.length > 0) {
      setActiveKOTSlips(generatedSlips);
      printKOTSlipsDirectly(generatedSlips);

      // Also queue into async print queue for audit & hardware routing
      generatedSlips.forEach((slip) => {
        enqueuePrintJob(assignedNum, "KOT", {
          station: slip.stationName,
          printerName: slip.printerName,
          orderNumber: assignedNum,
          orderType: slip.orderType,
          tableName: slip.tableName,
          waiterName: slip.waiterName,
          kotType: slip.kotType,
          items: slip.items,
          timestamp: slip.timestamp,
        });
      });
    } else if (isUpdate) {
      toast.info(`ℹ️ Order #${assignedNum} updated. No new items to print for kitchen.`);
      switchVirtualTab("tables");
    }

    // Update baseline snapshot so any further update knows latest sent state
    const newBaseline: Record<string, number> = {};
    cartBackup.forEach((it) => {
      const key = it.fingerprint_key || `${it.item_id}-${it.variant_name || ""}`;
      newBaseline[key] = (newBaseline[key] || 0) + it.quantity;
    });
    baselineOrderItemsRef.current = newBaseline;

    // 3. Construct optimistic POSOrder for local memory (< 0.1ms)
    const optimisticOrder: POSOrder = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order_number: assignedNum,
      order_type: orderMode.toUpperCase() as OrderType,
      order_mode: orderMode,
      customer_id: selectedCustomerId ? (Number(selectedCustomerId) || selectedCustomerId) : undefined,
      customer_name: selectedCust ? selectedCust.name : undefined,
      customer_phone: selectedCust ? selectedCust.phone : undefined,
      table_id: isDineIn && selectedTable ? selectedTable.id : undefined,
      table_name: isDineIn && selectedTable ? selectedTable.table_number : undefined,
      waiter_id: isDineIn && selectedWaiter ? Number(selectedWaiter.id) : undefined,
      waiter_name: isDineIn && selectedWaiter ? selectedWaiter.name : undefined,
      items: cartBackup,
      subtotal,
      packaging_charge: packagingChargeTotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      net_amount: netAmount,
      payment_method: paymentMethod,
      status: "CONFIRMED",
      created_at: new Date().toISOString(),
    };

    // 4. Mutate local table status & active order in memory (< 0.1ms)
    onOptimisticOrderCreate?.(
      optimisticOrder,
      isDineIn && selectedTable ? { tableId: selectedTable.id, status: "occupied" } : undefined
    );

    // 5. Clear cart & inputs immediately (< 0.1ms)
    setCartItems([]);
    setRecalledOrderNumber(null);
    setDiscountAmount(0);
    setOrderNotes("");

    // 6. Virtual view transition immediately to Table Floor for all orders
    switchVirtualTab("tables");

    // 7. Instant success toast (< 0.1ms)
    const elapsed = (performance.now() - startTime).toFixed(1);
    toast.success(
      orderNum
        ? `⚡ Order #${assignedNum} updated in ${elapsed}ms & ${generatedSlips.length > 0 ? "KOT dispatched!" : "saved!"}`
        : `⚡ KOT #${assignedNum} sent to KDS & ${generatedSlips.length} Kitchen Station(s) in ${elapsed}ms!`
    );

    // 8. Fire-and-forget background synchronization to IndexedDB & PostgreSQL
    const orderPayload = {
      order_number: assignedNum,
      is_update: isUpdate,
      branch_id: Number(activeBranchId),
      order_type: orderMode.toUpperCase() as OrderType,
      order_mode: orderMode,
      customer_id: selectedCustomerId ? (Number(selectedCustomerId) || selectedCustomerId) : null,
      table_id: isDineIn && selectedTable ? selectedTable.id : null,
      table_name: isDineIn && selectedTable ? selectedTable.table_number : undefined,
      waiter_id: isDineIn && selectedWaiter ? selectedWaiter.id : null,
      waiter_name: isDineIn && selectedWaiter ? selectedWaiter.name : undefined,
      items: cartBackup,
      subtotal,
      packaging_charge: packagingChargeTotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      net_amount: netAmount,
      payment_method: paymentMethod,
      status: "KOT_SENT",
    };

    syncOrderInBackground(orderPayload, idempotencyKey, {
      isKot: true,
      onSuccess: (serverOrder) => {
        onRefresh?.(serverOrder);
      },
    });
  };

  // Complete Payment & Settle Bill (Pay & Print)
  // Zero-Wait Architecture: Optimistic settlement (< 1.2ms) + Background Sync
  const handleCompleteAndSettle = async (overridePaymentMethod?: PaymentMethod) => {
    if (isSubmittingRef.current) return;
    if (cartItems.length === 0) return;
    if (orderMode === "dine_in" && !selectedTableId) {
      toast.error("Please select a dining table for Dine-In orders!");
      return;
    }
    if (orderMode === "delivery" && !selectedCustomerId) {
      toast.error("Customer Name & Mobile Number are REQUIRED for Delivery orders! Please select or create a customer.");
      setIsCreateCustomerModalOpen(true);
      return;
    }

    const effectivePaymentMethod = overridePaymentMethod || paymentMethod;
    if ((effectivePaymentMethod === "CREDIT_ACCOUNT" || (effectivePaymentMethod as string) === "credit") && !selectedCustomerId) {
      toast.error("Customer Account is strictly required for Udhar / Debt settlement! Please select or register a customer.");
      setIsCreateCustomerModalOpen(true);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setTimeout(() => {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }, 800);

    const startTime = performance.now();
    const cartBackup = [...cartItems];
    const orderNum = recalledOrderNumber || undefined;

    // 1. Generate client-side token & local order number & UUIDv4 idempotency key (< 0.1ms)
    const idempotencyKey = generateIdempotencyKey();
    const isUpdate = Boolean(recalledOrderNumber);
    const assignedNum = orderNum || generateLocalOrderNumber(activeBranchId, orderMode);

    const isDineIn = orderMode === "dine_in";
    const selectedTable = isDineIn
      ? tables.find((t) => String(t.id) === String(selectedTableId) || String(t.table_number).toLowerCase() === String(selectedTableId).toLowerCase())
      : null;
    const selectedWaiter = isDineIn
      ? waiters.find((w) => String(w.id) === String(selectedWaiterId))
      : null;
    const selectedCust = customers.find((c) => String(c.id) === String(selectedCustomerId));

    // 2. Dispatch Multi-Station KOT Prints to Kitchen Printers
    const stationGroups: Record<string, POSCartItem[]> = {};
    cartBackup.forEach((item) => {
      const menuItem = menuItems.find((m) => String(m.id) === String(item.item_id));
      const cat = categories.find((c) => String(c.id) === String(menuItem?.category_id));
      const stationName = cat?.name || menuItem?.category_name || "Kitchen Main";
      if (!stationGroups[stationName]) {
        stationGroups[stationName] = [];
      }
      stationGroups[stationName].push(item);
    });

    Object.keys(stationGroups).forEach((stName) => {
      const formattedStationItems = stationGroups[stName].map((it) => ({
        ...it,
        notes: it.notes || undefined,
        kotRemark: it.notes?.trim() ? `*** REMARK: ${it.notes.trim().toUpperCase()} ***` : undefined,
      }));
      enqueuePrintJob(assignedNum, "KOT", {
        station: stName,
        orderNumber: assignedNum,
        orderType: orderMode.toUpperCase(),
        tableName: selectedTable?.table_number,
        waiterName: selectedWaiter?.name,
        items: formattedStationItems,
        timestamp: new Date().toLocaleString(),
      });
    });

    // 3. Dispatch Customer Final Bill Receipt to Cashier Thermal Printer
    const printPayload = {
      orderNumber: renderSafeString(assignedNum),
      orderType: renderSafeString(orderMode).toUpperCase(),
      tableName: renderSafeString(selectedTable?.table_number),
      waiterName: renderSafeString(selectedWaiter?.name),
      customerName: renderSafeString(selectedCust ? selectedCust.name : undefined),
      customerPhone: renderSafeString(selectedCust ? selectedCust.phone : undefined),
      customerAddress: renderSafeString(selectedCust ? selectedCust.address : undefined),
      items: [...cartBackup],
      subtotal,
      packagingChargeTotal,
      taxAmount,
      discountAmount,
      netAmount,
      paymentMethod: renderSafeString(effectivePaymentMethod, "CASH"),
      timestamp: new Date().toLocaleString(),
    };

    setReceiptData(printPayload);
    enqueuePrintJob(assignedNum, "RECEIPT", printPayload);
    setIsReceiptModalOpen(true);

    // 4. Optimistically update table status to free & order status to COMPLETED (< 0.1ms)
    onOptimisticOrderSettle?.(
      assignedNum,
      isDineIn && selectedTable ? selectedTable.id : undefined
    );

    // 5. Clear cart & inputs immediately (< 0.1ms)
    setCartItems([]);
    setRecalledOrderNumber(null);
    setDiscountAmount(0);
    setOrderNotes("");
    baselineOrderItemsRef.current = {};
    setActiveKOTSlips([]);

    // 6. Instant success toast (< 0.1ms) & Soundbox Chime
    const elapsed = (performance.now() - startTime).toFixed(1);
    toast.success(
      orderNum
        ? `⚡ Order #${assignedNum} updated & settled in ${elapsed}ms!`
        : `⚡ Bill #${assignedNum} settled & completed in ${elapsed}ms!`
    );

    playPaymentSuccessSound();

    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("ssrone_cfd_sync");
        channel.postMessage({
          type: "ORDER_SETTLED",
          orderNumber: assignedNum,
          netAmount,
        });
        channel.close();
      }
    } catch {}

    // 7. Fire-and-forget background synchronization to IndexedDB & PostgreSQL
    const orderPayload = {
      order_number: assignedNum,
      is_update: isUpdate,
      branch_id: Number(activeBranchId),
      order_type: orderMode.toUpperCase() as OrderType,
      order_mode: orderMode,
      customer_id: selectedCustomerId ? (Number(selectedCustomerId) || selectedCustomerId) : null,
      table_id: isDineIn && selectedTable ? selectedTable.id : null,
      table_name: isDineIn && selectedTable ? selectedTable.table_number : undefined,
      waiter_id: isDineIn && selectedWaiter ? selectedWaiter.id : null,
      waiter_name: isDineIn && selectedWaiter ? selectedWaiter.name : undefined,
      items: cartBackup,
      subtotal,
      packaging_charge: packagingChargeTotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      net_amount: netAmount,
      payment_method: effectivePaymentMethod,
      status: "COMPLETED",
    };

    syncOrderInBackground(orderPayload, idempotencyKey, {
      onSuccess: (serverOrder) => {
        onRefresh?.(serverOrder);
      },
    });
  };

  const handleSettleAndPay = (method?: PaymentMethod) => {
    const targetMethod = method || paymentMethod;
    if (targetMethod === "UPI") {
      setIsUPIModalOpen(true);
      return;
    }
    if (method) setPaymentMethod(method);
    handleCompleteAndSettle(method);
  };



  return (
    <div className={`transition-all ${isFullScreenPOS ? "fixed inset-0 z-50 bg-background p-2 sm:p-2.5 pb-3 overflow-hidden flex flex-col h-[100dvh] max-h-[100dvh] w-screen" : "h-[calc(100vh-4.25rem)] flex flex-col overflow-hidden space-y-2"}`}>
      {/* 1. BILLING TERMINAL VIEW (Permanently hot in DOM for 0ms transitions) */}
      <div className={activeVirtualTab === "billing" ? "flex flex-col h-full min-h-0 overflow-hidden relative" : "hidden"}>
        {/* Mobile/Tablet Segmented Switcher Tab Bar (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center justify-between gap-2 bg-card border border-border p-1 rounded-lg shrink-0 mb-2">
          <button
            type="button"
            onClick={() => setActiveMobileTab("menu")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMobileTab === "menu"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>🍽️ Dish Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("cart")}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeMobileTab === "cart"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>🛒 Active Cart</span>
            {cartItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Main Desktop POS Layout: High-Efficiency Grid (Left 2-Col Item Grid, Right 1-Col Cart Panel) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-hidden min-h-0">
          {/* Menu Catalog Panel (2 Cols on Large Screen, toggled on mobile) */}
          <div className={`lg:col-span-2 flex flex-col h-full min-h-0 max-h-full overflow-hidden ${activeMobileTab === "menu" ? "flex" : "hidden lg:flex"}`}>
            <POSItemGrid
              categories={categories}
              menuItems={menuItems}
              cartItems={cartItems}
              tables={tables}
              waiters={waiters}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToCart={handleAddToCart}
              isFullScreenPOS={isFullScreenPOS}
              onToggleFullScreen={toggleKioskFullScreen}
              onNavigateToTables={() => switchVirtualTab("tables")}
            />
          </div>

          {/* Cart Panel (1 Col on Large Screen, toggled on mobile) */}
          <div className={`lg:col-span-1 flex flex-col h-full min-h-0 max-h-full overflow-hidden ${activeMobileTab === "cart" ? "flex" : "hidden lg:flex"}`}>
            <POSCartPanel
              orderNumber={recalledOrderNumber || ""}
              cartItems={cartItems}
              allMenuItems={menuItems}
              subtotal={subtotal}
              taxAmount={taxAmount}
              packagingChargeTotal={packagingChargeTotal}
              discountAmount={discountAmount}
              setDiscountAmount={setDiscountAmount}
              applyGst={applyGst}
              setApplyGst={setApplyGst}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              orderNotes={orderNotes}
              setOrderNotes={setOrderNotes}
              onUpdateItemNotes={handleUpdateItemNotes}
              onSwapCartItemVariant={handleSwapCartItemVariant}
              netAmount={netAmount}
              orderMode={orderMode}
              setOrderMode={handleSetOrderMode}
              selectedTableId={selectedTableId}
              setSelectedTableId={setSelectedTableId}
              selectedWaiterId={selectedWaiterId}
              setSelectedWaiterId={setSelectedWaiterId}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              customers={customers}
              onOpenCreateCustomerModal={() => setIsCreateCustomerModalOpen(true)}
              onCreateNewCustomerWithSearchTerm={handleOpenCreateCustomerWithSearchTerm}
              onOpenTablesModal={() => setIsTableModalOpen(true)}
              onOpenQueueTokenModal={() => setIsQueueTokenModalOpen(true)}
              tables={tables}
              waiters={waiters}
              orders={orders}
              onRecallOrderToCart={handleRecallOrderToCart}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isSubmitting={isSubmitting}
              heldBillsCount={heldBills.length}
              activeOrdersCount={orders.filter(o => !["completed", "paid", "cancelled"].includes((o.status || "").toLowerCase())).length}
              onUpdateQty={handleUpdateQty}
              onSetDirectQty={handleSetDirectQty}
              onEditCartItem={handleEditCartItem}
              onRemoveCartItem={handleRemoveCartItem}
              onAddToCart={handleAddToCart}
              onPlaceOrderKOT={handlePlaceOrderKOT}
              onHoldBill={handleHoldBill}
              onOpenHoldModal={() => setIsHoldModalOpen(true)}
              onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
              onCompleteAndSettle={handleCompleteAndSettle}
              onClearCart={handleClearCart}
              onOpenCartItemAddons={handleOpenCartItemAddons}
              onToggleCartItemAddon={handleToggleCartItemAddon}
            />
          </div>
        </div>

        {/* Mobile Floating Sticky Footer Bar */}
        {activeMobileTab === "menu" && cartItems.length > 0 && (
          <div className="lg:hidden shrink-0 mt-1 bg-card border border-border p-2 rounded-xl shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveMobileTab("cart")}
              className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl shadow-xl flex items-center justify-between font-bold text-xs cursor-pointer hover:opacity-95 transition-all border border-primary-foreground/20 active:scale-98"
            >
              <div className="flex items-center gap-2">
                <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-md font-mono text-xs">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)} Items
                </span>
                <span>View Billing Cart</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm">
                <span>₹{netAmount}</span>
                <span>→</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 2. TABLE FLOOR TRACKER (Permanently hot in DOM for 0ms transitions) */}
      <div className={activeVirtualTab === "tables" ? "flex flex-col h-full min-h-0 overflow-hidden relative" : "hidden"}>
        <POSTableTrackerPage
          tables={tables}
          orders={orders}
          waiters={waiters}
          customers={customers}
          onRefreshCustomers={loadCustomers}
          onRecallOrderToCart={(order) => {
            handleRecallOrderToCart(order);
            switchVirtualTab("billing");
          }}
          onSelectTableForNewOrder={(tableId) => {
            setSelectedTableId(tableId);
            setOrderMode("dine_in");
            setRecalledOrderNumber(null);
            setCartItems([]);
            switchVirtualTab("billing");
          }}
          onSelectOrderModeForNewOrder={(mode) => {
            setOrderMode(mode);
            setSelectedTableId("");
            setSelectedWaiterId("");
            setRecalledOrderNumber(null);
            setCartItems([]);
            switchVirtualTab("billing");
          }}
          onSwitchView={switchVirtualTab}
          onPrintReceipt={(receiptPayload: any) => {
            setReceiptData(receiptPayload);
            setIsReceiptModalOpen(true);
          }}
          onRefresh={onRefresh}
          onOptimisticOrderSettle={onOptimisticOrderSettle}
          isFullScreenPOS={isFullScreenPOS}
          onToggleFullScreen={toggleKioskFullScreen}
        />
      </div>

      {/* 3. ORDERS LIST VIEW */}
      {activeVirtualTab === "orders" && (
        <POSOrdersListPage
          orders={orders}
          onRefresh={onRefresh}
          onOptimisticOrderSettle={onOptimisticOrderSettle}
          isFullScreenPOS={isFullScreenPOS}
          onToggleFullScreen={toggleKioskFullScreen}
          customers={customers}
          onRefreshCustomers={loadCustomers}
          onRecallOrderToCart={(order) => {
            handleRecallOrderToCart(order);
            switchVirtualTab("billing");
          }}
          onSwitchView={switchVirtualTab}
        />
      )}

      {/* 4. KDS VIEW */}
      {activeVirtualTab === "kds" && <KitchenDisplayPage orders={orders} />}

      {/* 5. SHIFT VIEW */}
      {activeVirtualTab === "shift" && <POSShiftPage />}

      {selectedItemForVariant && (
        <POSVariantAddonModal
          selectedItem={selectedItemForVariant}
          selectedVariantOption={selectedVariantOption}
          setSelectedVariantOption={activeAddonCartId ? undefined : setSelectedVariantOption}
          selectedAddonOptions={selectedAddonOptions}
          toggleAddonSelection={toggleAddonSelection}
          onCancel={handleCancelVariantAddonModal}
          onConfirm={handleConfirmVariantAndAddonsToCart}
          title={activeAddonCartId ? `Customize Addons: ${selectedItemForVariant.name}` : undefined}
          confirmLabel={activeAddonCartId ? "Save Addons to Cart" : undefined}
        />
      )}

      {/* Quick Customer Registration Modal */}
      {isCreateCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                  Register New Customer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-bold p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sumit Singh"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Customer Address (Optional)</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Green Park Avenue, Delhi"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="e.g. sumit@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingCustomer ? "Saving..." : "Create & Select Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tables Quick Selector Modal */}
      <POSTableTrackerModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        selectedTableId={selectedTableId}
        onSelectTable={(id) => {
          setSelectedTableId(id);
          setOrderMode("dine_in");
        }}
      />

      {/* Held Bills Modal */}
      <HoldBillsModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        heldBills={heldBills}
        onRecallBill={handleRecallBill}
        onDeleteBill={handleDeleteHeldBill}
      />

      {/* Active Orders & KOT Tracker Modal */}
      <ActiveOrdersTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        orders={orders}
        onRecallOrderToCart={handleRecallOrderToCart}
        onPrintReceipt={(ord) => {
          const ordCust = customers.find((c) => String(c.id) === String(ord.customer_id)) || {
            name: ord.customer_name,
            phone: ord.customer_phone,
            address: ord.customer_address
          };
          setReceiptData({
            orderNumber: renderSafeString(ord.order_number),
            orderType: renderSafeString(ord.order_mode || ord.order_type || "DINE_IN").toUpperCase(),
            tableName: renderSafeString(ord.table_name),
            waiterName: renderSafeString(ord.waiter_name),
            customerName: renderSafeString(ordCust?.name || ord.customer_name),
            customerPhone: renderSafeString(ordCust?.phone || ord.customer_phone),
            customerAddress: renderSafeString(ordCust?.address || ord.customer_address),
            items: ord.items || [],
            subtotal: ord.subtotal || 0,
            packagingChargeTotal: ord.packaging_charge || 0,
            taxAmount: ord.tax_amount || 0,
            discountAmount: ord.discount_amount || 0,
            netAmount: ord.net_amount || ord.grand_total || 0,
            paymentMethod: renderSafeString(ord.payment_method, "CASH"),
            timestamp: new Date().toLocaleString()
          });
          setIsReceiptModalOpen(true);
        }}
      />



      {/* Queue-Buster Token Recall Modal */}
      <POSQueueTokenModal
        isOpen={isQueueTokenModalOpen}
        onClose={() => setIsQueueTokenModalOpen(false)}
        menuItems={menuItems}
        onLoadTokenCart={(loadedItems, custName) => {
          setCartItems([]);
          loadedItems.forEach(({ item, quantity }) => {
            for (let i = 0; i < quantity; i++) {
              handleAddToCart(item);
            }
          });
          if (custName) {
            setNewCustName(custName);
          }
        }}
      />

      {/* Station-Wise KOT Thermal Printable Area (Auto-prints on Send KOT directly via native system print dialog) */}
      <ThermalKOTPrintableArea slips={activeKOTSlips} />

      {/* Thermal Receipt Preview Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          switchVirtualTab("tables");
        }}
        receiptData={receiptData}
      />

      {/* Dynamic UPI QR Modal with Soundbox Chime */}
      <POSUPIQRModal
        isOpen={isUPIModalOpen}
        onClose={() => setIsUPIModalOpen(false)}
        amount={netAmount}
        orderNumber={recalledOrderNumber || peekNextLocalOrderNumber()}
        onConfirmPayment={() => handleCompleteAndSettle("UPI")}
      />
    </div>
  );
};

