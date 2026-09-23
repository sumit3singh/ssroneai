import React, { useState, useEffect } from "react";
import {
  Utensils,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Heart,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smartphone,
  Coffee,
  Receipt,
  Clock
} from "lucide-react";
import { DynamicUpiQrCode } from "../../components/DynamicUpiQrCode";
import { playPaymentSuccessSound } from "@ssrone/utils";
import { useAuthStore } from "@ssrone/auth";

interface CFDCartItem {
  cart_id: string;
  name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  is_veg?: boolean;
}

export const POSCustomerFacingDisplayPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CFDCartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [settledOrderNumber, setSettledOrderNumber] = useState<string | null>(null);
  const [activeOrderMode, setActiveOrderMode] = useState<string>("Dine-In");
  const [isDark, setIsDark] = useState(false); // Default Light Theme as requested
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const selectedCompany = useAuthStore((s) => s.selected_company);
  const selectedBranch = useAuthStore((s) => s.selected_branch);
  const brandName = selectedCompany?.name || selectedBranch?.name || "BAITHAK CAFE";

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("ssrone_cfd_sync");
      channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === "CART_UPDATE") {
          setCartItems(data.cartItems || []);
          setSubtotal(data.subtotal || 0);
          setDiscountAmount(data.discountAmount || 0);
          setTaxAmount(data.taxAmount || 0);
          setNetAmount(data.netAmount || 0);
          const rawMode = data.orderMode || "dine_in";
          setActiveOrderMode(
            rawMode === "takeaway" ? "Takeaway" : rawMode === "delivery" ? "Delivery" : "Dine-In"
          );
          setSettledOrderNumber(null);
        } else if (data.type === "ORDER_SETTLED") {
          setSettledOrderNumber(data.orderNumber || "COMPLETED");
          try {
            playPaymentSuccessSound();
          } catch {}
          setTimeout(() => {
            setCartItems([]);
            setSettledOrderNumber(null);
          }, 8000);
        } else if (data.type === "CLEAR_CART") {
          setCartItems([]);
          setSubtotal(0);
          setDiscountAmount(0);
          setTaxAmount(0);
          setNetAmount(0);
          setSettledOrderNumber(null);
        }
      };
    } catch (err) {
      console.warn("BroadcastChannel not supported in this environment", err);
    }

    return () => {
      channel?.close();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const totalItemsCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div
      className={`min-h-screen w-screen flex flex-col select-none overflow-hidden font-sans transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* ─── Top Header Bar ─── */}
      <header
        className={`h-18 px-8 border-b flex items-center justify-between shrink-0 shadow-xs transition-colors duration-200 ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200/90 text-slate-900"
        }`}
      >
        {/* Brand & Kiosk Status */}
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
            <Coffee size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight uppercase">
                {brandName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold border border-emerald-500/20 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CUSTOMER DISPLAY
              </span>
            </div>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Live Counter Order & Instant Contactless UPI Payment
            </p>
          </div>
        </div>

        {/* Header Right: Mode, Time & Screen Controls */}
        <div className="flex items-center gap-3">
          {/* Order Mode Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300"
                : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            {activeOrderMode}
          </span>

          {/* Encrypted Security Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isDark
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure 0% Fee UPI</span>
          </div>

          {/* Live Indian Time */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold border ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Clock size={13} className="text-amber-500" />
            <span>{currentTime || "00:00:00"}</span>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title="Toggle Fullscreen Kiosk Mode (F11)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* ─── Main Screen Split View ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Ordered Items / Welcome Screen */}
        <div
          className={`flex-1 p-8 flex flex-col overflow-y-auto border-r transition-colors duration-200 ${
            isDark
              ? "bg-slate-950/60 border-slate-800"
              : "bg-[#FAF9F6]/60 border-slate-200/90"
          }`}
        >
          {settledOrderNumber ? (
            /* Payment Received / Settled Success View */
            <div className="m-auto text-center space-y-5 max-w-lg animate-in zoom-in-95 duration-200 p-8 rounded-3xl border shadow-xl bg-white text-slate-900 border-slate-200">
              <div className="h-24 w-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 size={54} />
              </div>
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  Payment Verified
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-2">
                  Order Successfully Placed!
                </h2>
                <p className="text-slate-600 text-sm">
                  Token Number:{" "}
                  <span className="font-mono text-emerald-600 text-2xl font-black">
                    #{settledOrderNumber}
                  </span>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Your meal is being prepared hot & fresh in our kitchen.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Thank you for dining with us! Please collect your receipt.</span>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State / Hospitality Welcome Screen */
            <div className="m-auto text-center space-y-4 max-w-md">
              <div
                className={`h-24 w-24 rounded-3xl border flex items-center justify-center mx-auto shadow-xs ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-600"
                    : "bg-white border-slate-200 text-amber-600"
                }`}
              >
                <ShoppingBag size={44} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  Welcome to {brandName}!
                </h2>
                <p
                  className={`text-sm mt-1.5 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Dishes added by the cashier at the counter will appear here in real time.
                </p>
              </div>
              <div
                className={`p-3.5 rounded-2xl border text-xs font-medium inline-flex items-center gap-2 ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 text-slate-400"
                    : "bg-white border-slate-200/80 text-slate-600 shadow-xs"
                }`}
              >
                <Utensils size={15} className="text-amber-500" />
                <span>Fast Counter Billing • High-Speed Kitchen KOT</span>
              </div>
            </div>
          ) : (
            /* Active Live Cart Items List */
            <div className="space-y-4 max-w-3xl w-full mx-auto">
              <div
                className={`flex items-center justify-between pb-3 border-b text-xs font-black uppercase tracking-wider ${
                  isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
                }`}
              >
                <span>
                  Dishes in Order ({totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"})
                </span>
                <span>Amount</span>
              </div>

              <div className="space-y-2.5">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.cart_id || idx}
                    className={`flex items-center justify-between p-4 rounded-2xl border shadow-xs transition-all ${
                      isDark
                        ? "bg-slate-900/70 border-slate-800 text-white"
                        : "bg-white border-slate-200/90 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Veg / Non-Veg Indicator */}
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${
                          item.is_veg !== false
                            ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                            : "border-rose-600 bg-rose-50 text-rose-600"
                        }`}
                        title={item.is_veg !== false ? "Pure Vegetarian" : "Non-Vegetarian"}
                      >
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            item.is_veg !== false ? "bg-emerald-600" : "bg-rose-600"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="font-extrabold text-base flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.variant_name && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                                isDark
                                  ? "bg-slate-800 border-slate-700 text-slate-300"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              {item.variant_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs font-mono font-semibold ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            ₹{item.unit_price} × {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-emerald-600">
                        ₹{(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Side: Bill Breakdown & Dynamic UPI QR Code ─── */}
        <div
          className={`w-[450px] p-8 flex flex-col justify-between shrink-0 border-l shadow-sm transition-colors duration-200 ${
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="space-y-6">
            {/* Bill Calculation Box */}
            <div
              className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-slate-50/90 border-slate-200/80 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 pb-2 border-b border-dashed border-slate-300 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500">
                <Receipt size={14} className="text-amber-500" />
                <span>Bill Summary</span>
              </div>

              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-600"}>Subtotal</span>
                  <span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div
                    className={`flex justify-between text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <span>GST (5%)</span>
                    <span className="font-mono font-semibold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-300 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-base font-black uppercase tracking-wide">
                    Total Payable
                  </span>
                  <span className="text-3xl font-black font-mono text-emerald-600">
                    ₹{netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic UPI QR Code Box */}
            {netAmount > 0 && !settledOrderNumber ? (
              <div
                className={`p-5 rounded-3xl border flex flex-col items-center space-y-3 shadow-xs ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <DynamicUpiQrCode
                  amount={netAmount}
                  orderNumber={`CFD-${Date.now().toString().slice(-4)}`}
                  size={200}
                  payeeName={brandName}
                  vpa="merchant@upi"
                />

                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                    <Smartphone size={13} className="text-emerald-600" />
                    <span>Scan with Any UPI App to Pay</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-bold text-slate-500">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      GPay
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      PhonePe
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Paytm
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      BHIM
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Note */}
          <div
            className={`text-center pt-4 border-t text-[11px] flex items-center justify-center gap-1.5 ${
              isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"
            }`}
          >
            <Heart size={13} className="text-rose-500" />
            <span>Thank you for dining at {brandName}!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSCustomerFacingDisplayPage;
