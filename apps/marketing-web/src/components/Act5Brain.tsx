import React from 'react';
import { Cpu, MessageSquare, Printer, Terminal } from 'lucide-react';

interface Act5BrainProps {
  terminalText: string;
}

export const Act5Brain: React.FC<Act5BrainProps> = ({ terminalText }) => {
  return (
    <section id="act-5" className="act-5-stage">
      <div className="container" style={{ textAlign: 'center', maxWidth: '860px', position: 'relative', zIndex: 10 }}>
        
        <span className="badge-emerald">
          ACT 5 • AUTONOMOUS INTELLIGENCE CORE
        </span>

        <h2 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 2.75rem)', marginTop: '0.85rem', marginBottom: '0.85rem' }}>
          The Neural Core of Your Multi-Branch Business
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.65, maxWidth: '760px', margin: '0 auto' }}>
          Ask questions in plain English or Hindi. SSR One AI continuously scans ledger transactions, order velocity, and inventory variance to deliver actionable intelligence.
        </p>

        {/* Three Neural Gateway Cards in Crisp Daylight Mode */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', margin: '2.75rem 0' }}>
          
          <div className="cinema-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', border: '1px solid var(--accent-emerald-border)' }}>
              <Cpu size={20} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>RAG Business Copilot</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Query cross-outlet sales, top gross margin dishes, and room occupancy projections in natural language.
            </p>
          </div>

          <div className="cinema-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', border: '1px solid var(--accent-emerald-border)' }}>
              <MessageSquare size={20} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>Voice Order Assistant</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Waitstaff speak orders naturally into counter microphones. Items are added to the bill and dispatched to KDS instantly.
            </p>
          </div>

          <div className="cinema-card" style={{ padding: '1.75rem', textAlign: 'left' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.1rem', border: '1px solid var(--accent-emerald-border)' }}>
              <Printer size={20} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>Universal Hardware Gateway</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Plug-and-play USB, Ethernet, and Bluetooth thermal receipt printers, cash drawers, and barcode scanners.
            </p>
          </div>

        </div>

        {/* Live Simulated Light IDE Terminal */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot" style={{ background: '#EF4444' }} />
              <div className="terminal-dot" style={{ background: '#F59E0B' }} />
              <div className="terminal-dot" style={{ background: '#10B981' }} />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              ssrone-copilot-engine v2.4 (PostgreSQL Connected)
            </span>
            <Terminal size={15} color="var(--accent-emerald)" />
          </div>

          <div className="terminal-body" style={{ textAlign: 'left' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', color: '#1E293B', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>&gt; </span>
              {terminalText || "ssrone query --scope='all-outlets' 'Which menu item had highest margin this week?'"}
              <span style={{ animation: 'blink 1s infinite', color: 'var(--accent-emerald)', fontWeight: 900 }}>|</span>
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
};
