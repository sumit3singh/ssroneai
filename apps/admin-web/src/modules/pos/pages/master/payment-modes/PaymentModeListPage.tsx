import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Edit2, Trash2, RefreshCw, CheckCircle2, QrCode } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
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
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Payment Modes Master"
        description="Configure settlement methods, merchant QR codes, and card gateway integrations"
        icon={<CreditCard size={18} />}
        badge={`${modes.length} Modes`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchModes}
              disabled={isLoading}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Payment Modes"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
            <Button
              onClick={() => {
                setEditingMode(null);
                setIsDialogOpen(true);
              }}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Add Payment Mode
            </Button>
          </div>
        }
      />

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Payment Modes</span>
            <div className="p-1 rounded bg-muted text-muted-foreground"><CreditCard size={15} /></div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{modes.length}</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Methods</span>
            <div className="p-1 rounded bg-muted text-muted-foreground"><CheckCircle2 size={15} /></div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{activeCount} Enabled</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Digital / UPI Gateways</span>
            <div className="p-1 rounded bg-muted text-muted-foreground"><QrCode size={15} /></div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{upiCount} Gateways</div>
        </div>
      </div>

      {/* Empty State */}
      {modes.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-md space-y-2">
          <CreditCard size={28} className="mx-auto text-muted-foreground/50" />
          <p className="font-semibold text-xs text-foreground">No payment modes created yet</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Click "+ Add Payment Mode" above to create your first settlement method.
          </p>
        </div>
      )}

      {/* Payment Modes Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((m) => (
          <div
            key={m.id || m.code}
            className="bg-card border border-border hover:border-primary/40 rounded-md p-3 flex flex-col justify-between h-24 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.icon || "💳"}</span>
                <div>
                  <h4 className="font-semibold text-xs text-foreground truncate">
                    {m.name}
                  </h4>
                  <span className="text-[9px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border inline-block uppercase">
                    {m.code}
                  </span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                  m.is_active !== false
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {m.is_active !== false ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {m.payment_type || "Cash"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingMode(m);
                    setIsDialogOpen(true);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                  title="Edit Payment Mode"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => m.id && handleDeleteMode(m.id, m.name)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                  title="Delete Payment Mode"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Dialog */}
      <PaymentModeFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveMode}
        editingMode={editingMode}
      />
    </PageContainer>
  );
};
