import { useLocation, useNavigate } from "react-router-dom";
import { Home, UserCircle, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenantBranchContext } from "@/hooks/useTenantBranchContext";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenantSlug, branchCode, tableNumber } = useTenantBranchContext();

  const prefix = tenantSlug && branchCode
    ? `/t/${tenantSlug}/b/${branchCode}${tableNumber ? `/table/${tableNumber}` : ""}`
    : tableNumber
    ? `/order/table/${tableNumber}`
    : "";

  const homePath = prefix ? prefix : "/";
  const menuPath = `${prefix}/menu`;
  const profilePath = `${prefix}/profile`;

  // Hide on checkout, order-status, login, admin
  const hiddenPaths = ["/checkout", "/order-status", "/login", "/admin"];
  if (hiddenPaths.some((p) => location.pathname.includes(p))) return null;

  const isMenu = location.pathname.includes("/menu");
  const isProfile = location.pathname.includes("/profile") || location.pathname.includes("/my-orders");
  const isHome = !isMenu && !isProfile && (location.pathname === homePath || location.pathname === "/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8E3DC] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] font-sans"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-14 px-3">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => navigate(homePath)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 min-h-[44px] transition-all duration-150 cursor-pointer active:scale-95",
            isHome
              ? "text-[#9E6B38] font-bold"
              : "text-[#7A746B] hover:text-[#9E6B38] font-medium"
          )}
        >
          <div className={cn("p-1 rounded-full transition-colors", isHome && "text-[#9E6B38]")}>
            <Home className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Menu */}
        <button
          type="button"
          onClick={() => navigate(menuPath)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 min-h-[44px] transition-all duration-150 cursor-pointer active:scale-95",
            isMenu
              ? "text-[#9E6B38] font-bold"
              : "text-[#7A746B] hover:text-[#9E6B38] font-medium"
          )}
        >
          <div className={cn("p-1 rounded-full transition-colors", isMenu && "text-[#9E6B38]")}>
            <UtensilsCrossed className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] tracking-tight">Menu</span>
        </button>

        {/* Tab 3: Profile (Replaces Orders) */}
        <button
          type="button"
          onClick={() => navigate(profilePath)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 min-h-[44px] transition-all duration-150 cursor-pointer active:scale-95",
            isProfile
              ? "text-[#9E6B38] font-bold"
              : "text-[#7A746B] hover:text-[#9E6B38] font-medium"
          )}
        >
          <div className={cn("p-1 rounded-full transition-colors", isProfile && "text-[#9E6B38]")}>
            <UserCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[11px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
