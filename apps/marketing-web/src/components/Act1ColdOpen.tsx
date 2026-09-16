import React, { useEffect, useRef } from 'react';
import { Sparkles, Play, AlertTriangle } from 'lucide-react';

interface Act1ColdOpenProps {
  scrollProgress: number;
  scrollToAct: (actNumber: number) => void;
  onOpenVideoModal: () => void;
  onOpenDemoModal: () => void;
}

const CINEMATIC_HERO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-grid-loop-41484-large.mp4";

export const Act1ColdOpen: React.FC<Act1ColdOpenProps> = ({
  scrollProgress,
  scrollToAct,
  onOpenVideoModal,
  onOpenDemoModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-Time 60fps Constellation Canvas Engine (Soft Emerald & Soft Gold on Charcoal)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['rgba(16, 185, 129, 0.75)', 'rgba(184, 134, 11, 0.75)', 'rgba(52, 211, 153, 0.65)'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1.2,
        color: colors[i % colors.length]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.16 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes with soft elevation
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Compute smooth dissolution to daylight as scroll progresses past Act 1
  const dissolveToLight = Math.min(1, Math.max(0, (scrollProgress - 7) / 8));

  return (
    <section 
      id="act-1" 
      className="act-1-stage"
      style={{
        backgroundColor: `color-mix(in srgb, var(--bg-charcoal) ${100 - dissolveToLight * 100}%, var(--bg-primary) ${dissolveToLight * 100}%)`,
        color: dissolveToLight > 0.6 ? 'var(--text-primary)' : '#FFFFFF'
      }}
    >
      {/* Background Ambient Video Stream */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="ambient-video-bg"
        src={CINEMATIC_HERO_VIDEO}
        style={{ opacity: 0.22 * (1 - dissolveToLight) }}
      />
      
      <div 
        className="ambient-overlay" 
        style={{ opacity: 1 - dissolveToLight }}
      />
      
      <canvas 
        ref={canvasRef} 
        className="hero-particle-canvas" 
        style={{ opacity: 1 - dissolveToLight }}
      />

      {/* Floating Scattered Chaos Panels (Dissolves as user scrolls) */}
      <div 
        className="chaos-wrapper" 
        style={{ 
          opacity: Math.max(0, 1 - scrollProgress * 0.12),
          transform: `translateY(${scrollProgress * -2}px)`
        }}
      >
        <div className="chaos-panel" style={{ top: '16%', left: '8%', transform: 'rotate(-3deg)' }}>
          <AlertTriangle size={15} color="#C2410C" />
          <span>DISCONNECTED RETAIL BARCODE REGISTERS</span>
        </div>
        <div className="chaos-panel" style={{ top: '22%', right: '10%', transform: 'rotate(4deg)' }}>
          <AlertTriangle size={15} color="#B8860B" />
          <span>HOTEL CHECK-INS LOST ON PAPER</span>
        </div>
        <div className="chaos-panel" style={{ bottom: '18%', left: '12%', transform: 'rotate(2deg)' }}>
          <AlertTriangle size={15} color="#C2410C" />
          <span>MESSY PG RENT IN EXCEL SPREADSHEETS</span>
        </div>
        <div className="chaos-panel" style={{ bottom: '22%', right: '12%', transform: 'rotate(-4deg)' }}>
          <AlertTriangle size={15} color="#B8860B" />
          <span>POS COUNTERS OUT OF SYNC WITH KITCHEN</span>
        </div>
      </div>

      {/* Central Converging Hero Content */}
      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '980px' }}>
        
        <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
          <span className="badge-emerald" style={{ background: dissolveToLight > 0.6 ? 'var(--accent-emerald-badge)' : 'rgba(16, 185, 129, 0.15)', color: dissolveToLight > 0.6 ? 'var(--accent-emerald)' : '#34D399' }}>
            <Sparkles size={14} />
            THE ENTERPRISE OPERATING SYSTEM • SSR IT INDUSTRY
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)', fontWeight: 900, lineHeight: 1.12, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: dissolveToLight > 0.6 ? 'var(--text-primary)' : '#FFFFFF' }}>
          From Multi-Outlet Chaos to <span style={{ color: dissolveToLight > 0.6 ? '#103B2B' : '#34D399', transition: 'color 0.4s ease' }}>Autonomous Order</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: dissolveToLight > 0.6 ? 'var(--text-secondary)' : '#CBD5E1', maxWidth: '820px', margin: '0 auto 2.5rem auto', lineHeight: 1.6, fontWeight: 500 }}>
          Unify your Restaurant POS, Hotel PMS, Hostel Rent Ledgers, Barcode Billing, and AI Copilot under one high-speed PostgreSQL engine.
        </p>

        {/* Action Hub */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button className="btn-cinema-primary" onClick={onOpenDemoModal}>
            <Sparkles size={18} />
            Book Customized Live Demo
          </button>

          <button 
            className="btn-cinema-secondary" 
            onClick={onOpenVideoModal}
            style={{
              background: dissolveToLight > 0.6 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
              color: dissolveToLight > 0.6 ? 'var(--accent-emerald)' : '#FFFFFF',
              borderColor: dissolveToLight > 0.6 ? 'var(--accent-emerald-border)' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Play size={17} color={dissolveToLight > 0.6 ? '#103B2B' : '#FFFFFF'} fill={dissolveToLight > 0.6 ? '#103B2B' : '#FFFFFF'} />
            Watch Cinematic Trailer
          </button>
        </div>

        {/* Scroll Down Indicator */}
        <div 
          onClick={() => scrollToAct(2)}
          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: 0.85 }}
        >
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: dissolveToLight > 0.6 ? 'var(--text-muted)' : '#94A3B8', fontWeight: 700 }}>
            SCRUB SCROLL TO REVEAL
          </span>
          <div style={{ width: '22px', height: '36px', borderRadius: '14px', border: `2px solid ${dissolveToLight > 0.6 ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.3)'}`, display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
            <div style={{ width: '4px', height: '8px', borderRadius: '2px', background: 'var(--accent-emerald)', animation: 'scrollPulse 1.5s infinite ease-in-out' }} />
          </div>
        </div>

      </div>

    </section>
  );
};
