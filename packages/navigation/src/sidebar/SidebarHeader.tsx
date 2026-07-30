import React from "react";
import { Building2, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@ssr-one-ai/utils";

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
    return (
        <div className={cn("p-3 border-b border-border", isCollapsed && "text-center")}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                        <LayoutDashboard size={18} />
                    </div>
                    {!isCollapsed && (
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-foreground">{tenantName}</p>
                            <button
                                type="button"
                                onClick={onToggleCompanyModal}
                                className="inline-flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                                <Building2 size={12} />
                                <span>{branchName}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {!isCollapsed && (
                <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    Active workspace: <span className="font-black text-foreground">{activeModuleId.toUpperCase()}</span>
                </p>
            )}
        </div>
    );
};
