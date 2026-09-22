import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen, X, Search, RefreshCw, User, Phone, ArrowUpRight, CheckCircle2,
  DollarSign, QrCode, CreditCard, Building, AlertCircle, Receipt, ArrowRight,
  Clock, ShieldAlert, Sparkles, Filter
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { renderSafeString } from "../utils/renderSafeString";

interface DebtorSummary {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  unpaid_orders_count: number;
  total_billed: number;
  total_paid: number;
  total_balance_due: number;
  last_order_date?: string | null;
}

interface CustomerDebtLedger {
  customer: {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    city?: string | null;
  };
  summary: {
    total_billed: number;
    total_paid: number;
    total_balance_due: number;
    unpaid_orders_count: number;
    total_orders_count: number;
  };
  orders: Array<{
    id: number;
    order_number: string;
    order_type: string;
    table_id?: number | null;
    grand_total: number;
    amount_paid: number;
    balance_due: number;
    status: string;
    payment_status: string;
    created_at?: string | null;
    items_count: number;
    items_summary: string;
  }>;
  payments: Array<{
    id: number;
    order_id: number;
    order_number: string;
    payment_method: string;
    amount: number;
    reference_number?: string | null;
    notes?: string | null;
    status: string;
    created_at?: string | null;
  }>;
}

interface CustomerDebtRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintReceipt?: (receiptData: any) => void;
  onRefreshData?: () => void;
  preSelectedCustomerId?: number | string;
}

