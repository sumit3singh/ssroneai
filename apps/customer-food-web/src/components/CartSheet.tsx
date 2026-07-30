import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { getVariantPriceAdjustment } from "@/data/mockMenu";
import { useNavigate, useParams } from "react-router-dom";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSheet = ({ isOpen, onClose }: CartSheetProps) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const navigate = useNavigate();
  const { tableNumber } = useParams();
  const total = getTotal();
  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-popover z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-bold">Your Cart</h2>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-destructive hover:underline">
                    Clear All
                  </button>
                )}
                <button onClick={onClose} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="text-muted-foreground text-sm">Your cart is empty</p>
                  <p className="text-muted-foreground text-xs mt-1">Add some yummy items!</p>
                </div>
              ) : (
                items.map((cartItem) => {
                  const baseCost = (cartItem.selectedVariants || []).length > 0
                    ? getVariantDisplayPrice(cartItem.menuItem.basePrice, cartItem.selectedVariants[0].option)
                    : cartItem.menuItem.basePrice;
                  const addonsPrice = (cartItem.selectedAddons || []).reduce((s, a) => s + (a.option?.price ?? 0), 0);
                  const itemTotal = (baseCost + addonsPrice) * cartItem.quantity;

                  return (
                    <motion.div
                      key={cartItem.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-xl bg-card"
                    >
                      <img
                        src={cartItem.menuItem.imageUrl}
                        alt={cartItem.menuItem.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{cartItem.menuItem.name}</h4>
                        {(cartItem.selectedVariants || []).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {(cartItem.selectedVariants || []).map((v) => v.option?.name).join(" · ")}
                          </p>
                        )}
                        {(cartItem.selectedAddons || []).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            +{(cartItem.selectedAddons || []).map((a) => a.option?.name).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-muted rounded-lg px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-background"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-background"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-sm text-primary">₹{itemTotal}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(cartItem.id)} className="self-start p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{grandTotal}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    navigate(tableNumber ? `/order/table/${tableNumber}/checkout` : "/checkout");
                  }}
                  className="btn-order w-full py-3.5 text-center font-bold"
                >
                  Proceed to Pay · ₹{grandTotal} 🎉
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSheet;
