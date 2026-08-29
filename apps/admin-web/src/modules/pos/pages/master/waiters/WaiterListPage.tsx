import React from "react";
import { Users, UserCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useNavigate } from "@tanstack/react-router";
import { POSWaiter } from "../../../types";

interface WaiterListPageProps {
  waiters: POSWaiter[];
  onOpenCreate?: () => void;
  isLoading?: boolean;
}

export const WaiterListPage: React.FC<WaiterListPageProps> = ({
  waiters,
  isLoading = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* SSOT Governance Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary text-white font-bold mt-0.5 sm:mt-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wide">
              Single Source of Truth (SSOT): HR & Payroll Staff Master
            </h4>
            <p className="text-3xs text-muted-foreground mt-0.5">
              All staff members, waiters, cashiers, and managers are managed centrally under the <strong>HR & Staff Roster Module</strong> (<code className="text-primary">/hr</code>). Staff created in HR automatically gain POS order-taking authorization.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate({ to: "/hr" as any })}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          Manage Staff in HR <ArrowRight size={14} />
        </Button>
      </div>

      {/* Waiters List Container */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Active Waiters & Service Staff ({waiters.length})
            </h3>
            <p className="text-3xs text-muted-foreground">
              Authorized floor servers available for KOT taking and table assignment
            </p>
          </div>
        </div>

        {waiters.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-2">
            <Users size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-bold text-sm text-foreground">No active service staff found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Staff members created in the HR Module with Waiter/Service role will automatically populate here.
            </p>
            <Button
              onClick={() => navigate({ to: "/hr" as any })}
              variant="outline"
              className="text-xs font-bold mt-2"
            >
              Go to HR Module to Add Staff
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {waiters.map((w) => (
            <div key={w.id} className="bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-4 flex items-center justify-between transition-all shadow-card hover:shadow-card-hover group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {w.code || `W${w.id}`}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors">{w.name}</h4>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1 mt-0.5">
                    <UserCheck size={11} /> Authorized Floor Staff
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
