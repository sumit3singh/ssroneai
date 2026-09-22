import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  LayoutDashboard,
  ShoppingBag,
  LayoutGrid,
  Receipt,
  ChefHat,
  Lock,
  Hotel,
  Home,
  Users,
  UserCheck,
  Package,
  DollarSign,
  Palette,
  FormInput,
  Sparkles,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  ArrowRight,
  TrendingUp,
  CreditCard,
  FileText
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface SearchItem {
  id: string;
  title: string;
  category: "Modules" | "Transactions & Ops" | "Master & Config" | "Actions";
  description?: string;
  path?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  keywords: string[];
  action?: () => void;
}

interface NavbarSearchDropdownProps {
  onOpenSOP?: () => void;
  onToggleTheme?: () => void;
  theme?: "dark" | "light";
  className?: string;
}

export const NavbarSearchDropdown: React.FC<NavbarSearchDropdownProps> = ({
  onOpenSOP,
  onToggleTheme,
  theme = "light",
  className,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Master catalog of all ERP search destinations
  const searchItems = useMemo<SearchItem[]>(() => {
    return [
      // 1. Primary Business Modules
      {
        id: "mod-pos",
        title: "POS & Restaurant",
        category: "Modules",
        description: "Point of Sale billing, live tables & kitchen",
        path: "/pos",
        icon: ShoppingBag,
        keywords: ["pos", "restaurant", "billing", "counter", "cashier", "food"],
      },
      {
        id: "mod-hotel",
        title: "Hotel PMS & Rooms",
        category: "Modules",
        description: "Front desk, reservations & room operations",
        path: "/hotel",
        icon: Hotel,
        keywords: ["hotel", "pms", "room", "stay", "guest", "checkin"],
      },
      {
        id: "mod-pg",
        title: "PG & Hostels",
        category: "Modules",
        description: "Bed management, student rent & visitor logs",
        path: "/pg-management",
        icon: Home,
        keywords: ["pg", "hostel", "paying guest", "bed", "rent", "tenant"],
      },
      {
        id: "mod-crm",
        title: "Guest CRM & Loyalty",
        category: "Modules",
        description: "Customer database, VIP loyalty & campaigns",
        path: "/crm",
        icon: Users,
        keywords: ["crm", "customer", "loyalty", "guest", "rewards", "points"],
      },
      {
        id: "mod-hr",
        title: "HR & Payroll",
        category: "Modules",
        description: "Staff attendance, salary slips & shifts",
        path: "/hr",
        icon: UserCheck,
        keywords: ["hr", "hrms", "payroll", "staff", "employee", "salary", "shift"],
      },
      {
        id: "mod-inventory",
        title: "Material & Inventory",
        category: "Modules",
        description: "Stock ledger, purchase orders & raw goods",
        path: "/inventory",
        icon: Package,
        keywords: ["inventory", "stock", "raw material", "purchase", "items"],
      },
      {
        id: "mod-finance",
        title: "Finance & Accounting",
        category: "Modules",
        description: "Ledger, GST tax filings & vouchers",
        path: "/finance",
        icon: DollarSign,
        keywords: ["finance", "accounting", "ledger", "gst", "tax", "p&l", "expense"],
      },
      {
        id: "mod-customization",
        title: "Website & App Customization",
        category: "Modules",
        description: "Studio branding, live themes & custom domains",
        path: "/customization",
        icon: Palette,
        keywords: ["customization", "brand", "theme", "domain", "colors", "logo"],
      },
      {
        id: "mod-forms",
        title: "Dynamic Forms",
        category: "Modules",
        description: "Custom surveys, feedback & inspection forms",
        path: "/forms/builder",
        icon: FormInput,
        keywords: ["forms", "builder", "surveys", "feedback"],
      },
      {
        id: "mod-ai",
        title: "AI Copilot",
        category: "Modules",
        description: "Enterprise analytics intelligence & predictive insights",
        path: "/ai-copilot",
        icon: Sparkles,
        keywords: ["ai", "copilot", "chat", "predictive", "insights", "analytics"],
      },
      {
        id: "mod-settings",
        title: "System Settings",
        category: "Modules",
        description: "Tenants, branches, roles & security policies",
        path: "/settings",
        icon: Settings,
        keywords: ["settings", "system", "branch", "users", "roles", "permissions"],
      },

      // 2. High-Frequency POS & Restaurant Workspaces
      {
        id: "pos-billing",
        title: "POS Counter Billing Terminal",
        category: "Transactions & Ops",
        description: "0ms instant tap-to-cart cashier terminal",
        path: "/pos/transaction/billing",
        icon: ShoppingBag,
        keywords: ["billing", "counter", "cashier", "checkout", "order", "terminal"],
      },
      {
        id: "pos-tables",
        title: "Table Floor & Live Tracker",
        category: "Transactions & Ops",
        description: "Live occupancy grid, settle bills & KOT status",
        path: "/pos/transaction/tables",
        icon: LayoutGrid,
        keywords: ["tables", "floor", "occupancy", "dine in", "kiosk", "table floor"],
        action: () => {
          // Open Table Floor in Fullscreen Kiosk Mode
          try {
            sessionStorage.setItem("pos_open_kiosk_fullscreen", "true");
            localStorage.setItem("pos_kiosk_fullscreen", "true");
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } catch {}
          window.dispatchEvent(new CustomEvent("pos:switch-tab", { detail: { tab: "tables", fullscreen: true } }));
          window.dispatchEvent(new CustomEvent("pos:set-fullscreen", { detail: { fullscreen: true } }));
          window.dispatchEvent(new CustomEvent("pos:refresh-tables"));
          void navigate({ to: "/pos/transaction/tables" });
        },
      },
      {
        id: "pos-orders",
        title: "Active Orders List & History",
        category: "Transactions & Ops",
        description: "Track live KOTs, reprint slips & recall orders",
        path: "/pos/transaction/orders",
        icon: Receipt,
        keywords: ["orders", "history", "kot", "reprint", "recall", "active orders"],
      },
      {
        id: "pos-kds",
        title: "Kitchen Display (KDS)",
        category: "Transactions & Ops",
        description: "Multi-station cook & prep order workflow",
        path: "/pos/transaction/kds",
        icon: ChefHat,
        keywords: ["kds", "kitchen", "cook", "chef", "station", "expo"],
      },
      {
        id: "pos-shift",
        title: "Shift & Drawer Management",
        category: "Transactions & Ops",
        description: "Cash drawer opening, petty cash & shift handover",
        path: "/pos/transaction/shift",
        icon: Lock,
        keywords: ["shift", "drawer", "cash", "handover", "closing"],
      },
      {
        id: "pos-daily-sales",
        title: "Daily Sales Report",
        category: "Transactions & Ops",
        description: "Revenue breakdown, tender types & tax report",
        path: "/pos/reports/daily-sales",
        icon: TrendingUp,
        keywords: ["report", "sales", "revenue", "daily", "summary"],
      },

      // 3. Masters & Configuration
      {
        id: "pos-menu-items",
        title: "Menu Items & Variants Master",
        category: "Master & Config",
        description: "Dishes, pricing, variants & addon groups",
        path: "/pos/master/menu-items",
        icon: FileText,
        keywords: ["menu", "items", "dishes", "variants", "addons", "pricing"],
      },
      {
        id: "pos-categories",
        title: "Menu Categories Master",
        category: "Master & Config",
        description: "Organize food categories & sorting",
        path: "/pos/master/categories",
        icon: LayoutDashboard,
        keywords: ["category", "categories", "menu categories"],
      },
      {
        id: "pos-tables-master",
        title: "Dining Tables & Floor Setup",
        category: "Master & Config",
        description: "Configure sections, cabins & table numbers",
        path: "/pos/master/tables",
        icon: LayoutGrid,
        keywords: ["tables master", "floor setup", "sections", "cabins"],
      },
      {
        id: "pos-printers",
        title: "POS Thermal Printers & Hardware",
        category: "Master & Config",
        description: "USB/Network thermal ESC/POS printer routing",
        path: "/pos/settings",
        icon: Settings,
        keywords: ["printer", "thermal", "hardware", "receipt printer", "kot printer"],
      },

      // 4. Quick Actions
      {
        id: "act-home",
        title: "Platform Home",
        category: "Actions",
        description: "Return to central workspace module launcher",
        path: "/",
        icon: LayoutDashboard,
        keywords: ["home", "dashboard", "main", "launcher"],
      },
      {
        id: "act-sop",
        title: "Open Page SOP & Documentation",
        category: "Actions",
        description: "View Standard Operating Procedures & architecture flows",
        icon: HelpCircle,
        keywords: ["sop", "help", "guide", "docs", "documentation", "flow"],
        action: () => {
          onOpenSOP?.();
        },
      },
      {
        id: "act-theme",
        title: `Toggle Theme (${theme === "dark" ? "Light Mode" : "Dark Mode"})`,
        category: "Actions",
        description: "Switch between light and dark visual mode",
        icon: theme === "dark" ? Sun : Moon,
        keywords: ["theme", "dark", "light", "color", "appearance"],
        action: () => {
          onToggleTheme?.();
        },
      },
    ];
  }, [theme, onOpenSOP, onToggleTheme, navigate]);

  // Filter items in real time based on search query
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      // Default recommended / frequent items when query is empty
      return searchItems.slice(0, 8);
    }
    return searchItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(cleanQuery) ||
        item.description?.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery) ||
        item.keywords.some((k) => k.includes(cleanQuery))
      );
    });
  }, [query, searchItems]);

  // Execute item selection
  const handleSelect = useCallback(
    (item: SearchItem) => {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();

      if (item.action) {
        item.action();
      } else if (item.path) {
        void navigate({ to: item.path });
      }
    },
    [navigate]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K listener to focus search input and open dropdown
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Keyboard navigation within dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        handleSelect(filteredResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Search Input Box in Navbar */}
      <div className="relative flex items-center">
        <Search
          size={13}
          className="absolute left-2.5 text-muted-foreground pointer-events-none transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search modules, pages... (Ctrl+K)"
          className="h-7.5 w-48 sm:w-56 md:w-64 focus:w-72 bg-background border border-border rounded-md pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground transition-all duration-200 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 shadow-2xs select-text"
        />

        {/* Right side clear or shortcut badge */}
        <div className="absolute right-2 flex items-center pointer-events-none">
          {query ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuery("");
                inputRef.current?.focus();
              }}
              className="pointer-events-auto p-0.5 text-muted-foreground hover:text-foreground cursor-pointer rounded"
            >
              <X size={12} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[9px] bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground">
              Ctrl+K
            </kbd>
          )}
        </div>
      </div>

      {/* Anchored Search Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-80 sm:w-96 max-h-[420px] bg-card text-foreground border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ transformOrigin: "top left" }}
        >
          {/* Header indicator */}
          <div className="px-3 py-2 border-b border-border bg-muted/40 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {query ? `Results for "${query}"` : "Quick Navigation & Workspaces"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {filteredResults.length} {filteredResults.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="overflow-y-auto max-h-[320px] p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          >
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => {
                const isSelected = idx === activeIndex;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "w-full px-2.5 py-2 rounded-lg text-left flex items-center gap-3 transition-colors cursor-pointer border-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted/70"
                    )}
                  >
                    {/* Icon container */}
                    <div
                      className={cn(
                        "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border transition-all",
                        isSelected
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      <IconComponent size={14} />
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate text-foreground">
                          {item.title}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider shrink-0",
                            item.category === "Modules"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : item.category === "Transactions & Ops"
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : item.category === "Master & Config"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow hint on selected */}
                    {isSelected && (
                      <ArrowRight size={13} className="text-primary shrink-0 animate-in fade-in-0 duration-100" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center px-4">
                <Search size={24} className="mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs font-semibold text-foreground">No matches found</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Try searching for POS, tables, billing, hotel, crm, staff, or inventory.
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Guide */}
          <div className="px-3 py-1.5 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[9px]">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[9px]">↵</kbd> open
              </span>
            </div>
            <span>
              <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[9px]">esc</kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSearchDropdown;
