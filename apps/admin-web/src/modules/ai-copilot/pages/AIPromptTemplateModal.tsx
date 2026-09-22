import React, { useState, useEffect } from "react";
import { X, Sparkles, Save, RefreshCw, Layers, CheckCircle2, AlertCircle, Trash2, Terminal, Tag } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";

interface AIPromptTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PromptTemplateDTO {
  id: number;
  name: string;
  category: string;
  agent_type: string;
  system_prompt: string;
  user_prompt_template: string;
  variables: string[];
  version: number;
  is_active: boolean;
  usage_count: number;
}

export function AIPromptTemplateModal({ isOpen, onClose, onSuccess }: AIPromptTemplateModalProps) {
  const [templates, setTemplates] = useState<PromptTemplateDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "billing",
    agent_type: "copilot",
    system_prompt: "You are an intelligent billing copilot. Answer queries and format invoice breakdowns accurately.",
    user_prompt_template: "Analyze order items for invoice #{order_id}: {items}",
    variables_raw: "order_id, items",
    version: 1,
    is_active: true
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get<PromptTemplateDTO[]>("/business/ai-prompt-templates");
      setTemplates(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch prompt templates:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
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
      const varList = formData.variables_raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        agent_type: formData.agent_type,
        system_prompt: formData.system_prompt.trim(),
        user_prompt_template: formData.user_prompt_template.trim(),
        variables: varList,
        version: Number(formData.version),
        is_active: formData.is_active
      };

      await api.post("/business/ai-prompt-templates", payload);
      setSuccessMsg("AI Prompt Template saved to PostgreSQL database!");
      setFormData({
        name: "",
        category: "billing",
        agent_type: "copilot",
        system_prompt: "You are an intelligent ERP agent. Answer concisely.",
        user_prompt_template: "Query details for {param}",
        variables_raw: "param",
        version: 1,
        is_active: true
      });
      fetchTemplates();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save prompt template in PostgreSQL");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/business/ai-prompt-templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error("Failed to delete prompt template", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Enterprise AI Prompt Template Studio
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL System & User Prompt Engineering Engine
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
              <Terminal size={14} className="text-primary" />
              <span>Design Prompt Template</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Template Name *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. POS Bill Summary & Upsell Prompt"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Domain Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="billing">POS & Billing</option>
                  <option value="hotel">Hotel PMS & Booking</option>
                  <option value="crm">Guest CRM & Feedback</option>
                  <option value="inventory">Inventory & Stock</option>
                  <option value="chef">Kitchen & Recipe Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Agent Persona *
                </label>
                <select
                  value={formData.agent_type}
                  onChange={(e) => setFormData({ ...formData, agent_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="copilot">Conversational Copilot</option>
                  <option value="summarizer">Report Summarizer</option>
                  <option value="recommender">Menu Recommender</option>
                  <option value="auditor">Fiscal Audit Agent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                System Directive / Prompt *
              </label>
              <textarea
                required
                rows={2}
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                className="w-full bg-card border border-border rounded-xl p-3 text-xs font-mono font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                User Prompt Template (with placeholders) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.user_prompt_template}
                onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                className="w-full bg-card border border-border rounded-xl p-3 text-xs font-mono font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Variable Keys (Comma Separated)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. order_id, items, guest_name"
                  value={formData.variables_raw}
                  onChange={(e) => setFormData({ ...formData, variables_raw: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-2xs font-bold text-foreground">Active in Agent Production Runtime</span>
                </label>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="font-extrabold text-xs flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>{submitting ? "Saving..." : "Save Prompt Template"}</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Prompt Templates Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span>Configured Prompt Templates ({templates.length})</span>
              </h3>
              <button
                onClick={fetchTemplates}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Template Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Persona</th>
                    <th className="p-3">Prompt Excerpt</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No AI prompt templates configured yet in PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    templates.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-black text-foreground">{t.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                            {t.category}
                          </span>
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground">{t.agent_type}</td>
                        <td className="p-3 font-mono text-3xs text-muted-foreground max-w-[200px] truncate">
                          {t.user_prompt_template}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              t.is_active
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {t.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDelete(t.id)}
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
