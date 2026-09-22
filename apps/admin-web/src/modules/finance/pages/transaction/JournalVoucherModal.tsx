import React, { useState } from "react";
import { X, FileText, Plus, Trash2, CheckCircle2, AlertCircle, Scale } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface JournalLine {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JournalVoucherModal: React.FC<JournalVoucherModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("");
  const [referenceType, setReferenceType] = useState<string>("MANUAL");
  const [referenceId, setReferenceId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [lines, setLines] = useState<JournalLine[]>([
    { account_code: "1010", account_name: "Cash in Hand", debit: 1000, credit: 0, description: "Debit Entry" },
    { account_code: "4010", account_name: "Sales Revenue", debit: 0, credit: 1000, description: "Credit Entry" },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    setLines([...lines, { account_code: "", account_name: "", debit: 0, credit: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error("A double-entry voucher requires at least two lines");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Voucher narration / description is required");
      return;
    }
    if (!isBalanced) {
      toast.error(`Voucher is unbalanced! Total Debit (₹${totalDebit}) must equal Total Credit (₹${totalCredit})`);
      return;
    }

    try {
      setSaving(true);
      const res: any = await api.post("/finance/journal-entries", {
        entry_date: entryDate,
        description: description.trim(),
        reference_type: referenceType,
        reference_id: referenceId.trim() || null,
        lines: lines.map((l) => ({
          account_code: l.account_code.trim(),
          account_name: l.account_name.trim(),
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || "",
        })),
      });
      toast.success(res?.message || "Journal voucher posted to PostgreSQL!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to post journal voucher");
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
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Post Journal Voucher Entry</h2>
              <p className="text-xs text-muted-foreground">
                Double-entry bookkeeping record with real-time balance parity enforcement
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Voucher Date</label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Reference Type</label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
              >
                <option value="MANUAL">Manual Adjustment</option>
                <option value="BANK_DEPOSIT">Bank Deposit</option>
                <option value="EXPENSE">Direct Expense</option>
                <option value="PAYROLL">Payroll Settlement</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Doc / Cheque Ref #</label>
              <Input
                placeholder="e.g. CHQ-99012"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Narration / Description</label>
            <Input
              placeholder="e.g. Cash deposited into current account, rent adjustment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Double Entry Ledger Lines */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Debit & Credit Ledger Lines</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddLine}
                className="text-xs h-7 gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Line
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-2.5 w-28">Acc Code</th>
                    <th className="p-2.5">Account Name</th>
                    <th className="p-2.5 w-32 text-right">Debit (₹)</th>
                    <th className="p-2.5 w-32 text-right">Credit (₹)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <Input
                          placeholder="e.g. 1010"
                          value={line.account_code}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].account_code = e.target.value;
                            setLines(updated);
                          }}
                          className="text-xs h-8 font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          placeholder="Account ledger name"
                          value={line.account_name}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].account_name = e.target.value;
                            setLines(updated);
                          }}
                          className="text-xs h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={line.debit}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].debit = Number(e.target.value);
                            setLines(updated);
                          }}
                          className="text-xs h-8 font-mono text-right"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={line.credit}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].credit = Number(e.target.value);
                            setLines(updated);
                          }}
                          className="text-xs h-8 font-mono text-right"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-muted-foreground hover:text-destructive cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40 border-t border-border font-bold text-xs">
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right uppercase text-[10px] text-muted-foreground">
                      Totals:
                    </td>
                    <td className="p-2.5 text-right font-mono">₹{totalDebit.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono">₹{totalCredit.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Parity Card */}
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isBalanced
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <Scale size={14} />
                <span>{isBalanced ? "Voucher Balanced: Debit equals Credit" : "Voucher Unbalanced: Difference ₹" + Math.abs(totalDebit - totalCredit)}</span>
              </div>
              <span className="font-mono font-bold">Δ ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !isBalanced} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Post Journal Voucher
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
