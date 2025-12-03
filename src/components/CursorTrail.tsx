import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
  id: string;
  x: number;
  y: number;
}

export const CursorTrail = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  useEffect(() => {
    let lastTime = Date.now();
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Throttle to every 50ms for performance
      if (now - lastTime < 50) return;
      lastTime = now;

      const newPoint: TrailPoint = {
        id: `trail-${now}`,
        x: e.clientX,
        y: e.clientY,
      };

      setTrail((prev) => [...prev.slice(-10), newPoint]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up old trail points
  useEffect(() => {
    if (trail.length === 0) return;

    const timer = setTimeout(() => {
      setTrail((prev) => prev.slice(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [trail]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }}>
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute"
            style={{
              left: point.x,
              top: point.y,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `rgba(138, 43, 226, ${0.6 - index * 0.05})`,
              boxShadow: `0 0 10px rgba(138, 43, 226, ${0.8 - index * 0.07})`,
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
