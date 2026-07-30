import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { useI18n } from "@/stores/i18nStore";
import { LogIn, LogOut, Truck, ClipboardList, QrCode, Award } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import heroFood from "@/assets/hero-food.jpg";

const Welcome = () => {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const { isLoggedIn, user, logout, orderMode, setOrderMode, loyaltyTier, loyaltyPoints } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();
  
  // Track selected unit locally
  const [selectedUnit, setSelectedUnit] = useState(() => localStorage.getItem("baithak_active_unit") || "CUH02");

  const isTableMode = !!tableNumber;

  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
      setOrderMode("dine-in");
    }
  }, [tableNumber, setTableNumber, setOrderMode]);

  const handleStartOrdering = () => {
    if (isTableMode) {
      navigate(`/order/table/${tableNumber}/menu`);
    } else {
      navigate("/menu");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pb-16">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroFood})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/qr")}
            className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 transition"
            aria-label="Admin QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <LanguageToggle className="text-primary-foreground border-primary-foreground/30" />
        </div>
        <div className="flex gap-2">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/my-orders")}
                className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 transition"
                aria-label={t("welcome.myOrders")}
              >
                <ClipboardList className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 transition"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/25 transition flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" /> {t("welcome.login")}
            </button>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🍽️
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-3">
          {isLoggedIn
            ? t("welcome.back", { name: user?.name || "" })
            : isTableMode
            ? t("welcome.table", { table: tableNumber || "" })
            : t("welcome.general")}
        </h1>

        <p className="text-lg text-primary-foreground/80 mb-2">
          {isTableMode ? t("welcome.subtitle.table") : t("welcome.subtitle.general")}
        </p>

        {isTableMode && (
          <p className="text-sm text-primary-foreground/60 mb-1">
            {t("welcome.tableDetected", { table: tableNumber || "" })}
          </p>
        )}

        {/* Loyalty badge */}
        {isLoggedIn && loyaltyPoints > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-primary-foreground/15 backdrop-blur px-3 py-1.5 rounded-full text-primary-foreground text-xs font-medium mb-3"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="capitalize">{loyaltyTier}</span> · {loyaltyPoints} pts
          </motion.div>
        )}

        {/* First order banner */}
        {!isLoggedIn && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-primary-foreground/70 bg-primary-foreground/10 backdrop-blur px-3 py-1.5 rounded-full inline-block mb-3"
          >
            {t("misc.firstOrderDiscount")}
          </motion.p>
        )}

        <div className="flex justify-center gap-3 text-3xl my-6">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>🍕</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>🥟</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>🍛</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}>☕</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}>🍰</motion.span>
        </div>

        {/* Mode toggle */}
        {!isTableMode && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setOrderMode("dine-in")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                orderMode === "dine-in"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary-foreground/15 text-primary-foreground/80"
              }`}
            >
              {t("welcome.dineIn")}
            </button>
            <button
              onClick={() => setOrderMode("delivery")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                orderMode === "delivery"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary-foreground/15 text-primary-foreground/80"
              }`}
            >
              <Truck className="w-4 h-4" /> {t("welcome.delivery")}
            </button>
          </div>
        )}

        {/* Dining Outlet Header */}
        <div className="mb-6 bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 p-3 rounded-2xl max-w-xs mx-auto text-center">
          <p className="text-[10px] uppercase font-bold text-primary-foreground/80 tracking-wider">Welcome to The Baithak</p>
          <p className="text-xs font-black text-primary-foreground mt-0.5">Live Digital Order & Dining</p>
        </div>


        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStartOrdering}
          className="btn-order text-lg px-10 py-4 pulse-soft shadow-lg"
        >
          {orderMode === "delivery" && !isTableMode
            ? t("welcome.browseMenu")
            : t("welcome.startOrder")}
        </motion.button>

        {/* Free delivery banner */}
        {orderMode === "delivery" && !isTableMode && (
          <p className="text-xs text-primary-foreground/60 mt-3">{t("misc.freeDelivery")}</p>
        )}

        <p className="text-primary-foreground/50 text-xs sm:text-sm mt-6">
          {t("app.tagline")}
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
