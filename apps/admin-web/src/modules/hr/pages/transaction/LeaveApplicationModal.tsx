import React, { useState, useEffect } from "react";
import { X, Calendar, Plus, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { Employee } from "../../types/hr.types";

interface LeaveType {
  id: number;
  name: string;
  code: string;
}

interface LeaveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSuccess?: () => void;
}

export const LeaveApplicationModal: React.FC<LeaveApplicationModalProps> = ({
  isOpen,
  onClose,
  employees,
  onSuccess,
}) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [employeeId, setEmployeeId] = useState<string>("");
  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (employees.length > 0 && !employeeId) {
        setEmployeeId(String(employees[0].id));
      }
      api.get<LeaveType[]>("/hr/leave-types")
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setLeaveTypes(res);
            if (!leaveTypeId) {
              setLeaveTypeId(String(res[0].id));
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, employees]);

  const calculateDays = () => {
    try {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 1;
    }
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !leaveTypeId) {
      toast.error("Please select employee and leave type");
      return;
    }
    if (totalDays <= 0) {
      toast.error("End date must be greater than or equal to start date");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/hr/leave-requests", {
        employee_id: Number(employeeId),
        leave_type_id: Number(leaveTypeId),
        from_date: fromDate,
        to_date: toDate,
        reason: reason.trim() || "Annual Leave",
      });
      toast.success("Leave application submitted for approval!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Apply for Leave</h2>
              <p className="text-xs text-muted-foreground">
                Submit employee leave request for supervisor and HR manager authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Employee Staff Member</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employee_code || `#${emp.id}`}) – {emp.role_title || emp.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Leave Policy Type</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
            >
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name} ({lt.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Start Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">End Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* Computed Duration Card */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Total Leave Duration:</span>
            <span className="font-mono font-bold text-primary text-sm">{totalDays} Day{totalDays > 1 ? "s" : ""}</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Reason for Leave</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason or emergency details..."
              className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || totalDays <= 0} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
