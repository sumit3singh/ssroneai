import React from 'react';
import { Utensils, Hotel, Home, ShoppingBag, ArrowRight } from 'lucide-react';

interface Act2ProblemProps {
  scrollToAct: (actNumber: number) => void;
}

export const Act2Problem: React.FC<Act2ProblemProps> = ({ scrollToAct }) => {
  return (
    <section id="act-2" className="act-2-stage">
      <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
        
        <span className="badge-terracotta">
          ACT 2 • THE ARCHITECTURAL PROBLEM
        </span>

        <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 2.75rem)', marginTop: '0.9rem', marginBottom: '0.9rem' }}>
          The Crippling Cost of Disconnected Systems
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.6, maxWidth: '780px', margin: '0 auto' }}>
          Running separate software for every outlet creates blind spots, data leaks, delayed KOTs, and hours lost in manual tallying.
        </p>

        {/* Floating Problem Panels Grid */}
        <div className="panels-chaos-grid">
          
          <div className="problem-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--accent-terracotta-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={20} color="var(--accent-terracotta)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', textAlign: 'left' }}>Restaurant POS Silo</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, textAlign: 'left' }}>
              Slow billing counters, missed modifiers, and delayed kitchen printing cause customer walkouts during dinner rush.
            </p>
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                CRITICAL: No Real-Time KDS Sync
              </span>
            </div>
          </div>

          <div className="problem-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--accent-terracotta-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hotel size={20} color="var(--accent-terracotta)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', textAlign: 'left' }}>Hotel PMS Disconnect</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, textAlign: 'left' }}>
              Room inventory double-booked across OTAs. Room dining charges lost because restaurant bills never reach guest folio.
            </p>
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                CRITICAL: Paper Room Register
              </span>
            </div>
          </div>

          <div className="problem-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--accent-terracotta-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={20} color="var(--accent-terracotta)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', textAlign: 'left' }}>Hostel & PG Rent Loss</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, textAlign: 'left' }}>
              Tenants missing monthly rent, disputed electricity utility deductions, and lack of verified digital KYC agreements.
            </p>
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                CRITICAL: Disputed WhatsApp Ledgers
              </span>
            </div>
          </div>

          <div className="problem-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--accent-terracotta-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="var(--accent-terracotta)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', textAlign: 'left' }}>Retail Inventory Leakage</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, textAlign: 'left' }}>
              Stock theft and expiring batches go undetected without automated inter-branch transfers and live barcode sync.
            </p>
            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                CRITICAL: Zero Stock Traceability
              </span>
            </div>
          </div>

        </div>

        <button className="btn-cinema-primary" onClick={() => scrollToAct(3)}>
          Witness The Unified Convergence
          <ArrowRight size={16} />
        </button>

      </div>
    </section>
  );
};
