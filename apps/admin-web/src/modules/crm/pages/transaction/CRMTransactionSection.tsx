import React, { useState } from "react";
import { Wallet, MessageSquare, Plus, CheckCircle2, Award, Clock } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";

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
  const [transTab, setTransTab] = useState<"points" | "interactions">("points");
  const [pointLogs, setPointLogs] = useState<any[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<any[]>([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header for TRANSACTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransTab("points")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              transTab === "points"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 inline-block mr-1.5" />
            Loyalty Points Earn & Redeem Form
          </button>

          <button
            onClick={() => setTransTab("interactions")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              transTab === "interactions"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline-block mr-1.5" />
            Customer Interaction & Feedback Log
          </button>
        </div>

        {transTab === "points" ? (
          <Button onClick={() => setShowPointModal(true)} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Issue / Redeem Points
          </Button>
        ) : (
          <Button onClick={() => setShowInteractionModal(true)} size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Log Interaction
          </Button>
        )}
      </div>

      {/* ── TAB 1: Points Earn & Redeem Ledger ── */}
      {transTab === "points" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Loyalty Points Ledger</h3>
            <span className="text-xs text-slate-500 font-mono">{pointLogs.length} Transactions Executed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Guest Customer</th>
                  <th className="p-3">Transaction Type</th>
                  <th className="p-3">Points</th>
                  <th className="p-3">Reason / Reference</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pointLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No point transactions logged today. Click <strong>Issue / Redeem Points</strong> to process.
                    </td>
                  </tr>
                ) : (
                  pointLogs.map((pl, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{pl.customer_name}</td>
                      <td className="p-3">
                        <Badge variant={pl.type === "earn" ? "success" : "danger"}>
                          {pl.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className={`p-3 font-bold ${pl.type === "earn" ? "text-emerald-600" : "text-amber-600"}`}>
                        {pl.type === "earn" ? `+${pl.points}` : `-${pl.points}`} pts
                      </td>
                      <td className="p-3 text-slate-500">{pl.reason}</td>
                      <td className="p-3 font-mono text-slate-400">{pl.timestamp}</td>
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Customer Support & Interaction History</h3>
            <span className="text-xs text-slate-500 font-mono">{interactionLogs.length} Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Subject / Notes</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {interactionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No interaction logs found. Click <strong>Log Interaction</strong> to record guest feedback or call notes.
                    </td>
                  </tr>
                ) : (
                  interactionLogs.map((il, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{il.customer_name}</td>
                      <td className="p-3 text-slate-500">{il.channel}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">{il.notes}</td>
                      <td className="p-3">
                        <Badge variant={il.sentiment === "positive" ? "success" : il.sentiment === "negative" ? "danger" : "outline"}>
                          {il.sentiment.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{il.timestamp}</td>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Issue / Redeem Loyalty Points</h3>
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
                <label className="block font-medium mb-1">Select Guest Customer</label>
                <select name="customer_name" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
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
                  <label className="block font-medium mb-1">Action Type</label>
                  <select name="type" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <option value="earn">Earn Points (+)</option>
                    <option value="redeem">Redeem Points (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Points Amount</label>
                  <input name="points" type="number" defaultValue="100" min="1" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Reason / Reference</label>
                <input name="reason" defaultValue="Special Festival Campaign Bonus" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowPointModal(false)} className="px-4 py-2 font-semibold text-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-pink-600 text-white rounded-lg">Submit Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
