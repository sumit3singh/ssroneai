import React from "react";
import { Grid, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { SidebarGroup } from "./SidebarGroup";
import { navigationEngine } from "../navigation.engine";

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onToggleCompanyModal?: () => void;
    currentPath: string;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    onToggleCollapse,
    currentPath,
}) => {
    const resolveModuleId = (path: string): string => {
        const segment = path.split("/")[1]?.toLowerCase() || "";
        if (segment === "pg-management") return "pg";
        if (segment === "hrms" || segment === "hr") return "hr";
        if (segment === "ai-copilot") return "ai";
        if (segment === "platform-studio" || segment === "master-studio" || segment === "workflow" || segment === "communication") return "settings";
        if (navigationEngine.getModuleConfig(segment)) return segment;
        return "pos";
    };

    const activeModuleId = resolveModuleId(currentPath);
    const activeModuleConfig = navigationEngine.getModuleConfig(activeModuleId) || navigationEngine.getModuleConfig("pos");

    const handleLauncherClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.history.pushState({}, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return (
        <aside className={`bg-card border-r border-border flex flex-col justify-between h-full transition-all duration-200 select-none z-30 shrink-0 ${isCollapsed ? "w-14" : "w-56"}`}>
            {/* Top Toolbar */}
            <div className="p-2.5 border-b border-border flex items-center justify-between gap-1.5 shrink-0">
                <a
                    href="/"
                    onClick={handleLauncherClick}
                    title="Back to Platform Home"
                    className="group py-1 px-1.5 rounded-md text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer flex items-center gap-2 min-w-0"
                >
                    <div className="p-1 rounded bg-muted text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">
                      <Grid size={14} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground truncate">
                            {activeModuleId} Workspace
                        </span>
                    )}
                </a>

                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-none bg-transparent cursor-pointer shrink-0"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 min-h-0 scrollbar-none">
                {activeModuleConfig?.groups.map((group) => (
                    <SidebarGroup
                        key={group.id}
                        group={group}
                        currentPath={currentPath}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>

            {/* Bottom Version Footer */}
            {!isCollapsed && (
              <div className="px-3 py-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>SSR ONE AI</span>
                <span className="font-medium">v2.0</span>
              </div>
            )}
        </aside>
    );
};
