import React from 'react';

interface ScrollTrackerProps {
  activeAct: number;
  scrollProgress: number;
  scrollToAct: (actNumber: number) => void;
}

const ACT_NODES = [
  { act: 1, label: 'Act 1: Cold Open' },
  { act: 2, label: 'Act 2: The Problem' },
  { act: 3, label: 'Act 3: The Reveal' },
  { act: 4, label: 'Act 4: Four Worlds' },
  { act: 5, label: 'Act 5: The Brain' },
  { act: 6, label: 'Act 6: The Offer' },
  { act: 7, label: 'Act 7: The Call' },
];

export const ScrollTracker: React.FC<ScrollTrackerProps> = ({
  activeAct,
  scrollProgress,
  scrollToAct,
}) => {
  return (
    <aside className="scroll-tracker" aria-label="Cinematic Timeline Scrubber">
      <div className="scroll-tracker-bar">
        <div className="scroll-tracker-fill" style={{ height: `${scrollProgress}%` }} />
      </div>

      {ACT_NODES.map((node) => (
        <button
          key={node.act}
          type="button"
          aria-label={node.label}
          className={`scroll-tracker-node ${activeAct === node.act ? 'active' : ''}`}
          onClick={() => scrollToAct(node.act)}
        >
          <span className="tooltip">{node.label}</span>
        </button>
      ))}
    </aside>
  );
};
