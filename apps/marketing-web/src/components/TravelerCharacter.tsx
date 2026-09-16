import React from 'react';

export type TourGuideRole =
  | 'host'        // Beat 1: Citadel Entrance Welcoming Host
  | 'portal'      // Beat 2: Keymaster presenting RFID database passkey
  | 'restaurant'  // Beat 3: Hospitality Operations Director (Captain POS & sub-2ms KOT)
  | 'hotel'       // Beat 3: Hotel General Manager (Concierge keys & room grid)
  | 'pg'          // Beat 3: Student Living Director (Biometric badge & WhatsApp rent ledger)
  | 'retail'      // Beat 3: Chief Retail Director (Laser barcode scanner & GST)
  | 'ai'          // Beat 4: Principal AI Architect (Holographic neural datalink)
  | 'reward'      // Beat 5: Senior Commercial Director (Flat ₹12,000/yr Golden Master Key)
  | 'concierge';  // Beat 6: VIP Solutions Concierge (Live Demo Booking)

export interface TravelerCharacterProps {
  role?: TourGuideRole;
  isConnecting?: boolean;
  isIdle?: boolean;
  showShopCompanion?: boolean;
  shopConnected?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TravelerCharacter: React.FC<TravelerCharacterProps> = ({
  role = 'host',
  isConnecting = false,
  isIdle = false,
  showShopCompanion = false,
  shopConnected = false,
  className = '',
  size = 'md',
}) => {
  // Dimension mappings
  const dimensions = {
    sm: { width: 56, height: 72 },
    md: { width: 76, height: 98 },
    lg: { width: 96, height: 124 },
  }[size];

  return (
    <div
      className={`traveler-container role-${role} ${className} ${isIdle ? 'idle' : 'traveling'}`}
      data-tour-role={role}
    >
      {/* ── Personal Business Shop Companion (Joins at Beat 5: Connection) ── */}
      {showShopCompanion && (
        <div className={`shop-companion ${shopConnected ? 'connected' : ''}`}>
          <div className="shop-badge">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14L6 6H30L32 14H4Z" fill="#103B2B" />
              <path d="M4 14C4 16 6 17 8 17C10 17 12 16 12 14C12 16 14 17 16 17C18 17 20 16 20 14C20 16 22 17 24 17C26 17 28 16 28 14C28 16 30 17 32 17" stroke="#FAF9F5" strokeWidth="1.5" fill="#164E3A" />
              <rect x="6" y="17" width="24" height="15" rx="2" fill="#FAF9F5" stroke="#103B2B" strokeWidth="1.5" />
              <rect x="10" y="20" width="7" height="8" rx="1" fill="#DFE2E6" stroke="#103B2B" strokeWidth="1" />
              <rect x="20" y="20" width="7" height="12" rx="1" fill="#B8860B" />
              <circle cx="21.5" cy="26" r="0.8" fill="#FFFFFF" />
            </svg>
            <span className="shop-label">My Business</span>
          </div>

          {isConnecting && (
            <div className="connection-beam-spark">
              <span className="beam-pulse" />
            </div>
          )}
        </div>
      )}

      {/* ── The Serious, Professional Hospitality Tour Director ── */}
      <div className="character-avatar">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 80 102"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="character-svg"
        >
          <defs>
            {/* Ambient Radial Ground Occlusion */}
            <radialGradient id="tourShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#103B2B" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#103B2B" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#103B2B" stopOpacity="0" />
            </radialGradient>

            {/* Smart Tablet Screen Glow */}
            <linearGradient id="tourScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D2A20" />
              <stop offset="100%" stopColor="#03140F" />
            </linearGradient>

            {/* Leather Executive Briefcase Gradient */}
            <linearGradient id="tourBriefcase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#854D0E" />
              <stop offset="100%" stopColor="#543009" />
            </linearGradient>

            {/* Executive Bespoke Blazer Gradient (Midnight Charcoal to Deep Forest) */}
            <linearGradient id="tourBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#08101C" />
            </linearGradient>

            {/* Golden Master Key Sparkle */}
            <linearGradient id="goldKeyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="40%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>
          </defs>

          {/* 1. Ground Footstep Contact Shadow */}
          <g className="traveler-shadow">
            <ellipse cx="40" cy="95" rx="24" ry="4.5" fill="url(#tourShadow)" className="shadow-ellipse" />
          </g>

          {/* 2. Left Leg (Articulated Walking Limb with Oxford Shoe) */}
          <g className="traveler-leg leg-left">
            <path d="M32 54 L38 54 L37 71 L33 71 Z" fill="#1E293B" />
            <circle cx="35" cy="71" r="2.2" fill="#162234" />
            <path d="M33 71 L37 71 L36 86 L33 86 Z" fill="#0F172A" />
            <line x1="32.5" y1="85.5" x2="36.5" y2="85.5" stroke="#334155" strokeWidth="0.8" />
            <path d="M29 86 H37.5 C39 86 39.5 87.2 39.5 88.5 V91 H28 V88.5 C28 87.2 28.5 86 29 86 Z" fill="#451A03" />
            <rect x="27.5" y="91" width="12.5" height="2.2" rx="0.6" fill="#1E293B" />
            <line x1="33" y1="87" x2="35.5" y2="87" stroke="#78350F" strokeWidth="0.6" />
          </g>

          {/* 3. Right Leg (Articulated Walking Limb with Oxford Shoe) */}
          <g className="traveler-leg leg-right">
            <path d="M42 54 L48 54 L47 71 L43 71 Z" fill="#1E293B" />
            <circle cx="45" cy="71" r="2.2" fill="#162234" />
            <path d="M43 71 L47 71 L46 86 L43 86 Z" fill="#0F172A" />
            <line x1="42.5" y1="85.5" x2="46.5" y2="85.5" stroke="#334155" strokeWidth="0.8" />
            <path d="M39 86 H47.5 C49 86 49.5 87.2 49.5 88.5 V91 H38 V88.5 C38 87.2 38.5 86 39 86 Z" fill="#451A03" />
            <rect x="37.5" y="91" width="12.5" height="2.2" rx="0.6" fill="#1E293B" />
            <line x1="43" y1="87" x2="45.5" y2="87" stroke="#78350F" strokeWidth="0.6" />
          </g>

          {/* 4. Torso & Executive Tailored Attire */}
          <g className="traveler-torso">
            <path
              d="M28 32 C28 29 31 28 34 28 H46 C49 28 52 29 52 32 L54 58 C54 60 52 61 49 61 H31 C28 61 26 60 26 58 Z"
              fill="url(#tourBlazer)"
            />

            {/* Crisp Spread-Collar White Shirt */}
            <polygon points="36,28 44,28 41.5,45 38.5,45" fill="#FFFFFF" />

            {/* Deep Emerald Silk Tie */}
            <polygon points="39,31 41,31 41.6,47 40,50 38.4,47" fill="#103B2B" />
            <line x1="39" y1="38" x2="41" y2="38" stroke="#B8860B" strokeWidth="0.7" />

            {/* Tailored Lapels */}
            <path d="M33 28 L38.5 47 L35.5 48 L29.5 33 Z" fill="#164E3A" opacity="0.95" />
            <path d="M47 28 L41.5 47 L44.5 48 L50.5 33 Z" fill="#164E3A" opacity="0.95" />

            {/* Pocket Square with Gold Piping */}
            <polygon points="46,37 49,37 48,35" fill="#FAF9F5" />
            <line x1="45.5" y1="38" x2="49.5" y2="38" stroke="#B8860B" strokeWidth="0.8" />

            {/* ── Specialized Lapel Insignia Based on Tour Director Role ── */}
            {role === 'host' && (
              // Gold SSR IT INDUSTRY Citadel Crest
              <circle cx="34" cy="36" r="1.6" fill="#B8860B" stroke="#FDE047" strokeWidth="0.5" />
            )}
            {role === 'hotel' && (
              // Golden Crossed Concierge Keys Pin
              <g transform="translate(32.5, 34.5)">
                <path d="M0 3 L3 0 M0 0 L3 3" stroke="#FBBF24" strokeWidth="0.8" />
                <circle cx="0.5" cy="0.5" r="0.6" fill="#FBBF24" />
                <circle cx="2.5" cy="2.5" r="0.6" fill="#FBBF24" />
              </g>
            )}
            {role === 'restaurant' && (
              // Sommelier / Hospitality Operations Pin
              <circle cx="34" cy="36" r="1.5" fill="#10B981" stroke="#FBBF24" strokeWidth="0.6" />
            )}
            {role === 'pg' && (
              // Biometric Access Badge Clip
              <rect x="32.5" y="34.5" width="3.2" height="4" rx="0.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.5" />
            )}
            {role === 'retail' && (
              // Barcode / ERP Master Badge
              <rect x="32.5" y="34.5" width="3.2" height="4" rx="0.5" fill="#F59E0B" stroke="#FEF08A" strokeWidth="0.5" />
            )}
            {role === 'ai' && (
              // Holographic Neural Core Star Pin
              <polygon points="34,34 35,36 37,36 35.5,37.5 36,39.5 34,38 32,39.5 32.5,37.5 31,36 33,36" fill="#10B981" />
            )}
            {role === 'reward' && (
              // Golden Enterprise Crown / Seal
              <circle cx="34" cy="36" r="1.8" fill="#FBBF24" stroke="#78350F" strokeWidth="0.6" />
            )}

            {/* Suit Gold Buttons */}
            <circle cx="40" cy="52" r="1.1" fill="#B8860B" stroke="#8A6508" strokeWidth="0.4" />
            <circle cx="40" cy="56" r="1.1" fill="#B8860B" stroke="#8A6508" strokeWidth="0.4" />
          </g>

          {/* 5. Left Arm & Professional Briefcase / Folder */}
          <g className="traveler-arm arm-left">
            <path d="M26 31 C23 37 21 44 20 51" stroke="#0F172A" strokeWidth="5.2" strokeLinecap="round" />
            <circle cx="20" cy="51.5" r="2.6" fill="#FFFFFF" />
            <circle cx="19.5" cy="54.5" r="2.4" fill="#F8C8B4" />

            {/* Handcrafted Leather Executive Briefcase */}
            <g>
              <path d="M17 53 C17 50.5 22 50.5 22 53" stroke="#543009" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <rect x="12" y="54" width="16" height="19" rx="2.2" fill="url(#tourBriefcase)" stroke="#3E2004" strokeWidth="0.8" />
              <path d="M12 54 H28 L27 62 H13 Z" fill="#6B3809" />
              <rect x="18.5" y="61" width="3" height="3.5" rx="0.6" fill="#FBBF24" stroke="#B45309" strokeWidth="0.5" />
              <circle cx="20" cy="62.7" r="0.6" fill="#78350F" />
              <line x1="13.5" y1="71" x2="26.5" y2="71" stroke="#A16207" strokeWidth="0.6" strokeDasharray="1.5 1" />
            </g>
          </g>

          {/* 6. Right Arm & Dynamic Role-Specific Equipment */}
          <g className="traveler-arm arm-right">
            <path d="M54 31 C57 37 59 44 57 50" stroke="#0F172A" strokeWidth="5.2" strokeLinecap="round" />
            <circle cx="57" cy="50.5" r="2.6" fill="#FFFFFF" />
            <circle cx="56.5" cy="53.5" r="2.4" fill="#F8C8B4" />

            {/* ── PROP A: RESTAURANT (Handheld Touch POS Terminal with KOT Ticket) ── */}
            {role === 'restaurant' && (
              <g className="prop-restaurant">
                <rect x="53" y="43" width="18" height="23" rx="2" fill="#1E293B" stroke="#10B981" strokeWidth="0.9" />
                <rect x="54.5" y="44.5" width="15" height="15" rx="1" fill="#0A1F18" />
                {/* Table Billing Grid */}
                <rect x="56" y="46" width="3" height="3" fill="#10B981" rx="0.4" />
                <rect x="60" y="46" width="3" height="3" fill="#10B981" rx="0.4" />
                <rect x="64" y="46" width="3" height="3" fill="#FBBF24" rx="0.4" />
                <rect x="56" y="50" width="3" height="3" fill="#EF4444" rx="0.4" />
                <rect x="60" y="50" width="3" height="3" fill="#10B981" rx="0.4" />
                <rect x="64" y="50" width="3" height="3" fill="#10B981" rx="0.4" />
                {/* Thermal KOT Ticket Printing out of bottom */}
                <path d="M56 60 H68 L67 69 L65 67 L63 69 L61 67 L59 69 L57 67 Z" fill="#FAF9F5" stroke="#CBD5E1" strokeWidth="0.5" />
                <line x1="58" y1="62" x2="66" y2="62" stroke="#103B2B" strokeWidth="0.7" />
                <line x1="58" y1="64.5" x2="64" y2="64.5" stroke="#64748B" strokeWidth="0.6" />
              </g>
            )}

            {/* ── PROP B: HOTEL PMS (Digital Room Keycard & Concierge Folio) ── */}
            {role === 'hotel' && (
              <g className="prop-hotel">
                {/* Executive Folio Board */}
                <rect x="53" y="43" width="17" height="22" rx="1.5" fill="#0F172A" stroke="#B8860B" strokeWidth="0.8" />
                <rect x="54.5" y="44.5" width="14" height="19" rx="1" fill="#1E293B" />
                {/* Room Grid Rows */}
                <line x1="56" y1="48" x2="67" y2="48" stroke="#10B981" strokeWidth="1.2" strokeDasharray="2 1" />
                <line x1="56" y1="52" x2="67" y2="52" stroke="#10B981" strokeWidth="1.2" strokeDasharray="3 1" />
                <line x1="56" y1="56" x2="67" y2="56" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="2 1" />
                {/* Smart Gold Room RFID Keycard Held in Front */}
                <rect x="59" y="57" width="13" height="8" rx="1" fill="#B8860B" stroke="#FDE047" strokeWidth="0.7" transform="rotate(-15 59 57)" />
                <circle cx="62" cy="60" r="1" fill="#FFFFFF" />
              </g>
            )}

            {/* ── PROP C: STUDENT PG (Resident Ledger & Biometric Access Pass) ── */}
            {role === 'pg' && (
              <g className="prop-pg">
                {/* Ledger Tablet with WhatsApp Sync */}
                <rect x="53" y="44" width="17" height="22" rx="2" fill="#1E293B" stroke="#0284C7" strokeWidth="0.8" />
                <rect x="54.5" y="45.5" width="14" height="19" rx="1" fill="#0C1F2E" />
                {/* Rent Paid Badges */}
                <rect x="56" y="48" width="11" height="2" rx="0.5" fill="#38BDF8" />
                <rect x="56" y="53" width="8" height="2" rx="0.5" fill="#22C55E" />
                <rect x="56" y="58" width="10" height="2" rx="0.5" fill="#22C55E" />
                {/* WhatsApp Payment Icon */}
                <circle cx="65" cy="59" r="1.8" fill="#22C55E" />
                <path d="M64.3 58.5 L65.7 59.5" stroke="#FFFFFF" strokeWidth="0.5" />
              </g>
            )}

            {/* ── PROP D: RETAIL ERP (Handheld Laser Barcode Scanner with Green Aiming Beam) ── */}
            {role === 'retail' && (
              <g className="prop-retail">
                {/* Ergonomic Barcode Scanner Gun */}
                <path d="M55 48 H66 C68 48 69 49 69 51 L68 54 H62 L60 62 H56 L57 53 H55 Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="0.8" />
                {/* Scanner Trigger & Head */}
                <rect x="67" y="49" width="3" height="5" rx="0.5" fill="#EF4444" />
                {/* Green Laser Aiming Beam */}
                <line x1="70" y1="51.5" x2="80" y2="51.5" stroke="#22C55E" strokeWidth="1.2" strokeDasharray="2 1.5" />
                <circle cx="79.5" cy="51.5" r="1" fill="#22C55E" />
              </g>
            )}

            {/* ── PROP E: AI NEURAL CORE (Holographic Datalink & Streams) ── */}
            {role === 'ai' && (
              <g className="prop-ai">
                {/* Holographic Tablet Frame */}
                <rect x="53" y="44" width="17" height="22" rx="2" fill="#0A1F18" stroke="#10B981" strokeWidth="1" />
                {/* Neural Pulsing Waves */}
                <circle cx="61.5" cy="55" r="4" stroke="#10B981" strokeWidth="0.8" strokeDasharray="2 1" />
                <circle cx="61.5" cy="55" r="2" fill="#34D399" />
                {/* Upward Holographic Data Beam Spark */}
                <line x1="61.5" y1="50" x2="61.5" y2="40" stroke="#10B981" strokeWidth="1" strokeDasharray="1.5 1" />
                <polygon points="61.5,38 60,41 63,41" fill="#34D399" />
              </g>
            )}

            {/* ── PROP F: REWARD (Golden Flat Master Enterprise Key) ── */}
            {role === 'reward' && (
              <g className="prop-reward">
                {/* Large Floating Golden Master Enterprise Key */}
                <g transform="translate(54, 42)">
                  <circle cx="8" cy="7" r="6" fill="url(#goldKeyGrad)" stroke="#78350F" strokeWidth="1" />
                  <circle cx="8" cy="7" r="3" fill="#0F172A" />
                  <rect x="7" y="13" width="2.5" height="15" fill="url(#goldKeyGrad)" stroke="#78350F" strokeWidth="0.8" />
                  {/* Key Teeth */}
                  <rect x="9.5" y="21" width="3.5" height="2" fill="url(#goldKeyGrad)" stroke="#78350F" strokeWidth="0.7" />
                  <rect x="9.5" y="25" width="4.5" height="2" fill="url(#goldKeyGrad)" stroke="#78350F" strokeWidth="0.7" />
                  {/* Golden Sparkle Glint */}
                  <polygon points="4,4 5,7 4,10 3,7" fill="#FFFFFF" />
                </g>
              </g>
            )}

            {/* ── DEFAULT / HOST / PORTAL / CONCIERGE: Enterprise Tablet ── */}
            {(role === 'host' || role === 'portal' || role === 'concierge') && (
              <g className="prop-tablet">
                <rect x="53" y="44" width="17" height="22" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="0.8" />
                <rect x="54.5" y="45.5" width="14" height="19" rx="1" fill="url(#tourScreenGrad)" />
                <rect x="56" y="47.5" width="11" height="1.8" rx="0.5" fill="#10B981" />
                <rect x="56" y="56" width="2" height="6" rx="0.4" fill="#34D399" />
                <rect x="59" y="53" width="2" height="9" rx="0.4" fill="#10B981" />
                <rect x="62" y="50" width="2" height="12" rx="0.4" fill="#FBBF24" />
                <circle cx="65.5" cy="48.5" r="0.8" fill="#34D399" />
              </g>
            )}
          </g>

          {/* 7. Head, Executive Facial Structure, Glasses & Poise */}
          <g className="traveler-head">
            <rect x="37" y="24" width="6" height="7" rx="1.5" fill="#F8C8B4" />
            <polygon points="35,28 37,32 39,28" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
            <polygon points="45,28 43,32 41,28" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />

            {/* Head Contour */}
            <path
              d="M33 16 C33 10.5 36 7.5 40 7.5 C44 7.5 47 10.5 47 16 C47 21.5 44 25.5 40 25.5 C36 25.5 33 21.5 33 16 Z"
              fill="#F8C8B4"
            />

            <circle cx="32.5" cy="17" r="1.8" fill="#F8C8B4" />
            <circle cx="47.5" cy="17" r="1.8" fill="#F8C8B4" />

            {/* Styled Modern Executive Hair with Clean Parting */}
            <path
              d="M32 15 C31 8.5 35 4.5 41 4.5 C47 4.5 49 8.5 48 13 C47 14 45 13 42 12 C38 11 35 12 33 15 Z"
              fill="#1E293B"
            />
            <path d="M37 6.5 C41 5.5 45 6.5 47 8.5" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

            {/* Gold-Rimmed Executive Glasses */}
            <g className="glasses-group">
              <rect x="34.2" y="14" width="4.8" height="3.8" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="#B8860B" strokeWidth="0.8" />
              <rect x="41" y="14" width="4.8" height="3.8" rx="1.2" fill="rgba(255,255,255,0.35)" stroke="#B8860B" strokeWidth="0.8" />
              <line x1="39" y1="15.8" x2="41" y2="15.8" stroke="#B8860B" strokeWidth="0.8" />
              <line x1="32.5" y1="15.5" x2="34.2" y2="15.5" stroke="#B8860B" strokeWidth="0.8" />
              <line x1="45.8" y1="15.5" x2="47.5" y2="15.5" stroke="#B8860B" strokeWidth="0.8" />
            </g>

            {/* Focused, Intelligent Executive Eyes */}
            <circle cx="36.6" cy="15.9" r="0.85" fill="#0F172A" />
            <circle cx="43.4" cy="15.9" r="0.85" fill="#0F172A" />

            {/* Eyebrows */}
            <path d="M34.5 12.5 Q37 12 39 12.8" stroke="#1E293B" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M41 12.8 Q43 12 45.5 12.5" stroke="#1E293B" strokeWidth="0.9" strokeLinecap="round" />

            {/* Refined Nose Profile */}
            <path d="M39.6 17.5 L40.5 19.2 L39.8 19.7" stroke="#E29D82" strokeWidth="0.8" strokeLinecap="round" fill="none" />

            {/* Professional, Confident Hospitality Smile */}
            <path d="M37.5 21.8 Q40 23.5 42.5 21.8" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        </svg>

        {/* Ambient Traveler Halo */}
        <div className="traveler-halo" />
      </div>
    </div>
  );
};

export default TravelerCharacter;
