import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Act3RevealProps {
  scrollToAct: (actNumber: number) => void;
}

export const Act3Reveal: React.FC<Act3RevealProps> = ({ scrollToAct }) => {
  return (
    <section id="act-3" className="act-3-stage">
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        
        <div className="unified-core-card">
          
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <span className="badge-emerald">
              ACT 3 • THE MONEY-SHOT CONVERGENCE
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.2rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            One Database. One Truth. Every Outlet.
          </h2>

          <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto', lineHeight: 1.65 }}>
            All 4 fragmented worlds collapse into a single high-availability PostgreSQL engine. Multi-tenant Row-Level Security ensures 100% cryptographic data isolation across all your branches.
          </p>

          {/* Earned Scrubbed Stats Grid */}
          <div className="core-stats-grid">
            
            <div className="stat-box">
              <div className="number">14+</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Integrated Modules</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>POS, PMS, PG, Retail, KDS & CRM in one kernel</p>
            </div>

            <div className="stat-box">
              <div className="number">&lt; 0.2s</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dispatch Latency</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Real-time order sync with thermal station routing</p>
            </div>

            <div className="stat-box">
              <div className="number">100%</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>PostgreSQL RLS</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Bank-grade cryptographic branch isolation</p>
            </div>

            <div className="stat-box">
              <div className="number">₹12,000</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Flat Annual License</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Unlimited outlets with zero per-user charges</p>
            </div>

          </div>

          <div style={{ marginTop: '2.75rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-cinema-primary" onClick={() => scrollToAct(4)}>
              Explore The Four Vertical Worlds
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
