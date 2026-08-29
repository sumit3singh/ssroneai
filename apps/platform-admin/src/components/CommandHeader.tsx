import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Radio, 
  DollarSign, 
  Sparkles,
  Sun,
  Moon,
  IndianRupee,
  LogOut,
  User
} from 'lucide-react';

interface CommandHeaderProps {
  totalMRR: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLicenseWizard: () => void;
  onLogout?: () => void;
  user?: { userId: string; name: string } | null;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({ 
  totalMRR, 
  theme,
  onToggleTheme,
  onOpenLicenseWizard,
  onLogout,
  user
}) => {
  const isDark = theme === 'dark';

  return (
    <header 
      style={{
        height: '3.75rem',
        backgroundColor: isDark ? '#0b0f19' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)' }}>
          <ShieldCheck style={{ color: '#ffffff', width: '1.25rem', height: '1.25rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', letterSpacing: '-0.01em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>SSR IT INDUSTRY</span>
              <span style={{ color: isDark ? '#475569' : '#cbd5e1', fontWeight: 300 }}>|</span> 
              <span style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>PLATFORM GOVERNANCE CONSOLE</span>
            </h1>
          </div>
          <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 800, background: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', fontFamily: 'monospace' }}>
            v2026.8 ENTERPRISE
          </span>
        </div>
      </div>

      {/* Operational Metrics & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
        
        {/* Live Operational Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#94a3b8' : '#475569', background: isDark ? '#111827' : '#f8fafc', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, padding: '0.375rem 0.75rem', borderRadius: '0.5rem' }}>
          <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>RLS SYSTEM: <strong style={{ color: '#10b981' }}>Active & Healthy</strong></span>
        </div>

        {/* Annual ARR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDark ? '#94a3b8' : '#475569', background: isDark ? '#111827' : '#f8fafc', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, padding: '0.375rem 0.75rem', borderRadius: '0.5rem' }}>
          <IndianRupee style={{ color: '#10b981', width: '0.875rem', height: '0.875rem' }} />
          <span>ARR: <strong style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: 800 }}>₹{(totalMRR * 12).toLocaleString('en-IN')}</strong></span>
        </div>

        {/* Active Superadmin Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#6366f1', background: isDark ? '#1e1b4b' : '#e0e7ff', border: `1px solid ${isDark ? '#312e81' : '#c7d2fe'}`, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontWeight: 800 }}>
          <User style={{ width: '0.875rem', height: '0.875rem' }} />
          <span>{user?.userId || 'ssrit'}</span>
        </div>

        {/* Issue License Button */}
        <button
          onClick={onOpenLicenseWizard}
          style={{ background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)' }}
        >
          <Sparkles style={{ color: '#fde047', width: '0.875rem', height: '0.875rem' }} />
          <span>Issue License</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          style={{
            background: isDark ? '#111827' : '#f1f5f9',
            border: `1px solid ${isDark ? '#1f2937' : '#cbd5e1'}`,
            color: isDark ? '#fbbf24' : '#475569',
            padding: '0.4rem 0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          {isDark ? <Sun style={{ width: '0.875rem', height: '0.875rem', color: '#fbbf24' }} /> : <Moon style={{ width: '0.875rem', height: '0.875rem' }} />}
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out from Platform Admin"
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
              color: isDark ? '#f87171' : '#dc2626',
              padding: '0.4rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 800
            }}
          >
            <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

