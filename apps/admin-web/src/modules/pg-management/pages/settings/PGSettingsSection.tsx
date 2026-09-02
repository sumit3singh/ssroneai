import React from "react";
import { Settings, Shield, Bell, CreditCard } from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";

export const PGSettingsSection: React.FC = () => {
  return (
    <div className="bg-card p-5 rounded-md border border-border space-y-4 max-w-2xl">
      <div>
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-primary" />
          <span>PG Management Module Settings</span>
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Configure default security deposit terms, notice periods, and automated rent reminder rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Default Notice Period (Days)</label>
            <input defaultValue="30" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Grace Period Before Late Fee (Days)</label>
            <input defaultValue="5" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Per Day Late Fee Amount (₹)</label>
            <input defaultValue="100" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="pt-5">
            <Button onClick={() => toast.success("PG settings updated successfully!")} size="sm" className="w-full text-xs font-semibold">
              Save PG Rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
