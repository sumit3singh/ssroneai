import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, ChefHat, Bell, RotateCcw, Truck, Copy } from "lucide-react";
import { useI18n } from "@/stores/i18nStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const OrderStatus = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { toast } = useToast();
  const { orderMode } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);

  const state = location.state as { orderId?: string; estimatedTime?: number } | undefined;
  const [orderId] = useState(() => state?.orderId || `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`);
  const estimatedTime = state?.estimatedTime || (tableNumber ? 20 : 40);

  const isDelivery = orderMode === "delivery" && !tableNumber;

  const steps = isDelivery
    ? [
        { label: t("orderStatus.placed"), emoji: "✅" },
        { label: t("orderStatus.confirmed"), emoji: "👍" },
        { label: t("orderStatus.preparing"), emoji: "🍳" },
        { label: "Out for Delivery", emoji: "🛵" },
        { label: t("orderStatus.delivered"), emoji: "🎉" },
      ]
    : [
        { label: t("orderStatus.placed"), emoji: "✅" },
        { label: t("orderStatus.confirmed"), emoji: "👍" },
        { label: t("orderStatus.preparing"), emoji: "🍳" },
        { label: t("orderStatus.ready"), emoji: "🔔" },
        { label: "Served", emoji: "🎉" },
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast({ title: "Copied!", description: `Order ID ${orderId} copied to clipboard` });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-popover/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-display text-lg font-bold">{t("orderStatus.title")}</h1>
          <p className="text-xs text-muted-foreground">
            {t("app.name")} · {tableNumber ? `Table ${tableNumber}` : isDelivery ? "Delivery" : "Dine-in"}
          </p>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full p-6 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl mb-4"
        >
          {currentStep >= steps.length - 1 ? "🎉" : "🍽️"}
        </motion.div>

        <h2 className="font-display text-xl font-bold mb-1">
          {currentStep >= steps.length - 1
            ? t("orderStatus.orderDelivered")
            : t("orderStatus.beingPrepared")}
        </h2>
        <p className="text-sm text-muted-foreground mb-2">{t("orderStatus.relax")}</p>

        {/* Order ID & ETA */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={copyOrderId} className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full text-xs font-mono">
            #{orderId} <Copy className="w-3 h-3" />
          </button>
          <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" /> ~{estimatedTime} min
          </span>
        </div>

        {/* Progress Steps */}
        <div className="w-full space-y-0 mb-8">
          {steps.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: active ? 1.2 : 1,
                      backgroundColor: done ? "hsl(var(--accent))" : "hsl(var(--muted))",
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      done ? "text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.emoji}
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div className={cn("w-0.5 h-10 transition-colors", done ? "bg-accent" : "bg-muted")} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                  {active && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-primary flex items-center gap-1 mt-0.5"
                    >
                      <Clock className="w-3 h-3" /> In progress...
                    </motion.p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loyalty earned */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full bg-accent/10 rounded-2xl p-3 text-center mb-6"
        >
          <p className="text-xs text-accent font-medium">🎁 You earned loyalty points on this order!</p>
        </motion.div>

        {/* Actions */}
        <div className="w-full space-y-3">
          {!isDelivery && (
            <button
              onClick={() => toast({ title: "🔔 Waiter Notified!", description: "A waiter will be with you shortly." })}
              className="w-full py-3 rounded-2xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {t("orderStatus.callWaiter")}
            </button>
          )}
          <button
            onClick={() => navigate(tableNumber ? `/order/table/${tableNumber}/menu` : "/menu")}
            className="w-full py-3 rounded-2xl border border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t("orderStatus.orderMore")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 text-xs text-muted-foreground hover:text-foreground transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
