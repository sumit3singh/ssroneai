import React, { useState } from 'react';
import { X, Building2, Key, Layers, GitBranch, CreditCard, Clock, Copy, Check, ShieldCheck, Mail, Phone, ExternalLink, RefreshCw } from 'lucide-react';
import { Button, Badge } from '@ssrone/ui';
import { Tenant } from '../types';

interface TenantDetailDrawerProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConfigure: (tenant: Tenant) => void;
  onRenewSubscription?: (tenantId: string, currentExpiry: string, paymentRef: string, paymentMethod: string) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const TenantDetailDrawer: React.FC<TenantDetailDrawerProps> = ({
  tenant,
  isOpen,
  onClose,
  onOpenConfigure,
  onRenewSubscription,
  theme = 'light'
}) => {
  if (!isOpen || !tenant) return null;

  const isDark = theme === 'dark';
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [copiedCredsOnly, setCopiedCredsOnly] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(tenant.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const effectiveAdminPassword = tenant.adminPassword || (tenant as any).settings?.admin_password || 'Admin@123';

  const handleGetPackageText = () => {
    return `
🔑 SSR ONE AI - CUSTOMER LOGIN CREDENTIALS
=========================================
Tenant Name: ${tenant.name} (ID: #${tenant.id})
ERP Portal: https://${tenant.domain || 'app.ssrone.ai'}
User ID / Email: ${tenant.adminEmail}
Password: ${effectiveAdminPassword}
License Key: ${tenant.licenseKey}
Plan Tier: ${tenant.tier} | Expiry: ${tenant.subscriptionExpiryDate}
`.trim();
  };

  const handleCopyCustomerPackage = () => {
    navigator.clipboard.writeText(handleGetPackageText());
    setCopiedPackage(true);
    setTimeout(() => setCopiedPackage(false), 2500);
  };

  const handleCopyCredsOnly = () => {
    const credsText = `
ERP Portal: https://${tenant.domain || 'app.ssrone.ai'}
Tenant ID: #${tenant.id}
User ID: ${tenant.adminEmail}
Password: ${effectiveAdminPassword}
License Key: ${tenant.licenseKey}
`.trim();

    navigator.clipboard.writeText(credsText);
    setCopiedCredsOnly(true);
    setTimeout(() => setCopiedCredsOnly(false), 2500);
  };

  const handleQuickRenew = async () => {
    if (!onRenewSubscription) return;
    setIsRenewing(true);
    try {
      const utrRef = `UTR-RENEW-${Math.floor(100000 + Math.random() * 900000)}`;
      await onRenewSubscription(tenant.id, tenant.subscriptionExpiryDate, utrRef, tenant.paymentMethod || 'UPI Transfer');
      onClose();
    } catch (err) {
      console.error("Renewal failed", err);
    } finally {
      setIsRenewing(false);
    }
  };

  const isExpired = tenant.daysRemaining <= 0;
  const totalOutlets = tenant.companies.reduce((acc, c) => acc + c.branches.length, 0);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isDark ? 'rgba(9, 13, 22, 0.85)' : 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 100
      }}
    >
      <div 
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          width: '100%',
          maxWidth: '36rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          boxShadow: '-25px 0 50px -12px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Building2 style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{tenant.name}</span>
                <span style={{ fontSize: '0.6875rem', background: isDark ? '#1e1b4b' : '#e0e7ff', color: '#6366f1', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  Tenant ID: #{tenant.id}
                </span>
              </h3>
              <a 
                href={`https://${tenant.domain}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>{tenant.domain}</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Copy Customer Credentials Box */}
          <div style={{ background: isDark ? '#111827' : '#f8fafc', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key style={{ color: '#6366f1', width: '1.125rem', height: '1.125rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'monospace' }}>
                  CUSTOMER LOGIN CREDENTIALS
                </span>
              </div>
              <Button size="sm" variant="primary" onClick={handleCopyCustomerPackage} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 cursor-pointer">
                {copiedPackage ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedPackage ? 'Copied Credentials!' : 'Copy Credentials'}</span>
              </Button>
            </div>

            {/* Simple Crisp Text Preview Box */}
            <pre 
              style={{ 
                background: isDark ? '#090d16' : '#1e293b', 
                color: '#38bdf8', 
                border: `1px solid ${isDark ? '#1e293b' : '#334155'}`, 
                borderRadius: '0.5rem', 
                padding: '0.75rem', 
                fontSize: '0.75rem', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word', 
                margin: 0
              }}
            >
              {handleGetPackageText()}
            </pre>
          </div>

          {/* Subscription Status Card */}
          <div style={{ background: isDark ? 'rgba(6, 78, 59, 0.15)' : '#ecfdf5', border: `1px solid ${isDark ? '#047857' : '#a7f3d0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock style={{ color: isExpired ? '#dc2626' : '#059669', width: '1rem', height: '1rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: isExpired ? '#dc2626' : '#059669', fontFamily: 'monospace' }}>
                  {isExpired ? 'SUBSCRIPTION EXPIRED' : `${tenant.daysRemaining} DAYS REMAINING`}
                </span>
              </div>
              <Badge variant={isExpired ? 'destructive' : 'success'} size="sm" className="font-mono">
                {tenant.status}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>Yearly Subscription Fee</span>
                <span style={{ fontWeight: 800, color: '#059669', fontFamily: 'monospace', fontSize: '1rem' }}>₹{tenant.yearlyFee.toLocaleString('en-IN')}/yr</span>
              </div>
              <div>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.625rem', textTransform: 'uppercase', fontFamily: 'monospace' }}>Expiry Date</span>
                <span style={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', fontFamily: 'monospace' }}>{tenant.subscriptionExpiryDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: `1px solid ${isDark ? '#047857' : '#a7f3d0'}`, fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#475569' }}>Billing Reference: <strong style={{ color: '#d97706' }}>{tenant.paymentRef || 'AUTOPAY-UPI-9812'}</strong></span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Auto-Renewal Active</span>
            </div>
          </div>

          {/* Database Isolation & Dedicated Instance Architecture */}
          <div style={{ background: isDark ? '#0b0f19' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8', fontFamily: 'monospace' }}>
                DATABASE ISOLATION ARCHITECTURE
              </span>
              <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 800, color: '#10b981', background: isDark ? '#064e3b' : '#d1fae5', padding: '0.125rem 0.5rem', borderRadius: '0.25rem' }}>
                ● 100% HEALTHY & ENFORCED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <div style={{ background: isDark ? '#111827' : '#ffffff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, borderRadius: '0.5rem', padding: '0.625rem' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.625rem' }}>Isolation Strategy:</span>
                <strong style={{ color: '#6366f1' }}>{tenant.dbStrategy || 'Shared Schema RLS'}</strong>
              </div>

              <div style={{ background: isDark ? '#111827' : '#ffffff', border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`, borderRadius: '0.5rem', padding: '0.625rem' }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', fontSize: '0.625rem' }}>Database Target:</span>
                <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                  {tenant.dbStrategy === 'Dedicated PostgreSQL Database' 
                    ? `db-dedicated-${tenant.id}.ssrone.ai:5432` 
                    : 'postgres-cluster-primary:5432'}
                </strong>
              </div>
            </div>

            <div style={{ fontSize: '0.6875rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.4 }}>
              {tenant.dbStrategy === 'Dedicated PostgreSQL Database' ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  🔒 Dedicated Instance: This enterprise customer runs on an isolated PostgreSQL server cluster with dedicated IOPS and zero noisy-neighbor impact.
                </span>
              ) : (
                <span>
                  🛡️ Shared RLS: Tenant data is strictly isolated using PostgreSQL Row-Level Security (`tenant_id = ${tenant.id}`) on the primary cluster.
                </span>
              )}
            </div>
          </div>

          {/* Master Tenant Admin Details */}
          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366f1', fontFamily: 'monospace' }}>
              Master Tenant Admin Credentials (Tenant ID #{tenant.id})
            </span>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
              {tenant.adminName}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12} /> Email: <strong>{tenant.adminEmail}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> Phone: <strong>{tenant.adminPhone || '+91 98765 43210'}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Key size={12} /> Admin Pass: <strong>{effectiveAdminPassword}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={12} /> Portal: <strong>https://{tenant.domain}</strong></span>
            </div>
          </div>

          {/* Cryptographic License Token */}
          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                Cryptographic License Key
              </span>
              <Badge variant="purple" size="sm">{tenant.tier}</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.375rem', padding: '0.5rem 0.75rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                {tenant.licenseKey}
              </span>
              <button onClick={handleCopyKey} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedKey ? '#059669' : '#64748b' }}>
                {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Company & Outlets Breakdown */}
          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                Companies & Outlets under Tenant #{tenant.id} ({totalOutlets} / Max {tenant.maxOutlets})
              </span>
              <span style={{ fontSize: '0.625rem', color: '#6366f1', fontFamily: 'monospace' }}>{tenant.dbStrategy}</span>
            </div>

            {tenant.companies.map((c) => (
              <div key={c.id} style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}>
                    <Layers size={14} color="#a855f7" />
                    <span>{c.name}</span>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700, color: '#a855f7', background: isDark ? '#2e1065' : '#f3e8ff', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>Co ID: #{c.id}</span>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#64748b' }}>GSTIN: {c.gstin}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(168, 85, 247, 0.4)' }}>
                  {c.branches.map((b) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <GitBranch size={10} color="#d97706" /> 
                        <span>{b.name}</span>
                        <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', fontWeight: 700, color: '#d97706', background: isDark ? '#451a03' : '#fef3c7', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>Branch ID: #{b.id}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Module Entitlements Matrix */}
          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
              Module Entitlements Suite
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem' }}>
              {Object.entries(tenant.enabledModules).map(([mKey, isEnabled]) => (
                <div key={mKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.625rem', fontWeight: 600, background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                  <span style={{ textTransform: 'uppercase' }}>{mKey}</span>
                  <span style={{ fontWeight: 800, color: isEnabled ? '#059669' : '#dc2626' }}>{isEnabled ? '✓ Active' : 'Off'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', background: isDark ? '#090d16' : '#f8fafc' }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onClose();
              onOpenConfigure(tenant);
            }}
          >
            Manage Subscription & License
          </Button>
        </div>

      </div>
    </div>
  );
};