export const CustomerDebtRegisterModal: React.FC<CustomerDebtRegisterModalProps> = ({
  isOpen,
  onClose,
  onPrintReceipt,
  onRefreshData,
  preSelectedCustomerId,
}) => {
  // Debtor list state
  const [debtors, setDebtors] = useState<DebtorSummary[]>([]);
  const [totalOutstandingDebt, setTotalOutstandingDebt] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Selected customer ledger state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    preSelectedCustomerId !== undefined && preSelectedCustomerId !== null ? Number(preSelectedCustomerId) : null
  );
  const [customerLedger, setCustomerLedger] = useState<CustomerDebtLedger | null>(null);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [activeLedgerTab, setActiveLedgerTab] = useState<"bills" | "payments">("bills");
  const [filterTab, setFilterTab] = useState<"debt" | "all">("debt");

  // Payment modal state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK">("CASH");
  const [settleRefNumber, setSettleRefNumber] = useState("");
  const [settleNotes, setSettleNotes] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [selectedOrderIdsForSettlement, setSelectedOrderIdsForSettlement] = useState<number[]>([]);

  const openSettleModal = (order?: any) => {
    if (order) {
      setSelectedOrderIdsForSettlement([order.id]);
      setSettleAmount(order.balance_due);
    } else {
      setSelectedOrderIdsForSettlement([]);
      setSettleAmount(customerLedger?.summary?.total_balance_due || 0);
    }
    setIsSettleModalOpen(true);
  };

  // Fetch summary of all debtors directly from PostgreSQL
  const fetchDebtorsSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const res = await api.get<any>("/orders/debts/summary", {
        params: {
          search: searchQuery.trim() || undefined,
          branch_id: activeBranchId ? Number(activeBranchId) : undefined,
          include_all_customers: true,
        },
      });
      const list: DebtorSummary[] = res.debtors || [];
      setDebtors(list);
      setTotalOutstandingDebt(res.total_outstanding_debt || 0);

      // Auto-select first debtor if none selected
      if (selectedCustomerId === null && list.length > 0) {
        setSelectedCustomerId(list[0].customer_id);
      }
    } catch (err: any) {
      console.error("Failed to fetch customer debts summary", err);
      toast.error("Failed to load customer debts register");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [searchQuery, selectedCustomerId]);

  // Fetch selected customer's itemized ledger
  const fetchCustomerLedger = useCallback(async (customerId: number) => {
    setIsLoadingLedger(true);
    try {
      const res = await api.get<CustomerDebtLedger>(`/orders/debts/customer/${customerId}`);
      setCustomerLedger(res);
      // Pre-fill settle amount with outstanding balance
      setSettleAmount(res.summary.total_balance_due || 0);
    } catch (err: any) {
      console.error("Failed to fetch customer debt ledger", err);
      toast.error("Failed to load customer debt details");
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDebtorsSummary();
    }
  }, [isOpen, fetchDebtorsSummary]);

  useEffect(() => {
    if (isOpen) {
      if (selectedCustomerId !== null && selectedCustomerId !== undefined) {
        fetchCustomerLedger(selectedCustomerId);
      } else {
        setCustomerLedger(null);
      }
    }
  }, [isOpen, selectedCustomerId, fetchCustomerLedger]);

  // Handle Recording Payment from Customer
  const handleRecordDebtSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPayment) return;
    if (!customerLedger || selectedCustomerId === null || selectedCustomerId === undefined) return;
    if (settleAmount <= 0) {
      toast.error("Payment amount must be greater than zero!");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await api.post<any>("/orders/debts/settle", {
        customer_id: selectedCustomerId,
        amount: Number(settleAmount),
        payment_method: settlePaymentMethod,
        reference_number: settleRefNumber.trim() || undefined,
        notes: settleNotes.trim() || undefined,
        order_ids: selectedOrderIdsForSettlement.length > 0 ? selectedOrderIdsForSettlement : undefined,
      });

      toast.success(
        `⚡ ₹${settleAmount.toLocaleString("en-IN")} received from ${customerLedger.customer.name}! Remaining Debt: ₹${(res.remaining_debt ?? 0).toLocaleString("en-IN")}`
      );

      // Print debt collection receipt if supported
      if (onPrintReceipt) {
        onPrintReceipt({
          receiptType: "CUSTOMER_DEBT_PAYMENT",
          receiptNumber: res.receipt_number,
          customerName: customerLedger.customer.name,
          customerPhone: customerLedger.customer.phone,
          amountReceived: Number(settleAmount),
          previousDebt: res.previous_debt,
          remainingDebt: res.remaining_debt,
          paymentMethod: settlePaymentMethod,
          timestamp: new Date().toLocaleString(),
          notes: settleNotes || undefined,
        });
      }

      setIsSettleModalOpen(false);
      setSettleRefNumber("");
      setSettleNotes("");
      setSelectedOrderIdsForSettlement([]);

      // Refresh data
      await fetchCustomerLedger(selectedCustomerId);
      await fetchDebtorsSummary();
      onRefreshData?.();
    } catch (err: any) {
      console.error("Failed to record debt settlement", err);
      const detailMsg = err?.response?.data?.detail;
      if (detailMsg && (detailMsg.includes("no matching outstanding") || detailMsg.includes("no outstanding debt"))) {
        setIsSettleModalOpen(false);
        setSelectedOrderIdsForSettlement([]);
        await fetchCustomerLedger(selectedCustomerId);
        await fetchDebtorsSummary();
        toast.info("This debt has already been successfully settled and recorded in PostgreSQL!");
      } else {
        toast.error(detailMsg || err?.message || "Failed to record customer debt payment");
      }
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const effectiveDueForCalculation = selectedOrderIdsForSettlement.length > 0
    ? (customerLedger?.orders || [])
        .filter((o) => selectedOrderIdsForSettlement.includes(o.id))
        .reduce((acc, o) => acc + o.balance_due, 0)
    : (customerLedger?.summary?.total_balance_due || 0);

  const remainingBalanceAfterPayment = Math.max(
    0,
    effectiveDueForCalculation - (settleAmount || 0)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-150 select-none">
      <div className="bg-card border border-border rounded-2xl w-full max-w-6xl xl:max-w-7xl h-[92vh] max-h-[960px] shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground leading-none">
                  Customer Debt Register (Udhar Khata)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Live SSOT
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Track pending customer credit, review ledger breakdown, and record money received.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1 font-mono text-xs shadow-2xs">
              <span className="text-muted-foreground">Market Outstanding:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-extrabold">
                ₹{totalOutstandingDebt.toLocaleString("en-IN")}
              </strong>
              <span className="text-[10px] text-muted-foreground">({debtors.length} Debtors)</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDebtorsSummary();
                if (selectedCustomerId !== null && selectedCustomerId !== undefined) fetchCustomerLedger(selectedCustomerId);
              }}
              className="h-8 w-8 p-0 cursor-pointer"
              title="Refresh Register"
            >
              <RefreshCw size={14} className={isLoadingSummary ? "animate-spin" : ""} />
            </Button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dual Panel Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Left Column: Debtor Directory */}
          <div className="w-full md:w-72 lg:w-80 flex flex-col shrink-0 bg-muted/10">
            {/* Filter Toggle: Active Debt vs All Database Customers */}
            <div className="p-2 border-b border-border bg-card flex items-center gap-1 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setFilterTab("debt")}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all cursor-pointer text-center text-[11px] ${
                  filterTab === "debt"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shadow-2xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                With Debt ({debtors.filter(d => d.total_balance_due > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all cursor-pointer text-center text-[11px] ${
                  filterTab === "all"
                    ? "bg-primary/15 text-primary font-bold border border-primary/30 shadow-2xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                All Database ({debtors.length})
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-2.5 border-b border-border bg-card shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search customer by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Debtor List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
              {isLoadingSummary ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Loading database records...</div>
              ) : debtors.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-500/60" />
                  <p className="font-semibold text-foreground">Zero Outstanding Debts</p>
                  <p className="text-[11px]">All customer accounts are settled & paid in full!</p>
                </div>
              ) : (
                debtors
                  .filter((d) => (filterTab === "all" || searchQuery.trim() ? true : d.total_balance_due > 0))
                  .map((d) => {
                    const isSelected = selectedCustomerId === d.customer_id;
                    const isUnassigned = d.customer_id === 0;

                    return (
                      <div
                        key={d.customer_id}
                        onClick={() => setSelectedCustomerId(d.customer_id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
                            : "bg-card border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate flex items-center gap-1.5">
                              {isUnassigned ? (
                                <Receipt size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                              ) : (
                                <User size={13} className="text-muted-foreground shrink-0" />
                              )}
                              {renderSafeString(d.customer_name)}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                              {!isUnassigned && <Phone size={10} />}
                              {renderSafeString(d.customer_phone) || "No Phone"}
                            </p>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <span
                              className={`text-xs font-black block ${
                                d.total_balance_due > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              ₹{d.total_balance_due.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              {d.unpaid_orders_count} {d.unpaid_orders_count === 1 ? "bill" : "bills"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Customer Ledger */}
          <div className="flex-1 min-h-0 flex flex-col bg-card overflow-hidden">
            {isLoadingLedger ? (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                <RefreshCw size={18} className="animate-spin mr-2" /> Loading ledger details...
              </div>
            ) : !customerLedger ? (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-muted-foreground p-6 text-center">
                <BookOpen size={32} className="text-muted-foreground/40 mb-2" />
                <p className="font-semibold text-foreground">Select a customer from the left list</p>
                <p className="text-[11px] mt-1 max-w-sm">
                  View itemized unpaid bills, chronological payment ledger, or record money received towards debt.
                </p>
              </div>
            ) : (
              <>
                {/* Customer Account Header & KPI Bar */}
                <div className="p-4 border-b border-border bg-muted/10 shrink-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-foreground">
                          {customerLedger.customer.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
                          {customerLedger.customer.id === 0 ? "LIVE OPEN TABS" : `ID: #${customerLedger.customer.id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-1">
                        <span className="flex items-center gap-1">
                          {customerLedger.customer.id === 0 ? <Receipt size={11} /> : <Phone size={11} />}
                          {renderSafeString(customerLedger.customer.phone)}
                        </span>
                        {customerLedger.customer.city && (
                          <span>• {customerLedger.customer.city}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Settle Debt */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={customerLedger.summary.total_balance_due <= 0}
                        onClick={() => openSettleModal()}
                        className="h-9 gap-1.5 text-xs font-extrabold cursor-pointer px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md rounded-lg"
                      >
                        <DollarSign size={14} /> Settle Debt / Receive Payment
                      </Button>
                    </div>
                  </div>

                  {/* Financial Balance Strip */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-xs font-mono">
                    <div className="bg-card border border-border rounded-lg p-2">
                      <span className="text-[10px] uppercase text-muted-foreground font-sans block">Total Billed</span>
                      <strong className="text-foreground text-sm">
                        ₹{customerLedger.summary.total_billed.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-2">
                      <span className="text-[10px] uppercase text-muted-foreground font-sans block">Total Paid So Far</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{customerLedger.summary.total_paid.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                      <span className="text-[10px] uppercase text-amber-700 dark:text-amber-300 font-sans font-bold block">
                        Current Outstanding Debt
                      </span>
                      <strong className="text-amber-600 dark:text-amber-400 text-sm font-black">
                        ₹{customerLedger.summary.total_balance_due.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Ledger Tabs */}
                <div className="flex items-center gap-2 px-4 border-b border-border bg-muted/20 shrink-0 text-xs font-semibold">
                  <button
                    onClick={() => setActiveLedgerTab("bills")}
                    className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                      activeLedgerTab === "bills"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Unpaid & Credit Bills ({customerLedger.orders.filter(o => o.balance_due > 0).length})
                  </button>
                  <button
                    onClick={() => setActiveLedgerTab("payments")}
                    className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                      activeLedgerTab === "payments"
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Payment Receipts History ({customerLedger.payments.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                  {activeLedgerTab === "bills" && (
                    <div className="space-y-2">
                      {customerLedger.orders.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No order bills found for this customer.
                        </div>
                      ) : (
                        <div className="border border-border rounded-xl overflow-x-auto scrollbar-thin shadow-2xs bg-card">
                          <table className="w-full min-w-[780px] text-left text-xs">
                            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border">
                              <tr>
                                <th className="p-2.5 whitespace-nowrap">Bill / Order #</th>
                                <th className="p-2.5 whitespace-nowrap">Date & Time</th>
                                <th className="p-2.5">Items Summary</th>
                                <th className="p-2.5 text-right whitespace-nowrap">Bill Total</th>
                                <th className="p-2.5 text-right whitespace-nowrap">Paid</th>
                                <th className="p-2.5 text-right whitespace-nowrap">Balance Due</th>
                                <th className="p-2.5 text-center whitespace-nowrap">Status</th>
                                <th className="p-2.5 text-center whitespace-nowrap">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerLedger.orders.map((ord) => {
                                const hasDebt = ord.balance_due > 0;
                                return (
                                  <tr
                                    key={ord.id}
                                    className={`hover:bg-muted/20 transition-colors ${
                                      hasDebt ? "bg-amber-500/5 font-medium" : "text-muted-foreground"
                                    }`}
                                  >
                                    <td className="p-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                                      #{ord.order_number}
                                    </td>
                                    <td className="p-2.5 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                      {ord.created_at ? new Date(ord.created_at).toLocaleString() : "—"}
                                    </td>
                                    <td className="p-2.5 text-[11px] truncate max-w-[200px]" title={ord.items_summary}>
                                      {ord.items_summary || `${ord.items_count} items`}
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                                      ₹{ord.grand_total.toLocaleString("en-IN")}
                                    </td>
                                    <td className="p-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                      ₹{ord.amount_paid.toLocaleString("en-IN")}
                                    </td>
                                    <td className="p-2.5 text-right font-mono font-bold whitespace-nowrap">
                                      <span className={hasDebt ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                                        ₹{ord.balance_due.toLocaleString("en-IN")}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center whitespace-nowrap">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                          ord.payment_status === "paid"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : ord.payment_status === "partial"
                                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        }`}
                                      >
                                        {ord.payment_status || "UNPAID"}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center whitespace-nowrap">
                                      {hasDebt ? (
                                        <button
                                          type="button"
                                          onClick={() => openSettleModal(ord)}
                                          className="h-6 px-2.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md cursor-pointer transition-colors"
                                          title={`Settle specific Bill #${ord.order_number}`}
                                        >
                                          Pay Bill
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground font-mono">Paid</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLedgerTab === "payments" && (
                    <div className="space-y-2">
                      {customerLedger.payments.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No payment receipts logged yet.
                        </div>
                      ) : (
                        <div className="border border-border rounded-xl overflow-x-auto scrollbar-thin shadow-2xs bg-card">
                          <table className="w-full min-w-[650px] text-left text-xs">
                            <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border">
                              <tr>
                                <th className="p-2.5 whitespace-nowrap">Date & Time</th>
                                <th className="p-2.5 whitespace-nowrap">Order Ref</th>
                                <th className="p-2.5 whitespace-nowrap">Payment Mode</th>
                                <th className="p-2.5 text-right whitespace-nowrap">Amount Received</th>
                                <th className="p-2.5 whitespace-nowrap">Receipt / Reference</th>
                                <th className="p-2.5 whitespace-nowrap">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerLedger.payments.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="p-2.5 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                    {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                                    #{p.order_number}
                                  </td>
                                  <td className="p-2.5 whitespace-nowrap">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted border border-border text-foreground">
                                      {p.payment_method}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                    ₹{p.amount.toLocaleString("en-IN")}
                                  </td>
                                  <td className="p-2.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                    {p.reference_number || "—"}
                                  </td>
                                  <td className="p-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                                    {p.notes || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Modal: Settle Debt / Receive Payment */}
      {isSettleModalOpen && customerLedger && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-4 space-y-3.5 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Settle Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground leading-none">Receive Debt Payment</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    For guest: <strong>{customerLedger.customer.name}</strong> ({customerLedger.customer.phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettleModalOpen(false)}
                className="p-1 text-muted-foreground hover:bg-muted rounded-md cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRecordDebtSettlement} className="space-y-3 text-xs">
              {/* Outstanding Debt Info Banner */}
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-amber-800 dark:text-amber-300 font-sans text-xs block font-semibold">
                    {selectedOrderIdsForSettlement.length > 0
                      ? `Selected Bill (${selectedOrderIdsForSettlement.length}) Due:`
                      : "Total Outstanding Debt:"}
                  </span>
                  {selectedOrderIdsForSettlement.length > 0 && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      Targeting specific bill references
                    </span>
                  )}
                </div>
                <strong className="text-amber-600 dark:text-amber-400 text-sm">
                  ₹{effectiveDueForCalculation.toLocaleString("en-IN")}
                </strong>
              </div>

              {/* Target Bill Selection / References Checklist */}
              {customerLedger.orders.filter((o) => o.balance_due > 0).length > 1 && (
                <div className="space-y-1.5 bg-muted/20 border border-border rounded-xl p-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Target Bill References
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          const allUnpaid = customerLedger.orders.filter((o) => o.balance_due > 0);
                          setSelectedOrderIdsForSettlement(allUnpaid.map((o) => o.id));
                          setSettleAmount(allUnpaid.reduce((acc, o) => acc + o.balance_due, 0));
                        }}
                        className="text-primary hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderIdsForSettlement([]);
                          setSettleAmount(customerLedger.summary.total_balance_due);
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                      >
                        Auto FIFO (All)
                      </button>
                    </div>
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {customerLedger.orders.filter((o) => o.balance_due > 0).map((ord) => {
                      const isChecked = selectedOrderIdsForSettlement.includes(ord.id);
                      return (
                        <div
                          key={ord.id}
                          onClick={() => {
                            let next: number[];
                            if (isChecked) {
                              next = selectedOrderIdsForSettlement.filter((id) => id !== ord.id);
                            } else {
                              next = [...selectedOrderIdsForSettlement, ord.id];
                            }
                            setSelectedOrderIdsForSettlement(next);
                            if (next.length > 0) {
                              const sumSelected = customerLedger.orders
                                .filter((o) => next.includes(o.id))
                                .reduce((acc, o) => acc + o.balance_due, 0);
                              setSettleAmount(sumSelected);
                            } else {
                              setSettleAmount(customerLedger.summary.total_balance_due);
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-semibold"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-emerald-600 rounded cursor-pointer shrink-0"
                            />
                            <span className="font-mono font-bold text-foreground">#{ord.order_number}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                              {ord.items_summary || `${ord.items_count} items`}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs shrink-0">
                            ₹{ord.balance_due.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amount Input & Shortcut Chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Amount Received from Customer (₹) *
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={effectiveDueForCalculation}
                  value={settleAmount || ""}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="h-9 text-base font-mono font-black text-right"
                  autoFocus
                />

                {/* Quick amount chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettleAmount(effectiveDueForCalculation)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted hover:bg-primary/10 border border-border text-foreground cursor-pointer transition-colors"
                  >
                    Full: ₹{effectiveDueForCalculation}
                  </button>
                  {effectiveDueForCalculation > 100 && (
                    <button
                      type="button"
                      onClick={() => setSettleAmount(Math.round(effectiveDueForCalculation / 2))}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted hover:bg-primary/10 border border-border text-foreground cursor-pointer transition-colors"
                    >
                      50%: ₹{Math.round(effectiveDueForCalculation / 2)}
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["CASH", "UPI", "CARD", "BANK"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSettlePaymentMethod(mode)}
                      className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                        settlePaymentMethod === mode
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {mode === "CASH" && <DollarSign size={14} />}
                      {mode === "UPI" && <QrCode size={14} />}
                      {mode === "CARD" && <CreditCard size={14} />}
                      {mode === "BANK" && <Building size={14} />}
                      <span className="text-[10px]">{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Reference & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">
                    Reference / UTR (Optional)
                  </label>
                  <Input
                    type="text"
                    value={settleRefNumber}
                    onChange={(e) => setSettleRefNumber(e.target.value)}
                    placeholder="e.g. UPI-98762"
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">
                    Notes / Remarks
                  </label>
                  <Input
                    type="text"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="e.g. Cleared at counter"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {/* Live Remaining Balance Preview */}
              <div className="p-2 bg-muted/40 border border-border rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Remaining Debt After Payment:</span>
                <strong className={`text-sm ${remainingBalanceAfterPayment === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  ₹{remainingBalanceAfterPayment.toLocaleString("en-IN")}
                </strong>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPayment || settleAmount <= 0 || effectiveDueForCalculation <= 0}
                  size="sm"
                  className="h-8 text-xs font-extrabold cursor-pointer px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPayment ? "Processing..." : "Confirm Payment"} <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
