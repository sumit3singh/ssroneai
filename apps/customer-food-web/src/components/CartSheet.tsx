import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, MessageSquare, ArrowRight, Utensils, ShoppingCart, Bike } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useNavigate } from "react-router-dom";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import { useAuthStore } from "@ssrone/auth";
import { getDishPhoto } from "@/lib/foodImageHelper";
import ChangeOrderModeDialog from "@/components/ChangeOrderModeDialog";
import AddressSelectDialog from "@/components/AddressSelectDialog";
import TableCameraScannerModal from "@/components/TableCameraScannerModal";
import useTenantAppConfig from "@/hooks/useTenantAppConfig";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSheet = ({ isOpen, onClose }: CartSheetProps) => {
  const { items, updateQuantity, updateNotes, removeItem, clearCart, getTotal, setTableNumber } = useCartStore();
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();
  const { orderMode } = useAuthStore();
  const { taxSettings } = useTenantAppConfig();
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  // Dining Mode Switcher state
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isTableScanOpen, setIsTableScanOpen] = useState(false);

  const total = getTotal();
  const shouldApplyGst = taxSettings?.applyGst ?? false;
  const gstRate = taxSettings?.gstRate ?? 5;
  const tax = shouldApplyGst ? Math.round(total * (gstRate / 100)) : 0;
  const grandTotal = total + tax;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:w-[420px] max-h-[92dvh] sm:max-h-full bg-card text-card-foreground z-50 shadow-2xl rounded-t-[28px] sm:rounded-tr-none sm:rounded-br-none sm:rounded-l-3xl flex flex-col font-sans border-t sm:border-t-0 sm:border-l border-border overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Your Cart"
          >
            {/* Drag Handle on Mobile */}
            <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground leading-none font-serif">Your Cart</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    {items.reduce((acc, i) => acc + (i.quantity || 0), 0)} items added
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-destructive hover:underline font-bold px-2.5 py-1 rounded-full hover:bg-destructive/10 cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-border text-foreground flex items-center justify-center transition cursor-pointer active:scale-95"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dining Mode Banner with Switch Option */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border text-xs shrink-0">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                <span className="flex items-center gap-1.5 font-bold">
                  {orderMode === "dine-in" && <Utensils className="w-3.5 h-3.5 text-primary" />}
                  {orderMode === "takeaway" && <ShoppingCart className="w-3.5 h-3.5 text-primary" />}
                  {orderMode === "delivery" && <Bike className="w-3.5 h-3.5 text-primary" />}
                  {orderMode === "dine-in" ? "Dine-In" : orderMode === "takeaway" ? "Takeaway" : "Delivery"}
                </span>
                {orderMode === "dine-in" && tableNumber && (
                  <span className="text-[11px] text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    Table {tableNumber}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsModeDialogOpen(true)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Change Mode ⇄
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-muted/20">
              {items.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Your cart is empty</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Delicious cafe dishes are waiting for you in the menu
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-full shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                items.map((cartItem) => {
                  const basePrice =
                    typeof cartItem?.menuItem?.basePrice === "number"
                      ? cartItem.menuItem.basePrice
                      : typeof (cartItem?.menuItem as any)?.price === "number"
                      ? (cartItem.menuItem as any).price
                      : 0;
                  const firstVariantOpt = cartItem?.selectedVariants?.[0]?.option;
                  const baseCost = firstVariantOpt
                    ? getVariantDisplayPrice(basePrice, firstVariantOpt)
                    : basePrice;
                  const addonsPrice = (cartItem?.selectedAddons || []).reduce(
                    (s, a) => s + (a?.option?.price ?? 0),
                    0
                  );
                  const itemTotal = (baseCost + addonsPrice) * (cartItem.quantity || 1);
                  const dishPhoto = getDishPhoto(cartItem.menuItem?.name, undefined, cartItem.menuItem?.imageUrl);

                  return (
                    <motion.div
                      key={cartItem.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/30 transition-all"
                    >
                      <div className="flex gap-3 items-center">
                        {/* Dish Thumbnail */}
                        <img
                          src={dishPhoto}
                          alt={cartItem.menuItem?.name || "Dish"}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border shadow-2xs"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground leading-snug break-words">
                              {cartItem.menuItem?.name || "Dish"}
                            </h4>
                            <button
                              onClick={() => removeItem(cartItem.id)}
                              className="p-1 text-muted-foreground hover:text-destructive transition cursor-pointer shrink-0"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {(cartItem.selectedVariants || []).length > 0 && (
                            <p className="text-[11px] text-primary font-semibold leading-tight mt-0.5">
                              {Array.from(new Set((cartItem.selectedVariants || []).map((v) => v.option?.name).filter(Boolean))).join(" · ")}
                            </p>
                          )}
                          {(cartItem.selectedAddons || []).length > 0 && (
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                              +{Array.from(new Set((cartItem.selectedAddons || []).map((a) => a.option?.name).filter(Boolean))).join(", ")}
                            </p>
                          )}

                          {/* Stepper + Price row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white rounded-full px-2 py-0.5 shadow-xs">
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-white/90 hover:text-white rounded-full transition cursor-pointer active:scale-90"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <span className="text-xs font-black w-6 text-center text-white">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-white/90 hover:text-white rounded-full transition cursor-pointer active:scale-90"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {!cartItem.notes && openNoteId !== cartItem.id && (
                                <button
                                  type="button"
                                  onClick={() => setOpenNoteId(cartItem.id)}
                                  className="text-[11px] text-muted-foreground hover:text-foreground transition flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  <MessageSquare className="w-3 h-3 text-[#9E6B38]" />
                                  <span>Note for chef</span>
                                </button>
                              )}
                              <span className="font-extrabold text-sm text-foreground">
                                ₹{itemTotal}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline cooking note */}
                      {(openNoteId === cartItem.id || cartItem.notes) && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Note for chef (less spicy, no onion)"
                            value={cartItem.notes || ""}
                            onChange={(e) => updateNotes(cartItem.id, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                            autoFocus={openNoteId === cartItem.id && !cartItem.notes}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!cartItem.notes) setOpenNoteId(null);
                              else {
                                updateNotes(cartItem.id, "");
                                setOpenNoteId(null);
                              }
                            }}
                            className="text-xs text-muted-foreground hover:text-destructive px-1 cursor-pointer"
                            title={cartItem.notes ? "Clear note" : "Close"}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-card/95 backdrop-blur-md shrink-0 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-bold">₹{total}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{shouldApplyGst ? `Taxes (${gstRate}% GST)` : "Taxes & GST"}</span>
                  <span className={`font-bold ${shouldApplyGst ? "text-foreground" : "text-emerald-600 dark:text-emerald-400 font-mono"}`}>
                    {shouldApplyGst ? `₹${tax}` : "₹0 (Tax Free)"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">To Pay</span>
                    <span className="text-xl font-black text-foreground">₹{grandTotal}</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onClose();
                      if (tenantSlug && branchCode) {
                        navigate(
                          orderMode === "dine-in" && tableNumber
                            ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}/checkout`
                            : `/t/${tenantSlug}/b/${branchCode}/checkout`
                        );
                      } else {
                        navigate(
                          orderMode === "dine-in" && tableNumber
                            ? `/order/table/${tableNumber}/checkout`
                            : "/checkout"
                        );
                      }
                    }}
                    className="flex-1 max-w-[220px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-full text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Proceed to Pay</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Dining Mode Switch Confirmation Dialog */}
          <ChangeOrderModeDialog
            isOpen={isModeDialogOpen}
            onClose={() => setIsModeDialogOpen(false)}
            onOpenAddressSelect={() => setIsAddressModalOpen(true)}
            onOpenTableScan={() => setIsTableScanOpen(true)}
          />

          {/* Delivery Address Select Dialog */}
          <AddressSelectDialog
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
          />

          <TableCameraScannerModal
            isOpen={isTableScanOpen}
            onClose={() => setIsTableScanOpen(false)}
            onTableScanned={(tbl) => {
              setTableNumber(tbl);
              navigate(`/t/${tenantSlug}/b/${branchCode}/table/${tbl}/menu`);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSheet;
