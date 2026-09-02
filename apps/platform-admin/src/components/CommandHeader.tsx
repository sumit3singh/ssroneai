import React from 'react';
import { 
  ShieldCheck, 
  Sparkles,
  Sun,
  Moon,
  IndianRupee,
  LogOut,
  User
} from 'lucide-react';

interface CommandHeaderProps {
  totalMRR: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLicenseWizard: () => void;
  onLogout?: () => void;
  user?: { userId: string; name: string } | null;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ 
  totalMRR, 
  theme,
  onToggleTheme,
  onOpenLicenseWizard,
  onLogout,
  user
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="h-15 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs">
          <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="font-mono tracking-wider">SSR IT INDUSTRY</span>
            <span className="text-slate-300 dark:text-slate-700 font-light">|</span> 
            <span className="text-sky-600 dark:text-sky-400 font-mono font-bold">PLATFORM GOVERNANCE CONSOLE</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 shadow-2xs">
            v2026.8 ENTERPRISE
          </span>
        </div>
      </div>

      {/* Operational Metrics & Controls */}
      <div className="flex items-center gap-3 text-xs font-mono">
        
        {/* Live Operational Status */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
          <span>RLS SYSTEM: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Active & Healthy</strong></span>
        </div>

        {/* Annual ARR */}
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md text-xs">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>ARR: <strong className="text-slate-900 dark:text-white font-extrabold font-mono text-sm">₹{(totalMRR * 12).toLocaleString('en-IN')}</strong></span>
        </div>

        {/* Active Superadmin Badge */}
        <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/60 px-3 py-1.5 rounded-md text-xs font-extrabold">
          <User className="w-3.5 h-3.5 text-sky-600" />
          <span>{user?.userId || 'ssrit'}</span>
        </div>

        {/* Issue License Button */}
        <button
          onClick={onOpenLicenseWizard}
          className="px-3.5 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Issue License</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Log out from Platform Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
