import React, { useState, useEffect } from "react";
import { Clock, UserCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { Employee } from "../../types/hr.types";
import { hrService } from "../../services/hr.service";
import { toast } from "sonner";

export function AttendancePunchPage() {
  const { user, selected_branch } = useAuthStore();
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [punchedEmpIds, setPunchedEmpIds] = useState<Set<string>>(new Set());

  const fetchRosterAndAttendance = async () => {
    setIsLoading(true);
    try {
      const [list, todayPunches] = await Promise.all([
        hrService.getEmployees({ branch_id: activeBranchId }),
        hrService.getTodayAttendance(activeBranchId)
      ]);

      setEmployees(list);

      const checkedInSet = new Set<string>();
      if (Array.isArray(todayPunches)) {
        todayPunches.forEach((p) => {
          if (p.employee_id) checkedInSet.add(String(p.employee_id));
        });
      }
      setPunchedEmpIds(checkedInSet);
    } catch (err) {
      toast.error("Failed to load attendance punch data from PostgreSQL");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRosterAndAttendance();
  }, [activeBranchId]);

  const handlePunchIn = async (emp: Employee) => {
    try {
      await hrService.punchAttendance(emp.id, activeBranchId, "present");
      setPunchedEmpIds((prev) => new Set(prev).add(String(emp.id)));
      toast.success(`Daily attendance punched into PostgreSQL for ${emp.name} (${emp.employee_code})!`);
    } catch (err: any) {
      toast.error("Failed to punch attendance: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Clock size={20} />
            </div>
            <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
              Daily Attendance Punch Board
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Record duty check-ins directly into PostgreSQL attendance records
          </p>
        </div>

        <button
          onClick={fetchRosterAndAttendance}
          className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const isPunched = punchedEmpIds.has(String(emp.id));
          return (
            <div key={emp.id} className="bg-card border border-border rounded-3xl p-5 space-y-3 shadow-card flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-muted-foreground">{emp.employee_code}</span>
                <h3 className="font-display font-black text-sm text-foreground">{emp.name}</h3>
                <p className="text-2xs text-muted-foreground font-bold">{emp.role} • {emp.department}</p>
              </div>

              {isPunched ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 size={14} /> Checked In
                </span>
              ) : (
                <Button onClick={() => handlePunchIn(emp)} size="sm" className="font-bold flex items-center gap-1 cursor-pointer">
                  <UserCheck size={14} /> Punch In
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttendancePunchPage;
