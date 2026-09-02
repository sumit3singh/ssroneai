import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Utensils, 
  Hotel, 
  Home, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Building2, 
  Layers, 
  Cpu, 
  Zap, 
  MessageSquare, 
  Moon, 
  Sun, 
  X, 
  Check, 
  Globe,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { VerticalSolution, PricingTier, DemoLeadForm } from './types';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [selectedVertical, setSelectedVertical] = useState<string>('restaurant');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoSuccess, setDemoSuccess] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Form State
  const [formData, setFormData] = useState<DemoLeadForm>({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    vertical: 'restaurant',
    outletCount: '1-3 Outlets',
    preferredDate: '',
    preferredTime: '11:00 AM',
    notes: ''
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Verticals Data Definition
  const verticals: VerticalSolution[] = [
    {
      id: 'restaurant',
      name: 'Restaurant & Dining POS',
      badge: 'F&B Enterprise Edition',
      headline: 'Lightning-Fast Touch POS, Live KDS Screens & QR Table Ordering',
      description: 'Streamline dining rooms, cloud kitchens, and cafes with zero-latency order routing, automated KOT printing, shift cash drawers, and menu recipe costing.',
      accentColor: '#103B2B',
      iconName: 'Utensils',
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '0.2s', label: 'Order Dispatch Speed' },
      keyFeatures: [
        { title: 'Touch POS & Table Layout', description: 'Interactive visual table floor plans with merge, split, and hold bill capabilities.', iconName: 'Utensils' },
        { title: 'Kitchen Display System (KDS)', description: 'Real-time kitchen order screens for chefs with station-wise routing and timers.', iconName: 'Cpu' },
        { title: 'QR Contactless Ordering', description: 'Instant table-side ordering directly from customer smartphones without app downloads.', iconName: 'Globe' },
        { title: 'Recipe & Ingredient Costing', description: 'Automated stock deduction per dish ordered with variance and wastage alerts.', iconName: 'Layers' }
      ]
    },
    {
      id: 'hotel',
      name: 'Hotel & Resort PMS',
      badge: 'Hospitality Management',
      headline: 'End-to-End Hotel Operations, Room Inventory & Digital Check-In',
      description: 'Empower hotel staff with instant room booking grids, contactless guest check-in, housekeeping status trackers, guest folios, and spa/amenity billing.',
      accentColor: '#103B2B',
      iconName: 'Hotel',
      heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '99.9%', label: 'Room Occupancy Sync' },
      keyFeatures: [
        { title: 'Interactive Reservation Grid', description: 'Drag-and-drop room matrix with live availability, rates, and channel manager sync.', iconName: 'Hotel' },
        { title: 'Digital Check-in & Guest Folio', description: 'ID document scanning, digital signatures, and unified room charge folios.', iconName: 'ShieldCheck' },
        { title: 'Housekeeping & Maintenance', description: 'Real-time room cleaning status, dirty/clean flags, and maintenance work orders.', iconName: 'Zap' },
        { title: 'Spa & Banquet Management', description: 'Integrated booking engine for hotel spa services, conference halls, and events.', iconName: 'Sparkles' }
      ]
    },
    {
      id: 'pg',
      name: 'PG & Hostel Management',
      badge: 'Living Space Automation',
      headline: 'Automated Rent Collections, Resident KYC & Biometric Access',
      description: 'Simplify paying guest hostels and student accommodations with automated monthly rent reminders, resident onboarding, attendance, and mess management.',
      accentColor: '#103B2B',
      iconName: 'Home',
      heroImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '100%', label: 'Rent Ledger Accuracy' },
      keyFeatures: [
        { title: 'Automated Rent Invoicing', description: 'Recurring rent generation with WhatsApp payment links and auto-reconciliation.', iconName: 'FileSpreadsheet' },
        { title: 'Resident KYC & Digital Agreements', description: 'Store ID proofs, police verification records, and digital stay contracts safely.', iconName: 'ShieldCheck' },
        { title: 'Mess & Food Attendance', description: 'Track meal counts, resident meal preferences, and daily mess attendance.', iconName: 'Utensils' },
        { title: 'Biometric Gate Integration', description: 'Hardware integration with biometric scanners for entry logs and curfew alerts.', iconName: 'Lock' }
      ]
    },
    {
      id: 'retail',
      name: 'Retail & Multi-Branch ERP',
      badge: 'Retail & Supply Chain',
      headline: 'Multi-Outlet Inventory, Barcode Billing & GST Financial Compliance',
      description: 'Unify retail stores and distribution outlets with barcode scanning POS, inter-branch stock transfers, purchase orders, and audit-ready GST filing.',
      accentColor: '#103B2B',
      iconName: 'ShoppingBag',
      heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '10x', label: 'Billing Concurrency' },
      keyFeatures: [
        { title: 'High-Speed Barcode Billing', description: 'Scan items, apply promo discounts, calculate GST, and print invoices in under 3 seconds.', iconName: 'Printer' },
        { title: 'Inter-Branch Stock Transfer', description: 'Seamlessly request, approve, and track stock transfers between warehouses & stores.', iconName: 'Layers' },
        { title: 'Supplier PO & Purchase Invoices', description: 'Vendor management, purchase order generation, and accounts payable ledger.', iconName: 'Building2' },
        { title: 'GST Returns & Financial Ledger', description: 'GSTR-1, GSTR-3B exportable reports with double-entry general accounting ledger.', iconName: 'FileSpreadsheet' }
      ]
    }
  ];

  // Pricing Data - Single Unified Annual Plan (₹12,000 / Year)
  const pricingTiers: PricingTier[] = [
    {
      id: 'all-inclusive',
      name: 'SSR One AI All-Inclusive License',
      tierBadge: 'FLAT ANNUAL SUBSCRIPTION • NO LIMITS',
      isPopular: true,
      annualFeeINR: 12000,
      monthlyFeeINR: 12000,
      description: 'One flat fee of ₹12,000 per year. Full access to all 14+ ERP modules, unlimited outlets, unlimited staff users, AI Copilot, and dedicated PostgreSQL RLS security.',
      dbStrategy: 'Enterprise High-Performance PostgreSQL RLS Isolation',
      features: [
        'UNLIMITED Outlets, Branches & Locations',
        'UNLIMITED Staff, Manager & Admin User Accounts',
        'Restaurant POS + Live Kitchen Display (KDS) + QR Menu Ordering',
        'Hotel & Resort PMS + Digital Check-in + Room Inventory',
        'PG & Hostel Management + Biometric Access + Rent Auto-Invoicing',
        'Retail Barcode Billing + Stock Transfer + GST Tax Ledger',
        'Autonomous AI Copilot + Voice Assistant + RAG Analytics',
        'HRMS Payroll, Staff Attendance & CRM Loyalty Suite',
        'Universal POS Hardware Support (Thermal Printers, EDC, Scanners)',
        'Direct 24/7 Priority Support by Founder Sumit Singh (+91 8059075260)'
      ],
      ctaLabel: 'Book Live Demo & Claim Access'
    }
  ];

  const currentVertical = verticals.find(v => v.id === selectedVertical) || verticals[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(true);

    const waText = encodeURIComponent(
      `*NEW DEMO REQUEST - SSR ONE AI*\n\n` +
      `👤 *Name:* ${formData.fullName}\n` +
      `🏢 *Company:* ${formData.companyName}\n` +
      `📱 *Phone:* ${formData.phone}\n` +
      `✉️ *Email:* ${formData.email}\n` +
      `🎯 *Vertical:* ${formData.vertical.toUpperCase()}\n` +
      `🏪 *Outlets:* ${formData.outletCount}\n` +
      `📅 *Preferred Slot:* ${formData.preferredDate} at ${formData.preferredTime}\n` +
      `📝 *Notes:* ${formData.notes || 'N/A'}`
    );

    window.open(`https://wa.me/918059075260?text=${waText}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'hsl(var(--bg-primary))' }}>
      
      {/* ── 1. Header Navigation Bar (Sticky Top) ── */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.85rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Company Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              background: '#0284C7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: 'var(--shadow-2xs)'
            }}>
              <ShieldCheck size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'hsl(var(--text-primary))' }}>
                  SSR IT INDUSTRY
                </span>
                <span className="badge-glow" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>OFFICIAL</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600, letterSpacing: '0.05em' }}>
                SSR ONE AI • AUTONOMOUS OS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="md:flex">
            <a href="#verticals" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Verticals</a>
            <a href="#ai-copilot" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>AI Copilot</a>
            <a href="#pricing" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Pricing Tiers</a>
            <a href="#contact" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>Contact Founder</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={toggleTheme}
              style={{ 
                background: 'hsl(var(--bg-card))', 
                border: '1px solid hsl(var(--border-subtle))', 
                color: 'hsl(var(--text-primary))',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="btn-primary" onClick={() => setIsDemoModalOpen(true)}>
              <Sparkles size={16} />
              Book Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Executive Hero Section (Rule 2, 3, 4) ── */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '960px', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <span className="badge-glow">
              POWERING HOSPITALITY & RETAIL WITH AI AUTONOMY
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: 'hsl(var(--text-primary))' }}>
            The All-in-One Operating System for Hospitality, Dining & Retail
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'hsl(var(--text-secondary))', marginBottom: '2.25rem', lineHeight: 1.6, fontWeight: 500 }}>
            Engineered by <strong>SSR IT INDUSTRY</strong>. Unify your POS, Hotel PMS, Hostel Rent Ledgers, Barcode Billing, and AI Copilot under a single multi-tenant PostgreSQL database.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }} onClick={() => setIsDemoModalOpen(true)}>
              <Sparkles size={18} />
              Request Customized Live Demo
            </button>
            <a href="#verticals" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Explore Business Verticals
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', textAlign: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.75rem', color: '#0284C7', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>₹12,000/yr</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>Flat Annual License • No Limits</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '1.75rem', color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>100%</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>PostgreSQL RLS Isolation</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '1.75rem', color: '#103B2B', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>&lt; 0.2s</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>Real-time POS Latency</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '1.75rem', color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>14+</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>Integrated ERP Modules</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Four Core Vertical Solution Showcase ── */}
      <section id="verticals" style={{ padding: '4.5rem 0', background: 'hsl(var(--bg-secondary))' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span className="badge-glow">BUSINESS VERTICALS</span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              Tailored Architecture for Every Industry Vertical
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem' }}>
              Select a vertical below to see how SSR One AI automates operations, inventory, billing, and customer experiences.
            </p>
          </div>

          {/* Vertical Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {verticals.map((v) => {
              const isActive = selectedVertical === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVertical(v.id)}
                  style={{
                    minHeight: '44px',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '1px solid',
                    borderColor: isActive ? '#0284C7' : 'hsl(var(--border-subtle))',
                    background: isActive ? '#0284C7' : 'hsl(var(--bg-card))',
                    color: isActive ? '#ffffff' : 'hsl(var(--text-secondary))',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {v.id === 'restaurant' && <Utensils size={16} />}
                  {v.id === 'hotel' && <Hotel size={16} />}
                  {v.id === 'pg' && <Home size={16} />}
                  {v.id === 'retail' && <ShoppingBag size={16} />}
                  {v.name}
                </button>
              );
            })}
          </div>

          {/* Active Vertical Display Card */}
          <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge-glow">
                {currentVertical.badge}
              </span>
              
              <h3 style={{ fontSize: '1.9rem', marginTop: '1rem', marginBottom: '0.85rem', lineHeight: 1.25 }}>
                {currentVertical.headline}
              </h3>
              
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                {currentVertical.description}
              </p>

              {/* Key Features List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                {currentVertical.keyFeatures.map((feat, idx) => (
                  <div key={idx} style={{ background: 'hsl(var(--bg-primary))', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--border-subtle))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <CheckCircle2 size={15} color="#103B2B" />
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>{feat.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{feat.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button className="btn-primary" onClick={() => setIsDemoModalOpen(true)}>
                  Schedule {currentVertical.name} Demo
                  <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#103B2B', fontFamily: 'var(--font-mono)' }}>
                    {currentVertical.statMetric.value}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase' }}>
                    {currentVertical.statMetric.label}
                  </span>
                </div>
              </div>

            </div>

            {/* Visual Image Banner */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid hsl(var(--border-subtle))' }}>
              <img 
                src={currentVertical.heroImage} 
                alt={currentVertical.name}
                style={{ width: '100%', height: '380px', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)' }} />
              
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem' }}>
                <span className="badge-glow" style={{ background: 'rgba(0,0,0,0.7)', color: '#ffffff', border: 'none' }}>
                  SSR ONE AI • LIVE DEMO PREVIEW
                </span>
                <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                  {currentVertical.name} Suite
                </h4>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. Autonomous AI Copilot & Hardware Hub ── */}
      <section id="ai-copilot" style={{ padding: '4.5rem 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge-glow">AUTONOMOUS INTELLIGENCE & HARDWARE HUB</span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              Built-in AI Copilot & Universal Hardware Compatibility
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem' }}>
              No extra third-party subscriptions required. SSR One AI comes built-in with autonomous demand forecasting, voice order taking, OCR invoice scanning, and plug-and-play POS hardware integration.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16, 59, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1rem', border: '1px solid rgba(16, 59, 43, 0.2)' }}>
                <Cpu size={22} color="#103B2B" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>RAG Autonomous AI Copilot</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Ask questions in plain English or Hindi: <em>"Which menu item had highest margin this week?"</em> or <em>"Show me room occupancy forecast for weekend."</em>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16, 59, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1rem', border: '1px solid rgba(16, 59, 43, 0.2)' }}>
                <MessageSquare size={22} color="#103B2B" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Voice Order Assistant</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Enable waitstaff or captains to take fast orders via voice speech-to-text. Automatically items added to bill and routed to kitchen screens.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16, 59, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1rem', border: '1px solid rgba(16, 59, 43, 0.2)' }}>
                <Printer size={22} color="#103B2B" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Universal POS Hardware Support</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Plug-and-play connection with USB/Ethernet/Bluetooth 80mm thermal receipt printers, cash drawers, barcode scanners, and EDC card machines.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. Single Unified Pricing (Rule 4) ── */}
      <section id="pricing" style={{ padding: '4.5rem 0', background: 'hsl(var(--bg-secondary))' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge-gold">SINGLE UNIFIED FLAT PRICING</span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              One Flat Price. Zero Limits. Full Access.
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', lineHeight: 1.6 }}>
              Forget complicated tiers and per-user add-ons. Get complete access to all 14+ ERP modules, unlimited outlets, unlimited staff users, and autonomous AI for one straightforward price.
            </p>
          </div>

          {/* Single Centered Pricing Card */}
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            {pricingTiers.map((tier) => (
              <div 
                key={tier.id} 
                className="glass-card"
                style={{ 
                  padding: '2.5rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  border: '2px solid #103B2B',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ background: '#103B2B', color: '#ffffff', border: 'none', padding: '0.35rem 1.15rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    FLAT ANNUAL LICENSE • UNLIMITED FULL ACCESS
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{tier.name}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', marginTop: '0.5rem', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
                    {tier.description}
                  </p>
                </div>

                {/* Price Banner */}
                <div style={{ marginBottom: '1.75rem', padding: '1.5rem', background: 'hsl(var(--bg-primary))', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--border-subtle))', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#103B2B' }}>
                      ₹12,000
                    </span>
                    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '1.1rem', fontWeight: 700 }}>
                      / year
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#103B2B', fontWeight: 800, marginTop: '0.5rem' }}>
                    Single Flat Annual License • Zero Monthly Fees • Unlimited Everything
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                    Architecture: {tier.dbStrategy}
                  </p>
                </div>

                {/* Features List */}
                <div style={{ flex: 1, marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    All Features Included With Zero Limits:
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem 1.25rem' }}>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(16, 59, 43, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <Check size={12} color="#103B2B" />
                        </div>
                        <span style={{ fontWeight: idx < 2 ? 800 : 500, color: 'hsl(var(--text-primary))' }}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, notes: `Interested in ₹12,000/year All-Inclusive License` }));
                    setIsDemoModalOpen(true);
                  }}
                >
                  <Sparkles size={18} />
                  Book Live Demo & Claim Unlimited Access
                </button>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Direct Founder Contact ── */}
      <section id="contact" style={{ padding: '4.5rem 0' }}>
        <div className="container">
          
          <div className="glass-card" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge-gold">DIRECT FOUNDER & CORPORATE CONTACT</span>
              
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                SSR IT INDUSTRY
              </h2>

              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Have custom enterprise requirements or multi-location rollout queries? Connect directly with our Founder & Leadership Team.
              </p>

              {/* Direct Leadership Contacts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', background: 'hsl(var(--bg-primary))', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--border-subtle))' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 59, 43, 0.15)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                    <User size={18} color="#103B2B" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Sumit Singh</h4>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Founder & Managing Director, SSR IT INDUSTRY</p>
                  </div>
                </div>

                <a 
                  href="tel:+918059075260"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', background: 'hsl(var(--bg-primary))', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 59, 43, 0.15)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                    <Phone size={18} color="#103B2B" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>+91 8059075260</h4>
                    <p style={{ fontSize: '0.75rem', color: '#103B2B', fontWeight: 700 }}>Direct Call & WhatsApp Line</p>
                  </div>
                </a>

                <a 
                  href="mailto:sumitsinghssrit@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem', background: 'hsl(var(--bg-primary))', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(16, 59, 43, 0.15)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                    <Mail size={18} color="#103B2B" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>sumitsinghssrit@gmail.com</h4>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Official Corporate Email</p>
                  </div>
                </a>

              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="https://wa.me/918059075260" target="_blank" rel="noreferrer" className="btn-primary">
                  <MessageSquare size={16} />
                  Chat on WhatsApp Now
                </a>
              </div>

            </div>

            {/* Quick Inquiry Form */}
            <div style={{ background: 'hsl(var(--bg-primary))', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>Send Sales Inquiry</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '1.25rem' }}>
                Fill out your details below to receive a custom proposal and product demo.
              </p>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>YOUR NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Sumit Singh"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>BUSINESS / COMPANY NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Baithak Cafe / SSR Hotel"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>PHONE / WHATSAPP *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 8059075260"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
                  Submit & Connect via WhatsApp
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer style={{ borderTop: '1px solid hsl(var(--border-subtle))', padding: '2.5rem 0', background: 'hsl(var(--bg-secondary))' }}>
        <div className="container" style={{ display: 'flex', itemsCenter: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'hsl(var(--text-primary))' }}>SSR IT INDUSTRY</h4>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
              © 2026 SSR IT INDUSTRY. All Rights Reserved. SSR One AI Platform.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>PostgreSQL Multi-Tenancy RLS</span>
          </div>
        </div>
      </footer>

      {/* ── 8. Interactive Demo Booking Modal ── */}
      {isDemoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDemoModalOpen(false)}>
          <div 
            className="glass-card animate-slide-up" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '560px', padding: '2rem', position: 'relative' }}
          >
            <button 
              onClick={() => setIsDemoModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {demoSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 59, 43, 0.15)', color: '#103B2B', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.25rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Demo Request Received!</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                  Thank you, <strong>{formData.fullName}</strong>. We have dispatched your demo slot details directly to <strong>Sumit Singh</strong> (+91 8059075260).
                </p>
                <button className="btn-primary" onClick={() => { setIsDemoModalOpen(false); setDemoSuccess(false); }}>
                  Close Window
                </button>
              </div>
            ) : (
              <div>
                <span className="badge-glow" style={{ marginBottom: '0.5rem' }}>SCHEDULE LIVE PRODUCT DEMO</span>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Experience SSR One AI in Action</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '1.25rem' }}>
                  Select your vertical and preferred date for a live interactive demonstration.
                </p>

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>FULL NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Sumit Singh"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>COMPANY NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Baithak Cafe"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>PHONE / WHATSAPP *</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 8059075260"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>EMAIL ADDRESS *</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sumitsinghssrit@gmail.com"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>VERTICAL *</label>
                      <select 
                        value={formData.vertical}
                        onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      >
                        <option value="restaurant">Restaurant POS & Dining</option>
                        <option value="hotel">Hotel & Resort PMS</option>
                        <option value="pg">PG & Hostel Management</option>
                        <option value="retail">Retail & Barcode ERP</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>PREFERRED DATE *</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <Sparkles size={16} />
                    Confirm & Dispatch Demo Request
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default App;
