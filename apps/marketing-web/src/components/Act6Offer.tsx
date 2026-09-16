import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { PricingTier } from '../types';

interface Act6OfferProps {
  pricingTier: PricingTier;
  onClaimOffer: () => void;
}

export const Act6Offer: React.FC<Act6OfferProps> = ({ pricingTier, onClaimOffer }) => {
  return (
    <section id="act-6" className="act-6-stage">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
          <span className="badge-gold">
            ACT 6 • THE UNIFIED ENTERPRISE OFFER
          </span>
        </div>

        <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', textAlign: 'center', marginBottom: '0.85rem' }}>
          One Flat Price. Zero Limits. Full Access.
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', textAlign: 'center', maxWidth: '720px', marginBottom: '2.75rem', lineHeight: 1.65 }}>
          Forget complicated tiers and per-user monthly surcharges. Run all your outlets, counters, and rooms under one straightforward annual license.
        </p>

        {/* Receipt-Style Pricing Card in Daylight Elevation */}
        <div className="receipt-card">
          
          <div className="receipt-tear-edge">
            FLAT ANNUAL LICENSE • UNLIMITED EVERYTHING
          </div>

          <div style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800 }}>{pricingTier.name}</h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              {pricingTier.description}
            </p>
          </div>

          {/* Premium Price Numeral Box (Muted Gold & Bold Scale, Zero Glow) */}
          <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center', marginBottom: '2.25rem', boxShadow: 'var(--shadow-elevation-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: 'clamp(3.2rem, 6vw, 4.4rem)', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', letterSpacing: '-0.03em' }}>
                ₹12,000
              </span>
              <span style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                / year
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '0.02em' }}>
              Zero Monthly Fees • Unlimited Outlets • Pure Database SSOT
            </p>
          </div>

          {/* Sequential Receipt Checklist */}
          <div className="receipt-checklist">
            {pricingTier.features.map((feat, idx) => (
              <div key={idx} className="receipt-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="var(--accent-emerald)" strokeWidth={3} />
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{feat}</span>
                </div>
                <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
                  INCLUDED
                </span>
              </div>
            ))}
          </div>

          <button 
            className="btn-cinema-primary"
            style={{ width: '100%', padding: '1.15rem', fontSize: '1.05rem', marginTop: '1rem' }}
            onClick={onClaimOffer}
          >
            <Sparkles size={20} />
            Book Live Demo & Claim Unlimited Access
          </button>

        </div>

      </div>
    </section>
  );
};
