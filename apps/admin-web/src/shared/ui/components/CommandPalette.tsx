/**
 * The Baithak – Command Palette (Ctrl+K)
 * Global command palette per TBDL Enterprise UX Standards §13.
 * Search records, switch pages, run reports, ask AI — in one keypress.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import {
  Search, LayoutDashboard, ShoppingCart, Hotel, Home,
  Users, Package, FileText, DollarSign, UserCheck,
  Bot, BarChart3, Settings, Building2, Utensils,
  ArrowRight, Command, Database, Sparkles,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/app/providers/auth-store";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";

const BASE_URL = (import.meta as any).env.VITE_API_URL ?? "http://localhost:8000/api/v1";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  href?: string;
  action?: () => void;
  category: string;
  keywords: string[];
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", description: "KPI overview & AI insights", icon: LayoutDashboard, href: "/", category: "Pages", keywords: ["home", "overview", "kpi"] },
  { id: "pos", label: "Point of Sale", description: "Create new order", icon: ShoppingCart, href: "/pos", category: "Pages", keywords: ["order", "billing", "cashier", "sale"] },
  { id: "restaurant", label: "Table Management", description: "Floor plan & table status", icon: Utensils, href: "/restaurant", category: "Pages", keywords: ["table", "floor", "kds"] },
  { id: "hotel", label: "Hotel PMS", description: "Room management & check-in", icon: Hotel, href: "/hotel", category: "Pages", keywords: ["room", "checkin", "checkout", "guest"] },
  { id: "pg", label: "PG Management", description: "Residents, beds & rent", icon: Home, href: "/pg", category: "Pages", keywords: ["pg", "hostel", "resident", "rent"] },
  { id: "reservations", label: "Reservations", description: "Booking management", icon: Building2, href: "/reservations", category: "Pages", keywords: ["book", "reservation"] },
  { id: "inventory", label: "Inventory", description: "Stock & products", icon: Package, href: "/inventory", category: "Pages", keywords: ["stock", "product", "item"] },
  { id: "billing", label: "Billing & Invoices", description: "Invoices & payments", icon: FileText, href: "/billing", category: "Pages", keywords: ["invoice", "payment", "receipt"] },
  { id: "finance", label: "Finance", description: "P&L, GST, accounts", icon: DollarSign, href: "/finance", category: "Pages", keywords: ["gst", "tax", "pl", "profit", "account"] },
  { id: "crm", label: "CRM & Loyalty", description: "Customer management", icon: Users, href: "/crm", category: "Pages", keywords: ["customer", "loyalty", "points"] },
  { id: "hr", label: "HR & Payroll", description: "Employees & attendance", icon: UserCheck, href: "/hr", category: "Pages", keywords: ["employee", "staff", "payroll", "attendance", "leave"] },
  { id: "ai", label: "AI Copilot", description: "Ask AI anything", icon: Bot, href: "/ai", category: "AI", keywords: ["ai", "chat", "assistant", "help", "ask"] },
  { id: "reports", label: "Reports", description: "Analytics & charts", icon: BarChart3, href: "/reports", category: "Pages", keywords: ["report", "analytics", "chart", "export"] },
  { id: "settings", label: "Settings", description: "Platform configuration", icon: Settings, href: "/settings", category: "Pages", keywords: ["setting", "config", "theme"] },
  { id: "roadmap", label: "Enterprise Roadmap", description: "Architecture phases and delivery plan", icon: Sparkles, href: "/enterprise-roadmap", category: "Pages", keywords: ["roadmap", "architecture", "phases"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [dbResults, setDbResults] = useState<CommandItem[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch from backend Search endpoint
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setDbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const isMock = isMockSession();
      const q = query.toLowerCase();

      if (isMock) {
        // Query local Storage mockDB
        const results: CommandItem[] = [];

        // 1. Customers
        const customers = mockDB.get<any>("customers").filter(c =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        ).slice(0, 3).map(c => ({
          id: `cust-${c.id}`,
          label: `${c.first_name} ${c.last_name}`,
          description: `CRM Customer • ${c.phone || c.email || "No details"}`,
          icon: Users,
          href: "/crm",
          category: "Database Records",
          keywords: []
        }));
        results.push(...customers);

        // 2. Orders
        const orders = mockDB.get<any>("orders").filter(o =>
          o.order_number?.toLowerCase().includes(q)
        ).slice(0, 3).map(o => ({
          id: `ord-${o.id}`,
          label: `Order ${o.order_number}`,
          description: `POS Transaction • Grand Total: ₹${o.grand_total}`,
          icon: ShoppingCart,
          href: "/pos",
          category: "Database Records",
          keywords: []
        }));
        results.push(...orders);

        setDbResults(results);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/search`, {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().access_token ?? ""}`
          }
        });
        const mapped: CommandItem[] = (res.data.results || []).map((item: any) => ({
          id: item.id,
          label: item.title,
          description: item.subtitle,
          icon: item.type === "customer" ? Users : item.type === "order" ? ShoppingCart : item.type === "room" ? Hotel : Database,
          href: item.url,
          category: "Database Records",
          keywords: []
        }));
        setDbResults(mapped);
      } catch (err) {
        console.warn("Unified search failed", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredPages = query.trim()
    ? COMMANDS.filter((cmd) => {
      const q = query.toLowerCase();
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
      );
    })
    : COMMANDS;

  const combinedResults = [...filteredPages, ...dbResults];

  const execute = useCallback((cmd: CommandItem) => {
    setOpen(false);
    setQuery("");
    if (cmd.href) void navigate({ to: cmd.href });
    else if (cmd.action) cmd.action();
  }, [navigate]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setSelected(0);
      }
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((v) => Math.min(v + 1, combinedResults.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
      if (e.key === "Enter" && combinedResults[selected]) { execute(combinedResults[selected]); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, combinedResults, selected, execute]);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  if (!open) return null;

  const grouped = combinedResults.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    acc[cmd.category] = acc[cmd.category] || [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { setOpen(false); setQuery(""); }}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl mx-4 rounded-2xl border border-border bg-surface shadow-modal overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={17} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, records..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="flex-shrink-0 text-2xs bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {combinedResults.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <p className="px-3 py-1 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category}
                </p>
                {items.map((cmd) => {
                  const idx = combinedResults.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelected(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        selected === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                        selected === idx ? "bg-white/20" : "bg-muted",
                      )}>
                        <cmd.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        {cmd.description && (
                          <p className={cn("text-xs truncate", selected === idx ? "text-white/70" : "text-muted-foreground")}>
                            {cmd.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={13} className={selected === idx ? "text-white/70" : "text-muted-foreground"} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-2xs text-muted-foreground">
          <span><kbd className="bg-muted px-1 py-0.5 rounded border border-border">↑↓</kbd> navigate</span>
          <span><kbd className="bg-muted px-1 py-0.5 rounded border border-border">↵</kbd> select</span>
          <span><kbd className="bg-muted px-1 py-0.5 rounded border border-border">ESC</kbd> close</span>
          <span className="ml-auto flex items-center gap-1">
            <Command size={10} /> K to open
          </span>
        </div>
      </div>
    </div>
  );
}
export default CommandPalette;
