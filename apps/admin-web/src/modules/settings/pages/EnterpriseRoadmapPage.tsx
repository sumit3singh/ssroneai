/**
 * SSR One AI – Enterprise Roadmap Page Component
 */
import React from "react";
import { Compass, ShieldCheck, Zap, Layers } from "lucide-react";

export function EnterpriseRoadmapPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Enterprise Strategic Roadmap</h1>
        <p className="text-sm text-muted-foreground">
          Platform architectural roadmap, feature entitlement rules, and multi-tenant release schedules.
        </p>
      </div>

      <div className="border rounded-xl bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
          <Compass className="w-7 h-7 text-primary" />
          <div>
            <h2 className="font-semibold text-lg">Platform Architecture & Release Standards</h2>
            <p className="text-xs text-muted-foreground">Single source of truth REST API Gateway & multi-tenant PostgreSQL Row-Level Security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
          <div className="p-4 border rounded-xl bg-muted/20 space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Multi-Tenant Boundaries
            </div>
            <p className="text-xs text-muted-foreground">
              Superadmin tenant provisioning is isolated in <code className="bg-muted px-1 rounded">apps/platform-admin</code>. Business operations execute inside <code className="bg-muted px-1 rounded">apps/admin-web</code> under tenant RLS.
            </p>
          </div>

          <div className="p-4 border rounded-xl bg-muted/20 space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> 6 Monorepo Applications
            </div>
            <p className="text-xs text-muted-foreground">
              admin-web, platform-admin, customer-food-web, customer-stay-web, kds-web, staff-web.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseRoadmapPage;
