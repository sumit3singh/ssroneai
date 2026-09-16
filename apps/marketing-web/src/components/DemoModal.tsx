import React from 'react';
import { Sparkles, CheckCircle2, MessageSquare, X } from 'lucide-react';
import { DemoLeadForm } from '../types';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: DemoLeadForm;
  setFormData: React.Dispatch<React.SetStateAction<DemoLeadForm>>;
  demoSuccess: boolean;
  setDemoSuccess: (success: boolean) => void;
  formError: string | null;
  isSubmitting: boolean;
  onDemoFormSubmit: (e: React.FormEvent) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  demoSuccess,
  setDemoSuccess,
  formError,
  isSubmitting,
  onDemoFormSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="cinema-modal-overlay" onClick={onClose}>
      <div 
        className="cinema-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '580px', padding: '2.75rem', position: 'relative', background: '#FFFFFF', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-popover)' }}
      >
        <button 
          onClick={onClose}
          aria-label="Close Modal"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <X size={22} />
        </button>

        {demoSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-emerald-badge)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={38} />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>Demo Request Saved!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.98rem', lineHeight: 1.6 }}>
              Thank you, <strong>{formData.fullName}</strong>. Your request for <strong>{formData.companyName}</strong> has been saved directly to our PostgreSQL database. Our platform superadmin team will contact you shortly.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a 
                href={`https://wa.me/918059075260?text=${encodeURIComponent(`Hi Sumit, I submitted a Demo Request for ${formData.companyName}`)}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-sm)', background: '#25D366', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}
              >
                <MessageSquare size={16} />
                Connect on WhatsApp
              </a>
              <button 
                className="btn-cinema-primary" 
                onClick={() => { 
                  onClose(); 
                  setDemoSuccess(false); 
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span className="badge-emerald" style={{ marginBottom: '0.75rem' }}>
              SCHEDULE LIVE PRODUCT DEMO
            </span>
            <h3 style={{ fontSize: '1.65rem', marginTop: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              Experience SSR One AI in Action
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.85rem' }}>
              Select your vertical and preferred slot for a live demonstration.
            </p>

            <form onSubmit={onDemoFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>FULL NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Sumit Singh"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>COMPANY NAME *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Baithak Cafe"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>10-DIGIT MOBILE NUMBER *</label>
                  <input 
                    type="tel" 
                    required 
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="8059075260"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>EMAIL ADDRESS *</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sumitsinghssrit@gmail.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>VERTICAL *</label>
                  <select 
                    value={formData.vertical}
                    onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    <option value="restaurant">Restaurant POS & Dining</option>
                    <option value="hotel">Hotel & Resort PMS</option>
                    <option value="pg">PG & Hostel Management</option>
                    <option value="retail">Retail & Barcode ERP</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>PREFERRED DATE *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
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
                <Sparkles size={16} />
                {isSubmitting ? 'Saving to Database...' : 'Confirm & Dispatch Demo Request'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
