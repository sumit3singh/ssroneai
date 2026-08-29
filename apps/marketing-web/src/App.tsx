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
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Layers, 
  Cpu, 
  Zap, 
  ChevronRight, 
  MessageSquare, 
  Moon, 
  Sun, 
  X, 
  Award, 
  Check, 
  Lock,
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
      accentColor: '#6366f1',
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
      accentColor: '#a855f7',
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
      accentColor: '#10b981',
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
      accentColor: '#f59e0b',
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

    // Direct WhatsApp Notification to Sumit Singh
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

    // Open WhatsApp in new tab automatically
    window.open(`https://wa.me/918059075260?text=${waText}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* Background Decorative Glow Blobs */}
      <div className="bg-glow-blur" style={{ top: '-10%', left: '20%', width: '600px', height: '600px', background: 'rgba(99, 102, 241, 0.15)' }} />
      <div className="bg-glow-blur" style={{ top: '30%', right: '10%', width: '700px', height: '700px', background: 'rgba(168, 85, 247, 0.12)' }} />

      {/* ── 1. Glassmorphism Navigation Bar ── */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Company Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
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
            <a href="#verticals" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Verticals</a>
            <a href="#ai-copilot" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>AI Copilot</a>
            <a href="#pricing" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Pricing Tiers</a>
            <a href="#contact" style={{ color: 'hsl(var(--text-secondary))', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Contact Founder</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleTheme}
              style={{ 
                background: 'hsl(var(--bg-card))', 
                border: '1px solid hsl(var(--border-subtle))', 
                color: 'hsl(var(--text-primary))',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
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

      {/* ── 2. Executive Hero Section ── */}
      <section style={{ padding: '5rem 0 4rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '960px', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span className="badge-glow">
              <Sparkles size={14} />
              POWERING HOSPITALITY & RETAIL WITH AI AUTONOMY
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            The All-in-One Operating System for <span className="gradient-text">Hospitality, Dining & Retail</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'hsl(var(--text-secondary))', marginBottom: '2.5rem', lineHeight: 1.7, fontWeight: 400 }}>
            Engineered by <strong>SSR IT INDUSTRY</strong>. Unify your POS, Hotel PMS, Hostel Rent Ledgers, Barcode Billing, and AI Copilot under a single multi-tenant PostgreSQL database.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <button className="btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }} onClick={() => setIsDemoModalOpen(true)}>
              <Sparkles size={18} />
              Request Customized Live Demo
            </button>
            <a href="#verticals" className="btn-secondary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem' }}>
              Explore Business Verticals
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="glass-card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent-indigo))', fontFamily: 'var(--font-mono)' }}>₹12,000/yr</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Flat Annual License • No Limits</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent-purple))', fontFamily: 'var(--font-mono)' }}>100%</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>PostgreSQL RLS Isolation</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent-emerald))', fontFamily: 'var(--font-mono)' }}>&lt; 0.2s</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Real-time POS Latency</p>
            </div>
            <div style={{ borderLeft: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '2rem', color: 'hsl(var(--accent-amber))', fontFamily: 'var(--font-mono)' }}>14+</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Integrated ERP Modules</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Four Core Vertical Solution Showcase ── */}
      <section id="verticals" style={{ padding: '5rem 0', background: 'hsl(var(--bg-secondary) / 0.5)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge-glow">BUSINESS VERTICALS</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
              Tailored Architecture for Every Industry Vertical
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem' }}>
              Select a vertical below to see how SSR One AI automates operations, inventory, billing, and customer experiences.
            </p>
          </div>

          {/* Vertical Selector Tabs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {verticals.map((v) => {
              const isActive = selectedVertical === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVertical(v.id)}
                  style={{
                    padding: '0.85rem 1.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    border: '1px solid',
                    borderColor: isActive ? v.accentColor : 'hsl(var(--border-subtle))',
                    background: isActive ? `${v.accentColor}20` : 'hsl(var(--bg-card))',
                    color: isActive ? '#ffffff' : 'hsl(var(--text-secondary))',
                    boxShadow: isActive ? `0 0 20px ${v.accentColor}40` : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {v.id === 'restaurant' && <Utensils size={18} color={v.accentColor} />}
                  {v.id === 'hotel' && <Hotel size={18} color={v.accentColor} />}
                  {v.id === 'pg' && <Home size={18} color={v.accentColor} />}
                  {v.id === 'retail' && <ShoppingBag size={18} color={v.accentColor} />}
                  {v.name}
                </button>
              );
            })}
          </div>

          {/* Active Vertical Active Card Display */}
          <div className="glass-card" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge-glow" style={{ background: `${currentVertical.accentColor}20`, borderColor: `${currentVertical.accentColor}60`, color: currentVertical.accentColor }}>
                {currentVertical.badge}
              </span>
              
              <h3 style={{ fontSize: '2.2rem', marginTop: '1.25rem', marginBottom: '1rem', lineHeight: 1.25 }}>
                {currentVertical.headline}
              </h3>
              
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.65 }}>
                {currentVertical.description}
              </p>

              {/* Key Features List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {currentVertical.keyFeatures.map((feat, idx) => (
                  <div key={idx} style={{ background: 'hsl(var(--bg-primary) / 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <CheckCircle2 size={16} color={currentVertical.accentColor} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{feat.title}</h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{feat.description}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button className="btn-primary" style={{ background: currentVertical.accentColor }} onClick={() => setIsDemoModalOpen(true)}>
                  Schedule {currentVertical.name} Demo
                  <ArrowRight size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: currentVertical.accentColor, fontFamily: 'var(--font-mono)' }}>
                    {currentVertical.statMetric.value}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase' }}>
                    {currentVertical.statMetric.label}
                  </span>
                </div>
              </div>

            </div>

            {/* Visual Media Display */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid hsl(var(--border-subtle))' }}>
              <img 
                src={currentVertical.heroImage} 
                alt={currentVertical.name}
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)' }} />
              
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                <span className="badge-glow" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
                  SSR ONE AI • LIVE DEMO PREVIEW
                </span>
                <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                  {currentVertical.name} Suite
                </h4>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 4. Autonomous AI Copilot & Hardware Hub ── */}
      <section id="ai-copilot" style={{ padding: '5rem 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
            <span className="badge-glow">AUTONOMOUS INTELLIGENCE & HARDWARE HUB</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
              Built-in AI Copilot & Universal Hardware Compatibility
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem' }}>
              No extra third-party subscriptions required. SSR One AI comes built-in with autonomous demand forecasting, voice order taking, OCR invoice scanning, and plug-and-play POS hardware integration.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                <Cpu size={24} color="#6366f1" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>RAG Autonomous AI Copilot</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Ask questions in plain English or Hindi: <em>"Which menu item had highest margin this week?"</em> or <em>"Show me room occupancy forecast for weekend."</em>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                <MessageSquare size={24} color="#a855f7" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Voice Order Assistant</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Enable waitstaff or captains to take fast orders via voice speech-to-text. Automatically items added to bill and routed to kitchen screens.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <Printer size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Universal POS Hardware Support</h3>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Plug-and-play connection with USB/Ethernet/Bluetooth 80mm thermal receipt printers, cash drawers, barcode scanners, and EDC card machines.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. Single Unified Pricing & ROI ── */}
      <section id="pricing" style={{ padding: '5rem 0', background: 'hsl(var(--bg-secondary) / 0.5)' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <span className="badge-gold">SINGLE UNIFIED FLAT PRICING</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
              One Flat Price. Zero Limits. Full Access.
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Forget complicated tiers and per-user add-ons. Get complete access to all 14+ ERP modules, unlimited outlets, unlimited staff users, and autonomous AI for one straightforward price.
            </p>

          </div>

          {/* Single Centered Pricing Card */}
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            {pricingTiers.map((tier) => (
              <div 
                key={tier.id} 
                className="glass-card"
                style={{ 
                  padding: '3rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  border: '2px solid hsl(var(--accent-indigo))',
                  boxShadow: '0 0 45px rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="badge-glow" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#ffffff', border: 'none', padding: '0.4rem 1.25rem' }}>
                    ✨ FLAT ANNUAL LICENSE • UNLIMITED FULL ACCESS
                  </span>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>{tier.name}</h3>
                  <p style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))', marginTop: '0.5rem', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
                    {tier.description}
                  </p>
                </div>

                {/* Price Display Banner */}
                <div style={{ marginBottom: '2rem', padding: '1.75rem', background: 'hsl(var(--bg-primary) / 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-glow))', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'hsl(var(--accent-indigo))' }}>
                      ₹12,000
                    </span>
                    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', fontWeight: 700 }}>
                      / year
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'hsl(var(--accent-emerald))', fontWeight: 700, marginTop: '0.5rem' }}>
                    Single Flat Annual License • Zero Monthly Fees • Unlimited Everything
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                    Architecture: {tier.dbStrategy}
                  </p>
                </div>

                {/* Included Features List (2 Columns) */}
                <div style={{ flex: 1, marginBottom: '2.5rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(var(--text-secondary))', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    All Features & Capabilities Included With Zero Limits:
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.95rem' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <Check size={14} color="#10b981" />
                        </div>
                        <span style={{ fontWeight: idx < 2 ? 800 : 500, color: idx < 2 ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))' }}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn-primary"
                  style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, notes: `Interested in ₹12,000/year All-Inclusive License` }));
                    setIsDemoModalOpen(true);
                  }}
                >
                  <Sparkles size={20} />
                  Book Live Demo & Claim Unlimited Access
                </button>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. Executive Leadership & Contact Section ── */}
      <section id="contact" style={{ padding: '5rem 0' }}>
        <div className="container">
          
          <div className="glass-card" style={{ padding: '3.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
            
            <div>
              <span className="badge-gold">DIRECT FOUNDER & CORPORATE CONTACT</span>
              
              <h2 style={{ fontSize: '2.4rem', marginTop: '1rem', marginBottom: '1rem' }}>
                SSR IT INDUSTRY
              </h2>

              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.65 }}>
                Have custom enterprise requirements or multi-location rollout queries? Connect directly with our Founder & Leadership Team.
              </p>

              {/* Direct Leadership Contacts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'hsl(var(--bg-primary) / 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#6366f1" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Sumit Singh</h4>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Founder & Managing Director, SSR IT INDUSTRY</p>
                  </div>
                </div>

                <a 
                  href="tel:+918059075260"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'hsl(var(--bg-primary) / 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={20} color="#10b981" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>+91 8059075260</h4>
                    <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Direct Call & WhatsApp Line</p>
                  </div>
                </a>

                <a 
                  href="mailto:sumitsinghssrit@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'hsl(var(--bg-primary) / 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} color="#a855f7" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>sumitsinghssrit@gmail.com</h4>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Official Corporate Email</p>
                  </div>
                </a>

              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="https://wa.me/918059075260" target="_blank" rel="noreferrer" className="btn-primary" style={{ background: '#25D366' }}>
                  <MessageSquare size={18} />
                  Chat on WhatsApp Now
                </a>
              </div>

            </div>

            {/* Quick Inquiry Form */}
            <div style={{ background: 'hsl(var(--bg-primary) / 0.7)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid hsl(var(--border-subtle))' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Send Sales Inquiry</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
                Fill out your details below to receive a custom proposal and product demo.
              </p>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.35rem' }}>YOUR NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Sumit Singh"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.35rem' }}>BUSINESS / COMPANY NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Baithak Cafe / SSR Hotel"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.35rem' }}>PHONE / WHATSAPP *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 8059075260"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.35rem' }}>EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Submit & Connect via WhatsApp
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer style={{ borderTop: '1px solid hsl(var(--border-subtle))', padding: '3rem 0', background: 'hsl(var(--bg-secondary))' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 900 }}>SSR IT INDUSTRY</h4>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
              © 2026 SSR IT INDUSTRY. All Rights Reserved. SSR One AI Platform.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
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
            style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative' }}
          >
            <button 
              onClick={() => setIsDemoModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>

            {demoSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Demo Request Received!</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem' }}>
                  Thank you, <strong>{formData.fullName}</strong>. We have dispatched your demo slot details directly to <strong>Sumit Singh</strong> (+91 8059075260).
                </p>
                <button className="btn-primary" onClick={() => { setIsDemoModalOpen(false); setDemoSuccess(false); }}>
                  Close Window
                </button>
              </div>
            ) : (
              <div>
                <span className="badge-glow" style={{ marginBottom: '0.75rem' }}>SCHEDULE LIVE PRODUCT DEMO</span>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Experience SSR One AI in Action</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
                  Select your vertical and preferred date for a live interactive demonstration.
                </p>

                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>FULL NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Sumit Singh"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>COMPANY NAME *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Baithak Cafe"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>PHONE / WHATSAPP *</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 8059075260"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>EMAIL ADDRESS *</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sumitsinghssrit@gmail.com"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>VERTICAL *</label>
                      <select 
                        value={formData.vertical}
                        onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      >
                        <option value="restaurant">Restaurant POS & Dining</option>
                        <option value="hotel">Hotel & Resort PMS</option>
                        <option value="pg">PG & Hostel Management</option>
                        <option value="retail">Retail & Barcode ERP</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '0.25rem' }}>PREFERRED DATE *</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    <Sparkles size={18} />
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
