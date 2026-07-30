import React from "react";
import { Building2, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";

export const TenantsAdminPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            Platform Multi-Tenant Administration
          </h2>
          <p className="text-3xs text-muted-foreground">
            Manage organization tenants, database isolation schemas, and enterprise domain mappings
          </p>
        </div>
        <Button size="sm" className="bg-primary text-white font-bold gap-1 text-xs">
          <Plus size={14} /> Provision New Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-black text-sm text-foreground">BAITHAK-CORP-01</span>
            <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
              ACTIVE
            </span>
          </div>
          <p className="text-xs font-bold text-foreground">Baithak Hospitality Group Ltd.</p>
          <p className="text-3xs text-muted-foreground">Domain: baithak.corp.app • Schema: tenant_baithak_01</p>
        </div>
      </div>
    </div>
  );
};
