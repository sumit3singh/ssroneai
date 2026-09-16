import React, { useState } from 'react';
import { Sparkles, Play, Volume2, VolumeX, Globe } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface HeaderProps {
  isHeaderVisible: boolean;
  scrollToAct: (actNumber: number) => void;
  onOpenVideoModal: () => void;
  onOpenDemoModal: () => void;
  lang?: 'en' | 'hi';
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isHeaderVisible,
  scrollToAct,
  onOpenVideoModal,
  onOpenDemoModal,
  lang = 'en',
  onToggleLang,
}) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleSoundToggle = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className={`cinematic-header ${isHeaderVisible ? 'visible' : 'hidden'}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Brand Emblem */}
        <div className="brand-emblem" onClick={() => { sound.playClick(); scrollToAct(1); }}>
          <div className="brand-emblem-badge">
            <Sparkles size={18} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'block', color: 'var(--text-primary)' }}>
              SSR ONE AI
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
              BY SSR IT INDUSTRY
            </span>
          </div>
        </div>

        {/* Quick Jump Links */}
        <nav className="header-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button className="nav-link" onClick={() => { sound.playClick(); scrollToAct(4); }}>
            {lang === 'hi' ? 'उद्योग' : 'Verticals'}
          </button>
          <button className="nav-link" onClick={() => { sound.playClick(); scrollToAct(5); }}>
            {lang === 'hi' ? 'एआई कोपायलट' : 'AI Copilot'}
          </button>
          <button className="nav-link" onClick={() => { sound.playClick(); scrollToAct(6); }}>
            {lang === 'hi' ? '₹12,000 वार्षिक' : 'Flat Pricing (₹12K)'}
          </button>
          <button className="nav-link" onClick={() => { sound.playClick(); scrollToAct(7); }}>
            {lang === 'hi' ? 'संपर्क' : 'Direct Contact'}
          </button>
        </nav>

        {/* Action Controls: Sound + Lang + CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Audio Synthesizer Toggle */}
          <button 
            className={`btn-header-icon ${!isMuted ? 'active-audio' : ''}`}
            onClick={handleSoundToggle}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} color="var(--accent-emerald)" />}
          </button>

          {/* Language Switcher */}
          {onToggleLang && (
            <button 
              className="btn-header-icon"
              onClick={() => { sound.playClick(); onToggleLang(); }}
              title="Toggle Language"
            >
              <Globe size={14} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>{lang.toUpperCase()}</span>
            </button>
          )}

          <button 
            className="btn-cinema-secondary" 
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', minHeight: '36px' }}
            onClick={() => { sound.playClick(); onOpenVideoModal(); }}
          >
            <Play size={13} color="#103B2B" fill="#103B2B" />
            <span>Trailer</span>
          </button>

          <button 
            className="btn-cinema-primary" 
            style={{ padding: '0.45rem 1.2rem', fontSize: '0.82rem', minHeight: '36px' }}
            onClick={() => { sound.playClick(); onOpenDemoModal(); }}
          >
            <Sparkles size={13} />
            <span>Book Live Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
