import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@ssrone/auth";
import { useI18n } from "@/stores/i18nStore";
import { Truck, ArrowRight, MapPin, Utensils, ShoppingBag, Camera } from "lucide-react";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import SelectLocationModal from "@/components/SelectLocationModal";
import AddressSelectDialog from "@/components/AddressSelectDialog";
import TableCameraScannerModal from "@/components/TableCameraScannerModal";
import { fetchMenuItems, fetchCategories } from "@ssrone/api-client";

const Welcome = () => {
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber, branches, switchBranch } = useTenantBranchContext();
  const { branding } = useTenantAppConfig();
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const { isLoggedIn, user, setOrderMode, deliveryAddress } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();

  const [showLocationGuardModal, setShowLocationGuardModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTableScannerModal, setShowTableScannerModal] = useState(false);

  // Background prefetch menu items and categories so menu loads with 0ms delay
  useEffect(() => {
    if (branchCode) {
      fetchMenuItems(branchCode).catch(() => {});
      fetchCategories(branchCode).catch(() => {});
    }
  }, [branchCode]);

  const activeBranch = branches.find((b) => b.code === branchCode);
  const tenantTitle = branding.businessName || activeBranch?.name || "The Baithak Cafe";

  // If customer accessed via a table QR code or table is set, directly jump to the table menu
  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
      setOrderMode("dine-in");
      navigate(
        `/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/table/${tableNumber}/menu`,
        { replace: true }
      );
    }
  }, [tableNumber, tenantSlug, branchCode, navigate, setTableNumber, setOrderMode]);

  // Direct Option 1: Dine-In -> Open camera scanner -> Scanned table immediately accesses table menu
  const handleDineInClick = () => {
    if (tableNumber) {
      setOrderMode("dine-in");
      navigate(`/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/table/${tableNumber}/menu`);
      return;
    }
    setShowTableScannerModal(true);
  };

  const handleTableScanned = (scanned: { tableNumber: string; tenantSlug?: string; branchCode?: string } | string) => {
    const table = typeof scanned === "string" ? scanned : scanned.tableNumber;
    const targetTenant = typeof scanned !== "string" && scanned.tenantSlug ? scanned.tenantSlug : (tenantSlug || "baithak-cafe");
    const targetBranch = typeof scanned !== "string" && scanned.branchCode ? scanned.branchCode : (branchCode || "101");

    if (typeof scanned !== "string" && scanned.branchCode && scanned.branchCode !== branchCode) {
      switchBranch(scanned.branchCode);
    }

    setTableNumber(table);
    setOrderMode("dine-in");
    navigate(`/t/${targetTenant}/b/${targetBranch}/table/${encodeURIComponent(table)}/menu`);
  };

  // Direct Option 2: Takeaway -> Directly access takeaway menu
  const handleTakeawayClick = () => {
    setTableNumber("");
    setOrderMode("takeaway");
    navigate(`/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/menu`);
  };

  // Direct Option 3: Delivery -> Check address, directly access delivery menu
  const handleDeliveryClick = () => {
    setTableNumber("");
    setOrderMode("delivery");
    if (!deliveryAddress) {
      setShowAddressModal(true);
    } else {
      navigate(`/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/menu`);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between items-center px-4 py-3 select-none text-white font-sans">
      {/* Ambient Luxury Cafe Background (Pure CSS Gradient - No Bowl Photo) */}
      <div className="fixed inset-0 -z-20 pointer-events-none bg-gradient-to-b from-[#1C1510] via-[#241A14] to-[#120D0A]" />
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(217, 119, 6, 0.28) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(140, 94, 53, 0.22) 0%, transparent 55%)",
        }}
      />

      {/* Top Location Pill */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-between text-xs text-white/90 pt-0.5">
        <button
          type="button"
          onClick={() => setShowLocationGuardModal(true)}
          className="flex items-center gap-1.5 font-semibold bg-white/10 hover:bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 transition cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[220px]">{activeBranch?.name || "Main Outlet"}</span>
        </button>
      </div>

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center text-center my-auto px-1"
      >
        {/* Steaming Golden Cafe Emblem */}
        <div className="w-13 h-13 rounded-full border border-amber-400/40 bg-black/40 backdrop-blur-md p-2.5 shadow-xl flex items-center justify-center mb-2">
          <svg
            className="w-7 h-7 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <path d="M6 2v2M10 2v2M14 2v2" />
            <line x1="2" y1="21" x2="20" y2="21" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-[26px] font-bold text-white tracking-wide leading-tight mb-1">
          {isLoggedIn && user?.name ? `Welcome, ${user.name}` : tenantTitle}
        </h1>

        <p className="text-xs text-[#E5C9A3] mb-4 font-medium tracking-wide">
          {branding?.tagline || "Traditional Flavour, Modern Experience"}
        </p>

        {/* ── Explore Menu Section Headline with 3 Direct Access Cards ── */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="font-serif text-base font-bold text-amber-200 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Explore Menu
            </h2>
            <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
              Tap to order
            </span>
          </div>

          {/* 1. Dine-In Card: Opens camera to scan table QR */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDineInClick}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-white tracking-wide">
                    Dine-In
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Scan Table
                  </span>
                </div>
                <p className="text-[11px] text-white/70 truncate mt-0.5">
                  Open camera to scan table QR code
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-amber-500/20 text-white/70 group-hover:text-amber-300 transition shrink-0 ml-2">
              <Camera className="w-4 h-4" />
            </div>
          </motion.button>

          {/* 2. Takeaway Card: Direct access to menu */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleTakeawayClick}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#9E6B38]/30 border border-[#9E6B38]/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-white tracking-wide">
                    Takeaway
                  </span>
                  <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                    Pickup
                  </span>
                </div>
                <p className="text-[11px] text-white/70 truncate mt-0.5">
                  Order ahead & collect at the counter
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/15 text-white/70 group-hover:text-white transition shrink-0 ml-2">
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* 3. Delivery Card: Direct access to menu */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDeliveryClick}
            className="w-full p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md flex items-center justify-between text-left transition-all cursor-pointer group shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-white tracking-wide">
                    Delivery
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/25 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Doorstep
                  </span>
                </div>
                <p className="text-[11px] text-white/70 truncate mt-0.5">
                  Hot & fresh food delivered to your door
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-emerald-500/20 text-white/70 group-hover:text-emerald-300 transition shrink-0 ml-2">
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Brand Value Props at Bottom */}
      <div className="relative z-10 flex items-center justify-center gap-3 text-[10px] sm:text-[11px] text-white/60 font-medium pb-0.5">
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Fast Ordering</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Secure & Safe</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Fresh Ingredients</span>
        </div>
      </div>

      {/* Modals */}
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

      <AddressSelectDialog
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={() => {
          navigate(`/t/${tenantSlug || "baithak-cafe"}/b/${branchCode || "101"}/menu`);
        }}
      />

      <TableCameraScannerModal
        isOpen={showTableScannerModal}
        onClose={() => setShowTableScannerModal(false)}
        onTableScanned={handleTableScanned}
      />
    </div>
  );
};

export default Welcome;
