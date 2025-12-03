import { Ghost } from 'lucide-react';

interface GhostOverlayProps {
  hauntLevel: number;
  isVisible: boolean;
}

export function GhostOverlay({ hauntLevel, isVisible }: GhostOverlayProps) {
  if (!isVisible) return null;

  const opacity = Math.min(0.15 + (hauntLevel * 0.08), 0.5);
  const animationDuration = Math.max(2 - (hauntLevel * 0.2), 0.8);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      style={{ opacity }}
    >
      <div
        className="ghost-float"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        <Ghost className="text-purple-300 opacity-60" size={80} />
      </div>
      <div
        className="ghost-float delay-1"
        style={{
          animationDuration: `${animationDuration + 0.5}s`,
          left: '60%',
          animationDelay: '1s'
        }}
      >
        <Ghost className="text-cyan-300 opacity-40" size={60} />
      </div>
      <div
        className="ghost-float delay-2"
        style={{
          animationDuration: `${animationDuration + 1}s`,
          left: '80%',
          animationDelay: '2s'
        }}
      >
        <Ghost className="text-indigo-300 opacity-50" size={70} />
      </div>
    </div>
  );
}
