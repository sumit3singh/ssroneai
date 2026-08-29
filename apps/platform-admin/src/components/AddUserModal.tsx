import React, { useState } from 'react';
import { UserPlus, Shield, X, Check, Building2, GitBranch } from 'lucide-react';
import { Button, Input } from '@ssrone/ui';
import { Tenant, Company, Branch } from '../types';
import { apiClient } from "@ssrone/api-client";

interface AddUserModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  theme?: 'light' | 'dark';
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  tenant,
  isOpen,
  onClose,
  onUserCreated,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<'Tenant Admin' | 'Branch Manager' | 'Cashier' | 'Store Manager' | 'Accountant'>('Branch Manager');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !tenant) return null;

  const availableCompanies = tenant.companies || [];
  const selectedCompany = availableCompanies.find(c => c.id === selectedCompanyId) || availableCompanies[0];
  const availableBranches = selectedCompany?.branches || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setErrorMsg('First Name, Last Name, and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Create user record in PostgreSQL db via POST /business/users
      const userPayload = {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        email: email,
        phone: phone || null,
        password: password || "admin123",
        tenant_id: Number(tenant.id),
        company_id: selectedCompanyId ? Number(selectedCompanyId) : (availableCompanies[0]?.id ? Number(availableCompanies[0].id) : 1),
        branch_id: selectedBranchId ? Number(selectedBranchId) : (availableBranches[0]?.id ? Number(availableBranches[0].id) : 1),
        is_active: true,
        preferences: {
          role_name: role,
          assigned_company: selectedCompany?.name || '',
          assigned_branch: availableBranches.find(b => b.id === selectedBranchId)?.name || ''
        }
      };

      await apiClient.post('/business/users', userPayload);
      
      onUserCreated();
      onClose();
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      console.error('Error creating user in PostgreSQL database:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to persist user in database. Please check email uniqueness.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.75rem', width: '100%', maxWidth: '30rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <UserPlus size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, fontFamily: 'monospace' }}>
                ADD USER OPERATOR
              </h3>
              <p style={{ fontSize: '0.6875rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                Assign User to Tenant <strong style={{ color: '#6366f1' }}>{tenant.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: isDark ? '#7f1d1d' : '#fef2f2', border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`, color: isDark ? '#f87171' : '#dc2626', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>
                First Name *
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sumit"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>
                Last Name *
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Singh"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>
                Work Email Address *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@baithak.com"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>
                Login Password *
              </label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>
              Assign Role / Designation
            </label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
            >
              <option value="Tenant Admin">Tenant Admin (Full System Access)</option>
              <option value="Branch Manager">Branch Manager (Outlet Operations)</option>
              <option value="Cashier">Cashier (POS Checkout & Orders)</option>
              <option value="Store Manager">Store Manager (Inventory & Stock)</option>
              <option value="Accountant">Accountant (Invoices & Finance)</option>
            </select>
          </div>

          {/* Assigned Company & Branch Context */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <Building2 size={10} /> Assign Company
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              >
                <option value="">-- All Companies --</option>
                {availableCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <GitBranch size={10} /> Assign Primary Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                style={{ width: '100%', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.375rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontFamily: 'monospace', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              >
                <option value="">-- All Outlets --</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingTop: '0.75rem' }}>
            <Button type="button" onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="primary" size="sm" className="flex items-center gap-1">
              <Check size={14} />
              <span>{isSubmitting ? 'Persisting...' : 'Save User to DB'}</span>
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
