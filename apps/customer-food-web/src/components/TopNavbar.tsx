import { useLocation, useNavigate } from "react-router-dom";
import { Home, UtensilsCrossed, ClipboardList, UserCircle, Menu, X, MapPin, ChevronDown, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/stores/i18nStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@ssrone/auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";
import { useTenantAppConfig } from "@/hooks/useTenantAppConfig";
import BranchSwitchDialog from "@/components/BranchSwitchDialog";
import SelectLocationModal from "@/components/SelectLocationModal";
import AddressSelectDialog from "@/components/AddressSelectDialog";
import TableCameraScannerModal from "@/components/TableCameraScannerModal";
import type { BranchInfo } from "@ssrone/api-client";

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber, branches, switchBranch } = useTenantBranchContext();
  const { branding } = useTenantAppConfig();
  const { t } = useI18n();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isLoggedIn, orderMode, setOrderMode, deliveryAddress } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<BranchInfo | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isTableScanOpen, setIsTableScanOpen] = useState(false);

  const activeBranch = branches.find((b) => b.code === branchCode);
  const activeBranchName = activeBranch?.name || branchCode || "Select Location";
  const brandTitle = branding?.businessName || activeBranch?.name || (tenantSlug ? tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Baithak Cafe");

  const homePath = `/t/${tenantSlug}/b/${branchCode}${tableNumber ? `/table/${tableNumber}` : ""}`;
  const menuPath = `/t/${tenantSlug}/b/${branchCode}${tableNumber ? `/table/${tableNumber}` : ""}/menu`;
  const ordersPath = `/t/${tenantSlug}/b/${branchCode}/my-orders`;
  const loginPath = isLoggedIn ? `/t/${tenantSlug}/b/${branchCode}/profile` : homePath;

  const isHomePage =
    location.pathname === "/" ||
    location.pathname === `/t/${tenantSlug}` ||
    location.pathname === `/t/${tenantSlug}/b/${branchCode}` ||
    (Boolean(tableNumber) && location.pathname === `/t/${tenantSlug}/b/${branchCode}/table/${tableNumber}`) ||
    Boolean(location.pathname.match(/^\/order\/table\/[^/]+$/));

  const hiddenPaths = ["/checkout", "/order-status", "/admin", "/menu", "/profile", "/my-orders"];
  if (isHomePage || hiddenPaths.some((p) => location.pathname.includes(p))) return null;

  const isActive = (path: string) => {
    if (path === homePath) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleBranchSelectAttempt = (newCode: string) => {
    if (newCode === branchCode) return;
    const target = branches.find((b) => b.code === newCode);
    if (target) {
      setPendingBranch(target);
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmBranchSwitch = () => {
    if (pendingBranch) {
      switchBranch(pendingBranch.code);
    }
    setIsConfirmOpen(false);
    setPendingBranch(null);
  };

  const navItems = [
    { icon: <Home className="w-4 h-4" />, label: t("nav.home"), path: homePath, badge: undefined },
    { icon: <UtensilsCrossed className="w-4 h-4" />, label: t("nav.menu"), path: menuPath, badge: itemCount > 0 ? itemCount : undefined },
    { icon: <ClipboardList className="w-4 h-4" />, label: t("nav.orders"), path: ordersPath, badge: undefined },
    { icon: <UserCircle className="w-4 h-4" />, label: isLoggedIn ? t("nav.profile") : t("welcome.login"), path: loginPath, badge: undefined },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-xs font-sans"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto px-3 sm:px-6 h-14">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate(homePath)}
            className="flex items-center gap-2.5 hover:opacity-90 transition group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={brandTitle} className="w-full h-full object-contain" />
              ) : (
                <span className="font-extrabold text-xs text-primary font-serif">
                  {brandTitle.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base text-foreground font-serif leading-tight block tracking-tight">
                {brandTitle}
              </span>
              {activeBranchName && (
                <span className="text-[11px] text-muted-foreground font-medium hidden sm:block">
                  {activeBranchName}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Center: Branch & Mode Selectors (Visible on Tablet/Laptop/Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {branches.length > 0 && (
            <div className="relative inline-flex items-center bg-muted border border-border rounded-full px-3 py-1.5 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary mr-1.5 shrink-0" />
              <select
                value={branchCode}
                onChange={(e) => handleBranchSelectAttempt(e.target.value)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer pr-3"
              >
                {branches.map((b) => (
                  <option key={b.code} value={b.code} className="bg-card text-foreground">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Selector */}
          <div className="inline-flex items-center bg-muted border border-border rounded-full px-3 py-1.5 text-xs font-medium">
            <select
              value={orderMode || "dine-in"}
              onChange={(e) => {
                const newMode = e.target.value as any;
                setOrderMode(newMode);
                if (newMode === "dine-in" && !tableNumber) setIsTableScanOpen(true);
                if (newMode === "delivery" && !deliveryAddress) setIsAddressModalOpen(true);
              }}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="dine-in" className="bg-card text-foreground">Dine-In</option>
              <option value="takeaway" className="bg-card text-foreground">Takeaway</option>
              <option value="delivery" className="bg-card text-foreground">Delivery</option>
            </select>
          </div>
        </div>

        {/* Right: Table pill / Branch Pill on mobile + Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          {tableNumber && (
            <button
              onClick={() => setIsTableScanOpen(true)}
              className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full px-2.5 py-1 text-xs font-bold cursor-pointer active:scale-95 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Table {tableNumber}</span>
            </button>
          )}

          {/* Location button on mobile */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-muted border border-border text-foreground rounded-full px-3 py-1 text-xs font-medium cursor-pointer active:scale-95 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="break-words font-medium">{activeBranchName.replace("Baithak Cafe - ", "")}</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-muted text-foreground hover:bg-border transition cursor-pointer active:scale-95"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card px-4 py-3 space-y-1.5 shadow-lg"
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <BranchSwitchDialog
        isOpen={isConfirmOpen}
        targetBranch={pendingBranch}
        currentBranchName={activeBranchName}
        onConfirm={handleConfirmBranchSwitch}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
      />

      <SelectLocationModal
        isOpen={isLocationModalOpen}
        branches={branches}
        currentBranchCode={branchCode}
        onSelectBranch={(code) => {
          handleBranchSelectAttempt(code);
          setIsLocationModalOpen(false);
        }}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <AddressSelectDialog
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />

      <TableCameraScannerModal
        isOpen={isTableScanOpen}
        onClose={() => setIsTableScanOpen(false)}
        onTableScanned={(tbl) => {
          navigate(`/t/${tenantSlug}/b/${branchCode}/table/${tbl}/menu`);
        }}
      />
    </nav>
  );
};

export default TopNavbar;
