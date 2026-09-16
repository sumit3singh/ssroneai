import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Receipt, Plus, Minus, Trash2, ChevronRight, ShoppingBag, UtensilsCrossed, Truck, Pause, Play, CheckCircle2, ChefHat, User, UserPlus, Edit3, LayoutGrid, Search, Keyboard } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSCartItem, PaymentMethod, POSTable, POSWaiter, POSMenuItem, getParsedVariantGroups, getParsedAddonGroups } from "../../types";
import { PAYMENT_METHODS } from "../../constants";
import { POSSearchableCombobox, ComboboxOption } from "../../components/POSSearchableCombobox";
import { POSOrderHoverTooltip } from "../../components/POSOrderHoverTooltip";
import { POSKeyboardShortcutsModal } from "../../components/POSKeyboardShortcutsModal";
import { renderSafeString } from "../../utils/renderSafeString";


export type OrderMode = "dine_in" | "takeaway" | "delivery";

interface POSCartPanelProps {
  orderNumber?: string;
  cartItems: POSCartItem[];
  allMenuItems?: POSMenuItem[];
  subtotal: number;
  taxAmount: number;
  packagingChargeTotal: number;
  discountAmount: number;
  setDiscountAmount: (discount: number) => void;
  applyGst?: boolean;
  setApplyGst?: (val: boolean) => void;
  discountType?: "amount" | "percent";
  setDiscountType?: (type: "amount" | "percent") => void;
  discountValue?: number;
  setDiscountValue?: (val: number) => void;
  orderNotes?: string;
  setOrderNotes?: (notes: string) => void;
  onUpdateItemNotes?: (cartId: string, notes: string) => void;
  netAmount: number;
  orderMode: OrderMode;
  setOrderMode: (mode: OrderMode) => void;
  selectedTableId: number | string;
  setSelectedTableId: (id: number | string) => void;
  selectedWaiterId: number | string;
  setSelectedWaiterId: (id: number | string) => void;
  selectedCustomerId?: number | string;
  setSelectedCustomerId?: (id: number | string) => void;
  customers?: any[];
  onOpenCreateCustomerModal?: () => void;
  onOpenTablesModal?: () => void;
  onOpenQueueTokenModal?: () => void;
  tables: POSTable[];
  waiters: POSWaiter[];
  orders?: any[];
  onRecallOrderToCart?: (order: any) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  isSubmitting: boolean;
  heldBillsCount: number;
  activeOrdersCount?: number;
  onCreateNewCustomerWithSearchTerm?: (term: string) => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onSetDirectQty?: (cartId: string, qty: number) => void;
  onEditCartItem?: (item: POSCartItem) => void;
  onRemoveCartItem: (cartId: string) => void;
  onAddToCart?: (item: POSMenuItem) => void;
  onPlaceOrderKOT: () => void;
  onHoldBill: () => void;
  onOpenHoldModal: () => void;
  onOpenTrackerModal?: () => void;
  onCompleteAndSettle: () => void;
  onClearCart?: () => void;
  onSwapCartItemVariant?: (cartId: string, newVariant: any) => void;
  onOpenCartItemAddons?: (cartId: string) => void;
  onToggleCartItemAddon?: (cartId: string, addonOpt: any) => void;
}

