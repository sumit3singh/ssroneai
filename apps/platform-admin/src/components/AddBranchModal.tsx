import React, { useState } from 'react';
import { GitBranch, X, Plus } from 'lucide-react';
import { Button } from '@ssrone/ui';
import { Branch, Company, Tenant } from '../types';

interface AddBranchModalProps {
  tenant: Tenant | null;
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onAddBranch: (tenantId: string, companyId: string, branch: Branch) => void;
  theme?: 'light' | 'dark';
}

export const AddBranchModal: React.FC<AddBranchModalProps> = ({
  tenant,
  company,
  isOpen,
  onClose,
  onAddBranch,
  theme = 'light'
}) => {
  if (!isOpen || !tenant || !company) return null;

  const isDark = theme === 'dark';

  const defaultBranchName = `${company.name} Outlet 0${company.branches.length + 1}`;
  const [branchName, setBranchName] = useState(defaultBranchName);
  const [branchCode, setBranchCode] = useState(`BTC-${company.name.substring(0, 3).toUpperCase()}-0${company.branches.length + 1}`);
  const [city, setCity] = useState('New Delhi');
  const [manager, setManager] = useState(tenant.adminName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBranchName = branchName.trim() || defaultBranchName;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        name: finalBranchName,
        code: branchCode || `OUT-${Math.floor(10 + Math.random() * 90)}`,
        city: city || 'New Delhi',
        status: 'Active',
        manager: manager || tenant.adminName
      };

      await onAddBranch(tenant.id, company.id, newBranch);
      onClose();
    } catch (err: any) {
      console.error("Add branch error:", err);
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to save branch in database.');
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
          maxWidth: '28rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <GitBranch style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Add Branch Outlet
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace' }}>
                  Company: <strong>{company.name}</strong>
                </span>
                <span style={{ fontSize: '0.6875rem', background: isDark ? '#1e1b4b' : '#e0e7ff', color: isDark ? '#a5b4fc' : '#4338ca', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  Tenant ID: {tenant.id} | Company ID: {company.id}
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

          <div style={{ background: isDark ? '#090d16' : '#f1f5f9', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            <span style={{ color: isDark ? '#94a3b8' : '#475569' }}>Target Parent Binding:</span>
            <span style={{ fontWeight: 700, color: '#d97706' }}>Tenant ID #{tenant.id} → Company ID #{company.id}</span>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.375rem' }}>
              Branch Outlet Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Connaught Place Branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Branch Code *</label>
              <input
                type="text"
                required
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.625rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>Outlet Manager / Supervisor</label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.5rem', fontSize: '0.75rem', color: isDark ? '#ffffff' : '#0f172a' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : <><Plus size={14} /> Add Branch</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
