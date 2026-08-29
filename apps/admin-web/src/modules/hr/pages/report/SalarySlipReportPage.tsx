import React, { useState, useEffect } from "react";
import { FileText, Printer, Download, RefreshCw, X, Building2, User, DollarSign } from "lucide-react";
import { Button } from "@ssrone/ui";
import { formatCurrency } from "@/shared/utils/formatters";
import { useAuthStore } from "@ssrone/auth";
import { Employee } from "../../types/hr.types";
import { hrService } from "../../services/hr.service";
import { toast } from "sonner";

export function SalarySlipReportPage() {
  const { user, selected_branch } = useAuthStore();
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const list = await hrService.getEmployees({ branch_id: activeBranchId });
      setEmployees(list);
    } catch (err) {
      toast.error("Failed to load PostgreSQL salary reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeBranchId]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
              <FileText size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Salary Slip Reports & Payslip Center
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate and print official employee salary slips directly from PostgreSQL ledgers
          </p>
        </div>

        <button
          onClick={fetchEmployees}
          className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Salary Reports Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="font-display font-black text-sm text-foreground uppercase">Employee Payslip Directory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="pb-3">Code</th>
                <th className="pb-3">Employee Name</th>
                <th className="pb-3">Designation</th>
                <th className="pb-3 text-right">Basic Salary</th>
                <th className="pb-3 text-right">Allowances</th>
                <th className="pb-3 text-right">Deductions</th>
                <th className="pb-3 text-right">Net Payable</th>
                <th className="pb-3 text-center">Payslip Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {employees.map((emp) => {
                const net = emp.net_salary || (emp.salary + (emp.allowances || 0) - (emp.deductions || 0));
                return (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-mono text-muted-foreground">{emp.employee_code}</td>
                    <td className="py-3.5 font-display font-black text-foreground">{emp.name}</td>
                    <td className="py-3.5 text-muted-foreground">{emp.designation || emp.role}</td>
                    <td className="py-3.5 text-right font-mono">{formatCurrency(emp.salary)}</td>
                    <td className="py-3.5 text-right font-mono text-emerald-600">+{formatCurrency(emp.allowances || 0)}</td>
                    <td className="py-3.5 text-right font-mono text-rose-500">-{formatCurrency(emp.deductions || 0)}</td>
                    <td className="py-3.5 text-right font-mono font-black text-foreground text-sm">{formatCurrency(net)}</td>
                    <td className="py-3.5 text-center">
                      <Button
                        onClick={() => setSelectedEmp(emp)}
                        size="sm"
                        variant="outline"
                        className="font-bold cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <FileText size={13} /> View Payslip
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Payslip Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                <h3 className="font-display font-black text-sm text-foreground uppercase">
                  {selected_branch?.name || "Baithak Cafe"} — Payslip
                </h3>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="font-bold text-foreground">{selectedEmp.name}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedEmp.designation || selectedEmp.role} ({selectedEmp.employee_code})</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-primary/10 text-primary uppercase">
                  {selectedEmp.department}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Pay:</span>
                  <span className="text-foreground font-bold">{formatCurrency(selectedEmp.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allowances:</span>
                  <span className="text-emerald-600 font-bold">+{formatCurrency(selectedEmp.allowances || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deductions:</span>
                  <span className="text-rose-500 font-bold">-{formatCurrency(selectedEmp.deductions || 0)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-2 flex items-center justify-between font-black text-sm">
                <span>Net Pay:</span>
                <span className="text-primary">
                  {formatCurrency(selectedEmp.net_salary || (selectedEmp.salary + (selectedEmp.allowances || 0) - (selectedEmp.deductions || 0)))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedEmp(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  window.print();
                  toast.success(`Printing payslip for ${selectedEmp.name}...`);
                }}
                className="font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print Payslip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalarySlipReportPage;