export const POSCartPanel: React.FC<POSCartPanelProps> = ({
  orderNumber,
  cartItems,
  allMenuItems = [],
  subtotal,
  taxAmount,
  packagingChargeTotal,
  discountAmount,
  setDiscountAmount,
  applyGst = false,
  setApplyGst,
  discountType = "amount",
  setDiscountType,
  discountValue = 0,
  setDiscountValue,
  orderNotes = "",
  setOrderNotes,
  onUpdateItemNotes,
  netAmount,
  orderMode,
  setOrderMode,
  selectedTableId,
  setSelectedTableId,
  selectedWaiterId,
  setSelectedWaiterId,
  selectedCustomerId = "",
  setSelectedCustomerId,
  customers = [],
  onOpenCreateCustomerModal,
  onCreateNewCustomerWithSearchTerm,
  onOpenTablesModal,
  onOpenQueueTokenModal,
  tables = [],
  waiters = [],
  orders = [],
  onRecallOrderToCart,
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
  heldBillsCount,
  activeOrdersCount = 0,
  onUpdateQty,
  onSetDirectQty,
  onEditCartItem,
  onRemoveCartItem,
  onAddToCart,
  onPlaceOrderKOT,
  onHoldBill,
  onOpenHoldModal,
  onOpenTrackerModal,
  onCompleteAndSettle,
  onClearCart,
  onSwapCartItemVariant,
  onOpenCartItemAddons,
  onToggleCartItemAddon
}) => {
  const navigate = useNavigate();
  const [isDismissedActiveOrders, setIsDismissedActiveOrders] = React.useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = React.useState<boolean>(false);
  const [showConcessionHelper, setShowConcessionHelper] = React.useState<boolean>(false);
  const [tenderedTenderInput, setTenderedTenderInput] = React.useState<string>("");
  const [activeSwapCartId, setActiveSwapCartId] = React.useState<string | null>(null);
  const [activeAddonsCartId, setActiveAddonsCartId] = React.useState<string | null>(null);
  const [openRemarkCartId, setOpenRemarkCartId] = React.useState<string | null>(null);
  const [armedDeleteCartId, setArmedDeleteCartId] = React.useState<string | null>(null);
  const armedTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close dropdown popovers on outside click
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest(".pos-cart-popover-anchor")) {
        setActiveSwapCartId(null);
        setActiveAddonsCartId(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Keyboard shortcut Alt+R: Auto-open remark input on latest cart item
  React.useEffect(() => {
    const handleFocusRemark = () => {
      if (cartItems.length > 0) {
        const lastItem = cartItems[cartItems.length - 1];
        setOpenRemarkCartId(lastItem.cart_id);
      }
    };
    window.addEventListener("pos-focus-remark", handleFocusRemark);
    return () => window.removeEventListener("pos-focus-remark", handleFocusRemark);
  }, [cartItems]);

  const handleTrashClick = (cartId: string) => {
    if (armedDeleteCartId === cartId) {
      if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current);
      setArmedDeleteCartId(null);
      onRemoveCartItem(cartId);
    } else {
      if (armedTimeoutRef.current) clearTimeout(armedTimeoutRef.current);
      setArmedDeleteCartId(cartId);
      armedTimeoutRef.current = setTimeout(() => {
        setArmedDeleteCartId(null);
      }, 2500);
    }
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const activeTableOrdersMap = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!orders || orders.length === 0) return map;

    orders.forEach((o: any) => {
      const s = (o.status || "").toLowerCase();
      if (["completed", "paid", "cancelled", "settled"].includes(s)) return;

      if (o.table_id) {
        const key = String(o.table_id);
        if (!map[key]) map[key] = [];
        map[key].push(o);
      } else if (o.table_name) {
        const matchingTbl = tables.find(t => t.table_number?.trim().toLowerCase() === o.table_name?.trim().toLowerCase());
        if (matchingTbl) {
          const key = String(matchingTbl.id);
          if (!map[key]) map[key] = [];
          map[key].push(o);
        }
      }
    });

    return map;
  }, [orders, tables]);

  // Combobox Options Adapters
  const customerOptions: ComboboxOption[] = React.useMemo(() => {
    const list: ComboboxOption[] = [];
    if (orderMode !== "delivery") {
      list.push({ value: "", label: "👤 Walk-in Guest (General)" });
    }
    customers.forEach((c: any) => {
      const cName = renderSafeString(c.name, "Guest");
      const cPhone = renderSafeString(c.phone);
      list.push({
        value: c.id,
        label: `👤 ${cName}`,
        sublabel: cPhone ? `Phone: ${cPhone}` : "No Phone",
      });
    });
    return list;
  }, [customers, orderMode]);

  const tableOptions: ComboboxOption[] = React.useMemo(() => {
    const list: ComboboxOption[] = [
      { value: "", label: "⚠️ Select Table (Required)" }
    ];
    tables.forEach((t: any) => {
      const activeOrds = activeTableOrdersMap[String(t.id)] || [];
      const isOccupied = activeOrds.length > 0;
      const ordPills = activeOrds.map((o: any) => `${o.order_number}`).join(",");

      list.push({
        value: t.id,
        label: `Table ${t.table_number}`,
        badge: isOccupied ? `🟢 OCCUPIED (${ordPills})` : undefined,
        badgeColor: isOccupied ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : undefined,
        isOccupied
      });
    });
    return list;
  }, [tables, activeTableOrdersMap]);

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-2xs flex flex-col justify-between h-full max-h-full overflow-hidden space-y-2 select-none">
      {/* Upper Cart Header & Order Mode Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Receipt size={15} className="text-primary" />
            <h3 className="font-mono font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              {orderNumber ? (
                <>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">EDIT {orderNumber}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">UPDATE MODE</span>
                  {onClearCart && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer ml-1"
                      title="Cancel Edit & Start New Order"
                    >
                      ✕ CANCEL
                    </button>
                  )}
                </>
              ) : (
                <span className="text-foreground font-black">NEW ORDER</span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {onOpenQueueTokenModal && (
              <button
                type="button"
                onClick={onOpenQueueTokenModal}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                title="Queue Token Recall [Alt+Q]"
              >
                <span>TOKEN (Alt+Q)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
              title="Keyboard Shortcuts & Barcode Guide [/ or Ctrl+K]"
            >
              <Keyboard size={11} />
              <span>KEYS</span>
            </button>
            {onOpenTrackerModal && (
              <button
                type="button"
                onClick={onOpenTrackerModal}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChefHat size={11} />
                <span>KOT ({activeOrdersCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenHoldModal}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Pause size={11} />
              <span>HELD ({heldBillsCount})</span>
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              {totalItemCount} ITEMS
            </span>
          </div>
        </div>

        {/* Order Mode Toggle (Dine-In, Takeaway, Delivery) */}
        <div className="grid grid-cols-3 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setOrderMode("dine_in")}
            className={`py-1 px-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
              orderMode === "dine_in"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <UtensilsCrossed size={12} />
            <span>Dine-In</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderMode("takeaway")}
            className={`py-1 px-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
              orderMode === "takeaway"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShoppingBag size={12} />
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => setOrderMode("delivery")}
            className={`py-1 px-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
              orderMode === "delivery"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Truck size={12} />
            <span>Delivery</span>
          </button>
        </div>

        {/* Table & Customer Selection in 1 SINGLE ROW (Side-by-Side) */}
        <div className="space-y-1 shrink-0">
          <div className={`grid gap-1.5 ${orderMode === "dine_in" ? "grid-cols-2" : "grid-cols-1"}`}>
            {orderMode === "dine_in" && (
              <POSSearchableCombobox
                triggerId="pos-table-combobox-trigger"
                shortcutBadge="Alt+T"
                value={selectedTableId}
                onChange={(val) => {
                  setSelectedTableId(val);
                  setIsDismissedActiveOrders(false);
                }}
                options={tableOptions}
                placeholder="Select Table"
                isRequiredWarning={!selectedTableId}
              />
            )}

            <POSSearchableCombobox
              triggerId="pos-customer-combobox-trigger"
              shortcutBadge="Alt+C"
              value={selectedCustomerId || ""}
              onChange={(val) => setSelectedCustomerId && setSelectedCustomerId(val)}
              options={customerOptions}
              placeholder={orderMode === "delivery" ? "⚠️ Customer required for delivery..." : "Type customer phone or name..."}
              icon={<User size={13} />}
              isRequiredWarning={orderMode === "delivery" && !selectedCustomerId}
              onCreateNewWithSearchTerm={onCreateNewCustomerWithSearchTerm}
            />
          </div>

          {orderMode === "delivery" && !selectedCustomerId && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center justify-between animate-pulse">
              <span>⚠️ Customer Name & Mobile Number are REQUIRED for Delivery orders.</span>
              {onOpenCreateCustomerModal && (
                <button
                  type="button"
                  onClick={onOpenCreateCustomerModal}
                  className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/40 text-[9px] cursor-pointer"
                >
                  + Add Customer
                </button>
              )}
            </div>
          )}

          {/* Inline Occupied Table Active Orders Action Banner (with Close Cross Button ✕) */}
          {orderMode === "dine_in" && (() => {
            if (isDismissedActiveOrders) return null;
            const activeOrds = activeTableOrdersMap[String(selectedTableId)] || [];
            if (activeOrds.length === 0) return null;

            return (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-1.5 space-y-1 relative">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <span>🟢 Table has {activeOrds.length} Active Order{activeOrds.length > 1 ? "s" : ""}:</span>
                  <button
                    type="button"
                    onClick={() => setIsDismissedActiveOrders(true)}
                    className="p-0.5 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono font-bold text-[11px] cursor-pointer"
                    title="Dismiss active orders banner to save cart space"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pr-4">
                  {activeOrds.map((o: any) => (
                    <POSOrderHoverTooltip key={o.id} order={o}>
                      <button
                        type="button"
                        onClick={() => onRecallOrderToCart && onRecallOrderToCart(o)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Click to load and edit this active order in cart"
                      >
                        <Edit3 size={10} /> Edit {o.order_number} (₹{o.net_amount || o.subtotal || 0})
                      </button>
                    </POSOrderHoverTooltip>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Inline Active Takeaway Orders Banner */}
          {orderMode === "takeaway" && !isDismissedActiveOrders && (() => {
            const activeTakeaways = (orders || []).filter((o: any) => {
              const s = (o.status || "").toLowerCase();
              if (["completed", "paid", "cancelled", "settled"].includes(s)) return false;
              const m = (o.order_mode || o.order_type || "").toLowerCase();
              return m.includes("take") || m.includes("pickup");
            });
            if (activeTakeaways.length === 0) return null;

            return (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-1.5 space-y-1 relative">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  <span>🛍️ {activeTakeaways.length} Active Takeaway Order{activeTakeaways.length > 1 ? "s" : ""}:</span>
                  <button
                    type="button"
                    onClick={() => setIsDismissedActiveOrders(true)}
                    className="p-0.5 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono font-bold text-[11px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pr-4">
                  {activeTakeaways.map((o: any) => (
                    <POSOrderHoverTooltip key={o.id} order={o}>
                      <button
                        type="button"
                        onClick={() => onRecallOrderToCart && onRecallOrderToCart(o)}
                        className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Click to load and edit this active takeaway order in cart"
                      >
                        <Edit3 size={10} /> Edit {o.order_number} (₹{o.net_amount || o.subtotal || 0})
                      </button>
                    </POSOrderHoverTooltip>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Inline Active Delivery Orders Banner */}
          {orderMode === "delivery" && !isDismissedActiveOrders && (() => {
            const activeDeliveries = (orders || []).filter((o: any) => {
              const s = (o.status || "").toLowerCase();
              if (["completed", "paid", "cancelled", "settled"].includes(s)) return false;
              const m = (o.order_mode || o.order_type || "").toLowerCase();
              return m.includes("deliv");
            });
            if (activeDeliveries.length === 0) return null;

            return (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-1.5 space-y-1 relative">
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  <span>🚚 {activeDeliveries.length} Active Delivery Order{activeDeliveries.length > 1 ? "s" : ""}:</span>
                  <button
                    type="button"
                    onClick={() => setIsDismissedActiveOrders(true)}
                    className="p-0.5 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded font-mono font-bold text-[11px] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 pr-4">
                  {activeDeliveries.map((o: any) => (
                    <POSOrderHoverTooltip key={o.id} order={o}>
                      <button
                        type="button"
                        onClick={() => onRecallOrderToCart && onRecallOrderToCart(o)}
                        className="px-1.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200 border border-indigo-500/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="Click to load and edit this active delivery order in cart"
                      >
                        <Edit3 size={10} /> Edit {o.order_number} (₹{o.net_amount || o.subtotal || 0})
                      </button>
                    </POSOrderHoverTooltip>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Scrollable Cart Items List (Ultra-Sleek Antigravity Scrollbar & Compact High-Density Rows) */}
        <div className="space-y-1 py-0.5 flex-1 overflow-y-auto pr-0.5 min-h-0 scrollbar-antigravity">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[80px] flex items-center justify-center text-center text-xs font-medium text-muted-foreground border border-dashed border-border rounded-md p-3">
              Cart is empty. Click items on left to add to bill.
            </div>
          ) : (
            cartItems.map((c, index) => {
              const srNo = index + 1;
              const menuItem = allMenuItems?.find(
                (m) => String(m.id) === String(c.item_id) || m.name?.trim().toLowerCase() === c.name?.trim().toLowerCase()
              );
              const variantGroups = menuItem ? getParsedVariantGroups(menuItem) : [];
              const addonGroups = menuItem ? getParsedAddonGroups(menuItem) : [];
              const options = variantGroups[0]?.options || [];
              const hasVariants = options.length > 1;
              const hasAddons = addonGroups.length > 0 && addonGroups.some((ag: any) => Array.isArray(ag.options) && ag.options.length > 0);

              const cAddons = c.addons || c.selected_addons || c.addon_options || [];
              const addonStr = Array.isArray(cAddons)
                ? cAddons.map((a: any) => (typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || a?.label || ""))).filter(Boolean).join(", ")
                : "";

              return (
                <div
                  key={c.cart_id}
                  className="flex flex-col gap-1 bg-background px-2 py-1.5 rounded-md border border-border/80 text-xs shadow-2xs hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono font-bold text-[10px] text-muted-foreground/80 shrink-0 select-none">
                          {srNo}.
                        </span>
                        <h5 className="font-semibold text-foreground truncate text-[11px] leading-tight">{c.name}</h5>
                        <span className="font-mono text-[10px] font-medium text-muted-foreground shrink-0 whitespace-nowrap">
                          ₹{c.unit_price} × {c.quantity} = <strong className="text-foreground font-extrabold">₹{c.unit_price * c.quantity}</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {/* Variant / Size Pill with Dropdown / Swap */}
                        {c.variant_name ? (
                          <div className="relative inline-flex items-center pos-cart-popover-anchor">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!hasVariants) return;
                                setActiveAddonsCartId(null);
                                setActiveSwapCartId(activeSwapCartId === c.cart_id ? null : c.cart_id);
                              }}
                              className={`font-mono font-bold text-[9px] px-1.5 py-0.2 rounded-xs border transition-all flex items-center gap-0.5 ${
                                hasVariants
                                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 hover:bg-sky-500/25 cursor-pointer shadow-2xs"
                                  : "bg-primary/10 text-primary border-primary/20 cursor-default"
                              }`}
                              title={hasVariants ? "Click to swap size in-place" : undefined}
                            >
                              <span>[{c.variant_name}]</span>
                              {hasVariants && <span className="text-[8px] opacity-70">▾</span>}
                            </button>

                            {/* Inline Quick Size Swap Dropdown Popover */}
                            {activeSwapCartId === c.cart_id && hasVariants && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-full mt-1 z-30 bg-popover border border-border rounded shadow-lg p-1 flex items-center gap-1 animate-in fade-in zoom-in-95"
                              >
                                {options.map((opt: any) => {
                                  const isCurrent = (opt.name || "").toLowerCase() === (c.variant_name || "").toLowerCase();
                                  const optPrice = Number(opt.sellingPrice ?? opt.price ?? 0);
                                  return (
                                    <button
                                      key={opt.id || opt.name}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onSwapCartItemVariant) {
                                          onSwapCartItemVariant(c.cart_id, opt);
                                        }
                                        setActiveSwapCartId(null);
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap cursor-pointer transition-all ${
                                        isCurrent
                                          ? "bg-primary text-primary-foreground shadow-2xs"
                                          : "bg-muted/70 hover:bg-primary/20 text-foreground border border-border"
                                      }`}
                                    >
                                      {opt.name} ₹{optPrice}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Inline Addons Popover Dropdown (NO POPUP SCREEN MODAL) - ONLY SHOWN IF MENU ITEM HAS ADDONS */}
                        {(hasAddons || addonStr) && (
                          <div className="relative inline-flex items-center pos-cart-popover-anchor">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSwapCartId(null);
                                setActiveAddonsCartId(activeAddonsCartId === c.cart_id ? null : c.cart_id);
                              }}
                              className={`font-mono font-bold text-[9px] px-1.5 py-0.2 rounded-xs border transition-all flex items-center gap-0.5 cursor-pointer shadow-2xs ${
                                addonStr
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                              }`}
                              title={addonStr ? `Addons: ${addonStr}` : "Customize addons for this item"}
                            >
                              <span className="truncate max-w-[110px]">{addonStr ? `+ ${addonStr}` : "+ Addons"}</span>
                              <span className="text-[8px] opacity-70">▾</span>
                            </button>

                            {/* Inline Addons Popover Dropdown */}
                            {activeAddonsCartId === c.cart_id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-full mt-1 z-30 bg-popover border border-border rounded-md shadow-xl p-2 min-w-[210px] max-w-[280px] animate-in fade-in zoom-in-95 flex flex-col gap-1.5"
                              >
                                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                                  <span className="text-[10px] font-bold text-foreground">
                                    Addons {c.variant_name ? `(${c.variant_name})` : ""}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setActiveAddonsCartId(null)}
                                    className="text-muted-foreground hover:text-foreground text-[11px] font-bold px-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-0.5">
                                  {addonGroups.length === 0 && (
                                    <span className="text-[10px] text-muted-foreground italic px-1 py-1">No additional addons</span>
                                  )}
                                  {addonGroups.map((ag: any, gIdx: number) => {
                                    const opts = Array.isArray(ag.options) ? ag.options : [];
                                    if (opts.length === 0) return null;
                                    return (
                                      <div key={ag.id || ag.name || gIdx} className="flex flex-col gap-0.5">
                                        {addonGroups.length > 1 && (
                                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                                            {ag.name}
                                          </span>
                                        )}
                                        {opts.map((opt: any) => {
                                          const optId = opt.id || opt.name;
                                          const isSelected = Array.isArray(cAddons) && cAddons.some((a: any) => {
                                            const aId = typeof a === "object" && a !== null ? a.id : undefined;
                                            const aName = typeof a === "string" ? a : (a?.name || a?.title || a?.label || "");
                                            if (opt.id && aId && String(aId) === String(opt.id)) return true;
                                            return aName.trim().toLowerCase() === (opt.name || "").trim().toLowerCase();
                                          });
                                          
                                          // Calculate dynamic price based on the selected variant
                                          let dynamicPrice = Number(opt.price ?? opt.sellingPrice ?? opt.selling_price ?? 0);
                                          if (c.variant_name) {
                                            const vp = opt.variantPrices || opt.variant_prices;
                                            if (vp && typeof vp === "object" && vp[c.variant_name] !== undefined) {
                                              dynamicPrice = Number(vp[c.variant_name]);
                                            }
                                          }

                                          return (
                                            <label
                                              key={optId}
                                              className={`flex items-center justify-between px-1.5 py-1 rounded text-[10px] cursor-pointer border transition-colors select-none ${
                                                isSelected
                                                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/40 font-bold"
                                                  : "hover:bg-muted/60 text-foreground border-transparent"
                                              }`}
                                            >
                                              <div className="flex items-center gap-1.5 min-w-0">
                                                <input
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={() => {
                                                    if (onToggleCartItemAddon) {
                                                      onToggleCartItemAddon(c.cart_id, {
                                                        ...opt,
                                                        price: dynamicPrice,
                                                        calculatedPrice: dynamicPrice
                                                      });
                                                    }
                                                  }}
                                                  className="rounded border-border text-amber-600 focus:ring-amber-500 h-3 w-3 cursor-pointer"
                                                />
                                                <span className="truncate">{opt.name}</span>
                                              </div>
                                              <span className="font-mono text-[9px] text-muted-foreground ml-1.5 shrink-0">
                                                {dynamicPrice > 0 ? `+₹${dynamicPrice}` : "Free"}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Item Note Compact Toggle Button / Active Badge (Saves Space) */}
                        {c.notes ? (
                          <div className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded-xs border border-amber-500/30 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setOpenRemarkCartId(openRemarkCartId === c.cart_id ? null : c.cart_id)}
                              className="cursor-pointer hover:underline flex items-center gap-0.5"
                              title="Click to edit remark"
                            >
                              <span>📝 {c.notes}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateItemNotes && onUpdateItemNotes(c.cart_id, "")}
                              className="text-amber-600 hover:text-rose-500 cursor-pointer ml-0.5"
                              title="Remove note"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOpenRemarkCartId(openRemarkCartId === c.cart_id ? null : c.cart_id)}
                            className={`font-mono text-[9px] px-1.5 py-0.2 rounded-xs border border-dashed transition-all flex items-center gap-0.5 cursor-pointer ${
                              openRemarkCartId === c.cart_id
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50"
                                : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/60 border-border/70"
                            }`}
                            title="Add special instructions / note for kitchen"
                          >
                            <span>📝 + Note</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Direct Editable Quantity Control */}
                      <div className="flex items-center bg-muted/60 rounded-md border border-border h-5">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(c.cart_id, -1)}
                          className="px-1 h-full hover:bg-muted text-foreground rounded-l-md border-none cursor-pointer flex items-center justify-center"
                          title="Decrease quantity"
                        >
                          <Minus size={10} />
                        </button>
                        
                        <input
                          type="number"
                          min="1"
                          max="9999"
                          value={c.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0 && onSetDirectQty) {
                              onSetDirectQty(c.cart_id, val);
                            }
                          }}
                          className="w-7 text-center font-mono font-bold text-[10px] bg-transparent text-foreground focus:bg-background focus:outline-none border-none py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          title="Directly type bulk quantity (e.g. 124)"
                        />

                        <button
                          type="button"
                          onClick={() => onUpdateQty(c.cart_id, 1)}
                          className="px-1 h-full hover:bg-muted text-foreground rounded-r-md border-none cursor-pointer flex items-center justify-center"
                          title="Increase quantity"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* 2-Step Armed Delete Protection Button */}
                      {armedDeleteCartId === c.cart_id ? (
                        <button
                          type="button"
                          onClick={() => handleTrashClick(c.cart_id)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 cursor-pointer animate-pulse shadow-xs flex items-center gap-0.5"
                          title="Click again to confirm remove"
                        >
                          <span>Sure?</span>
                          <Trash2 size={10} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTrashClick(c.cart_id)}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-0.5 rounded-md border-none cursor-pointer transition-colors"
                          title="Remove item (Click to arm)"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item-Wise Preparation Remark Input (Only rendered when opened on-demand) */}
                  {openRemarkCartId === c.cart_id && (
                    <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-150">
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold shrink-0">📝 Note:</span>
                      <input
                        id={`pos-item-remark-${c.cart_id}`}
                        ref={(input) => input && input.focus()}
                        autoFocus
                        type="text"
                        value={c.notes || ""}
                        onChange={(e) => onUpdateItemNotes && onUpdateItemNotes(c.cart_id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            e.preventDefault();
                            setOpenRemarkCartId(null);
                          }
                        }}
                        placeholder="e.g. Less Spicy, No Onion, Extra Crispy..."
                        className="pos-item-remark-input text-[10px] bg-background border border-primary/60 focus:border-primary rounded px-2 py-0.5 w-full text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setOpenRemarkCartId(null)}
                        className="text-[9px] font-bold px-2 py-0.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 cursor-pointer shrink-0 transition-colors shadow-2xs"
                        title="Done editing note"
                      >
                        Done
                      </button>
                      {c.notes && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateItemNotes && onUpdateItemNotes(c.cart_id, "");
                            setOpenRemarkCartId(null);
                          }}
                          className="text-muted-foreground hover:text-rose-500 text-[10px] px-1 cursor-pointer shrink-0"
                          title="Clear and close note"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FIXED PINNED CHECKOUT FOOTER (Totals, Payment Method & 3-Tier Action Buttons F1, F2, F3) */}
      <div className="shrink-0 space-y-1.5 border-t border-border pt-1.5 bg-transparent">

        {/* Totals Breakdown */}
        <div className="space-y-0.5 text-xs font-medium text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono text-foreground font-semibold">₹{subtotal}</span>
          </div>

          {orderMode !== "dine_in" && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Packaging Charge</span>
              <span className="font-mono font-semibold">+₹{packagingChargeTotal}</span>
            </div>
          )}

          {/* DUAL DISCOUNT ENGINE (% or ₹) */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <span>Discount</span>
              {setDiscountType && (
                <div className="flex bg-muted rounded-xs border border-border p-0.2">
                  <button
                    type="button"
                    onClick={() => setDiscountType("amount")}
                    className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded-xs cursor-pointer ${
                      discountType === "amount" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={`px-1 py-0.2 text-[9px] font-mono font-bold rounded-xs cursor-pointer ${
                      discountType === "percent" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    %
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowConcessionHelper(!showConcessionHelper)}
                className="text-[10px] text-primary hover:underline font-semibold cursor-pointer ml-1"
                title="Quickly adjust odd bill difference when customer pays rounded cash"
              >
                {showConcessionHelper ? "Hide" : "Auto-Round"}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={discountValue || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (setDiscountValue) setDiscountValue(val);
                  else setDiscountAmount(val);
                }}
                placeholder="0"
                className="w-14 bg-background border border-border rounded-md px-1 py-0.5 text-right font-mono text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {discountType === "percent" && discountValue > 0 && (
                <span className="text-[10px] font-mono text-primary font-bold">(-₹{discountAmount})</span>
              )}
            </div>
          </div>

          {/* Quick Concession / Underpayment Assistant (e.g. Bill ₹240, Customer pays ₹200 -> Adjust ₹40 discount) */}
          {showConcessionHelper && (
            <div className="p-2 bg-primary/5 border border-primary/20 rounded-md space-y-1.5 text-xs animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground">Customer Paying:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-muted-foreground text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 200"
                    value={tenderedTenderInput}
                    onChange={(e) => setTenderedTenderInput(e.target.value)}
                    className="w-18 bg-background border border-border rounded px-1.5 py-0.5 text-right font-mono text-xs font-bold text-foreground"
                  />
                </div>
              </div>
              {Number(tenderedTenderInput) > 0 && (subtotal + taxAmount) > Number(tenderedTenderInput) && (
                <button
                  type="button"
                  onClick={() => {
                    const diff = Math.max(0, (subtotal + taxAmount) - Number(tenderedTenderInput));
                    if (setDiscountType) setDiscountType("amount");
                    if (setDiscountValue) setDiscountValue(diff);
                    setDiscountAmount(diff);
                    setShowConcessionHelper(false);
                    setTenderedTenderInput("");
                  }}
                  className="w-full bg-primary text-primary-foreground text-[10px] font-bold py-1 px-2 rounded cursor-pointer hover:opacity-95 transition-all text-center"
                >
                  Adjust ₹{((subtotal + taxAmount) - Number(tenderedTenderInput)).toFixed(0)} as Concession Discount (Net: ₹{tenderedTenderInput})
                </button>
              )}
            </div>
          )}

          {/* GST OPTIONAL TOGGLE CHECKBOX (DEFAULT UNSELECTED AS REQUESTED!) */}
          <div className="flex justify-between items-center text-xs pt-0.5">
            {setApplyGst ? (
              <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none text-foreground">
                <input
                  type="checkbox"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                />
                <span>Apply GST (5%)</span>
              </label>
            ) : (
              <span>GST (5%)</span>
            )}
            <span className={`font-mono font-bold ${applyGst ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
              ₹{taxAmount}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-foreground border-t border-border/80 pt-1">
            <span>Net Payable</span>
            <span className="font-mono text-primary text-base font-extrabold">₹{netAmount}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-3 gap-1 pt-0.5">
          {PAYMENT_METHODS.slice(0, 3).map((pm) => (
            <button
              key={pm.method}
              type="button"
              onClick={() => setPaymentMethod(pm.method)}
              className={`py-1.5 px-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer touch-manipulation active:scale-95 ${
                paymentMethod === pm.method
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{pm.label}</span>
            </button>
          ))}
        </div>

        {/* OPERATIONAL ACTION BUTTONS (Hold F1, Send KOT F2, Pay & Print F3) */}
        <div className="grid grid-cols-3 xs:grid-cols-[1fr_1.1fr_1.4fr] gap-1 pt-1 shrink-0">
          <Button
            type="button"
            onClick={onHoldBill}
            disabled={isSubmitting || cartItems.length === 0}
            className="h-10 px-1 bg-muted hover:bg-muted/80 text-foreground border border-border font-bold text-[11px] sm:text-xs rounded-md flex items-center justify-center gap-1 cursor-pointer touch-manipulation active:scale-95 whitespace-nowrap"
          >
            <span className="px-1 py-0.2 rounded bg-background border border-border font-mono text-[9px] text-muted-foreground hidden xs:inline-block">F1</span>
            <Pause size={12} />
            <span>Hold</span>
          </Button>

          <Button
            type="button"
            onClick={onPlaceOrderKOT}
            disabled={isSubmitting || cartItems.length === 0}
            className={`h-10 px-1 font-extrabold text-[11px] sm:text-xs rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all touch-manipulation active:scale-95 whitespace-nowrap ${
              orderNumber
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            <span className="px-1 py-0.2 rounded bg-black/20 font-mono text-[9px] hidden xs:inline-block">F2</span>
            <span>{orderNumber ? "KOT UPDATE" : "Send KOT"}</span>
            <ChevronRight size={12} className="hidden xs:inline-block" />
          </Button>

          <Button
            type="button"
            onClick={onCompleteAndSettle}
            disabled={isSubmitting || cartItems.length === 0}
            className={`h-10 px-1 sm:px-1.5 font-black text-[11px] sm:text-xs uppercase tracking-tight rounded-md flex items-center justify-center gap-1 cursor-pointer shadow-xs transition-all touch-manipulation active:scale-95 whitespace-nowrap ${
              orderNumber
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <span className="px-1.5 py-0.2 rounded bg-black/20 font-mono text-[9px] hidden xs:inline-block">F3</span>
            <CheckCircle2 size={13} />
            <span>
              {isSubmitting
                ? "Updating..."
                : orderNumber
                ? `PAY ₹${netAmount}`
                : `PAY & PRINT ₹${netAmount}`}
            </span>
          </Button>
        </div>
      </div>

      {/* POS Keyboard Shortcuts & Barcode Wedge Reference Modal */}
      <POSKeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};
