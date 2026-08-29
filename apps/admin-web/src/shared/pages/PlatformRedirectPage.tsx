/**
 * SSR One AI – Superadmin Platform Admin Portal Redirect
 * Directs tenant users to the dedicated Platform Admin App (apps/platform-admin) for tenant provisioning.
 */
import React from "react";
import { ShieldAlert, ExternalLink, Building2, Key, Server } from "lucide-react";

export function PlatformRedirectPage() {
  const platformAdminUrl = "http://localhost:8084"; // Port for platform-admin app

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="border rounded-2xl bg-card p-8 shadow-lg text-center space-y-4 border-primary/20">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Platform Superadmin Console
        </h1>

        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Tenant provisioning, company & branch creation, platform licensing keys, and Row-Level Security (RLS) policies are managed exclusively in the dedicated <span className="font-semibold text-foreground">Platform Admin Portal</span> (<code className="text-xs bg-muted px-1.5 py-0.5 rounded">apps/platform-admin</code>).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 border rounded-xl bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Building2 className="w-4 h-4 text-primary" /> Tenant Isolation
            </div>
            <p className="text-xs text-muted-foreground">Provision new enterprise tenants and configure PostgreSQL RLS isolation.</p>
          </div>

          <div className="p-4 border rounded-xl bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Key className="w-4 h-4 text-amber-500" /> License Provisioning
            </div>
            <p className="text-xs text-muted-foreground">Generate subscription keys, tier entitlements, and server-side feature gates.</p>
          </div>

          <div className="p-4 border rounded-xl bg-muted/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Server className="w-4 h-4 text-emerald-500" /> Cluster Audit
            </div>
            <p className="text-xs text-muted-foreground">Monitor platform telemetry, error traces, and active microservices.</p>
          </div>
        </div>

        <div className="pt-4">
          <a
            href={platformAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            Launch Platform Admin Portal <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default PlatformRedirectPage;
