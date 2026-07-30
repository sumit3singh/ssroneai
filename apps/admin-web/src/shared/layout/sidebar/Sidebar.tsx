import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarFooter } from "./SidebarFooter";
import { navigationEngine } from "@ssr-one-ai/navigation";
import { SidebarItem } from "./SidebarItem";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleCompanyModal?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onToggleCompanyModal,
  onLogout,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/pos";
  const [searchQuery, setSearchQuery] = useState("");

  // Determine active module from current path (e.g. /pos -> "pos", /platform -> "platform")
  const activeModuleId = currentPath.startsWith("/platform")
    ? "platform"
    : currentPath.startsWith("/restaurant")
      ? "restaurant"
      : currentPath.startsWith("/inventory")
        ? "inventory"
        : currentPath.startsWith("/finance")
          ? "finance"
          : currentPath.startsWith("/crm")
            ? "crm"
            : currentPath.startsWith("/hotel")
              ? "hotel"
              : "pos";

  const activeModuleConfig = navigationEngine.getModuleConfig(activeModuleId) || navigationEngine.getModuleConfig("pos");
  const searchResults = searchQuery.trim() ? navigationEngine.searchNavigation(searchQuery) : [];

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col justify-between h-screen transition-all duration-300 select-none z-30 ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Top Header with Module Switcher & Back to All Apps button */}
      <div>
        <SidebarHeader
          isCollapsed={isCollapsed}
          tenantName="BAITHAK OS"
          branchName="Main Branch"
          activeModuleId={activeModuleId}
          onToggleCompanyModal={onToggleCompanyModal}
        />

        {/* Global Search */}
        <SidebarSearch
          query={searchQuery}
          onChange={setSearchQuery}
          isCollapsed={isCollapsed}
        />

        {/* Navigation Workspace Area */}
        <div className="p-2 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {searchQuery.trim() ? (
            /* Search Mode Results */
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1 block">
                Search Results ({searchResults.length})
              </span>
              {searchResults.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs font-semibold text-muted-foreground">
                  No matching items
                </div>
              ) : (
                searchResults.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isActive={currentPath === item.path}
                    isCollapsed={isCollapsed}
                  />
                ))
              )}
            </div>
          ) : (
            /* Normal Metadata-Driven Navigation Groups (Dashboard -> Master -> Transaction -> Report -> Settings) */
            activeModuleConfig?.groups.map((group) => (
              <SidebarGroup
                key={group.id}
                group={group}
                currentPath={currentPath}
                isCollapsed={isCollapsed}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <SidebarFooter
        isCollapsed={isCollapsed}
        userName="Sumit Singh"
        userRole="Administrator"
        onToggleCollapse={onToggleCollapse}
        onLogout={onLogout}
      />
    </aside>
  );
};
