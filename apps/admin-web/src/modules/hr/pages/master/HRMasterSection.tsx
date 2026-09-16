import React, { useState } from "react";
import { Users, Plus, Search, ShieldCheck, Phone, Mail, Award, CheckCircle2, Building2 } from "lucide-react";
import { Button, Badge } from "@ssrone/ui";
import { Employee } from "../../types/hr.types";
import { EmployeeCard } from "../../components/EmployeeCard";

interface HRMasterSectionProps {
  employees: Employee[];
  search: string;
  onSearchChange: (v: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (emp: Employee) => void;
}

import { useRouterState } from "@tanstack/react-router";
import { DepartmentMasterPage } from "./DepartmentMasterPage";
import { DesignationMasterPage } from "./DesignationMasterPage";

export const HRMasterSection: React.FC<HRMasterSectionProps> = ({
  employees,
  search,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const masterTab = currentPath.includes("/departments")
    ? "departments"
    : currentPath.includes("/designations")
    ? "designations"
    : "directory";

  return (
    <div className="space-y-4">
      {/* ── TAB 1: Employee Directory Master ── */}
      {masterTab === "directory" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-md border border-border">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search staff by name, role, code..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">{employees.length} Active Staff in PostgreSQL DB</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                No active staff profiles found in PostgreSQL database. Click <strong>Add Employee Master</strong> to register staff.
              </div>
            ) : (
              employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} onEdit={() => onOpenEditModal(emp)} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Department Master ── */}
      {masterTab === "departments" && <DepartmentMasterPage />}

      {/* ── TAB 3: Designation Master ── */}
      {masterTab === "designations" && <DesignationMasterPage />}
    </div>
  );
};
