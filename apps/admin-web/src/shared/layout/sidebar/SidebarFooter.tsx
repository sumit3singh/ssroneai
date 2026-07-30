import React from "react";
import { User, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuthStore } from "@/app/providers/auth-store";

interface SidebarFooterProps {
  isCollapsed: boolean;
  userName?: string;
  userRole?: string;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed,
  userName = "Sumit Singh",
  userRole = "Administrator",
  onToggleCollapse
}) => {
  const { user, logout } = useAuthStore();

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.display_name || userName;

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of BAITHAK OS?")) {
      logout();
    }
  };

  return (
    <div className="p-3 border-t border-border/80 bg-card/40 flex items-center justify-between">
      {!isCollapsed ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 max-w-[65%]">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {displayName[0].toUpperCase()}
            </div>
            <div className="truncate">
              <span className="font-extrabold text-2xs text-foreground block truncate">
                {displayName}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase block truncate">
                {userRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              title="Logout Session"
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border-none bg-transparent cursor-pointer"
            >
              <LogOut size={14} />
            </button>

            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 mx-auto">
          <button
            onClick={handleLogout}
            title="Logout Session"
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border-none bg-transparent cursor-pointer"
          >
            <LogOut size={14} />
          </button>
          <button
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
