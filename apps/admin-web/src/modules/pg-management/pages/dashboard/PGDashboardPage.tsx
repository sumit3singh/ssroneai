import React from "react";
import { 
  Users, Home, DollarSign, AlertTriangle, TrendingUp, Sparkles, Plus, FileText, ArrowRight 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident, PGActivity } from "../../types";

import { PGDashboardKPIs } from "../../api/pg.api";

interface PGDashboardPageProps {
  residents: Resident[];
  activities: PGActivity[];
  kpis?: PGDashboardKPIs | null;
  onOpenAddModal: () => void;
  onOpenRentModal: (resident: Resident) => void;
}

export const PGDashboardPage: React.FC<PGDashboardPageProps> = ({
  residents,
  activities,
  kpis,
  onOpenAddModal,
  onOpenRentModal,
}) => {
  const totalResidents = kpis?.total_residents ?? residents.length;
  const paidCount = residents.filter((r) => r.paid_status === "paid").length;
  const overdueCount = residents.filter((r) => r.paid_status === "overdue").length;
  const totalDue = kpis?.pending_dues ?? residents.reduce((acc, r) => acc + (r.due_amount || 0), 0);
  const totalCollected = kpis?.rent_collected ?? residents
    .filter((r) => r.paid_status === "paid")
    .reduce((acc, r) => acc + r.rent, 0);

  const occupancyPct = kpis?.occupancy_pct ?? (kpis?.total_beds ? Math.round((kpis.occupied_beds / kpis.total_beds) * 100) : 0);
  const activeRoomsText = kpis ? `${kpis.active_rooms} / ${kpis.total_rooms || kpis.active_rooms}` : `${residents.length > 0 ? 1 : 0} Rooms`;

  return (
    <div className="space-y-4">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-md border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Residents</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalResidents}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{occupancyPct}% Bed Occupancy</p>
          </div>
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-md border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Monthly Rent Collected</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalCollected)}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{paidCount} Paid</p>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-md border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Dues</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalDue)}</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">{overdueCount} Overdue Payments</p>
          </div>
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-md border border-border bg-card flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Rooms</p>
            <p className="text-xl font-bold font-mono text-foreground mt-0.5">{activeRoomsText}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Live Database Metrics</p>
          </div>
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Home className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-md border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Quick PG Management Actions</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={onOpenAddModal}
              className="p-3.5 rounded-md border border-border hover:border-primary/40 bg-background text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-foreground text-xs">Onboard New Resident</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Register new tenant, bed allocation, and deposit terms.</p>
            </button>

            <button
              onClick={() => {
                if (residents.length > 0) onOpenRentModal(residents[0]);
              }}
              className="p-3.5 rounded-md border border-border hover:border-emerald-500/40 bg-background text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-foreground text-xs">Record Rent Payment</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Issue digital rent receipt via UPI, Cash, or Net Banking.</p>
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card rounded-md border border-border p-4 space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">Recent Audit Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No recent activity recorded.</p>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-xs">{act.description}</p>
                    <p className="text-muted-foreground text-[10px] font-mono">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
