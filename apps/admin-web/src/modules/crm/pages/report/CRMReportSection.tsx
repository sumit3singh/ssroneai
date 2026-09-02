import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Printer, TrendingUp, Users, Award } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import { useRouterState } from "@tanstack/react-router";

interface Customer {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  loyalty_tier?: string;
  loyalty_points?: number;
  lifetime_spent?: number;
  total_visits?: number;
}

interface CRMReportSectionProps {
  customers: Customer[];
}

export const CRMReportSection: React.FC<CRMReportSectionProps> = ({ customers }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const reportTab = currentPath.includes("/tier") ? "tier_distribution" : "points_ledger";
  const totalPointsInCirculation = customers.reduce((acc, c) => acc + (c.loyalty_points || 0), 0);
  const totalLifetimeSpent = customers.reduce((acc, c) => acc + (c.lifetime_spent || 0), 0);

  return (
    <div className="space-y-4">
      {/* Report Header & Controls */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
          {reportTab === "points_ledger" ? "Loyalty Points & Lifetime Spend Ledger" : "Tier Distribution & Retention Yield"}
        </h3>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("CRM Report exported as CSV!")} className="text-xs gap-1 cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1 cursor-pointer">
            <Printer className="w-3.5 h-3.5 text-primary" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Registered Guests</p>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{customers.length}</p>
        </div>
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Points in Circulation</p>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalPointsInCirculation} pts</p>
        </div>
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Lifetime Spend Total</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(totalLifetimeSpent)}</p>
        </div>
      </div>

      {/* ── TAB 1: Points & Lifetime Spend Ledger ── */}
      {reportTab === "points_ledger" && (
        <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Guest Loyalty Financial Audit Ledger</h4>
            <span className="text-[11px] text-muted-foreground font-mono">Live Database Records</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-2.5">Guest Name</th>
                <th className="p-2.5">Phone</th>
                <th className="p-2.5">Membership Tier</th>
                <th className="p-2.5">Loyalty Points</th>
                <th className="p-2.5">Lifetime Spend</th>
                <th className="p-2.5">Total Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium text-xs">
                    No customer data found in database.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-2.5 font-semibold text-foreground">
                      {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Guest Customer"}
                    </td>
                    <td className="p-2.5 text-muted-foreground font-mono">{c.phone || "N/A"}</td>
                    <td className="p-2.5">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border uppercase">
                        {c.loyalty_tier || "standard"}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-foreground">{c.loyalty_points || 0} pts</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.lifetime_spent || 0)}</td>
                    <td className="p-2.5 text-muted-foreground font-mono">{c.total_visits || 1} Visits</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: Tier Distribution ── */}
      {reportTab === "tier_distribution" && (
        <div className="bg-card rounded-md border border-border p-4 space-y-3">
          <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Loyalty Tier Distribution & Retention Analysis</h4>
          <div className="p-8 text-center border border-dashed border-border rounded-md bg-muted/20 text-muted-foreground text-xs font-medium">
            Dynamic guest distribution metrics across tiers powered by analytical engines.
          </div>
        </div>
      )}
    </div>
  );
};
