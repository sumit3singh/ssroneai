import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VerticalSolution, PricingTier, DemoLeadForm } from './types';
import {
  Header,
  Footer,
  VideoModal,
  DemoModal,
  Stage1Arrival,
  Stage2Invitation,
  Stage3TourDistricts,
  Stage5Connection,
  Stage6Reward,
  Stage7Landing,
} from './components';

export const App: React.FC = () => {
  // ── Journey State ──
  const [activeStage, setActiveStage] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeDistrict, setActiveDistrict] = useState<string>('restaurant');
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(false);
  const [isPluggedIn, setIsPluggedIn] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // ── Modals State ──
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoSuccess, setDemoSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── AI Terminal Simulated State ──
  const [terminalText, setTerminalText] = useState<string>('');

  // ── DOM References ──
  const journeyContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Lead Form Data (Single Source of Truth) ──
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

  // ── 1. Verticals Solutions Master Data (SSOT) ──
  const verticals: VerticalSolution[] = [
    {
      id: 'restaurant',
      name: 'Restaurant & Dining POS',
      badge: 'F&B Enterprise Architecture',
      headline: 'Lightning-Fast Touch POS, Live KDS Screens & QR Table Ordering',
      description: 'Streamline dining rooms, cloud kitchens, and bar counters with zero-latency order routing, multi-station thermal KOT dispatch, shift cash drawers, and menu recipe costing.',
      accentColor: '#103B2B',
      iconName: 'Utensils',
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '< 0.2s', label: 'Order Dispatch Speed' },
      keyFeatures: [
        { title: 'Touch POS & Floor Matrix', description: 'Interactive visual table layouts with merge, split, and hold bill capabilities.', iconName: 'Utensils' },
        { title: 'Kitchen Display System (KDS)', description: 'Real-time kitchen order screens for chefs with station-wise routing and timers.', iconName: 'Cpu' },
        { title: 'QR Contactless Ordering', description: 'Instant table-side ordering directly from customer smartphones without app downloads.', iconName: 'Zap' },
        { title: 'Recipe & Ingredient Costing', description: 'Automated stock deduction per dish ordered with variance and wastage alerts.', iconName: 'Layers' }
      ]
    },
    {
      id: 'hotel',
      name: 'Hotel & Resort PMS',
      badge: 'Hospitality Management',
      headline: 'End-to-End Hotel Operations, Room Inventory & Digital Check-In',
      description: 'Empower hotel staff with instant room booking grids, contactless guest check-in, housekeeping status trackers, guest folios, and banquet billing.',
      accentColor: '#103B2B',
      iconName: 'Hotel',
      heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '99.9%', label: 'Room Occupancy Sync' },
      keyFeatures: [
        { title: 'Interactive Reservation Grid', description: 'Drag-and-drop room matrix with live availability, rates, and channel manager sync.', iconName: 'Hotel' },
        { title: 'Digital Check-in & Guest Folio', description: 'ID document scanning, digital signatures, and unified room charge folios.', iconName: 'ShieldCheck' },
        { title: 'Housekeeping & Maintenance', description: 'Real-time room cleaning status, dirty/clean flags, and maintenance work orders.', iconName: 'Zap' },
        { title: 'Banquet & Event Management', description: 'Integrated booking engine for hotel conference halls, lawns, and corporate catering.', iconName: 'Sparkles' }
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
        { title: 'Biometric Gate Integration', description: 'Hardware integration with biometric scanners for entry logs and curfew alerts.', iconName: 'Zap' }
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
      heroImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
      statMetric: { value: '10,000+', label: 'SKU Barcode Lookups/s' },
      keyFeatures: [
        { title: 'Rapid Barcode Scanning POS', description: 'Instant item lookup via USB/Bluetooth barcode scanners with batch & MRP tracking.', iconName: 'ShoppingBag' },
        { title: 'Inter-Branch Stock Transfers', description: 'Stock dispatch and intake between multiple warehouse stores with real-time transit status.', iconName: 'GitBranch' },
        { title: 'Supplier Purchase Invoices', description: 'OCR invoice scanner to ingest vendor bills directly into accounts payable in seconds.', iconName: 'Cpu' },
        { title: 'Automated GST Reports', description: 'Generate GSTR-1, GSTR-3B audit-ready summaries with HSN breakdown in one click.', iconName: 'FileSpreadsheet' }
      ]
    }
  ];

  // ── 2. Unified Master Pricing Tier (₹12,000/yr SSOT) ──
  const pricingTier: PricingTier = {
    id: 'flat-annual-license',
    name: 'SSR One AI Enterprise Master License',
    annualFeeINR: 12000,
    monthlyFeeINR: 1000,
    description: 'Complete all-inclusive access to all 14+ modules for unlimited branches, unlimited staff logins, and autonomous AI.',
    dbStrategy: 'PostgreSQL Row-Level Security (RLS) Isolation',
    features: [
      'Unlimited Operating Outlets & Billing Counters',
      'Unlimited Staff & Cashier User Accounts',
      'Full 14-Module Suite (POS + PMS + PG + Retail)',
      'Multi-Station Thermal Receipt & KOT Printing',
      'Autonomous RAG AI Copilot & Voice Assistant',
      'Automated WhatsApp Invoices & Payment Reminders',
      'GST & Tax Compliance Audit Reports',
      'Free Software Updates & 99.9% Cloud Uptime SLA'
    ],
    ctaLabel: 'Claim ₹12,000/year Annual License'
  };

  // ── 3. Smooth Scroll (Lenis) & GSAP MotionPath Timeline Engine ──
  // ── 3. Smooth Scroll (Lenis) & Viewport Stage Observer ──
  useEffect(() => {
    const Lenis = (window as any).Lenis;
    let lenisInstance: any = null;

    if (Lenis) {
      try {
        lenisInstance = new Lenis({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5,
        });

        const raf = (time: number) => {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      } catch (err) {
        console.warn("Lenis initialization skipped:", err);
      }
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setIsHeaderVisible(progress > 4);

      // Map progress to active enterprise stages
      if (progress < 14) {
        setActiveStage(1);
        setIsPluggedIn(false);
      } else if (progress < 25) {
        setActiveStage(2);
        setIsPluggedIn(false);
      } else if (progress < 70) {
        setActiveStage(3);
        setIsPluggedIn(false);

        if (progress < 36) setActiveDistrict('restaurant');
        else if (progress < 48) setActiveDistrict('hotel');
        else if (progress < 58) setActiveDistrict('pg');
        else setActiveDistrict('retail');
      } else if (progress < 82) {
        setActiveStage(4);
        setIsPluggedIn(true);
      } else if (progress < 93) {
        setActiveStage(5);
        setIsPluggedIn(true);
      } else {
        setActiveStage(6);
        setIsPluggedIn(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  // ── 4. Live AI Terminal Typewriter for Beat 5 (Connection) ──
  useEffect(() => {
    const fullQuery = "ssrone query --scope='all-outlets' 'Which menu item had highest margin this week?'";
    const fullResponse = "ANALYSIS COMPLETE: [Special Tandoori Platter] yielded 68.4% gross margin (₹1,84,200 net profit). Recommended Action: Replenish tandoori spices and marination stock before Friday evening peak.";

    let timer: NodeJS.Timeout;
    if (activeStage === 4) {
      let charIdx = 0;
      setTerminalText('');

      timer = setInterval(() => {
        if (charIdx < fullQuery.length) {
          setTerminalText(fullQuery.slice(0, charIdx + 1));
          charIdx++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setTerminalText(fullQuery + "\n\n" + fullResponse);
          }, 350);
        }
      }, 30);
    }

    return () => clearInterval(timer);
  }, [activeStage]);

  // ── 5. Smooth Jump Navigation Helper ──
  const jumpToTarget = (targetId: string, offsetY = 80) => {
    const targetElem = document.getElementById(targetId);
    if (!targetElem) return;

    const gsap = (window as any).gsap;
    if (gsap && (window as any).ScrollToPlugin) {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: targetElem, offsetY },
        ease: 'power3.inOut',
      });
    } else {
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const jumpToStage = (stageNumber: number) => {
    const stageIds: Record<number, string> = {
      1: 'stage-arrival',
      2: 'stage-invitation',
      3: 'stage-tour',
      4: 'stage-connection',
      5: 'stage-reward',
      6: 'stage-landing',
    };
    const target = stageIds[stageNumber] || 'stage-arrival';
    jumpToTarget(target);
  };

  const jumpToDistrict = (districtId: string) => {
    setActiveDistrict(districtId);
    jumpToTarget(`district-${districtId}`, 120);
  };

  // ── 6. Live PostgreSQL Database Lead Ingestion Pipeline (SSOT) ──
  const handleFormSubmit = async (e: React.FormEvent, inquiryType: 'DEMO_REQUEST' | 'SALES_INQUIRY' = 'DEMO_REQUEST') => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Strict 10-Digit Mobile Number Validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    const normalizedPhone = cleanPhone.length > 10 && cleanPhone.startsWith('91') ? cleanPhone.slice(2) : cleanPhone;

    if (normalizedPhone.length !== 10) {
      setFormError("Please enter a valid 10-digit Indian mobile number (e.g. 8059075260)");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      full_name: formData.fullName.trim(),
      company_name: formData.companyName.trim(),
      phone: normalizedPhone,
      email: formData.email.trim(),
      vertical: formData.vertical,
      outlet_count: formData.outletCount,
      preferred_date: formData.preferredDate || new Date().toISOString().split('T')[0],
      preferred_time: formData.preferredTime || '11:00 AM',
      inquiry_type: inquiryType,
      notes: formData.notes?.trim() || `Inquiry from Character-Guided Journey (${inquiryType})`,
      source: 'MARKETING_WEB_MOTION_PATH'
    };

    // Candidate API Endpoint Resolution with Fallback Shield
    const candidateUrls = [
      (import.meta as any).env?.VITE_API_URL 
        ? `${(import.meta as any).env.VITE_API_URL.replace(/\/+$/, '')}/marketing/leads` 
        : '/api/v1/marketing/leads',
      'http://127.0.0.1:8000/api/v1/marketing/leads',
      'http://localhost:8000/api/v1/marketing/leads'
    ];

    let success = false;
    let lastErrorMsg = '';

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok || res.status === 201) {
          success = true;
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrorMsg = errData.detail || `Server returned HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastErrorMsg = err.name === 'AbortError' ? 'Connection timeout' : (err.message || 'Network error');
      }
    }

    setIsSubmitting(false);

    if (success) {
      setDemoSuccess(true);
      if (inquiryType === 'SALES_INQUIRY') {
        alert("Inquiry successfully saved to SSR One AI database! Our leadership team will contact you shortly.");
      }
    } else {
      setFormError(`Database Connection Error: ${lastErrorMsg || 'Could not reach backend API server.'}`);
    }
  };

  return (
    <div 
      id="journeyContainer"
      ref={journeyContainerRef}
      className="journey-world-container"
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      
      {/* ── Top Header Navigation ── */}
      <Header
        isHeaderVisible={isHeaderVisible}
        scrollToAct={(act) => {
          if (act === 1) jumpToStage(1);
          else if (act === 4) jumpToStage(3);
          else if (act === 5) jumpToStage(4);
          else if (act === 6) jumpToStage(5);
          else jumpToStage(6);
        }}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        lang={lang}
        onToggleLang={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
      />

      {/* ── Beat 1: The Arrival ── */}
      <Stage1Arrival
        onStartJourney={() => jumpToStage(2)}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        lang={lang}
      />

      {/* ── Beat 2: The Invitation & Portal ── */}
      <Stage2Invitation
        onEnterWorld={() => jumpToStage(3)}
      />

      {/* ── Beats 3 & 4: Entering the World + The Tour ── */}
      <Stage3TourDistricts
        verticals={verticals}
        activeDistrict={activeDistrict}
        setActiveDistrict={setActiveDistrict}
        onSelectVerticalForDemo={(verticalId) => {
          setFormData(prev => ({ ...prev, vertical: verticalId }));
          setIsDemoModalOpen(true);
        }}
        onJumpToDistrict={jumpToDistrict}
      />

      {/* ── Beat 5: The Connection (AI Copilot Neural Tower) ── */}
      <Stage5Connection
        terminalText={terminalText}
        isPluggedIn={isPluggedIn}
      />

      {/* ── Beat 6: The Reward (₹12K Flat Annual Key & Loop) ── */}
      <Stage6Reward
        pricingTier={pricingTier}
        onClaimOffer={() => {
          setFormData(prev => ({ ...prev, notes: 'Interested in ₹12,000/year Flat Annual Enterprise License' }));
          setIsDemoModalOpen(true);
        }}
        lang={lang}
      />

      {/* ── Beat 7: The Landing (Town Plaza, Customer Trust & Live DB Form) ── */}
      <Stage7Landing
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        isSubmitting={isSubmitting}
        onSalesFormSubmit={(e) => handleFormSubmit(e, 'SALES_INQUIRY')}
        lang={lang}
      />

      {/* ── Enterprise Daylight Footer ── */}
      <Footer />

      {/* ── Cinematic Trailer Video Modal ── */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* ── Interactive Demo Booking Modal (PostgreSQL Lead Ingestion) ── */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        demoSuccess={demoSuccess}
        setDemoSuccess={setDemoSuccess}
        formError={formError}
        isSubmitting={isSubmitting}
        onDemoFormSubmit={(e) => handleFormSubmit(e, 'DEMO_REQUEST')}
      />

    </div>
  );
};

export default App;
