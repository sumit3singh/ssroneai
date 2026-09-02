import React, { useState } from "react";
import { Clock, DollarSign, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import { Employee } from "../../types/hr.types";

interface HRTransactionSectionProps {
  employees: Employee[];
}

import { useRouterState } from "@tanstack/react-router";

export const HRTransactionSection: React.FC<HRTransactionSectionProps> = ({ employees }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const transTab = currentPath.includes("/payroll") ? "payroll" : "attendance";
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);

  return (
    <div className="space-y-4">
      {/* ── TAB 1: Attendance Log Table ── */}
      {transTab === "attendance" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Daily Staff Shift & Attendance Ledger</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">Live Database Records</span>
              <Button
                onClick={() => {
                  toast.success("Attendance punch recorded for staff!");
                }}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Quick Punch Attendance
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">In Time</th>
                  <th className="p-3">Out Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No staff records found in database.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="p-3 text-slate-500">{emp.role}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">09:00 AM</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">06:00 PM</td>
                      <td className="p-3"><Badge variant="success">PRESENT</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Payroll Run Form ── */}
      {transTab === "payroll" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Monthly Salary & Payroll Register</h3>
            <span className="text-xs text-slate-500 font-mono">Cycle: August 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Allowances</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Payable</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                    <td className="p-3 font-mono">{formatCurrency(emp.salary)}</td>
                    <td className="p-3 font-mono text-emerald-600">+{formatCurrency(emp.allowances || 0)}</td>
                    <td className="p-3 font-mono text-amber-600">-{formatCurrency(emp.deductions || 0)}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(emp.net_salary || emp.salary)}</td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" onClick={() => toast.success(`Payslip generated for ${emp.name}`)} className="text-xs">
                        Generate Voucher
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
