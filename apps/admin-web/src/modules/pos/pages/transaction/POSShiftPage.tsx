import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User,
  PlusCircle,
  MinusCircle,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  History,
  Coins
} from "lucide-react";
import { Button, PageHeader as UIHeader, PageContainer as UIContainer } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  if (typeof UIContainer !== "undefined" && UIContainer) {
    return <UIContainer className={className}>{children}</UIContainer>;
  }
  return (
    <div className={`p-4 sm:p-5 space-y-4 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
};

const PageHeader: React.FC<any> = (props) => {
  if (typeof UIHeader !== "undefined" && UIHeader) {
    return <UIHeader {...props} />;
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
      <div className="space-y-0.5">
        <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
          {props.icon}
          {props.title}
        </h1>
        {props.description && <p className="text-xs text-muted-foreground">{props.description}</p>}
      </div>
      {props.actions && <div className="flex items-center gap-2 shrink-0">{props.actions}</div>}
    </div>
  );
};

interface PosShiftData {
  id: number;
  shift_number: string;
  cashier_name: string;
  status: "open" | "closed";
  opening_cash: number;
  closing_cash?: number | null;
  expected_cash: number;
  cash_sales: number;
  upi_sales: number;
  card_sales: number;
  total_sales: number;
  pay_ins: number;
  pay_outs: number;
  variance?: number | null;
  opened_at: string;
  closed_at?: string | null;
  notes?: string | null;
  transactions?: Array<{
    id: number;
    type: string;
    amount: number;
    payment_mode: string;
    reason?: string;
    performed_by: string;
    created_at?: string;
  }>;
}

export const POSShiftPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [shift, setShift] = useState<PosShiftData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payType, setPayType] = useState<"PAY_IN" | "PAY_OUT">("PAY_IN");
  const [payAmount, setPayAmount] = useState("");
  const [payReason, setPayReason] = useState("");

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingCash, setClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState("2000");

  const fetchShift = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PosShiftData>("/restaurant/shifts/current");
      setShift(res);
    } catch (err) {
      console.error("Failed to load shift:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handlePayInOut = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!payReason.trim()) {
      toast.error("Please enter a reason for the transaction");
      return;
    }

    try {
      const updated = await api.post<PosShiftData>("/restaurant/shifts/pay-in-out", {
        type: payType,
        amount: amt,
        reason: payReason,
        performed_by: shift?.cashier_name || "Cashier"
      });
      setShift(updated);
      toast.success(`${payType === "PAY_IN" ? "Cash Pay-In" : "Cash Pay-Out"} logged successfully!`);
      setIsPayModalOpen(false);
      setPayAmount("");
      setPayReason("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to record pay-in/out");
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(closingCash);
    if (isNaN(amt) || amt < 0) {
      toast.error("Please enter valid counted closing cash");
      return;
    }

    try {
      const updated = await api.post<PosShiftData>("/restaurant/shifts/close", {
        closing_cash: amt,
        notes: closingNotes
      });
      setShift(updated);
      toast.success("POS Shift closed and reconciled successfully!");
      setIsCloseModalOpen(false);
      setClosingCash("");
      setClosingNotes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to close shift");
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(openingCashInput);
    if (isNaN(amt) || amt < 0) {
      toast.error("Please enter valid opening cash float");
      return;
    }

    try {
      const updated = await api.post<PosShiftData>("/restaurant/shifts/open", {
        opening_cash: amt,
        cashier_name: "Cashier"
      });
      setShift(updated);
      toast.success("New POS Shift opened successfully!");
      setIsOpenModalOpen(false);
      setOpeningCashInput("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to open shift");
    }
  };

  // Expected Cash calculation
  const currentExpectedCash = shift
    ? shift.opening_cash + shift.cash_sales + shift.pay_ins - shift.pay_outs
    : 0;

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Shift & Cash Drawer Management"
        description="Register shift opening float, cash pay-ins/outs, and daily register reconciliation"
        icon={<Wallet size={18} />}
        badge={shift?.status === "open" ? "Shift Active" : "Shift Closed"}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchShift}
              disabled={isLoading}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Shift Data"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            {shift?.status === "open" ? (
              <>
                <Button
                  onClick={() => {
                    setPayType("PAY_IN");
                    setIsPayModalOpen(true);
                  }}
                  size="sm"
                  className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle size={14} /> Pay-In
                </Button>
                <Button
                  onClick={() => {
                    setPayType("PAY_OUT");
                    setIsPayModalOpen(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <MinusCircle size={14} /> Pay-Out
                </Button>
                <Button
                  onClick={() => setIsCloseModalOpen(true)}
                  size="sm"
                  variant="destructive"
                  className="text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Lock size={14} /> Close Shift
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsOpenModalOpen(true)}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle size={14} /> Start New Shift
              </Button>
            )}
          </div>
        }
      />

      {/* Shift Status Summary Bar */}
      <div className="bg-muted/40 border border-border rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-foreground text-sm">
            {shift?.shift_number || "#SH-20260818-001"}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase ${
              shift?.status === "open"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {shift?.status === "open" ? "ACTIVE SHIFT" : "SHIFT CLOSED"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <User size={13} className="text-muted-foreground" /> {shift?.cashier_name || user?.first_name || "Cashier"}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock size={13} className="text-muted-foreground" /> Opened:{" "}
            {shift?.opened_at ? new Date(shift.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "08:30 AM"}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block">
            Opening Cash Float
          </span>
          <span className="font-mono text-xl font-bold text-foreground block">
            ₹{(shift?.opening_cash || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-muted-foreground block">Initial Drawer Balance</span>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider block">
            Net Cash Sales
          </span>
          <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
            ₹{(shift?.cash_sales || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-muted-foreground block">Collected from POS counter</span>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block">
            Digital Sales (UPI / QR)
          </span>
          <span className="font-mono text-xl font-bold text-foreground block">
            ₹{(shift?.upi_sales || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-muted-foreground block">PhonePe, Paytm, GPay</span>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block">
            Card Payments
          </span>
          <span className="font-mono text-xl font-bold text-foreground block">
            ₹{(shift?.card_sales || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-muted-foreground block">Credit / Debit Cards</span>
        </div>
      </div>

      {/* Drawer Balance Summary Bar */}
      <div className="bg-muted/50 border border-border rounded-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded border border-primary/20">
            <Wallet size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-foreground tracking-wider block">
              Total Expected Cash in Drawer
            </span>
            <span className="text-[11px] text-muted-foreground">
              Formula: (Opening Float + Cash Sales + Pay-Ins - Pay-Outs)
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-bold text-primary block">
            ₹{currentExpectedCash.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            Pay-Ins: +₹{shift?.pay_ins || 0} • Pay-Outs: -₹{shift?.pay_outs || 0}
          </span>
        </div>
      </div>

      {/* Drawer Transaction Audit History */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-semibold text-xs text-foreground flex items-center gap-2">
            <History size={16} className="text-primary" />
            Drawer Cash Audit Log & Activity Stream
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {shift?.transactions?.length || 0} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Reason / Details</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {!shift?.transactions || shift.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                    No drawer transactions recorded for this shift yet.
                  </td>
                </tr>
              ) : (
                shift.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded font-mono text-[10px] uppercase border ${
                          tx.type === "OPENING"
                            ? "bg-muted text-muted-foreground border-border"
                            : tx.type === "PAY_IN"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : tx.type === "PAY_OUT"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">{tx.reason || "—"}</td>
                    <td className="py-2.5 px-3 text-foreground font-medium">{tx.performed_by}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground font-mono text-[11px]">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay-In / Pay-Out Dialog */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
              {payType === "PAY_IN" ? (
                <>
                  <PlusCircle size={20} className="text-emerald-500" /> Cash Pay-In (Add Float)
                </>
              ) : (
                <>
                  <MinusCircle size={20} className="text-amber-500" /> Cash Pay-Out (Vendor Expense)
                </>
              )}
            </h3>

            <form onSubmit={handlePayInOut} className="space-y-4">
              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter cash amount..."
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground font-mono font-bold text-base focus:outline-none focus:border-primary"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">
                  Reason / Purpose
                </label>
                <input
                  type="text"
                  placeholder={payType === "PAY_IN" ? "e.g. Petty cash top-up for change" : "e.g. Paid cash for dairy milk supply"}
                  value={payReason}
                  onChange={(e) => setPayReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground font-semibold text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`${
                    payType === "PAY_IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                  } text-white text-xs font-bold px-4 py-2 rounded-xl`}
                >
                  Confirm {payType === "PAY_IN" ? "Pay-In" : "Pay-Out"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Dialog */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Lock size={20} className="text-rose-500" /> Close Shift & Cash Reconciliation
            </h3>

            <div className="bg-muted/40 p-3 rounded-2xl border border-border text-xs space-y-1">
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Expected Cash in Drawer:</span>
                <span className="font-mono font-bold text-foreground">₹{currentExpectedCash.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">
                  Actual Counted Closing Cash (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter physical cash counted in drawer..."
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground font-mono font-bold text-base focus:outline-none focus:border-primary"
                  autoFocus
                  required
                />
              </div>

              {closingCash !== "" && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between font-bold ${
                    parseFloat(closingCash) === currentExpectedCash
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                      : parseFloat(closingCash) > currentExpectedCash
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                  }`}
                >
                  <span>Reconciliation Status:</span>
                  <span className="font-mono font-black uppercase">
                    {parseFloat(closingCash) === currentExpectedCash
                      ? "● PERFECTLY BALANCED"
                      : parseFloat(closingCash) > currentExpectedCash
                      ? `+ OVER BY ₹${(parseFloat(closingCash) - currentExpectedCash).toFixed(2)}`
                      : `- SHORT BY ₹${(currentExpectedCash - parseFloat(closingCash)).toFixed(2)}`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">
                  Shift Closing Notes
                </label>
                <textarea
                  placeholder="Optional end-of-shift notes..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-muted/30 text-foreground text-xs focus:outline-none focus:border-primary resize-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Close Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start New Shift Dialog */}
      {isOpenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border pb-3">
              <PlusCircle size={20} className="text-primary" /> Start New POS Cashier Shift
            </h3>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-2xs font-extrabold uppercase text-muted-foreground mb-1">
                  Opening Cash Float (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="2000.00"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground font-mono font-bold text-base focus:outline-none focus:border-primary"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsOpenModalOpen(false)}
                  className="bg-muted text-muted-foreground hover:bg-muted/80 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Start Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
