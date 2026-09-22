import React, { useState, useEffect } from "react";
import { X, Plus, ShieldCheck, Clock, Phone, User, CheckCircle2, RefreshCw, LogOut } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

interface Resident {
  id: number;
  full_name: string;
  phone?: string | null;
}

interface VisitorLog {
  id: number;
  resident_id?: number | null;
  visitor_name: string;
  visitor_phone: string;
  check_in_time: string;
  check_out_time?: string | null;
}

interface PGVisitorLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisitorUpdated?: () => void;
}

export function PGVisitorLogModal({ isOpen, onClose, onVisitorUpdated }: PGVisitorLogModalProps) {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    resident_id: "",
    visitor_name: "",
    visitor_phone: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vRes, rRes] = await Promise.all([
        api.get<any[]>("/pg/visitors").catch(() => []),
        api.get<any[]>("/pg/residents").catch(() => []),
      ]);

      setVisitors(Array.isArray(vRes) ? vRes : []);
      setResidents(Array.isArray(rRes) ? rRes : []);
    } catch (err) {
      console.error("Failed to load visitor logs", err);
      toast.error("Could not load visitor logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitor_name.trim() || !formData.visitor_phone.trim()) {
      toast.error("Please enter visitor name and contact number");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/pg/visitors", {
        resident_id: formData.resident_id ? Number(formData.resident_id) : null,
        visitor_name: formData.visitor_name.trim(),
        visitor_phone: formData.visitor_phone.trim(),
      });

      toast.success(`Visitor Gatepass issued for ${formData.visitor_name}`);
      setFormData({ resident_id: "", visitor_name: "", visitor_phone: "" });
      await fetchData();
      if (onVisitorUpdated) onVisitorUpdated();
    } catch (err: any) {
      console.error("Failed to log visitor", err);
      toast.error(err?.message || "Failed to issue visitor pass");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (v: VisitorLog) => {
    try {
      await api.patch(`/pg/visitors/${v.id}/checkout`);
      toast.success(`Visitor ${v.visitor_name} checked out`);
      await fetchData();
      if (onVisitorUpdated) onVisitorUpdated();
    } catch (err) {
      toast.error("Failed to check out visitor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">PG Security & Visitor Gatepass Logs</h2>
              <p className="text-xs text-muted-foreground">Log visitor entry, resident approvals, and gate checkouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visitor Pass Form */}
          <form onSubmit={handleCheckInSubmit} className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Issue New Visitor Gatepass</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.visitor_name}
                  onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Visitor Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9812345678"
                  value={formData.visitor_phone}
                  onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Visiting Resident</label>
                <select
                  value={formData.resident_id}
                  onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">General Visitor / Official</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.phone || "Resident"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="h-8 text-xs font-medium px-4">
                {isSubmitting ? "Issuing Pass..." : "Issue Gatepass Check-In"}
              </Button>
            </div>
          </form>

          {/* Visitor List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>ACTIVE & RECENT VISITOR LOGS ({visitors.length})</span>
              <button
                type="button"
                onClick={fetchData}
                className="flex items-center gap-1 hover:text-foreground text-[11px] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Sync DB</span>
              </button>
            </div>

            {isLoading && visitors.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Loading visitor logs from database...
              </div>
            ) : visitors.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No visitor activity logged today. Issue visitor pass using the form above.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {visitors.map((v) => {
                  const isCheckedOut = Boolean(v.check_out_time);

                  return (
                    <div key={v.id} className="p-3 bg-card hover:bg-muted/30 flex items-center justify-between gap-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCheckedOut ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{v.visitor_name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {v.visitor_phone}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isCheckedOut
                                ? "bg-muted text-muted-foreground border border-border"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}>
                              {isCheckedOut ? "Checked Out" : "Inside Premises"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" /> In: {new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {v.check_out_time && (
                              <span className="font-mono">
                                Out: {new Date(v.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {!isCheckedOut && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckOut(v)}
                            className="h-7 text-xs font-medium px-3 gap-1 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/20"
                          >
                            <LogOut className="w-3 h-3" /> Check Out
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
