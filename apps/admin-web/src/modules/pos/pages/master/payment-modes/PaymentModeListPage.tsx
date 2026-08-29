import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Edit2, Trash2, RefreshCw, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { PaymentModeFormDialog, PaymentModeData } from "./PaymentModeFormDialog";

export const PaymentModeListPage: React.FC = () => {
  const [modes, setModes] = useState<PaymentModeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<PaymentModeData | null>(null);

  const fetchModes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaymentModeData[]>("/restaurant/payment-modes");
      if (Array.isArray(res)) {
        setModes(res);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment modes:", err);
      toast.error("Failed to load payment modes from server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, []);

  const handleSaveMode = async (data: PaymentModeData) => {
    try {
      if (data.id) {
        await api.put(`/restaurant/payment-modes/${data.id}`, data);
        toast.success(`Payment mode "${data.name}" updated successfully!`);
      } else {
        await api.post("/restaurant/payment-modes", data);
        toast.success(`Payment mode "${data.name}" created successfully!`);
      }
      await fetchModes();
    } catch (err: any) {
      console.error("Failed to save payment mode:", err);
      const msg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to save payment mode";
      toast.error(msg);
    }
  };

  const handleDeleteMode = async (id: number | string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete payment mode "${name}"?`)) return;
    try {
      await api.delete(`/restaurant/payment-modes/${id}`);
      toast.success(`Payment mode "${name}" deleted successfully!`);
      await fetchModes();
    } catch (err: any) {
      console.error("Failed to delete payment mode:", err);
      const msg = err?.response?.data?.detail || err?.detail || err?.message || "Failed to delete payment mode";
      toast.error(msg);
    }
  };

  const activeCount = modes.filter((m) => m.is_active !== false).length;
  const upiCount = modes.filter((m) => m.payment_type === "upi").length;

  return (
    <div className="space-y-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Total Payment Modes</p>
            <h4 className="font-display font-black text-xl text-foreground mt-0.5">{modes.length}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Active Methods</p>
            <h4 className="font-display font-black text-xl text-emerald-500 mt-0.5">{activeCount} Enabled</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Digital / UPI Gateways</p>
            <h4 className="font-display font-black text-xl text-violet-500 mt-0.5">{upiCount} Gateways</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
            <QrCode size={18} />
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              Payment Modes Master ({modes.length})
            </h3>
            <p className="text-3xs text-muted-foreground">
              Configure settlement methods, merchant QR codes, and card gateway integrations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchModes}
              disabled={isLoading}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh Payment Modes"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin text-primary" : ""} />
            </button>
            <Button
              onClick={() => {
                setEditingMode(null);
                setIsDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> + Add Payment Mode
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {modes.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-2">
            <CreditCard size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-bold text-sm text-foreground">No payment modes created yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Click "+ Add Payment Mode" above to create your first settlement method.
            </p>
          </div>
        )}

        {/* Payment Modes Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {modes.map((m) => (
            <div
              key={m.id || m.code}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 flex flex-col justify-between h-28 transition-all shadow-card hover:shadow-card-hover group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon || "💳"}</span>
                  <div>
                    <h4 className="font-display font-black text-sm text-foreground group-hover:text-primary transition-colors">
                      {m.name}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-0.5 uppercase">
                      {m.code}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                    m.is_active !== false
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  }`}
                >
                  {m.is_active !== false ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between text-2xs font-mono text-muted-foreground pt-2 border-t border-border/50">
                <span className="text-3xs font-bold text-muted-foreground uppercase">
                  {m.payment_type || "Cash"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingMode(m);
                      setIsDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    title="Edit Payment Mode"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => m.id && handleDeleteMode(m.id, m.name)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Payment Mode"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Dialog */}
      <PaymentModeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveMode}
        editingMode={editingMode}
      />
    </div>
  );
};
