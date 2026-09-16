import React, { useState } from 'react';
import { Key, Sparkles, Printer, ShoppingBag, Check } from 'lucide-react';
import { sound } from '../utils/soundEngine';

// ── 1. Interactive 3D Touch POS Terminal ──
export const PosTerminal3D: React.FC = () => {
  const [rotationY, setRotationY] = useState(0);
  const [activeScreen, setActiveScreen] = useState<'billing' | 'kds'>('billing');
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = () => {
    sound.playClick();
    sound.playPaperTear();
    setDispatched(true);
    setTimeout(() => setDispatched(false), 2500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    setRotationY(x * 24); // Tilt up to 24 degrees
  };

  const handleMouseLeave = () => {
    setRotationY(0);
  };

  return (
    <div 
      className="pos-3d-chassis-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="pos-3d-terminal"
        style={{
          transform: `perspective(900px) rotateY(${rotationY}deg) rotateX(8deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Terminal Screen Bezel */}
        <div className="terminal-bezel">
          <div className="terminal-topbar">
            <span className="terminal-brand">SSR ONE AI • TOUCH COUNTER 1</span>
            <span className="terminal-clock">&lt; 0.2s FAST SYNC</span>
          </div>

          <div className="terminal-touch-display">
            <div className="display-tabs">
              <button 
                className={`display-tab ${activeScreen === 'billing' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  setActiveScreen('billing');
                }}
              >
                Table 4: Dining Bill
              </button>
              <button 
                className={`display-tab ${activeScreen === 'kds' ? 'active' : ''}`}
                onClick={() => {
                  sound.playClick();
                  setActiveScreen('kds');
                }}
              >
                Live Kitchen KDS
              </button>
            </div>

            {activeScreen === 'billing' ? (
              <div className="display-content">
                <div className="display-row">
                  <span>1x Tandoori Chicken Platter</span>
                  <strong>₹480.00</strong>
                </div>
                <div className="display-row">
                  <span>2x Cold Brew Artisanal Coffee</span>
                  <strong>₹320.00</strong>
                </div>
                <div className="display-row highlight">
                  <span>Total (GST 5% Inc.):</span>
                  <span className="total-badge">₹840.00</span>
                </div>
                <button 
                  className={`terminal-dispatch-btn ${dispatched ? 'dispatched' : ''}`}
                  onClick={handleDispatch}
                  style={dispatched ? { backgroundColor: 'var(--accent-emerald)', color: '#FFFFFF' } : undefined}
                >
                  {dispatched ? <Check size={13} /> : <Sparkles size={13} />}
                  <span>{dispatched ? 'Dispatched to Chef KDS in 0.18s!' : 'Tap to Dispatch Thermal KOT'}</span>
                </button>
              </div>
            ) : (
              <div className="display-content kds-view">
                <div className="kds-ticket">
                  <span className="kds-timer">01:45 min (Tandoor Station)</span>
                  <p>1x Tandoori Platter (Extra Mint Chutney)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weighted Metal Stand */}
        <div className="pos-stand-neck" />
        <div className="pos-stand-base" />
      </div>
      <span className="artifact-hint">Interactive 3D Terminal • Tilt with cursor</span>
    </div>
  );
};

// ── 2. Interactive Unspooling Thermal Receipt Paper ──
export const ThermalReceipt3D: React.FC = () => {
  const [receiptLength, setReceiptLength] = useState<number>(3);

  const addReceiptLine = () => {
    sound.playPaperTear();
    setReceiptLength(prev => Math.min(prev + 1, 6));
  };

  return (
    <div className="thermal-receipt-artifact">
      <div className="printer-head-slot">
        <div className="printer-feed-glow" />
        <button 
          className="printer-feed-btn"
          onClick={addReceiptLine}
        >
          <Printer size={13} />
          <span>Feed Receipt Roll</span>
        </button>
      </div>

      <div 
        className="unspooling-paper"
        style={{
          maxHeight: `${receiptLength * 55 + 120}px`,
          transition: 'max-height 0.3s ease-out',
        }}
      >
        <div className="receipt-paper-header">
          <strong>SSR ONE AI POS RECEIPT</strong>
          <span className="receipt-datetime">10-SEP-2026 15:45:10</span>
          <span>TAX INVOICE #SSR-9482</span>
        </div>
        <div className="receipt-paper-divider">--------------------------------</div>
        <div className="receipt-paper-line">
          <span>TANDOORI PLATTER</span>
          <span>₹480.00</span>
        </div>
        <div className="receipt-paper-line">
          <span>COLD BREW COFFEE</span>
          <span>₹320.00</span>
        </div>
        {receiptLength > 3 && (
          <div className="receipt-paper-line">
            <span>BUTTER NAAN (2X)</span>
            <span>₹140.00</span>
          </div>
        )}
        {receiptLength > 4 && (
          <div className="receipt-paper-line">
            <span>DAL MAKHANI</span>
            <span>₹360.00</span>
          </div>
        )}
        <div className="receipt-paper-divider">--------------------------------</div>
        <div className="receipt-paper-total">
          <strong>NET TOTAL</strong>
          <strong>₹{receiptLength > 4 ? '1,300.00' : '840.00'}</strong>
        </div>
        <div className="receipt-paper-footer">
          <span>* ZERO SINKING DELAYS *</span>
          <span>POWERED BY POSTGRESQL RLS</span>
        </div>
      </div>
    </div>
  );
};

// ── 3. Interactive 3D Golden Master Key ──
export const GoldenMasterKey3D: React.FC<{ onUnlock?: () => void }> = ({ onUnlock }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const handleKeyClick = () => {
    sound.playChime();
    setIsUnlocked(true);
    if (onUnlock) onUnlock();
  };

  return (
    <div 
      className={`golden-key-3d-box ${isUnlocked ? 'unlocked' : ''}`}
      onClick={handleKeyClick}
    >
      <div className="key-pedestal">
        <div className="key-laser-ring" />
        <div className="key-floating-mesh">
          <Key size={48} className="golden-key-icon" />
          <div className="key-glint" />
        </div>
      </div>

      <div className="key-status-label">
        {isUnlocked ? (
          <span className="key-tag-unlocked">
            <Check size={14} />
            Master Enterprise License Unlocked!
          </span>
        ) : (
          <span className="key-tag-locked">
            <Sparkles size={14} />
            Click 3D Key to Unlock Flat ₹12,000/yr
          </span>
        )}
      </div>
    </div>
  );
};

// ── 4. Interactive Barcode Gun Simulator ──
export const BarcodeScanner3D: React.FC<{ onScan?: () => void }> = ({ onScan }) => {
  const [isFiring, setIsFiring] = useState(false);

  const triggerScan = () => {
    sound.playBarcodeBeep();
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 250);
    if (onScan) onScan();
  };

  return (
    <div className="barcode-gun-artifact">
      <button 
        className={`btn-scan-trigger ${isFiring ? 'firing' : ''}`}
        onClick={triggerScan}
      >
        <ShoppingBag size={16} />
        <span>Click Laser Scanner (Beep)</span>
      </button>

      {isFiring && (
        <div className="laser-beam-line" />
      )}
    </div>
  );
};
