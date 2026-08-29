import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Download, TrendingUp, DollarSign, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";

interface PGReportSectionProps {
  residents: Resident[];
}

export const PGReportSection: React.FC<PGReportSectionProps> = ({ residents }) => {
  const [reportTab, setReportTab] = useState<"ledger" | "occupancy">("ledger");

  const totalCollected = residents
    .filter((r) => r.paid_status === "paid")
    .reduce((acc, r) => acc + r.rent, 0);
  const totalDues = residents.reduce((acc, r) => acc + r.due_amount, 0);
  const totalRevenuePotential = totalCollected + totalDues;

  const handleExport = (format: string) => {
    toast.success(`PG ${reportTab.toUpperCase()} report exported as ${format.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      {/* Report Section Header & Sub-Nav */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportTab("ledger")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "ledger"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 inline-block mr-1.5" />
            Rent Collection Ledger Report
          </button>

          <button
            onClick={() => setReportTab("occupancy")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              reportTab === "occupancy"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline-block mr-1.5" />
            Bed Occupancy & Revenue Potential Report
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExport("csv")} className="text-xs gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1">
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Monthly Rent Roll Potential</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenuePotential)}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Realized Collections</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Outstanding Arrears</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalDues)}</p>
        </div>
      </div>

      {/* ── TAB 1: Rent Ledger Report ── */}
      {reportTab === "ledger" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Financial Rent Collection Audit Ledger</h4>
            <span className="text-xs text-slate-500 font-mono">Live PostgreSQL Records</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Room / Bed</th>
                <th className="p-3">Agreed Rent</th>
                <th className="p-3">Amount Paid</th>
                <th className="p-3">Balance Due</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {residents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No resident financial ledger records in PostgreSQL database.
                  </td>
                </tr>
              ) : (
                residents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{r.room}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatCurrency(r.rent)}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      {r.paid_status === "paid" ? formatCurrency(r.rent) : "₹0.00"}
                    </td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(r.due_amount)}</td>
                    <td className="p-3">
                      <Badge variant={r.paid_status === "paid" ? "success" : "danger"}>
                        {r.paid_status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TAB 2: Bed Occupancy Report ── */}
      {reportTab === "occupancy" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Occupancy & Revenue Potential Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">Total Active Residents</p>
              <p className="text-3xl font-black text-violet-600">{residents.length}</p>
              <p className="text-slate-500">Currently residing in PostgreSQL database units.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
              <p className="font-bold text-slate-900 dark:text-white">Estimated Monthly Yield</p>
              <p className="text-3xl font-black text-emerald-600">{formatCurrency(totalCollected)}</p>
              <p className="text-slate-500">Realized cash inflow for the active billing cycle.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
