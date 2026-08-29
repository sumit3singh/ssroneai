import React, { useState, useEffect } from 'react';
import { Key, X, Copy, Check, RefreshCw, ShieldCheck, Layers, CheckCircle2, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { Button, Badge } from '@ssrone/ui';
import { Tenant, EnabledModules } from '../types';

interface ConfigureLicenseModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLicense: (tenantId: string, updatedData: Partial<Tenant>) => Promise<void>;
  onRenewSubscription?: (tenantId: string, currentExpiry: string, paymentRef: string, paymentMethod: string) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const ConfigureLicenseModal: React.FC<ConfigureLicenseModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onSaveLicense,
  onRenewSubscription,
  theme = 'light'
}) => {
  if (!isOpen || !tenant) return null;

  const isDark = theme === 'dark';

  const [tier, setTier] = useState<Tenant['tier']>(tenant.tier);
  const [status, setStatus] = useState<Tenant['status']>(tenant.status);
  const [maxOutlets, setMaxOutlets] = useState<number>(tenant.maxOutlets);
  const [yearlyFee, setYearlyFee] = useState<number>(tenant.yearlyFee || 12000);
  const [licenseKey, setLicenseKey] = useState<string>(tenant.licenseKey);
  const [dbStrategy, setDbStrategy] = useState<Tenant['dbStrategy']>(tenant.dbStrategy);
  const [expiryDate, setExpiryDate] = useState<string>(tenant.subscriptionExpiryDate || '');
  const [modules, setModules] = useState<EnabledModules>({ ...tenant.enabledModules });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [renewalRef, setRenewalRef] = useState(`UTR-RENEW-${Math.floor(100000 + Math.random() * 900000)}`);
  const [renewalMethod, setRenewalMethod] = useState('UPI Transfer');

  useEffect(() => {
    if (tenant) {
      setTier(tenant.tier);
      setStatus(tenant.status);
      setMaxOutlets(tenant.maxOutlets);
      setYearlyFee(tenant.yearlyFee || 12000);
      setLicenseKey(tenant.licenseKey);
      setDbStrategy(tenant.dbStrategy);
      setExpiryDate(tenant.subscriptionExpiryDate || '');
      setModules({ ...tenant.enabledModules });
    }
  }, [tenant]);

  const handleRotateKey = () => {
    const r1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const r2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `SSR-LIC-2026-${r1}-${r2}-${tier.substring(0, 3).toUpperCase()}`;
    setLicenseKey(key);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const toggleModule = (modKey: keyof EnabledModules) => {
    setModules(prev => ({
      ...prev,
      [modKey]: !prev[modKey]
    }));
  };

  const handleRenewOneYear = async () => {
    if (!tenant) return;
    setIsRenewing(true);
    try {
      if (onRenewSubscription) {
        await onRenewSubscription(tenant.id, expiryDate, renewalRef, renewalMethod);
      } else {
        const exp = new Date(expiryDate || new Date());
        exp.setFullYear(exp.getFullYear() + 1);
        const newExpStr = exp.toISOString().split("T")[0];
        setExpiryDate(newExpStr);
        setStatus("Active");
        await onSaveLicense(tenant.id, {
          status: "Active",
          subscriptionExpiryDate: newExpStr,
          paymentStatus: "PAID"
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to renew subscription", err);
    } finally {
      setIsRenewing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveLicense(tenant.id, {
        tier,
        status,
        maxOutlets,
        yearlyFee,
        monthlyFee: Math.round(yearlyFee / 12),
        licenseKey,
        dbStrategy,
        subscriptionExpiryDate: expiryDate,
        enabledModules: modules
      });
      onClose();
    } catch (err) {
      console.error("Failed to save license configuration", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isDark ? 'rgba(9, 13, 22, 0.85)' : 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100
      }}
    >
      <div 
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: '1rem',
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <Key style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Manage Tenant Subscription & License
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace', margin: 0 }}>
                Customer: {tenant.name} ({tenant.domain})
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Subscription Renewal Card */}
          <div style={{ background: isDark ? '#064e3b/20' : '#ecfdf5', border: `1px solid ${isDark ? '#047857' : '#a7f3d0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Subscription Validity: {expiryDate} ({tenant.daysRemaining > 0 ? `${tenant.daysRemaining} Days Left` : 'EXPIRED'})
                </span>
                <p style={{ fontSize: '0.625rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                  Yearly Fee: ₹{yearlyFee.toLocaleString('en-IN')}/year • Status: {tenant.paymentStatus}
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRenewOneYear}
                disabled={isRenewing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>{isRenewing ? 'Renewing...' : 'Renew (+1 Year)'}</span>
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${isDark ? '#047857' : '#a7f3d0'}` }}>
              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Renewal Payment Method</label>
                <select
                  value={renewalMethod}
                  onChange={(e) => setRenewalMethod(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}
                >
                  <option value="UPI Transfer">UPI Transfer</option>
                  <option value="Razorpay Online">Razorpay Online</option>
                  <option value="Bank NEFT/RTGS">Bank Direct NEFT</option>
                  <option value="Cash / Cheque">Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Renewal UTR Ref #</label>
                <input
                  type="text"
                  value={renewalRef}
                  onChange={(e) => setRenewalRef(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a' }}
                />
              </div>
            </div>
          </div>

          {/* Row 1: Licensing Tier & Tenant Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                Subscription Plan Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
                {(['Starter', 'Professional', 'Enterprise'] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setTier(t);
                      setYearlyFee(t === 'Starter' ? 6000 : t === 'Professional' ? 12000 : 24000);
                    }}
                    style={{
                      padding: '0.5rem 0.25rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: tier === t ? '1px solid #6366f1' : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                      background: tier === t ? (isDark ? 'rgba(79, 70, 229, 0.25)' : '#e0e7ff') : (isDark ? '#090d16' : '#f8fafc'),
                      color: tier === t ? (isDark ? '#a5b4fc' : '#4338ca') : (isDark ? '#94a3b8' : '#64748b'),
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                Account Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                {(['Active', 'Suspended', 'Trial', 'Expired'] as const).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    style={{
                      padding: '0.5rem 0.125rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      border: status === st ? `1px solid ${st === 'Active' ? '#059669' : st === 'Suspended' ? '#dc2626' : '#d97706'}` : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                      background: status === st ? (st === 'Active' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5') : st === 'Suspended' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2') : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb')) : (isDark ? '#090d16' : '#f8fafc'),
                      color: status === st ? (st === 'Active' ? '#059669' : st === 'Suspended' ? '#dc2626' : '#d97706') : (isDark ? '#94a3b8' : '#64748b'),
                      cursor: 'pointer'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Outlets Quota & Yearly SaaS Fee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                  Max Outlets Limit
                </label>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', fontFamily: 'monospace' }}>{maxOutlets} Outlets</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={maxOutlets}
                onChange={(e) => setMaxOutlets(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                Yearly SaaS Fee (₹ INR / Year)
              </label>
              <input
                type="number"
                min="0"
                value={yearlyFee}
                onChange={(e) => setYearlyFee(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: isDark ? '#090d16' : '#f8fafc',
                  border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#059669',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* License Key Generator Box */}
          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace' }}>
                Cryptographic RSA/HMAC License Key
              </span>
              <button
                type="button"
                onClick={handleRotateKey}
                style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <RefreshCw style={{ width: '0.75rem', height: '0.75rem' }} />
                <span>Rotate Key</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={licenseKey}
                style={{
                  flex: 1,
                  background: isDark ? '#0f172a' : '#ffffff',
                  border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleCopyKey}
                style={{
                  background: copiedKey ? '#059669' : (isDark ? '#1e293b' : '#e2e8f0'),
                  color: copiedKey ? '#ffffff' : (isDark ? '#e2e8f0' : '#475569'),
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {copiedKey ? <Check style={{ width: '0.875rem', height: '0.875rem' }} /> : <Copy style={{ width: '0.875rem', height: '0.875rem' }} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Module Entitlements Toggle Matrix */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.5rem' }}>
              Module Entitlements & Feature Toggles
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {(Object.keys(modules) as Array<keyof EnabledModules>).map((modKey) => {
                const isEnabled = modules[modKey];
                const labels: Record<string, string> = {
                  pos: "Point of Sale & Restaurant POS",
                  hotel: "Hotel PMS & Room Inventory",
                  pg: "PG & Co-Living Management",
                  inventory: "Batch Inventory & Warehouse",
                  finance: "General Ledger & Accounting",
                  crm: "CRM, Loyalty & Marketing",
                  ai: "AI Copilot & OCR Engine",
                  kds: "Kitchen Display System (KDS)",
                  spaPlugin: "Spa & Wellness Extension",
                  banquetPlugin: "Banquet & Event Management"
                };

                return (
                  <button
                    type="button"
                    key={modKey}
                    onClick={() => toggleModule(modKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: isEnabled ? `1px solid ${isDark ? 'rgba(99, 102, 241, 0.5)' : '#c7d2fe'}` : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                      background: isEnabled ? (isDark ? 'rgba(79, 70, 229, 0.15)' : '#e0e7ff') : (isDark ? '#090d16' : '#f8fafc'),
                      color: isEnabled ? (isDark ? '#a5b4fc' : '#4338ca') : (isDark ? '#64748b' : '#94a3b8'),
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span className="truncate">{labels[modKey] || modKey}</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, padding: '0.125rem 0.375rem', borderRadius: '0.25rem', background: isEnabled ? '#059669' : (isDark ? '#1e293b' : '#cbd5e1'), color: '#ffffff', marginLeft: '0.5rem' }}>
                      {isEnabled ? 'ENABLED' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving to Database...' : 'Save & Persist License'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};
