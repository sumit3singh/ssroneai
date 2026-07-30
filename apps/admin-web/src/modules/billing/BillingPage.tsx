import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, Search, X, Eye, Printer } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Badge } from "@/shared/ui/primitives/Badge";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { api } from "@/shared/utils/api-client";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { formatCurrency, formatDate } from "@/shared/utils/formatters";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  date: string;
  amount: number;
  status: "paid" | "partial" | "overdue" | "draft";
}

const STATUS_VARIANT = {
  paid: "success" as const,
  partial: "warning" as const,
  overdue: "danger" as const,
  draft: "secondary" as const,
};

export function BillingPage() {
  const isMock = isMockSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "paid" | "partial" | "overdue" | "draft">("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    date: new Date().toISOString().slice(0, 10),
    amount: 1500,
    status: "paid" as const,
  });

  const refreshInvoices = () => {
    if (isMock) {
      const list = mockDB.get<Invoice>("invoices");
      setInvoices(list);
      return;
    }

    api.get<{ items: Invoice[] }>("/billing/invoices")
      .then((res) => setInvoices(res.items || []))
      .catch(() => setInvoices([]));
  };

  useEffect(() => {
    refreshInvoices();
  }, [isMock]);

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const matchesSearch = i.number.toLowerCase().includes(search.toLowerCase()) ||
        i.customer.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "all" || i.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, invoices]);

  const stats = useMemo(() => {
    const totalCollected = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
    const totalPending = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
    const count = invoices.length;
    return { totalCollected, totalPending, count };
  }, [invoices]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.customer || newInvoice.amount <= 0) return;

    if (!isMock) {
      toast.error("Invoice creation is only available in mock development mode.");
      return;
    }

    const dateStr = newInvoice.date.replace(/-/g, "");
    const seq = Math.floor(Math.random() * 900 + 100);
    const invoiceNum = `INV-${dateStr}-${seq}`;

    mockDB.insert<Invoice>("invoices", {
      number: invoiceNum,
      customer: newInvoice.customer,
      date: newInvoice.date,
      amount: Number(newInvoice.amount),
      status: newInvoice.status,
    });

    mockDB.insert("orders", {
      order_number: `ORD-MAN-${dateStr}-${seq}`,
      branch_id: "00000000-0000-0000-0000-000000000001",
      order_type: "online" as any,
      status: "completed" as any,
      payment_status: newInvoice.status === "paid" ? "paid" : "unpaid",
      subtotal: newInvoice.amount / 1.18,
      discount_amount: 0,
      total_tax: (newInvoice.amount / 1.18) * 0.18,
      grand_total: newInvoice.amount,
      amount_paid: newInvoice.status === "paid" ? newInvoice.amount : 0,
      balance_due: newInvoice.status !== "paid" ? newInvoice.amount : 0,
      notes: `Manual Invoice to ${newInvoice.customer}`,
      items: [{ product_name: "Manual Billing Adjustments", quantity: 1, unit_price: newInvoice.amount, line_total: newInvoice.amount }],
      created_at: new Date(newInvoice.date).toISOString(),
    } as any);

    toast.success(`Invoice ${invoiceNum} generated successfully`);
    refreshInvoices();
    setShowAddModal(false);
    setNewInvoice({
      customer: "",
      date: new Date().toISOString().slice(0, 10),
      amount: 1500,
      status: "paid",
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleStatusUpdate = (invId: string, nextStatus: Invoice["status"]) => {
    if (!isMock) {
      toast.error("Invoice status updates are only available in mock development mode.");
      return;
    }
    mockDB.update<Invoice>("invoices", invId, { status: nextStatus });
    toast.success(`Invoice status updated to ${nextStatus}`);
    refreshInvoices();
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice((prev) => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText size={24} className="text-primary" />
            Billing & Invoices
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatCurrency(stats.totalCollected)} collected · {formatCurrency(stats.totalPending)} pending ledger
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary text-white">
          <Plus size={15} className="mr-1.5" />
          Create Invoice
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border p-4 rounded-xl shadow-card">
          <span className="text-2xs font-semibold text-muted-foreground uppercase">Revenue Realized</span>
          <p className="text-lg font-bold text-success font-numeric mt-1">{formatCurrency(stats.totalCollected)}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-card">
          <span className="text-2xs font-semibold text-muted-foreground uppercase">Deferred / Uncollected</span>
          <p className="text-lg font-bold text-danger font-numeric mt-1">{formatCurrency(stats.totalPending)}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-card col-span-2 md:col-span-1">
          <span className="text-2xs font-semibold text-muted-foreground uppercase">Invoices Registered</span>
          <p className="text-lg font-bold text-primary font-numeric mt-1">{stats.count} Bills</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <Input
            className="pl-9"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "paid", "partial", "overdue", "draft"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="data-table-header border-b border-border">
            <tr className="text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Invoice #</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Billing Date</th>
              <th className="px-5 py-3 font-medium text-right">Invoice Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-foreground">{inv.number}</td>
                <td className="px-5 py-3.5 text-foreground font-medium">{inv.customer}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatDate(inv.date)}</td>
                <td className="px-5 py-3.5 font-numeric font-medium text-right text-foreground">{formatCurrency(inv.amount)}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_VARIANT[inv.status]} className="capitalize text-3xs">
                    {inv.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right flex gap-1.5 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewInvoice(inv)}
                    className="text-primary hover:bg-primary/5"
                  >
                    <Eye size={13} className="mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Manual Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
                <FileText size={16} className="text-primary" />
                Generate Manual Invoice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="p-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Customer Name / Organization</label>
                  <Input
                    placeholder="Enter customer name"
                    value={newInvoice.customer}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Invoice Date</label>
                    <Input
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-2xs font-semibold text-muted-foreground">Invoice Status</label>
                    <select
                      value={newInvoice.status}
                      onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value as any })}
                      className="w-full bg-background border border-border text-sm rounded-lg p-2 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="overdue">Overdue</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold text-muted-foreground">Invoice Amount (INR)</label>
                  <Input
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 p-4 border-t border-border bg-muted/10">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-white">
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Visual Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <span className="font-display font-semibold text-foreground text-sm">Invoice Ledger details</span>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X size={16} />
              </button>
            </div>

            {/* Bill Details */}
            <div className="p-6 space-y-4 font-sans text-xs">
              <div className="text-center space-y-1">
                <h3 className="font-display font-bold text-lg text-primary tracking-wide">THE BAITHAK</h3>
                <p className="text-3xs text-muted-foreground uppercase">Invoice Statement</p>
              </div>

              <div className="border-y border-dashed border-border py-2.5 grid grid-cols-2 gap-y-1.5 text-2xs text-muted-foreground font-mono">
                <div>Invoice ID: <span className="text-foreground font-bold">{selectedInvoice.number}</span></div>
                <div className="text-right">Issued: <span className="text-foreground">{formatDate(selectedInvoice.date)}</span></div>
                <div>Customer: <span className="text-foreground">{selectedInvoice.customer}</span></div>
                <div className="text-right">Status: <span className={cn("font-bold capitalize", selectedInvoice.status === "paid" ? "text-success" : "text-danger")}>{selectedInvoice.status}</span></div>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-3 font-bold border-b border-border pb-1 font-mono text-3xs text-muted-foreground">
                  <div className="col-span-2">DESCRIPTION</div>
                  <div className="text-right">AMOUNT</div>
                </div>
                <div className="grid grid-cols-3 font-mono text-2xs py-1">
                  <div className="col-span-2">Hospitality Services Rendered</div>
                  <div className="text-right">{formatCurrency(selectedInvoice.amount)}</div>
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-2 space-y-1.5 font-mono text-2xs text-muted-foreground">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-primary">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>

              {/* Modify Status Quick Actions */}
              <div className="bg-muted/30 p-3 rounded-xl border space-y-2">
                <span className="text-3xs font-semibold text-muted-foreground uppercase">Update Invoice State</span>
                <div className="flex gap-2">
                  {["paid", "overdue"].map((st) => (
                    <button
                      key={st}
                      disabled={selectedInvoice.status === st}
                      onClick={() => handleStatusUpdate(selectedInvoice.id, st as any)}
                      className={cn("flex-1 py-1.5 rounded-lg border text-2xs font-semibold capitalize transition-all",
                        selectedInvoice.status === st
                          ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                          : st === "paid"
                            ? "bg-success/10 text-success border-success/20 hover:bg-success/15"
                            : "bg-danger/10 text-danger border-danger/20 hover:bg-danger/15"
                      )}
                    >
                      Mark {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-2 p-4 border-t border-border bg-muted/10">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button
                className="flex-1 bg-primary text-white"
                onClick={() => {
                  toast.success("Invoice print scheduled!");
                  setSelectedInvoice(null);
                }}
              >
                <Printer size={14} className="mr-1.5" />
                Print Bill
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
