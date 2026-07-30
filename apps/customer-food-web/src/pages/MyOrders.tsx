import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, RotateCcw, MapPin, Hash, Package } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/stores/i18nStore";
import { OrderCardSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { menuItems } from "@/data/mockMenu";

const MyOrders = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoggedIn, pastOrders, rateOrder } = useAuthStore();
  const { addItem } = useCartStore();

  const handleReorder = (order: typeof pastOrders[0]) => {
    // Try to match menu items by name and add to cart
    order.items.forEach((item) => {
      const menuItem = menuItems.find((m) => item.name.startsWith(m.name));
      if (menuItem) {
        for (let i = 0; i < item.quantity; i++) {
          addItem(menuItem);
        }
      }
    });
    navigate("/menu");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center pb-20">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="font-display text-xl font-bold mb-2">{t("myOrders.loginRequired")}</h2>
        <p className="text-muted-foreground text-sm mb-6">{t("myOrders.loginSubtitle")}</p>
        <button
          onClick={() => navigate("/login", { state: { from: "/my-orders" } })}
          className="btn-order px-6 py-3"
        >
          {t("welcome.login")} 📱
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">{t("myOrders.title")}</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {pastOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-muted-foreground">{t("myOrders.noOrders")}</p>
            <button onClick={() => navigate("/menu")} className="btn-order px-6 py-3 mt-4">
              Browse Menu 🍽️
            </button>
          </div>
        ) : (
          pastOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-card rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    order.status === "delivered" && "bg-accent/20 text-accent",
                    order.status === "preparing" && "bg-secondary/20 text-secondary-foreground",
                    order.status === "cancelled" && "bg-destructive/20 text-destructive"
                  )}
                >
                  {order.status === "delivered" ? "✅ Delivered" : order.status === "preparing" ? "🍳 Preparing" : "❌ Cancelled"}
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {order.tableNumber ? (
                  <><Hash className="w-3 h-3" /> Table {order.tableNumber}</>
                ) : order.deliveryAddress ? (
                  <><MapPin className="w-3 h-3" /> {order.deliveryAddress}</>
                ) : (
                  <><Package className="w-3 h-3" /> Dine-in</>
                )}
              </div>

              <div className="space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="truncate">{item.name} ×{item.quantity}</span>
                    <span className="text-muted-foreground flex-shrink-0">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="font-bold text-sm">Total: ₹{order.total}</span>
                <div className="flex items-center gap-2">
                  {/* Rating */}
                  {order.status === "delivered" && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => rateOrder(order.id, s)}
                          className="p-0"
                          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={cn(
                              "w-4 h-4 transition",
                              s <= (order.rating || 0)
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleReorder(order)}
                    className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" /> {t("myOrders.reorder")}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
