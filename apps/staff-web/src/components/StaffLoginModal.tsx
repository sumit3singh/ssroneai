import React, { useState } from "react";
import { ShieldCheck, Building, UserCheck, KeyRound, ArrowRight, AlertCircle } from "lucide-react";
import { setAuth } from "@ssrone/auth";
import { api } from "@ssrone/api-client";

interface StaffLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (staffData: any) => void;
  requiredAccess?: "staff_web" | "kds_web" | "pos";
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  requiredAccess = "staff_web",
}) => {
  const [tenantSlug, setTenantSlug] = useState("baithak-cafe");
  const [staffCode, setStaffCode] = useState("EMP-1001");
  const [pinCode, setPinCode] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const cleanCode = staffCode.trim();
    const cleanPin = pinCode.trim();

    if (!tenantSlug.trim()) {
      setErrorMsg("Please enter Workspace Slug / Tenant.");
      setIsLoading(false);
      return;
    }

    if (!cleanCode) {
      setErrorMsg("Please enter your Staff ID / Code.");
      setIsLoading(false);
      return;
    }

    if (!cleanPin) {
      setErrorMsg("Please enter your Security PIN / Password.");
      setIsLoading(false);
      return;
    }

    try {
      // Execute strict PostgreSQL tenant authentication endpoint
      const response: any = await api.post("/hr/staff/login", {
        identifier: cleanCode,
        pin_code: cleanPin,
        tenant_slug: tenantSlug.trim(),
        app_target: requiredAccess,
      });

      if (!response || !response.employee) {
        setErrorMsg("Authentication failed. Invalid response from PostgreSQL database.");
        setIsLoading(false);
        return;
      }

      const emp = response.employee;

      // Verify Access Entitlements
      if (requiredAccess === "staff_web" && emp.can_access_staff_web === false && emp.is_waiter === false) {
        setErrorMsg(`Employee ${emp.name} does not have Waiter Terminal entitlement!`);
        setIsLoading(false);
        return;
      }

      if (requiredAccess === "kds_web" && emp.can_access_kds_web === false && emp.is_chef === false) {
        setErrorMsg(`Employee ${emp.name} does not have Kitchen KDS entitlement!`);
        setIsLoading(false);
        return;
      }

      // Auto-choose employee's unique branch from PostgreSQL DB record
      const branchId = Number(emp.branch_id || 1);
      const branchName = emp.branch_name || (branchId === 1 ? "Baithak Cafe - CUH Mahendragarh" : "Baithak Cafe - GGN Gurgaon");
      const branchCode = emp.branch_code || (branchId === 1 ? "CUH02" : "GGN01");

      const authPayload = {
        user: {
          id: String(emp.id),
          employee_code: emp.employee_code || cleanCode,
          name: emp.name || emp.full_name || "Staff Member",
          role: emp.role_title || "waiter",
          tenant_id: String(emp.tenant_id || "1"),
          company_id: String(emp.company_id || "1"),
          branch_id: String(branchId),
          branch_code: branchCode,
          branch_name: branchName,
        },
        token: response.access_token,
        tenant_slug: tenantSlug.trim(),
      };

      setAuth(authPayload);
      localStorage.setItem("active_branch_id", String(branchId));
      localStorage.setItem("active_branch_code", branchCode);
      localStorage.setItem("active_branch_name", branchName);

      setIsLoading(false);
      onLoginSuccess(authPayload.user);
    } catch (err: any) {
      console.error("Login verification rejected by PostgreSQL:", err);
      const detailMsg = err?.response?.data?.detail || err?.message || "Invalid Staff ID or Security PIN! Authentication rejected by PostgreSQL.";
      setErrorMsg(detailMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {requiredAccess === "kds_web" ? "Kitchen KDS Station Access" : "Staff Terminal Authentication"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              PostgreSQL Multi-Tenant Security Isolation
            </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Workspace Slug / Tenant */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building size={13} className="text-indigo-600 dark:text-indigo-400" />
              1. Workspace Slug / Tenant:
            </label>
            <input
              type="text"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              placeholder="e.g. baithak-cafe"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* 2. Staff ID / Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
              2. Staff ID / Code:
            </label>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              placeholder="e.g. EMP-1001 or EMP-1003"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* 3. Security PIN / Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <KeyRound size={13} className="text-indigo-600 dark:text-indigo-400" />
              3. Security PIN / Password (Default: 1234):
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="Enter 4-digit PIN..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-center text-base tracking-[0.3em] font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? "Authenticating with Database..." : "Sign In & Launch Terminal"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLoginModal;
