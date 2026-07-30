import React, { useState, useEffect, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Users, Plus, Search, Phone, Mail, Wallet, PlusCircle, Trash2, X, ShieldCheck, Save, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { cn } from "@/shared/utils/cn";
import { formatCurrency, getInitials } from "@/shared/utils/formatters";
import { api } from "@/shared/utils/api-client";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  wallet_balance: number;
  lifetime_spent: number;
  total_visits: number;
  last_visit_at: string | null;
  is_active: boolean;
}

const TIER_COLOR: Record<string, string> = {
  standard: "#6B7280",
  silver: "#9CA3AF",
  gold: "#F59E0B",
  platinum: "#8B5CF6",
  vip: "#E67E22",
};

export function CRMPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Domain State strictly fetched from PostgreSQL (Golden Rule #1 & #2)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    loyalty_tier: "standard"
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customers strictly from PostgreSQL API
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Customer[]>("/crm/customers");
      setCustomers(res || []);
    } catch (err) {
      console.error("Failed to load CRM guest profiles from PostgreSQL", err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search));
      const matchesTier = tierFilter === "all" || c.loyalty_tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [search, tierFilter, customers]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.first_name || !newCustomer.last_name) return;

    try {
      await api.post("/crm/customers", {
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        email: newCustomer.email || null,
        phone: newCustomer.phone || null,
        loyalty_tier: newCustomer.loyalty_tier,
        tenant_id: 1,
        company_id: 1,
        branch_id: 1
      });
      setShowAddModal(false);
      fetchCustomers();
    } catch (err) {
      alert("Failed to save guest profile to PostgreSQL database");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600">
              <Users size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Guest Directory & CRM Master
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Guest loyalty points, lifetime spend history, and wallet ledgers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="font-extrabold flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Guest Profile</span>
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "standard", "silver", "gold", "platinum"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-2xs font-extrabold uppercase border transition-all shrink-0",
                tierFilter === t ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cust) => (
          <div key={cust.id} className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-card hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black font-display flex items-center justify-center text-sm">
                  {getInitials(cust.first_name, cust.last_name)}
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-foreground">{cust.first_name} {cust.last_name}</h3>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: `${TIER_COLOR[cust.loyalty_tier] || "#6B7280"}20`, color: TIER_COLOR[cust.loyalty_tier] || "#6B7280" }}
                  >
                    {cust.loyalty_tier} Tier
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground font-semibold border-t border-b border-border/60 py-3">
              {cust.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-muted-foreground" />
                  <span>{cust.phone}</span>
                </div>
              )}
              {cust.email && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-muted-foreground" />
                  <span className="truncate">{cust.email}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-muted/40 p-2.5 rounded-xl space-y-0.5">
                <span className="text-3xs font-extrabold uppercase text-muted-foreground block">Lifetime Spend</span>
                <span className="font-mono font-black text-xs text-emerald-500">{formatCurrency(cust.lifetime_spent || 0)}</span>
              </div>
              <div className="bg-muted/40 p-2.5 rounded-xl space-y-0.5">
                <span className="text-3xs font-extrabold uppercase text-muted-foreground block">Loyalty Points</span>
                <span className="font-mono font-black text-xs text-purple-500">{cust.loyalty_points || 0} Points</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-black text-base text-foreground uppercase">Add Guest Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="guest@example.com"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-extrabold flex items-center gap-1.5">
                  <Save size={14} />
                  <span>Save Profile</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
