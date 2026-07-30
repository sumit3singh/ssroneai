/**
 * The Baithak – App Shell Layout (10/10 Enterprise Grade)
 * Platform Home (full-width launcher at '/') vs Module Workspaces (Sidebar + Header + Working Area).
 */
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Bell, Search, LogOut, User, Building2, Menu,
  Sun, Moon, ChevronDown, Check, Shield
} from "lucide-react";
import { useAuthStore } from "@/app/providers/auth-store";
import { CommandPalette, Sidebar } from "@ssr-one-ai/navigation";
import { Button } from "@/shared/ui/primitives/Button";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showFinYearModal, setShowFinYearModal] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const { user, logout } = useAuthStore();
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/";

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.display_name || "Sumit Singh";

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // MANDATORY LAW: On Platform Home ('/'), render full-width launcher WITHOUT sidebar!
  if (currentPath === "/") {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        {children}
        <CommandPalette />
      </div>
    );
  }

  // Inside Module Workspaces (/pos, /platform, /restaurant, /inventory, etc.): Render Sidebar + Workspace
  return (
    <div className="flex h-screen bg-background overflow-hidden select-none">
      {/* 10/10 Metadata-Driven Modular Sidebar (Only inside module workspaces) */}
      <Sidebar
        currentPath={currentPath}
        isCollapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((v) => !v)}
        onToggleCompanyModal={() => setShowFinYearModal(true)}
        userName={userName}
        userRole={user?.is_superadmin ? "Super Administrator" : "Platform User"}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top ERP Utility Header Bar */}
        <header className="flex items-center justify-between h-14 px-4 bg-card border-b border-border shadow-xs z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-muted text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs text-foreground uppercase tracking-wider">
                THE BAITHAK OPERATING SYSTEM
              </span>
              <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                v2.0 ENTERPRISE
              </span>
            </div>
          </div>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Command Palette trigger */}
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-2xs text-muted-foreground font-bold hover:bg-muted transition-all"
            >
              <Search size={12} />
              <span>Search (Ctrl+K)</span>
            </button>

            {/* Branch / Financial Year Selector */}
            <button
              onClick={() => setShowFinYearModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border text-foreground text-2xs font-extrabold hover:bg-muted transition-all"
            >
              <Building2 size={13} className="text-primary" />
              <span>Main Branch</span>
              <ChevronDown size={11} className="text-muted-foreground" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border/60 bg-card"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border/60 bg-card relative"
              >
                <Bell size={15} />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl p-3 shadow-modal z-50 space-y-2">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">
                      System Notifications
                    </span>
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      2 Unread
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                      <p className="font-bold text-foreground text-2xs">Shift Opened Successfully</p>
                      <p className="text-[10px]">Counter 1 initialized with ₹5,000 drawer balance.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-muted/40 border border-border/40">
                      <p className="font-bold text-foreground text-2xs">PostgreSQL Database Synced</p>
                      <p className="text-[10px]">All menu items & portion prices up to date.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & LOGOUT Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-border/80 bg-card hover:bg-muted/50 transition-all cursor-pointer"
              >
                <div className="h-6 w-6 rounded-lg bg-primary text-white flex items-center justify-center font-black text-2xs">
                  {userName[0].toUpperCase()}
                </div>
                <span className="font-extrabold text-2xs text-foreground hidden md:inline-block max-w-[90px] truncate">
                  {userName}
                </span>
                <ChevronDown size={11} className="text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl p-2 shadow-modal z-50 space-y-1">
                  <div className="p-2 border-b border-border/60">
                    <p className="font-black text-xs text-foreground truncate">{userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email || "sumit@baithak.com"}</p>
                    <span className="inline-block mt-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                      Super Administrator
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      alert("User Settings");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer text-left"
                  >
                    <User size={14} /> Profile & Account
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      alert("Security Settings");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-muted-foreground hover:bg-muted hover:text-foreground transition-all border-none bg-transparent cursor-pointer text-left"
                  >
                    <Shield size={14} /> Role & Permissions
                  </button>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border-none bg-transparent cursor-pointer text-left"
                    >
                      <LogOut size={14} /> Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Operational Workspace */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {children}
        </main>
      </div>

      {/* Financial Year Modal */}
      {showFinYearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-modal">
            <h3 className="font-display font-extrabold text-base text-foreground">Select Branch & Company</h3>
            <div className="space-y-2 text-xs font-bold">
              <button
                onClick={() => setShowFinYearModal(false)}
                className="w-full p-3 rounded-xl border border-primary bg-primary/10 text-primary flex items-center justify-between text-left"
              >
                <div>
                  <p className="font-black">Main Branch - Connaught Place</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">FY 2026-2027 • Company #1</p>
                </div>
                <Check size={16} />
              </button>
            </div>
            <Button onClick={() => setShowFinYearModal(false)} className="w-full font-bold">
              Confirm Selection
            </Button>
          </div>
        </div>
      )}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
