import React from 'react';
import { 
  Building2, 
  GitBranch, 
  Key, 
  CreditCard, 
  Activity, 
  Terminal, 
  Lock, 
  Cpu
} from 'lucide-react';

interface SidebarNavProps {
  activeNav: string;
  setActiveNav: (nav: 'overview' | 'tenants' | 'hierarchy' | 'licensing' | 'billing' | 'telemetry' | 'audit') => void;
  tenantCount: number;
  companyCount: number;
  outletCount: number;
  theme?: 'light' | 'dark';
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeNav,
  setActiveNav,
  tenantCount,
  companyCount,
  outletCount,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'overview', label: 'Platform Telemetry', icon: Activity },
    { id: 'tenants', label: 'Multi-Tenant Directory', icon: Building2, count: tenantCount },
    { id: 'hierarchy', label: 'Company & Outlets Tree', icon: GitBranch, count: companyCount },
    { id: 'licensing', label: 'Licensing & Tiers', icon: Key },
    { id: 'billing', label: 'SaaS Billing & ARR', icon: CreditCard },
    { id: 'telemetry', label: 'Cluster Nodes & DB', icon: Cpu },
    { id: 'audit', label: 'Security Audit Log', icon: Terminal },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="flex flex-col gap-4">
        
        {/* Operator Profile */}
        <div className="bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-1 shadow-2xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Superadmin Workspace</span>
            <Lock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white">SSR IT Master Operator</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ID: sys-admin-master-01</p>
        </div>

        {/* Navigation Group */}
        <div className="flex flex-col gap-1">
          <div className="px-2 text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            PLATFORM GOVERNANCE
          </div>
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeNav === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveNav(nav.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-sky-600 text-white shadow-2xs border border-sky-500/30"
                    : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{nav.label}</span>
                </div>
                {nav.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}>
                    {nav.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Quick Status */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-3">
        <div className="bg-slate-50/90 dark:bg-slate-950/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex flex-col gap-1.5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span>Cluster Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs animate-pulse" />
              100% OK
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Outlets:</span>
            <span className="text-slate-900 dark:text-white font-bold">{outletCount} Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
