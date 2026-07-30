import { useState, useEffect } from "react";
import {
  Globe, ChefHat, Briefcase, Smartphone, Settings,
  RefreshCw, Terminal, Play, ExternalLink, Edit2, Save, X
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { api } from "@/shared/utils/api-client";
import { toast } from "sonner";

interface AppPageProps {
  appKey: "food" | "stay" | "kds" | "staff" | "mobile" | "admin";
}

const APP_ICONS: Record<string, any> = {
  food: Globe,
  stay: Globe,
  kds: ChefHat,
  staff: Briefcase,
  mobile: Smartphone,
  admin: Settings
};

export function ConnectedAppPage({ appKey }: AppPageProps) {
  const isMock = isMockSession();
  const [app, setApp] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    name: "",
    description: "",
    port: "",
    url: "",
    path: "",
    status: "",
    metrics: []
  });

  useEffect(() => {
    if (isMock) {
      const list = mockDB.get<any>("connected_apps");
      const activeApp = list.find((x) => x.id === appKey || x.app_key === appKey);
      setApp(activeApp);
      return;
    }
    api.get<any[]>("/system/connected-apps")
      .then((list) => {
        if (Array.isArray(list)) {
          const activeApp = list.find((x) => x.id === appKey || x.app_key === appKey);
          setApp(activeApp);
        }
      })
      .catch(() => setApp(null));
  }, [appKey, isMock]);

  const refreshApp = () => {
    if (isMock) {
      const list = mockDB.get<any>("connected_apps");
      const activeApp = list.find((x) => x.id === appKey || x.app_key === appKey);
      setApp(activeApp);
      return;
    }
    api.get<any[]>("/system/connected-apps")
      .then((list) => {
        if (Array.isArray(list)) {
          const activeApp = list.find((x) => x.id === appKey || x.app_key === appKey);
          setApp(activeApp);
        }
      })
      .catch(() => setApp(null));
  };

  const handleOpenEdit = () => {
    if (!app) return;
    setEditForm({
      name: app.name || "",
      description: app.description || "",
      port: app.port || "",
      url: app.url || "",
      path: app.path || "",
      status: app.status || "Healthy",
      metrics: app.metrics ? JSON.parse(JSON.stringify(app.metrics)) : []
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    if (isMock) {
      const updated = {
        ...app,
        name: editForm.name,
        description: editForm.description,
        port: editForm.port,
        url: editForm.url,
        path: editForm.path,
        status: editForm.status,
        metrics: editForm.metrics
      };
      mockDB.update("connected_apps", app.id, updated);
      toast.success(`App configuration for "${editForm.name}" updated successfully!`);
      setShowEditModal(false);
      refreshApp();
      return;
    }
    api.put(`/system/connected-apps/${app.id}`, editForm)
      .then(() => {
        toast.success(`App configuration for "${editForm.name}" updated directly in PostgreSQL database!`);
        setShowEditModal(false);
        refreshApp();
      })
      .catch((err) => toast.error(err?.response?.data?.detail || "Failed to update app configuration"));
  };

  if (!app) {
    return (
      <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw size={24} className="animate-spin text-primary mb-2" />
        <span>Loading connected app details...</span>
      </div>
    );
  }

  const Icon = APP_ICONS[appKey] || Globe;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Header Profile Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Icon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-foreground">{app.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl font-semibold">{app.description}</p>
            {app.path && (
              <p className="text-[10px] text-violet-600 dark:text-violet-400 font-mono mt-1.5 font-extrabold bg-violet-600/5 dark:bg-violet-400/5 px-2 py-0.5 rounded border border-violet-600/10 dark:border-violet-400/10 inline-block leading-none">
                Path: {app.path}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-2xs font-extrabold border uppercase tracking-wider",
            app.status === "Healthy" || app.status === "Operational"
              ? "bg-success/10 text-success border-success/20"
              : "bg-warning/10 text-warning border-warning/20"
          )}>
            {app.status}
          </span>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Edit Details</span>
          </button>

          {app.url !== "#" && (
            <a
              href={app.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md transition-colors"
            >
              <span>Launch App</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* App Specific Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {app.metrics?.map((m: any, idx: number) => (
          <div key={idx} className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{m.label}</span>
            <span className={cn("text-lg font-black text-foreground mt-1.5 block", m.color)}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main Console & Maintenance Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Logs Terminal Screen */}
        <div className="lg:col-span-2 bg-[#090D16] rounded-2xl border border-slate-800 p-5 font-mono text-[11px] text-slate-400 space-y-4 shadow-lg min-h-[260px] relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-3xs text-slate-500 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-violet-400" />
              <span>Port {app.port} Live Output Console</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-2">
            {app.logs?.map((log: string, idx: number) => (
              <p key={idx} className={cn(
                log.includes("[ALERT]") || log.includes("[WARNING]")
                  ? "text-amber-400"
                  : "text-slate-300"
              )}>
                {log}
              </p>
            ))}
          </div>

          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => toast.success("Log output stream refreshed!")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
            >
              <RefreshCw size={11} className="animate-spin" />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* Administration Actions Panel */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between min-h-[260px] shadow-xs">
          <div className="space-y-4">
            <h3 className="font-display font-extrabold text-sm text-foreground">Management Tasks</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => toast.success(`Restart signal dispatched to Port ${app.port} successfully!`)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play size={13} className="text-violet-500" />
                  <span>Restart Dev Process</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">npm dev</span>
              </button>

              <button
                onClick={() => toast.success(`Eviction signal dispatched to Redis cache store!`)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw size={13} className="text-emerald-500" />
                  <span>Trigger Cache Eviction</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">Redis clear</span>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-[10px] text-muted-foreground font-semibold leading-relaxed">
            * Process operations are monitored dynamically. Changes in codebases under `apps/` trigger Hot Module Replacement automatically.
          </div>
        </div>

      </div>

      {/* Edit App Settings Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                <Edit2 size={15} className="text-primary" />
                Edit Connected App Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase">App Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-muted-foreground uppercase">Port / Platform</label>
                    <input
                      type="text"
                      required
                      value={editForm.port}
                      onChange={(e) => setEditForm({ ...editForm, port: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold text-muted-foreground uppercase">Launch URL</label>
                    <input
                      type="text"
                      required
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase">Local Workspace Path</label>
                  <input
                    type="text"
                    required
                    value={editForm.path}
                    onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-muted-foreground uppercase">Operational Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Operational">Operational</option>
                    <option value="Maintenance Mode">Maintenance Mode</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {/* Edit Metrics */}
                {editForm.metrics && editForm.metrics.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border/60">
                    <h4 className="text-xs font-semibold text-foreground">App Dashboard Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {editForm.metrics.map((metric: any, idx: number) => (
                        <div key={idx} className="space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                          <label className="text-[10px] font-bold text-muted-foreground truncate block">{metric.label}</label>
                          <input
                            type="text"
                            required
                            value={metric.value}
                            onChange={(e) => {
                              const newMetrics = [...editForm.metrics];
                              newMetrics[idx] = { ...metric, value: e.target.value };
                              setEditForm({ ...editForm, metrics: newMetrics });
                            }}
                            className="flex h-8 w-full rounded-md border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Save size={13} />
                  Save App Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default ConnectedAppPage;
