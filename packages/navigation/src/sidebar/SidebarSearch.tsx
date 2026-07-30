import React from "react";
import { Search } from "lucide-react";

interface SidebarSearchProps {
    query: string;
    onChange: (val: string) => void;
    isCollapsed: boolean;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ query, onChange, isCollapsed }) => {
    if (isCollapsed) return null;

    return (
        <div className="px-3 py-2">
            <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search navigation (Ctrl+K)..."
                    className="w-full bg-muted/40 border border-border rounded-xl pl-8 pr-2 py-1.5 text-2xs font-bold text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
        </div>
    );
};
