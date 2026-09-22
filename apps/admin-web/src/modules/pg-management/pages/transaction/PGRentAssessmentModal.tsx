import React, { useState, useEffect } from "react";
import { X, Plus, DollarSign, CheckCircle2, Calendar, User, RefreshCw, AlertCircle, IndianRupee } from "lucide-react";
import { Button, Input, Badge } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";

interface Resident {
  id: number;
  full_name: string;
  phone?: string | null;
  bed_number?: string | null;
}

interface RentRecord {
  id: number;
  resident_id: number;
  resident_name: string;
  rent_month: string;
  amount: number;
  paid_amount: number;
  status: "PAID" | "PARTIALLY_PAID" | "UNPAID" | "OVERDUE" | string;
}

interface PGRentAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRentUpdated?: () => void;
}

export function PGRentAssessmentModal({ isOpen, onClose, onRentUpdated }: PGRentAssessmentModalProps) {
  const [records, setRecords] = useState<RentRecord[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [formData, setFormData] = useState({
    resident_id: "",
    rent_month: currentMonthStr,
    amount: 8500,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recRes, resRes] = await Promise.all([
        api.get<any[]>("/pg/rent-records").catch(() => []),
        api.get<any[]>("/pg/residents").catch(() => []),
      ]);

      setRecords(Array.isArray(recRes) ? recRes : []);
      setResidents(Array.isArray(resRes) ? resRes : []);

      if (Array.isArray(resRes) && resRes.length > 0 && !formData.resident_id) {
        setFormData((prev) => ({ ...prev, resident_id: String(resRes[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load rent records", err);
      toast.error("Could not load rent records");
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

  const handleAssessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resident_id || !formData.rent_month) {
      toast.error("Please select a resident and billing month");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/pg/rent-records/assess", {
        resident_id: Number(formData.resident_id),
        rent_month: formData.rent_month,
        amount: Number(formData.amount),
      });

      toast.success("Rent assessed successfully in PostgreSQL");
      await fetchData();
      if (onRentUpdated) onRentUpdated();
    } catch (err: any) {
      console.error("Failed to assess rent", err);
      toast.error(err?.message || "Failed to assess rent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectPayment = async (record: RentRecord) => {
    const remaining = record.amount - record.paid_amount;
    if (remaining <= 0) return;

    try {
      await api.post("/pg/rent/collect", {
        resident_id: record.resident_id,
        rent_month: record.rent_month,
        amount: remaining,
        payment_mode: "UPI",
      });

      toast.success(`Collected ₹${remaining} from ${record.resident_name}`);
      await fetchData();
      if (onRentUpdated) onRentUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to record payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">PG Rent Assessment & Ledger</h2>
              <p className="text-xs text-muted-foreground">Assess monthly hostel rent and collect resident dues</p>
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
          {/* Assessment Form */}
          <form onSubmit={handleAssessSubmit} className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Generate Monthly Rent Due</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Select Resident *</label>
                <select
                  required
                  value={formData.resident_id}
                  onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Resident</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.full_name} ({r.phone || "No Phone"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Billing Month (YYYY-MM) *</label>
                <input
                  type="month"
                  required
                  value={formData.rent_month}
                  onChange={(e) => setFormData({ ...formData, rent_month: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Rent Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={100}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isSubmitting} className="h-8 text-xs font-medium px-4">
                {isSubmitting ? "Assessing..." : "Assess Monthly Rent"}
              </Button>
            </div>
          </form>

          {/* Rent Ledger List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>RENT ASSESSMENT RECORDS ({records.length})</span>
              <button
                type="button"
                onClick={fetchData}
                className="flex items-center gap-1 hover:text-foreground text-[11px] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Sync DB</span>
              </button>
            </div>

            {isLoading && records.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                Loading rent records from database...
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No rent assessments generated yet. Assess rent for residents above.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                {records.map((r) => {
                  const remaining = r.amount - r.paid_amount;
                  const isPaid = r.status === "PAID" || remaining <= 0;

                  return (
                    <div key={r.id} className="p-3 bg-card hover:bg-muted/30 flex items-center justify-between gap-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isPaid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {r.rent_month.slice(5)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{r.resident_name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {r.rent_month}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            Due: {formatCurrency(r.amount)} | Paid: {formatCurrency(r.paid_amount)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleCollectPayment(r)}
                            className="h-7 text-xs font-semibold px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Collect ₹{remaining}
                          </Button>
                        )}
                        {isPaid && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
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
