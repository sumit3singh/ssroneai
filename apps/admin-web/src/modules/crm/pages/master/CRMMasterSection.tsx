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

import { useRouterState } from "@tanstack/react-router";

export const CRMMasterSection: React.FC<CRMMasterSectionProps> = ({
  customers,
  search,
  onSearchChange,
  onOpenAddModal,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const masterTab = currentPath.includes("/tiers") ? "tiers" : "directory";

  return (
    <div className="space-y-4">
      {/* ── TAB 1: Guest Directory Master ── */}
      {masterTab === "directory" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-md border border-border">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search guest profiles by name, phone, or email..."
                className="w-full pl-8 pr-2.5 py-1 text-xs font-medium bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">{customers.length} Guests Configured</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customers.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-md bg-muted/20 font-medium">
                No guest profiles found in database. Click <strong>Add Guest Profile</strong> to onboard guests.
              </div>
            ) : (
              customers.map((c) => {
                const displayName = c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Guest Customer";
                const tier = c.loyalty_tier || "standard";
                const points = c.loyalty_points || 0;

                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-md border border-border bg-card shadow-2xs hover:border-primary/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                        {getInitials(c.name ? c.name.split(" ")[0] : c.first_name || "", c.name ? (c.name.split(" ")[1] || "") : c.last_name || "")}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">{displayName}</h4>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border">
                          {tier} Tier
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-0.5 text-muted-foreground border-t border-b border-border py-2">
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-muted-foreground" /> {c.phone || "No Phone"}</p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-muted-foreground" /> {c.email || "No Email"}</p>
                    </div>

                    <div className="flex items-center justify-between pt-0.5 font-mono text-xs">
                      <span className="text-muted-foreground text-[11px]">Loyalty Balance</span>
                      <span className="font-bold text-foreground">{points} pts</span>
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
        <div className="bg-card rounded-md border border-border p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Loyalty Membership Tiers & Multipliers</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tier progression based on lifetime spending & visit frequencies in database.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {[
              { name: "Standard", minSpend: 0, mult: "1.0x" },
              { name: "Silver", minSpend: 5000, mult: "1.2x" },
              { name: "Gold", minSpend: 15000, mult: "1.5x" },
              { name: "Platinum / VIP", minSpend: 50000, mult: "2.0x" },
            ].map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-md border border-border bg-background space-y-1.5 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-xs font-mono">{t.name}</span>
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <p className="text-muted-foreground text-[11px]">Min Spend: <strong className="text-foreground font-mono font-semibold">{formatCurrency(t.minSpend)}</strong></p>
                <p className="text-muted-foreground text-[11px]">Reward Multiplier: <strong className="text-foreground font-mono font-semibold">{t.mult}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
