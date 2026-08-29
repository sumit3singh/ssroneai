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
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Residents</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalResidents}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">{occupancyPct}% Bed Occupancy</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Rent Collected</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalCollected)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">{paidCount} Paid</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Dues</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalDue)}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">{overdueCount} Overdue Payments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Rooms</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeRoomsText}</p>
            <p className="text-xs text-slate-500 mt-1">Live Database Metrics</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Home className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Cards & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Quick PG Management Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onOpenAddModal}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 bg-slate-50 dark:bg-slate-850 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Onboard New Resident</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Register new tenant, bed allocation, and deposit terms.</p>
            </button>

            <button
              onClick={() => {
                if (residents.length > 0) onOpenRentModal(residents[0]);
              }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-850 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Record Rent Payment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issue digital rent receipt via UPI, Cash, or Net Banking.</p>
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Audit Activity</h3>
          <div className="space-y-4">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{act.description}</p>
                  <p className="text-slate-400 text-[10px]">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
