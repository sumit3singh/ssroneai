import React, { useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { NavItem } from "../types";

interface SidebarItemProps {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, isCollapsed }) => {
    const itemRef = useRef<HTMLAnchorElement>(null);
    const IconComponent = item.iconName ? (LucideIcons as any)[item.iconName] || LucideIcons.Circle : LucideIcons.Circle;

    // Automatically scroll the active selected item into view inside the sidebar
    useEffect(() => {
        if (isActive && itemRef.current) {
            itemRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
        }
    }, [isActive]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        window.history.pushState({}, "", item.path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    };

    return (
        <a
            ref={itemRef}
            href={item.path}
            onClick={handleClick}
            title={item.label}
            className={`relative flex items-center ${isCollapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-1.5"} rounded-md text-xs font-medium transition-all duration-150 group ${
                isActive
                    ? "bg-primary/10 text-primary font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-r"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
        >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 truncate"}`}>
                <IconComponent
                    size={15}
                    className={`shrink-0 transition-colors ${
                        isActive
                            ? "text-primary"
                            : "text-muted-foreground/70 group-hover:text-foreground"
                    }`}
                />
                {!isCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
            </div>

            {!isCollapsed && item.badge && (
                <span
                    className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-sm uppercase tracking-wider ${
                        isActive
                            ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80"
                    }`}
                >
                    {item.badge}
                </span>
            )}
        </a>
    );
};
