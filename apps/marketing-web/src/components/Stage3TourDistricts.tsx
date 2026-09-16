import React from 'react';
import { 
  Utensils, 
  Hotel, 
  Home, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  FileSpreadsheet,
  GitBranch
} from 'lucide-react';
import { VerticalSolution } from '../types';
import { LiveProductSandbox } from './LiveProductSandbox';
import { PosTerminal3D, ThermalReceipt3D } from './Interactive3DArtifacts';
import { sound } from '../utils/soundEngine';

interface Stage3TourDistrictsProps {
  verticals: VerticalSolution[];
  activeDistrict: string;
  setActiveDistrict: (id: string) => void;
  onSelectVerticalForDemo: (verticalId: string) => void;
  onJumpToDistrict: (districtId: string) => void;
}

export const Stage3TourDistricts: React.FC<Stage3TourDistrictsProps> = ({
  verticals,
  activeDistrict,
  setActiveDistrict,
  onSelectVerticalForDemo,
  onJumpToDistrict,
}) => {
  const getDistrictIcon = (id: string, size = 18) => {
    switch (id) {
      case 'restaurant': return <Utensils size={size} />;
      case 'hotel': return <Hotel size={size} />;
      case 'pg': return <Home size={size} />;
      case 'retail': return <ShoppingBag size={size} />;
      default: return <Utensils size={size} />;
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils size={16} color="var(--accent-emerald)" />;
      case 'Hotel': return <Hotel size={16} color="var(--accent-emerald)" />;
      case 'Home': return <Home size={16} color="var(--accent-emerald)" />;
      case 'ShoppingBag': return <ShoppingBag size={16} color="var(--accent-emerald)" />;
      case 'Cpu': return <Cpu size={16} color="var(--accent-emerald)" />;
      case 'Zap': return <Zap size={16} color="var(--accent-emerald)" />;
      case 'Layers': return <Layers size={16} color="var(--accent-emerald)" />;
      case 'ShieldCheck': return <ShieldCheck size={16} color="var(--accent-emerald)" />;
      case 'FileSpreadsheet': return <FileSpreadsheet size={16} color="var(--accent-emerald)" />;
      case 'GitBranch': return <GitBranch size={16} color="var(--accent-emerald)" />;
      default: return <CheckCircle2 size={16} color="var(--accent-emerald)" />;
    }
  };

  return (
    <section id="stage-tour" className="journey-stage stage-tour-zone">
      
      {/* ── Sticky Jump-Nav for Districts (Accessibility & Fast Travel) ── */}
      <div className="tour-sticky-jumpnav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="district-nav-label">
            <MapPin size={15} color="var(--accent-emerald)" />
            <span>BEATS 3 & 4 • THE DISTRICT TOUR:</span>
          </div>

          <div className="district-tabs-cluster">
            {verticals.map((v) => (
              <button
                key={v.id}
                className={`district-tab-button ${activeDistrict === v.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveDistrict(v.id);
                  onJumpToDistrict(v.id);
                }}
              >
                {getDistrictIcon(v.id, 14)}
                <span>{v.name.split('&')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── The 4 Specialized Districts along the Path ── */}
      <div className="districts-track-wrapper">

        {/* 1. RESTAURANT DISTRICT (East / Right of Path) */}
        <div 
          id="district-restaurant" 
          className={`district-block district-restaurant ${activeDistrict === 'restaurant' ? 'district-focused' : ''}`}
        >
          <div className="container">
            <div className="district-content-card">
              
              <div className="district-badge-row">
                <span className="district-index-tag">DISTRICT 1 OF 4</span>
                <span className="badge-emerald">F&B ENTERPRISE ARCHITECTURE</span>
                <span className="district-scenery-tag">Touch POS & Multi-Station KDS</span>
              </div>

              <div className="district-main-grid">
                <div>
                  <h3 className="district-headline">
                    Lightning-Fast Touch POS, Live KDS Screens & QR Table Ordering
                  </h3>
                  <p className="district-lead">
                    High-volume dining operations engineered for zero latency. Orders route synchronously between floor tables, chef KDS screens, and bar counters with sub-2ms thermal KOT dispatch, recipe ingredient margin tracking, and cashier cash drawer reconciliation.
                  </p>

                  {/* Shopfront Signs (Features as physical street signs) */}
                  <div className="shopfront-signs-grid">
                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Utensils')}
                        <h4>Touch POS & Floor Matrix</h4>
                      </div>
                      <p>Visual table layout with split, merge, hold bill & cashier shift ledger reconciliation.</p>
                      <span className="sign-post">&lt; 0.2s Touch Response</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Cpu')}
                        <h4>Kitchen Display System (KDS)</h4>
                      </div>
                      <p>Real-time cook displays for prep stations with color-coded countdown timers.</p>
                      <span className="sign-post">Live Station Routing</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Zap')}
                        <h4>Contactless QR Ordering</h4>
                      </div>
                      <p>Guests scan table QR codes to browse photos, customize modifiers, and order instantly.</p>
                      <span className="sign-post">Zero App Download</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Layers')}
                        <h4>Recipe & Stock Costing</h4>
                      </div>
                      <p>Automated raw ingredient deduction per plate ordered with shrinkage alerts.</p>
                      <span className="sign-post">Gross Margin Tracking</span>
                    </div>
                  </div>

                  <div className="district-footer-action">
                    <button 
                      className="btn-cinema-primary"
                      onClick={() => onSelectVerticalForDemo('restaurant')}
                    >
                      <Sparkles size={16} />
                      <span>Book Restaurant POS Live Demo</span>
                    </button>
                  </div>
                </div>

                <div className="district-hero-visual">
                  <PosTerminal3D />
                  <div style={{ marginTop: '1.5rem' }}>
                    <ThermalReceipt3D />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. HOTEL & RESORT DISTRICT (West / Left of Path - Elevated Uphill feel) */}
        <div 
          id="district-hotel" 
          className={`district-block district-hotel ${activeDistrict === 'hotel' ? 'district-focused' : ''}`}
        >
          <div className="container">
            <div className="district-content-card">
              
              <div className="district-badge-row">
                <span className="district-index-tag">DISTRICT 2 OF 4</span>
                <span className="badge-emerald">HOSPITALITY MANAGEMENT</span>
                <span className="district-scenery-tag">Room Inventory & Digital Check-In</span>
              </div>

              <div className="district-main-grid">
                <div>
                  <h3 className="district-headline">
                    End-to-End Hotel Operations, Room Inventory & Digital Check-In
                  </h3>
                  <p className="district-lead">
                    Complete room inventory management, guest check-in automation, and 2-way OTA channel synchronization. Accelerate front-desk check-in to 30 seconds with paperless ID scans, automate night audits, and connect restaurant charges directly to unified guest folios.
                  </p>

                  <div className="shopfront-signs-grid">
                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Hotel')}
                        <h4>Interactive Room Matrix</h4>
                      </div>
                      <p>Visual drag-and-drop room grid displaying occupancy, maintenance locks, and live rates.</p>
                      <span className="sign-post">99.9% Channel Sync</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('ShieldCheck')}
                        <h4>Digital Check-In & Folio</h4>
                      </div>
                      <p>Paperless Aadhaar/passport scans, digital guest signatures, and unified folio bills.</p>
                      <span className="sign-post">30s Express Check-In</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Zap')}
                        <h4>Housekeeping & Maintenance</h4>
                      </div>
                      <p>Real-time clean/dirty room status dispatch with staff mobile task checklist.</p>
                      <span className="sign-post">Zero Turnaround Delay</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Sparkles')}
                        <h4>Banquet & Hall Booking</h4>
                      </div>
                      <p>Integrated schedule engine for hotel conference lawns, corporate retreats, and catering.</p>
                      <span className="sign-post">Unified Event Invoicing</span>
                    </div>
                  </div>

                  <div className="district-footer-action">
                    <button 
                      className="btn-cinema-primary"
                      onClick={() => onSelectVerticalForDemo('hotel')}
                    >
                      <Sparkles size={16} />
                      <span>Book Hotel PMS Live Demo</span>
                    </button>
                  </div>
                </div>

                <div className="district-hero-visual">
                  <div className="district-image-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80" 
                      alt="Hotel PMS Suite" 
                      className="district-scene-img" 
                    />
                    <div className="district-scene-caption">
                      <strong>District Landmark:</strong> Grand Hotel Check-in Atrium
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. PG & HOSTEL DISTRICT (East / Residential Lane Feel) */}
        <div 
          id="district-pg" 
          className={`district-block district-pg ${activeDistrict === 'pg' ? 'district-focused' : ''}`}
        >
          <div className="container">
            <div className="district-content-card">
              
              <div className="district-badge-row">
                <span className="district-index-tag">DISTRICT 3 OF 4</span>
                <span className="badge-emerald">LIVING SPACE AUTOMATION</span>
                <span className="district-scenery-tag">Hostel Billing & Biometric Access</span>
              </div>

              <div className="district-main-grid">
                <div>
                  <h3 className="district-headline">
                    Automated Rent Collections, Resident KYC & Biometric Access
                  </h3>
                  <p className="district-lead">
                    End-to-end living space management for student PG hostels and co-living facilities. Eliminate manual rent tracking with automated WhatsApp payment links, resident KYC cloud document storage, digital lease agreements, and biometric turnstile integration.
                  </p>

                  <div className="shopfront-signs-grid">
                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('FileSpreadsheet')}
                        <h4>Automated Rent Invoicing</h4>
                      </div>
                      <p>Recurring monthly rent generation with WhatsApp UPI payment links and auto-reconciliation.</p>
                      <span className="sign-post">100% Ledger Accuracy</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('ShieldCheck')}
                        <h4>Resident KYC & Contracts</h4>
                      </div>
                      <p>Cloud document vault for student ID proofs, police verification records, and digital stay terms.</p>
                      <span className="sign-post">Legal Compliance Ready</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Utensils')}
                        <h4>Mess & Food Attendance</h4>
                      </div>
                      <p>Daily meal counts, resident dietary preferences, and breakfast/lunch/dinner tokens.</p>
                      <span className="sign-post">Zero Food Wastage</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Zap')}
                        <h4>Biometric Gate Integration</h4>
                      </div>
                      <p>Hardware sync with biometric fingerprint/face scanners for entry logs and curfew notifications.</p>
                      <span className="sign-post">Automated Parent Alerts</span>
                    </div>
                  </div>

                  <div className="district-footer-action">
                    <button 
                      className="btn-cinema-primary"
                      onClick={() => onSelectVerticalForDemo('pg')}
                    >
                      <Sparkles size={16} />
                      <span>Book PG Management Live Demo</span>
                    </button>
                  </div>
                </div>

                <div className="district-hero-visual">
                  <div className="district-image-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80" 
                      alt="PG Hostel Living Space" 
                      className="district-scene-img" 
                    />
                    <div className="district-scene-caption">
                      <strong>District Landmark:</strong> Smart Hostel Living Hub
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 4. RETAIL DISTRICT (West / Open Market Street) */}
        <div 
          id="district-retail" 
          className={`district-block district-retail ${activeDistrict === 'retail' ? 'district-focused' : ''}`}
        >
          <div className="container">
            <div className="district-content-card">
              
              <div className="district-badge-row">
                <span className="district-index-tag">DISTRICT 4 OF 4</span>
                <span className="badge-emerald">RETAIL & SUPPLY CHAIN ERP</span>
                <span className="district-scenery-tag">Barcode POS & GST Compliance</span>
              </div>

              <div className="district-main-grid">
                <div>
                  <h3 className="district-headline">
                    Multi-Outlet Inventory, Barcode Billing & GST Financial Compliance
                  </h3>
                  <p className="district-lead">
                    Multi-branch retail management unifying 10,000+ SKUs across warehouse networks. Ring up items with high-speed barcode POS, transfer inventory between branches with real-time transit logs, scan vendor invoices with OCR, and generate 1-click GSTR-1 audit spreadsheets.
                  </p>

                  <div className="shopfront-signs-grid">
                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('ShoppingBag')}
                        <h4>Rapid Barcode POS Checkout</h4>
                      </div>
                      <p>Instant item lookup via USB/Bluetooth barcode scanners with batch numbers, expiry & MRP tracking.</p>
                      <span className="sign-post">10,000+ SKU Lookups/s</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('GitBranch')}
                        <h4>Inter-Branch Transfers</h4>
                      </div>
                      <p>Dispatch and intake stock between multiple warehouses with live in-transit tracking and receipts.</p>
                      <span className="sign-post">Zero Stock Leakage</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('Cpu')}
                        <h4>OCR Supplier Invoices</h4>
                      </div>
                      <p>Scan paper vendor invoices with AI OCR to automatically ingest inventory items into accounts payable.</p>
                      <span className="sign-post">Instant Bill Extraction</span>
                    </div>

                    <div className="shopfront-sign">
                      <div className="sign-header">
                        {getFeatureIcon('FileSpreadsheet')}
                        <h4>Automated GST Reports</h4>
                      </div>
                      <p>One-click generation of GSTR-1, GSTR-3B audit-ready spreadsheets with verified HSN tax breakdown.</p>
                      <span className="sign-post">Audit-Proof Accounting</span>
                    </div>
                  </div>

                  <div className="district-footer-action">
                    <button 
                      className="btn-cinema-primary"
                      onClick={() => onSelectVerticalForDemo('retail')}
                    >
                      <Sparkles size={16} />
                      <span>Book Retail ERP Live Demo</span>
                    </button>
                  </div>
                </div>

                <div className="district-hero-visual">
                  <div className="district-image-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80" 
                      alt="Retail ERP Checkout" 
                      className="district-scene-img" 
                    />
                    <div className="district-scene-caption">
                      <strong>District Landmark:</strong> Central Marketplace Express Checkout
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── Real-Time In-Page Live Product Simulator (Sandbox) ── */}
      <div className="container" style={{ marginTop: '5rem' }}>
        <LiveProductSandbox />
      </div>

    </section>
  );
};

export default Stage3TourDistricts;
