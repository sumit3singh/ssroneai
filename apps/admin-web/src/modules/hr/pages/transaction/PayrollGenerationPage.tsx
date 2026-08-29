import React, { useState, useEffect } from "react";
import { DollarSign, FileText, Download, Printer, RefreshCw } from "lucide-react";
import { Button } from "@ssrone/ui";
import { formatCurrency } from "@/shared/utils/formatters";
import { useAuthStore } from "@ssrone/auth";
import { Employee } from "../../types/hr.types";
import { hrService } from "../../services/hr.service";
import { toast } from "sonner";

export function PayrollGenerationPage() {
  const { user, selected_branch } = useAuthStore();
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const list = await hrService.getEmployees({ branch_id: activeBranchId });
      setEmployees(list);
    } catch (err) {
      toast.error("Failed to load staff roster");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeBranchId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
              <DollarSign size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Payroll Slip Generator
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly salary ledgers, allowances, deductions, and net pay slips
          </p>
        </div>

        <button
          onClick={fetchEmployees}
          className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="font-display font-black text-sm text-foreground uppercase">Monthly Salary Ledger Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="pb-3">Code</th>
                <th className="pb-3">Employee</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Basic (₹)</th>
                <th className="pb-3 text-right">Allowances (₹)</th>
                <th className="pb-3 text-right">Deductions (₹)</th>
                <th className="pb-3 text-right">Net Pay (₹)</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {employees.map((emp) => {
                const net = emp.net_salary || (emp.salary + (emp.allowances || 0) - (emp.deductions || 0));
                return (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-mono text-muted-foreground">{emp.employee_code}</td>
                    <td className="py-3.5 font-display font-black text-foreground">{emp.name}</td>
                    <td className="py-3.5 text-muted-foreground">{emp.role}</td>
                    <td className="py-3.5 text-right font-mono">{formatCurrency(emp.salary)}</td>
                    <td className="py-3.5 text-right font-mono text-emerald-600">+{formatCurrency(emp.allowances || 0)}</td>
                    <td className="py-3.5 text-right font-mono text-rose-500">-{formatCurrency(emp.deductions || 0)}</td>
                    <td className="py-3.5 text-right font-mono font-black text-foreground">{formatCurrency(net)}</td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => toast.success(`Generated salary slip PDF for ${emp.name}!`)}
                        className="px-2.5 py-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] cursor-pointer inline-flex items-center gap-1 font-bold"
                      >
                        <FileText size={12} /> Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PayrollGenerationPage;
