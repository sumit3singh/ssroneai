import React, { useState, useEffect } from "react";
import { X, MessageSquare, Save, RefreshCw, CheckCircle2, AlertCircle, Phone, Mail, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";

interface CustomerInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customers?: any[];
}

interface InteractionDTO {
  id: number;
  customer_id: number;
  interaction_type: string;
  channel: string | null;
  subject: string | null;
  notes: string | null;
  sentiment: string | null;
  follow_up_date: string | null;
  is_resolved: boolean;
  created_at: string | null;
}

export function CustomerInteractionModal({ isOpen, onClose, onSuccess, customers = [] }: CustomerInteractionModalProps) {
  const [interactions, setInteractions] = useState<InteractionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_id: customers.length > 0 ? customers[0].id : 1,
    interaction_type: "feedback",
    channel: "in_person",
    sentiment: "positive",
    subject: "",
    notes: "",
    follow_up_date: "",
    is_resolved: true
  });

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const res = await api.get<InteractionDTO[]>("/business/customer-interactions");
      setInteractions(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch customer interactions:", err);
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInteractions();
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
        customer_id: Number(formData.customer_id),
        interaction_type: formData.interaction_type,
        channel: formData.channel,
        sentiment: formData.sentiment,
        subject: formData.subject.trim() || "Guest Interaction Log",
        notes: formData.notes.trim() || undefined,
        follow_up_date: formData.follow_up_date || undefined,
        is_resolved: formData.is_resolved
      };

      await api.post("/business/customer-interactions", payload);
      setSuccessMsg("Customer interaction saved to PostgreSQL CRM database!");
      setFormData({
        customer_id: customers.length > 0 ? customers[0].id : 1,
        interaction_type: "feedback",
        channel: "in_person",
        sentiment: "positive",
        subject: "",
        notes: "",
        follow_up_date: "",
        is_resolved: true
      });
      fetchInteractions();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to log interaction in database");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResolved = async (interaction: InteractionDTO) => {
    try {
      await api.put(`/business/customer-interactions/${interaction.id}`, {
        is_resolved: !interaction.is_resolved
      });
      fetchInteractions();
    } catch (err) {
      console.error("Failed to toggle resolution status", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Guest Interaction & Support Ledger
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Customer Service History, Sentiments & Follow-ups
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
              <MessageSquare size={14} className="text-primary" />
              <span>Log New Interaction / Feedback</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Guest Customer *
                </label>
                {customers.length > 0 ? (
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || `Customer #${c.id}`} ({c.phone || "No Phone"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: Number(e.target.value) })}
                    className="font-mono text-xs font-bold"
                  />
                )}
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Interaction Type *
                </label>
                <select
                  value={formData.interaction_type}
                  onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="feedback">Dining Feedback</option>
                  <option value="complaint">Service Complaint</option>
                  <option value="enquiry">Banquet / Catering Enquiry</option>
                  <option value="call">Phone Call Support</option>
                  <option value="visit">Hotel Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Communication Channel
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="in_person">In Person (Counter)</option>
                  <option value="phone">Telephone Call</option>
                  <option value="whatsapp">WhatsApp Message</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Guest Sentiment
                </label>
                <select
                  value={formData.sentiment}
                  onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="positive">Positive (Delighted)</option>
                  <option value="neutral">Neutral (Standard)</option>
                  <option value="negative">Negative (Dissatisfied)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Subject / Summary *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Complimented Rasmalai sweetness and quick service"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Follow-Up Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                Detailed Discussion Notes
              </label>
              <Input
                type="text"
                placeholder="e.g. Customer requested extra cardamom in upcoming wedding sweets booking."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-xs font-bold"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_resolved}
                  onChange={(e) => setFormData({ ...formData, is_resolved: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-2xs font-bold text-foreground">Mark as Resolved / Addressed</span>
              </label>

              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{submitting ? "Saving..." : "Log Interaction in PostgreSQL"}</span>
              </Button>
            </div>
          </form>

          {/* Interaction Records List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} className="text-primary" />
                <span>Recorded Customer Interactions</span>
              </h3>
              <button
                onClick={fetchInteractions}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Customer Ref</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Subject / Notes</th>
                    <th className="p-3">Sentiment</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {interactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No customer interactions recorded yet in PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    interactions.map((it) => (
                      <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-muted-foreground">#{it.id}</td>
                        <td className="p-3 font-mono text-2xs font-bold text-foreground">Customer #{it.customer_id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                            {it.interaction_type}
                          </span>
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground">{it.channel || "in_person"}</td>
                        <td className="p-3">
                          <div className="font-black text-foreground">{it.subject}</div>
                          {it.notes && <div className="text-3xs text-muted-foreground font-normal">{it.notes}</div>}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              it.sentiment === "positive"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : it.sentiment === "negative"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            {it.sentiment || "neutral"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleResolved(it)}
                            className={`px-2.5 py-1 rounded-lg text-3xs font-extrabold border transition-colors cursor-pointer ${
                              it.is_resolved
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            }`}
                          >
                            {it.is_resolved ? "Resolved" : "Open"}
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
