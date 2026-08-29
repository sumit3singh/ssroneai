import React from "react";
import { Users, Smartphone, DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatters";

interface HRStatGridProps {
  totalStaff: number;
  digitalAppStaff: number;
  totalPayroll: number;
}

export function HRStatGrid({ totalStaff, digitalAppStaff, totalPayroll }: HRStatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-3xs font-black text-muted-foreground uppercase">Branch Staff Roster</p>
          <p className="text-xl font-display font-black text-foreground mt-0.5">{totalStaff} Members</p>
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Users size={18} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-3xs font-black text-muted-foreground uppercase">Digital App Staff</p>
          <p className="text-xl font-display font-black text-emerald-600 mt-0.5">{digitalAppStaff} Provisioned</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
          <Smartphone size={18} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-3xs font-black text-muted-foreground uppercase">Branch Payroll Outflow</p>
          <p className="text-xl font-display font-black text-foreground mt-0.5">{formatCurrency(totalPayroll)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
          <DollarSign size={18} />
        </div>
      </div>
    </div>
  );
}
