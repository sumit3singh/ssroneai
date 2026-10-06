import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, RotateCcw, MapPin, Hash, Package, RefreshCw,
  Lock, Receipt, UtensilsCrossed, CheckCircle2, CookingPot, XCircle, FileText
} from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/stores/i18nStore";
import { OrderCardSkeleton } from "@/components/LoadingSkeleton";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { menuItems } from "@/data/mockMenu";
import { fetchCustomerOrders } from "@ssrone/api-client";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";

const MyOrders = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { isLoggedIn, user, pastOrders, rateOrder } = useAuthStore();
  const { addItem } = useCartStore();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();

  const menuUrl =
    tenantSlug && branchCode
      ? tableNumber
        ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}/menu`
        : `/t/${tenantSlug}/b/${branchCode}/menu`
      : tableNumber
      ? `/order/table/${tableNumber}/menu`
      : "/menu";

  const homeUrl =
    tenantSlug && branchCode
      ? tableNumber
        ? `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}`
        : `/t/${tenantSlug}/b/${branchCode}`
      : "/";

  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = () => {
    if (isLoggedIn && (user?.phone || user?.id)) {
      setLoading(true);
      const identifier = user?.phone || user?.id;
      fetchCustomerOrders(identifier)
        .then((orders) => {
          if (Array.isArray(orders)) {
            setDbOrders(orders);
          }
        })
        .catch((err) => {
          console.error("fetchCustomerOrders failed", err);
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isLoggedIn, user?.id, user?.phone]);

  const handleReorder = (order: any) => {
    (order.items || []).forEach((item: any) => {
      const menuItem = menuItems.find((m) => item.name?.startsWith(m.name));
      if (menuItem) {
        for (let i = 0; i < (item.quantity || 1); i++) {
          addItem(menuItem);
        }
      }
    });
    navigate(menuUrl);
  };

  // Filter: STRICTLY only orders from the last 7 days (never show orders older than 7 days)
  const rawOrders = dbOrders.length > 0 ? dbOrders : (pastOrders || []);
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const ordersList = rawOrders.filter((order: any) => {
    const rawDate = order.created_at || order.createdAt || order.date || order.order_date;
    if (!rawDate) return true;
    let orderTime = new Date(rawDate).getTime();
    if (isNaN(orderTime)) {
      orderTime = Date.parse(String(rawDate).replace(" ", "T"));
    }
    if (!isNaN(orderTime)) {
      return orderTime >= sevenDaysAgoMs;
    }
    return true;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex flex-col items-center justify-center p-6 text-center pb-20 font-sans">
        <div className="w-16 h-16 rounded-full bg-[#E8E3DC]/60 flex items-center justify-center mb-4 text-[#7A746B]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#2D241E] mb-1 font-serif">{t("myOrders.loginRequired")}</h2>
        <p className="text-[#7A746B] text-xs sm:text-sm mb-6 max-w-xs">{t("myOrders.loginSubtitle")}</p>
        <button
          onClick={() => navigate(homeUrl)}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {t("welcome.login")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-28 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8E3DC] px-4 py-3.5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-[#F8F6F2] hover:bg-[#E8E3DC] text-[#2D241E] flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-extrabold text-[#2D241E] font-serif tracking-tight">{t("myOrders.title")}</h1>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#F8F6F2] hover:bg-[#E8E3DC] text-[#2D241E] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Refresh orders"
            aria-label="Refresh orders"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin text-[#9E6B38]")} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* 7-Day History Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#2D241E] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9E6B38]" />
            Recent Orders (Last 7 Days)
          </span>
          <span className="text-[11px] font-semibold text-[#8C5E35] bg-[#8C5E35]/10 px-2.5 py-0.5 rounded-full border border-[#8C5E35]/20">
            7-Day Window
          </span>
        </div>

        {loading && ordersList.length === 0 ? (
          <div className="space-y-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : ordersList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#E8E3DC] p-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#E8E3DC]/60 flex items-center justify-center mx-auto mb-3 text-[#7A746B]">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-[#2D241E] font-serif">No orders in the last 7 days</h3>
            <p className="text-xs text-[#7A746B] mt-1 max-w-xs mx-auto">Only orders placed within the past 7 days are displayed here.</p>
            <button
              onClick={() => navigate(menuUrl)}
              className="mt-5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          ordersList.map((order, idx) => {
            const st = (order.status || "").toLowerCase();
            const isCompleted = st === "completed" || st === "delivered" || st === "served" || st === "paid";
            const isPreparing = st === "preparing" || st === "kitchen" || st === "kot_sent" || st === "open" || st === "draft";
            const isCancelled = st === "cancelled" || st === "voided";

            const tableNum = order.tableNumber || order.table_number;
            const deliveryAddr = order.deliveryAddress || order.delivery_address;
            const orderType = (order.order_type || order.orderMode || "").toLowerCase();

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-4 sm:p-5 space-y-3.5 border border-[#E8E3DC] shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-sm text-[#2D241E] font-serif">#{order.id}</p>
                    <p className="text-[11px] text-[#7A746B] mt-0.5">{order.date}</p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5",
                      isCompleted && "bg-[#9E6B38]/10 text-[#9E6B38] border-[#9E6B38]/25",
                      isPreparing && "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/25",
                      isCancelled && "bg-[#E53935]/10 text-[#E53935] border-[#E53935]/25"
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#9E6B38]" /> Completed
                      </>
                    ) : isPreparing ? (
                      <>
                        <CookingPot className="w-3 h-3 text-[#D97706]" /> In Kitchen
                      </>
                    ) : isCancelled ? (
                      <>
                        <XCircle className="w-3 h-3 text-[#E53935]" /> Cancelled
                      </>
                    ) : (
                      st.toUpperCase()
                    )}
                  </span>
                </div>

                <div className="text-xs text-[#7A746B] flex items-center gap-2 flex-wrap">
                  {orderType === "takeaway" ? (
                    <span className="flex items-center gap-1 font-semibold text-[#9E6B38]">
                      <Package className="w-3.5 h-3.5" /> Takeaway · Pick from Counter
                    </span>
                  ) : tableNum ? (
                    <span className="flex items-center gap-1 font-semibold text-[#2D241E]">
                      <Hash className="w-3.5 h-3.5 text-[#9E6B38]" /> Table {tableNum}
                    </span>
                  ) : deliveryAddr ? (
                    <span className="flex items-center gap-1 font-medium text-[#2D241E] break-words">
                      <MapPin className="w-3.5 h-3.5 text-[#9E6B38] shrink-0" /> {deliveryAddr}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Dine-in Order
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-[#E8E3DC] pt-2.5">
                  {(order.items || []).map((item: any, i: number) => {
                    // Extract item addons
                    let rawAddons = item.addons || item.selected_addons || item.selectedAddons || [];
                    if (typeof rawAddons === "string" && rawAddons.trim().startsWith("[")) {
                      try {
                        const parsed = JSON.parse(rawAddons);
                        if (Array.isArray(parsed)) rawAddons = parsed;
                      } catch {
                        // ignore
                      }
                    }
                    const itemAddons: string[] = Array.isArray(rawAddons)
                      ? rawAddons
                          .map((a: any) => {
                            if (typeof a === "string") return a;
                            if (a && typeof a === "object") {
                              const name = a.name || a.option?.name || a.title;
                              const price = a.price || a.option?.price;
                              if (name && price) return `${name} (+₹${price})`;
                              if (name) return name;
                            }
                            return null;
                          })
                          .filter(Boolean) as string[]
                      : typeof rawAddons === "string" && rawAddons.trim()
                      ? [rawAddons.trim()]
                      : [];

                    const itemVariant = item.variant || item.variant_name || item.variantName || null;

                    return (
                      <div key={i} className="flex flex-col text-xs sm:text-sm py-1.5 border-b border-[#E8E3DC]/40 last:border-b-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[#2D241E]">{item.name}</span>
                              {itemVariant && (
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300/60 px-1.5 py-0.5 rounded-md">
                                  {itemVariant}
                                </span>
                              )}
                              <span className="font-bold text-[#7A746B]">×{item.quantity}</span>
                            </div>

                            {/* Display Addons */}
                            {itemAddons.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E6B38]">
                                  Add-ons:
                                </span>
                                {itemAddons.map((addonText, aIdx) => (
                                  <span
                                    key={aIdx}
                                    className="text-[10px] font-medium text-[#2D241E] bg-[#FAF8F5] border border-[#E8E3DC] px-1.5 py-0.5 rounded-md"
                                  >
                                    +{addonText}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.notes && (
                              <p className="text-[11px] text-[#7A746B] italic mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3 text-[#9E6B38]" />
                                <span>Note: {item.notes}</span>
                              </p>
                            )}
                          </div>

                          <span className="font-extrabold text-[#2D241E] shrink-0">₹{item.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-[#E8E3DC] pt-3">
                  <span className="font-extrabold text-sm sm:text-base text-[#2D241E]">Total: ₹{order.total}</span>
                  <div className="flex items-center gap-3">
                    {order.status === "delivered" && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s: number) => (
                          <button
                            key={s}
                            onClick={() => rateOrder(order.id, s)}
                            className="p-0.5"
                            aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4 transition",
                                s <= (order.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[#E8E3DC]"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 rounded-full bg-[#9E6B38]/10 hover:bg-[#9E6B38]/20 text-[#9E6B38] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {t("myOrders.reorder")}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyOrders;
