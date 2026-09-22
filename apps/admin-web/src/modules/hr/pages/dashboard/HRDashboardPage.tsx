import React, { useState, useEffect } from "react";
import { Users, Database, Receipt, BarChart3, Plus, RefreshCw, Building2 } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { useRouterState } from "@tanstack/react-router";
import { Employee } from "../../types/hr.types";
import { hrService } from "../../services/hr.service";
import { AddEmployeeModal } from "../../components/AddEmployeeModal";
import { HRMasterSection } from "../master/HRMasterSection";
import { DepartmentMasterPage } from "../master/DepartmentMasterPage";
import { DesignationMasterPage } from "../master/DesignationMasterPage";
import { HRTransactionSection } from "../transaction/HRTransactionSection";
import { HRReportSection } from "../report/HRReportSection";

export function HRDashboardPage() {
  const { user, selected_branch } = useAuthStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const activeTenantId = user?.tenant_id || (selected_branch as any)?.tenant_id || 2;
  const activeCompanyId = (selected_branch as any)?.company_id || user?.company_id || 1;
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [activeTab, setActiveTab] = useState<"master" | "transaction" | "report">("master");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  useEffect(() => {
    if (currentPath.includes("/master")) setActiveTab("master");
    else if (currentPath.includes("/transaction")) setActiveTab("transaction");
    else if (currentPath.includes("/report")) setActiveTab("report");
  }, [currentPath]);

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

  const isDepartments = currentPath.includes("/departments");
  const isDesignations = currentPath.includes("/designations");

  if (isDepartments) {
    return (
      <PageContainer>
        <DepartmentMasterPage />
      </PageContainer>
    );
  }

  if (isDesignations) {
    return (
      <PageContainer>
        <DesignationMasterPage />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="HR & Payroll Roster Center"
        description="Single source of truth for staff profiles, attendance punch logs, and monthly payroll"
        icon={<Users size={18} />}
        badge={`${employees.length} Staff Configured`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmployees}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Staff Directory"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            <Button
              onClick={() => {
                setEditingEmp(null);
                setIsModalOpen(true);
              }}
              size="sm"
              className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Add Employee Master
            </Button>
          </div>
        }
      />

      {/* ── Active Section Render ── */}
      {activeTab === "master" && (
        <HRMasterSection
          employees={employees}
          search={search}
          onSearchChange={setSearch}
          onOpenAddModal={() => {
            setEditingEmp(null);
            setIsModalOpen(true);
          }}
          onOpenEditModal={(emp) => {
            setEditingEmp(emp);
            setIsModalOpen(true);
          }}
        />
      )}

      {activeTab === "transaction" && (
        <HRTransactionSection employees={employees} />
      )}

      {activeTab === "report" && (
        <HRReportSection employees={employees} />
      )}

      {isModalOpen && (
        <AddEmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchEmployees}
          editingEmp={editingEmp}
          activeTenantId={user?.tenant_id ? Number(user.tenant_id) : 2}
          activeCompanyId={user?.company_id ? Number(user.company_id) : 1}
          activeBranchId={activeBranchId}
          branchName={selected_branch?.name}
          existingCount={employees.length}
        />
      )}
    </PageContainer>
  );
}
