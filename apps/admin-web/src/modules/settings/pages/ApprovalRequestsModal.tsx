import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Check, Ban, Save, RefreshCw, Layers, CheckCircle2, AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { formatCurrency } from "@/shared/utils/formatters";

interface ApprovalRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ApprovalRequestDTO {
  id: number;
  entity_type: string;
  entity_id: string;
  amount: number;
  required_role: string;
  status: string;
  reason: string | null;
  created_at: string | null;
}

export function ApprovalRequestsModal({ isOpen, onClose, onSuccess }: ApprovalRequestsModalProps) {
  const [requests, setRequests] = useState<ApprovalRequestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    entity_type: "DISCOUNT",
    entity_id: "ORD-9821",
    amount: 500,
    required_role: "store_manager",
    reason: ""
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApprovalRequestDTO[]>("/business/approval-requests");
      setRequests(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch approval requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
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
        entity_type: formData.entity_type,
        entity_id: formData.entity_id.trim(),
        amount: Number(formData.amount),
        required_role: formData.required_role,
        status: "PENDING",
        reason: formData.reason.trim() || undefined
      };

      await api.post("/business/approval-requests", payload);
      setSuccessMsg("Approval request raised and recorded in PostgreSQL!");
      setFormData({
        entity_type: "DISCOUNT",
        entity_id: `REQ-${Date.now().toString().slice(-4)}`,
        amount: 500,
        required_role: "store_manager",
        reason: ""
      });
      fetchRequests();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit approval request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: number, newStatus: "APPROVED" | "REJECTED") => {
    try {
      await api.put(`/business/approval-requests/${id}`, {
        status: newStatus
      });
      fetchRequests();
    } catch (err) {
      console.error(`Failed to set approval status to ${newStatus}`, err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Enterprise Multi-Level Approval Ledger
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Maker-Checker Governance & Role-Based Financial Authorizations
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
              <ShieldCheck size={14} className="text-indigo-500" />
              <span>Submit Financial Approval Request</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Entity Classification *
                </label>
                <select
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="DISCOUNT">Special Bill Discount</option>
                  <option value="REFUND">Customer Refund / Return</option>
                  <option value="EXPENSE">Petty Cash / Store Expense</option>
                  <option value="PURCHASE_ORDER">Supplier Purchase Order</option>
                  <option value="VOID">Order Void Authorization</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Entity Reference ID *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. ORD-2026-0041"
                  value={formData.entity_id}
                  onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Impact Value / Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Required Role *
                </label>
                <select
                  value={formData.required_role}
                  onChange={(e) => setFormData({ ...formData, required_role: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="store_manager">Store / Shift Manager</option>
                  <option value="admin">Branch Administrator</option>
                  <option value="owner">Enterprise Superadmin / Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                Justification / Reason *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Authorized customer goodwill discount for delayed dessert delivery"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="text-xs font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{submitting ? "Submitting..." : "Submit for Approval"}</span>
              </Button>
            </div>
          </form>

          {/* Requests Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-indigo-500" />
                <span>Pending & Concluded Approvals ({filteredRequests.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-xl text-3xs font-extrabold border transition-colors cursor-pointer ${
                      filterStatus === st
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                ))}

                <button
                  onClick={fetchRequests}
                  className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Required Role</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Reason / Justification</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No approval requests in PostgreSQL for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-primary font-black">{r.entity_id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-muted text-foreground border border-border">
                            {r.entity_type}
                          </span>
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground">{r.required_role}</td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">
                          {r.amount ? formatCurrency(r.amount) : "₹0.00"}
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground max-w-[200px] truncate">{r.reason || "-"}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                              r.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : r.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {r.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAction(r.id, "APPROVED")}
                                className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Approve Request"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "REJECTED")}
                                className="p-1 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Reject Request"
                              >
                                <Ban size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-3xs text-muted-foreground uppercase font-semibold">Locked</span>
                          )}
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
