import React from 'react';
import { ArrowRight, Database, ShieldAlert, ShieldCheck, Layers, Cpu } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface Stage2InvitationProps {
  onEnterWorld: () => void;
}

export const Stage2Invitation: React.FC<Stage2InvitationProps> = ({ onEnterWorld }) => {
  return (
    <section id="stage-invitation" className="journey-stage stage-invitation-zone">
      <div className="container">
        
        <div className="invitation-card">
          
          <div className="invitation-badge">
            <Database size={13} color="var(--accent-emerald)" />
            <span>STAGE 2 • ENTERPRISE ARCHITECTURE & SSOT</span>
          </div>

          <h2 className="invitation-heading">
            The Architectural Breakthrough: One Pure Database Kernel
          </h2>

          <p className="invitation-text">
            Traditional multi-outlet businesses struggle with software fragmentation—paying for 5 to 7 separate vendors for POS, Hotel PMS, Student PG billing, and inventory. Data gets out of sync, stock leaks, and night audits become nightmares. SSR One AI eliminates data drift with an authoritative PostgreSQL Single Source of Truth (SSOT).
          </p>

          {/* Architectural Comparison Matrix */}
          <div className="architecture-comparison-grid">
            
            {/* Legacy Fragmented Stack */}
            <div className="comparison-card legacy-card">
              <div className="comparison-header">
                <div className="comparison-icon-badge danger">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <span className="comparison-tag">THE PROBLEM</span>
                  <h3 className="comparison-title">Fragmented Multi-Vendor Stack</h3>
                </div>
              </div>

              <ul className="comparison-list">
                <li>
                  <span className="bullet-danger">✕</span>
                  <div>
                    <strong>Disconnected Data Silos:</strong> POS, PMS, and Retail run on separate cloud servers with fragile webhook syncs.
                  </div>
                </li>
                <li>
                  <span className="bullet-danger">✕</span>
                  <div>
                    <strong>Compounding Subscriptions:</strong> Paying ₹8,000 to ₹25,000/month across 5+ different software providers.
                  </div>
                </li>
                <li>
                  <span className="bullet-danger">✕</span>
                  <div>
                    <strong>Inventory & Ledger Drift:</strong> Kitchen sales don't match warehouse stock; cash drawers fail to reconcile.
                  </div>
                </li>
                <li>
                  <span className="bullet-danger">✕</span>
                  <div>
                    <strong>Vendor Lock-in & Room Taxes:</strong> SaaS providers tax you extra for every staff login, table, or guest room.
                  </div>
                </li>
              </ul>
            </div>

            {/* SSR One AI Unified Platform */}
            <div className="comparison-card unified-card">
              <div className="comparison-header">
                <div className="comparison-icon-badge success">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="comparison-tag success">THE SOLUTION</span>
                  <h3 className="comparison-title">SSR One AI Unified Database Kernel</h3>
                </div>
              </div>

              <ul className="comparison-list">
                <li>
                  <span className="bullet-success">✓</span>
                  <div>
                    <strong>Single PostgreSQL Source of Truth:</strong> One authoritative schema with Row-Level Security (RLS) multi-tenancy.
                  </div>
                </li>
                <li>
                  <span className="bullet-success">✓</span>
                  <div>
                    <strong>Flat ₹12,000 / Year Pricing:</strong> Complete 14-module platform with unlimited outlets, staff, and counters.
                  </div>
                </li>
                <li>
                  <span className="bullet-success">✓</span>
                  <div>
                    <strong>Sub-2ms Zero-Lag Orders:</strong> Orders dispatch directly to thermal printers, KDS screens, and ledger in milliseconds.
                  </div>
                </li>
                <li>
                  <span className="bullet-success">✓</span>
                  <div>
                    <strong>Integrated RAG AI Copilot:</strong> Query revenue, dish margins, and occupancy in plain English or Hindi directly from SQL.
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <button 
              className="btn-cinema-primary" 
              onClick={() => {
                sound.playClick();
                onEnterWorld();
              }}
            >
              <Layers size={16} />
              <span>Explore The 4 Enterprise Districts</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Stage2Invitation;

