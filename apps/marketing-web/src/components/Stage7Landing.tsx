import React from 'react';
import { User, Phone, Mail, MessageSquare, ArrowRight, Users, Star, ShieldCheck } from 'lucide-react';
import { DemoLeadForm } from '../types';
import { sound } from '../utils/soundEngine';

interface Stage7LandingProps {
  formData: DemoLeadForm;
  setFormData: React.Dispatch<React.SetStateAction<DemoLeadForm>>;
  formError: string | null;
  isSubmitting: boolean;
  onSalesFormSubmit: (e: React.FormEvent) => void;
  lang?: 'en' | 'hi';
}

const CUSTOMER_VOICES = [
  {
    name: 'Rajesh Sharma',
    role: 'Owner, Spice Route Cafe (3 Outlets)',
    quote: 'Our dinner rush used to be chaos. Now KOTs print at kitchen stations in under 0.2s, and room dining connects right to hotel bills.',
    rating: 5,
  },
  {
    name: 'Vikram Joshi',
    role: 'MD, Highland Resorts & Banquets',
    quote: 'The ₹12,000 flat license replaced ₹1.2L in annual SaaS subscriptions. 100% PostgreSQL stability across 45 luxury rooms.',
    rating: 5,
  },
  {
    name: 'Pooja Verma',
    role: 'Proprietor, Heritage Retail Mart',
    quote: 'Barcode scanning never lags even with 15,000 SKUs in stock. GSTR-1 and GSTR-3B audit reports generate in one click.',
    rating: 5,
  },
];

export const Stage7Landing: React.FC<Stage7LandingProps> = ({
  formData,
  setFormData,
  formError,
  isSubmitting,
  onSalesFormSubmit,
}) => {
  return (
    <section id="stage-landing" className="journey-stage stage-landing-zone">
      <div className="container">
        
        {/* Plaza Header */}
        <div className="plaza-header-block">
          <div className="plaza-badge">
            <Users size={15} color="var(--accent-emerald)" />
            <span>STAGE 6 • DIRECT FOUNDER & LEADERSHIP ACCESS</span>
          </div>

          <h2 className="plaza-title">
            Deploy SSR One AI For Your Multi-Outlet Enterprise
          </h2>

          <p className="plaza-lead">
            Join leading restaurant chains, luxury hotels, student hostels, and retail supermarkets powered by SSR One AI. Connect directly with our engineering and leadership team for a personalized enterprise platform rollout.
          </p>
        </div>

        {/* Customer Voices / Town Square Citizens Cards */}
        <div className="town-square-citizens-grid">
          {CUSTOMER_VOICES.map((c, idx) => (
            <div key={idx} className="cinema-card citizen-testimonial-card">
              <div className="citizen-stars">
                {[...Array(c.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                ))}
              </div>
              <p className="citizen-quote">"{c.quote}"</p>
              <div className="citizen-author">
                <div className="citizen-avatar">
                  <User size={16} color="var(--accent-emerald)" />
                </div>
                <div>
                  <h5 className="citizen-name">{c.name}</h5>
                  <span className="citizen-role">{c.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Cinema Card: Founder Info + Live PostgreSQL Form */}
        <div className="cinema-card landing-interactive-card">
          <div className="contact-layout-grid">
            
            {/* Left Column: Direct Founder Contact */}
            <div className="founder-column">
              <span className="badge-emerald" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                DIRECT FOUNDER & LEADERSHIP DESK
              </span>

              <h3 className="founder-heading">
                SSR IT INDUSTRY
              </h3>

              <p className="founder-lead">
                Have custom enterprise requirements, high-volume multi-store migrations, or need an on-premise dedicated database cluster? Connect directly with our Founder & Managing Director.
              </p>

              {/* Founder Profile Card */}
              <div className="founder-profile-box">
                <div className="founder-avatar-badge">
                  <User size={22} color="var(--accent-emerald)" />
                </div>
                <div>
                  <h4 className="founder-name">Sumit Singh</h4>
                  <p className="founder-title">Founder & Managing Director, SSR IT INDUSTRY</p>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="founder-channels-stack">
                <a 
                  href="tel:+918059075260"
                  className="founder-channel-item"
                >
                  <div className="channel-icon-bubble">
                    <Phone size={20} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h4 className="channel-title">+91 8059075260</h4>
                    <p className="channel-subtitle">Direct Telephone Line</p>
                  </div>
                </a>

                <a 
                  href="mailto:sumitsinghssrit@gmail.com"
                  className="founder-channel-item"
                >
                  <div className="channel-icon-bubble">
                    <Mail size={20} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h4 className="channel-title">sumitsinghssrit@gmail.com</h4>
                    <p className="channel-subtitle">Official Corporate Inquiries</p>
                  </div>
                </a>
              </div>

              {/* Direct WhatsApp CTA */}
              <a 
                href="https://wa.me/918059075260?text=Hi%20Sumit%2C%20I%20am%20interested%20in%20SSR%20One%20AI%20Enterprise%20Master%20License." 
                target="_blank" 
                rel="noreferrer" 
                className="btn-cinema-primary btn-whatsapp"
              >
                <MessageSquare size={18} />
                <span>Message on WhatsApp Directly</span>
              </a>

            </div>

            {/* Right Column: Live PostgreSQL Sales Inquiry Form */}
            <div className="form-column">
              <h3 className="form-heading">Send Enterprise Sales Inquiry</h3>
              <p className="form-subtext">
                Your request is ingested directly into our PostgreSQL <code className="db-table-code">lead_inquiries</code> database with cryptographic isolation.
              </p>

              <form onSubmit={onSalesFormSubmit} className="inquiry-form">
                <div>
                  <label className="form-label">YOUR FULL NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Sumit Singh"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">BUSINESS / BRAND NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Baithak Cafe / Grand Resort / SSR Mart"
                    className="form-input"
                  />
                </div>

                <div className="form-grid-2col">
                  <div>
                    <label className="form-label">10-DIGIT MOBILE NUMBER *</label>
                    <input 
                      type="tel" 
                      required 
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="8059075260"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2col">
                  <div>
                    <label className="form-label">PRIMARY INDUSTRY VERTICAL *</label>
                    <select 
                      value={formData.vertical}
                      onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                      className="form-input"
                    >
                      <option value="restaurant">Restaurant & Dining POS</option>
                      <option value="hotel">Hotel & Resort PMS</option>
                      <option value="pg">Hostel & PG Living</option>
                      <option value="retail">Retail & Multi-Branch ERP</option>
                      <option value="all">Complete 14-Module Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">CURRENT NUMBER OF OUTLETS *</label>
                    <select 
                      value={formData.outletCount}
                      onChange={(e) => setFormData({ ...formData, outletCount: e.target.value })}
                      className="form-input"
                    >
                      <option value="1-3 Outlets">1 - 3 Outlets / Counters</option>
                      <option value="4-10 Outlets">4 - 10 Outlets / Counters</option>
                      <option value="11-50 Outlets">11 - 50 Outlets / Counters</option>
                      <option value="50+ Enterprise">50+ Enterprise Chain</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="form-error-banner">
                    ⚠️ {formError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-cinema-primary btn-submit-inquiry"
                >
                  <ShieldCheck size={18} />
                  <span>{isSubmitting ? 'Saving to Database...' : 'Save Inquiry to Database'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Stage7Landing;
