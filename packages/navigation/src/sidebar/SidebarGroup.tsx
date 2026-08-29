import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavGroup } from "../types";
import { SidebarItem } from "./SidebarItem";

interface SidebarGroupProps {
    group: NavGroup;
    currentPath: string;
    isCollapsed: boolean;
}

export const checkIsItemActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === currentPath) return true;
    // Root module workspace paths (e.g., /pos, /hotel, /pg, /inventory) match strictly exact route or trailing slash.
    // They MUST NOT match deeper subroutes like /pos/master/categories.
    const pathSegments = itemPath.split("/").filter(Boolean);
    if (pathSegments.length === 1) {
        return currentPath === itemPath || currentPath === `${itemPath}/`;
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ group, currentPath, isCollapsed }) => {
    const isDashboardGroup = group.id.includes("dashboard") || group.title === "DASHBOARD";
    const hasActiveChild = group.items.some((item) => checkIsItemActive(item.path, currentPath));

    // Dashboard group or section containing active form starts open; inactive sections start closed.
    const [isOpen, setIsOpen] = useState(() => isDashboardGroup || hasActiveChild);

    // Expand section automatically when user navigates to a form inside it
    useEffect(() => {
        if (hasActiveChild) {
            setIsOpen(true);
        }
    }, [hasActiveChild, currentPath]);

    if (isCollapsed) {
        return (
            <div className="space-y-1 py-1 flex flex-col items-center w-full">
                {group.items.map((item) => (
                    <SidebarItem
                        key={item.id}
                        item={item}
                        isActive={checkIsItemActive(item.path, currentPath)}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-1 py-1 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 pb-1.5">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all cursor-pointer select-none ${
                    hasActiveChild
                        ? "text-slate-900 dark:text-slate-100 font-bold bg-slate-100/70 dark:bg-slate-800/50"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}
            >
                <div className="flex items-center gap-1.5">
                    <span>{group.title}</span>
                    <span className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        hasActiveChild
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                        {group.items.length}
                    </span>
                </div>
                <div className="transition-transform duration-150">
                    {isOpen ? <ChevronDown size={13} className="text-slate-400 dark:text-slate-500" /> : <ChevronRight size={13} className="text-slate-400 dark:text-slate-500" />}
                </div>
            </button>

            {isOpen && (
                <div className="space-y-1 pl-1 pt-0.5 animate-in fade-in duration-100">
                    {group.items.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isActive={checkIsItemActive(item.path, currentPath)}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
