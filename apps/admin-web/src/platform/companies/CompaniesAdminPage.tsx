import React from "react";
import { Building, Plus } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";

export const CompaniesAdminPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <Building size={18} className="text-primary" />
            Company & Entity Registry
          </h2>
          <p className="text-3xs text-muted-foreground">
            Multi-company fiscal setup, GSTIN registrations, and legal entities
          </p>
        </div>
        <Button size="sm" className="bg-primary text-white font-bold gap-1 text-xs">
          <Plus size={14} /> Add Company Entity
        </Button>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl">
        <p className="text-xs font-bold text-foreground">Baithak Food Services Pvt Ltd</p>
        <p className="text-3xs text-muted-foreground">GSTIN: 07AAAAA0000A1Z5 • Currency: INR (₹)</p>
      </div>
    </div>
  );
};
