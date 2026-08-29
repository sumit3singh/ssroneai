import React, { useState, useEffect } from "react";
import { UserCheck, Plus, Trash2, RefreshCw, X, Save, Building2 } from "lucide-react";
import { Button } from "@ssrone/ui";
import { useAuthStore } from "@ssrone/auth";
import { hrService } from "../../services/hr.service";
import { Department, Designation } from "../../types/hr.types";
import { toast } from "sonner";

export function DesignationMasterPage() {
  const { user, selected_branch } = useAuthStore();
  const activeBranchId = selected_branch?.id || user?.branch_id || 1;

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [desigData, deptData] = await Promise.all([
        hrService.getDesignations(activeBranchId),
        hrService.getDepartments(activeBranchId)
      ]);
      setDesignations(desigData);
      setDepartments(deptData);
    } catch (err) {
      toast.error("Failed to load designations from PostgreSQL");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeBranchId]);

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Designation Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await hrService.createDesignation(title, departmentId || undefined, activeBranchId);
      toast.success(`Designation '${title}' created successfully!`);
      setTitle("");
      setDepartmentId("");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to create designation: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this designation?")) return;
    try {
      await hrService.deleteDesignation(id);
      toast.success("Designation deleted!");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete designation");
    }
  };

  const getDeptName = (deptId?: string) => {
    if (!deptId) return "General / All Departments";
    const found = departments.find((d) => String(d.id) === String(deptId));
    return found ? found.name : `Department #${deptId}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
              <UserCheck size={20} />
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-foreground uppercase tracking-wider">
                Designation & Role Title Master
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage job designations and staff role titles linked to departments in PostgreSQL
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>

          <Button onClick={() => setIsModalOpen(true)} className="font-extrabold flex items-center gap-2 cursor-pointer">
            <Plus size={16} />
            <span>Add Designation</span>
          </Button>
        </div>
      </div>

      {/* Designations Directory Table */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="font-display font-black text-sm text-foreground uppercase">Master Designations List ({designations.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold">
            <thead className="border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="pb-3">ID</th>
                <th className="pb-3">Designation Title</th>
                <th className="pb-3">Department Association</th>
                <th className="pb-3">Branch Scoping</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {designations.map((desig) => (
                <tr key={desig.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 font-mono text-muted-foreground">#{desig.id}</td>
                  <td className="py-3.5 font-display font-black text-foreground text-sm">{desig.title}</td>
                  <td className="py-3.5 text-primary flex items-center gap-1 font-bold">
                    <Building2 size={13} /> {getDeptName(desig.department_id)}
                  </td>
                  <td className="py-3.5 text-muted-foreground">Branch #{desig.branch_id || activeBranchId}</td>
                  <td className="py-3.5 text-center">
                    <button
                      onClick={() => handleDelete(desig.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                      title="Delete Designation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {designations.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                    No designations created yet. Click "+ Add Designation" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Designation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-black text-base text-foreground uppercase">Add Designation Master</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDesignation} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-muted-foreground mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Captain / Head Chef / Front Desk Officer"
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Associate Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-bold"
                >
                  <option value="">-- General / All Departments --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
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
                  <span>{isSubmitting ? "Saving..." : "Save Designation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DesignationMasterPage;
