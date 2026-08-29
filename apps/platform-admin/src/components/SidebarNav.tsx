import React from 'react';
import { 
  Building2, 
  GitBranch, 
  Key, 
  CreditCard, 
  Activity, 
  Terminal, 
  Lock, 
  Cpu
} from 'lucide-react';

interface SidebarNavProps {
  activeNav: string;
  setActiveNav: (nav: 'overview' | 'tenants' | 'hierarchy' | 'licensing' | 'billing' | 'telemetry' | 'audit') => void;
  tenantCount: number;
  companyCount: number;
  outletCount: number;
  theme?: 'light' | 'dark';
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeNav,
  setActiveNav,
  tenantCount,
  companyCount,
  outletCount,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'overview', label: 'Platform Telemetry', icon: Activity },
    { id: 'tenants', label: 'Multi-Tenant Directory', icon: Building2, count: tenantCount },
    { id: 'hierarchy', label: 'Company & Outlets Tree', icon: GitBranch, count: companyCount },
    { id: 'licensing', label: 'Licensing & Tiers', icon: Key },
    { id: 'billing', label: 'SaaS Billing & ARR', icon: CreditCard },
    { id: 'telemetry', label: 'Cluster Nodes & DB', icon: Cpu },
    { id: 'audit', label: 'Security Audit Log', icon: Terminal },
  ];

  return (
    <aside 
      style={{
        width: '16.5rem',
        backgroundColor: isDark ? '#0b0f19' : '#ffffff',
        borderRight: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Operator Profile */}
        <div style={{ background: isDark ? '#111827' : '#f8fafc', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, borderRadius: '0.625rem', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'monospace' }}>
            <span>Superadmin Workspace</span>
            <Lock style={{ width: '0.75rem', height: '0.75rem', color: '#6366f1' }} />
          </div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>SSR IT Master Operator</p>
          <p style={{ fontSize: '0.625rem', color: isDark ? '#64748b' : '#94a3b8', fontFamily: 'monospace', margin: 0 }}>ID: sys-admin-master-01</p>
        </div>

        {/* Navigation Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
            PLATFORM GOVERNANCE
          </div>
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeNav === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveNav(nav.id as any)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 800 : 600,
                  border: isActive ? `1px solid ${isDark ? 'rgba(99, 102, 241, 0.5)' : '#c7d2fe'}` : '1px solid transparent',
                  background: isActive ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff') : 'transparent',
                  color: isActive ? (isDark ? '#818cf8' : '#4338ca') : (isDark ? '#94a3b8' : '#475569'),
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Icon style={{ width: '1rem', height: '1rem', color: isActive ? '#6366f1' : (isDark ? '#64748b' : '#94a3b8') }} />
                  <span>{nav.label}</span>
                </div>
                {nav.count !== undefined && (
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, fontFamily: 'monospace', background: isActive ? '#6366f1' : (isDark ? '#1f2937' : '#f1f5f9'), color: isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b') }}>
                    {nav.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cluster Quick Status */}
      <div style={{ borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingTop: '0.875rem' }}>
        <div style={{ background: isDark ? '#111827' : '#f8fafc', padding: '0.75rem', borderRadius: '0.625rem', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, fontSize: '0.6875rem', fontFamily: 'monospace', color: isDark ? '#94a3b8' : '#475569', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Cluster Status:</span>
            <span style={{ color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#10b981' }} />
              100% Operational
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Total Outlets:</span>
            <span style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}>{outletCount} Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
