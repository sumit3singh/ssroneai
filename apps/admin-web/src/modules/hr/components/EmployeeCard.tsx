import React from "react";
import { Edit2, Smartphone, ChefHat } from "lucide-react";
import { formatCurrency, getInitials } from "@/shared/utils/formatters";
import { Employee } from "../types/hr.types";

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
}

export function EmployeeCard({ employee: emp, onEdit }: EmployeeCardProps) {
  const net = emp.net_salary || (emp.salary + (emp.allowances || 0) - (emp.deductions || 0));

  return (
    <div className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-card hover:border-primary/40 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary font-black font-display flex items-center justify-center text-sm">
              {getInitials(emp.name.split(" ")[0] || emp.name, emp.name.split(" ")[1] || "S")}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-muted-foreground">{emp.employee_code}</span>
              <h3 className="font-display font-black text-sm text-foreground truncate max-w-[140px]">{emp.name}</h3>
            </div>
          </div>

          <button
            onClick={() => onEdit(emp)}
            title="Edit Staff Member & App Permissions"
            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs font-bold text-foreground">{emp.designation || emp.role}</p>
          <p className="text-2xs text-muted-foreground font-semibold">Dept: <span className="text-foreground">{emp.department}</span> • {emp.contact}</p>
        </div>

        {/* App Access Privilege Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5">
          {emp.can_access_staff_web && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Smartphone size={10} /> Staff-Web
            </span>
          )}
          {emp.can_access_kds_web && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ChefHat size={10} /> KDS-Web
            </span>
          )}
          {!emp.can_access_staff_web && !emp.can_access_kds_web && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-muted text-muted-foreground border border-border">
              No Digital Access
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border/60 pt-3 flex items-center justify-between font-mono font-bold text-xs">
        <span className="text-muted-foreground">Net Pay</span>
        <span className="text-foreground font-black text-sm">{formatCurrency(net)}</span>
      </div>
    </div>
  );
}
