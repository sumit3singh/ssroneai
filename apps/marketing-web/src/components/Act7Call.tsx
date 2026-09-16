import React from 'react';
import { User, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { DemoLeadForm } from '../types';

interface Act7CallProps {
  formData: DemoLeadForm;
  setFormData: React.Dispatch<React.SetStateAction<DemoLeadForm>>;
  formError: string | null;
  isSubmitting: boolean;
  onSalesFormSubmit: (e: React.FormEvent) => void;
}

export const Act7Call: React.FC<Act7CallProps> = ({
  formData,
  setFormData,
  formError,
  isSubmitting,
  onSalesFormSubmit,
}) => {
  return (
    <section id="act-7" className="act-7-stage">
      <div className="container">
        
        <div className="cinema-card" style={{ padding: '3.5rem', background: '#FFFFFF', border: '1px solid var(--border-subtle)' }}>
          
          <div className="contact-layout-grid">
            
            {/* Left Column: Direct Founder Contact */}
            <div>
              <span className="badge-emerald" style={{ marginBottom: '1rem' }}>
                ACT 7 • DIRECT FOUNDER & LEADERSHIP CONTACT
              </span>

              <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.6rem)', marginTop: '0.85rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
                SSR IT INDUSTRY
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.25rem' }}>
                Have custom enterprise rollout queries or multi-chain migration requirements? Connect directly with our Founder & Leadership Team.
              </p>

              {/* Founder Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2.25rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Sumit Singh</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Founder & Managing Director, SSR IT INDUSTRY</p>
                  </div>
                </div>

                <a 
                  href="tel:+918059075260"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s ease' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={22} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>+91 8059075260</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '0.15rem' }}>Direct Call Line</p>
                  </div>
                </a>

                <a 
                  href="mailto:sumitsinghssrit@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s ease' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-emerald-badge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} color="var(--accent-emerald)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>sumitsinghssrit@gmail.com</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Official Corporate Email</p>
                  </div>
                </a>

              </div>

              <a 
                href="https://wa.me/918059075260" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-cinema-primary"
                style={{ background: '#25D366', borderColor: '#25D366', color: '#ffffff', width: '100%' }}
              >
                <MessageSquare size={18} />
                Connect on WhatsApp Directly
              </a>

            </div>

            {/* Right Column: Live PostgreSQL Sales Inquiry Form */}
            <div style={{ background: 'var(--bg-primary)', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevation-sm)' }}>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Send Sales Inquiry</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
                Your request is saved directly into our PostgreSQL <code style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>lead_inquiries</code> database.
              </p>

              <form onSubmit={onSalesFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>YOUR NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Sumit Singh"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>BUSINESS / COMPANY NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Baithak Cafe / SSR Hotel Chain"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>10-DIGIT MOBILE NUMBER *</label>
                    <input 
                      type="tel" 
                      required 
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="8059075260"
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>EMAIL ADDRESS *</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                {formError && (
                  <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-xs)', background: 'var(--accent-terracotta-badge)', border: '1px solid var(--accent-terracotta-border)', color: 'var(--accent-terracotta)', fontSize: '0.84rem', fontWeight: 600 }}>
                    ⚠️ {formError}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-cinema-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer', padding: '0.9rem' }}
                >
                  {isSubmitting ? 'Saving to Database...' : 'Save Inquiry to Database'}
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
