import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Pin,
  Maximize2,
  Minimize2,
  ShieldCheck,
  MousePointer,
  Compass
} from 'lucide-react';
import { TravelerCharacter, TourGuideRole } from './TravelerCharacter';
import { sound } from '../utils/soundEngine';

interface TourGuideHUDProps {
  role: TourGuideRole;
  activeStage: number;
  activeDistrict: string;
  onJumpToStage: (stage: number) => void;
  onJumpToDistrict: (districtId: string) => void;
  onOpenDemoModal: () => void;
}

interface TourGuideContent {
  title: string;
  badge: string;
  memo: string;
  stat: string;
}

const TOUR_MEMO_DATA: Record<TourGuideRole, TourGuideContent> = {
  host: {
    title: 'Executive Welcoming Host',
    badge: 'STAGE 1 • CITADEL GATES',
    memo: 'Welcome to SSR IT INDUSTRY. Step forward to explore how SSR One AI replaces fragmented software with one PostgreSQL single source of truth.',
    stat: 'Pure Database SSOT • Zero Vendor Lock-in',
  },
  portal: {
    title: 'Systems Architect & Keymaster',
    badge: 'STAGE 2 • PORTAL THRESHOLD',
    memo: 'Step across the threshold. All modules—POS, PMS, PG, and Retail—share a single database kernel with zero data drift.',
    stat: 'PostgreSQL Row-Level Security (RLS)',
  },
  restaurant: {
    title: 'Hospitality Operations Director',
    badge: 'DISTRICT 1 • RESTAURANT POS',
    memo: 'In high-volume dining, every second counts. Touch POS orders dispatch to kitchen thermal printers in under 2ms with split checks.',
    stat: '< 2ms KOT Latency • 99.99% Offline Sync',
  },
  hotel: {
    title: 'Hotel General Manager & Concierge',
    badge: 'DISTRICT 2 • HOTEL PMS',
    memo: 'Visual room occupancy grid with automated night audits, corporate tariffs, and express digital check-ins with zero double-bookings.',
    stat: '0% Room Overbooking • Automated Night Audit',
  },
  pg: {
    title: 'Residential Operations Director',
    badge: 'DISTRICT 3 • STUDENT PG',
    memo: 'Managing 500+ student beds? Automated WhatsApp payment links, biometric gate logs, and digital KYC contracts protect your bottom line.',
    stat: '100% Rent Ledger Accuracy • Instant WhatsApp Links',
  },
  retail: {
    title: 'Chief Supply Chain & Retail Director',
    badge: 'DISTRICT 4 • RETAIL ERP',
    memo: 'Scan 10,000+ SKUs with zero lag. Inter-branch stock transfers and GSTR-1 audit-ready summaries update automatically across all stores.',
    stat: '10,000+ SKU Scans/sec • 1-Click GST Filing',
  },
  ai: {
    title: 'Principal AI Platform Architect',
    badge: 'STAGE 4 • NEURAL CORE',
    memo: 'Query business metrics in plain English or Hindi. Our autonomous RAG AI Copilot retrieves live insights directly from PostgreSQL in seconds.',
    stat: 'Sub-second RAG Retrieval • Zero Hallucinations',
  },
  reward: {
    title: 'Senior Commercial Licensing Director',
    badge: 'STAGE 5 • MASTER LICENSE',
    memo: 'Flat ₹12,000 per year. No per-user taxes, no room count penalties, no hidden percentage cuts. Complete enterprise ownership.',
    stat: '₹12,000 / Year Flat • Unlimited Outlets & Staff',
  },
  concierge: {
    title: 'VIP Solutions Concierge',
    badge: 'STAGE 6 • BOOKING PLAZA',
    memo: 'You have walked our citadel. Now let our engineering leadership configure a personalized SSR One AI deployment for your outlets.',
    stat: 'Personalized Setup • 24/7 Dedicated Support',
  },
};

