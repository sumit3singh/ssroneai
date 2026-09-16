import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Database, Lock, CheckCircle2 } from 'lucide-react';

export const TrustAuthorityBar: React.FC = () => {
  const [transactionAmount, setTransactionAmount] = useState(1482490);

  // Simulated live transaction ticker increment
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactionAmount(prev => prev + Math.floor(Math.random() * 450 + 120));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="trust-authority-bar">
      <div className="trust-bar-content">
        
        {/* Live Transaction Ticker */}
        <div className="live-ticker-cluster">
          <div className="pulse-live-indicator">
            <span className="pulse-circle" />
            <Activity size={15} color="#10B981" />
            <span className="ticker-label">LIVE SYSTEM TELEMETRY:</span>
          </div>
          
          <div className="ticker-stats-stream">
            <span className="stat-highlight">
              ₹{transactionAmount.toLocaleString('en-IN')}
            </span>
            <span className="stat-subtext">processed today across 180+ outlets</span>
            <span className="ticker-divider">&bull;</span>
            <span className="stat-latency">&lt; 0.2s KOT dispatch</span>
            <span className="ticker-divider">&bull;</span>
            <span className="stat-uptime">
              <Database size={13} />
              99.99% PostgreSQL Cluster Health
            </span>
          </div>
        </div>

        {/* Compliance & Security Seals */}
        <div className="compliance-seals-cluster">
          <div className="seal-item">
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>NPCI UPI Verified</span>
          </div>
          <div className="seal-item">
            <Lock size={14} color="var(--accent-emerald)" />
            <span>PostgreSQL RLS Multi-Tenant</span>
          </div>
          <div className="seal-item">
            <CheckCircle2 size={14} color="var(--accent-emerald)" />
            <span>GSTR-1/3B Audit Compliant</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrustAuthorityBar;
