import React, { useState, useEffect } from "react";
import { X, Factory, Save, RefreshCw, Layers, Calendar, CheckCircle2, AlertCircle, ChefHat } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";

interface ProductionBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductionBatchDTO {
  id: number;
  batch_number: string;
  item_type: string;
  item_id: number;
  quantity_produced: number;
  unit: string;
  production_date: string | null;
  expiry_date: string | null;
  chef_name: string | null;
  status: string;
}

export function ProductionBatchModal({ isOpen, onClose, onSuccess }: ProductionBatchModalProps) {
  const [batches, setBatches] = useState<ProductionBatchDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    item_type: "SWEET",
    item_id: 1,
    quantity_produced: 25,
    unit: "KG",
    production_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    chef_name: "",
    batch_number: ""
  });

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get<ProductionBatchDTO[]>("/inventory/production-batches");
      setBatches(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (err) {
      console.warn("Could not fetch production batches:", err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBatches();
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
        item_type: formData.item_type,
        item_id: Number(formData.item_id),
        quantity_produced: Number(formData.quantity_produced),
        unit: formData.unit.toUpperCase(),
        production_date: formData.production_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        chef_name: formData.chef_name.trim() || undefined,
        batch_number: formData.batch_number.trim() || undefined
      };

      await api.post("/inventory/production-batches", payload);
      setSuccessMsg("Production batch recorded successfully! FEFO traceability logged.");
      setFormData({
        item_type: "SWEET",
        item_id: 1,
        quantity_produced: 25,
        unit: "KG",
        production_date: new Date().toISOString().split("T")[0],
        expiry_date: "",
        chef_name: "",
        batch_number: ""
      });
      fetchBatches();
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to record production batch in PostgreSQL database");
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
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Factory size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-foreground uppercase tracking-wider">
                Daily Production Batch Execution
              </h2>
              <p className="text-2xs text-muted-foreground font-semibold">
                Kitchen, Sweet Shop & Bakery Manufacturing Ledger (FEFO/FIFO)
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

          {/* Batch Entry Form */}
          <form onSubmit={handleSubmit} className="bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
              <ChefHat size={14} className="text-amber-500" />
              <span>New Kitchen Production Run</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Item Classification *
                </label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="SWEET">Mithai / Sweet</option>
                  <option value="FOOD">Prepared Food / Curry</option>
                  <option value="BAKERY">Bakery / Confectionery</option>
                  <option value="INGREDIENT">Prepared Semi-Ingredient</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Target Item ID *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Quantity Produced *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.quantity_produced}
                  onChange={(e) => setFormData({ ...formData, quantity_produced: Number(e.target.value) })}
                  className="font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Unit of Measure *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                >
                  <option value="KG">KG (Kilograms)</option>
                  <option value="GM">GM (Grams)</option>
                  <option value="L">L (Litres)</option>
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="TRAY">TRAY (Trays)</option>
                  <option value="BOX">BOX (Boxes)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Production Date *
                </label>
                <Input
                  type="date"
                  required
                  value={formData.production_date}
                  onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Expiry / Best Before
                </label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Chef / Master Baker
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Master Chef Ramesh"
                  value={formData.chef_name}
                  onChange={(e) => setFormData({ ...formData, chef_name: e.target.value })}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold text-muted-foreground uppercase mb-1">
                  Batch Code (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  className="font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="font-extrabold text-xs flex items-center gap-2"
              >
                <Save size={14} />
                <span>{submitting ? "Logging Production..." : "Record Production Run"}</span>
              </Button>
            </div>
          </form>

          {/* Recent Production Batches Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                <Factory size={14} className="text-amber-500" />
                <span>Executed Production Batches</span>
              </h3>
              <button
                onClick={fetchBatches}
                className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Item Ref</th>
                    <th className="p-3 text-right">Produced Output</th>
                    <th className="p-3">Production Date</th>
                    <th className="p-3">Best Before</th>
                    <th className="p-3">Chef / Baker</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-bold">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs font-semibold">
                        No production batches recorded yet in PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    batches.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-2xs text-primary font-black">
                          {b.batch_number}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {b.item_type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          #{b.item_id}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 font-extrabold">
                          {b.quantity_produced} {b.unit}
                        </td>
                        <td className="p-3 font-mono text-2xs text-muted-foreground">
                          {b.production_date || "-"}
                        </td>
                        <td className="p-3 font-mono text-2xs text-muted-foreground">
                          {b.expiry_date || "-"}
                        </td>
                        <td className="p-3 text-2xs text-foreground font-extrabold">
                          {b.chef_name || "Head Chef"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {b.status}
                          </span>
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
