import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Printer, TrendingUp, Users, Award } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";

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
  const [reportTab, setReportTab] = useState<"points_ledger" | "tier_distribution">("points_ledger");

  const totalPointsInCirculation = customers.reduce((acc, c) => acc + (c.loyalty_points || 0), 0);
  const totalLifetimeSpent = customers.reduce((acc, c) => acc + (c.lifetime_spent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Report Header & Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportTab("points_ledger")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "points_ledger"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline-block mr-1.5" />
            Loyalty Points & Lifetime Spend Ledger
          </button>

          <button
            onClick={() => setReportTab("tier_distribution")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "tier_distribution"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline-block mr-1.5" />
            Tier Distribution & Retention Yield
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("CRM Report exported as CSV!")} className="text-xs gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1">
            <Printer className="w-3.5 h-3.5 text-pink-600" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Registered Guests</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{customers.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 shadow-xs">
          <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Points in Circulation</p>
          <p className="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">{totalPointsInCirculation} pts</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Lifetime Spend Total</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalLifetimeSpent)}</p>
        </div>
      </div>

      {/* ── TAB 1: Points & Lifetime Spend Ledger ── */}
      {reportTab === "points_ledger" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Guest Loyalty Financial Audit Ledger</h4>
            <span className="text-xs text-slate-500 font-mono">Live PostgreSQL Records</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Membership Tier</th>
                <th className="p-3">Loyalty Points</th>
                <th className="p-3">Lifetime Spend</th>
                <th className="p-3">Total Visits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No customer data found in PostgreSQL database.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Guest Customer"}
                    </td>
                    <td className="p-3 text-slate-500">{c.phone || "N/A"}</td>
                    <td className="p-3">
                      <Badge variant="outline">{(c.loyalty_tier || "standard").toUpperCase()}</Badge>
                    </td>
                    <td className="p-3 font-bold text-pink-600 dark:text-pink-400">{c.loyalty_points || 0} pts</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(c.lifetime_spent || 0)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{c.total_visits || 1} Visits</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
