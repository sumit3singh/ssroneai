import React, { useState } from "react";
import { Wallet, MessageSquare, Plus, CheckCircle2, Award, Clock, X } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { useRouterState } from "@tanstack/react-router";

interface Customer {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  loyalty_points?: number;
}

interface CRMTransactionSectionProps {
  customers: Customer[];
}

export const CRMTransactionSection: React.FC<CRMTransactionSectionProps> = ({ customers }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const transTab = currentPath.includes("/interactions") ? "interactions" : "points";
  const [pointLogs, setPointLogs] = useState<any[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<any[]>([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  return (
    <div className="space-y-4">

      {/* ── TAB 1: Points Earn & Redeem Ledger ── */}
      {transTab === "points" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Daily Loyalty Points Ledger</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">{pointLogs.length} Transactions Executed</span>
              <Button onClick={() => setShowPointModal(true)} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" /> Issue / Redeem Points
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-2.5">Guest Customer</th>
                  <th className="p-2.5">Transaction Type</th>
                  <th className="p-2.5">Points</th>
                  <th className="p-2.5">Reason / Reference</th>
                  <th className="p-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pointLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      No point transactions logged today. Click <strong>Issue / Redeem Points</strong> to process.
                    </td>
                  </tr>
                ) : (
                  pointLogs.map((pl, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">{pl.customer_name}</td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border uppercase ${
                          pl.type === "earn" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}>
                          {pl.type}
                        </span>
                      </td>
                      <td className={`p-2.5 font-mono font-bold ${pl.type === "earn" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {pl.type === "earn" ? `+${pl.points}` : `-${pl.points}`} pts
                      </td>
                      <td className="p-2.5 text-muted-foreground">{pl.reason}</td>
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{pl.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Interaction Log Table ── */}
      {transTab === "interactions" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Customer Support & Interaction History</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">{interactionLogs.length} Logs</span>
              <Button onClick={() => setShowInteractionModal(true)} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" /> Log Interaction
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Channel</th>
                  <th className="p-2.5">Subject / Notes</th>
                  <th className="p-2.5">Sentiment</th>
                  <th className="p-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {interactionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      No interaction logs found. Click <strong>Log Interaction</strong> to record guest feedback or call notes.
                    </td>
                  </tr>
                ) : (
                  interactionLogs.map((il, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">{il.customer_name}</td>
                      <td className="p-2.5 text-muted-foreground">{il.channel}</td>
                      <td className="p-2.5 text-foreground">{il.notes}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border uppercase">
                          {il.sentiment}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{il.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Issue/Redeem Points Modal ── */}
      {showPointModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-md max-w-md w-full p-5 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Issue / Redeem Loyalty Points</h3>
              <button onClick={() => setShowPointModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const customer_name = String(formData.get("customer_name") || "Guest Customer");
                const type = String(formData.get("type") || "earn");
                const points = Number(formData.get("points") || 100);
                const reason = String(formData.get("reason") || "Order Bonus");

                setPointLogs((prev) => [
                  {
                    customer_name,
                    type,
                    points,
                    reason,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev,
                ]);

                toast.success(`Successfully ${type === "earn" ? "issued" : "redeemed"} ${points} points!`);
                setShowPointModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Select Guest Customer</label>
                <select name="customer_name" className="w-full pl-2.5 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium">
                  {customers.length > 0 ? (
                    customers.map((c) => (
                      <option key={c.id} value={c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim()}>
                        {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim()} ({c.phone || "No phone"})
                      </option>
                    ))
                  ) : (
                    <option value="Guest Customer">Guest Customer</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Action Type</label>
                  <select name="type" className="w-full pl-2.5 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium">
                    <option value="earn">Earn Points (+)</option>
                    <option value="redeem">Redeem Points (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-medium mb-1">Points Amount</label>
                  <input name="points" type="number" defaultValue="100" min="1" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Reason / Reference</label>
                <input name="reason" defaultValue="Special Festival Campaign Bonus" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPointModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="text-xs font-semibold">Submit Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
