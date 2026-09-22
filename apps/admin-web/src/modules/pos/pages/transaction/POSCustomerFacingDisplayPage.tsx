import React, { useState, useEffect } from "react";
import { Utensils, CheckCircle2, Sparkles, QrCode, ShoppingBag, ShieldCheck, Heart } from "lucide-react";
import { DynamicUpiQrCode } from "../../components/DynamicUpiQrCode";
import { playPaymentSuccessSound } from "@ssrone/utils";

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
  const [activeOrderMode, setActiveOrderMode] = useState<string>("Dine In");

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
          setActiveOrderMode(data.orderMode || "DINE_IN");
          setSettledOrderNumber(null);
        } else if (data.type === "ORDER_SETTLED") {
          setSettledOrderNumber(data.orderNumber || "COMPLETED");
          playPaymentSuccessSound();
          setTimeout(() => {
            setCartItems([]);
            setSettledOrderNumber(null);
          }, 7000);
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
      console.warn("BroadcastChannel not supported in this browser environment", err);
    }

    return () => {
      channel?.close();
    };
  }, []);

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {/* Top Banner */}
      <header className="h-16 px-8 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Utensils size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>SSR ONE DINING</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                LIVE KIOSK
              </span>
            </h1>
            <p className="text-xs text-slate-400">Customer Bill & Contactless Payment Screen</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Encrypted UPI Gateway</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 font-mono text-slate-300">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Order Items */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto border-r border-slate-800/80 bg-slate-950/50">
          {settledOrderNumber ? (
            <div className="m-auto text-center space-y-4 max-w-md animate-in zoom-in-95 duration-200">
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white">Payment Received!</h2>
                <p className="text-slate-400 text-sm">
                  Order <span className="font-mono text-emerald-400 font-bold">#{settledOrderNumber}</span> is being prepared in the kitchen.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span>Thank you for dining with us! Have a wonderful meal.</span>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="m-auto text-center space-y-4 max-w-sm text-slate-500">
              <div className="h-20 w-20 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <ShoppingBag size={36} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Welcome to Our Restaurant!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Items added at the cashier counter will be displayed here in real time.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
                <span>Ordered Dishes ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
                <span>Price</span>
              </div>

              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.cart_id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full shrink-0 ${item.is_veg !== false ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.variant_name && (
                            <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                              {item.variant_name}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          ₹{item.unit_price} × {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-base font-black text-white">
                      ₹{(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Total & Instant UPI QR Code */}
        <div className="w-[420px] p-8 bg-slate-900/40 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Order Breakdown
              </span>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount Applied</span>
                    <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>GST (5%)</span>
                    <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Total Payable</span>
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    ₹{netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic UPI QR Code Box */}
            {netAmount > 0 && !settledOrderNumber && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center space-y-3">
                <DynamicUpiQrCode
                  amount={netAmount}
                  orderNumber={`CFD-${Date.now().toString().slice(-4)}`}
                  size={190}
                  payeeName="SSR One Resto"
                  vpa="merchant@upi"
                />
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-slate-300">
                    Scan with PhonePe, GPay, Paytm or any UPI App
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Zero convenience fee • 100% Secure Instant Settlement
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Heart size={12} className="text-rose-500" />
            <span>Thank you for choosing SSR One Dining Experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};
