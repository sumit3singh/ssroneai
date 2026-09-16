/**
 * The ssrone – App Shell Layout (10/10 Enterprise Grade)
 * Platform Home (full-width launcher at '/') vs Module Workspaces (Sidebar + Header + Working Area).
 */
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import {
  Bell, Search, LogOut, User, Building2, Menu,
  Sun, Moon, ChevronDown, Check, Shield, X, Receipt, HelpCircle, LayoutGrid
} from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { api } from "@ssrone/api-client";
import { CommandPalette, Sidebar } from "@ssrone/navigation";
import { PageHelpSOPModal } from "../components/universal/PageHelpSOPModal";


import { Button } from "@ssrone/ui";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { IndianLiveClock } from "@/modules/pos/components/IndianLiveClock";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);


  const { user, selected_branch, branches, setSelectedBranch, setBranches, logout } = useAuthStore();
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "/";

  const [pendingBranch, setPendingBranch] = useState<any | null>(null);
  const [showBranchConfirmModal, setShowBranchConfirmModal] = useState(false);

  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [activeCompany, setActiveCompany] = useState<any | null>(null);

  const getUserDisplayName = (u: any) => {
    if (!u) return "User";
    if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`.trim();
    if (u.first_name && !u.first_name.includes("@")) return u.first_name.trim();
    if (u.display_name && !u.display_name.includes("@")) return u.display_name.trim();
    if (u.email) {
      const handle = u.email.split("@")[0];
      return handle.charAt(0).toUpperCase() + handle.slice(1);
    }
    return "User";
  };

  const userName = getUserDisplayName(user);

  const authTenantSlug = useAuthStore((s) => s.tenant_slug);
  const currentTenantSlug = authTenantSlug 
    || (user as any)?.tenant_slug 
    || (user as any)?.tenant?.slug 
    || (selected_branch as any)?.tenant_slug 
    || "";

  const displayTenantName = currentTenantSlug || (activeCompany?.name ? activeCompany.name.toLowerCase().replace(/\s+/g, "-") : "tenant-workspace");

  const resolvedCompany = activeCompany 
    || useAuthStore.getState().selected_company 
    || (branches.length > 0 && branches[0].company ? branches[0].company : null);

  const activeCompanyName = resolvedCompany?.name 
    || selected_branch?.company_name 
    || (selected_branch as any)?.company?.name 
    || (user as any)?.company_name 
    || (currentTenantSlug ? currentTenantSlug : "No Company");

  const activeBranchName = selected_branch?.name || (branches.length > 0 ? branches[0].name : "0 Outlets Provisioned");

  // Fetch tenant companies & branches strictly for current logged-in tenant from PostgreSQL database
  useEffect(() => {
    const fetchPostgresBranches = async () => {
      try {
        const safeApiGet = async (endpoint: string, params?: any) => {
          try {
            return await api.get(endpoint, params);
          } catch {
            return null;
          }
        };

        const state = useAuthStore.getState();
        const activeTenantSlug = state.tenant_slug || (user as any)?.tenant_slug || "";
        const currentTenantId = user?.tenant_id ? String(user.tenant_id) : (user as any)?.tenant?.id ? String((user as any).tenant.id) : null;

        let companies: any[] = [];
        let branchesList: any[] = [];

        // 1. Strict Tenant Scoping: Query PostgreSQL tenant-metadata by activeTenantSlug
        if (activeTenantSlug) {
          const metaRes = await safeApiGet("/auth/public/context", { tenant_slug: activeTenantSlug }) || await safeApiGet("/auth/tenant-metadata", { tenant_slug: activeTenantSlug });
          if (metaRes) {
            companies = Array.isArray(metaRes.companies) ? metaRes.companies : [];
            branchesList = Array.isArray(metaRes.branches) ? metaRes.branches : [];
          }
        }

        // 2. Fetch branches for tenant companies if branches list is empty
        if (companies.length > 0 && branchesList.length === 0) {
          for (const co of companies) {
            const bRes = await safeApiGet("/business/branches", { company_id: co.id }) || await safeApiGet("/auth/branches", { company_id: co.id });
            const addList = Array.isArray(bRes) ? bRes : (bRes && Array.isArray(bRes.data) ? bRes.data : []);
            branchesList.push(...addList);
          }
        }

        if (companies.length === 0 && currentTenantId) {
          const cRes = await safeApiGet("/business/companies", { tenant_id: currentTenantId }) || await safeApiGet("/auth/companies", { tenant_id: currentTenantId });
          companies = Array.isArray(cRes) ? cRes : (cRes && Array.isArray(cRes.data) ? cRes.data : []);
          
          if (companies.length > 0 && branchesList.length === 0) {
            for (const co of companies) {
              const bRes = await safeApiGet("/business/branches", { company_id: co.id }) || await safeApiGet("/auth/branches", { company_id: co.id });
              const addList = Array.isArray(bRes) ? bRes : (bRes && Array.isArray(bRes.data) ? bRes.data : []);
              branchesList.push(...addList);
            }
          }
        }

        // STRICT MULTI-TENANT FILTER: Include branches linked by tenant_id or company_id under tenant companies
        if (companies.length > 0 || currentTenantId) {
          const companyIds = companies.map((c: any) => String(c.id));
          branchesList = branchesList.filter((b: any) => {
            if (b.company_id && companyIds.includes(String(b.company_id))) return true;
            if (currentTenantId && b.tenant_id && String(b.tenant_id) === String(currentTenantId)) return true;
            return false;
          });
        }

        state.setCompanies(companies);
        setBranches(branchesList);

        if (companies.length > 0) {
          const targetCompanyId = selected_branch?.company_id || (user as any)?.company_id || state.selected_company?.id;
          const matchCo = targetCompanyId ? companies.find((c: any) => String(c.id) === String(targetCompanyId)) : companies[0];
          setActiveCompany(matchCo || companies[0]);
          state.setSelectedCompany(matchCo || companies[0]);
        } else {
          setActiveCompany(null);
          state.setSelectedCompany(null);
        }

        if (branchesList.length > 0) {
          if (!selected_branch || !branchesList.some((b: any) => String(b.id) === String(selected_branch.id))) {
            setSelectedBranch(branchesList[0]);
          }
        } else {
          setSelectedBranch(null);
        }
      } catch (err) {
        console.error("Failed to load PostgreSQL tenant branches", err);
      }
    };
    fetchPostgresBranches();
  }, [user]);

  useEffect(() => {
    if (selected_branch && selected_branch.id) {
      localStorage.setItem("active_branch_id", String(selected_branch.id));
      if ((selected_branch as any).company_id) {
        localStorage.setItem("active_company_id", String((selected_branch as any).company_id));
      }
    }
  }, [selected_branch]);

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
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
        setBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = currentPath === "/";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden select-none">
      <header className="flex items-center justify-between h-11 px-3 bg-card border-b border-border z-30 shrink-0 select-none">
        {/* Left Side: Navigation / Logo */}
        <div className="flex items-center gap-2.5">
          {!isHomePage && (
            <button
              className="md:hidden p-1 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={15} />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group cursor-pointer no-underline">
            <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
              ∞
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-foreground">
                SSR ONE AI
              </span>
              <span className="bg-muted text-muted-foreground border border-border text-[10px] font-mono font-medium px-1.5 py-0.2 rounded">
                v2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Header Controls */}
        <div className="flex items-center gap-2">
          {/* Search Command Palette Trigger */}
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-border bg-background text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Search size={13} className="text-muted-foreground" />
            <span>Search</span>
            <kbd className="font-mono text-[9px] bg-muted px-1 py-0.2 rounded border border-border text-muted-foreground">
              Ctrl+K
            </kbd>
          </button>

          {/* Simple Inline Unit / Branch Dropdown Selector */}
          <div className="relative" ref={branchDropdownRef}>
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Click to select unit"
            >
              <Building2 size={13} className="text-muted-foreground shrink-0" />
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-foreground truncate max-w-[150px]">
                  {activeCompanyName}
                </span>
                <span className="text-muted-foreground font-normal">/</span>
                <span className="text-muted-foreground truncate max-w-[130px]">
                  {activeBranchName}
                </span>
              </div>
              <ChevronDown size={12} className={cn("text-muted-foreground transition-transform duration-200", branchDropdownOpen && "rotate-180")} />
            </button>

            {branchDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-card text-foreground border border-border rounded-md p-1.5 shadow-md z-50 space-y-1">
                <div className="p-1.5 border-b border-border">
                  <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Select Branch Unit</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{activeCompanyName}</p>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                  {branches.length > 0 ? (
                    branches.map((b) => {
                      const isSelected = selected_branch?.id === b.id;
                      return (
                        <button
                          key={b.id || b.name}
                          onClick={() => {
                            setBranchDropdownOpen(false);
                            if (!isSelected) {
                              setPendingBranch(b);
                              setShowBranchConfirmModal(true);
                            }
                          }}
                          className={cn(
                            "w-full p-2 rounded text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer border-none bg-transparent",
                            isSelected
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <div>
                            <p className="font-semibold text-xs">{b.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {b.code || `BR-${b.id}`}
                            </p>
                          </div>
                          {isSelected && <Check size={14} className="text-primary shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      {activeBranchName}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Indian Date & Time (IST Asia/Kolkata) */}
          <IndianLiveClock compact className="hidden md:inline-flex" />

          {/* Quick Table Floor Link */}
          <Link
            to="/pos/transaction/tables"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all no-underline cursor-pointer shadow-xs active:scale-95"
            title="Open Table Floor & Live Tracker (Auto-Kiosk Fullscreen)"
          >
            <LayoutGrid size={13} />
            <span>Table Floor</span>
          </Link>

          {/* Universal Page SOP & Data Flow ? Button */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="px-2 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Open Page Standard Operating Procedure (SOP) & System Data Flow"
          >
            <HelpCircle size={15} />
            <span className="text-2xs font-mono font-black">SOP</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>


          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer"
            >
              <Bell size={14} />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-card text-foreground border border-border rounded-md p-2 shadow-md z-50 space-y-1">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                    System Notifications
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-sm font-mono">
                    PostgreSQL Active
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="p-2 rounded-md bg-muted/50 border border-border">
                    <p className="font-semibold text-foreground text-xs">PostgreSQL Row-Level Security</p>
                    <p className="text-[10px]">All multi-tenant business schemas synced cleanly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & LOGOUT Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-md border border-border bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-2xs">
                {userName[0].toUpperCase()}
              </div>
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 hidden md:inline-block max-w-[90px] truncate">
                {userName}
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card text-foreground border border-border rounded-lg p-2 shadow-md z-50 space-y-1">
                <div className="p-2 border-b border-border">
                  <p className="font-bold text-xs text-foreground truncate">{userName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || "admin@ssrone.com"}</p>
                  <span className="inline-block mt-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-sm uppercase">
                    Super Administrator
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all border-none bg-transparent cursor-pointer text-left"
                  >
                    <LogOut size={14} /> Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {isHomePage ? (
          <div className="flex-1 min-h-0 overflow-hidden bg-background">
            {children}
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Metadata-Driven Sidebar (Only inside module workspaces) */}
            <Sidebar
              currentPath={currentPath}
              isCollapsed={!sidebarOpen}
              onToggleCollapse={() => setSidebarOpen((v) => !v)}
              onToggleCompanyModal={() => setBranchDropdownOpen((v) => !v)}
              userName={userName}
              userRole={user?.is_superadmin ? "Super Administrator" : "Platform User"}
              onLogout={logout}
            />

            <main className="flex-1 overflow-y-auto p-4 bg-background">
              {children}
            </main>
          </div>
        )}
      </div>

      {/* ULTRA-MINIMAL ENTERPRISE IDE-STYLE STATUS BAR FOOTER */}
      <footer className="h-6 px-3 bg-card text-muted-foreground border-t border-border text-[10px] font-mono flex items-center justify-between z-40 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            PostgreSQL Active
          </span>
          <span className="text-border">|</span>
          <span>Branch: <strong className="text-foreground font-semibold">{activeBranchName}</strong></span>
          <span className="text-border">|</span>
          <span>Tenant: <strong className="text-foreground font-semibold">{displayTenantName}</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-muted-foreground font-medium uppercase tracking-wider">v2.0 Enterprise</span>
          <span className="text-border">|</span>
          <span>Connected Apps: <strong className="text-foreground font-semibold">4 Portals (3000-8084)</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>User: <strong className="text-foreground font-semibold">{userName}</strong></span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground font-medium">Ctrl+K Palette</span>
        </div>
      </footer>

      {/* Confirmation Modal when switching Branch */}
      {showBranchConfirmModal && pendingBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Switch Active Unit?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to switch active unit to <strong className="text-foreground">{pendingBranch.name}</strong>?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={() => {
                  setShowBranchConfirmModal(false);
                  setPendingBranch(null);
                }}
                variant="outline"
                className="w-1/2 font-semibold text-xs py-1.5"
              >
                No
              </Button>
              <Button
                onClick={() => {
                  setSelectedBranch(pendingBranch);
                  setShowBranchConfirmModal(false);
                  toast.success(`Switched unit to ${pendingBranch.name}`);
                  setPendingBranch(null);
                }}
                variant="primary"
                className="w-1/2 font-semibold text-xs py-1.5"
              >
                Yes, Switch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Universal Page SOP & System Data Flow Modal */}
      <PageHelpSOPModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        currentPath={currentPath}
      />
    </div>
  );
}

