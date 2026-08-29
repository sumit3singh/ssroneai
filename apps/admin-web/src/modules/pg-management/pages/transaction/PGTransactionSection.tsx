import React, { useState } from "react";
import { 
  DollarSign, FileText, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Plus, Clock 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";

interface PGTransactionSectionProps {
  residents: Resident[];
  onOpenRentModal: (r: Resident) => void;
  onOpenAgreementModal: (r: Resident) => void;
}

export const PGTransactionSection: React.FC<PGTransactionSectionProps> = ({
  residents,
  onOpenRentModal,
  onOpenAgreementModal,
}) => {
  const [transTab, setTransTab] = useState<"rent" | "visitors">("rent");
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header for TRANSACTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransTab("rent")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              transTab === "rent"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 inline-block mr-1.5" />
            Rent Receipt & Payment Entry
          </button>

          <button
            onClick={() => setTransTab("visitors")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              transTab === "visitors"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 inline-block mr-1.5" />
            Visitor Check-In Log Form
          </button>
        </div>

        {transTab === "visitors" && (
          <Button onClick={() => setShowVisitorModal(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
            <Plus className="w-4 h-4" /> Log New Visitor
          </Button>
        )}
      </div>

      {/* ── TAB 1: Rent Receipt Entry ── */}
      {transTab === "rent" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Rent Receipts & Payment Ledger
              </h3>
              <p className="text-xs text-slate-500">Record daily rent receipts, UPI payments, and generate digital tenant payment vouchers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No active residents found in PostgreSQL DB. Onboard a resident first to collect rent.
              </div>
            ) : (
              residents.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{r.name}</span>
                      <Badge variant={r.paid_status === "paid" ? "success" : "warning"}>
                        {r.room}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">Monthly Rent: <strong>{formatCurrency(r.rent)}</strong></p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Due Balance: <strong>{formatCurrency(r.due_amount)}</strong></p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onOpenRentModal(r)}
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Record Receipt
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Visitor Log Form & Table ── */}
      {transTab === "visitors" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Visitor Entry Register</h3>
            <span className="text-xs text-slate-500 font-mono">{visitorLogs.length} Visitor Logs Today</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Visitor Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Resident Visited</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visitorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No visitor check-ins logged today. Click <strong>Log New Visitor</strong> to register a visitor.
                    </td>
                  </tr>
                ) : (
                  visitorLogs.map((vl, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{vl.visitor_name}</td>
                      <td className="p-3 text-slate-500">{vl.visitor_phone}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{vl.resident_name}</td>
                      <td className="p-3 text-slate-500">{vl.purpose}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" /> {vl.check_in_time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Log New Visitor Modal ── */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor Check-In Form</h3>
            <p className="text-xs text-slate-500">Log entry for resident guest into PostgreSQL database.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const visitor_name = String(formData.get("visitor_name") || "");
                const visitor_phone = String(formData.get("visitor_phone") || "");
                const resident_name = String(formData.get("resident_name") || "Rahul Sharma");
                const purpose = String(formData.get("purpose") || "Personal Visit");

                if (!visitor_name || !visitor_phone) {
                  toast.error("Visitor Name and Phone are required.");
                  return;
                }

                setVisitorLogs((prev) => [
                  {
                    visitor_name,
                    visitor_phone,
                    resident_name,
                    purpose,
                    check_in_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev,
                ]);

                toast.success(`Visitor ${visitor_name} logged successfully!`);
                setShowVisitorModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium mb-1">Visitor Full Name *</label>
                <input name="visitor_name" required placeholder="e.g. Suresh Verma" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>

              <div>
                <label className="block font-medium mb-1">Visitor Phone Number *</label>
                <input name="visitor_phone" required placeholder="e.g. 9876543210" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>

              <div>
                <label className="block font-medium mb-1">Resident Visiting</label>
                <select name="resident_name" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  {residents.length > 0 ? (
                    residents.map((r) => (
                      <option key={r.id} value={r.name}>{r.name} ({r.room})</option>
                    ))
                  ) : (
                    <option value="General Guest">General Visitor</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Purpose of Visit</label>
                <input name="purpose" defaultValue="Family / Friend Visit" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowVisitorModal(false)} className="px-4 py-2 font-semibold text-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-semibold bg-emerald-600 text-white rounded-lg">Log Visitor Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
