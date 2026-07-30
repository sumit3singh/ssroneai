import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ShoppingBag, Plus, Minus, Trash2, Search, Receipt,
  CheckCircle2, Clock, ChefHat, User, CreditCard, ChevronRight
} from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { POSCategory, POSMenuItem, POSTable, POSWaiter, POSCartItem, OrderType, PaymentMethod, POSOrder } from "../types";
import { ORDER_TYPES, PAYMENT_METHODS } from "../constants";

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
  isLoading = false
}) => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos/transaction/billing";

  const isKDSView = currentPath.includes("/kds");
  const isShiftView = currentPath.includes("/shift") || currentPath.includes("/history");
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>("DINE_IN");
  const [selectedTableId, setSelectedTableId] = useState<number | string>("");
  const [selectedWaiterId, setSelectedWaiterId] = useState<number | string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Variant selector modal state
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<POSMenuItem | null>(null);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategoryId) return item.category_id === selectedCategoryId;
    return true;
  });

  const handleAddToCart = (item: POSMenuItem) => {
    // If item has variants, open variant customization dialog
    if (item.variant_groups && item.variant_groups.length > 0) {
      setSelectedItemForVariant(item);
      return;
    }

    const price = item.selling_price || item.base_price;
    setCartItems((prev) => {
      const existing = prev.find((c) => c.item_id === item.id && !c.selected_variant);
      if (existing) {
        return prev.map((c) =>
          c.cart_id === existing.cart_id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          cart_id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
          item_id: item.id,
          name: item.name,
          unit_price: price,
          quantity: 1,
          is_veg: item.is_veg
        }
      ];
    });
  };

  const handleAddVariantToCart = (item: POSMenuItem, variant: any) => {
    const price = Number(variant.sellingPrice ?? variant.price ?? item.base_price);
    const cartId = `cart-${Date.now()}-${variant.id}`;

    setCartItems((prev) => [
      ...prev,
      {
        cart_id: cartId,
        item_id: item.id,
        name: `${item.name} (${variant.name})`,
        unit_price: price,
        quantity: 1,
        selected_variant: variant,
        is_veg: item.is_veg
      }
    ]);
    setSelectedItemForVariant(null);
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

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((c) => c.cart_id !== cartId));
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, c) => sum + c.unit_price * c.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST
  const netAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTable = tables.find((t) => String(t.id) === String(selectedTableId));
      const selectedWaiter = waiters.find((w) => String(w.id) === String(selectedWaiterId));

      await onCreateOrder({
        order_number: `POS-${Date.now().toString().slice(-6)}`,
        order_type: selectedOrderType,
        table_id: selectedTable?.id,
        table_name: selectedTable?.table_number,
        waiter_id: selectedWaiter?.id,
        waiter_name: selectedWaiter?.name,
        items: cartItems,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        net_amount: netAmount,
        payment_method: paymentMethod,
        status: "COMPLETED"
      });

      setCartItems([]);
      setDiscountAmount(0);
      alert("Order completed successfully!");
    } catch (err: any) {
      alert("Failed to submit order: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isKDSView && !isShiftView ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Catalog Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Bar */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-card">
              {/* Order Types */}
              <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border">
                {ORDER_TYPES.map((ot) => (
                  <button
                    key={ot.type}
                    onClick={() => setSelectedOrderType(ot.type)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-extrabold transition-all ${
                      selectedOrderType === ot.type
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    {ot.icon} {ot.label}
                  </button>
                ))}
              </div>

              {/* Table & Waiter Selectors for DINE_IN */}
              {selectedOrderType === "DINE_IN" && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="">Select Table</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} ({t.capacity} Seats)
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedWaiterId}
                    onChange={(e) => setSelectedWaiterId(e.target.value)}
                    className="bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="">Select Waiter</option>
                    {waiters.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Category Pills & Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dish by name..."
                  className="pl-8 h-9 text-xs bg-card border-border font-medium"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto max-w-md py-1">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-3 py-1 rounded-xl text-2xs font-extrabold whitespace-nowrap ${
                    selectedCategoryId === null ? "bg-primary text-white" : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`px-3 py-1 rounded-xl text-2xs font-extrabold whitespace-nowrap ${
                      selectedCategoryId === c.id ? "bg-primary text-white" : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    {c.icon || "🍛"} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dish Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => {
                const hasVariants = item.variant_groups && item.variant_groups.length > 0;
                const price = item.selling_price || item.base_price;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className="bg-card border border-border hover:border-primary/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer shadow-card hover:shadow-card-hover transition-all group relative"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`h-3.5 w-3.5 border-2 rounded-xs flex items-center justify-center p-0.5 ${
                            item.is_veg ? "border-green-600" : "border-red-600"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                        </span>
                        {hasVariants && (
                          <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                            Variants
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-foreground line-clamp-2">
                        {item.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between mt-2">
                      <span className="font-mono font-black text-xs text-foreground">
                        ₹{price}
                      </span>
                      <span className="text-2xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        + Add
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Column: Cart & Billing Panel */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4 flex flex-col justify-between h-[640px]">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  Active Cart & Billing Summary
                </h3>
                <span className="text-3xs font-mono font-bold text-muted-foreground">
                  {cartItems.length} items
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 py-3 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
                    Cart is empty. Click any item on the left to add to bill.
                  </div>
                ) : (
                  cartItems.map((c) => (
                    <div key={c.cart_id} className="flex items-center justify-between bg-muted/30 p-2.5 rounded-xl border border-border/60 text-xs">
                      <div className="flex-1 pr-2">
                        <h5 className="font-bold text-foreground line-clamp-1">{c.name}</h5>
                        <span className="font-mono text-2xs text-muted-foreground">₹{c.unit_price} x {c.quantity}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-card border border-border rounded-lg">
                          <button
                            onClick={() => handleUpdateQty(c.cart_id, -1)}
                            className="p-1 hover:bg-muted text-foreground rounded-l-lg border-none cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs">{c.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(c.cart_id, 1)}
                            className="p-1 hover:bg-muted text-foreground rounded-r-lg border-none cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveCartItem(c.cart_id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg border-none cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Billing Totals & Checkout */}
            <div className="space-y-3 border-t border-border pt-4 bg-card sticky bottom-0">
              <div className="space-y-1.5 text-xs font-semibold text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-foreground font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-mono text-foreground font-bold">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-background border border-border rounded-lg px-2 py-0.5 text-right font-mono text-xs font-bold"
                  />
                </div>
                <div className="flex justify-between text-sm font-extrabold text-foreground border-t border-border pt-2">
                  <span>Total Payable</span>
                  <span className="font-mono text-primary text-base">₹{netAmount}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {PAYMENT_METHODS.slice(0, 3).map((pm) => (
                  <button
                    key={pm.method}
                    onClick={() => setPaymentMethod(pm.method)}
                    className={`p-1.5 rounded-xl text-2xs font-extrabold flex items-center justify-center gap-1 border transition-all ${
                      paymentMethod === pm.method
                        ? "bg-primary text-white border-primary"
                        : "bg-muted/40 border-border text-muted-foreground"
                    }`}
                  >
                    <span>{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleCompleteOrder}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Processing..." : "Complete & Print Invoice"}</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      ) : isKDSView ? (
        /* KDS Stream view */
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
            <ChefHat size={20} className="text-primary" />
            Kitchen Display System (Live KOT Stream)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-border/80 pb-2">
                  <span className="font-mono font-black text-sm text-foreground">#{o.order_number}</span>
                  <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    {o.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs font-semibold">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.name}</span>
                      <span className="font-mono font-bold">x{i.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Transaction History */
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-display font-extrabold text-base text-foreground">Recent Transaction History</h3>
          <div className="divide-y divide-border/60">
            {orders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-black text-foreground">#{o.order_number}</span>
                  <p className="text-3xs text-muted-foreground">{o.order_type} • {o.items.length} items</p>
                </div>
                <span className="font-mono font-bold text-foreground">₹{o.net_amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant Selector Modal */}
      {selectedItemForVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-extrabold text-base text-foreground">
              Select Portion / Size for {selectedItemForVariant.name}
            </h3>

            <div className="space-y-2">
              {selectedItemForVariant.variant_groups?.[0]?.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAddVariantToCart(selectedItemForVariant, opt)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:border-primary border border-border font-bold text-xs transition-all"
                >
                  <span>{opt.name}</span>
                  <span className="font-mono font-black text-primary">₹{opt.sellingPrice ?? opt.price}</span>
                </button>
              ))}
            </div>

            <Button variant="outline" onClick={() => setSelectedItemForVariant(null)} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
