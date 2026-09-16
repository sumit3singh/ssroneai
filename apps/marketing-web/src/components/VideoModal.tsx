import React, { useState } from 'react';
import { Play, X, Volume2, VolumeX } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CINEMATIC_DEMO_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-graphs-and-data-31913-large.mp4";

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [videoChapter, setVideoChapter] = useState<string>('Overview');

  if (!isOpen) return null;

  return (
    <div className="cinema-modal-overlay" onClick={onClose}>
      <div className="theater-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header Bar */}
        <div style={{ padding: '1rem 1.5rem', background: '#1E293B', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Play size={16} color="#34D399" fill="#34D399" />
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
              SSR ONE AI • CINEMATIC SYSTEM TRAILER
            </span>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close Trailer"
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Video Container */}
        <div style={{ position: 'relative', width: '100%', height: '480px', background: '#000000' }}>
          <video 
            autoPlay 
            loop 
            muted={isVideoMuted}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            src={CINEMATIC_DEMO_VIDEO}
          />

          {/* In-Video Controls Overlay */}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.85)', padding: '0.85rem 1.35rem', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', fontWeight: 600 }}
              >
                {isVideoMuted ? <VolumeX size={18} color="#F87171" /> : <Volume2 size={18} color="#34D399" />}
                <span>{isVideoMuted ? 'Unmute Audio' : 'Audio Active'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Overview', 'POS', 'PMS', 'AI Copilot'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setVideoChapter(ch)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: videoChapter === ch ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
