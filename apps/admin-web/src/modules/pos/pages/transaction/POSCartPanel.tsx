import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Receipt, Plus, Minus, Trash2, ChevronRight, ShoppingBag, UtensilsCrossed, Truck, Pause, Play, CheckCircle2, ChefHat, User, UserPlus, Edit3, LayoutGrid } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSCartItem, PaymentMethod, POSTable, POSWaiter } from "../../types";
import { PAYMENT_METHODS } from "../../constants";

export type OrderMode = "dine_in" | "takeaway" | "delivery";

interface POSCartPanelProps {
  cartItems: POSCartItem[];
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
  tables: POSTable[];
  waiters: POSWaiter[];
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  isSubmitting: boolean;
  heldBillsCount: number;
  activeOrdersCount?: number;
  onUpdateQty: (cartId: string, delta: number) => void;
  onSetDirectQty?: (cartId: string, qty: number) => void;
  onEditCartItem?: (item: POSCartItem) => void;
  onRemoveCartItem: (cartId: string) => void;
  onPlaceOrderKOT: () => void;
  onHoldBill: () => void;
  onOpenHoldModal: () => void;
  onOpenTrackerModal?: () => void;
  onCompleteAndSettle: () => void;
}

export const POSCartPanel: React.FC<POSCartPanelProps> = ({
  cartItems,
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
  tables = [],
  waiters = [],
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
  heldBillsCount,
  activeOrdersCount = 0,
  onUpdateQty,
  onSetDirectQty,
  onEditCartItem,
  onRemoveCartItem,
  onPlaceOrderKOT,
  onHoldBill,
  onOpenHoldModal,
  onOpenTrackerModal,
  onCompleteAndSettle
}) => {
  const navigate = useNavigate();
  const [tenderedAmount, setTenderedAmount] = React.useState<number>(0);
  const changeToReturn = Math.max(0, tenderedAmount - netAmount);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-2xs flex flex-col justify-between h-full max-h-full overflow-hidden space-y-2 select-none">
      {/* Upper Cart Header & Order Mode Section */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Receipt size={15} className="text-muted-foreground" />
            <h3 className="font-mono font-bold text-xs text-foreground uppercase tracking-wider">
              ORDER #10482
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate({ to: "/pos/transaction/tables" })}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LayoutGrid size={11} />
              <span>TABLES</span>
            </button>
            {onOpenTrackerModal && (
              <button
                type="button"
                onClick={onOpenTrackerModal}
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChefHat size={11} />
                <span>KOT ({activeOrdersCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenHoldModal}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:bg-muted/80 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Pause size={11} />
              <span>HELD ({heldBillsCount})</span>
            </button>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              {totalItemCount} ITEMS
            </span>
          </div>
        </div>

        {/* Customer Selection & Quick Create Customer Button (Single Row Column) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex-1 relative">
            <select
              value={selectedCustomerId || ""}
              onChange={(e) => setSelectedCustomerId && setSelectedCustomerId(e.target.value)}
              className="w-full bg-background border border-border rounded px-2 py-1 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary truncate cursor-pointer"
            >
              <option value="">👤 Walk-in Guest (General)</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  👤 {c.name} ({c.phone || "No Phone"})
                </option>
              ))}
            </select>
          </div>
          {onOpenCreateCustomerModal && (
            <button
              type="button"
              onClick={onOpenCreateCustomerModal}
              className="px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 text-2xs font-semibold rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Register New Customer Profile"
            >
              <UserPlus size={11} />
              <span>+ Customer</span>
            </button>
          )}
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

        {/* Table & Waiter Selection for Dine-In (Single Row Column) */}
        {orderMode === "dine_in" && (
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">Select Table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} ({t.capacity} seats)
                </option>
              ))}
            </select>

            <select
              value={selectedWaiterId}
              onChange={(e) => setSelectedWaiterId(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
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

        {/* Scrollable Cart Items List (Ultra-Sleek 3px Scrollbar & Compact High-Density Rows) */}
        <div className="space-y-1 py-0.5 flex-1 overflow-y-auto pr-0.5 min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-emerald-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[80px] flex items-center justify-center text-center text-xs font-medium text-muted-foreground border border-dashed border-border rounded-md p-3">
              Cart is empty. Click items on left to add to bill.
            </div>
          ) : (
            cartItems.map((c) => (
              <div
                key={c.cart_id}
                className="flex items-center justify-between bg-background px-2 py-1 rounded-md border border-border/80 text-xs shadow-2xs hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex-1 pr-1.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <h5 className="font-semibold text-foreground truncate text-[11px] leading-tight">{c.name}</h5>
                    {onEditCartItem && (
                      <button
                        type="button"
                        onClick={() => onEditCartItem(c)}
                        className="text-primary hover:bg-primary/10 p-0.5 rounded-sm transition-colors cursor-pointer shrink-0"
                        title="Edit Size / Addons for this item"
                      >
                        <Edit3 size={10} />
                      </button>
                    )}
                  </div>
                  {(c.variant_name || (c.addons && c.addons.length > 0)) && (
                    <div className="text-[9px] text-muted-foreground font-normal truncate leading-none mt-0.5">
                      {c.variant_name && <span className="font-mono font-bold text-primary bg-primary/10 px-1 py-0.1 rounded-xs border border-primary/20 mr-1">[{c.variant_name}]</span>}
                      {c.addons && c.addons.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                          + {c.addons.map((a: any) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="font-mono text-[10px] font-medium text-muted-foreground block leading-tight">
                    ₹{c.unit_price} × {c.quantity} = <strong className="text-foreground font-extrabold">₹{c.unit_price * c.quantity}</strong>
                  </span>
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

                  <button
                    type="button"
                    onClick={() => onRemoveCartItem(c.cart_id)}
                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-0.5 rounded-md border-none cursor-pointer transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FIXED PINNED CHECKOUT FOOTER (Totals, Payment Method & 3-Tier Action Buttons F1, F2, F3) */}
      <div className="shrink-0 space-y-1.5 border-t border-border pt-1.5 bg-transparent">
        {/* Kitchen Order Notes Field */}
        {setOrderNotes && (
          <div className="relative">
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Kitchen Order Remark (e.g. Less Spicy, Serve Starter First)..."
              className="w-full h-7 text-[10px] bg-background border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
            />
          </div>
        )}

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
              className={`py-1 px-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                paymentMethod === pm.method
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{pm.label}</span>
            </button>
          ))}
        </div>

        {/* QUICK CASH TENDERED & INSTANT CHANGE RETURN CALCULATOR */}
        {paymentMethod === "CASH" && (
          <div className="space-y-1 bg-muted/40 p-1.5 rounded-md border border-border">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground font-semibold">Tendered Cash:</span>
              <div className="flex items-center gap-1">
                {[netAmount, 100, 200, 500, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTenderedAmount(amt)}
                    className="px-1 py-0.2 rounded-xs bg-background border border-border text-[9px] font-mono hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  >
                    {amt === netAmount ? "Exact" : `₹${amt}`}
                  </button>
                ))}
              </div>
            </div>
            {tenderedAmount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold pt-0.5 border-t border-border/60">
                <span className="text-muted-foreground">Return Change:</span>
                <span className={`font-mono text-xs ${changeToReturn >= 0 ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-rose-500"}`}>
                  ₹{changeToReturn}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3-TIER OPERATIONAL ACTION BUTTONS (F1 Hold, F2 KOT, F3 Pay & Print) */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <Button
            type="button"
            onClick={onHoldBill}
            disabled={isSubmitting || cartItems.length === 0}
            className="h-8 bg-muted hover:bg-muted/80 text-foreground border border-border font-medium text-xs rounded flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="px-1 py-0.2 rounded bg-background border border-border font-mono text-[9px] text-muted-foreground">F1</span>
            <Pause size={12} />
            <span>Hold</span>
          </Button>

          <Button
            type="button"
            onClick={onPlaceOrderKOT}
            disabled={isSubmitting || cartItems.length === 0}
            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs rounded flex items-center justify-center gap-1 cursor-pointer"
          >
            <span className="px-1 py-0.2 rounded bg-primary-foreground/20 font-mono text-[9px]">F2</span>
            <span>Send KOT</span>
            <ChevronRight size={12} />
          </Button>
        </div>

        <Button
          type="button"
          onClick={onCompleteAndSettle}
          disabled={isSubmitting || cartItems.length === 0}
          className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="px-1.5 py-0.2 rounded bg-primary-foreground/20 font-mono text-[10px]">F3</span>
          <CheckCircle2 size={15} />
          <span>{isSubmitting ? "Settling..." : `PAY & PRINT ₹${netAmount}`}</span>
        </Button>
      </div>
    </div>
  );
};
