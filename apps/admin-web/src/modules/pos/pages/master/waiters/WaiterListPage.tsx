import React from "react";
import { Users, UserCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
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
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Waiters & Service Staff Master"
        description="Authorized floor servers available for KOT taking and table assignment"
        icon={<Users size={18} />}
        badge={`${waiters.length} Staff`}
        actions={
          <Button
            onClick={() => navigate({ to: "/hr" as any })}
            size="sm"
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            Manage Staff in HR <ArrowRight size={14} />
          </Button>
        }
      />

      {/* SSOT Governance Banner */}
      <div className="bg-muted/40 border border-border rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground uppercase tracking-wider text-xs">
              Single Source of Truth: HR & Staff Master
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Staff created in HR automatically gain POS order-taking authorization.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate({ to: "/hr" as any })}
          variant="outline"
          size="sm"
          className="text-xs font-medium shrink-0"
        >
          Open HR Module
        </Button>
      </div>

      {/* Waiters List Container */}
      {waiters.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-md space-y-2">
          <Users size={28} className="mx-auto text-muted-foreground/50" />
          <p className="font-semibold text-xs text-foreground">No active service staff found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Staff members created in the HR Module with Waiter/Service role will automatically populate here.
          </p>
          <Button
            onClick={() => navigate({ to: "/hr" as any })}
            variant="outline"
            size="sm"
            className="text-xs font-medium mt-1"
          >
            Go to HR Module
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {waiters.map((w) => (
            <div key={w.id} className="bg-card border border-border hover:border-primary/40 rounded-md p-3 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-muted text-foreground font-mono font-semibold text-xs flex items-center justify-center border border-border shrink-0">
                  {w.code || `W${w.id}`}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-foreground truncate">{w.name}</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                    <UserCheck size={11} /> Authorized Floor Staff
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
