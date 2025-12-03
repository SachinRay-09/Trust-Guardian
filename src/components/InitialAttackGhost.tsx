import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const InitialAttackGhost = () => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  useEffect(() => {
    // Check if already shown in this session
    const hasShown = sessionStorage.getItem('attack_ghost_shown');
    if (hasShown || theme !== 'haunted') return;

    const positions: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];
    setPosition(positions[Math.floor(Math.random() * positions.length)]);
    
    // Show after 2 second delay
    const timeout = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem('attack_ghost_shown', 'true');
      
      // Auto-dismiss after 3 seconds if user doesn't click
      setTimeout(() => {
        setShow(false);
      }, 3000);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [theme]);

  const handleClick = () => {
    setShow(false);
  };

  if (!show || theme !== 'haunted') return null;

  const getAttackAnimation = () => {
    switch (position) {
      case 'top': return 'attack-from-top';
      case 'bottom': return 'attack-from-bottom';
      case 'left': return 'attack-from-left';
      case 'right': return 'attack-from-right';
    }
  };

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer"
      style={{ animation: 'fade-in 0.3s ease-out' }}
    >
      <div
        className="relative"
        style={{ animation: `${getAttackAnimation()} 0.5s ease-out` }}
      >
        <svg width="300" height="300" viewBox="0 0 300 300">
          <defs>
            <filter id="attack-glow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="ghost-gradient">
              <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
            </radialGradient>
          </defs>
          
          {/* Ghost body */}
          <ellipse cx="150" cy="150" rx="120" ry="140" fill="url(#ghost-gradient)" filter="url(#attack-glow)" />
          
          {/* Angry eyes */}
          <ellipse cx="110" cy="120" rx="25" ry="30" fill="#ff0000" filter="url(#attack-glow)">
            <animate attributeName="ry" values="30;35;30" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="190" cy="120" rx="25" ry="30" fill="#ff0000" filter="url(#attack-glow)">
            <animate attributeName="ry" values="30;35;30" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Angry eyebrows */}
          <path d="M85,100 L135,110" stroke="#8a0000" strokeWidth="6" strokeLinecap="round" />
          <path d="M215,100 L165,110" stroke="#8a0000" strokeWidth="6" strokeLinecap="round" />
          
          {/* Open mouth (attacking) */}
          <ellipse cx="150" cy="180" rx="40" ry="50" fill="#000000" />
          <path
            d="M110,180 Q150,220 190,180"
            fill="none"
            stroke="#ff0000"
            strokeWidth="4"
          />
          
          {/* Sharp teeth */}
          <path d="M120,180 L125,200 L130,180" fill="#ffffff" />
          <path d="M140,180 L145,205 L150,180" fill="#ffffff" />
          <path d="M160,180 L165,205 L170,180" fill="#ffffff" />
          <path d="M180,180 L175,200 L170,180" fill="#ffffff" />
          
          {/* Wispy tendrils */}
          <path
            d="M30,150 Q20,100 40,60 Q60,20 90,30"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="15"
            opacity="0.6"
            filter="blur(5px)"
          >
            <animate attributeName="d" 
              values="M30,150 Q20,100 40,60 Q60,20 90,30;M30,150 Q15,110 35,70 Q55,30 85,40;M30,150 Q20,100 40,60 Q60,20 90,30"
              dur="1s" repeatCount="indefinite" />
          </path>
          <path
            d="M270,150 Q280,100 260,60 Q240,20 210,30"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="15"
            opacity="0.6"
            filter="blur(5px)"
          >
            <animate attributeName="d"
              values="M270,150 Q280,100 260,60 Q240,20 210,30;M270,150 Q285,110 265,70 Q245,30 215,40;M270,150 Q280,100 260,60 Q240,20 210,30"
              dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 text-2xl font-bold animate-pulse">
            TAP TO BANISH!
          </div>
        </div>
      </div>
    </div>
  );
};
