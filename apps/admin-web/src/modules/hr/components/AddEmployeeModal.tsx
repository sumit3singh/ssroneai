import React, { useState, useEffect } from "react";
import { X, Save, Shield, Smartphone, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { Employee, CreateEmployeePayload } from "../types/hr.types";
import { hrService } from "../services/hr.service";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEmp: Employee | null;
  activeTenantId: number;
  activeCompanyId: number;
  activeBranchId: number;
  branchName?: string;
  existingCount: number;
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  editingEmp,
  activeTenantId,
  activeCompanyId,
  activeBranchId,
  branchName,
  existingCount,
}: AddEmployeeModalProps) {
  const [formState, setFormState] = useState({
    name: "",
    employee_code: `EMP-${1001 + existingCount}`,
    designation: "Server",
    role: "Server",
    department: "Service",
    salary: 20000,
    allowances: 0,
    deductions: 0,
    contact: "",
    email: "",
    pin_code: "1234",
    can_access_staff_web: true,
    can_access_kds_web: false,
  });

  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbDesignations, setDbDesignations] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        hrService.getDepartments(activeBranchId),
        hrService.getDesignations(activeBranchId),
      ]).then(([depts, desigs]) => {
        setDbDepartments(depts || []);
        setDbDesignations(desigs || []);
      }).catch((err) => {
        console.error("Failed to load departments/designations for modal:", err);
      });
    }
  }, [isOpen, activeBranchId]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    setErrorDetails(null);
    if (editingEmp) {
      setFormState({
        name: editingEmp.name || (editingEmp as any).full_name || "",
        employee_code: editingEmp.employee_code || "",
        designation: editingEmp.designation || editingEmp.role || "",
        role: editingEmp.role || editingEmp.designation || "",
        department: editingEmp.department || (editingEmp as any).department_name || "Service",
        salary: (editingEmp as any).basic_salary || editingEmp.salary || 20000,
        allowances: editingEmp.allowances || 0,
        deductions: editingEmp.deductions || 0,
        contact: editingEmp.contact || (editingEmp as any).phone || "",
        email: editingEmp.email || "",
        pin_code: editingEmp.pin_code || "1234",
        can_access_staff_web: Boolean(editingEmp.can_access_staff_web),
        can_access_kds_web: Boolean(editingEmp.can_access_kds_web),
      });
    } else {
      setFormState({
        name: "",
        employee_code: `EMP-${1001 + existingCount}`,
        designation: dbDesignations[0]?.title || "Server",
        role: dbDesignations[0]?.title || "Server",
        department: dbDepartments[0]?.name || "Service",
        salary: 20000,
        allowances: 0,
        deductions: 0,
        contact: "",
        email: "",
        pin_code: "1234",
        can_access_staff_web: true,
        can_access_kds_web: false,
      });
    }
  }, [editingEmp, existingCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    if (!formState.name.trim()) {
      setErrorDetails("Employee Full Name is required.");
      return;
    }
    if (!formState.contact.trim()) {
      setErrorDetails("Contact Phone Number is required.");
      return;
    }

    const nameParts = formState.name.trim().split(" ");
    const firstName = nameParts[0] || "Staff";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload: CreateEmployeePayload = {
      tenant_id: activeTenantId,
      company_id: activeCompanyId,
      branch_id: activeBranchId,
      employee_code: formState.employee_code || `EMP-${Date.now().toString().slice(-4)}`,
      full_name: formState.name,
      first_name: firstName,
      last_name: lastName,
      designation: formState.designation || formState.role,
      department_name: formState.department,
      phone: formState.contact || "9876543210",
      email: formState.email || `${formState.employee_code.toLowerCase()}@baithakcafe.com`,
      basic_salary: Number(formState.salary),
      allowances: Number(formState.allowances),
      deductions: Number(formState.deductions),
      pin_code: formState.pin_code || "1234",
      role_title: formState.role,
      can_access_staff_web: formState.can_access_staff_web,
      can_access_kds_web: formState.can_access_kds_web,
      is_waiter: formState.can_access_staff_web || formState.role.toLowerCase().includes("waiter") || formState.role.toLowerCase().includes("server"),
      is_chef: formState.can_access_kds_web || formState.role.toLowerCase().includes("chef") || formState.role.toLowerCase().includes("cook"),
    };

    setIsSubmitting(true);
    try {
      if (editingEmp) {
        await hrService.updateEmployee(editingEmp.id, payload);
        toast.success(`Staff member '${formState.name}' updated cleanly!`);
      } else {
        await hrService.createEmployee(payload);
        toast.success(`Staff member '${formState.name}' saved under Branch #${activeBranchId}!`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save staff member:", err);
      const detailMsg = err.response?.data?.detail 
        ? (typeof err.response.data.detail === "object" ? JSON.stringify(err.response.data.detail, null, 2) : String(err.response.data.detail))
        : (err.response?.data ? JSON.stringify(err.response.data, null, 2) : (err.stack || err.message || "Network Error"));

      const fullFormattedError = `[API Error Status ${err.response?.status || 'Network/CORS'}] ${detailMsg}`;
      setErrorDetails(fullFormattedError);
      toast.error("Failed to save staff member: " + (err.response?.data?.detail || err.message || "Error saving record"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-display font-black text-base text-foreground uppercase">
              {editingEmp ? "Edit Staff Profile & App Permissions" : "Add Staff Profile"}
            </h3>
            <p className="text-3xs text-muted-foreground font-bold">
              Scoped to Branch #{activeBranchId} ({branchName || "Active Branch"})
            </p>
          </div>
          <button onClick={onClose} type="button" className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Employee Full Name</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Ramesh Singh"
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Staff Code / ID</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.employee_code}
                onChange={(e) => setFormState({ ...formState, employee_code: e.target.value })}
                placeholder="e.g. EMP-1001"
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Designation / Role Title</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <select
                value={formState.designation}
                onChange={(e) => setFormState({ ...formState, designation: e.target.value, role: e.target.value })}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-bold"
              >
                {dbDesignations.length === 0 ? (
                  <>
                    <option value="Server">Server / Waiter</option>
                    <option value="Chef">Head Chef / Cook</option>
                    <option value="Manager">Store Manager</option>
                    <option value="Cashier">POS Cashier</option>
                  </>
                ) : (
                  dbDesignations.map((d: any) => (
                    <option key={d.id} value={d.title}>
                      {d.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Department</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <select
                value={formState.department}
                onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-bold"
              >
                {dbDepartments.length === 0 ? (
                  <>
                    <option value="Service & Dining">Service & Dining</option>
                    <option value="Kitchen & Cooking">Kitchen & Cooking</option>
                    <option value="Front Desk & Reception">Front Desk & Reception</option>
                    <option value="Housekeeping & Maintenance">Housekeeping & Maintenance</option>
                    <option value="Management & Accounting">Management & Accounting</option>
                  </>
                ) : (
                  dbDepartments.map((dept: any) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Contact Phone Number</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.contact}
                onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">
                <span>Login PIN / Password</span>
                <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formState.pin_code}
                onChange={(e) => setFormState({ ...formState, pin_code: e.target.value })}
                placeholder="1234"
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="p-3.5 bg-muted/20 border border-border rounded-2xl space-y-2">
            <p className="text-3xs font-black uppercase text-muted-foreground tracking-wider">Salary Master Setup</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 text-[10px]">Basic (₹)</label>
                <input
                  type="number"
                  value={formState.salary}
                  onChange={(e) => setFormState({ ...formState, salary: Number(e.target.value) })}
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 text-[10px]">Allowances (₹)</label>
                <input
                  type="number"
                  value={formState.allowances}
                  onChange={(e) => setFormState({ ...formState, allowances: Number(e.target.value) })}
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 text-[10px]">Deductions (₹)</label>
                <input
                  type="number"
                  value={formState.deductions}
                  onChange={(e) => setFormState({ ...formState, deductions: Number(e.target.value) })}
                  className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground font-mono"
                />
              </div>
            </div>
          </div>

          {/* Granular Staff App Access Toggles (Staff-Web & KDS-Web) */}
          <div className="p-3.5 bg-card border border-primary/30 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-primary">
              <Shield size={14} />
              <p className="text-xs font-black uppercase tracking-wider">Staff App Permission Controls</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Enable digital app access for Waiter & Kitchen staff. POS Billing rights are governed under User Master RBAC.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Staff-Web Companion (Port 8084)</p>
                    <p className="text-[9px] text-muted-foreground">Allows waiter table ordering access</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.can_access_staff_web}
                  onChange={(e) => setFormState({ ...formState, can_access_staff_web: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <ChefHat size={14} className="text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-foreground">KDS-Web Kitchen Display (Port 8083)</p>
                    <p className="text-[9px] text-muted-foreground">Allows chef order processing & kitchen tickets access</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.can_access_kds_web}
                  onChange={(e) => setFormState({ ...formState, can_access_kds_web: e.target.checked })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* On-Screen Diagnostic Alert Box */}
          {errorDetails && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-1.5 text-rose-600 dark:text-rose-400 font-mono text-[11px]">
              <div className="flex items-center justify-between font-black uppercase text-xs">
                <span className="flex items-center gap-1.5"><X size={14} /> Save Error Diagnostic</span>
                <button type="button" onClick={() => setErrorDetails(null)} className="hover:underline text-[10px] cursor-pointer">Dismiss</button>
              </div>
              <pre className="whitespace-pre-wrap break-all bg-black/20 p-2.5 rounded-xl border border-rose-500/20 max-h-36 overflow-y-auto">
                {errorDetails}
              </pre>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold cursor-pointer text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-black flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shadow-md active:scale-95 text-xs disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSubmitting ? "Saving..." : editingEmp ? "Update Staff Member" : "Save Staff Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
