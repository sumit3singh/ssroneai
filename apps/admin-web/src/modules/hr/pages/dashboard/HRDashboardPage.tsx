import React, { useState, useEffect, useMemo } from "react";
import { Users, Plus, Search, RefreshCw, Building2 } from "lucide-react";
import { Button } from "@ssrone/ui";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@ssrone/auth";

import { Employee } from "../../types/hr.types";
import { hrService } from "../../services/hr.service";
import { HRStatGrid } from "../../components/HRStatGrid";
import { EmployeeCard } from "../../components/EmployeeCard";
import { AddEmployeeModal } from "../../components/AddEmployeeModal";

export function HRDashboardPage() {
  const { user, selected_branch } = useAuthStore();

  const activeTenantId = user?.tenant_id || selected_branch?.tenant_id || 2;
  const activeCompanyId = selected_branch?.company_id || user?.company_id || 1;
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getEmployees({
        tenant_id: activeTenantId,
        company_id: activeCompanyId,
        branch_id: activeBranchId,
      });
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load PostgreSQL employees directory:", err);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeTenantId, activeCompanyId, activeBranchId]);

  const departments = useMemo(() => {
    const deps = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["All", ...Array.from(deps)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_code.toLowerCase().includes(search.toLowerCase());
      const matchesDept = activeDepartment === "All" || e.department === activeDepartment;
      return matchesSearch && matchesDept;
    });
  }, [search, activeDepartment, employees]);

  const totalPayroll = useMemo(() => {
    return employees.reduce((sum, e) => sum + (e.net_salary || (e.salary + (e.allowances || 0) - (e.deductions || 0))), 0);
  }, [employees]);

  const digitalAppStaff = useMemo(() => {
    return employees.filter((e) => e.can_access_staff_web || e.can_access_kds_web).length;
  }, [employees]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
                HR & Payroll Roster Center
              </h1>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-0.5">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Building2 size={13} /> {selected_branch?.name || `Branch #${activeBranchId}`}
                </span>
                <span>•</span>
                <span>{employees.length} Staff Members</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmployees}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button onClick={handleOpenAdd} className="font-extrabold flex items-center gap-2 cursor-pointer">
            <Plus size={16} />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <HRStatGrid totalStaff={employees.length} digitalAppStaff={digitalAppStaff} totalPayroll={totalPayroll} />

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, or designation..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDepartment(dept)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-2xs font-extrabold border transition-all shrink-0 uppercase cursor-pointer",
                activeDepartment === dept ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEmployees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} onEdit={handleOpenEdit} />
        ))}
      </div>

      {/* Add / Edit Staff Profile Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
        editingEmp={editingEmp}
        activeTenantId={activeTenantId}
        activeCompanyId={activeCompanyId}
        activeBranchId={activeBranchId}
        branchName={selected_branch?.name}
        existingCount={employees.length}
      />
    </div>
  );
}

export default HRDashboardPage;
