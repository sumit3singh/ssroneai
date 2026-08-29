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
import { Button, Badge } from '@ssrone/ui';

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
        backgroundColor: isDark ? '#070a12' : '#f8fafc', 
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
        <main 
          className="flex-1 overflow-y-auto p-6 space-y-6 transition-colors" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '1.5rem', 
            backgroundColor: isDark ? '#070a12' : '#f8fafc' 
          }}
        >

          {/* OVERVIEW PANEL */}
          {activeNav === 'overview' && (
            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Executive Telemetry Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#0b0f19' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.875rem', padding: '1.25rem', boxShadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity style={{ color: '#6366f1', width: '1.125rem', height: '1.125rem' }} />
                    <span>PLATFORM TELEMETRY & SYSTEM HEALTH CONSOLE</span>
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.25rem', margin: 0 }}>
                    Real-time monitoring across PostgreSQL RLS database clusters, Redis PubSub event streams, and tenant workloads.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  <span style={{ padding: '0.25rem 0.625rem', borderRadius: '0.375rem', background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    SYSTEM HEALTH: 100% OK
                  </span>
                </div>
              </div>

              {/* Top Banner Executive KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                
                <div 
                  onClick={() => setActiveNav('tenants')}
                  style={{ background: isDark ? '#0b0f19' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.875rem', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s' }}
                  className="hover:border-indigo-500/50 hover:shadow-md"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>REGISTERED TENANTS</span>
                    <Building2 style={{ color: '#6366f1', width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.5rem', fontFamily: 'monospace', margin: '0.5rem 0 0 0' }}>{tenants.length}</p>
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontFamily: 'monospace', margin: '0.375rem 0 0 0' }}>
                    <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>PostgreSQL RLS Active</span>
                  </p>
                </div>

                <div 
                  onClick={() => setActiveNav('hierarchy')}
                  style={{ background: isDark ? '#0b0f19' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.875rem', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s' }}
                  className="hover:border-purple-500/50 hover:shadow-md"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>CORPORATE LEGAL ENTITIES</span>
                    <Layers style={{ color: '#a855f7', width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.5rem', fontFamily: 'monospace', margin: '0.5rem 0 0 0' }}>{totalCompanies}</p>
                  <p style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '0.375rem', fontWeight: 700, fontFamily: 'monospace', margin: '0.375rem 0 0 0' }}>Registered Companies in DB</p>
                </div>

                <div 
                  onClick={() => setActiveNav('hierarchy')}
                  style={{ background: isDark ? '#0b0f19' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.875rem', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s' }}
                  className="hover:border-amber-500/50 hover:shadow-md"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>OUTLETS & BRANCHES</span>
                    <GitBranch style={{ color: '#d97706', width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.5rem', fontFamily: 'monospace', margin: '0.5rem 0 0 0' }}>{totalOutlets}</p>
                  <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.375rem', fontWeight: 700, fontFamily: 'monospace', margin: '0.375rem 0 0 0' }}>Active Operating Outlets</p>
                </div>

                <div 
                  onClick={() => setActiveNav('billing')}
                  style={{ background: isDark ? '#0b0f19' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.875rem', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s' }}
                  className="hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontFamily: 'monospace' }}>YEARLY RECURRING ARR</span>
                    <IndianRupee style={{ color: '#10b981', width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: '0.5rem', fontFamily: 'monospace', margin: '0.5rem 0 0 0' }}>₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.375rem', fontWeight: 700, fontFamily: 'monospace', margin: '0.375rem 0 0 0' }}>Yearly Subscriptions (₹12k/yr)</p>
                </div>

              </div>

              {/* Cluster Telemetry Summary View */}
              <ClusterTelemetryView theme={theme} />
            </div>
          )}

          {/* TENANT DIRECTORY PANEL */}
          {activeNav === 'tenants' && (
            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Summary Stats Header Banner above Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <div>
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>Total Customer Tenants</span>
                  <p style={{ fontWeight: 800, fontSize: '1.125rem', color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>{tenants.length} Tenants</p>
                </div>
                <div>
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>Active Paid Subscriptions</span>
                  <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#059669', margin: 0 }}>{activeTenantsCount} Active</p>
                </div>
                <div>
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>Yearly ARR Revenue</span>
                  <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#6366f1', margin: 0 }}>₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>Outlets Quota Allocation</span>
                  <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#d97706', margin: 0 }}>{totalOutlets} / {tenants.reduce((a,t) => a + t.maxOutlets, 0)} Outlets</p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', width: '280px' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '0.625rem', color: '#94a3b8', width: '1rem', height: '1rem' }} />
                    <input
                      type="text"
                      placeholder="Search tenant name, UTR ref, admin..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: '0.75rem', outline: 'none' }}
                    />
                  </div>

                  {/* Tier Filter */}
                  <select
                    value={selectedTierFilter}
                    onChange={(e) => setSelectedTierFilter(e.target.value)}
                    style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none' }}
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
                    style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: isDark ? '#e2e8f0' : '#0f172a', outline: 'none' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Button
                    onClick={loadPlatformData}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh DB</span>
                  </Button>
                  <Button 
                    onClick={() => setIsLicenseWizardOpen(true)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Onboard Tenant Customer</span>
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', overflow: 'hidden', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                {filteredTenants.length === 0 ? (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                    <Building2 style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.4, color: '#6366f1' }} />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>No Customer Tenants Found</h3>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {searchQuery ? 'No tenants match your search filter.' : 'No customer tenants exist in the PostgreSQL database. Click "Onboard Tenant Customer" to provision your first tenant.'}
                    </p>
                    <Button
                      onClick={() => setIsLicenseWizardOpen(true)}
                      variant="primary"
                      size="sm"
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Onboard First Tenant
                    </Button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                      <thead style={{ background: isDark ? '#090d16' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                        <tr>
                          <th style={{ padding: '0.75rem 1rem' }}>Customer Tenant</th>
                          <th style={{ padding: '0.75rem 1rem' }}>DB Strategy</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Yearly Fee & UTR Ref</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Subscription Validity</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Companies / Outlets</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontFamily: 'sans-serif' }}>
                        {filteredTenants.map((tenant) => {
                          const totalTenantOutlets = tenant.companies.reduce((acc, c) => acc + c.branches.length, 0);
                          const isExpired = tenant.daysRemaining <= 0;

                          return (
                            <tr 
                              key={tenant.id} 
                              style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`, cursor: 'pointer' }}
                              className="hover:bg-slate-500/5 transition-colors"
                              onClick={() => {
                                setDrawerTenant(tenant);
                                setIsDrawerOpen(true);
                              }}
                            >
                              <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Building2 style={{ color: '#6366f1', width: '1rem', height: '1rem' }} />
                                  <span>{tenant.name}</span>
                                  <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1', background: isDark ? '#1e1b4b' : '#e0e7ff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>ID: #{tenant.id}</span>
                                </div>
                                <div style={{ fontSize: '0.625rem', color: '#6366f1', fontFamily: 'monospace', marginTop: '0.125rem' }}>{tenant.domain}</div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, fontFamily: 'monospace', background: tenant.dbStrategy === 'Dedicated Database' ? (isDark ? 'rgba(217, 119, 6, 0.15)' : '#fef3c7') : (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff'), color: tenant.dbStrategy === 'Dedicated Database' ? '#d97706' : '#6366f1', border: tenant.dbStrategy === 'Dedicated Database' ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)' }}>
                                  {tenant.dbStrategy || 'Shared Schema RLS'}
                                </span>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>
                                  ₹{tenant.yearlyFee.toLocaleString('en-IN')} / yr
                                </div>
                                <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#d97706', marginTop: '0.125rem' }}>
                                  {tenant.paymentRef || 'UTR-PAID'}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                  <Clock style={{ width: '0.75rem', height: '0.75rem', color: isExpired ? '#dc2626' : '#059669' }} />
                                  <span style={{ fontWeight: 700, color: isExpired ? '#dc2626' : (isDark ? '#ffffff' : '#0f172a') }}>
                                    {isExpired ? 'EXPIRED' : `${tenant.daysRemaining} Days Left`}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#64748b', marginTop: '0.125rem' }}>
                                  Exp: {tenant.subscriptionExpiryDate}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>{tenant.companies.length} Companies</div>
                                <div style={{ fontSize: '0.625rem', color: '#d97706', fontWeight: 600 }}>{totalTenantOutlets} Outlets (Max {tenant.maxOutlets})</div>
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <Badge variant={isExpired ? 'destructive' : tenant.status === 'Active' ? 'success' : 'warning'} size="sm">
                                  {isExpired ? 'EXPIRED' : tenant.status}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                                  <button 
                                    onClick={() => {
                                      setSelectedTenant(tenant);
                                      setIsConfigureModalOpen(true);
                                    }}
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      borderRadius: '0.5rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      background: isDark ? '#1e293b' : '#f1f5f9',
                                      color: isDark ? '#f8fafc' : '#0f172a',
                                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    Manage License
                                  </button>
                                </div>
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
            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div>
                  <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', margin: 0 }}>
                    <GitBranch style={{ color: '#d97706', width: '1rem', height: '1rem' }} />
                    4-LEVEL MULTI-TENANT ENTERPRISE TREE EXPLORER
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.125rem', margin: 0 }}>
                    SSR IT Platform → Tenant Customers → Corporate Legal Entities → Outlets & Branches
                  </p>
                </div>

                {/* Tree Search */}
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search style={{ position: 'absolute', left: '0.75rem', top: '0.625rem', color: '#94a3b8', width: '1rem', height: '1rem' }} />
                  <input
                    type="text"
                    placeholder="Search tenant, company, branch..."
                    value={hierarchySearchQuery}
                    onChange={(e) => setHierarchySearchQuery(e.target.value)}
                    style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#0f172a', fontSize: '0.75rem', outline: 'none' }}
                  />
                </div>
              </div>

              {filteredHierarchyTenants.length === 0 ? (
                <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '3rem 1.5rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <GitBranch style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.4, color: '#d97706' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>No Enterprise Hierarchy Found</h3>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>No companies or branches match your search filter.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredHierarchyTenants.map((t) => {
                    const totalBranchesCount = t.companies.reduce((acc, c) => acc + c.branches.length, 0);
                    return (
                      <div 
                        key={t.id} 
                        style={{ 
                          background: isDark ? '#0b0f19' : '#ffffff', 
                          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, 
                          borderRadius: '0.875rem', 
                          padding: '1.25rem', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '1.25rem', 
                          boxShadow: isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.03)' 
                        }}
                      >
                        {/* Level 1: Tenant Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1f2937' : '#f1f5f9'}`, paddingBottom: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))', border: '1px solid rgba(99, 102, 241, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                              <Building2 style={{ width: '1.25rem', height: '1.25rem' }} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                                  {t.name}
                                </h3>
                                <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.6875rem', fontWeight: 800, background: isDark ? '#1e1b4b' : '#e0e7ff', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', fontFamily: 'monospace' }}>
                                  Tenant ID: #{t.id}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', margin: '0.125rem 0 0 0' }}>
                                {t.domain} • Admin: <strong style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{t.adminName}</strong> ({t.adminEmail})
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Badge variant="warning" size="sm" className="font-mono font-bold">
                              {t.companies.length} COMPANIES • {totalBranchesCount} OUTLETS
                            </Badge>
                            <button
                              onClick={() => {
                                setDrawerTenant(t);
                                setIsDrawerOpen(true);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff',
                                color: isDark ? '#a5b4fc' : '#4338ca',
                                border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.3)' : '#c7d2fe'}`,
                                cursor: 'pointer'
                              }}
                            >
                              <Copy size={12} />
                              <span>Copy Customer Info</span>
                            </button>
                            <button
                              onClick={() => {
                                setAddCompanyTargetTenant(t);
                                setIsAddCompanyOpen(true);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                                color: isDark ? '#34d399' : '#047857',
                                border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0'}`,
                                cursor: 'pointer'
                              }}
                            >
                              <Plus size={12} />
                              <span>Add Company</span>
                            </button>
                          </div>
                        </div>

                        {/* Level 2: Companies & Outlets Hierarchy Tree */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', paddingLeft: '1.25rem', borderLeft: '2px solid rgba(99, 102, 241, 0.35)' }}>
                          {t.companies.map((c) => (
                            <div 
                              key={c.id} 
                              style={{ 
                                background: isDark ? '#111827' : '#f8fafc', 
                                border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, 
                                borderRadius: '0.75rem', 
                                padding: '1rem', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '0.875rem',
                                boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                                  <Layers style={{ color: '#a855f7', width: '1.125rem', height: '1.125rem' }} />
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>{c.name}</span>
                                  <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 800, color: '#a855f7', background: isDark ? '#2e1065' : '#f3e8ff', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>
                                    Company ID: #{c.id}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                                  CIN: {c.regNumber || 'N/A'}
                                </span>
                              </div>

                              {/* Level 3: Branches under Company */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.625rem', borderTop: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                                    Branches / Outlets ({c.branches.length})
                                  </span>
                                  <button
                                    onClick={() => {
                                      setAddBranchTargetCompany({ tenant: t, company: c });
                                      setIsAddBranchOpen(true);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#d97706', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    <Plus size={12} /> Add Branch
                                  </button>
                                </div>

                                {c.branches.map((b) => (
                                  <div 
                                    key={b.id} 
                                    style={{ 
                                      display: 'flex', 
                                      justify: 'space-between', 
                                      alignItems: 'center', 
                                      fontSize: '0.75rem', 
                                      background: isDark ? '#0b0f19' : '#ffffff', 
                                      padding: '0.5rem 0.75rem', 
                                      borderRadius: '0.5rem', 
                                      border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` 
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      <GitBranch style={{ color: '#d97706', width: '0.875rem', height: '0.875rem' }} />
                                      <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 700 }}>{b.name}</span>
                                      <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 800, color: '#d97706', background: isDark ? '#451a03' : '#fef3c7', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>
                                        Branch ID: #{b.id}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.625rem', fontFamily: 'monospace' }}>
                                      <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{b.city}</span>
                                      <span style={{ color: '#6366f1', fontWeight: 700 }}>{b.code}</span>
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
            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', margin: 0 }}>
                  <Key style={{ color: '#6366f1', width: '1rem', height: '1rem' }} />
                  FEATURE LICENSING & SUBSCRIPTION TIER MATRIX (₹ INR)
                </h2>
                <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.125rem', margin: 0 }}>
                  Manage Starter, Professional, and Enterprise license keys and module entitlements in Indian Rupees (₹).
                </p>
              </div>

              {/* Tier Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { name: 'Yearly Standard Plan', price: '₹12,000/yr', outlets: 'Max 15 Outlets', desc: 'Full 14-Module Suite + POS + Hotel PMS + Accounting', color: '#059669' },
                  { name: 'Multi-Outlet Pro', price: '₹24,000/yr', outlets: 'Max 30 Outlets', desc: 'Multi-location chain support + KDS + AI Gateway', color: '#6366f1' },
                  { name: 'Custom Enterprise', price: '₹36,000/yr', outlets: 'Unlimited Outlets', desc: 'Custom Dedicated Database + Unlimited Outlets', color: '#a855f7' }
                ].map((tierCard) => (
                  <div key={tierCard.name} style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>{tierCard.name}</h3>
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: tierCard.color, fontFamily: 'monospace' }}>{tierCard.price}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>{tierCard.desc}</p>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, fontFamily: 'monospace', color: tierCard.color, background: isDark ? '#090d16' : '#f8fafc', padding: '0.375rem 0.5rem', borderRadius: '0.375rem', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                      {tierCard.outlets}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active License Keys Directory */}
              <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  ACTIVE TENANT LICENSES ({tenants.length})
                </div>
                {tenants.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                    No active licenses found in database. Onboard a tenant to issue license keys.
                  </div>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead style={{ background: isDark ? '#090d16' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem' }}>Tenant</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Cryptographic License Token</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Tier</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Max Outlets</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t.id} style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.name}</td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#d97706' }}>{t.licenseKey}</td>
                          <td style={{ padding: '0.75rem 1rem' }}><Badge variant="primary" size="sm">{t.tier}</Badge></td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{t.maxOutlets} Outlets</td>
                          <td style={{ padding: '0.75rem 1rem' }}><Badge variant="success" size="sm">{t.status}</Badge></td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedTenant(t); setIsConfigureModalOpen(true); }}>
                              Edit License
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SAAS BILLING & ARR PANEL */}
          {activeNav === 'billing' && (
            <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', margin: 0 }}>
                  <CreditCard style={{ color: '#059669', width: '1rem', height: '1rem' }} />
                  SSR IT YEARLY SUBSCRIPTION BILLING & ARR MANAGEMENT (₹ INR)
                </h2>
                <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '0.125rem', margin: 0 }}>
                  Real-time subscription billing analytics, recurring yearly revenue metrics, and UTR payment verification.
                </p>
              </div>

              {/* Revenue Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>Annual Run Rate (ARR)</span>
                  <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem', fontFamily: 'monospace' }}>₹{totalYearlyARR.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>Monthly Run Rate (MRR)</span>
                  <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#6366f1', marginTop: '0.5rem', fontFamily: 'monospace' }}>₹{totalMRR.toLocaleString('en-IN')}</p>
                </div>
                <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>Average Yearly Subscription Fee</span>
                  <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#d97706', marginTop: '0.5rem', fontFamily: 'monospace' }}>₹{tenants.length > 0 ? Math.round(totalYearlyARR / tenants.length).toLocaleString('en-IN') : 0}</p>
                </div>
              </div>

              {/* Billing Subscriptions Directory */}
              <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  CUSTOMER YEARLY SUBSCRIPTION BILLING & UTR RECEIPT TABLE
                </div>
                {tenants.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
                    No subscription billing records found in database.
                  </div>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead style={{ background: isDark ? '#090d16' : '#f1f5f9', color: isDark ? '#94a3b8' : '#475569', fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem' }}>Tenant</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Yearly Subscription Fee</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Payment Ref / UTR</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Validity Expiry</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t.id} style={{ borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{t.name}</td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#059669', fontWeight: 700 }}>₹{t.yearlyFee.toLocaleString('en-IN')} / yr</td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#d97706' }}>{t.paymentRef || 'UTR-VERIFIED'} ({t.paymentMethod || 'UPI'})</td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#6366f1' }}>{t.subscriptionExpiryDate}</td>
                          <td style={{ padding: '0.75rem 1rem' }}><Badge variant="success" size="sm">{t.paymentStatus || 'PAID'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TELEMETRY */}
          {activeNav === 'telemetry' && <ClusterTelemetryView theme={theme} />}

          {/* AUDIT LOG STREAM */}
          {activeNav === 'audit' && (
            <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Terminal style={{ color: '#059669', width: '1rem', height: '1rem' }} />
                  REAL-TIME MULTI-TENANT AUDIT LOG STREAM
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setAuditLogs([])}
                    style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem' }}
                  >
                    <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                    <span>Clear Stream</span>
                  </button>
                  <span style={{ color: '#64748b', fontSize: '0.625rem' }}>OpenTelemetry Compatible</span>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                  No audit log events recorded in database yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: isDark ? '#090d16' : '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, marginTop: '1rem' }}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${isDark ? '#0f172a' : '#e2e8f0'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: '#64748b' }}>{log.timestamp}</span>
                        <span style={{ color: '#6366f1', fontWeight: 700 }}>[{log.tenantName}]</span>
                        <span style={{ color: '#d97706' }}>{log.eventType}</span>
                        <span style={{ color: isDark ? '#cbd5e1' : '#334155' }}>{log.details}</span>
                      </div>
                      <Badge variant={log.severity === 'SUCCESS' ? 'success' : log.severity === 'WARN' ? 'warning' : 'primary'} size="sm">
                        {log.severity}
                      </Badge>
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

    </div>
  );
}

export default App;
