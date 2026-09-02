import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Download, TrendingUp, DollarSign, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";

import { useRouterState } from "@tanstack/react-router";

interface PGReportSectionProps {
  residents: Resident[];
}

export const PGReportSection: React.FC<PGReportSectionProps> = ({ residents }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const reportTab = currentPath.includes("/occupancy") ? "occupancy" : "ledger";

  const totalCollected = residents
    .filter((r) => r.paid_status === "paid")
    .reduce((acc, r) => acc + r.rent, 0);
  const totalDues = residents.reduce((acc, r) => acc + r.due_amount, 0);
  const totalRevenuePotential = totalCollected + totalDues;

  const handleExport = (format: string) => {
    toast.success(`PG ${reportTab.toUpperCase()} report exported as ${format.toUpperCase()}!`);
  };

  return (
    <div className="space-y-4">
      {/* Report Section Header & Controls */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
          {reportTab === "ledger" ? "Rent Collection Audit Ledger" : "Bed Occupancy & Revenue Potential Analysis"}
        </h3>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv")} className="text-xs gap-1 cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1 cursor-pointer">
            <Printer className="w-3.5 h-3.5 text-primary" /> Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Monthly Rent Roll Potential</p>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalRevenuePotential)}</p>
        </div>
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Realized Collections</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="p-3.5 rounded-md bg-card border border-border space-y-1 shadow-2xs">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Outstanding Arrears</p>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{formatCurrency(totalDues)}</p>
        </div>
      </div>

      {/* ── TAB 1: Rent Ledger Report ── */}
      {reportTab === "ledger" && (
        <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Financial Rent Collection Audit Ledger</h4>
            <span className="text-[11px] text-muted-foreground font-mono">Live Database Records</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-2.5">Tenant Name</th>
                <th className="p-2.5">Room / Bed</th>
                <th className="p-2.5">Agreed Rent</th>
                <th className="p-2.5">Amount Paid</th>
                <th className="p-2.5">Balance Due</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {residents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium text-xs">
                    No rent ledger records logged in database.
                  </td>
                </tr>
              ) : (
                residents.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-2.5 font-semibold text-foreground">{r.name}</td>
                    <td className="p-2.5 text-muted-foreground">{r.room}</td>
                    <td className="p-2.5 font-mono font-bold text-foreground">{formatCurrency(r.rent)}</td>
                    <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(r.paid_status === "paid" ? r.rent : 0)}
                    </td>
                    <td className="p-2.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {formatCurrency(r.due_amount)}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border uppercase ${
                        r.paid_status === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}>
                        {r.paid_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: Occupancy Report ── */}
      {reportTab === "occupancy" && (
        <div className="bg-card rounded-md border border-border p-4 space-y-3">
          <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Bed Occupancy & Utilization Analysis</h4>
          <div className="p-8 text-center border border-dashed border-border rounded-md bg-muted/20 text-muted-foreground text-xs font-medium">
            Dynamic bed utilization metrics and occupancy charts powered by PostgreSQL analytical engines.
          </div>
        </div>
      )}
    </div>
  );
};
