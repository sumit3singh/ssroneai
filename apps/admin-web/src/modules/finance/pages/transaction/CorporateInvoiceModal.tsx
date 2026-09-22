import React, { useState } from "react";
import { X, Receipt, Plus, Trash2, CheckCircle2, Building2 } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface InvoiceLineItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface CorporateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CorporateInvoiceModal: React.FC<CorporateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { item_name: "Corporate Catering Services", quantity: 1, unit_price: 15000, tax_rate: 18 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { item_name: "", quantity: 1, unit_price: 0, tax_rate: 18 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("An invoice requires at least one line item");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
  const totalTax = items.reduce((sum, it) => {
    const lineSub = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
    return sum + lineSub * ((Number(it.tax_rate) || 0) / 100);
  }, 0);
  const grandTotal = subtotal + totalTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer / Company name is required");
      return;
    }
    const validItems = items.filter((it) => it.item_name.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a valid description");
      return;
    }

    try {
      setSaving(true);
      const res: any = await api.post("/finance/invoices", {
        customer_name: customerName.trim(),
        customer_gstin: customerGstin.trim() || null,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        notes: notes.trim() || null,
        items: validItems.map((it) => ({
          item_name: it.item_name.trim(),
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          tax_rate: Number(it.tax_rate) || 18,
        })),
      });
      toast.success(res?.message || "Corporate invoice generated successfully!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create Corporate Tax Invoice</h2>
              <p className="text-xs text-muted-foreground">
                Generate GST-compliant B2B & corporate client invoices with custom line items
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Client / Company Name</label>
              <Input
                placeholder="e.g. Infosys Ltd, TCS Corporate Guest"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Client GSTIN (Optional)</label>
              <Input
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                className="text-xs h-9 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Invoice Date</label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Invoice Line Items</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                className="text-xs h-7 gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Item
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-2.5">Item / Service Description</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5 w-28 text-right">Price (₹)</th>
                    <th className="p-2.5 w-24 text-center">GST %</th>
                    <th className="p-2.5 w-28 text-right">Total (₹)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it, idx) => {
                    const lineSub = (Number(it.quantity) || 0) * (Number(it.unit_price) || 0);
                    const lineTotal = lineSub * (1 + (Number(it.tax_rate) || 0) / 100);
                    return (
                      <tr key={idx}>
                        <td className="p-2">
                          <Input
                            placeholder="Description"
                            value={it.item_name}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].item_name = e.target.value;
                              setItems(updated);
                            }}
                            className="text-xs h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0.1"
                            step="1"
                            value={it.quantity}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].quantity = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="text-xs h-8 font-mono text-center"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={it.unit_price}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].unit_price = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="text-xs h-8 font-mono text-right"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={it.tax_rate}
                            onChange={(e) => {
                              const updated = [...items];
                              updated[idx].tax_rate = Number(e.target.value);
                              setItems(updated);
                            }}
                            className="w-full h-8 px-1 rounded border border-border bg-background text-xs text-foreground font-mono text-center"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-foreground">
                          ₹{lineTotal.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-muted-foreground hover:text-destructive cursor-pointer border-none bg-transparent"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Summary Breakdown */}
            <div className="p-3 bg-muted/40 border border-border rounded-lg flex flex-col items-end gap-1 text-xs font-mono">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Taxable Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Estimated GST (18%):</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex gap-4 text-sm font-bold border-t border-border pt-1 mt-0.5 text-primary">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Payment Terms / Notes</label>
            <Input
              placeholder="e.g. Net 15 days, Bank NEFT/RTGS details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || grandTotal <= 0} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Generate & Save Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
