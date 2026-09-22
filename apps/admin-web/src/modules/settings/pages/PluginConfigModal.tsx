import React, { useState, useEffect } from "react";
import { X, Puzzle, Save, RefreshCw, Layers, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Trash2, Key } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";

interface PluginConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PluginDTO {
  id: number;
  plugin_id: string;
  plugin_name: string;
  is_enabled: boolean;
  config_data: Record<string, any>;
  created_at: string | null;
}

export function PluginConfigModal({ isOpen, onClose, onSuccess }: PluginConfigModalProps) {
  const [plugins, setPlugins] = useState<PluginDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    plugin_id: "whatsapp-gateway",
    plugin_name: "WhatsApp Business Automated Notifications",
    is_enabled: true,
    api_key: "sk_live_wa_984128",
    endpoint_url: "https://api.whatsapp.com/v1/messages"
  });

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await api.get<PluginDTO[]>("/business/installed-plugins");
      setPlugins(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch installed plugins:", err);
      setPlugins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlugins();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        plugin_id: formData.plugin_id.trim(),
        plugin_name: formData.plugin_name.trim(),
        is_enabled: formData.is_enabled,
        config_data: {
          api_key: formData.api_key.trim(),
          endpoint_url: formData.endpoint_url.trim(),
          installed_at: new Date().toISOString()
        }
      };

      await api.post("/business/installed-plugins", payload);
      setSuccessMsg("Plugin and integration configuration saved in PostgreSQL!");
      fetchPlugins();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save plugin configuration in PostgreSQL");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePlugin = async (p: PluginDTO) => {
    try {
      await api.put(`/business/installed-plugins/${p.id}`, {
        is_enabled: !p.is_enabled
      });
      fetchPlugins();
    } catch (err) {
      console.error("Failed to toggle plugin", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/business/installed-plugins/${id}`);
      fetchPlugins();
    } catch (err) {
      console.error("Failed to uninstall plugin", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Puzzle size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Installed Integration Plugins & Gateway Connectors
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Plugin Configuration Registry & Dynamic Third-Party Connectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2.5">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <Puzzle size={14} className="text-cyan-500" />
              <span>Register / Configure Plugin</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Preset Plugin *
                </label>
                <select
                  value={formData.plugin_id}
                  onChange={(e) => {
                    const pid = e.target.value;
                    let pname = "Custom Plugin";
                    if (pid === "whatsapp-gateway") pname = "WhatsApp Business Automated Notifications";
                    else if (pid === "tally-prime-bridge") pname = "Tally Prime ERP Realtime Ledger Bridge";
                    else if (pid === "razorpay-pos") pname = "Razorpay Smart POS EDC Terminal";
                    else if (pid === "swiggy-zomato-sync") pname = "Swiggy & Zomato Live Menu & Order Sync";
                    setFormData({ ...formData, plugin_id: pid, plugin_name: pname });
                  }}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="whatsapp-gateway">WhatsApp Business Cloud API</option>
                  <option value="tally-prime-bridge">Tally Prime XML Sync Bridge</option>
                  <option value="razorpay-pos">Razorpay POS Terminal Cloud</option>
                  <option value="swiggy-zomato-sync">Food Aggregators (Swiggy / Zomato)</option>
                  <option value="custom-webhook">Custom HTTPS Webhook Bridge</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Plugin Display Name *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.plugin_name}
                  onChange={(e) => setFormData({ ...formData, plugin_name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  API Key / Secret Token
                </label>
                <Input
                  type="text"
                  placeholder="sk_live_..."
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                Webhook / Gateway Endpoint URL
              </label>
              <Input
                type="text"
                placeholder="https://..."
                value={formData.endpoint_url}
                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                className="font-mono text-xs font-bold"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-2xs font-bold text-foreground">Activate Plugin Immediately</span>
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{submitting ? "Saving..." : "Save Plugin Config"}</span>
              </Button>
            </div>
          </form>

          {/* Installed Plugins List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Puzzle size={14} className="text-cyan-500" />
                <span>Configured Tenant Plugins ({plugins.length})</span>
              </h3>
              <button
                onClick={fetchPlugins}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Plugin ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Config Endpoint</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {plugins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No plugins configured yet in PostgreSQL database.
                      </td>
                    </tr>
                  ) : (
                    plugins.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-cyan-600 dark:text-cyan-400 font-bold">
                          {p.plugin_id}
                        </td>
                        <td className="p-3 font-black text-foreground">{p.plugin_name}</td>
                        <td className="p-3 font-mono text-3xs text-muted-foreground max-w-[200px] truncate">
                          {p.config_data?.endpoint_url || "Direct Integration"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => togglePlugin(p)}
                            className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase border cursor-pointer ${
                              p.is_enabled
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {p.is_enabled ? "Enabled" : "Disabled"}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end">
          <Button variant="outline" onClick={onClose} className="font-bold text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
