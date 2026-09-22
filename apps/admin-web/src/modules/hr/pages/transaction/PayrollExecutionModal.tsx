import React, { useState } from "react";
import { X, DollarSign, CheckCircle2, AlertCircle, Users, Calculator } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { Employee } from "../../types/hr.types";

interface PayrollExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSuccess?: () => void;
}

export const PayrollExecutionModal: React.FC<PayrollExecutionModalProps> = ({
  isOpen,
  onClose,
  employees,
  onSuccess,
}) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [payrollMonth, setPayrollMonth] = useState<string>(currentMonth);
  const [executing, setExecuting] = useState(false);

  const activeEmployees = employees.filter((e) => (e as any).is_active !== false);
  const totalEstimatedGross = activeEmployees.reduce((sum, e) => sum + (Number(e.salary) || 20000), 0);

  const handleExecutePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollMonth) {
      toast.error("Please select payroll cycle month");
      return;
    }

    try {
      setExecuting(true);
      const res: any = await api.post("/hr/payroll-runs/execute", {
        payroll_month: payrollMonth,
        branch_id: 1,
      });
      toast.success(res?.message || `Payroll run for ${payrollMonth} executed successfully!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute payroll run");
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Execute Monthly Payroll Run</h2>
              <p className="text-xs text-muted-foreground">
                Compute monthly payslips, earnings, deductions, and generate payment register
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleExecutePayroll} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Payroll Month Cycle</label>
            <Input
              type="month"
              value={payrollMonth}
              onChange={(e) => setPayrollMonth(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 border border-border rounded-lg">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Users size={12} /> Eligible Employees
              </div>
              <div className="text-lg font-bold font-mono text-foreground mt-0.5">
                {activeEmployees.length} Staff
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Calculator size={12} /> Total Gross Estimate
              </div>
              <div className="text-lg font-bold font-mono text-primary mt-0.5">
                ₹{totalEstimatedGross.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>
              Executing payroll will generate formal payslip records in the PostgreSQL database for all {activeEmployees.length} active staff members.
            </span>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={executing || activeEmployees.length === 0} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Process & Generate Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
