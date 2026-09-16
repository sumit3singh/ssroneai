import React from 'react';
import { ArrowDown, Sparkles, Play, Shield, Building2, Layers } from 'lucide-react';
import { HeroCanvas3D } from './HeroCanvas3D';
import { TrustAuthorityBar } from './TrustAuthorityBar';
import { sound } from '../utils/soundEngine';

interface Stage1ArrivalProps {
  onStartJourney: () => void;
  onOpenVideoModal: () => void;
  onOpenDemoModal: () => void;
  lang?: 'en' | 'hi';
}

export const Stage1Arrival: React.FC<Stage1ArrivalProps> = ({
  onStartJourney,
  onOpenVideoModal,
  onOpenDemoModal,
  lang = 'en',
}) => {
  return (
    <section id="stage-arrival" className="journey-stage stage-arrival-zone">
      {/* ── 3D Interactive Three.js WebGL Citadel Background ── */}
      <HeroCanvas3D />

      <div className="container" style={{ position: 'relative', zIndex: 20 }}>
        {/* Executive Hero Content Card */}
        <div className="arrival-gate-card">
          
          <div className="gate-header-pill">
            <span className="gate-dot" />
            <span className="gate-tag">
              {lang === 'hi' 
                ? 'एंटरप्राइज ऑपरेटिंग सिस्टम • एसएसआर आईटी इंडस्ट्री' 
                : 'ENTERPRISE OPERATING SYSTEM • PURE DATABASE SSOT'}
            </span>
          </div>

          <div className="gate-brand-banner">
            <div className="gate-crest">
              <Building2 size={26} color="var(--accent-emerald)" />
            </div>
            <div>
              <span className="gate-subtext">
                {lang === 'hi' ? 'एसएसआर वन एआई' : 'SSR ONE AI PLATFORM'}
              </span>
              <h1 className="gate-title">
                {lang === 'hi' ? 'एसएसआर आईटी इंडस्ट्री' : 'SSR IT INDUSTRY'}
              </h1>
            </div>
          </div>

          <h2 className="hero-statement-headline">
            {lang === 'hi'
              ? 'एक ही डेटाबेस। सभी रेस्टोरेंट, होटल, पीजी और रिटेल संचालन।'
              : 'One Unified Platform For All Hospitality & Retail Operations.'}
          </h2>

          <p className="gate-mission-lead">
            {lang === 'hi'
              ? 'विखंडित सॉफ्टवेयर से मुक्ति पाएं। रेस्टोरेंट पीओएस, होटल पीएमएस, पीजी हॉस्टल और रिटेल ईआरपी को एक अखंडित पोस्टग्रेएसक्यूएल कर्नेल में एकीकृत करें। शून्य डेटा विसंगति और असीमित काउंटरों के साथ पूर्ण व्यापार नियंत्रण।'
              : 'Replace 6 fragmented SaaS subscriptions with one authoritative operating system. Point of Sale, Hotel PMS, Student PG Living, and Multi-Branch Retail ERP run seamlessly on a unified PostgreSQL kernel with zero sync lag, instant thermal billing, and autonomous AI analytics.'}
          </p>

          {/* Founder & Engineering Heritage Plaque */}
          <div className="gate-credentials-grid">
            <div className="credential-chip">
              <Shield size={20} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Engineered by SSR IT INDUSTRY</strong>
                <span>Founded by Sumit Singh • Pure Database SSOT • Zero Vendor Lock-in</span>
              </div>
            </div>
            <div className="credential-chip">
              <Sparkles size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Flat Enterprise Licensing</strong>
                <span>₹12,000 / Year • Unlimited Outlets, Staff Logins & Counters</span>
              </div>
            </div>
          </div>

          {/* Premium Action CTAs */}
          <div className="gate-actions-row">
            <button 
              className="btn-cinema-primary" 
              onClick={() => {
                sound.playClick();
                onOpenDemoModal();
              }}
            >
              <Sparkles size={16} />
              <span>{lang === 'hi' ? 'लाइव डेमो बुक करें' : 'Schedule Live Demo'}</span>
            </button>

            <button 
              className="btn-cinema-secondary" 
              onClick={() => {
                sound.playClick();
                onOpenVideoModal();
              }}
            >
              <Play size={14} fill="var(--accent-emerald)" color="var(--accent-emerald)" />
              <span>{lang === 'hi' ? 'सिस्टम वीडियो देखें' : 'Watch Architecture Video'}</span>
            </button>

            <button 
              className="btn-cinema-glass" 
              onClick={() => {
                sound.playClick();
                onStartJourney();
              }}
            >
              <Layers size={14} />
              <span>{lang === 'hi' ? 'मॉड्यूल देखें' : 'Explore Core Modules'}</span>
              <ArrowDown size={14} />
            </button>
          </div>

        </div>

        {/* ── Real-Time Trust & Authority Telemetry Bar ── */}
        <div style={{ marginTop: '3rem' }}>
          <TrustAuthorityBar />
        </div>

      </div>
    </section>
  );
};

export default Stage1Arrival;
