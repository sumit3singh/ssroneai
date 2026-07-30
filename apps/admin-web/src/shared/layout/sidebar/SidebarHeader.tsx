import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Grid, ArrowLeft, Store, Utensils, Package, DollarSign, Users, Hotel, Shield, Check } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  tenantName?: string;
  branchName?: string;
  activeModuleId?: string;
  onToggleCompanyModal?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  tenantName = "BAITHAK OS",
  branchName = "Main Branch",
  activeModuleId = "pos",
  onToggleCompanyModal
}) => {
  const [showModuleMenu, setShowModuleMenu] = useState(false);

  const availableModules = [
    { id: "pos", name: "POS & Dining Terminal", path: "/pos", icon: Store, color: "text-amber-500" },
    { id: "platform", name: "Platform Administration", path: "/platform", icon: Shield, color: "text-emerald-500" },
    { id: "inventory", name: "Inventory & Stock", path: "/inventory", icon: Package, color: "text-purple-500" },
    { id: "finance", name: "Finance & Accounting", path: "/finance", icon: DollarSign, color: "text-emerald-500" },
    { id: "crm", name: "CRM & Guests", path: "/crm", icon: Users, color: "text-pink-500" },
    { id: "hotel", name: "Hotel Management", path: "/hotel", icon: Hotel, color: "text-indigo-500" }
  ];

  const currentModule = availableModules.find((m) => m.id === activeModuleId) || availableModules[0];

  return (
    <div className="relative border-b border-border/80 bg-card/40">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Back to All Connected Apps button */}
          <Link
            to="/"
            title="Back to All Connected Apps Grid"
            className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center font-black font-display text-sm shrink-0 shadow-md shadow-primary/20 hover:scale-105 transition-transform group"
          >
            <Grid size={16} className="group-hover:hidden" />
            <ArrowLeft size={16} className="hidden group-hover:block" />
          </Link>

          {!isCollapsed && (
            <div className="truncate">
              <button
                onClick={() => setShowModuleMenu(!showModuleMenu)}
                className="font-display font-black text-xs text-foreground uppercase tracking-wider truncate flex items-center gap-1.5 border-none bg-transparent p-0 cursor-pointer hover:text-primary transition-colors text-left"
              >
                <span className="truncate">{currentModule.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Module Switcher Dropdown Menu */}
      {showModuleMenu && !isCollapsed && (
        <div className="absolute top-full left-2 right-2 z-50 bg-card border border-border rounded-2xl shadow-modal p-2 space-y-1 backdrop-blur-md">
          <div className="px-2 py-1 flex items-center justify-between border-b border-border/60 pb-1.5 mb-1">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
              Connected ERP Modules
            </span>
            <Link
              to="/"
              onClick={() => setShowModuleMenu(false)}
              className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              <Grid size={10} /> All Apps Grid
            </Link>
          </div>

          <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
            {availableModules.map((mod) => {
              const IconComp = mod.icon;
              const isSelected = mod.id === activeModuleId;

              return (
                <Link
                  key={mod.id}
                  to={mod.path}
                  onClick={() => setShowModuleMenu(false)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary/10 text-primary font-black"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <IconComp size={15} className={mod.color} />
                    <span className="truncate">{mod.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-primary shrink-0" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
