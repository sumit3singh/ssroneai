import React, { useState } from "react";
import { 
  DollarSign, FileText, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Plus, Clock, X 
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils/formatters";
import type { Resident } from "../../types";
import { api } from "@ssrone/api-client";
import { PGRentAssessmentModal } from "./PGRentAssessmentModal";
import { PGVisitorLogModal } from "./PGVisitorLogModal";

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
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);

  const fetchVisitors = async () => {
    setIsLoadingVisitors(true);
    try {
      const res = await api.get<any[]>("/pg/visitors").catch(() => []);
      setVisitorLogs(Array.isArray(res) ? res : []);
    } catch {
      setVisitorLogs([]);
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  React.useEffect(() => {
    if (transTab === "visitors") {
      fetchVisitors();
    }
  }, [transTab]);

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
            <Button
              onClick={() => setShowAssessmentModal(true)}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Assess Monthly Rent
            </Button>
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
                  <th className="p-2.5">Check-In Time</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoadingVisitors ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      Loading visitor logs from database...
                    </td>
                  </tr>
                ) : visitorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium text-xs">
                      No visitor check-ins logged. Click <strong>Log New Visitor</strong> to register a visitor.
                    </td>
                  </tr>
                ) : (
                  visitorLogs.map((vl) => {
                    const isCheckedOut = Boolean(vl.check_out_time);
                    return (
                      <tr key={vl.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-2.5 font-semibold text-foreground">{vl.visitor_name}</td>
                        <td className="p-2.5 text-muted-foreground font-mono">{vl.visitor_phone}</td>
                        <td className="p-2.5 font-mono text-[11px] text-muted-foreground">
                          {new Date(vl.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCheckedOut ? "bg-muted text-muted-foreground border border-border" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}>
                            {isCheckedOut ? "Exited Gate" : "Inside Premises"}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          {!isCheckedOut ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await api.patch(`/pg/visitors/${vl.id}/checkout`);
                                toast.success(`Visitor ${vl.visitor_name} checked out`);
                                fetchVisitors();
                              }}
                              className="h-6 text-[11px] px-2"
                            >
                              Gate Exit
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Out at {new Date(vl.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PG Visitor Gatepass Modal */}
      <PGVisitorLogModal
        isOpen={showVisitorModal}
        onClose={() => setShowVisitorModal(false)}
        onVisitorUpdated={fetchVisitors}
      />

      {/* PG Rent Assessment Modal */}
      <PGRentAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
      />
    </div>
  );
};
