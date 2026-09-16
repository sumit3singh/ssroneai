import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface RoadWayfindingProps {
  activeStage: number;
  scrollProgress: number;
  onJumpToStage: (stageNumber: number) => void;
}

const JOURNEY_STOPS = [
  { id: 1, label: 'Stage 1: Arrival', sub: 'SSR IT Gate' },
  { id: 2, label: 'Stage 2: Invitation', sub: 'Glowing Portal' },
  { id: 3, label: 'Stage 3: The Tour', sub: '4 Specialized Districts' },
  { id: 4, label: 'Stage 4: Connection', sub: 'Neural AI Core' },
  { id: 5, label: 'Stage 5: The Reward', sub: '₹12,000/yr Key' },
  { id: 6, label: 'Stage 6: The Landing', sub: 'Customer Plaza & Form' },
];

export const RoadWayfinding: React.FC<RoadWayfindingProps> = ({
  activeStage,
  scrollProgress,
  onJumpToStage,
}) => {
  return (
    <aside className="road-wayfinder" aria-label="Journey Wayfinding Road Map">
      <div className="wayfinder-header">
        <Compass size={14} className="wayfinder-compass-icon" />
        <span>Road Map</span>
      </div>

      {/* Stylized Mini Winding Path Track */}
      <div className="wayfinder-track-wrapper">
        <svg className="wayfinder-svg-track" viewBox="0 0 32 180" fill="none">
          {/* Faint Guide Road */}
          <path
            d="M16 8 C6 35, 26 60, 16 90 C6 120, 26 145, 16 172"
            stroke="hsl(220, 10%, 88%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Active Progress Traversed Road */}
          <path
            d="M16 8 C6 35, 26 60, 16 90 C6 120, 26 145, 16 172"
            stroke="var(--accent-emerald)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset={200 - (scrollProgress / 100) * 200}
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
        </svg>

        {/* Waypoint Milestone Stops */}
        <div className="wayfinder-stops-container">
          {JOURNEY_STOPS.map((stop) => {
            const isActive = activeStage === stop.id;
            const isPassed = activeStage > stop.id;

            return (
              <button
                key={stop.id}
                type="button"
                className={`wayfinder-stop-dot ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => onJumpToStage(stop.id)}
                aria-label={`${stop.label} - ${stop.sub}`}
              >
                <div className="dot-inner">
                  {isActive ? <Sparkles size={8} /> : <span>{stop.id}</span>}
                </div>

                {/* Floating Tooltip Label */}
                <div className="wayfinder-tooltip">
                  <span className="tooltip-title">{stop.label}</span>
                  <span className="tooltip-sub">{stop.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wayfinder-progress-badge">
        <span>{Math.round(scrollProgress)}%</span>
      </div>
    </aside>
  );
};

export default RoadWayfinding;
