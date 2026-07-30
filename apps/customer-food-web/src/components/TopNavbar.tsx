import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, UtensilsCrossed, ClipboardList, UserCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/stores/i18nStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import LanguageToggle from "@/components/LanguageToggle";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableNumber } = useParams();
  const { t } = useI18n();
  const itemCount = useCartStore((s) => s.getItemCount());
  const { isLoggedIn } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefix = tableNumber ? `/order/table/${tableNumber}` : "";

  const hiddenPaths = ["/checkout", "/order-status", "/login", "/admin", "/menu"];
  if (hiddenPaths.some((p) => location.pathname.includes(p))) return null;

  const isActive = (path: string) => {
    if (path === "/" || path === prefix) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { icon: <Home className="w-4 h-4" />, label: t("nav.home"), path: prefix || "/", badge: undefined },
    { icon: <UtensilsCrossed className="w-4 h-4" />, label: t("nav.menu"), path: `${prefix}/menu`, badge: itemCount > 0 ? itemCount : undefined },
    { icon: <ClipboardList className="w-4 h-4" />, label: t("nav.orders"), path: "/my-orders", badge: undefined },
    { icon: <UserCircle className="w-4 h-4" />, label: isLoggedIn ? t("nav.profile") : t("welcome.login"), path: isLoggedIn ? "/profile" : "/login", badge: undefined },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border/50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-popover/80 backdrop-blur-xl" />
      
      <div className="relative flex items-center justify-between max-w-7xl mx-auto px-4 h-16">
        {/* Logo / Brand */}
        <button
          onClick={() => navigate(prefix || "/")}
          className="flex items-center gap-2.5 hover:opacity-80 transition group"
        >
          <motion.span 
            className="text-2xl"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            🍽️
          </motion.span>
          <div className="flex flex-col items-start">
            <span className="font-display text-base sm:text-lg font-bold food-gradient-text leading-tight">
              {t("app.name")}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium tracking-wider uppercase hidden sm:block">
              Café & Restaurant
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavBtn
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={isActive(item.path)}
              onClick={() => handleNav(item.path)}
              badge={item.badge}
            />
          ))}
          <div className="w-px h-6 bg-border mx-2" />
          <LanguageToggle />
        </div>

        {/* Mobile: Language + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-muted/60 text-foreground hover:bg-muted transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="relative md:hidden overflow-hidden border-t border-border/50"
          >
            <div className="absolute inset-0 bg-popover/95 backdrop-blur-xl" />
            <div className="relative px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface NavBtnProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  className?: string;
}

const NavBtn = ({ icon, label, active, onClick, badge, className }: NavBtnProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all relative",
      active 
        ? "bg-primary/10 text-primary shadow-sm" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      className
    )}
    aria-label={label}
    aria-current={active ? "page" : undefined}
  >
    <div className="relative">
      {icon}
      {badge !== undefined && badge > 0 && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-sm"
        >
          {badge > 9 ? "9+" : badge}
        </motion.span>
      )}
    </div>
    <span>{label}</span>
  </button>
);

export default TopNavbar;
