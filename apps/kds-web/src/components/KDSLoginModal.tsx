import React, { useState } from "react";
import { ChefHat, ShieldCheck, ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { setAuth } from "@ssrone/auth";
import { api } from "@ssrone/api-client";

interface KDSLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (staffData: any) => void;
}

export function KDSLoginModal({ isOpen, onLoginSuccess }: KDSLoginModalProps) {
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

    if (!cleanCode) {
      setErrorMsg("Please enter your Chef / Staff ID.");
      setIsLoading(false);
      return;
    }

    if (!cleanPin) {
      setErrorMsg("Please enter your Security PIN / Password.");
      setIsLoading(false);
      return;
    }

    try {
      const response: any = await api.post("/hr/staff/login", {
        identifier: cleanCode,
        pin_code: cleanPin,
        tenant_slug: tenantSlug.trim(),
        app_target: "kds_web",
      });

      if (!response || !response.employee) {
        setErrorMsg("Authentication failed. Invalid response from PostgreSQL database.");
        setIsLoading(false);
        return;
      }

      const emp = response.employee;

      if (!emp.can_access_kds_web && !emp.is_chef) {
        setErrorMsg(`Access Denied: Staff '${emp.name}' does not have Kitchen KDS entitlement! Contact HR Admin.`);
        setIsLoading(false);
        return;
      }

      const branchId = Number(emp.branch_id || 1);
      const branchCode = branchId === 1 ? "CUH02" : "GGN01";
      const branchName = branchId === 1 ? "Baithak Cafe - CUH Mahendragarh" : "Baithak Cafe - GGN Gurgaon";

      const authPayload = {
        user: {
          id: String(emp.id),
          employee_code: emp.employee_code || cleanCode,
          name: emp.name || emp.full_name || "Head Chef",
          role: emp.role_title || "chef",
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

      setIsLoading(false);
      onLoginSuccess(authPayload.user);
    } catch (err: any) {
      console.error("KDS authentication rejected:", err);
      const detailMsg = err?.response?.data?.detail || err?.message || "Invalid Chef ID or Security PIN! Rejection by PostgreSQL.";
      setErrorMsg(detailMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-white">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <ChefHat size={28} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider font-display">
            Kitchen Display Terminal (KDS)
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            PostgreSQL Multi-Tenant Kitchen Order Authentication
          </p>
        </div>

        {/* Diagnostic Error Box */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs font-semibold animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Workspace Slug / Tenant
            </label>
            <input
              type="text"
              required
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              placeholder="baithak-cafe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Chef / Staff Code or Phone *
            </label>
            <input
              type="text"
              required
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
              placeholder="e.g. EMP-1001 or Phone"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Security PIN / Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono pl-9"
              />
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? "Verifying Credentials..." : "Authenticate KDS Access"}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-[10px] text-slate-400 font-mono">
            <ShieldCheck size={12} className="text-amber-400" />
            <span>PostgreSQL HRMS Security Boundary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
