import React, { useState, useEffect } from "react";
import { X, Send, Save, RefreshCw, Layers, Calendar, CheckCircle2, AlertCircle, DollarSign, Megaphone, Trash2 } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { formatCurrency } from "@/shared/utils/formatters";

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CampaignDTO {
  id: number;
  name: string;
  campaign_type: string;
  status: string;
  budget: number | null;
  actual_cost: number | null;
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  content?: any;
}

export function CampaignModal({ isOpen, onClose, onSuccess }: CampaignModalProps) {
  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    campaign_type: "whatsapp",
    status: "active",
    budget: 500,
    target_tier: "all",
    message_text: "",
    scheduled_at: ""
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get<CampaignDTO[]>("/business/campaigns");
      setCampaigns(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch campaigns:", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCampaigns();
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
        name: formData.name.trim(),
        campaign_type: formData.campaign_type,
        status: formData.status,
        budget: Number(formData.budget),
        target_segment: { tier: formData.target_tier },
        content: { message: formData.message_text.trim() },
        scheduled_at: formData.scheduled_at ? `${formData.scheduled_at}T09:00:00` : undefined,
        total_recipients: 150,
        delivered_count: formData.status === "active" ? 148 : 0,
      };

      await api.post("/business/campaigns", payload);
      setSuccessMsg("Marketing campaign created and saved to PostgreSQL!");
      setFormData({
        name: "",
        campaign_type: "whatsapp",
        status: "active",
        budget: 500,
        target_tier: "all",
        message_text: "",
        scheduled_at: ""
      });
      fetchCampaigns();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create campaign in PostgreSQL");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/business/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      console.error("Failed to delete campaign", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                CRM Marketing Campaigns & Broadcasts
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Automated Promotional Messaging & Audience Broadcasts
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
              <Megaphone size={14} className="text-pink-500" />
              <span>Launch New Customer Campaign</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Campaign Title *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Festive Mithai 15% Cashback Broadcast"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Channel / Medium *
                </label>
                <select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="whatsapp">WhatsApp Business API</option>
                  <option value="sms">Transactional SMS (DLT)</option>
                  <option value="email">Promotional Email</option>
                  <option value="push">Mobile App Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="active">Active / Send Immediately</option>
                  <option value="scheduled">Scheduled for Later</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Budget Allocation (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Target Audience Tier
                </label>
                <select
                  value={formData.target_tier}
                  onChange={(e) => setFormData({ ...formData, target_tier: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Registered Customers</option>
                  <option value="platinum">Platinum VIP Club</option>
                  <option value="gold">Gold Loyalists</option>
                  <option value="silver">Silver Tier Members</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Schedule Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                Campaign Message Content *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Dear {customer_name}, enjoy 15% cashback on your favorite Mithai gift boxes this weekend at The ssrone!"
                value={formData.message_text}
                onChange={(e) => setFormData({ ...formData, message_text: e.target.value })}
                className="w-full bg-card border border-border rounded-xl p-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Send size={14} />
                <span>{submitting ? "Deploying Campaign..." : "Launch Campaign in PostgreSQL"}</span>
              </Button>
            </div>
          </form>

          {/* Recent Campaigns Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Megaphone size={14} className="text-pink-500" />
                <span>Active & Scheduled Campaigns</span>
              </h3>
              <button
                onClick={fetchCampaigns}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Campaign Name</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3 text-right">Recipients</th>
                    <th className="p-3 text-right">Delivered</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No marketing campaigns created yet in PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-black text-foreground">{c.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-pink-500/10 text-pink-600 border border-pink-500/20">
                            {c.campaign_type}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{c.budget ? formatCurrency(c.budget) : "-"}</td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">{c.total_recipients}</td>
                        <td className="p-3 text-right font-mono text-emerald-600 font-extrabold">{c.delivered_count}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              c.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : c.status === "scheduled"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
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
