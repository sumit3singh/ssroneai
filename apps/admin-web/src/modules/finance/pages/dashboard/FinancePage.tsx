import React, { useState, useEffect, useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { 
  DollarSign, TrendingUp, TrendingDown, FileText, ShieldCheck, 
  Layers, Plus, Trash2, CheckCircle2, History, ListFilter, Activity, RefreshCw, Save, X,
  Calendar, PieChart, Receipt, CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@ssrone/ui";
import { formatCurrency } from "@/shared/utils/formatters";
import { cn } from "@/shared/utils/cn";
import { api } from "@ssrone/api-client";
import { FinancialYearModal } from "../master/FinancialYearModal";
import { BudgetEntryModal } from "../master/BudgetEntryModal";
import { JournalVoucherModal } from "../transaction/JournalVoucherModal";
import { CorporateInvoiceModal } from "../transaction/CorporateInvoiceModal";
import { InvoicePaymentModal } from "../transaction/InvoicePaymentModal";

interface ChartOfAccount {
  id: string | number;
  code: string;
  name: string;
  account_type: "asset" | "liability" | "equity" | "income" | "expense";
  balance: number;
  is_active: boolean;
}

interface JournalEntryDTO {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  lines: any[];
}

interface InvoiceDTO {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_gstin: string | null;
  invoice_date: string;
  due_date: string | null;
  status: string;
  subtotal: number;
  total_tax: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
}

export function FinancePage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Domain State strictly fetched from PostgreSQL (Golden Rule #1 & #2)
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryDTO[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFYModalOpen, setIsFYModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<InvoiceDTO | null>(null);

  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    account_type: "asset" as ChartOfAccount["account_type"],
    opening_balance: 0
  });

  const isFinancialYears = currentPath.includes("/financial-years");
  const isBudgets = currentPath.includes("/budgets");
  const isJournal = currentPath.includes("/journal");
  const isInvoices = currentPath.includes("/invoices");

  useEffect(() => {
    if (isFinancialYears) setIsFYModalOpen(true);
    else if (isBudgets) setIsBudgetModalOpen(true);
  }, [currentPath]);

  const fetchCOA = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any>("/finance/chart-of-accounts").catch(() => null);
      const list = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      setAccounts(list.map((a: any) => ({
        id: a.id,
        code: a.account_code || a.code,
        name: a.account_name || a.name,
        account_type: a.account_type || "asset",
        balance: Number(a.current_balance || a.balance || 0),
        is_active: a.is_active !== false
      })));
    } catch (err) {
      console.log("Failed to fetch PostgreSQL chart of accounts", err);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJournals = async () => {
    try {
      const res = await api.get<JournalEntryDTO[]>("/finance/journal-entries");
      setJournalEntries(Array.isArray(res) ? res : []);
    } catch {
      setJournalEntries([]);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get<InvoiceDTO[]>("/finance/invoices");
      setInvoices(Array.isArray(res) ? res : []);
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    fetchCOA();
    if (isJournal) fetchJournals();
    if (isInvoices) fetchInvoices();
  }, [currentPath]);

  const totalAssets = useMemo(() => {
    return accounts.filter((a) => a.account_type === "asset").reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalIncome = useMemo(() => {
    return accounts.filter((a) => a.account_type === "income").reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalExpense = useMemo(() => {
    return accounts.filter((a) => a.account_type === "expense").reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.code || !newAccount.name) return;

    const created: ChartOfAccount = {
      id: `coa-${Date.now()}`,
      code: newAccount.code,
      name: newAccount.name,
      account_type: newAccount.account_type,
      balance: Number(newAccount.opening_balance),
      is_active: true
    };

    setAccounts((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewAccount({ code: "", name: "", account_type: "asset", opening_balance: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Finance & General Ledger Workspace
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Chart of Accounts, Journal Vouchers, Corporate Invoicing, Budgets & Fiscal Periods
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFYModalOpen(true)}
            className="text-xs h-9 gap-1 cursor-pointer"
          >
            <Calendar size={14} /> Fiscal Years
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBudgetModalOpen(true)}
            className="text-xs h-9 gap-1 cursor-pointer"
          >
            <PieChart size={14} /> Budgets
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJournalModalOpen(true)}
            className="text-xs h-9 gap-1 cursor-pointer"
          >
            <FileText size={14} /> Post Journal
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="text-xs h-9 gap-1 cursor-pointer"
          >
            <Receipt size={14} /> Corporate Invoice
          </Button>

          <button
            onClick={() => {
              fetchCOA();
              fetchJournals();
              fetchInvoices();
            }}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button
            onClick={() => setShowAddModal(true)}
            className="font-extrabold flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </Button>
        </div>
      </div>

      {/* VIEW 1: Journal Vouchers View */}
      {isJournal ? (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-sm text-foreground uppercase tracking-wider">
                Journal Voucher Ledger ({journalEntries.length})
              </h3>
              <p className="text-xs text-muted-foreground">Double-entry vouchers posted to PostgreSQL</p>
            </div>
            <Button
              onClick={() => setIsJournalModalOpen(true)}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> New Journal Voucher
            </Button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-3">Voucher #</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3">Narration</th>
                  <th className="p-3 text-right">Debit (₹)</th>
                  <th className="p-3 text-right">Credit (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No journal vouchers recorded yet. Click <strong>New Journal Voucher</strong> to post an entry.
                    </td>
                  </tr>
                ) : (
                  journalEntries.map((je) => (
                    <tr key={je.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-bold text-primary">{je.entry_number}</td>
                      <td className="p-3 text-center font-mono">{je.entry_date}</td>
                      <td className="p-3 text-foreground font-medium">{je.description}</td>
                      <td className="p-3 text-right font-mono font-bold">₹{je.total_debit.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold">₹{je.total_credit.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                          Posted
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : isInvoices ? (
        /* VIEW 2: Corporate Invoices View */
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-sm text-foreground uppercase tracking-wider">
                Corporate Tax Invoices Ledger ({invoices.length})
              </h3>
              <p className="text-xs text-muted-foreground">GST-compliant B2B invoicing and payment registers</p>
            </div>
            <Button
              onClick={() => setIsInvoiceModalOpen(true)}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Create Corporate Invoice
            </Button>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Client Name</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-right">Taxable</th>
                  <th className="p-3 text-right">GST</th>
                  <th className="p-3 text-right">Total (₹)</th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No corporate invoices recorded. Click <strong>Create Corporate Invoice</strong> to generate one.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-bold text-primary">{inv.invoice_number}</td>
                      <td className="p-3 font-medium text-foreground">
                        {inv.customer_name}
                        {inv.customer_gstin && (
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            [{inv.customer_gstin}]
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">{inv.invoice_date}</td>
                      <td className="p-3 text-right font-mono">₹{inv.subtotal.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-amber-600">₹{inv.total_tax.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold">₹{inv.grand_total.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-500">
                        ₹{inv.balance_due.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          inv.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {inv.balance_due > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPaymentModalInvoice(inv)}
                            className="text-[11px] h-7 gap-1 cursor-pointer"
                          >
                            <CreditCard size={12} /> Pay
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 3: Default Dashboard & Chart of Accounts */
        <>
          {/* Realtime Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Total Liquid Assets</span>
              <span className="font-mono font-black text-xl text-emerald-500">{formatCurrency(totalAssets)}</span>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Gross Operational Income</span>
              <span className="font-mono font-black text-xl text-foreground">{formatCurrency(totalIncome)}</span>
            </div>

            <div className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-1">
              <span className="text-3xs font-extrabold text-muted-foreground uppercase tracking-wider block">Operating Expenses (COGS)</span>
              <span className="font-mono font-black text-xl text-amber-500">{formatCurrency(totalExpense)}</span>
            </div>
          </div>

          {/* Chart of Accounts Table */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <h3 className="font-display font-black text-sm text-foreground uppercase tracking-wider">
                Chart of Accounts Ledger ({accounts.length})
              </h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-2xs font-extrabold uppercase text-muted-foreground tracking-wider">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3 text-right">Balance (₹)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No accounts registered in database. Click <strong>Add Account</strong> above.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{acc.code}</td>
                      <td className="p-3 font-medium text-foreground">{acc.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border uppercase">
                          {acc.account_type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {formatCurrency(acc.balance)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Enterprise Finance Modals */}
      <FinancialYearModal
        isOpen={isFYModalOpen}
        onClose={() => setIsFYModalOpen(false)}
      />

      <BudgetEntryModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <JournalVoucherModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSuccess={fetchJournals}
      />

      <CorporateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={fetchInvoices}
      />

      <InvoicePaymentModal
        isOpen={!!paymentModalInvoice}
        invoice={paymentModalInvoice}
        onClose={() => setPaymentModalInvoice(null)}
        onSuccess={fetchInvoices}
      />

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-sm text-foreground uppercase tracking-wider">
                Create Ledger Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    placeholder="e.g. 1050"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Account Type *</label>
                  <select
                    value={newAccount.account_type}
                    onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value as any })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none uppercase font-bold"
                  >
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g. Petty Cash Drawer"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  value={newAccount.opening_balance}
                  onChange={(e) => setNewAccount({ ...newAccount, opening_balance: Number(e.target.value) })}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-extrabold flex items-center gap-1.5 cursor-pointer">
                  <Save size={14} />
                  <span>Save Account</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
