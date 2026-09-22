import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { LogIn, LogOut, Truck, ClipboardList, QrCode, Award, MapPin } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import heroFood from "@/assets/hero-food.jpg";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import SelectLocationModal from "@/components/SelectLocationModal";

const Welcome = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber, isTableMode, branches, switchBranch } = useTenantBranchContext();
  const { branding, banner, features } = useTenantAppConfig();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const { isLoggedIn, user, logout, orderMode, setOrderMode, loyaltyTier, loyaltyPoints } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const [showLocationGuardModal, setShowLocationGuardModal] = useState(false);

  const activeBranch = branches.find((b) => b.code === branchCode);
  const tenantTitle = branding.businessName || activeBranch?.name || (tenantSlug ? tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "SSR One AI");
  const bgImage = banner.imageUrl || heroFood;

  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
      setOrderMode("dine-in");
    }
  }, [tableNumber, setTableNumber, setOrderMode]);

  const handleStartOrdering = () => {
    if (!tenantSlug || !branchCode) {
      setShowLocationGuardModal(true);
      return;
    }
    if (isTableMode && tableNumber) {
      navigate(`/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}/menu`);
    } else {
      navigate(`/t/${tenantSlug}/b/${branchCode}/menu`);
    }
  };

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between items-center overflow-hidden p-4 sm:p-6 select-none">
      {/* Background Image & Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/75 via-foreground/55 to-foreground/85" />

      {/* Top Bar */}
      <div className="relative z-20 w-full max-w-7xl flex items-center justify-between">
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

        <div className="flex items-center gap-2">
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
              onClick={() => navigate("/")}
              className="px-3.5 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/25 transition flex items-center gap-1.5 backdrop-blur"
            >
              <LogIn className="w-3.5 h-3.5" /> {t("welcome.login")}
            </button>
          )}
        </div>
      </div>

      {/* Hero Central Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-4 max-w-md my-auto flex flex-col items-center justify-center"
      >
        {branding.logoUrl ? (
          <motion.img
            src={branding.logoUrl}
            alt={tenantTitle}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full mb-2 sm:mb-3 shadow-lg bg-background/20 backdrop-blur p-1 border border-primary-foreground/20"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <motion.div
            className="text-5xl sm:text-6xl mb-2 sm:mb-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🍽️
          </motion.div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-2 leading-tight">
          {isLoggedIn
            ? t("welcome.back", { name: user?.name || "" })
            : isTableMode
            ? t("welcome.table", { table: tableNumber || "" })
            : t("welcome.general", { name: tenantTitle })}
        </h1>

        <p className="text-sm sm:text-base text-primary-foreground/80 mb-2">
          {branding.tagline || (isTableMode ? t("welcome.subtitle.table") : t("welcome.subtitle.general"))}
        </p>

        {isTableMode && (
          <p className="text-xs text-primary-foreground/60 mb-2">
            {t("welcome.tableDetected", { table: tableNumber || "" })}
          </p>
        )}

        {/* Loyalty badge */}
        {isLoggedIn && loyaltyPoints > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-primary-foreground/15 backdrop-blur px-3 py-1 rounded-full text-primary-foreground text-xs font-medium mb-2"
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
            transition={{ delay: 0.5 }}
            className="text-[11px] text-primary-foreground/75 bg-primary-foreground/10 backdrop-blur px-3 py-1 rounded-full inline-block mb-2"
          >
            {t("misc.firstOrderDiscount")}
          </motion.p>
        )}

        {/* Food Emojis */}
        <div className="flex justify-center gap-3 text-2xl sm:text-3xl my-3">
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>🍕</motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>🥟</motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>🍛</motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}>☕</motion.span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}>🍰</motion.span>
        </div>

        {/* Mode toggle */}
        {!isTableMode && (
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {features.tableQrOrdering !== false && (
              <button
                onClick={() => setOrderMode("dine-in")}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
                  orderMode === "dine-in"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/25"
                }`}
              >
                {t("welcome.dineIn")}
              </button>
            )}
            {features.takeaway && (
              <button
                onClick={() => setOrderMode("takeaway")}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
                  orderMode === "takeaway"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/25"
                }`}
              >
                Takeaway
              </button>
            )}
            {features.delivery !== false && (
              <button
                onClick={() => setOrderMode("delivery")}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition flex items-center gap-1 ${
                  orderMode === "delivery"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/25"
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> {t("welcome.delivery")}
              </button>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStartOrdering}
          className="btn-order text-base sm:text-lg px-8 py-3.5 pulse-soft shadow-lg w-full max-w-xs"
        >
          {orderMode === "delivery" && !isTableMode
            ? t("welcome.browseMenu")
            : t("welcome.startOrder")}
        </motion.button>

        {/* Free delivery banner */}
        {orderMode === "delivery" && !isTableMode && (
          <p className="text-[11px] text-primary-foreground/60 mt-2">{t("misc.freeDelivery")}</p>
        )}
      </motion.div>

      {/* Footer info */}
      <div className="relative z-10 text-center">
        <p className="text-primary-foreground/60 text-xs">
          {tenantTitle} · Live Digital Ordering & Dining ✨
        </p>
      </div>

      {/* Location Guard Modal */}
      <SelectLocationModal
        isOpen={showLocationGuardModal}
        branches={branches}
        currentBranchCode={branchCode}
        onSelectBranch={(code) => {
          switchBranch(code);
          setShowLocationGuardModal(false);
        }}
        onClose={() => setShowLocationGuardModal(false)}
      />
    </div>
  );
};

export default Welcome;
