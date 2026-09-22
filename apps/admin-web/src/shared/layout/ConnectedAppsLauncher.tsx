import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Store, Package, DollarSign, Users, Hotel,
  Sparkles, Search, FormInput, Settings, Home, UserCheck,
  Layers, Palette
} from "lucide-react";
import { PageHeader, PageContainer } from "@ssrone/ui";
import { AI3DBackground } from "@/shared/components/AI3DBackground";

export const ConnectedAppsLauncher: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const erpModules = [
    {
      id: "pos",
      name: "POS & Restaurant",
      path: "/pos",
      icon: Store,
      iconStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
      cardHover: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",
      textHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    },
    {
      id: "hotel",
      name: "Hotel PMS & Rooms",
      path: "/hotel",
      icon: Hotel,
      iconStyle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600",
      cardHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/5",
      textHover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    },
    {
      id: "pg-management",
      name: "PG & Hostels",
      path: "/pg-management",
      icon: Home,
      iconStyle: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600",
      cardHover: "hover:border-teal-500/40 hover:shadow-teal-500/5",
      textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    },
    {
      id: "crm",
      name: "Guest CRM & Loyalty",
      path: "/crm",
      icon: Users,
      iconStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
      cardHover: "hover:border-rose-500/40 hover:shadow-rose-500/5",
      textHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    },
    {
      id: "hrms",
      name: "HR & Payroll",
      path: "/hr",
      icon: UserCheck,
      iconStyle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600",
      cardHover: "hover:border-sky-500/40 hover:shadow-sky-500/5",
      textHover: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
    },
    {
      id: "inventory",
      name: "Material & Inventory",
      path: "/inventory",
      icon: Package,
      iconStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
      cardHover: "hover:border-amber-500/40 hover:shadow-amber-500/5",
      textHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    },
    {
      id: "finance",
      name: "Finance & Accounting",
      path: "/finance",
      icon: DollarSign,
      iconStyle: "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600",
      cardHover: "hover:border-green-600/40 hover:shadow-green-600/5",
      textHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
    },
    {
      id: "customization",
      name: "Website & App Customization",
      path: "/customization",
      icon: Palette,
      iconStyle: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20 group-hover:bg-fuchsia-600 group-hover:text-white group-hover:border-fuchsia-600",
      cardHover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5",
      textHover: "group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400",
    },
    {
      id: "forms",
      name: "Dynamic Forms",
      path: "/forms/builder",
      icon: FormInput,
      iconStyle: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600",
      cardHover: "hover:border-violet-500/40 hover:shadow-violet-500/5",
      textHover: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    },
    {
      id: "ai-copilot",
      name: "AI Copilot",
      path: "/ai-copilot",
      icon: Sparkles,
      iconStyle: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
      cardHover: "hover:border-purple-500/40 hover:shadow-purple-500/10",
      textHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    },
    {
      id: "settings",
      name: "System Settings",
      path: "/settings",
      icon: Settings,
      iconStyle: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 group-hover:bg-slate-700 group-hover:text-white group-hover:border-slate-700",
      cardHover: "hover:border-slate-500/40 hover:shadow-slate-500/5",
      textHover: "group-hover:text-slate-700 dark:group-hover:text-slate-300",
    },
  ];

  const filteredModules = searchQuery.trim()
    ? erpModules.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : erpModules;

  return (
    <div className="relative min-h-full">
      {/* ─── Interactive 3D AI Neural Cyberspace Background ─── */}
      <AI3DBackground />

      <PageContainer className="relative z-10">
        {/* Standardized Enterprise Page Header */}
        <PageHeader
          title="Business Workspace Modules"
          description="Metadata-driven ERP suite powered by PostgreSQL Row-Level Security"
          icon={<Layers size={18} className="text-indigo-600 dark:text-indigo-400" />}
          badge="Platform Home"
          actions={
            <div className="relative w-56 shrink-0">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
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
                className={`group bg-card/90 backdrop-blur-xs border border-border ${mod.cardHover} rounded-md p-4 transition-all duration-150 shadow-2xs flex flex-col items-center justify-center text-center space-y-2.5 cursor-pointer`}
              >
                {/* Colored Icon Container */}
                <div
                  className={`w-9 h-9 rounded border flex items-center justify-center transition-all duration-150 ${mod.iconStyle}`}
                >
                  <IconComp size={18} />
                </div>

                <div>
                  <h3 className={`font-semibold text-xs text-foreground ${mod.textHover} transition-colors leading-tight`}>
                    {mod.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
};
