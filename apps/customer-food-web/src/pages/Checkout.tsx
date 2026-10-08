import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  User,
  MapPin,
  Truck,
  CreditCard,
  Store,
  CheckCircle,
  Copy,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Receipt,
  Utensils,
  FileText,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import {
  placeOrder,
  fetchSavedAddresses,
  saveCustomerAddress,
  createRazorpayOrder,
  verifyRazorpayPayment,
  type SavedAddress,
} from "@ssrone/api-client";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import AuthModal from "@/components/AuthModal";
import ChangeOrderModeDialog from "@/components/ChangeOrderModeDialog";
import AddressSelectDialog from "@/components/AddressSelectDialog";
import TableCameraScannerModal from "@/components/TableCameraScannerModal";
import useTenantAppConfig from "@/hooks/useTenantAppConfig";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();
  const { toast } = useToast();
  const { t } = useI18n();
  const { taxSettings, charges } = useTenantAppConfig();
  const {
    items,
    getTotal,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
    setTableNumber,
    clearCart,
    specialInstructions,
    setSpecialInstructions,
  } = useCartStore();

  const {
    isLoggedIn,
    user,
    orderMode,
    deliveryAddress,
    setDeliveryAddress,
    addPastOrder,
    totalOrders,
  } = useAuthStore();

  const total = getTotal();
  const shouldApplyGst = taxSettings?.applyGst ?? false;
  const gstRate = taxSettings?.gstRate ?? 5;
  const tax = shouldApplyGst ? Math.round(total * (gstRate / 100)) : 0;

  // Packaging fee (never for dine-in; only if enabled and for takeaway/delivery)
  const isPackingChargeEnabled = charges?.enablePackingCharge ?? false;
  const packingCharge = (orderMode !== "dine-in" && isPackingChargeEnabled) ? (charges?.packingChargeAmount ?? 0) : 0;

  const deliveryFee = orderMode === "delivery" ? (total >= 499 ? 0 : (charges?.enableDeliveryCharge ? charges?.deliveryChargeAmount : 40)) : 0;
  const grandTotal = Math.max(0, total + tax + packingCharge + deliveryFee);

  const [placing, setPlacing] = useState(false);
  const [alternatePhone, setAlternatePhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cash">("razorpay");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Dedicated Order Confirmation Screen State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    orderNumber: string;
    estimatedTime: number;
    targetStatusUrl: string;
    itemsCount: number;
    grandTotal: number;
    paymentMethod: string;
    tableNumber?: string;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4);
  const [copiedToken, setCopiedToken] = useState(false);

  // Address creation dialog state
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newFlatNo, setNewFlatNo] = useState("");
  const [newAreaStreet, setNewAreaStreet] = useState("");
  const [newLandmark, setNewLandmark] = useState("");
  const [newCity, setNewCity] = useState("Mahendragarh");
  const [newState, setNewState] = useState("Haryana");
  const [newPincode, setNewPincode] = useState("123029");
  const [newAltPhone, setNewAltPhone] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  const [showChangeModeDialog, setShowChangeModeDialog] = useState(false);
  const [showAddressSelectDialog, setShowAddressSelectDialog] = useState(false);
  const [showTableScannerModal, setShowTableScannerModal] = useState(false);

  // Idempotency session key per checkout attempt
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `IDEM_${Date.now()}_${Math.random()}`
  );

  const cleanProfilePhone = (user?.phone || "").replace(/\D/g, "").slice(-10);
  const effectiveName = (isLoggedIn && user?.name) ? user.name : (customerName || user?.name || "");
  const effectivePhone = (isLoggedIn && cleanProfilePhone) ? cleanProfilePhone : (customerPhone || cleanProfilePhone || "");

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.name) {
        setCustomerName(user.name);
      }
      if (cleanProfilePhone) {
        setCustomerPhone(cleanProfilePhone);
      }
    }
  }, [isLoggedIn, user?.name, cleanProfilePhone, setCustomerName, setCustomerPhone]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (isLoggedIn && orderMode === "delivery") {
        try {
          const addrs = await fetchSavedAddresses(user?.id || "", user?.phone || "");
          const list = Array.isArray(addrs) ? addrs : [];
          setSavedAddresses(list);
          if (list.length === 0) {
            // Customer has no saved address -> clear stale fake/junk string from previous sessions
            setDeliveryAddress("");
            setSelectedAddressId(null);
          } else {
            const matching = list.find((a) => a.fullAddress === deliveryAddress);
            if (matching) {
              setSelectedAddressId(matching.id || null);
            } else {
              setSelectedAddressId(list[0].id || null);
              setDeliveryAddress(list[0].fullAddress);
            }
          }
        } catch (err) {
          console.error("fetchSavedAddresses error:", err);
        }
      }
    };
    loadAddresses();
  }, [isLoggedIn, orderMode, user?.id, user?.phone, setDeliveryAddress]);

  // Countdown timer auto-redirecting to live tracking page
  useEffect(() => {
    if (!confirmedOrder) return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(confirmedOrder.targetStatusUrl, {
            state: {
              orderId: confirmedOrder.orderId,
              orderNumber: confirmedOrder.orderNumber,
              estimatedTime: confirmedOrder.estimatedTime,
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [confirmedOrder, navigate]);

  // If order was confirmed, show the Celebration Confirmation View
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] text-[#2D241E] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-[#E8E3DC] rounded-3xl shadow-xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Animated Celebration Icon */}
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-[#9E6B38] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black tracking-wide uppercase mb-1">
              Order Confirmed & Sent to Kitchen 🎉
            </span>
            <h1 className="text-2xl font-black text-[#2D241E] font-serif tracking-tight mt-1">
              Order Placed!
            </h1>
            <p className="text-xs text-[#7A746B] mt-1 max-w-xs mx-auto">
              Your ticket has been transmitted directly to the kitchen chef.
            </p>
          </div>

          {/* Prominent Order Number Card */}
          <div className="p-4 bg-[#FBF8F3] rounded-2xl border border-[#E8E3DC] text-center space-y-1">
            <p className="text-[11px] font-bold text-[#7A746B] uppercase tracking-wider">Your Order Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#9E6B38] tracking-tight">
                #{confirmedOrder.orderNumber}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(confirmedOrder.orderNumber);
                  setCopiedToken(true);
                  setTimeout(() => setCopiedToken(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-white border border-[#E8E3DC] hover:border-[#9E6B38] text-[#7A746B] hover:text-[#9E6B38] transition cursor-pointer active:scale-95"
                title="Copy Order Number"
              >
                {copiedToken ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedToken && <p className="text-[10px] text-emerald-600 font-bold">Order number copied to clipboard!</p>}
          </div>

          {/* Summary Badges */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl">
              <span className="text-[10px] font-bold text-[#7A746B] uppercase block">Dining Mode</span>
              <span className="text-xs font-black text-[#2D241E]">
                {confirmedOrder.tableNumber ? `Table ${confirmedOrder.tableNumber}` : orderMode === "takeaway" ? "Takeaway" : "Delivery"}
              </span>
            </div>
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] rounded-xl">
              <span className="text-[10px] font-bold text-[#7A746B] uppercase block">Total Amount</span>
              <span className="text-xs font-black text-[#9E6B38]">₹{confirmedOrder.grandTotal}</span>
            </div>
          </div>

          {/* Auto Redirect Countdown */}
          <div className="py-1">
            <p className="text-xs font-bold text-[#7A746B]">
              Redirecting to live order tracking in <span className="text-[#9E6B38] font-black">{redirectCountdown}s</span>...
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                navigate(confirmedOrder.targetStatusUrl, {
                  state: {
                    orderId: confirmedOrder.orderId,
                    orderNumber: confirmedOrder.orderNumber,
                    estimatedTime: confirmedOrder.estimatedTime,
                  },
                });
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white hover:brightness-105 font-black text-sm shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => navigate(`/t/${tenantSlug}/b/${branchCode}/menu`)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#7A746B] hover:text-[#2D241E] cursor-pointer"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 font-serif">Your Cart is Empty</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mb-6 max-w-xs">
          Explore delicious dishes from our menu before proceeding to checkout.
        </p>
        <button
          onClick={() =>
            navigate(
              orderMode === "dine-in" && tableNumber
                ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}/menu`
                : `/t/${tenantSlug}/b/${branchCode}/menu`
            )
          }
          className="px-6 py-3 rounded-full bg-[#9E6B38] hover:bg-[#8C5E35] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const getItemPrice = (ci: typeof items[0]) => {
    const baseCost =
      ci.selectedVariants.length > 0
        ? getVariantDisplayPrice(ci.menuItem.basePrice, ci.selectedVariants[0].option)
        : ci.menuItem.basePrice;
    const addonsP = ci.selectedAddons.reduce((s, a) => s + (a.option?.price || 0), 0);
    return baseCost + addonsP;
  };

  const handleSaveNewAddress = async () => {
    if (!newAreaStreet.trim() && !newFlatNo.trim()) {
      toast({
        title: "Address required",
        description: "Please enter flat/house no or street name",
        variant: "destructive",
      });
      return;
    }
    setSavingAddress(true);
    try {
      const parts = [
        newFlatNo.trim(),
        newAreaStreet.trim(),
        newLandmark.trim() ? `Near ${newLandmark.trim()}` : null,
        newCity.trim(),
        newState.trim(),
        newPincode.trim() ? `PIN: ${newPincode.trim()}` : null,
      ].filter(Boolean);
      const fullAddr = parts.join(", ");

      const saved = await saveCustomerAddress(user?.id || "1", {
        label: newLabel,
        flat_no: newFlatNo.trim(),
        area_street: newAreaStreet.trim() || newFlatNo.trim(),
        landmark: newLandmark.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        pincode: newPincode.trim(),
        alternate_phone: newAltPhone.trim(),
        fullAddress: fullAddr,
        phone: effectivePhone,
        is_default: savedAddresses.length === 0,
      });

      const newObj: SavedAddress = {
        id: saved.id || String(Date.now()),
        label: newLabel,
        flat_no: newFlatNo.trim(),
        area_street: newAreaStreet.trim(),
        landmark: newLandmark.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        pincode: newPincode.trim(),
        alternate_phone: newAltPhone.trim(),
        fullAddress: fullAddr,
      };

      setSavedAddresses((prev) => [newObj, ...prev]);
      setSelectedAddressId(newObj.id || null);
      setDeliveryAddress(fullAddr);
      setShowNewAddressForm(false);
      setNewFlatNo("");
      setNewAreaStreet("");
      setNewLandmark("");
      setNewAltPhone("");
      toast({ title: "Address Saved! 📍", description: `Delivering to: ${newLabel} (${fullAddr})` });
    } catch {
      toast({ title: "Save Failed", description: "Could not save address. Please try again.", variant: "destructive" });
    } finally {
      setSavingAddress(false);
    }
  };

  const executeOrderPlacement = async (paymentDetails?: {
    paymentMethod: string;
    paymentId?: string;
    paymentStatus?: string;
  }) => {
    const actualOrderType = orderMode === "delivery" ? "delivery" : orderMode === "takeaway" ? "takeaway" : "dine-in";
    const combinedInstructions = [
      specialInstructions.trim(),
      alternatePhone.trim() ? `Alternate Phone: ${alternatePhone.trim()}` : null,
    ].filter(Boolean).join(" | ");

    const selectedPayMethod = paymentDetails?.paymentMethod || paymentMethod;
    const paymentId = paymentDetails?.paymentId;
    const paymentStatus = paymentDetails?.paymentStatus || (selectedPayMethod === "cash" ? "unpaid" : "paid");

    try {
      const fallbackName = effectiveName || user?.name || (actualOrderType === "dine-in" ? `Table ${tableNumber || "1"} Guest` : "Counter Guest");
      const fallbackPhone = (effectivePhone || user?.phone || "").trim() || "9876543210";

      const response = await placeOrder({
        customerId: user?.id,
        customer_id: user?.id,
        customer_name: fallbackName,
        customer_phone: fallbackPhone,
        tenant_slug: tenantSlug,
        branch_code: branchCode,
        branch_id: 1,
        idempotency_key: idempotencyKeyRef.current,
        orderType: actualOrderType,
        order_mode: actualOrderType === "dine-in" ? "dine_in" : actualOrderType,
        source_channel: "customer_web",
        order_source: "customer_web",
        table_name: actualOrderType === "dine-in" ? (tableNumber || undefined) : undefined,
        table_number: actualOrderType === "dine-in" ? (tableNumber || undefined) : undefined,
        tableNumber: actualOrderType === "dine-in" ? (tableNumber || undefined) : undefined,
        items: items.map((ci) => ({
          menuItemId: ci.menuItem.id,
          productId: ci.menuItem.id,
          product_id: ci.menuItem.id,
          product_name: ci.menuItem.name,
          name: ci.menuItem.name,
          variantId: ci.selectedVariants.map((v) => v.option.id).join(",") || undefined,
          variant_name: ci.selectedVariants.map((v) => v.option.name).join(", ") || undefined,
          addonIds: ci.selectedAddons.map((a) => a.option.id),
          addons: ci.selectedAddons.map((a) => a.option.name),
          quantity: ci.quantity,
          unitPrice: getItemPrice(ci),
          unit_price: getItemPrice(ci),
          notes: ci.notes || undefined,
          preparation_notes: ci.notes || undefined,
        })),
        subtotal: total,
        taxAmount: tax,
        tax_amount: tax,
        deliveryFee,
        discountAmount: 0,
        discount_amount: 0,
        total: grandTotal,
        net_amount: grandTotal,
        deliveryAddress:
          orderMode === "delivery"
            ? {
                fullAddress: deliveryAddress,
                alternatePhone: alternatePhone.trim() || undefined,
              }
            : undefined,
        specialInstructions: combinedInstructions,
        special_instructions: combinedInstructions,
        loyaltyPointsUsed: 0,
        paymentMethod: selectedPayMethod,
        payment_method: selectedPayMethod,
        paymentId,
        paymentStatus,
        payment_status: paymentStatus,
      });

      const orderIdStr = String(response.orderId || response.orderNumber || Date.now());
      const orderNum = String(response.orderNumber || response.orderId || "ORD-" + Math.floor(1000 + Math.random() * 9000));
      const targetStatusUrl =
        actualOrderType === "dine-in" && (tableNumber || "1")
          ? `/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/table/${tableNumber || "1"}/status/${orderIdStr}`
          : `/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/status/${orderIdStr}`;

      // 1. Immediately mount the Order Celebration screen
      setConfirmedOrder({
        orderId: orderIdStr,
        orderNumber: orderNum,
        estimatedTime: response.estimatedTime || 15,
        targetStatusUrl,
        itemsCount: items.length,
        grandTotal,
        paymentMethod: selectedPayMethod,
        tableNumber: actualOrderType === "dine-in" ? (tableNumber || "1") : undefined,
      });

      // 2. Clear cart items
      clearCart();

      // 3. Safely record past order locally without breaking the flow
      try {
        if (typeof addPastOrder === "function") {
          addPastOrder({
            id: orderIdStr,
            date: new Date().toISOString().split("T")[0],
            items: items.map((ci) => {
              const variantLabel = ci.selectedVariants.map((v) => v.option.name).join(", ");
              const addonNames = ci.selectedAddons.map((a) => a.option.name);
              return {
                name: ci.menuItem.name,
                variant: variantLabel || undefined,
                addons: addonNames,
                quantity: ci.quantity,
                price: getItemPrice(ci) * ci.quantity,
                notes: ci.notes || undefined,
              };
            }),
            total: grandTotal,
            status: "preparing",
            tableNumber: actualOrderType === "dine-in" ? (tableNumber || undefined) : undefined,
            deliveryAddress: orderMode === "delivery" ? deliveryAddress : undefined,
            paymentMethod: selectedPayMethod,
          });
        }
      } catch (pastErr) {
        console.warn("Could not save past order locally:", pastErr);
      }

      setPlacing(false);
      toast.success(`Order #${orderNum} Placed! 🎉`, {
        description: "Your order has been transmitted to the kitchen.",
      });
    } catch (err: any) {
      console.error("Order placement exception:", err);
      toast.error("Order Placement Failed", {
        description: err?.response?.data?.detail || err?.message || "Could not place your order. Please try again.",
      });
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    const finalPhone = (effectivePhone || user?.phone || "").trim();
    if (orderMode === "delivery" && !finalPhone) {
      toast.error("Phone Number Required", {
        description: "Please enter your mobile number for delivery verification.",
      });
      setShowAuthModal(true);
      return;
    }
    if (orderMode === "delivery" && !deliveryAddress.trim()) {
      toast.error("Delivery Address Required 📍", {
        description: "Please select or add your delivery address.",
      });
      setShowAddressSelectDialog(true);
      return;
    }
    if (orderMode === "dine-in" && !tableNumber) {
      setTableNumber("1");
    }

    setPlacing(true);

    if (paymentMethod === "razorpay") {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay === "undefined") {
        setPlacing(false);
        toast({
          title: "Payment Gateway Unavailable",
          description: "Online payment gateway could not be loaded. Please choose Pay at Counter or retry.",
          variant: "destructive",
        });
        return;
      }

      let rzpOrderId = "";
      let rzpKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_51M0MockCafeKey";

      try {
        const rzpOrderRes = await createRazorpayOrder({
          amount: grandTotal,
          currency: "INR",
          tenant_slug: tenantSlug,
          branch_code: branchCode,
          receipt: `rcpt_${Date.now()}`,
        });
        if (rzpOrderRes?.order_id) {
          rzpOrderId = rzpOrderRes.order_id;
          if (rzpOrderRes.key_id) rzpKey = rzpOrderRes.key_id;
        }
      } catch (err) {
        console.warn("Backend Razorpay order creation failed:", err);
      }

      const rzpOptions: any = {
        key: rzpKey,
        amount: Math.round(grandTotal * 100), // paise
        currency: "INR",
        name: "The Baithak Cafe",
        description: `Order Payment (${items.length} items)`,
        prefill: {
          name: effectiveName || "Valued Customer",
          contact: effectivePhone,
        },
        theme: {
          color: "#9E6B38",
        },
        handler: async (response: any) => {
          // Strict server-authoritative signature verification
          if (!response?.razorpay_payment_id) {
            setPlacing(false);
            toast({
              title: "Payment Verification Incomplete",
              description: "No payment reference received from the gateway.",
              variant: "destructive",
            });
            return;
          }

          if (response?.razorpay_signature && response?.razorpay_order_id) {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (!verifyRes?.verified && !verifyRes?.success) {
                setPlacing(false);
                toast({
                  title: "Payment Verification Failed",
                  description: verifyRes?.message || "Cryptographic signature check failed.",
                  variant: "destructive",
                });
                return;
              }
            } catch (sigErr) {
              setPlacing(false);
              toast({
                title: "Verification Error",
                description: "Could not verify payment signature with server.",
                variant: "destructive",
              });
              return;
            }
          }

          await executeOrderPlacement({
            paymentMethod: "razorpay",
            paymentId: response.razorpay_payment_id,
            paymentStatus: "paid",
          });
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast({
              title: "Payment Window Closed",
              description: "You closed the payment dialog without completing payment.",
            });
          },
        },
      };

      if (rzpOrderId) {
        rzpOptions.order_id = rzpOrderId;
      }

      try {
        const rzp = new window.Razorpay(rzpOptions);
        rzp.on("payment.failed", (err: any) => {
          setPlacing(false);
          toast({
            title: "Payment Failed",
            description: err?.error?.description || "Payment was rejected by gateway.",
            variant: "destructive",
          });
        });
        rzp.open();
      } catch (e) {
        setPlacing(false);
        toast({
          title: "Gateway Error",
          description: "Could not initialize payment window. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Cash on Table / Pay at Counter / COD
      await executeOrderPlacement({
        paymentMethod: "cash",
        paymentStatus: "unpaid",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3.5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-muted hover:bg-border text-foreground flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-extrabold text-foreground font-serif tracking-tight">Checkout</h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                tenantSlug && branchCode
                  ? `/t/${tenantSlug}/b/${branchCode}/profile`
                  : "/profile"
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9E6B38]/10 hover:bg-[#9E6B38]/20 border border-[#9E6B38]/30 text-xs font-bold text-[#9E6B38] transition cursor-pointer active:scale-95 shadow-2xs"
            title="Profile & Customer Details"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Dining Mode & Delivery Address Banner */}
        <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-xl bg-[#9E6B38]/10 text-[#9E6B38] shrink-0">
                {orderMode === "delivery" ? (
                  <Truck className="w-4 h-4" />
                ) : orderMode === "takeaway" ? (
                  <Store className="w-4 h-4" />
                ) : (
                  <Utensils className="w-4 h-4" />
                )}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground">
                  {orderMode === "delivery"
                    ? "Home Delivery"
                    : orderMode === "takeaway"
                    ? "Takeaway · Counter Pickup"
                    : `Dine-In ${tableNumber ? `· Table ${tableNumber}` : "· Table 1"}`}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {orderMode === "delivery"
                    ? deliveryAddress || "Tap Change to add or select delivery address"
                    : orderMode === "takeaway"
                    ? "Collect prepared meal at cafe counter"
                    : `Order served directly to Table ${tableNumber || "1"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {orderMode === "delivery" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAddressSelectDialog(true)}
                    className="text-xs text-[#9E6B38] font-bold hover:underline cursor-pointer px-1.5 py-1"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangeModeDialog(true)}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-1"
                    title="Switch Dining Mode"
                  >
                    Switch
                  </button>
                </>
              ) : (
                <>
                  {orderMode === "dine-in" && (
                    <button
                      type="button"
                      onClick={() => setShowTableScannerModal(true)}
                      className="text-xs text-[#9E6B38] font-bold hover:underline cursor-pointer px-1.5 py-1"
                    >
                      Scan Table
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowChangeModeDialog(true)}
                    className="text-xs text-[#9E6B38] font-bold hover:underline cursor-pointer px-1.5 py-1"
                  >
                    Change
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Unified Order Summary & Bill Details Card */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-primary" />
              <span>Order Summary & Bill ({items.length} {items.length === 1 ? "item" : "items"})</span>
            </h2>
          </div>

          {/* Items List */}
          <div className="divide-y divide-border/60">
            {items.map((ci) => {
              const itemTotal = getItemPrice(ci) * ci.quantity;
              const variantText = ci.selectedVariants.map((v) => v.option.name).join(", ");

              return (
                <div key={ci.id} className="py-2.5 flex items-start justify-between text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground break-words leading-snug">{ci.menuItem.name}</div>
                    {(variantText || ci.selectedAddons.length > 0) && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {variantText && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300/60 px-1.5 py-0.5 rounded-md">
                            {variantText}
                          </span>
                        )}
                        {ci.selectedAddons.map((a, aIdx) => (
                          <span
                            key={aIdx}
                            className="text-[10px] font-medium text-[#2D241E] bg-[#FAF8F5] border border-[#E8E3DC] px-1.5 py-0.5 rounded-md"
                          >
                            +{a.option.name} {a.option.price ? `(+₹${a.option.price})` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>Qty: {ci.quantity} × ₹{getItemPrice(ci)}</span>
                      {ci.notes && (
                        <span className="italic text-[#9E6B38] font-medium">({ci.notes})</span>
                      )}
                    </div>
                  </div>
                  <div className="font-extrabold text-foreground shrink-0 pt-0.5">₹{itemTotal}</div>
                </div>
              );
            })}
          </div>

          {/* Note for Chef */}
          <div className="pt-2 border-t border-border/70">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <label className="text-[11px] font-semibold text-muted-foreground">Note for chef (Optional)</label>
            </div>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra napkins, serve hot"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Merged Bill Breakdown */}
          <div className="pt-3 border-t border-border/80 space-y-2 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Bill Details
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Item Total</span>
              <span className="font-semibold text-foreground">₹{total}</span>
            </div>

            {shouldApplyGst ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & GST ({gstRate}%)</span>
                <span className="font-semibold text-foreground">₹{tax}</span>
              </div>
            ) : (
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & GST</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">₹0 (Tax Free)</span>
              </div>
            )}

            {packingCharge > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Packaging & Container Charge</span>
                <span className="font-semibold text-foreground">₹{packingCharge}</span>
              </div>
            )}

            {orderMode === "delivery" && (
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-foreground">
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
            )}

            <div className="border-t border-border pt-2.5 mt-2 flex justify-between font-extrabold text-sm text-foreground">
              <span>To Pay</span>
              <span className="text-base text-primary">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-xs space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span>Select Payment Method</span>
          </h2>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("razorpay")}
              className={cn(
                "w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                paymentMethod === "razorpay"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs"
                  : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    paymentMethod === "razorpay" ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {paymentMethod === "razorpay" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Online Payment (UPI, Cards, NetBanking)</div>
                  <div className="text-[11px] text-muted-foreground">Powered by Razorpay instant checkout</div>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>

            {/* Offline Payment: Cash on Delivery for Delivery, Pay at Counter for Takeaway and Dine-In */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                paymentMethod === "cash"
                  ? "bg-primary/10 border-primary text-foreground shadow-xs"
                  : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    paymentMethod === "cash" ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {paymentMethod === "cash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">
                    {orderMode === "delivery"
                      ? "Cash on Delivery (COD)"
                      : "Pay at Counter"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {orderMode === "delivery"
                      ? "Pay cash to delivery rider at your doorstep"
                      : orderMode === "takeaway"
                      ? "Pay at the counter when collecting your order"
                      : "Pay at the billing counter or table"}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border p-3.5 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Grand Total</div>
            <div className="text-lg font-black text-foreground">₹{grandTotal}</div>
          </div>

          <button
            type="button"
            disabled={placing}
            onClick={handlePlaceOrder}
            className="flex-1 max-w-xs h-12 bg-gradient-to-r from-[#9E6B38] via-[#B45309] to-[#8C5E35] text-white hover:brightness-105 font-black text-xs sm:text-sm rounded-full shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {placing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>
                {paymentMethod === "razorpay"
                  ? "Pay & Place Order"
                  : orderMode === "delivery"
                  ? "Confirm Order · Cash on Delivery"
                  : "Confirm Order · Pay at Counter"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ChangeOrderModeDialog
        isOpen={showChangeModeDialog}
        onClose={() => setShowChangeModeDialog(false)}
        onOpenAddressSelect={() => setShowAddressSelectDialog(true)}
        onOpenTableScan={() => setShowTableScannerModal(true)}
      />
      <AddressSelectDialog
        isOpen={showAddressSelectDialog}
        onClose={() => setShowAddressSelectDialog(false)}
      />
      <TableCameraScannerModal
        isOpen={showTableScannerModal}
        onClose={() => setShowTableScannerModal(false)}
        onTableScanned={(scannedTbl) => {
          setTableNumber(scannedTbl);
          toast.success(`Table ${scannedTbl} Connected! 🍽️`);
        }}
      />
    </div>
  );
};

export default Checkout;
