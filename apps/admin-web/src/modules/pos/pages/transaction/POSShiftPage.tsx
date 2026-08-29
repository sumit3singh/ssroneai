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
import { Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";
import { useAuthStore } from "@ssrone/auth";

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
    <div className="space-y-6">
      {/* Shift Overview Banner */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-xl text-foreground">
                {shift?.shift_number || "#SH-20260818-001"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  shift?.status === "open"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                }`}
              >
                ● {shift?.status === "open" ? "ACTIVE SHIFT OPEN" : "SHIFT CLOSED"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1">
                <User size={13} className="text-primary" /> {shift?.cashier_name || user?.first_name || "Cashier"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-primary" /> Opened:{" "}
                {shift?.opened_at ? new Date(shift.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "08:30 AM"}
              </span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchShift}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh Shift Data"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-primary" : ""} />
            </button>

            {shift?.status === "open" ? (
              <>
                <Button
                  onClick={() => {
                    setPayType("PAY_IN");
                    setIsPayModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle size={15} /> + Cash Pay-In
                </Button>
                <Button
                  onClick={() => {
                    setPayType("PAY_OUT");
                    setIsPayModalOpen(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <MinusCircle size={15} /> - Cash Pay-Out
                </Button>
                <Button
                  onClick={() => setIsCloseModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Lock size={15} /> Close Shift & Reconcile
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsOpenModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle size={15} /> + Start New Shift
              </Button>
            )}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-1">
            <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-wider block">
              Opening Cash Float
            </span>
            <span className="font-mono text-xl font-black text-foreground block">
              ₹{(shift?.opening_cash || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-foreground block">Initial Drawer Balance</span>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-3xs font-extrabold uppercase text-emerald-600 tracking-wider block">
              Net Cash Sales
            </span>
            <span className="font-mono text-xl font-black text-emerald-600 block">
              ₹{(shift?.cash_sales || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-foreground block">Collected from POS counter</span>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-3xs font-extrabold uppercase text-blue-600 tracking-wider block">
              Digital Sales (UPI / QR)
            </span>
            <span className="font-mono text-xl font-black text-blue-600 block">
              ₹{(shift?.upi_sales || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-foreground block">PhonePe, Paytm, GPay</span>
          </div>

          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-3xs font-extrabold uppercase text-purple-600 tracking-wider block">
              Card Payments
            </span>
            <span className="font-mono text-xl font-black text-purple-600 block">
              ₹{(shift?.card_sales || 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-foreground block">Credit / Debit Cards</span>
          </div>
        </div>

        {/* Drawer Balance Summary Bar */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary text-white rounded-xl shadow-md">
              <Wallet size={24} />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-foreground tracking-wider block">
                Total Expected Cash in Drawer
              </span>
              <span className="text-xs text-muted-foreground">
                Formula: (Opening Float + Cash Sales + Pay-Ins - Pay-Outs)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-primary block">
              ₹{currentExpectedCash.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Pay-Ins: +₹{shift?.pay_ins || 0} • Pay-Outs: -₹{shift?.pay_outs || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Drawer Transaction Audit History */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
            <History size={18} className="text-primary" />
            Drawer Cash Audit Log & Activity Stream
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {shift?.transactions?.length || 0} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Reason / Details</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold">
              {!shift?.transactions || shift.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    No drawer transactions recorded for this shift yet.
                  </td>
                </tr>
              ) : (
                shift.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase ${
                          tx.type === "OPENING"
                            ? "bg-blue-500/10 text-blue-600"
                            : tx.type === "PAY_IN"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : tx.type === "PAY_OUT"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-foreground">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{tx.reason || "—"}</td>
                    <td className="py-3 px-3 text-foreground">{tx.performed_by}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground font-mono text-[11px]">
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
    </div>
  );
};
