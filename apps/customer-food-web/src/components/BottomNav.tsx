import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, UtensilsCrossed, ClipboardList, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/stores/i18nStore";
import { useCartStore } from "@/stores/cartStore";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableNumber } = useParams();
  const { t } = useI18n();
  const itemCount = useCartStore((s) => s.getItemCount());

  const prefix = tableNumber ? `/order/table/${tableNumber}` : "";

  const tabs = [
    { key: "home", label: t("nav.home"), icon: Home, path: prefix ? prefix : "/" },
    { key: "menu", label: t("nav.menu"), icon: UtensilsCrossed, path: `${prefix}/menu` },
    { key: "orders", label: t("nav.orders"), icon: ClipboardList, path: "/my-orders" },
    { key: "profile", label: t("nav.profile"), icon: UserCircle, path: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/" || path === prefix) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Hide on checkout and order-status pages
  const hiddenPaths = ["/checkout", "/order-status", "/login", "/admin"];
  if (hiddenPaths.some((p) => location.pathname.includes(p))) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-popover/95 backdrop-blur-lg border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {tabs.map(({ key, label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                {key === "menu" && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-bold")}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
