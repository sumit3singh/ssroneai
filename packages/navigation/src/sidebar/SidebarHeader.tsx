import React from "react";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@ssrone/utils";

interface SidebarHeaderProps {
    isCollapsed: boolean;
    tenantName: string;
    branchName: string;
    activeModuleId: string;
    onToggleCompanyModal?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    isCollapsed,
    tenantName,
    branchName,
    activeModuleId,
    onToggleCompanyModal,
}) => {
    const handleLauncherClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.history.pushState({}, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return (
        <div className={cn("p-3 border-b border-border", isCollapsed && "text-center")}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <a
                        href="/"
                        onClick={handleLauncherClick}
                        title="Back to Platform Home Dashboard"
                        className="p-1 rounded-lg text-foreground/80 hover:text-primary transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                    >
                        <LayoutDashboard size={18} className="hover:scale-110 transition-transform" />
                    </a>
                    {!isCollapsed && (
                        <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-foreground">{tenantName}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                {activeModuleId.toUpperCase()} WORKSPACE
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
