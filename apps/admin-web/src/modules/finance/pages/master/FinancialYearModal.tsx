import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface FinancialYear {
  id: number;
  name: string;
  code: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface FinancialYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const FinancialYearModal: React.FC<FinancialYearModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [fys, setFys] = useState<FinancialYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("FY 2026-27");
  const [code, setCode] = useState("2026-2027");
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2027-03-31");

  const fetchFYs = async () => {
    try {
      setLoading(true);
      const res = await api.get<FinancialYear[]>("/finance/financial-years");
      if (Array.isArray(res)) {
        setFys(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load financial years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFYs();
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/finance/financial-years", {
        name: name.trim(),
        code: code.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: true,
      });
      toast.success(`Financial year "${name}" created!`);
      fetchFYs();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create financial year");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, fyName: string) => {
    if (!confirm(`Delete financial year "${fyName}"?`)) return;
    try {
      await api.delete(`/finance/financial-years/${id}`);
      toast.success(`Financial year "${fyName}" deleted`);
      setFys((prev) => prev.filter((f) => f.id !== id));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete financial year");
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
              <h2 className="text-base font-bold text-foreground">Financial Years & Periods Master</h2>
              <p className="text-xs text-muted-foreground">
                Establish accounting years, period boundaries, and fiscal lock milestones
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
          {/* Create Form */}
          <form onSubmit={handleCreate} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Register New Fiscal Year</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Year Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. FY 2026-27"
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Unique Code</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                <CheckCircle2 size={13} /> Save Financial Year
              </Button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Configured Financial Years ({fys.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : fys.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No financial years configured yet. Create one above to establish your accounting cycle.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Year Name</th>
                      <th className="p-2.5 text-center">Start Date</th>
                      <th className="p-2.5 text-center">End Date</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fys.map((f) => (
                      <tr key={f.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono font-bold text-primary">{f.code}</td>
                        <td className="p-2.5 font-medium text-foreground">{f.name}</td>
                        <td className="p-2.5 text-center font-mono">{f.start_date || "--"}</td>
                        <td className="p-2.5 text-center font-mono">{f.end_date || "--"}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                            Active
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDelete(f.id, f.name)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                            title="Delete Financial Year"
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
