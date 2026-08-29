import React, { useState, useEffect } from "react";
import { KitchenDisplayPage } from "./kot-kds/KitchenDisplayPage";
import { POSShiftPage } from "./POSShiftPage";
import { useRouterState } from "@tanstack/react-router";
import { ChefHat, RefreshCw, CheckCircle2, Clock, Maximize2, Minimize2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { POSCategory, POSMenuItem, POSTable, POSWaiter, POSCartItem, OrderType, PaymentMethod, POSOrder } from "../../types";
import { POSItemGrid } from "./POSItemGrid";
import { POSCartPanel, OrderMode } from "./POSCartPanel";
import { POSVariantAddonModal } from "./POSVariantAddonModal";
import { HoldBillsModal, HeldBill } from "./pos-billing/HoldBillsModal";
import { ThermalReceiptModal } from "./pos-billing/ThermalReceiptModal";
import { ActiveOrdersTrackerModal } from "./pos-billing/ActiveOrdersTrackerModal";
import { POSTableTrackerPage } from "./tables-ops/POSTableTrackerPage";

interface POSTransactionSectionProps {
  categories: POSCategory[];
  menuItems: POSMenuItem[];
  tables: POSTable[];
  waiters: POSWaiter[];
  orders: POSOrder[];
  onCreateOrder: (order: Partial<POSOrder>) => Promise<void>;
  isLoading?: boolean;
}

export const POSTransactionSection: React.FC<POSTransactionSectionProps> = ({
  categories = [],
  menuItems = [],
  tables = [],
  waiters = [],
  orders = [],
  onCreateOrder,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos/transaction/billing";

  const isKDSView = currentPath.includes("/kds");
  const isShiftView = currentPath.includes("/shift") || currentPath.includes("/history");
  const isTablesTrackerView = currentPath.includes("/tables") || currentPath.includes("/table-tracker");

  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>("DINE_IN");
  const [orderMode, setOrderMode] = useState<OrderMode>("dine_in");
  const [selectedTableId, setSelectedTableId] = useState<number | string>("");
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreenPOS, setIsFullScreenPOS] = useState(false);

  // Customer Management State
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>("");
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
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
  }, []);

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
        email: newCustEmail.trim() || undefined,
        company_id: activeCompanyId ? Number(activeCompanyId) : undefined,
        branch_id: activeBranchId ? Number(activeBranchId) : undefined,
      });
      toast.success(`Customer "${newCustName}" created & selected!`);
      await loadCustomers();
      if (res && res.id) {
        setSelectedCustomerId(res.id);
      }
      setNewCustName("");
      setNewCustPhone("");
      setNewCustEmail("");
      setIsCreateCustomerModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create customer", err);
      toast.error(err?.response?.data?.detail || "Failed to create customer");
    } finally {
      setIsSavingCustomer(false);
    }
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
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Save held bills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("pos_held_bills", JSON.stringify(heldBills));
    } catch (e) {
      console.error("Failed to save held bills", e);
    }
  }, [heldBills]);

  // Check for pending order to edit from Order Tracker Page or selected table
  useEffect(() => {
    try {
      const pendingEdit = localStorage.getItem("edit_pos_order");
      if (pendingEdit) {
        const order = JSON.parse(pendingEdit);
        localStorage.removeItem("edit_pos_order");
        handleRecallOrderToCart(order);
      }
      const preselectedTableId = localStorage.getItem("selected_pos_table_id");
      if (preselectedTableId) {
        setSelectedTableId(preselectedTableId);
        localStorage.removeItem("selected_pos_table_id");
      }
    } catch (e) {
      console.error("Failed to load edit_pos_order or table_id", e);
    }
  }, []);

  // Global Keyboard Shortcuts Engine (F1=Hold, F2=KOT, F3=Settle, F11=FullScreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === "F2") {
        e.preventDefault();
        handlePlaceOrderKOT();
      } else if (e.key === "F3") {
        e.preventDefault();
        handleCompleteAndSettle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartItems, heldBills, isSubmitting, orderMode, selectedTableId, selectedWaiterId]);

  // Variant & Addons selector modal state
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<POSMenuItem | null>(null);
  const [selectedVariantOption, setSelectedVariantOption] = useState<any>(null);
  const [selectedAddonOptions, setSelectedAddonOptions] = useState<any[]>([]);

  const handleAddToCart = (item: POSMenuItem, explicitVariant?: any) => {
    // If an explicit variant chip was clicked directly on the tile, add it INSTANTLY (0 modal clicks!)
    if (explicitVariant) {
      const varPrice = Number(explicitVariant.sellingPrice ?? explicitVariant.price ?? item.selling_price ?? item.base_price);
      const varName = explicitVariant.name || "";
      const varId = explicitVariant.id || explicitVariant.name || "default";
      const fingerprintKey = `item_${item.id}_var_${varId}_addons_none`;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex((c) => c.fingerprint_key === fingerprintKey);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += 1;
          return updated;
        }
        return [
          ...prev,
          {
            cart_id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
            fingerprint_key: fingerprintKey,
            item_id: item.id,
            name: item.name,
            variant_name: varName,
            addons: [],
            unit_price: varPrice,
            packaging_charge: item.packaging_charge || 10,
            quantity: 1,
            selected_variant: explicitVariant,
            is_veg: item.is_veg
          }
        ];
      });
      return;
    }

    const hasVariants = item.variant_groups && item.variant_groups.length > 0;
    const hasAddons = item.addon_groups && item.addon_groups.length > 0;

    if (hasVariants || hasAddons) {
      setSelectedItemForVariant(item);
      const defaultVar =
        item.variant_groups?.[0]?.options?.find((o: any) => o.is_default) ||
        item.variant_groups?.[0]?.options?.[0] ||
        null;
      setSelectedVariantOption(defaultVar);
      setSelectedAddonOptions([]);
      return;
    }

    const price = Number(item.selling_price || item.base_price);
    const fingerprintKey = `item_${item.id}_default`;

    setCartItems((prev) => {
      const existing = prev.find((c) => (c.fingerprint_key || c.item_id) === fingerprintKey);
      if (existing) {
        return prev.map((c) =>
          (c.fingerprint_key || c.item_id) === fingerprintKey ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          cart_id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
          fingerprint_key: fingerprintKey,
          item_id: item.id,
          name: item.name,
          unit_price: price,
          packaging_charge: item.packaging_charge || 0,
          quantity: 1,
          is_veg: item.is_veg
        }
      ];
    });
  };

  const handleConfirmVariantAndAddonsToCart = () => {
    if (!selectedItemForVariant) return;

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
    const sortedAddonIds = selectedAddonOptions.map((a) => a.id || a.name).sort().join("_");
    const variantId = selectedVariantOption ? (selectedVariantOption.id || selectedVariantOption.name) : "default";

    const fingerprintKey = `item_${selectedItemForVariant.id}_var_${variantId}_addons_${sortedAddonIds}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.fingerprint_key === fingerprintKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
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
          unit_price: totalPrice,
          packaging_charge: selectedItemForVariant.packaging_charge || 10,
          quantity: 1,
          selected_variant: selectedVariantOption,
          is_veg: selectedItemForVariant.is_veg
        }
      ];
    });

    setSelectedItemForVariant(null);
    setSelectedVariantOption(null);
    setSelectedAddonOptions([]);
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
    const menuItem = menuItems.find((m) => String(m.id) === String(cartItem.item_id));
    if (!menuItem) return;
    setSelectedItemForVariant(menuItem);
    setSelectedVariantOption(cartItem.selected_variant || menuItem.variant_groups?.[0]?.options?.[0] || null);
    setSelectedAddonOptions(cartItem.addons || []);
    // Filter out old instance so saving replaces it
    setCartItems((prev) => prev.filter((c) => c.cart_id !== cartItem.cart_id));
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((c) => c.cart_id !== cartId));
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

  // Hold Current Bill
  const handleHoldBill = () => {
    if (cartItems.length === 0) return;
    const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
    const newHeld: HeldBill = {
      id: `hold-${Date.now()}`,
      orderType: orderMode.toUpperCase(),
      tableName: selectedTable?.table_number,
      items: [...cartItems],
      subtotal,
      heldAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setHeldBills((prev) => [newHeld, ...prev]);
    setCartItems([]);
    setDiscountAmount(0);
    toast.success(`Bill held successfully! (${newHeld.items.length} items paused)`);
  };

  const handleRecallBill = (bill: HeldBill) => {
    setCartItems(bill.items);
    setOrderMode((bill.orderType.toLowerCase() as OrderMode) || "dine_in");
    setHeldBills((prev) => prev.filter((h) => h.id !== bill.id));
    toast.success("Held bill loaded into cart!");
  };

  const handleRecallOrderToCart = (order: POSOrder) => {
    if (!order.items || order.items.length === 0) {
      toast.error("No items found in this order.");
      return;
    }
    const formattedCart: POSCartItem[] = order.items.map((item: any, idx: number) => ({
      cart_id: `cart-${Date.now()}-${idx}`,
      fingerprint_key: `recalled_${item.item_id || item.product_id || item.id || idx}`,
      item_id: item.item_id || item.product_id || item.id,
      name: item.name || item.product_name || item.item_name || item.menu_item_name || item.title || "Item",
      variant_name: item.variant_name,
      unit_price: Number(item.unit_price || item.price || 0),
      packaging_charge: item.packaging_charge || 0,
      quantity: item.quantity || 1,
      is_veg: item.is_veg ?? true
    }));
    setCartItems(formattedCart);
    if (order.order_mode) {
      setOrderMode(order.order_mode as OrderMode);
    }
    if (order.table_id) {
      setSelectedTableId(order.table_id);
    }
    if (order.waiter_id) {
      setSelectedWaiterId(order.waiter_id);
    }
    toast.success(`Order #${order.order_number} loaded into cart for editing!`);
  };

  const handleDeleteHeldBill = (id: string) => {
    setHeldBills((prev) => prev.filter((h) => h.id !== id));
    toast.success("Held bill deleted.");
  };

  // Send Order to KDS ("Place Order & Print KOT")
  const handlePlaceOrderKOT = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
      const selectedWaiter = waiters.find((w) => String(w.id) === String(selectedWaiterId));
      const orderNum = `ORD-${Date.now().toString().slice(-6)}`;

      await onCreateOrder({
        order_number: orderNum,
        order_type: orderMode.toUpperCase() as OrderType,
        order_mode: orderMode,
        table_id: selectedTable?.id,
        table_name: selectedTable?.table_number,
        waiter_id: selectedWaiter?.id,
        waiter_name: selectedWaiter?.name,
        items: cartItems,
        subtotal,
        packaging_charge: packagingChargeTotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        net_amount: netAmount,
        payment_method: paymentMethod,
        status: "KOT_SENT"
      });

      setCartItems([]);
      setDiscountAmount(0);
      toast.success(`KOT #${orderNum} sent to Kitchen Display System!`);
    } catch (err: any) {
      console.error("KOT submission failed:", err);
      toast.error("Failed to send KOT to kitchen");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Payment & Settle Bill
  const handleCompleteAndSettle = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
      const selectedWaiter = waiters.find((w) => String(w.id) === String(selectedWaiterId));
      const orderNum = `ORD-${Date.now().toString().slice(-6)}`;

      await onCreateOrder({
        order_number: orderNum,
        order_type: orderMode.toUpperCase() as OrderType,
        order_mode: orderMode,
        table_id: selectedTable?.id,
        table_name: selectedTable?.table_number,
        waiter_id: selectedWaiter?.id,
        waiter_name: selectedWaiter?.name,
        items: cartItems,
        subtotal,
        packaging_charge: packagingChargeTotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        net_amount: netAmount,
        payment_method: paymentMethod,
        status: "COMPLETED"
      });

      // Prepare Thermal Receipt
      setReceiptData({
        orderNumber: orderNum,
        orderType: orderMode.toUpperCase(),
        tableName: selectedTable?.table_number,
        waiterName: selectedWaiter?.name,
        items: [...cartItems],
        subtotal,
        packagingChargeTotal,
        taxAmount,
        discountAmount,
        netAmount,
        paymentMethod,
        timestamp: new Date().toLocaleString()
      });
      setIsReceiptModalOpen(true);

      setCartItems([]);
      setDiscountAmount(0);
      toast.success(`Bill #${orderNum} settled successfully!`);
    } catch (err: any) {
      console.error("Order settlement failed:", err);
      toast.error("Failed to complete bill settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`transition-all ${isFullScreenPOS ? "fixed inset-0 z-50 bg-background p-2.5 overflow-hidden flex flex-col h-screen w-screen" : "h-[calc(100vh-4.25rem)] flex flex-col overflow-hidden space-y-2"}`}>
      {!isKDSView && !isShiftView && !isTablesTrackerView ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 h-full flex-1 min-h-0 overflow-hidden items-start">
          {/* Main Item Grid (2 Cols on Large Screen) */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-0 max-h-full overflow-hidden">
            <POSItemGrid
              categories={categories}
              menuItems={menuItems}
              tables={tables}
              waiters={waiters}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToCart={handleAddToCart}
              isFullScreenPOS={isFullScreenPOS}
              onToggleFullScreen={() => setIsFullScreenPOS((prev) => !prev)}
            />
          </div>

          {/* Cart Panel (1 Col on Large Screen) */}
          <div className="lg:col-span-1 flex flex-col h-full min-h-0 max-h-full overflow-hidden">
            <POSCartPanel
              cartItems={cartItems}
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
              netAmount={netAmount}
              orderMode={orderMode}
              setOrderMode={setOrderMode}
              selectedTableId={selectedTableId}
              setSelectedTableId={setSelectedTableId}
              selectedWaiterId={selectedWaiterId}
              setSelectedWaiterId={setSelectedWaiterId}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              customers={customers}
              onOpenCreateCustomerModal={() => setIsCreateCustomerModalOpen(true)}
              tables={tables}
              waiters={waiters}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isSubmitting={isSubmitting}
              heldBillsCount={heldBills.length}
              activeOrdersCount={orders.filter(o => !["completed", "paid", "cancelled"].includes((o.status || "").toLowerCase())).length}
              onUpdateQty={handleUpdateQty}
              onSetDirectQty={handleSetDirectQty}
              onEditCartItem={handleEditCartItem}
              onRemoveCartItem={handleRemoveCartItem}
              onPlaceOrderKOT={handlePlaceOrderKOT}
              onHoldBill={handleHoldBill}
              onOpenHoldModal={() => setIsHoldModalOpen(true)}
              onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
              onCompleteAndSettle={handleCompleteAndSettle}
            />
          </div>
        </div>
      ) : isTablesTrackerView ? (
        <POSTableTrackerPage
          tables={tables}
          orders={orders}
          waiters={waiters}
          onRecallOrderToCart={handleRecallOrderToCart}
          onSelectTableForNewOrder={(tableId) => setSelectedTableId(tableId)}
        />
      ) : isKDSView ? (
        <KitchenDisplayPage orders={orders} />
      ) : (
        <POSShiftPage />
      )}

      {selectedItemForVariant && (
        <POSVariantAddonModal
          selectedItem={selectedItemForVariant}
          selectedVariantOption={selectedVariantOption}
          setSelectedVariantOption={setSelectedVariantOption}
          selectedAddonOptions={selectedAddonOptions}
          toggleAddonSelection={toggleAddonSelection}
          onCancel={() => setSelectedItemForVariant(null)}
          onConfirm={handleConfirmVariantAndAddonsToCart}
        />
      )}

      {/* Quick Customer Registration Modal */}
      {isCreateCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                <span>Register New Customer</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateCustomerModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Sumit Singh"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="e.g. sumit@example.com"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
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
          setReceiptData({
            orderNumber: ord.order_number,
            orderType: ord.order_mode?.toUpperCase() || ord.order_type || "DINE_IN",
            tableName: ord.table_name,
            waiterName: ord.waiter_name,
            items: ord.items || [],
            subtotal: ord.subtotal || 0,
            packagingChargeTotal: ord.packaging_charge || 0,
            taxAmount: ord.tax_amount || 0,
            discountAmount: ord.discount_amount || 0,
            netAmount: ord.net_amount || ord.grand_total || 0,
            paymentMethod: ord.payment_method || "CASH",
            timestamp: new Date().toLocaleString()
          });
          setIsReceiptModalOpen(true);
        }}
      />

      {/* Thermal Receipt Preview Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </div>
  );
};
