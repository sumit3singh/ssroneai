import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, Trash2, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface LeaveType {
  id: number;
  name: string;
  code: string;
  days_per_year: number;
  is_paid: boolean;
  carry_forward: boolean;
  max_carry_forward_days: number;
  requires_approval: boolean;
  is_active: boolean;
}

interface LeaveTypeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const LeaveTypeMasterModal: React.FC<LeaveTypeMasterModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [daysPerYear, setDaysPerYear] = useState("12");
  const [isPaid, setIsPaid] = useState(true);
  const [carryForward, setCarryForward] = useState(false);
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState("5");

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get<LeaveType[]>("/hr/leave-types");
      if (Array.isArray(res)) {
        setTypes(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load leave types from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaveTypes();
    }
  }, [isOpen]);

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Leave type name and code are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/hr/leave-types", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        days_per_year: parseFloat(daysPerYear) || 12.0,
        is_paid: isPaid,
        carry_forward: carryForward,
        max_carry_forward_days: carryForward ? parseInt(maxCarryForwardDays) || 0 : 0,
        requires_approval: true,
      });
      toast.success(`Leave policy "${name}" registered in PostgreSQL`);
      setName("");
      setCode("");
      fetchLeaveTypes();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create leave type");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLeaveType = async (id: number, typeName: string) => {
    if (!confirm(`Delete leave type "${typeName}"?`)) return;
    try {
      await api.delete(`/hr/leave-types/${id}`);
      toast.success(`Leave type "${typeName}" removed`);
      setTypes((prev) => prev.filter((t) => t.id !== id));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete leave type");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Leave Types & Policy Master</h2>
              <p className="text-xs text-muted-foreground">
                Configure annual entitlements, paid leave categories, and carry forward ceilings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Create Leave Type Form */}
          <form onSubmit={handleCreateLeaveType} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Define New Leave Type</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Policy Name</label>
                <Input
                  placeholder="e.g. Casual Leave, Sick Leave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Code</label>
                <Input
                  placeholder="e.g. CL, SL, PL"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Days per Year</label>
                <Input
                  type="number"
                  step="0.5"
                  value={daysPerYear}
                  onChange={(e) => setDaysPerYear(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="paidCheck" className="text-xs font-medium cursor-pointer">
                  Paid Leave (No salary deduction)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cfCheck"
                  checked={carryForward}
                  onChange={(e) => setCarryForward(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="cfCheck" className="text-xs font-medium cursor-pointer">
                  Carry Forward to next year
                </label>
              </div>
            </div>

            {carryForward && (
              <div className="space-y-1 pt-1 max-w-xs">
                <label className="text-[11px] font-medium text-muted-foreground">Max Carry Forward Days</label>
                <Input
                  type="number"
                  value={maxCarryForwardDays}
                  onChange={(e) => setMaxCarryForwardDays(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                <CheckCircle2 size={13} /> Save Leave Policy
              </Button>
            </div>
          </form>

          {/* Configured Leave Types List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Configured Policies ({types.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : types.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No leave policies configured yet. Register one above to establish staff leave quotas.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Policy Name</th>
                      <th className="p-2.5 text-center">Annual Quota</th>
                      <th className="p-2.5 text-center">Remuneration</th>
                      <th className="p-2.5 text-center">Carry Forward</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {types.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono font-bold text-primary">{t.code}</td>
                        <td className="p-2.5 font-medium text-foreground">{t.name}</td>
                        <td className="p-2.5 text-center font-mono font-bold">{t.days_per_year} Days</td>
                        <td className="p-2.5 text-center">
                          {t.is_paid ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                              Unpaid / LOP
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center font-mono text-muted-foreground">
                          {t.carry_forward ? `Max ${t.max_carry_forward_days}d` : "No"}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteLeaveType(t.id, t.name)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                            title="Remove Policy"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
