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
            className={`relative flex items-center ${isCollapsed ? "justify-center px-1.5 py-1.5" : "justify-between px-2.5 py-1.5"} rounded-md text-xs font-medium transition-colors group ${
                isActive
                    ? "bg-primary/10 text-primary font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-primary before:rounded-r"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
        >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2 min-w-0"}`}>
                <IconComponent
                    size={14}
                    className={`shrink-0 transition-colors ${
                        isActive
                            ? "text-primary"
                            : "text-muted-foreground/70 group-hover:text-foreground"
                    }`}
                />
                {!isCollapsed && <span className="truncate tracking-normal text-xs">{item.label}</span>}
            </div>

            {!isCollapsed && item.badge && (
                <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                        isActive
                            ? "bg-primary/15 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border"
                    }`}
                >
                    {item.badge}
                </span>
            )}
        </a>
    );
};
