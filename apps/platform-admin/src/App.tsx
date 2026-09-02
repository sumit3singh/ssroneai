import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  GitBranch, 
  Terminal, 
  Search, 
  Plus, 
  CheckCircle2,
  Key,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  SlidersHorizontal,
  Check,
  Activity,
  Copy,
  Sparkles,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  Calendar,
  Clock,
  Trash2,
  Filter,
  Eye,
  ChevronRight,
  ChevronDown,
  UserPlus
} from 'lucide-react';

import { Tenant, AuditLog, CreateTenantDTO, Company, Branch } from './types';
import { platformAdminApi } from './api/platformAdmin.api';
import { CommandHeader } from './components/CommandHeader';
import { SidebarNav } from './components/SidebarNav';
import { LicenseWizardModal } from './components/LicenseWizardModal';
import { ConfigureLicenseModal } from './components/ConfigureLicenseModal';
import { TenantDetailDrawer } from './components/TenantDetailDrawer';
import { AddCompanyModal } from './components/AddCompanyModal';
import { AddBranchModal } from './components/AddBranchModal';
import { AddUserModal } from './components/AddUserModal';
import { ProvisionSuperadminModal } from './components/ProvisionSuperadminModal';
import { ClusterTelemetryView } from './components/ClusterTelemetryView';
import { PlatformAdminLogin } from './components/PlatformAdminLogin';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [authUser, setAuthUser] = useState<{ userId: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('platform_admin_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('platform_admin_auth_user');
    setAuthUser(null);
  };

  // Synchronize navigation state with browser URL bar (e.g. http://localhost:5174/#telemetry)
  const getInitialNav = (): 'overview' | 'tenants' | 'hierarchy' | 'licensing' | 'billing' | 'telemetry' | 'audit' => {
    const hash = window.location.hash.replace('#', '');
    if (['overview', 'tenants', 'hierarchy', 'licensing', 'billing', 'telemetry', 'audit'].includes(hash)) {
      return hash as any;
    }
    return 'overview';
  };

  const [activeNav, setActiveNavState] = useState<'overview' | 'tenants' | 'hierarchy' | 'licensing' | 'billing' | 'telemetry' | 'audit'>(getInitialNav());

  const setActiveNav = (nav: 'overview' | 'tenants' | 'hierarchy' | 'licensing' | 'billing' | 'telemetry' | 'audit') => {
    setActiveNavState(nav);
    window.history.pushState(null, '', `/#${nav}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (['overview', 'tenants', 'hierarchy', 'licensing', 'billing', 'telemetry', 'audit'].includes(hash)) {
        setActiveNavState(hash as any);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [hierarchySearchQuery, setHierarchySearchQuery] = useState('');

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [drawerTenant, setDrawerTenant] = useState<Tenant | null>(null);
  const [addCompanyTargetTenant, setAddCompanyTargetTenant] = useState<Tenant | null>(null);
  const [addBranchTargetCompany, setAddBranchTargetCompany] = useState<{ tenant: Tenant; company: Company } | null>(null);
  const [addUserTargetTenant, setAddUserTargetTenant] = useState<Tenant | null>(null);

  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  
  const [isLicenseWizardOpen, setIsLicenseWizardOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isProvisionSuperadminOpen, setIsProvisionSuperadminOpen] = useState(false);
  const [provisionSuperadminTargetTenant, setProvisionSuperadminTargetTenant] = useState<Tenant | null>(null);

  // Single Source of Truth (SSOT): Database state loaded live via API
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  const isDark = theme === 'dark';

  // Toggle Theme Function
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load Tenants & Audit Logs from PostgreSQL Database
  const loadPlatformData = async () => {
    setIsLoadingTenants(true);
    try {
      const dbTenants = await platformAdminApi.getTenants();
      setTenants(dbTenants);
      const dbLogs = await platformAdminApi.getAuditLogs();
      setAuditLogs(dbLogs);
    } catch (err) {
      console.error("Failed to load platform data from database", err);
    } finally {
      setIsLoadingTenants(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // Handlers
  const handleOnboardTenant = async (dto: CreateTenantDTO) => {
    const newTenant = await platformAdminApi.createTenant(dto);
    setTenants(prev => [newTenant, ...prev]);

    // Create Audit Log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      eventType: 'TenantOnboarded',
      details: `Yearly ₹${dto.yearlyFee.toLocaleString('en-IN')} subscription payment verified (${dto.paymentRef}). Valid until ${dto.subscriptionExpiryDate}`,
      severity: 'SUCCESS',
      actor: 'sys-admin-master-01'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSaveLicenseConfiguration = async (tenantId: string, updatedData: Partial<Tenant>) => {
    await platformAdminApi.updateTenantLicense(tenantId, updatedData);
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updatedData } : t));

    // Audit Log
    const targetTenant = tenants.find(t => t.id === tenantId);
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tenantId,
      tenantName: targetTenant?.name || tenantId,
      eventType: 'LicenseKeyRotated',
      details: `Updated license tier (${updatedData.tier || targetTenant?.tier}), status (${updatedData.status || targetTenant?.status}), and expiry date (${updatedData.subscriptionExpiryDate || targetTenant?.subscriptionExpiryDate})`,
      severity: 'INFO',
      actor: 'sys-admin-master-01'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleRenewSubscription = async (tenantId: string, currentExpiry: string, paymentRef: string, paymentMethod: string) => {
    const baseDate = new Date(currentExpiry > new Date().toISOString().split("T")[0] ? currentExpiry : new Date());
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    const newExpiryStr = baseDate.toISOString().split("T")[0];

    await platformAdminApi.updateTenantLicense(tenantId, {
      status: "Active",
      subscriptionExpiryDate: newExpiryStr,
      paymentStatus: "PAID"
    });

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const today = new Date().getTime();
        const exp = new Date(newExpiryStr).getTime();
        const daysRem = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        return {
          ...t,
          status: "Active",
          subscriptionExpiryDate: newExpiryStr,
          paymentStatus: "PAID",
          paymentRef,
          daysRemaining: daysRem
        };
      }
      return t;
    }));

    const targetTenant = tenants.find(t => t.id === tenantId);
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tenantId,
      tenantName: targetTenant?.name || tenantId,
      eventType: 'SubscriptionRenewed',
      details: `Renewed yearly ₹${(targetTenant?.yearlyFee || 12000).toLocaleString('en-IN')} subscription via ${paymentMethod} (${paymentRef}). Extended to ${newExpiryStr}`,
      severity: 'SUCCESS',
      actor: 'sys-admin-master-01'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAddCompany = async (tenantId: string, company: Company) => {
    // 1. Persist company & initial outlet in PostgreSQL DB
    await platformAdminApi.createCompany(tenantId, company);
    // 2. Re-sync live database records from PostgreSQL
    await loadPlatformData();

    const targetTenant = tenants.find(t => t.id === tenantId);
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tenantId,
      tenantName: targetTenant?.name || tenantId,
      eventType: 'TenantOnboarded',
      details: `Added legal company entity "${company.name}" (CIN: ${company.regNumber}, GSTIN: ${company.gstin})`,
      severity: 'SUCCESS',
      actor: 'sys-admin-master-01'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAddBranch = async (tenantId: string, companyId: string, branch: Branch) => {
    // 1. Persist branch outlet in PostgreSQL DB
    await platformAdminApi.createBranch(tenantId, companyId, branch);
    // 2. Re-sync live database records from PostgreSQL
    await loadPlatformData();

    const targetTenant = tenants.find(t => t.id === tenantId);
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tenantId,
      tenantName: targetTenant?.name || tenantId,
      eventType: 'TenantOnboarded',
      details: `Added branch outlet "${branch.name}" (${branch.code}) under Company #${companyId}`,
      severity: 'SUCCESS',
      actor: 'sys-admin-master-01'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Calculations directly from PostgreSQL Database records in INR (₹)
  const totalOutlets = tenants.reduce((acc, t) => acc + t.companies.reduce((cAcc, c) => cAcc + c.branches.length, 0), 0);
  const totalCompanies = tenants.reduce((acc, t) => acc + t.companies.length, 0);
  const activeTenantsCount = tenants.filter(t => t.status === 'Active' && t.daysRemaining > 0).length;
  const totalYearlyARR = tenants.filter(t => t.status === 'Active').reduce((acc, t) => acc + t.yearlyFee, 0);
  const totalMRR = Math.round(totalYearlyARR / 12);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.paymentRef && t.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = selectedTierFilter === 'ALL' || t.tier === selectedTierFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || 
                          (selectedStatusFilter === 'Active' && t.status === 'Active' && t.daysRemaining > 0) ||
                          (selectedStatusFilter === 'Expired' && (t.status === 'Expired' || t.daysRemaining <= 0)) ||
                          (selectedStatusFilter === 'Suspended' && t.status === 'Suspended');
    return matchesSearch && matchesTier && matchesStatus;
  });

  const filteredHierarchyTenants = tenants.filter(t => {
    if (!hierarchySearchQuery.trim()) return true;
    const q = hierarchySearchQuery.toLowerCase();
    const matchesTenant = t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q);
    const matchesCompany = t.companies.some(c => c.name.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q) || c.branches.some(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.city.toLowerCase().includes(q)));
    return matchesTenant || matchesCompany;
  });

  if (!authUser) {
    return <PlatformAdminLogin onLoginSuccess={(u) => setAuthUser(u)} theme={theme} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors select-none"
      style={{ 
        backgroundColor: isDark ? '#070a12' : '#faf9f5', 
        color: isDark ? '#f1f5f9' : '#0f172a', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      
      {/* Master Command Header */}
      <CommandHeader 
        totalMRR={totalMRR} 
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenLicenseWizard={() => setIsLicenseWizardOpen(true)}
        onLogout={handleLogout}
        user={authUser}
      />

      {/* Main IDE Workspace */}
      <div className="flex flex-1 overflow-hidden" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar Nav */}
        <SidebarNav
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          tenantCount={tenants.length}
          companyCount={totalCompanies}
          outletCount={totalOutlets}
          theme={theme}
        />

        {/* Right Main Canvas */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">

          {/* OVERVIEW PANEL */}
          {activeNav === 'overview' && (
            <div className="space-y-5 flex flex-col">
              
              {/* Executive Telemetry Header */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-2xs">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>PLATFORM TELEMETRY & SYSTEM HEALTH CONSOLE</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Real-time monitoring across PostgreSQL RLS database clusters, Redis PubSub event streams, and tenant workloads.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs animate-pulse" />
                    SYSTEM HEALTH: 100% OK
                  </span>
                </div>
              </div>

              {/* Top Banner Executive KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div 
                  onClick={() => setActiveNav('tenants')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 cursor-pointer hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-500 dark:text-slate-400">REGISTERED TENANTS</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                      <Building2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-4 mb-1">{tenants.length}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PostgreSQL RLS Active</span>
                  </p>
                </div>

                <div 
                  onClick={() => setActiveNav('hierarchy')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 cursor-pointer hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-500 dark:text-slate-400">CORPORATE LEGAL ENTITIES</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <Layers className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-4 mb-1">{totalCompanies}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">Registered Companies in DB</p>
                </div>

                <div 
                  onClick={() => setActiveNav('hierarchy')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 cursor-pointer hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-500 dark:text-slate-400">OUTLETS & BRANCHES</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                      <GitBranch className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-4 mb-1">{totalOutlets}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">Active Operating Outlets</p>
                </div>

                <div 
                  onClick={() => setActiveNav('billing')}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 cursor-pointer hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-500 dark:text-slate-400">YEARLY RECURRING ARR</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-4 mb-1">₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">Yearly Subscriptions (₹12k/yr)</p>
                </div>

              </div>

              {/* Cluster Telemetry Summary View */}
              <ClusterTelemetryView theme={theme} />
            </div>
          )}

          {/* TENANT DIRECTORY PANEL */}
          {activeNav === 'tenants' && (
            <div className="space-y-4 flex flex-col">
              
              {/* Summary Stats Header Banner above Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-wider block">Total Customer Tenants</span>
                  <p className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">{tenants.length} Tenants</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-wider block">Active Paid Subscriptions</span>
                  <p className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">{activeTenantsCount} Active</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-wider block">Yearly ARR Revenue</span>
                  <p className="font-extrabold text-lg text-sky-600 dark:text-sky-400 mt-0.5">₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-wider block">Outlets Quota Allocation</span>
                  <p className="font-extrabold text-lg text-amber-600 dark:text-amber-400 mt-0.5">{totalOutlets} / {tenants.reduce((a,t) => a + t.maxOutlets, 0)} Outlets</p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tenant name, UTR ref, admin..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Tier Filter */}
                  <select
                    value={selectedTierFilter}
                    onChange={(e) => setSelectedTierFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Professional">Professional</option>
                    <option value="Starter">Starter</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={loadPlatformData}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-sky-600" />
                    <span>Refresh DB</span>
                  </button>
                  <button 
                    onClick={() => setIsLicenseWizardOpen(true)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 text-amber-300" />
                    <span>Onboard Tenant Customer</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
                {filteredTenants.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Customer Tenants Found</h3>
                    <p className="text-xs mt-1">
                      {searchQuery ? 'No tenants match your search filter.' : 'No customer tenants exist in the PostgreSQL database. Click "Onboard Tenant Customer" to provision your first tenant.'}
                    </p>
                    <button
                      onClick={() => setIsLicenseWizardOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Onboard First Tenant
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50/90 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 text-[10px] uppercase font-mono font-black tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Customer Tenant</th>
                          <th className="py-3.5 px-4">DB Strategy</th>
                          <th className="py-3.5 px-4">Yearly Fee & UTR Ref</th>
                          <th className="py-3.5 px-4">Subscription Validity</th>
                          <th className="py-3.5 px-4">Companies / Outlets</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {filteredTenants.map((tenant) => {
                          const totalTenantOutlets = tenant.companies.reduce((acc, c) => acc + c.branches.length, 0);
                          const isExpired = tenant.daysRemaining <= 0;

                          return (
                            <tr 
                              key={tenant.id} 
                              className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                              onClick={() => {
                                setDrawerTenant(tenant);
                                setIsDrawerOpen(true);
                              }}
                            >
                              <td className="p-4">
                                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                  <Building2 className="text-indigo-600 w-4 h-4 shrink-0" />
                                  <span>{tenant.name}</span>
                                  <span className="text-[10px] font-mono font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">ID: #{tenant.id}</span>
                                </div>
                                <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{tenant.domain}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                                  tenant.dbStrategy === 'Dedicated Database' 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800'
                                }`}>
                                  {tenant.dbStrategy || 'Shared Schema RLS'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                  ₹{tenant.yearlyFee.toLocaleString('en-IN')} / yr
                                </div>
                                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                                  {tenant.paymentRef || 'UTR-PAID'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`} />
                                  <span className={isExpired ? 'text-rose-600 font-extrabold' : 'text-slate-900 dark:text-white'}>
                                    {isExpired ? 'EXPIRED' : `${tenant.daysRemaining} Days Left`}
                                  </span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                  Exp: {tenant.subscriptionExpiryDate}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-900 dark:text-white">{tenant.companies.length} Companies</div>
                                <div className="text-[10px] text-amber-600 font-semibold">{totalTenantOutlets} Outlets (Max {tenant.maxOutlets})</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                                  isExpired 
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200' 
                                    : tenant.status === 'Active' 
                                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200' 
                                      : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {isExpired ? 'EXPIRED' : tenant.status}
                                </span>
                              </td>
                              <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => {
                                    setSelectedTenant(tenant);
                                    setIsConfigureModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                                >
                                  Manage License
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HIERARCHY EXPLORER */}
          {activeNav === 'hierarchy' && (
            <div className="space-y-5 flex flex-col">
              <div className="flex flex-wrap justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                    <GitBranch className="text-amber-600 w-4 h-4" />
                    <span>4-LEVEL MULTI-TENANT ENTERPRISE TREE EXPLORER</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    SSR IT Platform → Tenant Customers → Corporate Legal Entities → Outlets & Branches
                  </p>
                </div>

                {/* Tree Search */}
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tenant, company, branch..."
                    value={hierarchySearchQuery}
                    onChange={(e) => setHierarchySearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {filteredHierarchyTenants.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
                  <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Enterprise Hierarchy Found</h3>
                  <p className="text-xs mt-1">No companies or branches match your search filter.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredHierarchyTenants.map((t) => {
                    const totalBranchesCount = t.companies.reduce((acc, c) => acc + c.branches.length, 0);
                    return (
                      <div 
                        key={t.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-5 shadow-xs hover:border-indigo-300 transition-all duration-200"
                      >
                        {/* Level 1: Tenant Header */}
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600">
                              <Building2 className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                  {t.name}
                                </h3>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  Tenant ID: #{t.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {t.domain} • Admin: <strong className="text-slate-800 dark:text-slate-200 font-bold">{t.adminName}</strong> ({t.adminEmail})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {t.companies.length} COMPANIES • {totalBranchesCount} OUTLETS
                            </span>
                            <button
                              onClick={() => {
                                setDrawerTenant(t);
                                setIsDrawerOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            >
                              <Copy size={13} />
                              <span>Copy Customer Info</span>
                            </button>
                            <button
                              onClick={() => {
                                setProvisionSuperadminTargetTenant(t);
                                setIsProvisionSuperadminOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                            >
                              <ShieldCheck size={13} />
                              <span>Provision Super Admin</span>
                            </button>
                            <button
                              onClick={() => {
                                setAddCompanyTargetTenant(t);
                                setIsAddCompanyOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>Add Company</span>
                            </button>
                          </div>
                        </div>

                        {/* Level 2: Companies & Outlets Hierarchy Tree */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-200/80 dark:border-indigo-800/80">
                          {t.companies.map((c) => (
                            <div 
                              key={c.id} 
                              className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-2xs"
                            >
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Layers className="text-purple-600 w-4 h-4 shrink-0" />
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">{c.name}</span>
                                  <span className="text-[10px] font-mono font-extrabold text-purple-700 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">
                                    Company ID: #{c.id}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 font-bold">
                                  CIN: {c.regNumber || 'N/A'}
                                </span>
                              </div>

                              {/* Level 3: Branches under Company */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider">
                                    Branches / Outlets ({c.branches.length})
                                  </span>
                                  <button
                                    onClick={() => {
                                      setAddBranchTargetCompany({ tenant: t, company: c });
                                      setIsAddBranchOpen(true);
                                    }}
                                    className="text-amber-600 hover:text-amber-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus size={12} /> Add Branch
                                  </button>
                                </div>

                                {c.branches.map((b) => (
                                  <div 
                                    key={b.id} 
                                    className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80"
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <GitBranch className="text-amber-600 w-3.5 h-3.5" />
                                      <span className="text-slate-900 dark:text-white font-bold">{b.name}</span>
                                      <span className="text-[10px] font-mono font-extrabold text-amber-700 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-md">
                                        Branch ID: #{b.id}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-mono">
                                      <span className="text-slate-500">{b.city}</span>
                                      <span className="text-indigo-600 font-bold">{b.code}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LICENSING & TIERS PANEL */}
          {activeNav === 'licensing' && (
            <div className="space-y-5 flex flex-col">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                  <Key className="text-indigo-600 w-4 h-4" />
                  <span>FEATURE LICENSING & SUBSCRIPTION TIER MATRIX (₹ INR)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage Starter, Professional, and Enterprise license keys and module entitlements in Indian Rupees (₹).
                </p>
              </div>

              {/* Tier Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Yearly Standard Plan', price: '₹12,000/yr', outlets: 'Max 15 Outlets', desc: 'Full 14-Module Suite + POS + Hotel PMS + Accounting', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { name: 'Multi-Outlet Pro', price: '₹24,000/yr', outlets: 'Max 30 Outlets', desc: 'Multi-location chain support + KDS + AI Gateway', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                  { name: 'Custom Enterprise', price: '₹36,000/yr', outlets: 'Unlimited Outlets', desc: 'Custom Dedicated Database + Unlimited Outlets', color: 'text-purple-600 bg-purple-50 border-purple-200' }
                ].map((tierCard) => (
                  <div key={tierCard.name} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:border-indigo-400 transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{tierCard.name}</h3>
                      <span className="text-base font-extrabold font-mono text-indigo-600">{tierCard.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tierCard.desc}</p>
                    <div className={`text-[10px] font-mono font-extrabold p-2 rounded-xl border ${tierCard.color}`}>
                      {tierCard.outlets}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active License Keys Directory */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 font-mono font-black text-xs text-slate-700 dark:text-slate-300">
                  ACTIVE TENANT LICENSES ({tenants.length})
                </div>
                {tenants.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active licenses found in database. Onboard a tenant to issue license keys.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50/90 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono font-black tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4">Tenant</th>
                          <th className="py-3.5 px-4">Cryptographic License Token</th>
                          <th className="py-3.5 px-4">Tier</th>
                          <th className="py-3.5 px-4">Max Outlets</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {tenants.map(t => (
                          <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                            <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400 font-bold">{t.licenseKey}</td>
                            <td className="py-3.5 px-4"><span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">{t.tier}</span></td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{t.maxOutlets} Outlets</td>
                            <td className="py-3.5 px-4"><span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{t.status}</span></td>
                            <td className="py-3.5 px-4 text-right">
                              <button className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { setSelectedTenant(t); setIsConfigureModalOpen(true); }}>
                                Edit License
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SAAS BILLING & ARR PANEL */}
          {activeNav === 'billing' && (
            <div className="space-y-5 flex flex-col">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                  <CreditCard className="text-emerald-600 w-4 h-4" />
                  <span>SSR IT YEARLY SUBSCRIPTION BILLING & ARR MANAGEMENT (₹ INR)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time subscription billing analytics, recurring yearly revenue metrics, and UTR payment verification.
                </p>
              </div>

              {/* Revenue Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-black tracking-wider block">Annual Run Rate (ARR)</span>
                  <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-black tracking-wider block">Monthly Run Rate (MRR)</span>
                  <p className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-2">₹{totalMRR.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-mono font-black tracking-wider block">Average Yearly Subscription Fee</span>
                  <p className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-2">₹{tenants.length > 0 ? Math.round(totalYearlyARR / tenants.length).toLocaleString('en-IN') : 0}</p>
                </div>
              </div>

              {/* Billing Subscriptions Directory */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 font-mono font-black text-xs text-slate-700 dark:text-slate-300">
                  CUSTOMER YEARLY SUBSCRIPTION BILLING & UTR RECEIPT TABLE
                </div>
                {tenants.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No subscription billing records found in database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50/90 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono font-black tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4">Tenant</th>
                          <th className="py-3.5 px-4">Yearly Subscription Fee</th>
                          <th className="py-3.5 px-4">Payment Ref / UTR</th>
                          <th className="py-3.5 px-4">Validity Expiry</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {tenants.map(t => (
                          <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                            <td className="py-3.5 px-4 font-mono text-emerald-600 font-extrabold">₹{t.yearlyFee.toLocaleString('en-IN')} / yr</td>
                            <td className="py-3.5 px-4 font-mono text-amber-600 font-bold">{t.paymentRef || 'UTR-VERIFIED'} ({t.paymentMethod || 'UPI'})</td>
                            <td className="py-3.5 px-4 font-mono text-indigo-600 font-bold">{t.subscriptionExpiryDate}</td>
                            <td className="py-3.5 px-4"><span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">{t.paymentStatus || 'PAID'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TELEMETRY */}
          {activeNav === 'telemetry' && <ClusterTelemetryView theme={theme} />}

          {/* AUDIT LOG STREAM */}
          {activeNav === 'audit' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 font-mono text-xs shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="text-emerald-600 w-4 h-4" />
                  <span>REAL-TIME MULTI-TENANT AUDIT LOG STREAM</span>
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAuditLogs([])}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Stream</span>
                  </button>
                  <span className="text-slate-400 text-[10px]">OpenTelemetry Compatible</span>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No audit log events recorded in database yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-900 last:border-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className="text-indigo-600 font-bold">[{log.tenantName}]</span>
                        <span className="text-amber-600 font-semibold">{log.eventType}</span>
                        <span className="text-slate-700 dark:text-slate-300">{log.details}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                        log.severity === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : log.severity === 'WARN' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* License Key Generator / Onboarding Modal */}
      <LicenseWizardModal 
        isOpen={isLicenseWizardOpen} 
        onClose={() => setIsLicenseWizardOpen(false)} 
        onOnboardTenant={handleOnboardTenant}
        theme={theme}
      />

      {/* Configure License & Entitlements Modal */}
      <ConfigureLicenseModal
        tenant={selectedTenant}
        isOpen={isConfigureModalOpen}
        onClose={() => { setIsConfigureModalOpen(false); setSelectedTenant(null); }}
        onSaveLicense={handleSaveLicenseConfiguration}
        onRenewSubscription={handleRenewSubscription}
        theme={theme}
      />

      {/* Tenant Detail Drawer View */}
      <TenantDetailDrawer
        tenant={drawerTenant}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setDrawerTenant(null); }}
        onOpenConfigure={(t) => {
          setSelectedTenant(t);
          setIsConfigureModalOpen(true);
        }}
        onRenewSubscription={handleRenewSubscription}
        theme={theme}
      />

      {/* Add Legal Company Modal */}
      <AddCompanyModal
        tenant={addCompanyTargetTenant}
        isOpen={isAddCompanyOpen}
        onClose={() => { setIsAddCompanyOpen(false); setAddCompanyTargetTenant(null); }}
        onAddCompany={handleAddCompany}
        theme={theme}
      />

      {/* Add Branch Outlet Modal */}
      <AddBranchModal
        tenant={addBranchTargetCompany?.tenant || null}
        company={addBranchTargetCompany?.company || null}
        isOpen={isAddBranchOpen}
        onClose={() => { setIsAddBranchOpen(false); setAddBranchTargetCompany(null); }}
        onAddBranch={handleAddBranch}
        theme={theme}
      />

      {/* Add User Operator Modal */}
      <AddUserModal
        tenant={addUserTargetTenant}
        isOpen={isAddUserOpen}
        onClose={() => { setIsAddUserOpen(false); setAddUserTargetTenant(null); }}
        onUserCreated={() => loadPlatformData()}
        theme={theme}
      />

      {/* Provision Super Admin Modal */}
      <ProvisionSuperadminModal
        tenant={provisionSuperadminTargetTenant}
        isOpen={isProvisionSuperadminOpen}
        onClose={() => { setIsProvisionSuperadminOpen(false); setProvisionSuperadminTargetTenant(null); }}
        onSuccess={() => loadPlatformData()}
        theme={theme}
      />

    </div>
  );
}

export default App;
