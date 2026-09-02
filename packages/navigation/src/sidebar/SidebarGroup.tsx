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

    const [isOpen, setIsOpen] = useState(() => isDashboardGroup || hasActiveChild);

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
        <div className="space-y-0.5 py-1 border-b border-border/40 last:border-b-0 pb-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded transition-colors cursor-pointer select-none ${
                    hasActiveChild
                        ? "text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                <span className="truncate">{group.title}</span>
                <div className="transition-transform duration-150">
                    {isOpen ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                </div>
            </button>

            {isOpen && (
                <div className="space-y-0.5 pl-0.5 pt-0.5">
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