export const TourGuideHUD: React.FC<TourGuideHUDProps> = ({
  role,
  activeStage,
  activeDistrict,
  onJumpToStage,
  onJumpToDistrict,
  onOpenDemoModal,
}) => {
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState<string | null>(null);
  const [isMouseMoving, setIsMouseMoving] = useState<boolean>(false);
  const [hasMouse, setHasMouse] = useState<boolean>(true);

  // Position state with lerp physics
  const mousePosRef = useRef({ x: 180, y: 320 });
  const currentPosRef = useRef({ x: 180, y: 320 });
  const moveTimerRef = useRef<any>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);

  const content = TOUR_MEMO_DATA[role] || TOUR_MEMO_DATA.host;

  // Detect Touch / Mobile Devices
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768) {
      setHasMouse(false);
      setIsDocked(true);
    }
  }, []);

  // Smooth Mouse Follower Engine with Organic Inertia Physics
  useEffect(() => {
    if (isDocked || !hasMouse) return;

    let animFrameId: number;
    let lastX = mousePosRef.current.x;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      // Walking locomotion active while moving mouse
      setIsMouseMoving(true);
      clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 180);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest('button, a, input, .pos-item-button, .roi-slider, .credential-chip');
      if (interactive) {
        const text = interactive.getAttribute('aria-label') || interactive.textContent || 'Click to interact';
        setIsHoveringInteractive(text.slice(0, 32).trim());
      } else {
        setIsHoveringInteractive(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    // 60FPS Inertia Spring Lerp Loop
    const updatePhysics = () => {
      const target = mousePosRef.current;
      const current = currentPosRef.current;

      // Damped Spring Lerp (factor 0.13)
      current.x += (target.x - current.x) * 0.13;
      current.y += (target.y - current.y) * 0.13;

      if (followerRef.current) {
        const noteWidth = 330;
        const noteHeight = 115;

        // Smart edge flipping so it never clips off-screen
        const flipX = current.x + noteWidth + 24 > window.innerWidth;
        const flipY = current.y + noteHeight + 24 > window.innerHeight;

        const renderX = flipX ? current.x - noteWidth - 20 : current.x + 24;
        const renderY = flipY ? current.y - noteHeight - 16 : current.y + 18;

        // Subtle organic tilt based on velocity delta
        const deltaX = current.x - lastX;
        lastX = current.x;
        const tilt = Math.max(-5, Math.min(5, deltaX * 0.35));

        followerRef.current.style.transform = `translate3d(${renderX}px, ${renderY}px, 0) rotate(${tilt - 1.2}deg)`;
      }

      animFrameId = requestAnimationFrame(updatePhysics);
    };

    animFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrameId);
    };
  }, [isDocked, hasMouse]);

  return (
    <>
      {/* ── Dynamic Floating Cursor Sticky Note (Active with Mouse) ── */}
      {!isDocked && hasMouse && (
        <div 
          ref={followerRef} 
          className="cursor-tour-sticky-note"
          aria-hidden="true"
        >
          {/* Golden Brass Top Sticky Tape / Clip */}
          <div className="sticky-brass-clip" />

          <div className="sticky-note-content-wrapper">
            {/* Left: The Mini Animated Tour Director Avatar */}
            <div className="sticky-avatar-col">
              <TravelerCharacter 
                size="sm" 
                role={role} 
                isIdle={!isMouseMoving} 
              />
            </div>

            {/* Right: The Dynamic Memorandum & Guidance */}
            <div className="sticky-memo-col">
              <div className="sticky-top-row">
                <span className="sticky-memo-pill">
                  <span className="live-memo-dot" />
                  {content.badge}
                </span>
                <span className="sticky-role-title">{content.title}</span>
              </div>

              {/* Dynamic Contextual Text: Hover Micro-tip vs Stage Memo */}
              {isHoveringInteractive ? (
                <div className="sticky-interactive-tip">
                  <MousePointer size={11} className="tip-cursor-icon" />
                  <span>Action: {isHoveringInteractive}</span>
                </div>
              ) : (
                <p className="sticky-memo-text">"{content.memo}"</p>
              )}

              <div className="sticky-bottom-stat">
                <ShieldCheck size={11} color="var(--accent-emerald)" />
                <span>{content.stat}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Discreet Dock / Undock Controls & Mobile Dock Bar ── */}
      <aside 
        className={`tour-dock-widget ${isDocked ? 'docked-active' : 'floating-active'}`}
        aria-label="Executive Tour Director Controls"
      >
        {isDocked ? (
          /* Docked Bar at Bottom-Left */
          <div className="tour-docked-card">
            <div className="sticky-brass-clip" />

            <div className="docked-main-row">
              <div className="docked-avatar-box">
                <TravelerCharacter size="sm" role={role} isIdle={false} />
              </div>

              <div className="docked-info-col">
                <div className="docked-tag-row">
                  <span className="sticky-memo-pill">
                    <span className="live-memo-dot" />
                    {content.badge}
                  </span>
                  <span className="docked-role-name">{content.title}</span>
                </div>
                <p className="docked-memo-p">"{content.memo}"</p>
              </div>

              <div className="docked-actions-col">
                {hasMouse && (
                  <button
                    type="button"
                    className="btn-dock-icon"
                    onClick={() => {
                      sound.playClick();
                      setIsDocked(false);
                    }}
                    title="Detach to float with mouse cursor"
                  >
                    <Maximize2 size={13} />
                    <span>Float</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-dock-demo"
                  onClick={() => {
                    sound.playClick();
                    onOpenDemoModal();
                  }}
                >
                  <Sparkles size={12} />
                  <span>Demo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Subtle Pin-to-Corner Toggle Button */
          hasMouse && (
            <button
              type="button"
              className="btn-pin-guide-corner"
              onClick={() => {
                sound.playClick();
                setIsDocked(true);
              }}
              title="Pin Tour Guide to corner"
              aria-label="Pin Tour Guide to corner"
            >
              <Pin size={13} />
              <span>Pin Guide</span>
            </button>
          )
        )}
      </aside>
    </>
  );
};

export default TourGuideHUD;
