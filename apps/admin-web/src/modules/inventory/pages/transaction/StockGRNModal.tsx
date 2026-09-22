import React, { useState, useEffect } from "react";
import { X, Truck, Save, RefreshCw, Layers, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { formatCurrency } from "@/shared/utils/formatters";

interface StockGRNModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StockMovementDTO {
  id: number;
  product_id: number;
  product_name: string;
  unit_of_measure: string;
  movement_type: string;
  quantity: number;
  unit_cost: number | null;
  balance_after: number;
  batch_number: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string | null;
}

export function StockGRNModal({ isOpen, onClose, onSuccess }: StockGRNModalProps) {
  const [movements, setMovements] = useState<StockMovementDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_id: 1,
    quantity: 10,
    unit_cost: 100,
    batch_number: "",
    expiry_date: "",
    supplier_name: "",
    notes: ""
  });

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.get<StockMovementDTO[]>("/inventory/movements");
      setMovements(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch stock movements:", err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMovements();
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
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        unit_cost: Number(formData.unit_cost),
        batch_number: formData.batch_number.trim() || undefined,
        expiry_date: formData.expiry_date ? `${formData.expiry_date}T00:00:00` : undefined,
        supplier_name: formData.supplier_name.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      await api.post("/inventory/grn", payload);
      setSuccessMsg("Goods Receipt Note (GRN) created successfully! Stock ledger updated.");
      setFormData({
        product_id: 1,
        quantity: 10,
        unit_cost: 100,
        batch_number: "",
        expiry_date: "",
        supplier_name: "",
        notes: ""
      });
      fetchMovements();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to record GRN intake in PostgreSQL database");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Goods Receipt Note (GRN) Intake
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                PostgreSQL Material Ledger & Supplier Inward Receipt Entry
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

        {/* Modal Body */}
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

          {/* GRN Entry Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              <span>New Stock Inward Transaction</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Product ID *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Received Quantity *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Unit Cost (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Supplier Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Metro Cash & Carry, Local Farm"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Batch Code / Number
                </label>
                <Input
                  type="text"
                  placeholder="Leave empty for auto-generated"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                Internal Remarks / Notes
              </label>
              <Input
                type="text"
                placeholder="e.g. PO-8923 Quality inspected and verified"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                <span>{submitting ? "Processing Intake..." : "Commit GRN to PostgreSQL"}</span>
              </Button>
            </div>
          </form>

          {/* Recent Inward Movements Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Truck size={14} className="text-primary" />
                <span>Recent Inward Stock Movements</span>
              </h3>
              <button
                onClick={fetchMovements}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3 text-right">Inward Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Balance After</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No inward stock movements recorded yet in PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-muted-foreground">
                          {m.created_at ? new Date(m.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-3 font-black text-foreground">
                          {m.product_name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                            {m.movement_type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-2xs text-muted-foreground">
                          {m.batch_number || "-"}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 font-extrabold">
                          +{m.quantity} {m.unit_of_measure}
                        </td>
                        <td className="p-3 text-right font-mono text-muted-foreground">
                          {m.unit_cost ? formatCurrency(m.unit_cost) : "-"}
                        </td>
                        <td className="p-3 text-right font-mono text-foreground font-black">
                          {m.balance_after}
                        </td>
                        <td className="p-3 text-2xs text-muted-foreground truncate max-w-[150px]">
                          {m.notes || "-"}
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
