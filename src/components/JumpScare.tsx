import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'top' | 'bottom';

export const JumpScare = () => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<Position>('right');

  useEffect(() => {
    // Only show jump scares in haunted theme
    if (theme !== 'haunted') return;

    const triggerJumpScare = () => {
      const positions: Position[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right', 'top', 'bottom'];
      setPosition(positions[Math.floor(Math.random() * positions.length)]);
      setShow(true);
      
      setTimeout(() => {
        setShow(false);
      }, 800); // Longer peek duration
    };

    // Random interval between 15-30 seconds
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 15000;
      return setTimeout(triggerJumpScare, delay);
    };

    let timeout = scheduleNext();

    return () => clearTimeout(timeout);
  }, [show, theme]);

  if (!show || theme !== 'haunted') return null;

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9998,
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: '-50px', left: '-50px', animation: 'peek-from-top-left 0.8s ease-out' };
      case 'top-right':
        return { ...baseStyle, top: '-50px', right: '-50px', animation: 'peek-from-top-right 0.8s ease-out' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '-50px', left: '-50px', animation: 'peek-from-bottom-left 0.8s ease-out' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '-50px', right: '-50px', animation: 'peek-from-bottom-right 0.8s ease-out' };
      case 'left':
        return { ...baseStyle, top: '50%', left: '-100px', transform: 'translateY(-50%)', animation: 'peek-from-left 0.8s ease-out' };
      case 'right':
        return { ...baseStyle, top: '50%', right: '-100px', transform: 'translateY(-50%)', animation: 'peek-from-right 0.8s ease-out' };
      case 'top':
        return { ...baseStyle, top: '-100px', left: '50%', transform: 'translateX(-50%)', animation: 'peek-from-top 0.8s ease-out' };
      case 'bottom':
        return { ...baseStyle, bottom: '-100px', left: '50%', transform: 'translateX(-50%)', animation: 'peek-from-bottom 0.8s ease-out' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getPositionStyles()}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        {/* Shadow creature peeking */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Dark body */}
        <ellipse cx="75" cy="75" rx="60" ry="70" fill="#0a0a0a" opacity="0.95" filter="url(#glow)" />
        
        {/* Glowing red eyes */}
        <circle cx="55" cy="60" r="12" fill="#ff0000" filter="url(#glow)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="95" cy="60" r="12" fill="#ff0000" filter="url(#glow)">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="0.3s" repeatCount="indefinite" />
        </circle>
        
        {/* Creepy smile */}
        <path
          d="M45,85 Q75,105 105,85"
          fill="none"
          stroke="#8a0000"
          strokeWidth="3"
          opacity="0.8"
        />
        
        {/* Wispy edges */}
        <path
          d="M15,75 Q10,50 20,30 Q30,10 50,15"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="8"
          opacity="0.6"
          filter="blur(3px)"
        />
        <path
          d="M135,75 Q140,50 130,30 Q120,10 100,15"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="8"
          opacity="0.6"
          filter="blur(3px)"
        />
      </svg>
    </div>
  );
};
