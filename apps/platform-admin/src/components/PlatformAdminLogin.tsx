import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface PlatformAdminLoginProps {
  onLoginSuccess: (user: { userId: string; name: string }) => void;
  theme?: 'light' | 'dark';
}

export const PlatformAdminLogin: React.FC<PlatformAdminLoginProps> = ({
  onLoginSuccess,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanUser = userId.trim().toLowerCase();
      
      if ((cleanUser === 'ssrit' || cleanUser === 'ssrit@ssrone.ai') && password === 'Sumit@1320') {
        const userData = {
          userId: 'ssrit',
          name: 'SSR IT Master Operator',
          email: 'ssrit@ssrone.ai',
          role: 'Platform Superadmin'
        };
        localStorage.setItem('platform_admin_auth_user', JSON.stringify(userData));
        onLoginSuccess(userData);
      } else {
        setErrorMsg('Invalid credentials. Please enter valid User ID (ssrit) and Password (Sumit@1320).');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleQuickFill = () => {
    setUserId('ssrit');
    setPassword('Sumit@1320');
    setErrorMsg(null);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: isDark 
          ? 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 60%, #030712 100%)'
          : 'radial-gradient(circle at 50% 20%, #e0e7ff 0%, #f8fafc 60%, #f1f5f9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '28rem',
          background: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)'
            : '0 25px 50px -12px rgba(99, 102, 241, 0.15), 0 10px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Header Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
          <div 
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #4f46e5, #9333ea, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
            }}
          >
            <ShieldCheck style={{ color: '#ffffff', width: '2rem', height: '2rem' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              SSR IT INDUSTRY
            </h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', fontFamily: 'monospace', margin: '0.25rem 0 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform Governance IDE • Superadmin Portal
            </p>
          </div>
        </div>

        {/* Demo Credentials Badge */}
        <div 
          onClick={handleQuickFill}
          title="Click to quick-fill fixed credentials"
          style={{
            background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.06)',
            border: `1px dashed ${isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: '#818cf8' }} />
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: isDark ? '#c7d2fe' : '#4338ca', fontFamily: 'monospace' }}>
                SUPERADMIN CREDENTIALS
              </div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontFamily: 'monospace' }}>
                User ID: <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>ssrit</strong> | Pass: <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Sumit@1320</strong>
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', fontFamily: 'monospace', background: isDark ? '#1e1b4b' : '#e0e7ff', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
            Auto Fill
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div 
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
              border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
              color: isDark ? '#f87171' : '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.625rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'monospace'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
              <User size={12} /> Platform User ID *
            </label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. ssrit"
              style={{
                width: '100%',
                background: isDark ? '#090d16' : '#f8fafc',
                border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
                borderRadius: '0.5rem',
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: isDark ? '#ffffff' : '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#94a3b8' : '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
              <Lock size={12} /> Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  background: isDark ? '#090d16' : '#f8fafc',
                  border: `1px solid ${isDark ? '#1e293b' : '#cbd5e1'}`,
                  borderRadius: '0.5rem',
                  padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: isDark ? '#ffffff' : '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform Admin</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.6875rem', color: isDark ? '#64748b' : '#94a3b8', margin: 0, fontFamily: 'monospace' }}>
            SSR ONE AI • SECURE HYBRID RLS MULTI-TENANT ARCHITECTURE
          </p>
        </div>
      </div>
    </div>
  );
};
