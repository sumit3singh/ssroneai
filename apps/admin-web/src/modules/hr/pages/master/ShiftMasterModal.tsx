import React, { useState, useEffect } from "react";
import { X, Clock, Plus, Trash2, CheckCircle2, Moon, Sun, ShieldAlert } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface Shift {
  id: number;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  is_night_shift: boolean;
  is_active: boolean;
}

interface ShiftMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ShiftMasterModal: React.FC<ShiftMasterModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [isNightShift, setIsNightShift] = useState(false);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await api.get<Shift[]>("/hr/shifts");
      if (Array.isArray(res)) {
        setShifts(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load shifts from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShifts();
    }
  }, [isOpen]);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Shift name and code are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/hr/shifts", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        start_time: startTime,
        end_time: endTime,
        grace_minutes: Number(graceMinutes) || 0,
        is_night_shift: isNightShift,
        is_active: true,
      });
      toast.success(`Shift "${name}" registered in PostgreSQL`);
      setName("");
      setCode("");
      fetchShifts();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create shift");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async (id: number, shiftName: string) => {
    if (!confirm(`Delete shift "${shiftName}"?`)) return;
    try {
      await api.delete(`/hr/shifts/${id}`);
      toast.success(`Shift "${shiftName}" removed`);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete shift");
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
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Work Shifts & Timing Master</h2>
              <p className="text-xs text-muted-foreground">
                Define operational staff rosters, grace periods, and night shift flags
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
          {/* Create Shift Form */}
          <form onSubmit={handleCreateShift} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Register New Shift</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Shift Name</label>
                <Input
                  placeholder="e.g. Morning Shift, Dinner Rush"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Shift Code</label>
                <Input
                  placeholder="e.g. MORNING, EVE, NIGHT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Grace Period (Minutes)</label>
                <Input
                  type="number"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="nightShift"
                  checked={isNightShift}
                  onChange={(e) => setIsNightShift(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="nightShift" className="text-xs font-medium cursor-pointer flex items-center gap-1">
                  <Moon size={13} className="text-indigo-400" /> Crosses Midnight (Night Shift)
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                <CheckCircle2 size={13} /> Save Shift
              </Button>
            </div>
          </form>

          {/* Existing Shifts List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Configured Shifts ({shifts.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No shifts configured yet. Create one above to organize employee duty hours.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Shift Name</th>
                      <th className="p-2.5 text-center">Timings</th>
                      <th className="p-2.5 text-center">Grace</th>
                      <th className="p-2.5 text-center">Type</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shifts.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono font-bold text-primary">{s.code}</td>
                        <td className="p-2.5 font-medium text-foreground">{s.name}</td>
                        <td className="p-2.5 text-center font-mono font-semibold">
                          {s.start_time} – {s.end_time}
                        </td>
                        <td className="p-2.5 text-center font-mono text-muted-foreground">{s.grace_minutes}m</td>
                        <td className="p-2.5 text-center">
                          {s.is_night_shift ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Night
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              Day
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteShift(s.id, s.name)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                            title="Remove Shift"
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
