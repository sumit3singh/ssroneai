import { useEffect, useState, useCallback, useRef } from "react";
import {
    Search,
    LayoutDashboard,
    ShoppingCart,
    Hotel,
    Users,
    Package,
    FileText,
    DollarSign,
    Bot,
    BarChart3,
    Settings,
    Building2,
    Utensils,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { cn } from "@ssrone/utils";

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: any;
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
    { id: "inventory", label: "Inventory", description: "Stock & products", icon: Package, href: "/inventory", category: "Pages", keywords: ["stock", "product", "item"] },
    { id: "billing", label: "Billing & Invoices", description: "Invoices & payments", icon: FileText, href: "/billing", category: "Pages", keywords: ["invoice", "payment", "receipt"] },
    { id: "finance", label: "Finance", description: "P&L, GST, accounts", icon: DollarSign, href: "/finance", category: "Pages", keywords: ["gst", "tax", "pl", "profit", "account"] },
    { id: "crm", label: "CRM & Loyalty", description: "Customer management", icon: Users, href: "/crm", category: "Pages", keywords: ["customer", "loyalty", "points"] },
    { id: "ai", label: "AI Copilot", description: "Ask AI anything", icon: Bot, href: "/ai", category: "AI", keywords: ["ai", "chat", "assistant", "help", "ask"] },
    { id: "reports", label: "Reports", description: "Analytics & charts", icon: BarChart3, href: "/reports", category: "Pages", keywords: ["report", "analytics", "chart", "export"] },
    { id: "settings", label: "Settings", description: "Platform configuration", icon: Settings, href: "/settings", category: "Pages", keywords: ["setting", "config", "theme"] },
    { id: "roadmap", label: "Enterprise Roadmap", description: "Architecture phases and delivery plan", icon: Building2, href: "/enterprise-roadmap", category: "Pages", keywords: ["roadmap", "architecture", "phases"] },
];

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const execute = useCallback(
        (cmd: CommandItem) => {
            setOpen(false);
            setQuery("");
            if (cmd.href) {
                window.history.pushState({}, "", cmd.href);
                window.dispatchEvent(new PopStateEvent("popstate"));
            } else if (cmd.action) {
                cmd.action();
            }
        },
        [],
    );

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((v) => !v);
                setSelected(0);
            }
            if (!open) return;
            if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((v) => Math.min(v + 1, filteredPages.length - 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((v) => Math.max(v - 1, 0));
            }
            if (e.key === "Enter" && filteredPages[selected]) {
                execute(filteredPages[selected]);
            }
        };

        window.addEventListener("keydown", down);
        return () => window.removeEventListener("keydown", down);
    }, [open, selected, filteredPages, execute]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 p-4"
            onClick={() => setOpen(false)}
        >
            <div
                className="w-full max-w-xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
                    <Search size={18} className="text-indigo-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search modules, pages, or commands (Ctrl+K)..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelected(0);
                        }}
                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-bold focus:outline-none"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-extrabold text-slate-400 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
                        ESC
                    </kbd>
                </div>

                {/* Command Items List */}
                <div className="max-h-[360px] overflow-y-auto p-3 space-y-1 scrollbar-thin">
                    {filteredPages.length === 0 ? (
                        <div className="py-12 text-center text-xs font-bold text-slate-400">
                            No results found for &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        filteredPages.map((cmd, idx) => {
                            const Icon = cmd.icon;
                            const isSel = idx === selected;
                            return (
                                <button
                                    key={cmd.id}
                                    type="button"
                                    onClick={() => execute(cmd)}
                                    onMouseEnter={() => setSelected(idx)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all duration-150 cursor-pointer border-none bg-transparent",
                                        isSel
                                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.01]"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn("p-2 rounded-xl shrink-0 transition-colors", isSel ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400")}>
                                          <Icon size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("font-bold text-xs md:text-sm leading-tight", isSel ? "text-white" : "text-slate-900 dark:text-white")}>
                                                {cmd.label}
                                            </p>
                                            {cmd.description && (
                                                <p className={cn("text-[11px] font-medium truncate mt-0.5", isSel ? "text-indigo-100" : "text-slate-400")}>
                                                    {cmd.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", isSel ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                                        {cmd.category}
                                      </span>
                                      <ArrowRight size={14} className={cn("transition-transform", isSel ? "text-white translate-x-0.5" : "text-slate-400")} />
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Controls Guide */}
                <div className="px-5 py-2.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-slate-500">↑↓</kbd> Navigate</span>
                    <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 text-slate-500">↵</kbd> Select</span>
                  </div>
                  <span className="flex items-center gap-1 text-indigo-500 font-bold">
                    <Sparkles size={11} /> SSR One AI
                  </span>
                </div>
            </div>
        </div>
    );
}
