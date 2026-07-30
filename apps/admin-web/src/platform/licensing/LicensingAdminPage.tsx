import React from "react";
import { Key, Shield } from "lucide-react";

export const LicensingAdminPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Key size={18} className="text-primary" />
            Enterprise Licensing & Subscriptions
          </h2>
          <p className="text-3xs text-muted-foreground">
            Module entitlement keys, active POS device licenses, and subscription tiers
          </p>
        </div>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-foreground">BAITHAK-PLATFORM-PRO-2026</span>
          <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-md">UNLIMITED NODES</span>
        </div>
      </div>
    </div>
  );
};
