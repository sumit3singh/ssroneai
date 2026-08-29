import React, { useState, useEffect } from "react";
import { CreditCard, X } from "lucide-react";
import { Input, Button } from "@ssrone/ui";

export interface PaymentModeData {
  id?: number | string;
  name: string;
  code: string;
  icon?: string;
  payment_type?: string;
  qr_code_url?: string;
  is_active?: boolean;
}

interface PaymentModeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaymentModeData) => Promise<void>;
  editingMode?: PaymentModeData | null;
}

const PAYMENT_TYPES = [
  { label: "Cash Settlement", value: "cash" },
  { label: "UPI / PhonePe / Paytm / QR", value: "upi" },
  { label: "Card POS Terminal (Credit/Debit)", value: "card" },
  { label: "Pay Later / Customer Ledger", value: "credit" },
  { label: "Bank Wire / NEFT / IMPS", value: "bank" },
];

const POPULAR_ICONS = ["💵", "📱", "💳", "📋", "🏦", "⚡", "🪙", "🔖"];

export const PaymentModeFormDialog: React.FC<PaymentModeFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMode
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [icon, setIcon] = useState("💳");
  const [paymentType, setPaymentType] = useState("cash");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingMode) {
      setName(editingMode.name || "");
      setCode(editingMode.code || "");
      setIcon(editingMode.icon || "💳");
      setPaymentType(editingMode.payment_type || "cash");
      setQrCodeUrl(editingMode.qr_code_url || "");
      setIsActive(editingMode.is_active !== false);
    } else {
      setName("");
      setCode("");
      setIcon("💳");
      setPaymentType("cash");
      setQrCodeUrl("");
      setIsActive(true);
    }
  }, [editingMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const generatedCode = code.trim().toUpperCase() || name.trim().substring(0, 6).toUpperCase();
      await onSave({
        id: editingMode?.id,
        name: name.trim(),
        code: generatedCode,
        icon: icon || "💳",
        payment_type: paymentType,
        qr_code_url: qrCodeUrl.trim() || undefined,
        is_active: isActive
      });
      onClose();
    } catch (err) {
      console.error("Error saving payment mode:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              {editingMode ? "Edit Payment Mode" : "Add New Payment Mode"}
            </h3>
            <p className="text-3xs text-muted-foreground">
              Configure settlement method, icon badge, and merchant QR URL
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Payment Mode Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingMode && !code) {
                  setCode(e.target.value.substring(0, 6).toUpperCase());
                }
              }}
              placeholder="e.g. Cash, PhonePe / Paytm, HDFC Card Machine"
              required
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Mode Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CASH, UPI, CARD"
                required
                className="h-10 text-xs font-bold font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Settlement Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Choose Mode Icon</label>
            <div className="flex items-center gap-2">
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-16 h-10 text-center text-lg font-bold"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {POPULAR_ICONS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`text-base p-1.5 rounded-xl border transition-all ${
                      icon === ic ? "bg-primary/20 border-primary" : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {paymentType === "upi" && (
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Merchant UPI ID / QR Code Link</label>
              <Input
                value={qrCodeUrl}
                onChange={(e) => setQrCodeUrl(e.target.value)}
                placeholder="e.g. baithakcafe@upi or https://qr.link"
                className="h-10 text-xs font-bold font-mono"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-xs font-bold text-foreground">Operational Status</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-lg text-2xs font-bold uppercase transition-all ${
                isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {isActive ? "🟢 Active" : "🔴 Inactive"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold">
              {isSaving ? "Saving..." : editingMode ? "Update Mode" : "Create Mode"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
