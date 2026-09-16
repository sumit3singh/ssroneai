import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '3.5rem 0', background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>SSR IT INDUSTRY</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            © 2026 SSR IT INDUSTRY. All Rights Reserved. SSR One AI Platform.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>PostgreSQL Multi-Tenancy RLS</span>
          <span>Zero-Wait POS Architecture</span>
          <span>Single Source of Truth</span>
          <span>Privacy & Security</span>
        </div>
      </div>
    </footer>
  );
};
