import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@ssr-one-ai/utils";

interface SidebarFooterProps {
    isCollapsed: boolean;
    userName: string;
    userRole: string;
    onToggleCollapse: () => void;
    onLogout?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
    isCollapsed,
    userName,
    userRole,
    onToggleCollapse,
    onLogout,
}) => {
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
            return;
        }
    };

    return (
        <div className="p-3 border-t border-border">
            <button
                type="button"
                onClick={handleLogout}
                className={cn(
                    "flex items-center justify-between w-full rounded-2xl px-3 py-2 text-xs font-black transition-all",
                    isCollapsed ? "bg-muted/40 text-muted-foreground" : "bg-primary/10 text-primary",
                )}
            >
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {userName.charAt(0)}
                            </span>
                            <div className="text-left">
                                <p className="text-[11px] font-black text-foreground truncate">{userName}</p>
                                <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">{userRole}</p>
                            </div>
                        </div>
                        <ChevronLeft size={14} />
                    </>
                ) : (
                    <ChevronRight size={18} />
                )}
            </button>
        </div>
    );
};
