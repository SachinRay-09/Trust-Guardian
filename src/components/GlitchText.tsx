import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  children: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const GlitchText = ({ children, intensity = 'medium', className = '' }: GlitchTextProps) => {
  const [glitching, setGlitching] = useState(false);

  const glitchInterval = {
    low: 5000,
    medium: 3000,
    high: 1000,
  }[intensity];

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [glitchInterval]);

  return (
    <div className={`relative ${className}`}>
      {/* Main text */}
      <motion.div
        animate={glitching ? {
          x: [0, -2, 2, -1, 1, 0],
          y: [0, 1, -1, 2, -2, 0],
        } : {}}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* Red glitch layer */}
      {glitching && (
        <motion.div
          className="absolute inset-0 text-red-500 opacity-70 mix-blend-screen"
          style={{
            clipPath: 'inset(0 0 0 0)',
          }}
          animate={{
            x: [-2, 2, -2],
            clipPath: [
              'inset(0 0 0 0)',
              'inset(20% 0 30% 0)',
              'inset(60% 0 10% 0)',
              'inset(0 0 0 0)',
            ],
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}

      {/* Cyan glitch layer */}
      {glitching && (
        <motion.div
          className="absolute inset-0 text-cyan-500 opacity-70 mix-blend-screen"
          style={{
            clipPath: 'inset(0 0 0 0)',
          }}
          animate={{
            x: [2, -2, 2],
            clipPath: [
              'inset(0 0 0 0)',
              'inset(40% 0 20% 0)',
              'inset(10% 0 50% 0)',
              'inset(0 0 0 0)',
            ],
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};
