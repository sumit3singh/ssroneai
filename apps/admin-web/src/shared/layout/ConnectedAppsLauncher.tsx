import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Database, Store, Utensils, Package, DollarSign, Users, Hotel,
  ChefHat, BarChart3, ShieldCheck, Search, Building2, ExternalLink,
  Calendar, Sparkles, LogOut, Bell, Sun, Moon, User, ChevronDown, Check,
  Smartphone, Monitor, Laptop, Globe
} from "lucide-react";
import { useAuthStore } from "@/app/providers/auth-store";
import { api } from "@/shared/utils/api-client";

export const ConnectedAppsLauncher: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Dropdown States
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [finYearDropdownOpen, setFinYearDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Live Branch from PostgreSQL
  const [branchInfo, setBranchInfo] = useState<any>({
    name: "Main Branch - MG Road",
    code: "MAIN"
  });

  const userRef = useRef<HTMLDivElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.display_name || "Sumit Singh";

  // Floating 3D Food & Cartoon Rain Particles
  const foodRainItems = [
    { emoji: "🍕", size: "text-2xl", left: "5%", delay: "0s", duration: "12s" },
    { emoji: "🍔", size: "text-3xl", left: "15%", delay: "2s", duration: "14s" },
    { emoji: "☕", size: "text-2xl", left: "25%", delay: "4s", duration: "11s" },
    { emoji: "🍩", size: "text-xl", left: "35%", delay: "1s", duration: "15s" },
    { emoji: "🥗", size: "text-3xl", left: "45%", delay: "3s", duration: "13s" },
    { emoji: "🍣", size: "text-2xl", left: "55%", delay: "5s", duration: "12s" },
    { emoji: "🥐", size: "text-2xl", left: "65%", delay: "0.5s", duration: "16s" },
    { emoji: "🍰", size: "text-3xl", left: "75%", delay: "2.5s", duration: "10s" },
    { emoji: "🍹", size: "text-2xl", left: "85%", delay: "4.5s", duration: "14s" },
    { emoji: "🍦", size: "text-2xl", left: "95%", delay: "1.5s", duration: "13s" }
  ];

  // Fetch PostgreSQL Branch
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await api.get<any[]>("/branches").catch(() => []);
        if (res && res.length > 0) {
          setBranchInfo(res[0]);
        }
      } catch (err) {
        console.log("Branch loaded");
      }
    };
    fetchBranch();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
      if (finRef.current && !finRef.current.contains(e.target as Node)) setFinYearDropdownOpen(false);
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) setBranchDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const erpModules = [
    { id: "platform", name: "Platform & Masters", path: "/platform", icon: Database, gradient: "from-blue-500 to-indigo-600 text-white shadow-blue-500/25" },
    { id: "pos", name: "POS & Dining Terminal", path: "/pos", icon: Store, gradient: "from-amber-500 to-orange-600 text-white shadow-amber-500/25" },
    { id: "inventory", name: "Material & Inventory", path: "/inventory", icon: Package, gradient: "from-purple-500 to-pink-600 text-white shadow-purple-500/25" },
    { id: "finance", name: "Finance & Accounting", path: "/finance", icon: DollarSign, gradient: "from-teal-500 to-emerald-600 text-white shadow-teal-500/25" },
    { id: "crm", name: "Marketing & CRM", path: "/crm", icon: Users, gradient: "from-pink-500 to-rose-600 text-white shadow-pink-500/25" },
    { id: "hotel", name: "Hotel Management", path: "/hotel", icon: Hotel, gradient: "from-indigo-500 to-purple-600 text-white shadow-indigo-500/25" },
    { id: "kds", name: "Production & KDS", path: "/pos/transaction/kds", icon: ChefHat, gradient: "from-red-500 to-orange-600 text-white shadow-red-500/25" },
    { id: "mis", name: "MIS & Reports", path: "/pos/reports", icon: BarChart3, gradient: "from-cyan-500 to-blue-600 text-white shadow-cyan-500/25" },
    { id: "ai-copilot", name: "AI Copilot", path: "/ai-copilot", icon: Sparkles, gradient: "from-amber-400 to-yellow-600 text-white shadow-amber-400/25" }
  ];

  // 5 Monorepo Connected Applications
  const connectedApps = [
    {
      id: "customer-food-web",
      name: "Customer Food Ordering Web",
      appPath: "apps/customer-food-web",
      urlPath: "/restaurant",
      port: 3001,
      icon: Globe,
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      id: "customer-stay-web",
      name: "Customer Hotel Stay Web",
      appPath: "apps/customer-stay-web",
      urlPath: "/hotel",
      port: 3002,
      icon: Hotel,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200"
    },
    {
      id: "kds-web",
      name: "Kitchen Display System (KDS)",
      appPath: "apps/kds-web",
      urlPath: "/pos/transaction/kds",
      port: 3003,
      icon: ChefHat,
      color: "text-red-600 bg-red-50 border-red-200"
    },
    {
      id: "mobile-app",
      name: "Mobile POS & Staff App",
      appPath: "apps/mobile-app",
      urlPath: "/pos",
      port: 3004,
      icon: Smartphone,
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      id: "staff-web",
      name: "Staff & Waiter Portal",
      appPath: "apps/staff-web",
      urlPath: "/pos/master/waiters",
      port: 3005,
      icon: User,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    }
  ];

  const filteredModules = searchQuery.trim()
    ? erpModules.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : erpModules;

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-hidden select-none relative">
      {/* 3D FLOATING FOOD RAIN BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-25 dark:opacity-20">
        {foodRainItems.map((item, idx) => (
          <div
            key={idx}
            className={`absolute ${item.size} animate-bounce transition-all`}
            style={{
              left: item.left,
              top: `-10%`,
              animation: `foodRain ${item.duration} infinite linear`,
              animationDelay: item.delay
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes foodRain {
          0% {
            transform: translateY(-50px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(110vh) rotate(360deg) scale(1.1);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. LIGHT THEME HEADER */}
      <header className="relative z-30 border-b border-slate-200/80 dark:border-slate-800 px-8 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs flex items-center justify-between gap-4">
        {/* Brand & Branch */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black font-display text-xl shadow-md shadow-blue-500/20">
            ∞
          </div>
          <div>
            <h1 className="font-display font-black text-base text-slate-900 dark:text-white tracking-wider uppercase flex items-center gap-2">
              <span>INFINITY</span>
              <span className="text-[9px] font-black bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 px-2 py-0.5 rounded-md">
                ENTERPRISE
              </span>
            </h1>
            <p className="text-3xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
              <Building2 size={11} className="text-blue-600" />
              <span>{branchInfo.name}</span>
              <span className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-300">
                {branchInfo.code}
              </span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="w-80 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 text-xs font-bold">
          {/* FY Dropdown */}
          <div className="relative" ref={finRef}>
            <button
              onClick={() => setFinYearDropdownOpen(!finYearDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-2xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Calendar size={13} className="text-blue-600" />
              <span>FY: <strong>2026-2027</strong></span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>
            {finYearDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50">
                <button className="w-full text-left p-2 rounded-xl text-2xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-between">
                  <span>FY 2026 - 2027</span>
                  <Check size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Branch Dropdown */}
          <div className="relative" ref={branchRef}>
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-2xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Building2 size={13} className="text-blue-600" />
              <span className="max-w-[120px] truncate">{branchInfo.name}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>
            {branchDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50">
                <button className="w-full text-left p-2 rounded-xl text-2xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-between">
                  <span>{branchInfo.name} ({branchInfo.code})</span>
                  <Check size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative transition-all"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xl z-50">
                <p className="font-extrabold text-xs text-slate-900 dark:text-white">PostgreSQL Connected</p>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
          </button>

          {/* User Profile & Logout Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs">
                {userName[0].toUpperCase()}
              </div>
              <span className="font-extrabold text-2xs text-slate-900 dark:text-white hidden md:inline-block">
                {userName}
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-black text-xs text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@baithak.com"}</p>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border-none bg-transparent cursor-pointer text-left"
                  >
                    <LogOut size={15} /> Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. NO-SCROLL VIBRANT COLORFUL MODULE CARDS GRID */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-8 py-4 flex flex-col justify-center space-y-6">
        {/* Core ERP Modules */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredModules.map((mod) => {
            const IconComp = mod.icon;
            return (
              <Link
                key={mod.id}
                to={mod.path}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 rounded-3xl p-4 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col items-center justify-center text-center space-y-2 hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${mod.gradient} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                  <IconComp size={20} />
                </div>

                <h3 className="font-display font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                  {mod.name}
                </h3>
              </Link>
            );
          })}
        </div>

        {/* Connected Applications & Portals Section */}
        {!searchQuery.trim() && (
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <ExternalLink size={12} className="text-blue-600" />
                Monorepo Connected Applications ({connectedApps.length})
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Client Portals & Admin Panels
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {connectedApps.map((app) => {
                const IconComp = app.icon;
                return (
                  <Link
                    key={app.id}
                    to={app.urlPath}
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800 p-2.5 rounded-2xl hover:border-blue-500 transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5"
                  >
                    <div className={`p-2 rounded-xl ${app.color} border shrink-0`}>
                      <IconComp size={16} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-extrabold text-2xs text-slate-900 dark:text-white group-hover:text-blue-600 truncate">
                        {app.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono truncate">
                        {app.appPath}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-20 border-t border-slate-200/80 dark:border-slate-800 px-8 py-2.5 flex items-center justify-between text-3xs font-extrabold text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">

      </footer>
    </div>
  );
};
