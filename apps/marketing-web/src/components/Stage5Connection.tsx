import React from 'react';
import { Cpu, Terminal, Sparkles, MessageSquare, Printer, Radio, CheckCircle2 } from 'lucide-react';

interface Stage5ConnectionProps {
  terminalText: string;
  isPluggedIn: boolean;
}

export const Stage5Connection: React.FC<Stage5ConnectionProps> = ({
  terminalText,
  isPluggedIn,
}) => {
  return (
    <section id="stage-connection" className="journey-stage stage-connection-zone">
      <div className="container">
        
        {/* Convergence Visual Header */}
        <div className="connection-header-card">
          <div className="convergence-pill">
            <Radio size={14} className="pulse-radio" />
            <span>STAGE 4 • AUTONOMOUS RAG AI COPILOT</span>
          </div>

          <h2 className="connection-title">
            Direct PostgreSQL AI Copilot & Real-Time Natural Language Analytics
          </h2>

          <p className="connection-subtitle">
            Zero hallucinations, zero third-party data exposure. SSR One AI connects a Retrieval-Augmented Generation (RAG) engine directly to your tenant's PostgreSQL database. Ask business questions in plain English or Hindi and receive verified financial metrics, recipe margins, and guest occupancy forecasts in seconds.
          </p>

          {/* Central Neural Tower Visual with Interactive Plug-In Status */}
          <div className={`neural-tower-visual ${isPluggedIn ? 'plugged-in' : ''}`}>
            
            {/* Tower Core Graphic */}
            <div className="tower-core-chassis">
              <div className="tower-antenna">
                <div className="signal-ring ring-a" />
                <div className="signal-ring ring-b" />
                <div className="core-beacon" />
              </div>

              <div className="tower-body">
                <Cpu size={32} color="var(--accent-emerald)" />
                <span className="tower-label">SSR One AI Neural Kernel</span>
                <span className="tower-sub">PostgreSQL High-Availability Cluster</span>
              </div>
            </div>

            {/* Radiant Connection Link */}
            <div className="connection-cable-stream">
              <svg viewBox="0 0 300 40" fill="none" className="cable-svg">
                <path d="M0 20 H300" stroke="hsl(220, 10%, 84%)" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M0 20 H300" stroke="var(--accent-emerald)" strokeWidth="3" className="cable-laser-active" />
              </svg>
              <div className="data-packet" />
            </div>

            {/* Traveler's Personal Business Icon Plugging In */}
            <div className="connected-business-node">
              <div className="node-icon-box">
                <span className="node-badge">YOUR BUSINESS</span>
                <span className="node-status">
                  <CheckCircle2 size={12} color="#10B981" />
                  {isPluggedIn ? 'Connected & Synchronized' : 'Connecting to Core...'}
                </span>
              </div>
            </div>

          </div>

          {/* Three Neural Gateway Cards in Crisp Daylight Mode */}
          <div className="neural-gateways-grid">
            <div className="cinema-card gateway-card">
              <div className="gateway-icon-badge">
                <Cpu size={20} color="var(--accent-emerald)" />
              </div>
              <h4>Autonomous RAG Copilot</h4>
              <p>Query cross-outlet sales, top gross margin dishes, and room occupancy projections in natural English or Hindi.</p>
            </div>

            <div className="cinema-card gateway-card">
              <div className="gateway-icon-badge">
                <MessageSquare size={20} color="var(--accent-emerald)" />
              </div>
              <h4>Voice Order Assistant</h4>
              <p>Counter staff speak naturally into microphones. Items are added to the bill and routed to KDS screens in 0.2s.</p>
            </div>

            <div className="cinema-card gateway-card">
              <div className="gateway-icon-badge">
                <Printer size={20} color="var(--accent-emerald)" />
              </div>
              <h4>Universal Hardware Gateway</h4>
              <p>Direct driverless sync with USB, Ethernet, and Bluetooth thermal printers, cash drawers, and barcode scanners.</p>
            </div>
          </div>

          {/* Live Simulated Light IDE Terminal */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red" />
                <div className="terminal-dot amber" />
                <div className="terminal-dot green" />
              </div>
              <span className="terminal-title">
                ssrone-copilot-engine v2.4 (PostgreSQL Connected • Live Socket)
              </span>
              <Terminal size={15} color="var(--accent-emerald)" />
            </div>

            <div className="terminal-body">
              <pre className="terminal-pre">
                <span className="terminal-prompt">&gt; </span>
                {terminalText || "ssrone query --scope='all-outlets' 'Which menu item had highest margin this week?'"}
                <span className="terminal-cursor">|</span>
              </pre>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Stage5Connection;
