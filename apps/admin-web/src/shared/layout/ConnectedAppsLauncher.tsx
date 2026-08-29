import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Store, Package, DollarSign, Users, Hotel,
  ChefHat, Sparkles, Search, ExternalLink,
  Globe, FormInput, Settings, Home, UserCheck, Smartphone,
  Layers, Zap
} from "lucide-react";

export const ConnectedAppsLauncher: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const erpModules = [
    { id: "pos", name: "POS & Restaurant", path: "/pos", icon: Store, gradient: "from-amber-500 via-orange-500 to-red-600 text-white shadow-amber-500/30" },
    { id: "hotel", name: "Hotel PMS & Rooms", path: "/hotel", icon: Hotel, gradient: "from-indigo-500 via-purple-500 to-indigo-700 text-white shadow-indigo-500/30" },
    { id: "pg-management", name: "PG & Hostels", path: "/pg-management", icon: Home, gradient: "from-violet-500 via-purple-600 to-indigo-800 text-white shadow-violet-500/30" },
    { id: "crm", name: "Guest CRM & Loyalty", path: "/crm", icon: Users, gradient: "from-pink-500 via-rose-500 to-purple-600 text-white shadow-pink-500/30" },
    { id: "hrms", name: "HR & Payroll", path: "/hr", icon: UserCheck, gradient: "from-blue-500 via-cyan-500 to-blue-700 text-white shadow-blue-500/30" },
    { id: "inventory", name: "Material & Inventory", path: "/inventory", icon: Package, gradient: "from-fuchsia-500 via-purple-600 to-pink-600 text-white shadow-fuchsia-500/30" },
    { id: "finance", name: "Finance & Accounting", path: "/finance", icon: DollarSign, gradient: "from-emerald-500 via-teal-500 to-emerald-700 text-white shadow-emerald-500/30" },
    { id: "forms", name: "Dynamic Forms", path: "/forms/builder", icon: FormInput, gradient: "from-amber-400 via-yellow-500 to-orange-500 text-white shadow-amber-400/30" },
    { id: "ai-copilot", name: "AI Copilot", path: "/ai-copilot", icon: Sparkles, gradient: "from-violet-600 via-indigo-600 to-purple-700 text-white shadow-violet-600/30" },
    { id: "settings", name: "System Settings", path: "/settings", icon: Settings, gradient: "from-slate-700 via-slate-800 to-slate-900 text-white shadow-slate-700/30" },
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
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
    },
    {
      id: "customer-stay-web",
      name: "Customer Hotel Stay",
      appPath: "apps/customer-stay-web",
      urlPath: "/hotel",
      port: 3001,
      icon: Hotel,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30"
    },
    {
      id: "kds-web",
      name: "Kitchen Display System",
      appPath: "apps/kds-web",
      urlPath: "/pos/transaction/kds",
      port: 8083,
      icon: ChefHat,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
    },
    {
      id: "staff-web",
      name: "Staff & Waiter Portal",
      appPath: "apps/staff-web",
      urlPath: "/pos/master/waiters",
      port: 8084,
      icon: Smartphone,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
    }
  ];

  const filteredModules = searchQuery.trim()
    ? erpModules.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : erpModules;

  return (
    <div className="relative h-full max-h-full w-full flex flex-col justify-between select-none overflow-hidden font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 transition-colors duration-300">
      
      {/* 3D CREATIVE BACKGROUND LAYER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Generated 3D Artwork Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen scale-105 filter blur-[0.5px] transition-opacity duration-300"
          style={{ backgroundImage: "url('/dashboard_3d_bg.png')" }}
        />

        {/* Dynamic Light/Dark 3D Ambient Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-[450px] h-[450px] bg-purple-400/20 dark:bg-purple-600/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/20 rounded-full blur-3xl" />

        {/* Light & Dark Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b10_1px,transparent_1px),linear-gradient(to_bottom,#64748b10_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
      </div>

      {/* FOREGROUND CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col justify-between h-full space-y-4">
        
        {/* 1. Section Header & Quick Search Bar */}
        <div className="flex items-center justify-between gap-4 shrink-0 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                Business Workspace Modules
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Metadata-driven ERP suite powered by PostgreSQL Row-Level Security
              </p>
            </div>
          </div>

          <div className="w-48 sm:w-64 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-700/80 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* 2. ERP Module Cards Grid (Compact 5-column layout) */}
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {filteredModules.map((mod) => {
              const IconComp = mod.icon;

              return (
                <Link
                  key={mod.id}
                  to={mod.path}
                  className="group relative bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-3.5 transition-all duration-150 shadow-2xs hover:shadow-xs flex flex-col items-center justify-center text-center space-y-2 cursor-pointer overflow-hidden"
                >
                  {/* Icon Container */}
                  <div className="h-10 w-10 rounded-md bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs transition-transform duration-150 group-hover:scale-105">
                    <IconComp size={18} />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                      {mod.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Monorepo Connected Applications Compact Bar */}
        {!searchQuery.trim() && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-2xs space-y-2 shrink-0 transition-all">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                <Zap size={13} className="text-amber-500 dark:text-amber-400 animate-pulse" />
                <span>Monorepo Connected Applications ({connectedApps.length})</span>
              </h2>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
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
                    className="group backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 p-2.5 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md flex items-center gap-2.5 hover:-translate-y-0.5"
                  >
                    <div className={`p-1.5 rounded-lg ${app.color} shrink-0 border shadow-xs group-hover:scale-105 transition-transform`}>
                      <IconComp size={15} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {app.name}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate">
                        {app.appPath} (Port {app.port})
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
