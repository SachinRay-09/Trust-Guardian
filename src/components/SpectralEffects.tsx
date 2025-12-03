import { useEffect, useState } from 'react';
import { Ghost, Skull, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { SteeringConfigManager } from '../lib/steeringConfig';

interface ParticleProps {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface GhostSprite {
  id: number;
  x: number;
  y: number;
  type: 'ghost' | 'skull' | 'eye';
  scale: number;
}

export const SpectralEffects = () => {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [ghosts, setGhosts] = useState<GhostSprite[]>([]);
  const [vaporTrails, setVaporTrails] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (theme !== 'haunted') return;

    const config = SteeringConfigManager.getConfig();
    const hauntingLevel = config.visual_haunting;
    const spawnRate = Math.max(3000, 10000 - hauntingLevel * 800);

    // Spawn ghost sprites
    const ghostInterval = setInterval(() => {
      const types: ('ghost' | 'skull' | 'eye')[] = ['ghost', 'skull', 'eye'];
      const newGhost: GhostSprite = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: types[Math.floor(Math.random() * types.length)],
        scale: 0.5 + Math.random() * 0.8,
      };
      setGhosts(prev => [...prev, newGhost]);

      setTimeout(() => {
        setGhosts(prev => prev.filter(g => g.id !== newGhost.id));
      }, 6000);
    }, spawnRate);

    // Spawn vapor trails
    const vaporInterval = setInterval(() => {
      const newTrail = {
        id: Date.now(),
        x: Math.random() * 100,
        delay: Math.random() * 2,
      };
      setVaporTrails(prev => [...prev, newTrail]);

      setTimeout(() => {
        setVaporTrails(prev => prev.filter(t => t.id !== newTrail.id));
      }, 8000);
    }, 4000);

    // Ambient particle spawner
    const particleInterval = setInterval(() => {
      const newParticles: ParticleProps[] = [];
      const count = Math.floor(hauntingLevel / 2);
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          color: ['#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)],
          size: 2 + Math.random() * 4,
          angle: Math.random() * Math.PI * 2,
          speed: 1 + Math.random() * 2,
        });
      }
      
      setParticles(prev => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 3000);
    }, 2000);

    return () => {
      clearInterval(ghostInterval);
      clearInterval(vaporInterval);
      clearInterval(particleInterval);
    };
  }, [theme]);

  if (theme !== 'haunted') return null;

  return (
    <>
      {/* Vapor Trails */}
      {vaporTrails.map(trail => (
        <div
          key={trail.id}
          className="fixed pointer-events-none z-0 animate-vapor-rise"
          style={{
            left: `${trail.x}%`,
            bottom: '-10%',
            animationDelay: `${trail.delay}s`,
          }}
        >
          <div className="w-1 h-screen bg-gradient-to-t from-purple-500/30 via-cyan-400/20 to-transparent blur-xl" />
        </div>
      ))}

      {/* Ghost Sprites */}
      {ghosts.map(ghost => (
        <div
          key={ghost.id}
          className="fixed pointer-events-none z-0 animate-ghost-float"
          style={{
            left: `${ghost.x}%`,
            top: `${ghost.y}%`,
            transform: `scale(${ghost.scale})`,
          }}
        >
          {ghost.type === 'ghost' && (
            <Ghost className="text-purple-400/50 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" size={40} />
          )}
          {ghost.type === 'skull' && (
            <Skull className="text-red-500/50 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse" size={36} />
          )}
          {ghost.type === 'eye' && (
            <Eye className="text-cyan-400/50 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-blink" size={32} />
          )}
        </div>
      ))}

      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-0 animate-particle-float"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            borderRadius: '50%',
            '--angle': `${particle.angle}rad`,
            '--speed': particle.speed,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};

export const VaporTrail = ({ active }: { active: boolean }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-vapor-sweep" 
           style={{ top: '20%' }} />
      <div className="absolute w-full h-2 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent animate-vapor-sweep" 
           style={{ top: '60%', animationDelay: '1s' }} />
    </div>
  );
};

export const ThreatGlow = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
  const glowColors = {
    low: 'shadow-[0_0_30px_rgba(34,197,94,0.4)] border-green-500/30',
    medium: 'shadow-[0_0_40px_rgba(249,115,22,0.5)] border-orange-500/40 animate-pulse',
    high: 'shadow-[0_0_50px_rgba(239,68,68,0.6)] border-red-500/50 animate-pulse',
  }[level];

  return <div className={`absolute inset-0 rounded-xl ${glowColors} pointer-events-none`} />;
};

export const ParticleBurst = ({ x, y, color, count = 20 }: { x: number; y: number; color: string; count?: number }) => {
  const [particles, setParticles] = useState<ParticleProps[]>([]);

  useEffect(() => {
    const newParticles: ParticleProps[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x,
        y,
        color,
        size: 3 + Math.random() * 5,
        angle: (Math.PI * 2 * i) / count,
        speed: 2 + Math.random() * 3,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 1000);
    return () => clearTimeout(timer);
  }, [x, y, color, count]);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-50 animate-particle-burst"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            borderRadius: '50%',
            '--burst-angle': `${particle.angle}rad`,
            '--burst-speed': `${particle.speed * 50}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
};
