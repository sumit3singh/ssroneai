import React from "react";
import { Link } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { NavItem } from "../navigation/navigation.types";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, isCollapsed }) => {
  // Dynamically resolve lucide icon
  const IconComponent = item.iconName
    ? (LucideIcons as any)[item.iconName] || LucideIcons.Circle
    : LucideIcons.Circle;

  return (
    <Link
      to={item.path}
      className={`flex items-center justify-between p-2 rounded-xl text-xs font-extrabold transition-all group ${
        isActive
          ? "bg-primary text-white shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        <IconComponent size={15} className={isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"} />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </div>

      {!isCollapsed && item.badge && (
        <span
          className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md ${
            isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};
