import React, { useState } from "react";
import { BarChart3, FileSpreadsheet, Printer, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import { Employee } from "../../types/hr.types";

interface HRReportSectionProps {
  employees: Employee[];
}

import { useRouterState } from "@tanstack/react-router";

export const HRReportSection: React.FC<HRReportSectionProps> = ({ employees }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const reportTab = currentPath.includes("/attendance-summary") ? "attendance_summary" : "payroll_ledger";
  const totalMonthlyPayroll = employees.reduce((acc, e) => acc + (e.net_salary || e.salary), 0);

  return (
    <div className="space-y-4">
      {/* Report Header & Controls */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
          {reportTab === "payroll_ledger" ? "Monthly Salary Ledger & Audit Report" : "Attendance & Overtime Yield Report"}
        </h3>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("HR Report exported as CSV!")} className="text-xs gap-1 cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1 cursor-pointer">
            <Printer className="w-3.5 h-3.5 text-primary" /> Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Staff Count</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{employees.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-xs">
          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Total Monthly Payroll Outflow</p>
          <p className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">{formatCurrency(totalMonthlyPayroll)}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Average Staff Salary</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(employees.length > 0 ? totalMonthlyPayroll / employees.length : 0)}
          </p>
        </div>
      </div>

      {/* ── TAB 1: Salary Audit Ledger ── */}
      {reportTab === "payroll_ledger" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Financial Payroll Audit Register</h4>
            <span className="text-xs text-slate-500 font-mono">Live PostgreSQL Records</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Employee Code</th>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Basic Salary</th>
                <th className="p-3">Net Salary</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono text-slate-500">{e.employee_code}</td>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{e.name}</td>
                  <td className="p-3 text-slate-500">{e.department || "Operations"}</td>
                  <td className="p-3 font-mono">{formatCurrency(e.salary)}</td>
                  <td className="p-3 font-bold text-violet-600 dark:text-violet-400">{formatCurrency(e.net_salary || e.salary)}</td>
                  <td className="p-3"><Badge variant="success">DISBURSED</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
