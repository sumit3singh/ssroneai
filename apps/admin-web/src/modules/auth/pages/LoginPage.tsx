import { useState, type FormEvent, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Hotel, Lock, Mail, Building, MapPin,
  Sparkles, Calendar, Loader2, Globe, Shield, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@ssrone/auth";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tenantSlug, setTenantSlug] = useState("baithak-cafe");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [finYears, setFinYears] = useState<any[]>([]);
  const [contextError, setContextError] = useState<string | null>(null);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedFinYear, setSelectedFinYear] = useState<string>("");

  const [isLoadingContext, setIsLoadingContext] = useState(false);

  // In-memory cache & AbortController ref for clean request cancellation
  const contextCacheRef = useRef<Map<string, { companies: any[]; branches: any[]; finYears: any[] }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to load context for a specific tenant slug directly from PostgreSQL (Pure SSOT)
  const loadContext = async (slug: string) => {
    const cleanSlug = slug.trim();
    if (!cleanSlug) {
      setCompanies([]);
      setBranches([]);
      setFinYears([]);
      setSelectedCompanyId("");
      setSelectedBranchId("");
      setSelectedFinYear("");
      setContextError(null);
      setIsLoadingContext(false);
      return;
    }

    // Check fast in-memory cache of DB-returned data
    const cached = contextCacheRef.current.get(cleanSlug);
    if (cached) {
      setCompanies(cached.companies);
      setBranches(cached.branches);
      setFinYears(cached.finYears);
      if (cached.companies.length > 0) setSelectedCompanyId(String(cached.companies[0].id));
      if (cached.branches.length > 0) setSelectedBranchId(String(cached.branches[0].id));
      if (cached.finYears.length > 0) setSelectedFinYear(String(cached.finYears[0].code ?? cached.finYears[0].id));
      setContextError(null);
      setIsLoadingContext(false);
      return;
    }

    // Cancel any in-flight context request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoadingContext(true);
    setContextError(null);

    try {
      // Query PostgreSQL backend SSOT endpoint
      const res = await api.get<{
        companies: any[];
        branches: any[];
        roles: any[];
        financial_years: any[];
      }>(
        `/auth/public/context?tenant_slug=${encodeURIComponent(cleanSlug)}`,
        {},
        { signal: controller.signal }
      );

      const fetchedCompanies = res?.companies || [];
      const fetchedBranches = res?.branches || [];
      const fetchedFinYears = res?.financial_years || [];

      setCompanies(fetchedCompanies);
      setBranches(fetchedBranches);
      setFinYears(fetchedFinYears);

      // Save response to cache
      contextCacheRef.current.set(cleanSlug, {
        companies: fetchedCompanies,
        branches: fetchedBranches,
        finYears: fetchedFinYears,
      });

      if (fetchedCompanies.length > 0) {
        setSelectedCompanyId(String(fetchedCompanies[0].id));
      } else {
        setSelectedCompanyId("");
      }

      if (fetchedBranches.length > 0) {
        setSelectedBranchId(String(fetchedBranches[0].id));
      } else {
        setSelectedBranchId("");
      }

      if (fetchedFinYears.length > 0) {
        setSelectedFinYear(String(fetchedFinYears[0].code ?? fetchedFinYears[0].id));
      } else {
        setSelectedFinYear("");
      }

      if (fetchedCompanies.length === 0 || fetchedBranches.length === 0) {
        setContextError(`No active workspace found in PostgreSQL database for '${cleanSlug}'.`);
      } else {
        setContextError(null);
      }
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return; // Ignore aborted requests cleanly
      }
      setCompanies([]);
      setBranches([]);
      setFinYears([]);
      setSelectedCompanyId("");
      setSelectedBranchId("");
      setSelectedFinYear("");
      const msg = err instanceof Error ? err.message : String(err);
      setContextError(`Unable to load workspace from PostgreSQL database: ${msg}`);
    } finally {
      setIsLoadingContext(false);
    }
  };

  // Debounced context fetch when workspace slug is typed by user
  useEffect(() => {
    const cleanSlug = tenantSlug.trim();
    if (!cleanSlug) {
      setIsLoadingContext(false);
      setCompanies([]);
      setBranches([]);
      setFinYears([]);
      setSelectedCompanyId("");
      setSelectedBranchId("");
      setSelectedFinYear("");
      setContextError(null);
      return;
    }
    const timer = setTimeout(() => {
      void loadContext(cleanSlug);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [tenantSlug]);

  // Filter branches for selected company (or show all tenant branches if company_id is omitted)
  const filteredBranches = useMemo(() => {
    if (!branches || branches.length === 0) return [];
    if (!selectedCompanyId) return branches;
    const matches = branches.filter((b: any) => 
      !b.company_id || String(b.company_id) === String(selectedCompanyId)
    );
    return matches.length > 0 ? matches : branches;
  }, [branches, selectedCompanyId]);

  // Sync selected IDs cleanly when collections update
  useEffect(() => {
    if (companies.length > 0 && (!selectedCompanyId || !companies.some(c => String(c.id) === String(selectedCompanyId)))) {
      setSelectedCompanyId(String(companies[0].id));
    }
  }, [companies, selectedCompanyId]);

  useEffect(() => {
    if (filteredBranches.length > 0 && (!selectedBranchId || !filteredBranches.some(b => String(b.id) === String(selectedBranchId)))) {
      setSelectedBranchId(String(filteredBranches[0].id));
    }
  }, [filteredBranches, selectedBranchId]);

  useEffect(() => {
    if (finYears.length > 0 && (!selectedFinYear || !finYears.some(fy => String(fy.code) === String(selectedFinYear)))) {
      setSelectedFinYear(String(finYears[0].code));
    }
  }, [finYears, selectedFinYear]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();

    if (!tenantSlug) {
      toast.error("Workspace Slug is required.");
      return;
    }

    if (!selectedCompanyId || !selectedBranchId || !selectedFinYear) {
      toast.error("Please select a company, unit, and financial year from PostgreSQL database.");
      return;
    }

    const company = companies.find((c) => String(c.id) === String(selectedCompanyId));
    const branch = branches.find((b) => String(b.id) === String(selectedBranchId));

    if (!company || !branch) {
      toast.error("Invalid organizational context selected from PostgreSQL database.");
      return;
    }

    setIsSubmitting(true);
    try {
      await auth.login({
        tenant_slug: tenantSlug,
        email,
        password
      });

      auth.setSelectedCompany(company);
      auth.setSelectedBranch(branch);
      const finYearObj = finYears.find((fy) => fy.code === selectedFinYear) || { code: selectedFinYear, name: selectedFinYear };
      auth.setSelectedFinYear(finYearObj as any);

      toast.success("ERP workspace initialized successfully!");
      void navigate({ to: "/" });
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#FAF9F5] overflow-hidden text-slate-800 font-sans select-none relative">

      {/* Injecting custom keyframes for premium UI animations */}
      <style>{`
        @keyframes rotate-3d-outer {
          0% { transform: rotateX(60deg) rotateY(-15deg) rotateZ(0deg); }
          100% { transform: rotateX(60deg) rotateY(-15deg) rotateZ(360deg); }
        }
        @keyframes rotate-3d-middle {
          0% { transform: rotateX(60deg) rotateY(15deg) rotateZ(360deg); }
          100% { transform: rotateX(60deg) rotateY(15deg) rotateZ(0deg); }
        }
        @keyframes float-y-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-card-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-8px, -10px) scale(1.02); }
        }
        @keyframes float-card-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(8px, 10px) scale(1.02); }
        }
      `}</style>

      {/* Background radial glows */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Left side: Clean 3D AI Logo Graphics Panel (Original Light Design System) */}
      <div className="w-[45%] hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#F3EFE6] to-[#E5E0D4] border-r border-slate-200/60 relative overflow-hidden">

        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Upper branding */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Hotel className="text-white" size={18} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm tracking-tight text-slate-900 font-bold">SSR One</h2>
            <p className="text-[10px] text-violet-600 font-extrabold uppercase tracking-widest">Enterprise Suite</p>
          </div>
        </div>

        {/* 3D Tilted Centerpiece Platform */}
        <div className="flex flex-col items-center justify-center flex-1 py-12 z-10 relative">
          <div className="relative w-80 h-80 flex items-center justify-center" style={{ perspective: "1000px" }}>

            {/* 3D Tilted Outer spinning ring */}
            <div
              style={{ animation: "rotate-3d-outer 25s linear infinite" }}
              className="absolute w-80 h-80 rounded-full border border-dashed border-slate-400/40 flex items-center justify-center"
            />

            {/* 3D Tilted Middle glowing ring */}
            <div
              style={{ animation: "rotate-3d-middle 18s linear infinite" }}
              className="absolute w-64 h-64 rounded-full border border-double border-violet-500/30 flex items-center justify-center"
            >
              <div className="absolute -top-1 w-3 h-3 bg-violet-500 rounded-full blur-[1px] shadow-sm" />
              <div className="absolute -bottom-1 w-3 h-3 bg-amber-500 rounded-full blur-[1px] shadow-sm" />
            </div>

            {/* Glowing mesh gradient background aura */}
            <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-violet-500/10 to-amber-500/10 blur-[45px] animate-pulse" />

            {/* 3D Perspective Grid Platform Shadow */}
            <div
              style={{ transform: "translateY(75px) rotateX(75deg)" }}
              className="absolute w-60 h-24 rounded-full bg-gradient-to-r from-violet-500/10 to-transparent blur-[12px] border border-violet-500/20"
            />

            {/* Inner rotating frame */}
            <div
              style={{ animation: "spin 15s linear infinite" }}
              className="absolute w-36 h-36 rounded-3xl border border-slate-200 bg-white/40 backdrop-blur-md flex items-center justify-center shadow-xs"
            />

            {/* Logo orb in the absolute center with floating animation */}
            <div
              style={{ animation: "float-y-slow 6s ease-in-out infinite" }}
              className="absolute w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_20px_45px_rgba(0,0,0,0.1)] border border-slate-100 transition-all hover:scale-105"
            >
              <Hotel className="text-violet-600" size={38} />
            </div>

            {/* Floating 3D Micro-Cards */}

            {/* AI Active Sparkle badge (Top-Right) */}
            <div
              style={{ animation: "float-card-1 5s ease-in-out infinite" }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400/20 rounded-xl py-2 px-3 shadow-lg flex items-center gap-1.5 z-20 text-white"
            >
              <Sparkles size={11} className="text-white animate-pulse" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wider">AI Copilot</span>
            </div>

            {/* Operations/Billing Badge (Bottom-Left) */}
            <div
              style={{ animation: "float-card-2 5.5s ease-in-out infinite" }}
              className="absolute -bottom-2 -left-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl py-2 px-2.5 shadow-md flex items-center gap-1.5 z-20"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
                <Shield size={10} className="text-emerald-600" />
              </div>
              <span className="text-[9px] font-display font-extrabold text-slate-800 uppercase tracking-wider">Multi-Tenant</span>
            </div>

          </div>

          <div className="mt-10 text-center max-w-sm">
            <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-snug">
              World-Class <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Hospitality Operating System</span>
            </h1>
            <p className="text-xs text-slate-600 mt-3 font-semibold leading-relaxed max-w-xs mx-auto">
              A unified metadata-driven enterprise core built to manage multi-property global chains.
            </p>
          </div>
        </div>

        {/* Left side footer info */}
        <div className="z-10 flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold">
          <span>v1.0.0 Enterprise</span>
          <span>© 2026 SSR One AI</span>
        </div>
      </div>

      {/* Right side: Credentials, selectors & SignIn Form (Original Light Theme) */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 lg:p-12 bg-[#F2EDE2] relative overflow-y-auto scrollbar-hide">

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-500">

          {/* Header Mobile Branding */}
          <div className="flex flex-col items-center mb-6 lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center mb-3 shadow-md">
              <Hotel className="text-white" size={24} />
            </div>
            <h1 className="font-display font-black text-xl text-slate-950 tracking-tight">SSR One AI</h1>
            <p className="text-[10px] text-violet-600 font-bold uppercase tracking-wider mt-0.5">Enterprise ERP Suite</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-900/5">

            <div className="mb-6">
              <h2 className="font-display font-black text-2xl text-slate-950 tracking-tight leading-none">
                Sign in to <span className="font-light text-slate-500">Workspace</span>
              </h2>
              <p className="text-xs text-slate-500 mt-2 font-semibold">
                Provide your environment credentials and workspace parameters.
              </p>
            </div>

            {isLoadingContext ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                <p className="text-xs text-slate-500 font-semibold">Querying PostgreSQL tenant structure...</p>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4 font-sans text-xs">

                {/* Email Input */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      id="email"
                      type="email"
                      className="pl-10 h-10 w-full text-xs bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-900 rounded-xl placeholder:text-slate-400 font-semibold outline-none transition-colors"
                      placeholder="you@corporate.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      id="password"
                      type="password"
                      className="pl-10 h-10 w-full text-xs bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-900 rounded-xl placeholder:text-slate-400 font-semibold outline-none transition-colors"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Workspace Slug Input (Tenant Selector) */}
                <div className="space-y-1">
                  <label htmlFor="tenant" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Workspace Slug</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      id="tenant"
                      type="text"
                      className="pl-10 h-10 w-full text-xs bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-slate-900 rounded-xl placeholder:text-slate-400 font-bold outline-none transition-colors"
                      placeholder="e.g. baithak-cafe"
                      value={tenantSlug}
                      onChange={(e) => setTenantSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Corporate Company Selector (PostgreSQL SSOT) */}
                <div className="space-y-1">
                  <label htmlFor="company" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Target Company</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select
                      id="company"
                      value={selectedCompanyId}
                      onChange={(e) => {
                        const newCoId = e.target.value;
                        setSelectedCompanyId(newCoId);
                        const match = branches.find((b: any) => !b.company_id || String(b.company_id) === String(newCoId) || String(b.company_id) === "1");
                        if (match) {
                          setSelectedBranchId(String(match.id));
                        }
                      }}
                      className="flex h-10 w-full pl-10 pr-8 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 focus-visible:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors font-bold appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Select a company
                      </option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id} className="bg-white text-slate-900 font-semibold">
                          {c.legal_name ? `${c.name} — ${c.legal_name}` : c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {contextError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 font-medium">
                    {contextError}
                  </div>
                ) : null}

                {/* Unit & Fin Year grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Physical Unit Selector */}
                  <div className="space-y-1">
                    <label htmlFor="branch" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Active Unit</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <select
                        id="branch"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="flex h-10 w-full pl-10 pr-8 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 focus-visible:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors font-bold appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>
                          Select a unit
                        </option>
                        {filteredBranches.map((b) => (
                          <option key={b.id} value={b.id} className="bg-white text-slate-900 font-semibold">
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Financial Year Selector */}
                  <div className="space-y-1">
                    <label htmlFor="finyear" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-extrabold block">Fin Year</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <select
                        id="finyear"
                        value={selectedFinYear}
                        onChange={(e) => setSelectedFinYear(e.target.value)}
                        className="flex h-10 w-full pl-10 pr-8 rounded-xl border border-slate-200/80 bg-slate-50 text-xs text-slate-900 focus-visible:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors font-bold appearance-none cursor-pointer"
                        required
                      >
                        {finYears.map((fy) => (
                          <option key={fy.code} value={fy.code} className="bg-white text-slate-900 font-semibold">
                            {fy.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-md mt-4 transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : null}
                  Sign In to Workspace
                </button>

              </form>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
