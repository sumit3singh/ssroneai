import React from 'react';
import { 
  Utensils, 
  Hotel, 
  Home, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { VerticalSolution } from '../types';

interface Act4WorldsProps {
  verticals: VerticalSolution[];
  selectedVertical: string;
  setSelectedVertical: (verticalId: string) => void;
  onSelectVerticalForDemo: (verticalId: string) => void;
}

export const Act4Worlds: React.FC<Act4WorldsProps> = ({
  verticals,
  selectedVertical,
  setSelectedVertical,
  onSelectVerticalForDemo,
}) => {
  const currentVertical = verticals.find(v => v.id === selectedVertical) || verticals[0];

  const getVerticalIcon = (id: string) => {
    switch (id) {
      case 'restaurant': return <Utensils size={16} />;
      case 'hotel': return <Hotel size={16} />;
      case 'pg': return <Home size={16} />;
      case 'retail': return <ShoppingBag size={16} />;
      default: return <Utensils size={16} />;
    }
  };

  return (
    <section id="act-4" className="act-4-stage">
      <div className="container">
        
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge-emerald">ACT 4 • SPECIALIZED VERTICAL WORLDS</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginTop: '0.85rem', marginBottom: '0.85rem' }}>
            Tailored Architecture for Every Industry Vertical
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.6 }}>
            Select or scrub through each specialized world below to inspect deep operational workflows.
          </p>
        </div>

        {/* Jump Nav Tabs */}
        <div className="jump-nav-tabs">
          {verticals.map((v) => (
            <button
              key={v.id}
              className={`jump-tab-btn ${selectedVertical === v.id ? 'active' : ''}`}
              onClick={() => setSelectedVertical(v.id)}
            >
              {getVerticalIcon(v.id)}
              <span>{v.name}</span>
            </button>
          ))}
        </div>

        {/* Active World Card with Elevation Shadow & Unified Emerald Accent */}
        <div className="cinema-card" style={{ padding: '3rem', background: '#FFFFFF', border: '1px solid var(--border-subtle)' }}>
          
          <div className="world-card-grid">
            
            <div>
              <span className="badge-emerald" style={{ marginBottom: '1rem' }}>
                {currentVertical.badge}
              </span>

              <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginTop: '0.85rem', marginBottom: '0.85rem', lineHeight: 1.25, color: 'var(--text-primary)' }}>
                {currentVertical.headline}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                {currentVertical.description}
              </p>

              {/* Key Features Grid with Universal Emerald Accents */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {currentVertical.keyFeatures.map((feat, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-primary)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={16} color="var(--accent-emerald)" />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{feat.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feat.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn-cinema-primary"
                  onClick={() => onSelectVerticalForDemo(currentVertical.id)}
                >
                  Schedule {currentVertical.name} Demo
                  <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {currentVertical.statMetric.value}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    {currentVertical.statMetric.label}
                  </span>
                </div>
              </div>

            </div>

            {/* World Visual Preview Banner */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation)' }}>
              <img 
                src={currentVertical.heroImage} 
                alt={currentVertical.name}
                style={{ width: '100%', height: '440px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(16, 59, 43, 0.88) 100%)' }} />
              
              <div style={{ position: 'absolute', bottom: '1.75rem', left: '1.75rem', right: '1.75rem' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.95)', color: 'var(--accent-emerald)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', display: 'inline-block', marginBottom: '0.5rem' }}>
                  SSR ONE AI • LIVE PRODUCTION
                </span>
                <h4 style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 800 }}>
                  {currentVertical.name} Architecture
                </h4>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
