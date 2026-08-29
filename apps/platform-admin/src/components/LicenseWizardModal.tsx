import React, { useState } from 'react';
import { Key, X, Copy, Check, Sparkles, Building2, Layers, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Calendar, Phone, Mail, User } from 'lucide-react';
import { Button } from '@ssrone/ui';
import { CreateTenantDTO, EnabledModules } from '../types';

interface LicenseWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOnboardTenant?: (dto: CreateTenantDTO) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const LicenseWizardModal: React.FC<LicenseWizardModalProps> = ({
  isOpen,
  onClose,
  onOnboardTenant,
  theme = 'light'
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const [step, setStep] = useState<1 | 2>(1);

  const todayStr = new Date().toISOString().split("T")[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const defaultExpiryStr = nextYearDate.toISOString().split("T")[0];

  // STEP 1: Tenant Identity & Admin Credentials
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Sumit@1320');
  const [dbStrategy, setDbStrategy] = useState<'Shared Schema RLS' | 'Dedicated Database'>('Shared Schema RLS');

  // STEP 2: Subscription & Payment Verification
  const [tier, setTier] = useState<'Starter' | 'Professional' | 'Enterprise'>('Enterprise');
  const [subscriptionType, setSubscriptionType] = useState<CreateTenantDTO['subscriptionType']>('Yearly Standard (₹12,000)');
  const [yearlyFee, setYearlyFee] = useState(12000);
  const [paymentMethod, setPaymentMethod] = useState<CreateTenantDTO['paymentMethod']>('UPI Transfer');
  const [paymentRef, setPaymentRef] = useState(`UTR-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [startDate, setStartDate] = useState(todayStr);
  const [expiryDate, setExpiryDate] = useState(defaultExpiryStr);
  const [maxOutlets, setMaxOutlets] = useState(15);

  const [modules, setModules] = useState<EnabledModules>({
    pos: true,
    hotel: true,
    pg: true,
    inventory: true,
    finance: true,
    crm: true,
    ai: true,
    kds: true,
    spaPlugin: false,
    banquetPlugin: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleModule = (modKey: keyof EnabledModules) => {
    setModules(prev => ({ ...prev, [modKey]: !prev[modKey] }));
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Customer Tenant Business Name');
      return;
    }
    setStep(2);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = domain.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const dto: CreateTenantDTO = {
        name: name.trim(),
        domain: domain.trim() || `${slug}.ssrone.ai`,
        adminName: adminName.trim() || `${name.trim()} Admin`,
        adminEmail: adminEmail.trim() || `admin@${slug}.com`,
        adminPhone: adminPhone.trim() || '+91 98765 43210',
        adminPassword: adminPassword || 'Sumit@1320',
        tier,
        dbStrategy,
        maxOutlets,
        
        subscriptionType,
        yearlyFee,
        paymentMethod,
        paymentRef,
        subscriptionStartDate: startDate,
        subscriptionExpiryDate: expiryDate,

        enabledModules: modules,
        initialCompanyName: `${name.trim()} Private Limited`,
        initialBranchName: `${name.trim()} - Main Outlet`
      };

      if (onOnboardTenant) {
        await onOnboardTenant(dto);
      }
      onClose();
    } catch (err) {
      console.error("Onboarding failed", err);
    } finally {
      setIsSubmitting(false);
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
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Building2 style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Onboard SSR IT Customer Tenant
              </h3>
              <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                Step {step} of 2 • Provision Customer Account & Subscription Entitlements
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', padding: '0.5rem 1.5rem', background: isDark ? '#090d16' : '#f8fafc', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ height: '4px', borderRadius: '2px', background: step >= 1 ? '#6366f1' : (isDark ? '#1e293b' : '#cbd5e1') }}></div>
          <div style={{ height: '4px', borderRadius: '2px', background: step >= 2 ? '#6366f1' : (isDark ? '#1e293b' : '#cbd5e1') }}></div>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 && (
            <form id="step1-form" onSubmit={handleNextToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                  Customer Tenant Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baithak Cafe & Hospitality Group"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                  Custom Domain Slug
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="baithak"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    style={{ flex: 1, background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem 0 0 0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
                  />
                  <span style={{ background: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#94a3b8' : '#64748b', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '0 0.5rem 0.5rem 0', fontFamily: 'monospace' }}>
                    .ssrone.ai
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                  Database Security Isolation Strategy
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setDbStrategy('Shared Schema RLS')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: dbStrategy === 'Shared Schema RLS' ? '2px solid #6366f1' : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                      background: dbStrategy === 'Shared Schema RLS' ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff') : (isDark ? '#090d16' : '#f8fafc'),
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.875rem' }}>Shared Schema RLS</div>
                    <div style={{ fontSize: '0.625rem', color: '#6366f1', fontFamily: 'monospace' }}>Standard Multi-Tenant Engine</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDbStrategy('Dedicated Database')}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: dbStrategy === 'Dedicated Database' ? '2px solid #6366f1' : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                      background: dbStrategy === 'Dedicated Database' ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff') : (isDark ? '#090d16' : '#f8fafc'),
                      color: isDark ? '#ffffff' : '#0f172a',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '0.875rem' }}>Dedicated Database</div>
                    <div style={{ fontSize: '0.625rem', color: '#059669', fontFamily: 'monospace' }}>Isolated DB Instance (Enterprise)</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 2 && (
            <form id="step2-form" onSubmit={handleCompleteOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
                  Subscription Tier & Quota Limits
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {(['Starter', 'Professional', 'Enterprise'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTier(t)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: tier === t ? `2px solid #6366f1` : `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                        background: tier === t ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff') : (isDark ? '#090d16' : '#f8fafc'),
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '0.875rem' }}>{t} Tier</div>
                      <div style={{ fontSize: '0.625rem', color: tier === t ? '#6366f1' : '#64748b', fontFamily: 'monospace' }}>
                        {t === 'Starter' ? 'Max 3 Outlets' : t === 'Professional' ? 'Max 8 Outlets' : 'Max 25 Outlets'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CreditCard size={14} /> Subscription Payment & Validity Period
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
                    >
                      <option value="UPI Transfer">UPI Transfer</option>
                      <option value="Razorpay Online">Razorpay Online</option>
                      <option value="Bank NEFT/RTGS">Bank NEFT/RTGS</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>UTR / Reference #</label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Wizard Step Footer Actions */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, background: isDark ? '#090d16' : '#f8fafc', borderRadius: '0 0 1rem 1rem' }}>
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as any)}>
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} /> Back
            </Button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <Button type="submit" form="step1-form" variant="primary">
              Next: Payment & Subscription <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </Button>
          )}

          {step === 2 && (
            <Button type="submit" form="step2-form" variant="primary">
              Next: Setup Company & Issue Token <Sparkles style={{ width: '1rem', height: '1rem', color: '#fde047' }} />
            </Button>
          )}

          {step === 3 && (
            <Button type="button" variant="primary" onClick={handleCompleteOnboarding} disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning Tenant...' : 'Complete & Save to Database'}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
