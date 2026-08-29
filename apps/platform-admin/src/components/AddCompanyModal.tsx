import React, { useState } from 'react';
import { Layers, X, Plus } from 'lucide-react';
import { Button } from '@ssrone/ui';
import { Company, Tenant } from '../types';

interface AddCompanyModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (tenantId: string, company: Company) => void;
  theme?: 'light' | 'dark';
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onAddCompany,
  theme = 'light'
}) => {
  if (!isOpen || !tenant) return null;

  const isDark = theme === 'dark';

  const defaultCompName = `${tenant.name} Private Limited`;
  const [companyName, setCompanyName] = useState(defaultCompName);
  const [regNumber, setRegNumber] = useState(`U55101DL2026PTC${Math.floor(100 + Math.random() * 900)}`);
  const [gstin, setGstin] = useState(`07AAACB${Math.floor(1000 + Math.random() * 9000)}1Z5`);
  const [initialBranchName, setInitialBranchName] = useState('Main Branch');
  const [initialBranchCode, setInitialBranchCode] = useState('MAIN-01');
  const [city, setCity] = useState('New Delhi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = companyName.trim() || defaultCompName;
    const finalRegNum = (regNumber.trim() || `U55101DL2026PTC${Math.floor(100 + Math.random() * 900)}`).substring(0, 21);
    const finalGstin = (gstin.trim() || `07AAACB${Math.floor(1000 + Math.random() * 9000)}1Z5`).substring(0, 15);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newCompanyId = `cmp-${Date.now()}`;
      const newCompany: Company = {
        id: newCompanyId,
        name: finalName,
        regNumber: finalRegNum,
        gstin: finalGstin,
        branches: [
          {
            id: `br-${Date.now()}-01`,
            name: initialBranchName || 'Main Outlet',
            code: initialBranchCode || 'MAIN-01',
            city: city || 'New Delhi',
            status: 'Active',
            manager: tenant.adminName
          }
        ]
      };

      await onAddCompany(tenant.id, newCompany);
      onClose();
    } catch (err: any) {
      console.error("Add company error:", err);
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to save company in database.');
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
          maxWidth: '32rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Layers style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Add Corporate Entity (Company)
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace' }}>
                  Tenant: <strong>{tenant.name}</strong>
                </span>
                <span style={{ fontSize: '0.6875rem', background: isDark ? '#1e1b4b' : '#e0e7ff', color: isDark ? '#a5b4fc' : '#4338ca', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  Tenant ID: {tenant.id}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          {/* Explicit Target Tenant Context Box */}
          <div style={{ background: isDark ? '#090d16' : '#f1f5f9', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            <span style={{ color: isDark ? '#94a3b8' : '#475569' }}>Target Tenant Binding:</span>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>Tenant ID #{tenant.id} ({tenant.name})</span>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
              Company Legal Entity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Baithak Retail Private Limited"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Registration / CIN Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>
          </div>

          <div style={{ background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', fontFamily: 'monospace' }}>Initial Branch Outlet Setup</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.625rem', color: isDark ? '#94a3b8' : '#64748b' }}>Outlet Name</label>
                <input
                  type="text"
                  value={initialBranchName}
                  onChange={(e) => setInitialBranchName(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.25rem', padding: '0.25rem 0.375rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', color: isDark ? '#94a3b8' : '#64748b' }}>Branch Code</label>
                <input
                  type="text"
                  value={initialBranchCode}
                  onChange={(e) => setInitialBranchCode(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.25rem', padding: '0.25rem 0.375rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.625rem', color: isDark ? '#94a3b8' : '#64748b' }}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.25rem', padding: '0.25rem 0.375rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary"><Plus size={14} /> Add Company</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
