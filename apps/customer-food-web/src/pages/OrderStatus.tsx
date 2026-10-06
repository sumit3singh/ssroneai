import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Check,
  Clock,
  Copy,
  UtensilsCrossed,
  ArrowLeft,
  Bell,
  PlusCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useI18n } from "@/stores/i18nStore";
import { useAuthStore } from "@ssrone/auth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@ssrone/api-client";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";

export const OrderStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ orderId?: string }>();
  const { tenantSlug, branchCode, tableNumber, isTableMode } = useTenantBranchContext();
  const { t } = useI18n();
  const { toast } = useToast();
  const { orderMode } = useAuthStore();

  const state = location.state as { orderId?: string; orderNumber?: string; estimatedTime?: number } | undefined;
  const activeOrderId = params.orderId || state?.orderId || null;
  const displayOrderNumber = state?.orderNumber || activeOrderId || "";
  const [currentStep, setCurrentStep] = useState(1);
  const [statusText, setStatusText] = useState("Order Placed");
  const estimatedTime = state?.estimatedTime || (isTableMode ? 15 : 35);
  const [waiterCalled, setWaiterCalled] = useState(false);

  const isDelivery = orderMode === "delivery";
  const isTakeaway = orderMode === "takeaway";

  const steps = isDelivery
    ? [
        { label: "Order Placed", desc: "Received at restaurant" },
        { label: "Confirmed", desc: "Kitchen accepted order" },
        { label: "Preparing", desc: "Chef is cooking freshly" },
        { label: "Out for Delivery", desc: "Rider on the way" },
        { label: "Delivered", desc: "Enjoy your delicious meal" },
      ]
    : isTakeaway
    ? [
        { label: "Order Placed", desc: "Received at restaurant" },
        { label: "Confirmed", desc: "Kitchen accepted order" },
        { label: "Preparing", desc: "Chef is cooking freshly" },
        { label: "Ready at Counter", desc: "Please collect your meal" },
        { label: "Picked Up", desc: "Order complete" },
      ]
    : [
        { label: "Order Placed", desc: "Received at restaurant" },
        { label: "Confirmed", desc: "Kitchen accepted order" },
        { label: "Preparing", desc: "Chef is cooking freshly" },
        { label: "Ready to Serve", desc: "Being brought to your table" },
        { label: "Served", desc: "Enjoy your dining" },
      ];

  useEffect(() => {
    if (!activeOrderId) return;

    let pollIntervalMs = 5000;
    let timer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchRealOrderStatus = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return; // Don't poll when tab is in background
      }

      try {
        const res = await api.get<any>(`/orders/${activeOrderId}`);
        if (!isMounted) return;

        if (res && res.status) {
          const st = String(res.status || "").toLowerCase();
          if (st === "kot_sent" || st === "open" || st === "pending" || st === "draft") {
            setCurrentStep(1);
            setStatusText("Kitchen Confirmed");
          } else if (st === "in_kitchen" || st === "preparing" || st === "kitchen") {
            setCurrentStep(2);
            setStatusText("Chef Preparing Meal");
          } else if (st === "ready" || st === "prepared") {
            setCurrentStep(3);
            setStatusText(isTakeaway ? "Ready at Counter" : isDelivery ? "Out for Delivery" : "Ready to Serve");
          } else if (st === "completed" || st === "paid" || st === "served" || st === "settled") {
            setCurrentStep(4);
            setStatusText("Order Complete");
            return; // Stop polling on terminal state
          }
        }
      } catch {
        // Network failure, continue progressive polling
      }

      if (isMounted) {
        pollIntervalMs = Math.min(pollIntervalMs + 1000, 12000); // Progressive backoff up to 12s
        timer = setTimeout(fetchRealOrderStatus, pollIntervalMs);
      }
    };

    fetchRealOrderStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [activeOrderId, isDelivery, isTakeaway]);

  const copyOrderId = () => {
    if (displayOrderNumber) {
      navigator.clipboard.writeText(displayOrderNumber);
      toast({ title: "Copied!", description: `Order #${displayOrderNumber} copied to clipboard` });
    }
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    toast({
      title: "Staff Notified 🔔",
      description: `Wait staff has been informed for Table ${tableNumber || "your table"}.`,
    });
  };

  const menuUrl =
    orderMode === "dine-in" && tableNumber
      ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}/menu`
      : `/t/${tenantSlug}/b/${branchCode}/menu`;

  if (!activeOrderId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1 font-serif">No Active Order Selected</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mb-6 max-w-xs">
          You don't have an active order session in view. Browse our menu to place an order.
        </p>
        <button
          onClick={() => navigate(menuUrl)}
          className="px-6 py-3 rounded-full bg-[#9E6B38] hover:bg-[#8C5E35] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#2D241E] flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E3DC] px-4 py-3.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(menuUrl)}
            className="w-8 h-8 rounded-full bg-[#FBF8F3] hover:bg-[#EDE8E2] text-[#2D241E] flex items-center justify-center transition cursor-pointer active:scale-95 border border-[#E8E3DC]"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-extrabold text-[#2D241E] font-serif tracking-tight">Order Tracking</h1>
            <p className="text-[11px] text-[#7A746B] font-medium">
              {orderMode === "dine-in"
                ? tableNumber
                  ? `Table ${tableNumber}`
                  : "Dine-In"
                : isTakeaway
                ? "Counter Pickup"
                : "Home Delivery"}
            </p>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 sm:p-6 flex flex-col items-center space-y-4">
        {/* Token Card */}
        <div className="w-full bg-white rounded-3xl p-6 border border-[#E8E3DC] shadow-xs flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#9E6B38]/10 border border-[#9E6B38]/20 text-[#9E6B38] flex items-center justify-center mb-3 shadow-xs">
            <UtensilsCrossed className="w-8 h-8 stroke-[2]" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#2D241E] font-serif mb-1">
            {statusText}
          </h2>
          <p className="text-xs text-[#7A746B] max-w-xs leading-relaxed mb-4">
            {currentStep >= steps.length - 1
              ? "Hope you loved the food! Thank you for dining with us."
              : "Your items are being prepared with care in the kitchen."}
          </p>

          {/* Order ID & Estimated Time Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1.5 bg-[#FBF8F3] border border-[#E8E3DC] px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-[#2D241E] hover:border-[#9E6B38] cursor-pointer transition active:scale-95"
              title="Copy Order ID"
            >
              <span className="font-mono font-bold break-all">#{displayOrderNumber}</span>
              <Copy className="w-3 h-3 text-[#7A746B] shrink-0" />
            </button>
            <span className="flex items-center gap-1.5 bg-[#9E6B38]/10 border border-[#9E6B38]/20 text-[#9E6B38] px-3.5 py-1.5 rounded-full text-xs font-extrabold shrink-0">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" /> ~{estimatedTime} mins
            </span>
          </div>
        </div>

        {/* Live Step Progress Timeline */}
        <div className="w-full bg-white rounded-3xl p-5 border border-[#E8E3DC] shadow-xs space-y-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A746B] mb-4">
            Order Progress
          </h3>

          <div className="space-y-4">
            {steps.map((step, i) => {
              const isDone = i <= currentStep;
              const isCurrent = i === currentStep;

              return (
                <div key={step.label} className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all",
                        isDone
                          ? "bg-[#9E6B38] text-white shadow-xs ring-4 ring-[#9E6B38]/15"
                          : "bg-[#FBF8F3] text-[#7A746B] border border-[#E8E3DC]"
                      )}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-8 my-1 transition-colors",
                          i < currentStep ? "bg-[#9E6B38]" : "bg-[#E8E3DC]"
                        )}
                      />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <div
                      className={cn(
                        "text-xs font-bold transition-colors",
                        isCurrent
                          ? "text-[#9E6B38] text-sm font-extrabold"
                          : isDone
                          ? "text-[#2D241E]"
                          : "text-[#7A746B]"
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dine-In Hospitality Actions */}
        {isTableMode && (
          <div className="w-full grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCallWaiter}
              disabled={waiterCalled}
              className="py-3 px-4 rounded-2xl bg-card border border-border hover:bg-muted text-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-primary" />
              <span>{waiterCalled ? "Staff Called ✓" : "Call Waiter"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(menuUrl)}
              className="py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Order More Items</span>
            </button>
          </div>
        )}

        {/* General Action to Return to Menu */}
        {!isTableMode && (
          <button
            type="button"
            onClick={() => navigate(menuUrl)}
            className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
          >
            <span>Back to Menu</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
