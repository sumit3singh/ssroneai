import React, { useState } from "react";
import { 
  DollarSign, FileText, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Plus, Clock, X 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";

import { useRouterState } from "@tanstack/react-router";

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
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const transTab = currentPath.includes("/visitors") ? "visitors" : "rent";
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  return (
    <div className="space-y-4">

      {/* ── TAB 1: Rent Receipt Entry ── */}
      {transTab === "rent" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                <span>Rent Receipts & Payment Ledger</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">Record daily rent receipts, UPI payments, and generate digital tenant payment vouchers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {residents.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-muted-foreground text-xs border border-dashed border-border rounded-md bg-muted/20 font-medium">
                No active residents found in PostgreSQL DB. Onboard a resident first to collect rent.
              </div>
            ) : (
              residents.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-md border border-border bg-background space-y-2 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-foreground text-xs">{r.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-muted text-muted-foreground border-border">
                        {r.room}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Monthly Rent: <strong className="text-foreground font-mono">{formatCurrency(r.rent)}</strong></p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Due Balance: <strong className="font-mono">{formatCurrency(r.due_amount)}</strong></p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <Button
                      size="sm"
                      onClick={() => onOpenRentModal(r)}
                      className="w-full text-xs font-semibold cursor-pointer"
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
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">Visitor Entry Register</h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-mono">{visitorLogs.length} Visitor Logs Today</span>
              <Button onClick={() => setShowVisitorModal(true)} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
                <Plus className="w-4 h-4" /> Log New Visitor
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-md border border-border overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-2.5">Visitor Name</th>
                  <th className="p-2.5">Phone</th>
                  <th className="p-2.5">Resident Visited</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visitorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      No visitor check-ins logged today. Click <strong>Log New Visitor</strong> to register a visitor.
                    </td>
                  </tr>
                ) : (
                  visitorLogs.map((vl, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">{vl.visitor_name}</td>
                      <td className="p-2.5 text-muted-foreground font-mono">{vl.visitor_phone}</td>
                      <td className="p-2.5 text-foreground font-medium">{vl.resident_name}</td>
                      <td className="p-2.5 text-muted-foreground">{vl.purpose}</td>
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" /> {vl.check_in_time}
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-md max-w-md w-full p-5 border border-border shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">Visitor Check-In Form</h3>
              <button onClick={() => setShowVisitorModal(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

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
                <label className="block text-muted-foreground font-medium mb-1">Visitor Full Name *</label>
                <input name="visitor_name" required placeholder="e.g. Suresh Verma" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Visitor Phone Number *</label>
                <input name="visitor_phone" required placeholder="e.g. 9876543210" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-muted-foreground font-medium mb-1">Resident Visiting</label>
                <select name="resident_name" className="w-full pl-2.5 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium">
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
                <label className="block text-muted-foreground font-medium mb-1">Purpose of Visit</label>
                <input name="purpose" defaultValue="Family / Friend Visit" className="w-full pl-3 pr-2.5 py-1.5 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowVisitorModal(false)} className="text-xs">Cancel</Button>
                <Button type="submit" size="sm" className="text-xs font-semibold">Log Visitor Check-In</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
