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
        if (segment === "hrms") return "hr";
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
        <aside className={`backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between h-full transition-all duration-300 select-none z-30 shrink-0 shadow-lg ${isCollapsed ? "w-16" : "w-64"}`}>
            {/* Top Toolbar: Back to All Modules Launcher + Collapse Toggle */}
            <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2 shrink-0">
                <a
                    href="/"
                    onClick={handleLauncherClick}
                    title="Back to Platform Home Launcher"
                    className="group p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border-none bg-transparent cursor-pointer flex items-center gap-2 min-w-0"
                >
                    <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Grid size={15} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono truncate">
                            {activeModuleId.toUpperCase()} WORKSPACE
                        </span>
                    )}
                </a>

                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border-none bg-transparent cursor-pointer shrink-0"
                >
                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
            </div>

            {/* Scrollable Navigation Items Container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 scrollbar-thin">
                {activeModuleConfig?.groups.map((group) => (
                    <SidebarGroup
                        key={group.id}
                        group={group}
                        currentPath={currentPath}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>

            {/* Bottom Enterprise Version Indicator */}
            {!isCollapsed && (
              <div className="p-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>SSR ONE AI</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">v2.0</span>
              </div>
            )}
        </aside>
    );
};
