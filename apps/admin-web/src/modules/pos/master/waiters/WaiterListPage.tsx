import React, { useState } from "react";
import { Users, Plus, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSWaiter } from "../../types";

interface WaiterListPageProps {
  waiters: POSWaiter[];
  onOpenCreate: () => void;
  isLoading?: boolean;
}

export const WaiterListPage: React.FC<WaiterListPageProps> = ({
  waiters,
  onOpenCreate,
  isLoading = false
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Waiters & Service Staff Master ({waiters.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Manage floor servers, staff passcodes, and order taking authorizations
          </p>
        </div>

        <Button
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus size={16} /> + Register Waiter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {waiters.map((w) => (
          <div key={w.id} className="bg-muted/30 border border-border/70 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary font-bold">
                {w.code}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-foreground">{w.name}</h4>
                <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                  <UserCheck size={11} /> Authorized Staff
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
