import React, { useState } from 'react';
import { ShieldCheck, X, User, Mail, Lock, Phone } from 'lucide-react';
import { Tenant } from '../types';
import { apiClient } from '@ssrone/api-client';

interface ProvisionSuperadminModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSuccess?: () => void;
  theme?: 'light' | 'dark';
}

export const ProvisionSuperadminModal: React.FC<ProvisionSuperadminModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSuccess,
  theme = 'light'
}) => {
  if (!isOpen || !tenant) return null;

  const isDark = theme === 'dark';
  const [fullName, setFullName] = useState(tenant.adminName || '');
  const [email, setEmail] = useState(tenant.adminEmail || '');
  const [phone, setPhone] = useState(tenant.adminPhone || '');
  const [password, setPassword] = useState('Admin@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || 'Tenant';
      const lastName = parts.slice(1).join(' ') || 'Admin';
      const slug = (tenant as any).slug 
        || tenant.domain.replace('.ssrone.ai', '').trim() 
        || tenant.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      // Call provision-superadmin endpoint
      await apiClient.post('/auth/provision-superadmin', {
        tenant_slug: slug,
        email: email.trim().toLowerCase(),
        password: password,
        first_name: firstName,
        last_name: lastName,
        phone: phone.trim()
      });

      setSuccessMsg(`✅ Superadmin user '${email}' successfully provisioned for ${tenant.name}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Provision Superadmin Error:', err);
      setError(err?.response?.data?.detail || 'Failed to provision Superadmin account.');
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
        zIndex: 110
      }}
    >
      <div
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: '1rem',
          maxWidth: '32rem',
          width: '100%',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0 }}>
                Provision Company Super Admin
              </h3>
              <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', margin: 0 }}>
                Tenant: {tenant.name} ({tenant.domain})
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '0.8125rem', fontWeight: 700 }}>
              {successMsg}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Super Admin Full Name *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0 0.75rem' }}>
              <User style={{ width: '1rem', height: '1rem', color: isDark ? '#64748b' : '#94a3b8', marginRight: '0.5rem' }} />
              <input
                type="text"
                required
                placeholder="e.g. Sumit Singh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.5rem 0', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Super Admin Email Address *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0 0.75rem' }}>
              <Mail style={{ width: '1rem', height: '1rem', color: isDark ? '#64748b' : '#94a3b8', marginRight: '0.5rem' }} />
              <input
                type="email"
                required
                placeholder="admin@baithakcafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.5rem 0', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Contact Phone Number
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0 0.75rem' }}>
              <Phone style={{ width: '1rem', height: '1rem', color: isDark ? '#64748b' : '#94a3b8', marginRight: '0.5rem' }} />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.5rem 0', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginBottom: '0.25rem' }}>
              Account Password *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: isDark ? '#090d16' : '#f8fafc', border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`, borderRadius: '0.5rem', padding: '0 0.75rem' }}>
              <Lock style={{ width: '1rem', height: '1rem', color: isDark ? '#64748b' : '#94a3b8', marginRight: '0.5rem' }} />
              <input
                type="password"
                required
                placeholder="Admin@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.5rem 0', fontSize: '0.875rem', color: isDark ? '#ffffff' : '#0f172a', outline: 'none' }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic', margin: '0.25rem 0 0 0' }}>
            * Note: Super Admin accounts belong to the Company level and have universal access to ALL branches under {tenant.name}.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, background: 'transparent', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              {isSubmitting ? 'Provisioning...' : 'Provision Super Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
