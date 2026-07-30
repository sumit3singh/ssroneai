import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, User, MapPin, Truck, Tag, Award, MessageSquare, CreditCard } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useI18n } from "@/stores/i18nStore";
import { getVariantPriceAdjustment } from "@/data/mockMenu";
import { validatePromoCode, placeOrder, fetchSavedAddresses, type SavedAddress } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const {
    items, getTotal, customerName, customerPhone,
    setCustomerName, setCustomerPhone, clearCart, specialInstructions, setSpecialInstructions
  } = useCartStore();
  const {
    isLoggedIn, user, orderMode, deliveryAddress, setDeliveryAddress,
    addPastOrder, loyaltyPoints, redeemLoyaltyPoints, addLoyaltyPoints, totalOrders
  } = useAuthStore();

  const total = getTotal();
  const tax = Math.round(total * 0.05);
  const deliveryFee = orderMode === "delivery" ? (total >= 499 ? 0 : 40) : 0;

  const [placing, setPlacing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const effectiveName = customerName || user?.name || "";
  const effectivePhone = customerPhone || user?.phone || "";

  const loyaltyDiscount = usePoints ? Math.min(pointsToRedeem, Math.floor(total * 0.5)) : 0;
  const grandTotal = Math.max(0, total + tax + deliveryFee - promoDiscount - loyaltyDiscount);

  useEffect(() => {
    if (isLoggedIn && orderMode === "delivery" && user?.id) {
      fetchSavedAddresses(user.id).then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0 && !deliveryAddress) {
          setSelectedAddressId(addrs[0].id);
          setDeliveryAddress(addrs[0].fullAddress);
        }
      });
    }
  }, [isLoggedIn, orderMode, user?.id, deliveryAddress, setDeliveryAddress]);

  useEffect(() => {
    if (user?.name && !customerName) setCustomerName(user.name);
    if (user?.phone && !customerPhone) setCustomerPhone(user.phone);
  }, [user, customerName, customerPhone, setCustomerName, setCustomerPhone]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="font-display text-xl font-bold mb-2">Cart is Empty</h2>
        <p className="text-muted-foreground text-sm mb-6">Add items before checking out!</p>
        <button onClick={() => navigate(tableNumber ? `/order/table/${tableNumber}/menu` : "/menu")} className="btn-order px-6 py-3">
          Back to Menu
        </button>
      </div>
    );
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    const result = await validatePromoCode(promoCode, total);
    setApplyingPromo(false);
    if (result.valid) {
      setPromoDiscount(result.discount);
      setPromoMessage(result.message);
      setPromoApplied(true);
      toast({ title: "🎉 Promo Applied!", description: result.message });
    } else {
      setPromoMessage(result.message);
      setPromoApplied(false);
      toast({ title: "❌ Invalid Code", description: result.message, variant: "destructive" });
    }
  };

  const getItemPrice = (ci: typeof items[0]) => {
    const baseCost = ci.selectedVariants.length > 0
      ? getVariantDisplayPrice(ci.menuItem.basePrice, ci.selectedVariants[0].option)
      : ci.menuItem.basePrice;
    const addonsP = ci.selectedAddons.reduce((s, a) => s + a.option.price, 0);
    return baseCost + addonsP;
  };

  const handlePlaceOrder = async () => {
    if (!effectivePhone.trim()) {
      toast({ title: "Phone required", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    if (orderMode === "delivery" && !tableNumber && !deliveryAddress.trim()) {
      toast({ title: "Address required", description: "Please enter delivery address", variant: "destructive" });
      return;
    }
    setPlacing(true);

    try {
      const response = await placeOrder({
        customerId: user?.id,
        orderType: tableNumber ? "dine-in" : orderMode,
        items: items.map((ci) => ({
          menuItemId: ci.menuItem.id,
          variantId: ci.selectedVariants.map((v) => v.option.id).join(",") || undefined,
          addonIds: ci.selectedAddons.map((a) => a.option.id),
          quantity: ci.quantity,
          unitPrice: getItemPrice(ci),
        })),
        subtotal: total,
        taxAmount: tax,
        deliveryFee,
        discountAmount: promoDiscount + loyaltyDiscount,
        total: grandTotal,
        deliveryAddress: orderMode === "delivery" ? { fullAddress: deliveryAddress } : undefined,
        specialInstructions,
        promoCode: promoApplied ? promoCode : undefined,
        loyaltyPointsUsed: loyaltyDiscount,
        paymentMethod,
      });

      addPastOrder({
        id: response.orderId,
        date: new Date().toISOString().split("T")[0],
        items: items.map((ci) => {
          const variantLabel = ci.selectedVariants.map((v) => v.option.name).join(", ");
          return {
            name: ci.menuItem.name + (variantLabel ? ` (${variantLabel})` : ""),
            quantity: ci.quantity,
            price: getItemPrice(ci) * ci.quantity,
          };
        }),
        total: grandTotal,
        status: "preparing",
        tableNumber: tableNumber || undefined,
        deliveryAddress: orderMode === "delivery" ? deliveryAddress : undefined,
      });

      if (loyaltyDiscount > 0) redeemLoyaltyPoints(loyaltyDiscount);
      addLoyaltyPoints(response.loyaltyPointsEarned);

      clearCart();
      navigate(tableNumber ? `/order/table/${tableNumber}/status` : "/order-status", {
        state: { orderId: response.orderId, estimatedTime: response.estimatedTime },
      });
    } catch {
      toast({ title: "Order Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setPlacing(false);
    }
  };

  const codAvailable = totalOrders >= 3;

  const paymentMethods = [
    { id: "upi", label: "UPI / QR Pay", icon: "💳" },
    { id: "card", label: "Credit / Debit Card", icon: "💳" },
    { id: "netbanking", label: "Netbanking", icon: "🏦" },
    ...(tableNumber
      ? [{ id: "cash", label: "Cash on Table", icon: "💵" }]
      : codAvailable
      ? [{ id: "cod", label: t("checkout.cashOnDelivery"), icon: "💵" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">{t("checkout.title")}</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Mode badge */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {tableNumber ? (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">🪑 Table {tableNumber}</span>
          ) : orderMode === "delivery" ? (
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Home Delivery
            </span>
          ) : (
            <span className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full">🍽️ Dine In</span>
          )}
          {deliveryFee === 0 && orderMode === "delivery" && (
            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs">🎉 Free Delivery!</span>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-base">{t("checkout.orderSummary")}</h2>
          {items.map((ci) => {
            const unitPrice = getItemPrice(ci);
            return (
              <div key={ci.id} className="flex justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{ci.menuItem.name}</span>
                  {ci.selectedVariants.length > 0 && (
                    <span className="text-muted-foreground"> ({ci.selectedVariants.map((v) => v.option.name).join(", ")})</span>
                  )}
                  {ci.selectedAddons.length > 0 && (
                    <p className="text-xs text-muted-foreground">+{ci.selectedAddons.map((a) => a.option.name).join(", ")}</p>
                  )}
                  <span className="text-muted-foreground"> ×{ci.quantity}</span>
                </div>
                <span className="font-medium flex-shrink-0">₹{unitPrice * ci.quantity}</span>
              </div>
            );
          })}
          <div className="border-t border-border pt-2 space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("cart.subtotal")}</span><span>₹{total}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t("cart.tax")}</span><span>₹{tax}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t("cart.deliveryFee")}</span><span>₹{deliveryFee}</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div className="flex justify-between text-accent">
                <span>{t("checkout.discount")}</span><span>-₹{promoDiscount}</span>
              </div>
            )}
            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Loyalty Discount</span><span>-₹{loyaltyDiscount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span>{t("checkout.grandTotal")}</span><span className="text-primary">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Promo Code */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> {t("checkout.promoCode")}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code (try WELCOME50)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={promoApplied}
              className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              onClick={promoApplied ? () => { setPromoApplied(false); setPromoDiscount(0); setPromoCode(""); setPromoMessage(""); } : handleApplyPromo}
              disabled={applyingPromo}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
            >
              {promoApplied ? "Remove" : applyingPromo ? "..." : t("checkout.applyPromo")}
            </button>
          </div>
          {promoMessage && (
            <p className={`text-xs ${promoApplied ? "text-accent" : "text-destructive"}`}>{promoMessage}</p>
          )}
        </div>

        {/* Loyalty Points */}
        {isLoggedIn && loyaltyPoints > 0 && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> {t("checkout.loyaltyPoints")}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available: {loyaltyPoints} pts (₹{loyaltyPoints})</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => {
                    setUsePoints(e.target.checked);
                    if (e.target.checked) setPointsToRedeem(Math.min(loyaltyPoints, Math.floor(total * 0.5)));
                  }}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">Use Points</span>
              </label>
            </div>
            {usePoints && (
              <div>
                <input
                  type="range"
                  min={0}
                  max={Math.min(loyaltyPoints, Math.floor(total * 0.5))}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground text-center">Redeem {pointsToRedeem} pts = ₹{pointsToRedeem} off</p>
              </div>
            )}
          </div>
        )}

        {/* Customer details */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-base">{t("checkout.yourDetails")}</h2>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("checkout.namePlaceholder")}
              value={effectiveName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              placeholder={t("checkout.phonePlaceholder")}
              value={effectivePhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Delivery address */}
        {orderMode === "delivery" && !tableNumber && (
          <div className="bg-card rounded-2xl p-4 space-y-3">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> {t("checkout.deliveryAddress")}
            </h2>
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t("checkout.savedAddresses")}</p>
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => { setSelectedAddressId(addr.id); setDeliveryAddress(addr.fullAddress); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium">{addr.label}</span>
                    <p className="text-xs text-muted-foreground">{addr.fullAddress}</p>
                  </button>
                ))}
              </div>
            )}
            <textarea
              placeholder={t("checkout.addressPlaceholder")}
              value={deliveryAddress}
              onChange={(e) => { setDeliveryAddress(e.target.value); setSelectedAddressId(null); }}
              rows={2}
              className="w-full px-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-xs text-muted-foreground">{t("checkout.estimatedDelivery")}</p>
          </div>
        )}

        {/* Special Instructions */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> {t("checkout.specialInstructions")}
          </h2>
          <textarea
            placeholder="e.g., No onions, extra spicy, allergies..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={2}
            className="w-full px-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Payment */}
        <div className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> {t("checkout.paymentMethod")}
          </h2>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label key={method.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="accent-primary"
                />
                <span className="text-sm">{method.icon} {method.label}</span>
              </label>
            ))}
            {!codAvailable && !tableNumber && (
              <p className="text-[10px] text-muted-foreground px-1">{t("checkout.codRestriction")}</p>
            )}
          </div>
        </div>

        {/* Place order */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePlaceOrder}
          disabled={!effectivePhone.trim() || (orderMode === "delivery" && !tableNumber && !deliveryAddress.trim()) || placing}
          className="btn-order w-full py-4 text-center font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placing ? t("checkout.placing") : `${t("checkout.placeOrder")} · ₹${grandTotal} 🎉`}
        </motion.button>
      </div>
    </div>
  );
};

export default Checkout;
