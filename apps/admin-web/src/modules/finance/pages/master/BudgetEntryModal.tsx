import React, { useState, useEffect } from "react";
import { X, PieChart, Plus, Trash2, CheckCircle2, DollarSign } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";

interface BudgetEntry {
  id: number;
  account_id: number;
  account_name: string;
  account_code: string;
  fiscal_year: string;
  month: number;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
}

interface AccountOption {
  id: number;
  code?: string;
  account_code?: string;
  name?: string;
  account_name?: string;
}

interface BudgetEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const BudgetEntryModal: React.FC<BudgetEntryModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [accountId, setAccountId] = useState<string>("");
  const [fiscalYear, setFiscalYear] = useState<string>("2026-2027");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [amount, setAmount] = useState<string>("50000");

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, aRes] = await Promise.all([
        api.get<BudgetEntry[]>("/finance/budgets"),
        api.get<any>("/finance/chart-of-accounts"),
      ]);
      setBudgets(Array.isArray(bRes) ? bRes : []);
      const aList = Array.isArray(aRes) ? aRes : (aRes?.data || []);
      setAccounts(aList);
      if (aList.length > 0 && !accountId) {
        setAccountId(String(aList[0].id));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load budget records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) {
      toast.error("Please select a general ledger account");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Budget amount must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      await api.post("/finance/budgets", {
        account_id: Number(accountId),
        fiscal_year: fiscalYear,
        month: Number(month),
        budgeted_amount: amt,
      });
      toast.success("Budget entry allocated in PostgreSQL!");
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create budget entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this budget allocation?")) return;
    try {
      await api.delete(`/finance/budgets/${id}`);
      toast.success("Budget entry removed");
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete budget entry");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <PieChart size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Monthly Budget Allocations</h2>
              <p className="text-xs text-muted-foreground">
                Set expense and revenue targets per chart of account ledger for variance tracking
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Create Form */}
          <form onSubmit={handleCreate} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus size={14} className="text-primary" />
              <span>Record Budget Target</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Ledger Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-8 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_code || acc.code} – {acc.account_name || acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Fiscal Year</label>
                <Input
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
                >
                  {MONTHS.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName} (M{idx + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-medium text-muted-foreground">Allocated Budget (₹)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                <CheckCircle2 size={13} /> Save Allocation
              </Button>
            </div>
          </form>

          {/* List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>Active Budgets ({budgets.length})</span>
            </div>

            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-muted/60 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No monthly budgets established yet. Assign targets above to track department spending.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-2.5">Account Ledger</th>
                      <th className="p-2.5 text-center">Period</th>
                      <th className="p-2.5 text-right">Budget Target</th>
                      <th className="p-2.5 text-right">Actual Spent</th>
                      <th className="p-2.5 text-right">Variance</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {budgets.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-medium text-foreground">
                          {b.account_name}
                          {b.account_code && <span className="text-muted-foreground ml-1 font-mono text-[10px]">({b.account_code})</span>}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {MONTHS[b.month - 1]} {b.fiscal_year}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-primary">₹{b.budgeted_amount.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">₹{b.actual_amount.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{b.variance.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                            title="Delete Budget"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
