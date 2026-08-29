import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@ssrone/utils";

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
        <div className="p-3 border-t border-border flex items-center justify-between gap-2">
            {!isCollapsed ? (
                <>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0">
                            {userName.charAt(0)}
                        </div>
                        <div className="text-left overflow-hidden">
                            <p className="text-2xs font-extrabold text-foreground truncate">{userName}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">{userRole}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        title="Collapse Sidebar"
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title="Expand Sidebar"
                    className="w-full p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer flex justify-center"
                >
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
    );
};
