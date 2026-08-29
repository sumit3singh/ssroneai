import React, { useState } from "react";
import { Users, Plus, Search, ShieldCheck, Phone, Mail, Award, CheckCircle2 } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { formatCurrency, getInitials } from "@/shared/utils/formatters";

interface Customer {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  loyalty_tier?: string;
  loyalty_points?: number;
  city?: string | null;
}

interface CRMMasterSectionProps {
  customers: Customer[];
  search: string;
  onSearchChange: (v: string) => void;
  onOpenAddModal: () => void;
}

const TIER_COLOR: Record<string, string> = {
  standard: "#6B7280",
  silver: "#9CA3AF",
  gold: "#F59E0B",
  platinum: "#8B5CF6",
  vip: "#E67E22",
};

export const CRMMasterSection: React.FC<CRMMasterSectionProps> = ({
  customers,
  search,
  onSearchChange,
  onOpenAddModal,
}) => {
  const [masterTab, setMasterTab] = useState<"directory" | "tiers">("directory");

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header for MASTER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMasterTab("directory")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              masterTab === "directory"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-1.5" />
            Guest Directory Master
          </button>

          <button
            onClick={() => setMasterTab("tiers")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              masterTab === "tiers"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1.5" />
            Loyalty Tier Master Rules
          </button>
        </div>

        {masterTab === "directory" && (
          <Button onClick={onOpenAddModal} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Add Guest Profile
          </Button>
        )}
      </div>

      {/* ── TAB 1: Guest Directory Master ── */}
      {masterTab === "directory" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search guest profiles by name, phone, or email..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">{customers.length} Guests Configured in PostgreSQL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No guest profiles found in PostgreSQL database. Click <strong>Add Guest Profile</strong> to onboard guests.
              </div>
            ) : (
              customers.map((c) => {
                const displayName = c.name || `${c.first_name || ""} ${c.last_name || ""}`.strip() || "Guest Customer";
                const tier = c.loyalty_tier || "standard";
                const points = c.loyalty_points || 0;

                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-pink-500/30 transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 font-bold flex items-center justify-center text-sm">
                        {getInitials(c.name ? c.name.split(" ")[0] : c.first_name || "", c.name ? (c.name.split(" ")[1] || "") : c.last_name || "")}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{displayName}</h4>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${TIER_COLOR[tier] || "#6B7280"}20`, color: TIER_COLOR[tier] || "#6B7280" }}
                        >
                          {tier} Tier
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {c.phone || "No Phone"}</p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {c.email || "No Email"}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500">Loyalty Balance</span>
                      <span className="font-bold text-pink-600 dark:text-pink-400">{points} pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Loyalty Tier Master Rules ── */}
      {masterTab === "tiers" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Loyalty Membership Tiers & Multipliers</h3>
              <p className="text-xs text-slate-500">Tier progression based on lifetime spending & visit frequencies in PostgreSQL DB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {[
              { name: "Standard", minSpend: 0, mult: "1.0x", color: "border-slate-300 bg-slate-50 text-slate-700" },
              { name: "Silver", minSpend: 5000, mult: "1.2x", color: "border-slate-300 bg-slate-100 text-slate-800" },
              { name: "Gold", minSpend: 15000, mult: "1.5x", color: "border-amber-400/40 bg-amber-500/10 text-amber-600" },
              { name: "Platinum / VIP", minSpend: 50000, mult: "2.0x", color: "border-purple-400/40 bg-purple-500/10 text-purple-600" },
            ].map((t, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${t.color} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{t.name}</span>
                  <Award className="w-4 h-4" />
                </div>
                <p>Min Spend: <strong>{formatCurrency(t.minSpend)}</strong></p>
                <p>Reward Multiplier: <strong>{t.mult}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
