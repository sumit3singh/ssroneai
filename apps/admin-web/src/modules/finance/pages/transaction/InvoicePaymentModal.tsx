import React, { useState } from "react";
import { X, DollarSign, CheckCircle2, CreditCard } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface InvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: {
    id: number;
    invoice_number: string;
    customer_name: string;
    balance_due: number;
  } | null;
  onSuccess?: () => void;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>(
    invoice?.balance_due ? String(invoice.balance_due) : "0"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.balance_due));
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      const res: any = await api.post(`/finance/invoices/${invoice.id}/payment`, {
        amount: payAmt,
        payment_method: paymentMethod,
        reference_number: referenceNumber.trim() || null,
        notes: notes.trim() || null,
      });
      toast.success(res?.message || "Payment recorded successfully in PostgreSQL!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Record Invoice Payment</h2>
              <p className="text-xs text-muted-foreground font-mono">
                {invoice.invoice_number} – {invoice.customer_name}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-muted/30 border border-border rounded-lg flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Balance Due:</span>
            <span className="font-mono font-bold text-rose-500 text-sm">
              ₹{invoice.balance_due.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Payment Amount (₹)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Payment Mode</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI / QR Code</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Corporate Credit Card</option>
              <option value="Cash">Cash Settlement</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">UTR / Transaction Ref #</label>
            <Input
              placeholder="e.g. UTR-991204859"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Notes / Remarks</label>
            <Input
              placeholder="e.g. Full settlement received in HDFC account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Confirm Receipt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
