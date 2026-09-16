import React, { useState, useEffect } from "react";
import { Building2, Plus, Trash2, Edit2, RefreshCw, X, Save } from "lucide-react";
import { Button, PageHeader } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { hrService } from "../../services/hr.service";
import { Department } from "../../types/hr.types";
import { toast } from "sonner";

export function DepartmentMasterPage() {
  const { user, selected_branch } = useAuthStore();
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getDepartments(activeBranchId);
      setDepartments(data);
    } catch (err) {
      toast.error("Failed to load departments from PostgreSQL");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [activeBranchId]);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setDeptName("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast.error("Department Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDept) {
        await hrService.updateDepartment(editingDept.id, deptName, activeBranchId);
        toast.success(`Department '${deptName}' updated successfully!`);
      } else {
        await hrService.createDepartment(deptName, activeBranchId);
        toast.success(`Department '${deptName}' created successfully!`);
      }
      setDeptName("");
      setEditingDept(null);
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toast.error("Failed to save department: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await hrService.deleteDepartment(id);
      toast.success("Department deleted!");
      fetchDepartments();
    } catch (err) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="space-y-4">
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Department Master Center"
        description="Manage organizational departments and functional divisions directly in PostgreSQL"
        icon={<Building2 size={18} />}
        badge={`${departments.length} Departments`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDepartments}
              className="p-1.5 rounded border border-border bg-background hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              title="Refresh Departments"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            </button>

            <Button onClick={handleOpenAdd} size="sm" className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs">
              <Plus size={14} /> Add Department
            </Button>
          </div>
        }
      />

      {/* Departments Directory Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="font-display font-black text-sm text-foreground uppercase">Master Departments List ({departments.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="pb-3">ID</th>
                <th className="pb-3">Department Name</th>
                <th className="pb-3">Branch Scoping</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-mono text-muted-foreground">#{dept.id}</td>
                  <td className="py-3.5 font-display font-black text-foreground text-sm">{dept.name}</td>
                  <td className="py-3.5 text-muted-foreground">Branch #{dept.branch_id || activeBranchId}</td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground font-semibold">
                    No departments created yet. Click "+ Add Department" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-black text-base text-foreground uppercase">
                {editingDept ? "Edit Department Master" : "Add Department Master"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-muted-foreground mb-1">
                  <span>Department Name</span>
                  <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Dining & Service / Kitchen Operations"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-black flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all shadow-md active:scale-95 text-xs disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSubmitting ? "Saving..." : editingDept ? "Update Department" : "Save Department"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentMasterPage;
