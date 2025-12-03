import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
}

interface AdvancedParticlesProps {
  trigger: number;
  x: number;
  y: number;
  color?: string;
  count?: number;
}

export const AdvancedParticles = ({ 
  trigger, 
  x, 
  y, 
  color = '#ff1744',
  count = 30 
}: AdvancedParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      newParticles.push({
        id: `particle-${trigger}-${i}`,
        x,
        y,
        color: i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#ff00ff' : color,
        angle,
        velocity: 100 + Math.random() * 100,
        size: 4 + Math.random() * 6,
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 1500);

    return () => clearTimeout(timer);
  }, [trigger, x, y, color, count]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            zIndex: 9999,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1, 
            scale: 1 
          }}
          animate={{
            x: Math.cos(particle.angle) * particle.velocity,
            y: Math.sin(particle.angle) * particle.velocity + 50, // gravity
            opacity: 0,
            scale: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </AnimatePresence>
  );
};
