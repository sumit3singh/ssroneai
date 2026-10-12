import React, { useState } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Label, Input, Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import type { CustomDomainRecord } from "@ssrone/api-client";

export interface CustomDomainSettingsProps {
  domains: CustomDomainRecord[];
  onRegisterDomain: (domain: string, appName: string) => Promise<void>;
  onVerifyDomain: (domainId: string) => Promise<void>;
  onDeleteDomain: (domainId: string) => Promise<void>;
}

export const CustomDomainSettings: React.FC<CustomDomainSettingsProps> = ({
  domains,
  onRegisterDomain,
  onVerifyDomain,
  onDeleteDomain,
}) => {
  const [newDomain, setNewDomain] = useState("");
  const [appName, setAppName] = useState("customer-food-web");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsSubmitting(true);
    try {
      await onRegisterDomain(newDomain.trim(), appName);
      setNewDomain("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await onVerifyDomain(id);
    } finally {
      setVerifyingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Add Domain Form */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Globe size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Connect Custom Brand Domain</h4>
            <p className="text-xs text-muted-foreground">
              Provide a white-labeled URL (e.g. <code>order.baithakcafe.com</code>) for your customer food app.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Label className="text-xs font-semibold">Custom Subdomain or Apex Domain</Label>
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. order.baithakcafe.com"
              className="mt-1.5 text-xs font-mono h-9"
              required
            />
          </div>

          <div className="w-full sm:w-56">
            <Label className="text-xs font-semibold">Connect Application</Label>
            <select
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full mt-1.5 h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none"
            >
              <option value="customer-food-web">Customer Food Web</option>
              <option value="customer-stay-web">Customer Stay Web</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !newDomain.trim()}
            className="w-full sm:w-auto h-9 text-xs px-4 bg-primary text-primary-foreground font-bold"
          >
            <Plus size={14} className="mr-1" />
            {isSubmitting ? "Connecting..." : "Add Domain"}
          </Button>
        </form>
      </div>

      {/* 2. Registered Domains List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Configured Domains ({domains.length})
          </h4>
        </div>

        {domains.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
            <Globe size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-bold text-xs text-foreground">No Custom Domains Connected</p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Your store is currently operating under the default SSR One tenant link. Add your custom domain above for complete brand white-labeling.
            </p>
          </div>
        ) : (
          domains.map((dom) => {
            const isVerified = dom.status === "verified";
            const isFailed = dom.status === "failed";
            const targetVal = dom.dns_instruction?.target || dom.target_value || "connect.ssrone.app";

            return (
              <div
                key={dom.id}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-xs space-y-0"
              >
                {/* Domain Header Bar */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-foreground">
                        {dom.domain}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                          <CheckCircle2 size={11} /> Verified & Active
                        </span>
                      ) : isFailed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/30">
                          <AlertCircle size={11} /> DNS Incomplete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                          <RefreshCw size={10} className="animate-spin" /> Pending DNS Check
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Routing to: <strong className="text-foreground">{dom.app_name}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(dom.id)}
                      disabled={verifyingId === dom.id}
                      className="h-8 text-xs cursor-pointer"
                    >
                      <RefreshCw
                        size={12}
                        className={`mr-1.5 ${verifyingId === dom.id ? "animate-spin" : ""}`}
                      />
                      Verify DNS
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteDomain(dom.id)}
                      className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>

                {/* DNS Instructions Grid */}
                <div className="p-4 bg-card text-xs space-y-2">
                  <p className="font-semibold text-foreground text-[11px]">
                    Required DNS Record in your Domain Registrar (Cloudflare, GoDaddy, Namecheap):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-muted/40 p-2.5 rounded-lg border border-border font-mono text-[11px]">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block font-sans font-bold">
                        Type
                      </span>
                      <span className="font-bold text-foreground">
                        {dom.dns_instruction?.record_type || dom.record_type || "CNAME"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block font-sans font-bold">
                        Host / Name
                      </span>
                      <span className="font-bold text-foreground">
                        {dom.dns_instruction?.host || (dom.domain.includes(".") ? dom.domain.split(".")[0] : "@")}
                      </span>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block font-sans font-bold">
                          Points to / Target
                        </span>
                        <span className="font-bold text-primary break-all">{targetVal}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(targetVal)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="Copy target"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  {dom.error_message && (
                    <p className="text-[11px] text-rose-600 font-mono">
                      Last Check Notice: {dom.error_message}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomDomainSettings;
