import React, { useState } from "react";
import { X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { Employee } from "../../types/hr.types";

interface AttendanceOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSuccess?: () => void;
}

export const AttendanceOverrideModal: React.FC<AttendanceOverrideModalProps> = ({
  isOpen,
  onClose,
  employees,
  onSuccess,
}) => {
  const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id ? String(employees[0].id) : "");
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [checkInTime, setCheckInTime] = useState<string>("09:00");
  const [checkOutTime, setCheckOutTime] = useState<string>("18:00");
  const [status, setStatus] = useState<string>("present");
  const [notes, setNotes] = useState<string>("Manager Override / Regularization");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      setSaving(true);
      await api.post("/hr/attendance/override", {
        employee_id: Number(employeeId),
        attendance_date: attendanceDate,
        check_in_time: checkInTime || null,
        check_out_time: checkOutTime || null,
        status,
        notes: notes.trim(),
      });
      toast.success("Attendance entry regularized in PostgreSQL!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to regularize attendance");
    } finally {
      setSaving(false);
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
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Attendance Regularization Override</h2>
              <p className="text-xs text-muted-foreground">
                Manually record punch-in/out times or update attendance statuses
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

        {/* Form */}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Attendance Date</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs h-9 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Duty Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-2 rounded border border-border bg-background text-xs text-foreground cursor-pointer focus:outline-none"
              >
                <option value="present">Present (Full Day)</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="leave">On Approved Leave</option>
                <option value="holiday">Official Holiday</option>
              </select>
            </div>
          </div>

          {status !== "absent" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Punch In Time</label>
                <Input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Punch Out Time</label>
                <Input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Reason / Audit Remarks</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Biometric device offline, Outdoor duty"
              className="text-xs h-9"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
              <CheckCircle2 size={13} /> Save Regularization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
