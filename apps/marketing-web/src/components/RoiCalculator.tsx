import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface RoiCalculatorProps {
  onClaimOffer?: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onClaimOffer }) => {
  const [outlets, setOutlets] = useState<number>(3);
  const [monthlyExpensePerOutlet, setMonthlyExpensePerOutlet] = useState<number>(3500);

  // Compute Financials
  const currentAnnualCost = outlets * monthlyExpensePerOutlet * 12;
  const ssrOneAnnualCost = 12000; // Flat SSOT
  const annualSavings = Math.max(0, currentAnnualCost - ssrOneAnnualCost);
  const savingsPercentage = currentAnnualCost > 0 
    ? Math.round((annualSavings / currentAnnualCost) * 100) 
    : 0;

  return (
    <div className="roi-calculator-card">
      <div className="roi-header">
        <div className="roi-pill">
          <Calculator size={15} color="var(--accent-gold)" />
          <span>REAL-TIME SAAS SAVINGS CALCULATOR</span>
        </div>
        <h3 className="roi-title">Calculate How Much Your Business Saves with Flat Pricing</h3>
        <p className="roi-subtitle">
          Legacy software vendors charge ₹2,000 to ₹6,000 per counter per month. With SSR One AI, one single flat license of ₹12,000/year powers unlimited outlets.
        </p>
      </div>

      <div className="roi-controls-grid">
        
        {/* Left: Interactive Controls */}
        <div className="roi-inputs-box">
          <div className="slider-group">
            <div className="slider-label-row">
              <label>Number of Operating Counters / Outlets:</label>
              <strong className="slider-val-badge">{outlets} Outlets</strong>
            </div>
            <input 
              type="range"
              min={1}
              max={25}
              value={outlets}
              onChange={(e) => {
                sound.playClick();
                setOutlets(Number(e.target.value));
              }}
              className="roi-slider"
            />
            <div className="slider-ticks">
              <span>1 Outlet</span>
              <span>10 Outlets</span>
              <span>25 Outlets</span>
            </div>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <label>Current Monthly Cost per Outlet (Legacy POS/PMS):</label>
              <strong className="slider-val-badge">₹{monthlyExpensePerOutlet.toLocaleString()} / mo</strong>
            </div>
            <input 
              type="range"
              min={1500}
              max={10000}
              step={500}
              value={monthlyExpensePerOutlet}
              onChange={(e) => {
                sound.playClick();
                setMonthlyExpensePerOutlet(Number(e.target.value));
              }}
              className="roi-slider"
            />
            <div className="slider-ticks">
              <span>₹1,500/mo</span>
              <span>₹5,000/mo</span>
              <span>₹10,000/mo</span>
            </div>
          </div>

          <div className="roi-guarantee-note">
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <span>Includes all 14 modules: POS + PMS + PG + Retail + KDS + Autonomous AI</span>
          </div>
        </div>

        {/* Right: Calculated Savings Output */}
        <div className="roi-results-box">
          <div className="results-label">YOUR ESTIMATED ANNUAL SAVINGS</div>
          
          <div className="savings-highlight-num">
            <span className="currency">₹</span>
            <span className="amount">{annualSavings.toLocaleString()}</span>
            <span className="period">/ year saved</span>
          </div>

          <div className="savings-percentage-badge">
            <TrendingUp size={16} />
            <span>{savingsPercentage}% Total Expense Reduction</span>
          </div>

          <div className="comparison-ledger">
            <div className="ledger-row">
              <span>Your Current Annual Legacy Cost:</span>
              <strong className="text-danger">₹{currentAnnualCost.toLocaleString()}</strong>
            </div>
            <div className="ledger-row">
              <span>SSR One AI Enterprise Master License:</span>
              <strong className="text-success">₹12,000 (Flat)</strong>
            </div>
          </div>

          <button 
            className="btn-cinema-primary btn-claim-savings"
            onClick={() => {
              sound.playChime();
              if (onClaimOffer) onClaimOffer();
            }}
          >
            <Sparkles size={16} />
            <span>Claim Your ₹{annualSavings.toLocaleString()} Annual Savings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoiCalculator;
