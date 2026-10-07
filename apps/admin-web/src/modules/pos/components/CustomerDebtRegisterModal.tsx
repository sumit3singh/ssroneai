import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen, X, Search, RefreshCw, User, Phone, ArrowUpRight, CheckCircle2,
  DollarSign, QrCode, CreditCard, Building, AlertCircle, Receipt, ArrowRight,
  Clock, ShieldAlert, Sparkles, Filter, Printer, PlusCircle, Calendar, Tag
} from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { renderSafeString } from "../utils/renderSafeString";
import { CustomerDebtSettlementReceiptModal } from "./CustomerDebtSettlementReceiptModal";
import { CustomerDebtSettlementReceiptData } from "../utils/printUtils";

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
    notes?: string | null;
    special_instructions?: string | null;
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

  const [billStatusFilter, setBillStatusFilter] = useState<"unpaid" | "all" | "paid">("unpaid");

  // Payment modal state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK">("CASH");
  const [settleRefNumber, setSettleRefNumber] = useState("");
  const [settleNotes, setSettleNotes] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [selectedOrderIdsForSettlement, setSelectedOrderIdsForSettlement] = useState<number[]>([]);
  const [settlementReceiptData, setSettlementReceiptData] = useState<CustomerDebtSettlementReceiptData | null>(null);
  const [isSettlementReceiptOpen, setIsSettlementReceiptOpen] = useState(false);

  const openSettleModal = (order?: any) => {
    if (order) {
      setSelectedOrderIdsForSettlement([order.id]);
      setSettleAmount(order.balance_due);
    } else {
      const unpaidOrders = (customerLedger?.orders || []).filter((o) => o.balance_due > 0);
      setSelectedOrderIdsForSettlement(unpaidOrders.map((o) => o.id));
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

      // Construct comprehensive Debt Settlement Receipt payload
      // Strictly restrict settled bills to those that were unpaid and targeted in this settlement
      const candidateOrders = (customerLedger.orders || []).filter((o) => o.balance_due > 0);
      const targetOrders = selectedOrderIdsForSettlement.length > 0
        ? candidateOrders.filter((o) => selectedOrderIdsForSettlement.includes(o.id))
        : candidateOrders;

      const settledOrderDetails = targetOrders.map((o) => ({
        orderNumber: o.order_number,
        date: o.created_at || undefined,
        totalAmount: o.grand_total,
        amountPaid: o.amount_paid,
        balanceDue: o.balance_due,
        itemsSummary: o.items_summary || undefined,
      }));

      const receiptPayload: CustomerDebtSettlementReceiptData = {
        receiptNumber: res.receipt_number || `RCPT-${Date.now().toString().slice(-6)}`,
        customerName: customerLedger.customer.name,
        customerPhone: customerLedger.customer.phone,
        timestamp: new Date().toLocaleString(),
        settledOrders: settledOrderDetails,
        totalDebtBefore: res.previous_debt ?? (customerLedger.summary?.total_balance_due || 0),
        amountReceived: Number(settleAmount),
        remainingDebt: res.remaining_debt ?? 0,
        paymentMethod: settlePaymentMethod,
        referenceNumber: settleRefNumber.trim() || undefined,
        notes: settleNotes.trim() || undefined,
      };

      setSettlementReceiptData(receiptPayload);
      setIsSettlementReceiptOpen(true);

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

  // Opening Balance Modal State
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
  const [openingBalanceCustomerMode, setOpeningBalanceCustomerMode] = useState<"existing" | "new">("existing");
  const [openingBalanceCustomerId, setOpeningBalanceCustomerId] = useState<number | null>(null);
  const [openingBalanceCustomerName, setOpeningBalanceCustomerName] = useState("");
  const [openingBalanceCustomerPhone, setOpeningBalanceCustomerPhone] = useState("");
  const [openingBalanceAmount, setOpeningBalanceAmount] = useState<string>("");
  const [openingBalanceDetailType, setOpeningBalanceDetailType] = useState<string>(
    "Previous Register / Old Khata (पुराना खाता / रजिस्टर)"
  );
  const [openingBalanceCustomDetailType, setOpeningBalanceCustomDetailType] = useState("");
  const [openingBalanceNotes, setOpeningBalanceNotes] = useState("");
  const [openingBalanceDate, setOpeningBalanceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isSubmittingOpeningBalance, setIsSubmittingOpeningBalance] = useState(false);

  const handleOpenOpeningBalanceModal = (targetCust?: any) => {
    const cust = targetCust || (customerLedger && customerLedger.customer.id !== 0 ? customerLedger.customer : null);
    if (cust && cust.id !== 0) {
      setOpeningBalanceCustomerMode("existing");
      setOpeningBalanceCustomerId(cust.id);
      setOpeningBalanceCustomerName(cust.name);
      setOpeningBalanceCustomerPhone(cust.phone);
    } else {
      if (debtors.length > 0 && selectedCustomerId && selectedCustomerId !== 0) {
        const found = debtors.find((d) => d.customer_id === selectedCustomerId);
        if (found) {
          setOpeningBalanceCustomerMode("existing");
          setOpeningBalanceCustomerId(found.customer_id);
          setOpeningBalanceCustomerName(found.customer_name);
          setOpeningBalanceCustomerPhone(found.customer_phone);
        } else {
          setOpeningBalanceCustomerMode("new");
          setOpeningBalanceCustomerId(null);
          setOpeningBalanceCustomerName("");
          setOpeningBalanceCustomerPhone("");
        }
      } else {
        setOpeningBalanceCustomerMode("new");
        setOpeningBalanceCustomerId(null);
        setOpeningBalanceCustomerName("");
        setOpeningBalanceCustomerPhone("");
      }
    }
    setOpeningBalanceAmount("");
    setOpeningBalanceDetailType("Previous Register / Old Khata (पुराना खाता / रजिस्टर)");
    setOpeningBalanceCustomDetailType("");
    setOpeningBalanceNotes("");
    setOpeningBalanceDate(new Date().toISOString().split("T")[0]);
    setIsOpeningBalanceModalOpen(true);
  };

  const handleRecordOpeningBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOpeningBalance) return;

    const amt = parseFloat(openingBalanceAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid opening debt amount greater than ₹0");
      return;
    }

    let effCustomerId: number | null = null;
    let effCustomerName = openingBalanceCustomerName.trim();
    let effCustomerPhone = openingBalanceCustomerPhone.trim();

    if (openingBalanceCustomerMode === "existing") {
      if (!openingBalanceCustomerId) {
        toast.error("Please select a customer from the database");
        return;
      }
      effCustomerId = openingBalanceCustomerId;
      const found = debtors.find((d) => d.customer_id === effCustomerId);
      if (found) {
        effCustomerName = found.customer_name;
        effCustomerPhone = found.customer_phone;
      }
    } else {
      if (!effCustomerPhone) {
        toast.error("Please enter customer's mobile number");
        return;
      }
      if (!effCustomerName) {
        effCustomerName = `Customer ${effCustomerPhone.slice(-4)}`;
      }
    }

    const effType =
      openingBalanceDetailType === "Other Past Debt / Custom" && openingBalanceCustomDetailType.trim()
        ? openingBalanceCustomDetailType.trim()
        : openingBalanceDetailType;

    setIsSubmittingOpeningBalance(true);
    try {
      const activeBranchId = localStorage.getItem("active_branch_id");
      const res = await api.post<any>("/orders/debts/opening-balance", {
        customer_id: effCustomerId,
        customer_name: effCustomerName,
        customer_phone: effCustomerPhone,
        amount: amt,
        debt_detail_type: effType,
        notes: openingBalanceNotes.trim() || undefined,
        debt_date: openingBalanceDate ? new Date(openingBalanceDate).toISOString() : undefined,
        branch_id: activeBranchId ? Number(activeBranchId) : undefined,
      });

      toast.success(res.message || `Opening balance of ₹${amt.toLocaleString("en-IN")} recorded!`);
      setIsOpeningBalanceModalOpen(false);

      // Refresh registers
      await fetchDebtorsSummary();
      if (res.customer_id) {
        setSelectedCustomerId(res.customer_id);
        await fetchCustomerLedger(res.customer_id);
        setActiveLedgerTab("bills");
        setBillStatusFilter("unpaid");
      }
      onRefreshData?.();
    } catch (err: any) {
      console.error("Failed to record opening balance", err);
      toast.error(err.response?.data?.detail || "Failed to record opening balance. Please check inputs.");
    } finally {
      setIsSubmittingOpeningBalance(false);
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
              onClick={() => handleOpenOpeningBalanceModal()}
              className="h-8 gap-1.5 text-xs font-bold cursor-pointer border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shadow-2xs"
              title="Record customer opening balance or previous debt (Purana Udhar)"
            >
              <PlusCircle size={14} className="text-amber-500" />
              <span className="hidden sm:inline">+ Add Opening Balance / Old Udhar</span>
              <span className="sm:hidden">+ Old Debt</span>
            </Button>

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

            {/* Quick Action: Add Opening Balance / Old Udhar */}
            <div className="px-2.5 py-1.5 border-b border-border bg-card/60 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Old Udhar / Register
              </span>
              <button
                type="button"
                onClick={() => handleOpenOpeningBalanceModal()}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="Create opening balance for any new or existing customer"
              >
                <PlusCircle size={12} />
                <span>+ Record Old Debt</span>
              </button>
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
                      {customerLedger.customer.id !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenOpeningBalanceModal(customerLedger.customer)}
                          className="h-9 gap-1.5 text-xs font-bold cursor-pointer px-3 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 rounded-lg shadow-2xs"
                          title={`Record previous debt / opening balance for ${customerLedger.customer.name}`}
                        >
                          <PlusCircle size={14} className="text-amber-500" />
                          <span>+ Add Opening Balance</span>
                        </Button>
                      )}

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

                {/* Ledger Tabs & Bill Status Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 border-b border-border bg-muted/20 shrink-0 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveLedgerTab("bills")}
                      className={`py-1.5 px-3 border-b-2 transition-colors cursor-pointer font-semibold ${
                        activeLedgerTab === "bills"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bills Ledger ({customerLedger.orders.length})
                    </button>
                    <button
                      onClick={() => setActiveLedgerTab("payments")}
                      className={`py-1.5 px-3 border-b-2 transition-colors cursor-pointer font-semibold ${
                        activeLedgerTab === "payments"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Payment Receipts History ({customerLedger.payments.length})
                    </button>
                  </div>

                  {activeLedgerTab === "bills" && (
                    <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBillStatusFilter("unpaid")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          billStatusFilter === "unpaid"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Unpaid Only ({customerLedger.orders.filter((o) => o.balance_due > 0).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillStatusFilter("all")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          billStatusFilter === "all"
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All Bills ({customerLedger.orders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillStatusFilter("paid")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          billStatusFilter === "paid"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Paid ({customerLedger.orders.filter((o) => o.balance_due <= 0).length})
                      </button>
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                  {activeLedgerTab === "bills" && (() => {
                    const unpaidList = customerLedger.orders.filter((o) => o.balance_due > 0);
                    const paidList = customerLedger.orders.filter((o) => o.balance_due <= 0);
                    const displayedBills =
                      billStatusFilter === "unpaid"
                        ? unpaidList
                        : billStatusFilter === "paid"
                        ? paidList
                        : customerLedger.orders;

                    return (
                      <div className="space-y-2">
                        {displayedBills.length === 0 ? (
                          <div className="p-8 text-center bg-card border border-border rounded-xl space-y-2.5 shadow-2xs">
                            {billStatusFilter === "unpaid" ? (
                              <>
                                <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-1.5">
                                  <CheckCircle2 size={18} /> All Bills Fully Settled!
                                </div>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                  This customer currently has zero outstanding balance. All previous bills have been paid in full.
                                </p>
                                {customerLedger.orders.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setBillStatusFilter("all")}
                                    className="px-3 py-1 rounded-md bg-muted hover:bg-accent text-foreground text-xs font-bold border border-border cursor-pointer transition-colors"
                                  >
                                    View All Past Bills ({customerLedger.orders.length})
                                  </button>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">No bills found under this filter.</p>
                            )}
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
                                {displayedBills.map((ord) => {
                                  const hasDebt = ord.balance_due > 0;
                                  const isOpeningBalance =
                                    ord.order_type === "OPENING_BALANCE" ||
                                    (Boolean(ord.order_number) && ord.order_number.startsWith("OPEN-"));
                                  return (
                                    <tr
                                      key={ord.id}
                                      className={`hover:bg-muted/20 transition-colors ${
                                        isOpeningBalance
                                          ? "bg-amber-500/10 font-medium border-l-2 border-l-amber-500"
                                          : hasDebt
                                          ? "bg-amber-500/5 font-medium"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      <td className="p-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span>{ord.order_number}</span>
                                          {isOpeningBalance && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                              PURANA UDHAR
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-2.5 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                        {ord.created_at ? new Date(ord.created_at).toLocaleString() : "—"}
                                      </td>
                                      <td className="p-2.5 text-[11px] max-w-[280px]">
                                        {isOpeningBalance ? (
                                          <div>
                                            <span className="font-bold text-foreground block">
                                              {ord.special_instructions || ord.items_summary || "Opening Balance"}
                                            </span>
                                            {ord.notes && (
                                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2" title={ord.notes}>
                                                <span className="font-semibold text-amber-600 dark:text-amber-400">Detail:</span> {ord.notes}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="truncate" title={ord.items_summary}>
                                            {ord.items_summary || `${ord.items_count} items`}
                                            {ord.notes && (
                                              <p className="text-[10px] text-muted-foreground truncate" title={ord.notes}>
                                                Note: {ord.notes}
                                              </p>
                                            )}
                                          </div>
                                        )}
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
                    );
                  })()}

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
                                <th className="p-2.5 text-center whitespace-nowrap">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerLedger.payments.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="p-2.5 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                    {p.created_at ? new Date(p.created_at).toLocaleString() : "—"}
                                  </td>
                                  <td className="p-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                                    {p.order_number}
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
                                  <td className="p-2.5 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const singleOrder = customerLedger.orders.find((o) => o.id === p.order_id || o.order_number === p.order_number);
                                        setSettlementReceiptData({
                                          receiptNumber: p.reference_number || `RCPT-${p.id}`,
                                          customerName: customerLedger.customer.name,
                                          customerPhone: customerLedger.customer.phone,
                                          timestamp: p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString(),
                                          settledOrders: singleOrder ? [{
                                            orderNumber: singleOrder.order_number,
                                            date: singleOrder.created_at || undefined,
                                            totalAmount: singleOrder.grand_total,
                                          }] : [{
                                            orderNumber: p.order_number,
                                            totalAmount: p.amount,
                                          }],
                                          totalDebtBefore: p.amount,
                                          amountReceived: p.amount,
                                          remainingDebt: 0,
                                          paymentMethod: p.payment_method,
                                          referenceNumber: p.reference_number || undefined,
                                          notes: p.notes || undefined,
                                        });
                                        setIsSettlementReceiptOpen(true);
                                      }}
                                      className="h-6 px-2 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-md cursor-pointer transition-colors inline-flex items-center gap-1"
                                      title="Print or share settlement receipt"
                                    >
                                      <Printer size={11} />
                                      <span>Receipt</span>
                                    </button>
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
                          setSettleAmount(0);
                        }}
                        className="text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                      >
                        Clear All
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
                              setSettleAmount(0);
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
                            <span className="font-mono font-bold text-foreground">{ord.order_number}</span>
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

      {/* Sub-Modal: Record Opening Balance / Previous Debt (Purana Udhar) */}
      {isOpeningBalanceModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-foreground leading-tight">
                    Record Customer Opening Balance (Purana Udhar)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Add old / previous debt from register book, diary, or previous software.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpeningBalanceModalOpen(false)}
                className="p-1 text-muted-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordOpeningBalance} className="space-y-3.5 text-xs">
              {/* Customer Selection Mode Toggle */}
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  Customer (ग्राहक) *
                </label>
                <div className="grid grid-cols-2 gap-1 bg-muted/40 p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setOpeningBalanceCustomerMode("existing");
                      if (selectedCustomerId && selectedCustomerId !== 0) {
                        setOpeningBalanceCustomerId(selectedCustomerId);
                        const found = debtors.find((d) => d.customer_id === selectedCustomerId);
                        if (found) {
                          setOpeningBalanceCustomerName(found.customer_name);
                          setOpeningBalanceCustomerPhone(found.customer_phone);
                        }
                      }
                    }}
                    className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer text-center ${
                      openingBalanceCustomerMode === "existing"
                        ? "bg-card text-foreground shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Select Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpeningBalanceCustomerMode("new");
                      setOpeningBalanceCustomerId(null);
                    }}
                    className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all cursor-pointer text-center ${
                      openingBalanceCustomerMode === "new"
                        ? "bg-card text-foreground shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    + New Customer
                  </button>
                </div>
              </div>

              {/* Customer Input Section */}
              {openingBalanceCustomerMode === "existing" ? (
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Choose Customer from Directory:
                  </label>
                  <select
                    value={openingBalanceCustomerId || ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setOpeningBalanceCustomerId(id);
                      const found = debtors.find((d) => d.customer_id === id);
                      if (found) {
                        setOpeningBalanceCustomerName(found.customer_name);
                        setOpeningBalanceCustomerPhone(found.customer_phone);
                      }
                    }}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="" disabled>-- Select Customer --</option>
                    {debtors
                      .filter((d) => d.customer_id !== 0)
                      .map((d) => (
                        <option key={d.customer_id} value={d.customer_id}>
                          {d.customer_name} ({d.customer_phone}) — Current Due: ₹{d.total_balance_due.toLocaleString("en-IN")}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      Customer Name (नाम) *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Aman"
                      value={openingBalanceCustomerName}
                      onChange={(e) => setOpeningBalanceCustomerName(e.target.value)}
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      Mobile Number (मोबाइल नं.) *
                    </label>
                    <Input
                      type="tel"
                      placeholder="e.g. 8278482476"
                      value={openingBalanceCustomerPhone}
                      onChange={(e) => setOpeningBalanceCustomerPhone(e.target.value)}
                      className="h-8 text-xs font-mono bg-background"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Opening Balance Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Opening Debt Amount (उधार राशि) *
                  </label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {openingBalanceAmount ? `₹${Number(openingBalanceAmount).toLocaleString("en-IN")}` : "₹0"}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="Enter old debt amount (e.g. 1500)"
                    value={openingBalanceAmount}
                    onChange={(e) => setOpeningBalanceAmount(e.target.value)}
                    className="h-9 pl-7 text-sm font-mono font-bold bg-background border-amber-500/40 focus:border-amber-500"
                    required
                    autoFocus
                  />
                </div>

                {/* Quick Add Amount Chips */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-medium">Quick add:</span>
                  {[500, 1000, 2000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        const current = parseFloat(openingBalanceAmount) || 0;
                        setOpeningBalanceAmount(String(current + preset));
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                    >
                      +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                  {openingBalanceAmount && (
                    <button
                      type="button"
                      onClick={() => setOpeningBalanceAmount("")}
                      className="px-2 py-0.5 rounded text-[10px] text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 cursor-pointer transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Debt Detail Type (Requested by user) */}
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                  Debt Detail Type (उधार प्रकार / खाता स्रोत) *
                </label>
                <select
                  value={openingBalanceDetailType}
                  onChange={(e) => setOpeningBalanceDetailType(e.target.value)}
                  className="w-full h-8.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Previous Register / Old Khata (पुराना खाता / रजिस्टर)">
                    Previous Register / Old Khata (पुराना खाता / रजिस्टर)
                  </option>
                  <option value="Diary / Notebook Udhar (डायरी उधार)">
                    Diary / Notebook Udhar (डायरी उधार)
                  </option>
                  <option value="Previous Software / Migration Balance">
                    Previous Software / Migration Balance (पुराने सॉफ्टवेयर का बकाया)
                  </option>
                  <option value="Manual Credit / Customer Khata">
                    Manual Credit / Customer Khata (मैन्युअल क्रेडिट खाता)
                  </option>
                  <option value="Emergency Loan / Cash Advance">
                    Emergency Loan / Cash Advance (इमरजेंसी नकद उधार / एडवांस)
                  </option>
                  <option value="Opening Balance (General)">
                    Opening Balance (General Udhar)
                  </option>
                  <option value="Other Past Debt / Custom">
                    Other Past Debt / Custom (अन्य विवरण)
                  </option>
                </select>

                {openingBalanceDetailType === "Other Past Debt / Custom" && (
                  <div className="mt-1.5">
                    <Input
                      type="text"
                      placeholder="Type custom debt type (e.g. Festival Catering Udhar)"
                      value={openingBalanceCustomDetailType}
                      onChange={(e) => setOpeningBalanceCustomDetailType(e.target.value)}
                      className="h-8 text-xs bg-background"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Debt Details / Notes Field (Requested by user: "give me a debt detail type field also where i write details") */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Debt Details & Remarks (विवरण / टिप्पणी)
                  </label>
                  <span className="text-[10px] text-muted-foreground italic">
                    Notebook page, items list, reason, etc.
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={openingBalanceNotes}
                  onChange={(e) => setOpeningBalanceNotes(e.target.value)}
                  placeholder="Write details e.g. 'Old register page 45, groceries pending from last month, promised to pay by 15th'..."
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Debt Date Field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Debt Incurred Date (उधार की तारीख)
                  </label>
                  <Input
                    type="date"
                    value={openingBalanceDate}
                    onChange={(e) => setOpeningBalanceDate(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
                <div className="flex items-center p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                  <AlertCircle size={14} className="shrink-0 mr-1.5" />
                  <span>This balance will be added as an unpaid bill in customer's live ledger.</span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpeningBalanceModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingOpeningBalance || !openingBalanceAmount || parseFloat(openingBalanceAmount) <= 0}
                  size="sm"
                  className="h-8 text-xs font-extrabold cursor-pointer px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingOpeningBalance ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={13} className="animate-spin" /> Recording...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <PlusCircle size={14} /> Record Opening Balance
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Debt Settlement Printable Receipt Modal */}
      <CustomerDebtSettlementReceiptModal
        isOpen={isSettlementReceiptOpen}
        onClose={() => setIsSettlementReceiptOpen(false)}
        data={settlementReceiptData}
      />
    </div>
  );
};
