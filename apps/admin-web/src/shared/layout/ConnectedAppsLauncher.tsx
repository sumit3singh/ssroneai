import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Store, Package, DollarSign, Users, Hotel,
  ChefHat, Sparkles, Search, ExternalLink,
  Globe, FormInput, Settings, Home, UserCheck, Smartphone,
  Layers, Zap
} from "lucide-react";
import { PageHeader, PageContainer } from "@ssrone/ui";

export const ConnectedAppsLauncher: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const erpModules = [
    { id: "pos", name: "POS & Restaurant", path: "/pos", icon: Store },
    { id: "hotel", name: "Hotel PMS & Rooms", path: "/hotel", icon: Hotel },
    { id: "pg-management", name: "PG & Hostels", path: "/pg-management", icon: Home },
    { id: "crm", name: "Guest CRM & Loyalty", path: "/crm", icon: Users },
    { id: "hrms", name: "HR & Payroll", path: "/hr", icon: UserCheck },
    { id: "inventory", name: "Material & Inventory", path: "/inventory", icon: Package },
    { id: "finance", name: "Finance & Accounting", path: "/finance", icon: DollarSign },
    { id: "forms", name: "Dynamic Forms", path: "/forms/builder", icon: FormInput },
    { id: "ai-copilot", name: "AI Copilot", path: "/ai-copilot", icon: Sparkles },
    { id: "settings", name: "System Settings", path: "/settings", icon: Settings },
  ];

  // 4 Monorepo Connected Applications & Portals
  const connectedApps = [
    {
      id: "customer-food-web",
      name: "Customer Food Ordering",
      appPath: "apps/customer-food-web",
      urlPath: "/restaurant",
      port: 3000,
      icon: Globe,
    },
    {
      id: "customer-stay-web",
      name: "Customer Hotel Stay",
      appPath: "apps/customer-stay-web",
      urlPath: "/hotel",
      port: 3001,
      icon: Hotel,
    },
    {
      id: "kds-web",
      name: "Kitchen Display System",
      appPath: "apps/kds-web",
      urlPath: "/pos/transaction/kds",
      port: 8083,
      icon: ChefHat,
    },
    {
      id: "staff-web",
      name: "Staff & Waiter Portal",
      appPath: "apps/staff-web",
      urlPath: "/pos/master/waiters",
      port: 8084,
      icon: Smartphone,
    }
  ];

  const filteredModules = searchQuery.trim()
    ? erpModules.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : erpModules;

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Business Workspace Modules"
        description="Metadata-driven ERP suite powered by PostgreSQL Row-Level Security"
        icon={<Layers size={18} />}
        badge="Platform Home"
        actions={
          <div className="relative w-56 shrink-0">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        }
      />

      {/* ERP Module Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {filteredModules.map((mod) => {
          const IconComp = mod.icon;

          return (
            <Link
              key={mod.id}
              to={mod.path}
              className="group bg-card border border-border hover:border-primary/40 rounded-md p-4 transition-all duration-150 shadow-2xs flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer"
            >
              {/* Icon Container */}
              <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <IconComp size={18} />
              </div>

              <div>
                <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                  {mod.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Monorepo Connected Applications Bar */}
      {!searchQuery.trim() && (
        <div className="bg-card border border-border rounded-md p-3.5 space-y-2.5 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
              <Zap size={14} className="text-amber-500" />
              <span>Monorepo Connected Applications ({connectedApps.length})</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">
              Live App Ports & Client Portals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {connectedApps.map((app) => {
              const IconComp = app.icon;
              return (
                <Link
                  key={app.id}
                  to={app.urlPath}
                  className="group bg-background border border-border hover:border-primary/40 p-2.5 rounded-md transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="p-1.5 rounded bg-muted border border-border text-foreground shrink-0 group-hover:border-primary/40 transition-colors">
                    <IconComp size={15} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {app.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      {app.appPath} (Port {app.port})
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
};
