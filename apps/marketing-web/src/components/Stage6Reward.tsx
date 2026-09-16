import React from 'react';
import { Sparkles, Check, Key, ShieldCheck } from 'lucide-react';
import { PricingTier } from '../types';
import { RoiCalculator } from './RoiCalculator';
import { GoldenMasterKey3D } from './Interactive3DArtifacts';
import { sound } from '../utils/soundEngine';

interface Stage6RewardProps {
  pricingTier: PricingTier;
  onClaimOffer: () => void;
  lang?: 'en' | 'hi';
}

export const Stage6Reward: React.FC<Stage6RewardProps> = ({
  pricingTier,
  onClaimOffer,
  lang = 'en',
}) => {
  return (
    <section id="stage-reward" className="journey-stage stage-reward-zone">
      <div className="container">
        
        {/* Seamless Header Block */}
        <div className="reward-header-block">
          <div className="reward-header-pill">
            <Sparkles size={15} color="var(--accent-gold)" />
            <span>
              {lang === 'hi' ? 'पांचवा चरण • पारदर्शी मूल्य निर्धारण' : 'STAGE 5 • FLAT ENTERPRISE PRICING (SSOT)'}
            </span>
          </div>

          <h2 className="reward-headline">
            {lang === 'hi'
              ? 'मास्टर लाइसेंस: एक निश्चित शुल्क। असीमित आउटलेट्स।'
              : 'The Enterprise Master License: Flat ₹12,000 / Year. Zero Limits.'}
          </h2>

          <p className="reward-subtext">
            {lang === 'hi'
              ? 'असीमित शाखाएं, असीमित कैशियर लॉगिन, और सभी 14+ मॉड्यूल केवल ₹12,000/वर्ष में। कोई प्रति-उपयोगकर्ता अधिभार नहीं, कोई क्लाउड लॉक-इन शुल्क नहीं।'
              : 'Zero per-user surcharges, zero room taxes, and zero surprise renewal fees. Flat ₹12,000 per year unlocks the complete 14-module operating system across all your branches, cashiers, and devices with pure PostgreSQL isolation and 99.9% cloud uptime SLA.'}
          </p>
        </div>

        {/* Seamless Widescreen Dual-Wing Grid (Fit to Screen) */}
        <div className="reward-dual-wing-grid">
          
          {/* Left Wing: Interactive 3D Key & Master Enterprise License Console */}
          <div className="reward-left-wing">
            <div className="key-showcase-mount">
              <GoldenMasterKey3D onUnlock={onClaimOffer} />
            </div>

            <div className="license-glass-panel">
              <div className="receipt-tear-edge">
                FLAT ANNUAL MASTER LICENSE • UNLIMITED EVERYTHING
              </div>

              <div className="reward-price-box">
                <div className="price-numeral-row">
                  <span className="price-currency">₹</span>
                  <span className="price-amount">12,000</span>
                  <span className="price-period">/ year</span>
                </div>
                <p className="price-subclause">
                  Zero Monthly Fees • Unlimited Outlets • Pure Database SSOT
                </p>
              </div>

              <div className="receipt-checklist">
                {pricingTier.features.map((feat, idx) => (
                  <div key={idx} className="receipt-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="receipt-check-bubble">
                        <Check size={14} color="var(--accent-emerald)" strokeWidth={3} />
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{feat}</span>
                    </div>
                    <span className="receipt-included-badge">
                      INCLUDED
                    </span>
                  </div>
                ))}
              </div>

              <div className="reward-guarantee-strip">
                <ShieldCheck size={18} color="var(--accent-emerald)" />
                <span>Backed by SSR IT INDUSTRY Service Level Agreement (99.9% Uptime)</span>
              </div>

              <button 
                className="btn-cinema-primary btn-claim-key"
                onClick={() => {
                  sound.playChime();
                  onClaimOffer();
                }}
              >
                <Key size={18} color="#FFFFFF" />
                <span>
                  {lang === 'hi' ? 'अपनी ₹12,000 वार्षिक मास्टर कुंजी प्राप्त करें' : 'Claim Your ₹12,000 Annual Master Key'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Wing: Interactive ROI & SaaS Savings Calculator */}
          <div className="reward-right-wing">
            <RoiCalculator onClaimOffer={onClaimOffer} />
          </div>

        </div>

      </div>
    </section>
  );
};

export default Stage6Reward;
