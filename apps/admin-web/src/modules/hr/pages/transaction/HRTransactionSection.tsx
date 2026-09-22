import React, { useState, useEffect } from "react";
import { Clock, DollarSign, Plus, CheckCircle2, AlertCircle, Calendar, RefreshCw, Check, X, ShieldAlert } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { formatCurrency } from "@/shared/utils/formatters";
import { Employee } from "../../types/hr.types";
import { useRouterState } from "@tanstack/react-router";
import { AttendanceOverrideModal } from "./AttendanceOverrideModal";
import { LeaveApplicationModal } from "./LeaveApplicationModal";
import { PayrollExecutionModal } from "./PayrollExecutionModal";

interface HRTransactionSectionProps {
  employees: Employee[];
}

interface AttendanceRecordDTO {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  designation: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  working_hours: number;
  notes: string | null;
  is_regularized: boolean;
}

interface LeaveRequestDTO {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  leave_type_id: number;
  leave_type_name: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

interface PayrollRunDTO {
  id: number;
  payroll_month: string;
  status: string;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  processed_at: string | null;
}

export const HRTransactionSection: React.FC<HRTransactionSectionProps> = ({ employees }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const transTab = currentPath.includes("/leaves")
    ? "leaves"
    : currentPath.includes("/payroll")
    ? "payroll"
    : "attendance";

  // Data state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordDTO[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDTO[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRunDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [attRes, leaveRes, payRes] = await Promise.all([
        api.get<AttendanceRecordDTO[]>("/hr/attendance/records"),
        api.get<LeaveRequestDTO[]>("/hr/leave-requests"),
        api.get<PayrollRunDTO[]>("/hr/payroll-runs"),
      ]);
      setAttendanceRecords(Array.isArray(attRes) ? attRes : []);
      setLeaveRequests(Array.isArray(leaveRes) ? leaveRes : []);
      setPayrollRuns(Array.isArray(payRes) ? payRes : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load HR transaction records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [transTab]);

  const handleUpdateLeaveStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await api.patch(`/hr/leave-requests/${id}/status`, { status });
      toast.success(`Leave request marked as ${status}`);
      fetchTransactions();
    } catch (err: any) {
      toast.error(err.message || "Failed to update leave status");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── TAB 1: Attendance Log Table ── */}
      {transTab === "attendance" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                Staff Shift & Attendance Ledger
              </h3>
              <p className="text-xs text-muted-foreground">PostgreSQL attendance audit history</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                className="text-xs h-8 gap-1 cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
              <Button
                onClick={() => setIsAttendanceModalOpen(true)}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Regularize Punch
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-center">In Time</th>
                  <th className="p-3 text-center">Out Time</th>
                  <th className="p-3 text-center">Working Hrs</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n}>
                      <td colSpan={7} className="p-4">
                        <div className="h-6 bg-muted/60 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No attendance entries recorded in PostgreSQL. Click <strong>Regularize Punch</strong> to log attendance.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-foreground">
                        {att.employee_name}
                        {att.employee_code && (
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            ({att.employee_code})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{att.designation}</td>
                      <td className="p-3 text-center font-mono">{att.attendance_date}</td>
                      <td className="p-3 text-center font-mono">
                        {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-primary">
                        {att.working_hours ? `${att.working_hours} hrs` : "--"}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          att.status === "present"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : att.status === "half_day"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Leave Applications ── */}
      {transTab === "leaves" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                Staff Leave Applications & Approvals
              </h3>
              <p className="text-xs text-muted-foreground">Manage employee time-off and approval status</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                className="text-xs h-8 gap-1 cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
              <Button
                onClick={() => setIsLeaveModalOpen(true)}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Apply for Leave
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Policy Type</th>
                  <th className="p-3 text-center">Dates</th>
                  <th className="p-3 text-center">Duration</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n}>
                      <td colSpan={7} className="p-4">
                        <div className="h-6 bg-muted/60 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No leave requests pending in database. Click <strong>Apply for Leave</strong> to submit one.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-foreground">{lr.employee_name}</td>
                      <td className="p-3 font-medium text-primary">{lr.leave_type_name}</td>
                      <td className="p-3 text-center font-mono">
                        {lr.from_date} to {lr.to_date}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{lr.total_days} Day{lr.total_days > 1 ? "s" : ""}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-xs">{lr.reason || "--"}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          lr.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : lr.status === "rejected"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {lr.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {lr.status === "pending" ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleUpdateLeaveStatus(lr.id, "approved")}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-500/10 cursor-pointer border-none bg-transparent"
                              title="Approve Leave"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(lr.id, "rejected")}
                              className="p-1 rounded text-destructive hover:bg-destructive/10 cursor-pointer border-none bg-transparent"
                              title="Reject Leave"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: Payroll Register ── */}
      {transTab === "payroll" && (
        <div className="bg-card p-4 rounded-md border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                Monthly Payroll Execution Ledger
              </h3>
              <p className="text-xs text-muted-foreground">PostgreSQL salary disbursement and payslip cycles</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                className="text-xs h-8 gap-1 cursor-pointer"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
              <Button
                onClick={() => setIsPayrollModalOpen(true)}
                size="sm"
                className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
              >
                <DollarSign size={14} /> Execute Monthly Payroll Run
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="p-3">Payroll Cycle</th>
                  <th className="p-3 text-center">Staff Count</th>
                  <th className="p-3 text-right">Gross Total</th>
                  <th className="p-3 text-right">Deductions</th>
                  <th className="p-3 text-right">Net Payable</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Execution Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n}>
                      <td colSpan={7} className="p-4">
                        <div className="h-6 bg-muted/60 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                ) : payrollRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No payroll runs processed yet. Click <strong>Execute Monthly Payroll Run</strong> to generate the salary register.
                    </td>
                  </tr>
                ) : (
                  payrollRuns.map((run) => (
                    <tr key={run.id} className="hover:bg-muted/20">
                      <td className="p-3 font-mono font-bold text-foreground">{run.payroll_month}</td>
                      <td className="p-3 text-center font-mono">{run.total_employees} Employees</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">₹{run.total_gross.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-rose-500">-₹{run.total_deductions.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">₹{run.total_net.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                          {run.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-xs text-muted-foreground">
                        {run.processed_at ? new Date(run.processed_at).toLocaleString() : "--"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Modals */}
      <AttendanceOverrideModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        employees={employees}
        onSuccess={fetchTransactions}
      />

      <LeaveApplicationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        employees={employees}
        onSuccess={fetchTransactions}
      />

      <PayrollExecutionModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        employees={employees}
        onSuccess={fetchTransactions}
      />
    </div>
  );
};
