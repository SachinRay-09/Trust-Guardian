import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const PeekingGhost = () => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Only show in haunted theme
    if (theme !== 'haunted') return;

    const triggerPeek = () => {
      // Random position within viewport
      const top = Math.random() * (window.innerHeight - 200);
      const left = Math.random() * (window.innerWidth - 100);
      
      setPosition({ top, left });
      setShow(true);
      
      setTimeout(() => {
        setShow(false);
      }, 1500); // Show for 1.5 seconds
    };

    // Trigger every 2 minutes (120 seconds)
    const interval = setInterval(triggerPeek, 120000);
    
    // Initial trigger after 30 seconds
    const initialTimeout = setTimeout(triggerPeek, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [theme]);

  if (!show || theme !== 'haunted') return null;

  return (
    <div
      className="fixed z-[9997] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        animation: 'peek-ghost 1.5s ease-in-out',
      }}
    >
      <Ghost 
        className="text-purple-400 opacity-70" 
        size={48}
        style={{
          filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))',
        }}
      />
    </div>
  );
};
