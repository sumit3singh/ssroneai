import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { NavGroup } from "@ssr-one-ai/navigation";
import { SidebarItem } from "./SidebarItem";

interface SidebarGroupProps {
    group: NavGroup;
    currentPath: string;
    isCollapsed: boolean;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ group, currentPath, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (isCollapsed) {
        return (
            <div className="space-y-1 py-1">
                {group.items.map((item) => (
                    <SidebarItem
                        key={item.id}
                        item={item}
                        isActive={currentPath === item.path}
                        isCollapsed={isCollapsed}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-1 py-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 py-1 hover:text-foreground"
            >
                <span>{group.title}</span>
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {isOpen && (
                <div className="space-y-1 pl-1">
                    {group.items.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isActive={currentPath === item.path}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
