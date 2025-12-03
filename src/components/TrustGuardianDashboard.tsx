import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { spookyAudio } from '../utils/spookyAudio';
import './haunted-theme.css';

// Types
interface TrustItem {
  id: string;
  content: string;
  type: 'email' | 'review' | 'comment';
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  threatType?: string;
  timestamp: Date;
  exorcised?: boolean;
}

interface ParticleProps {
  id: string;
  x: number;
  y: number;
  color: string;
}

// Particle Component
const Particle: React.FC<ParticleProps> = ({ id, x, y, color }) => {
  return (
    <motion.div
      key={id}
      className="particle"
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{
        x: x + (Math.random() - 0.5) * 200,
        y: y - Math.random() * 200,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
};

// Ghost Badge Component
const GhostBadge: React.FC<{ threatType?: string }> = ({ threatType }) => {
  return (
    <motion.div
      className="ghost-badge"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="ghost-emoji">👻</span>
      <span>
        {threatType === 'spam' && 'Possessed by Spam!'}
        {threatType === 'scam' && 'Scam Alert - Exorcise!'}
        {threatType === 'deepfake' && 'Deepfake Detected!'}
        {threatType === 'toxic' && 'Toxicity Hazard!'}
        {!threatType && 'Threat Detected!'}
      </span>
    </motion.div>
  );
};

// Trust Card Component
interface TrustCardProps {
  item: TrustItem;
  onExorcise: (id: string) => void;
  onParticles: (particles: ParticleProps[]) => void;
}

const TrustCard: React.FC<TrustCardProps> = ({ item, onExorcise, onParticles }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleExorcise = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Generate particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: centerX,
      y: centerY,
      color:
        item.threatLevel === 'dangerous'
          ? ['#ff1744', '#00ff00', '#ff00ff'][i % 3]
          : ['#00bfff', '#8a2be2'][i % 2],
    }));

    onParticles(particles);
    setTimeout(() => onExorcise(item.id), 100);
  };

  const isThreat = item.threatLevel !== 'safe';

  return (
    <motion.div
      className={`trust-card ${isThreat ? 'threat' : 'safe'}`}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Threat Indicator */}
      <div className={`indicator ${isThreat ? 'threat-indicator' : 'safe-indicator'}`} />

      {/* Type Badge */}
      <div className="type-badge">{item.type.toUpperCase()}</div>

      {/* Content */}
      <div className={`content ${isThreat ? 'possessed-text' : 'spectral-text'}`}>
        <p className="truncate max-lines-3">{item.content}</p>
      </div>

      {/* Threat Badge */}
      {isThreat && <GhostBadge threatType={item.threatType} />}

      {/* Actions */}
      <div className="actions">
        {isThreat ? (
          <motion.button
            className="exorcise-btn"
            onClick={handleExorcise}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 23, 68, 0.8)' }}
            whileTap={{ scale: 0.98 }}
          >
            ⚔️ EXORCISE
          </motion.button>
        ) : (
          <motion.button
            className="safe-btn"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 191, 228, 0.6)' }}
            whileTap={{ scale: 0.98 }}
          >
            ✓ SAFE
          </motion.button>
        )}
      </div>

      {/* Hover Glow */}
      <motion.div
        className="card-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Main Dashboard Component
export default function TrustGuardianDashboard() {
  const [trustItems, setTrustItems] = useState<TrustItem[]>([
    {
      id: '1',
      content: 'Click here to claim your FREE Bitcoin! Limited time only!!!',
      type: 'email',
      threatLevel: 'dangerous',
      threatType: 'scam',
      timestamp: new Date(),
    },
    {
      id: '2',
      content: 'This product is amazing! 5 stars, highly recommend to everyone!',
      type: 'review',
      threatLevel: 'safe',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      content: 'This is the worst thing ever! You are all idiots!!!',
      type: 'comment',
      threatLevel: 'suspicious',
      threatType: 'toxic',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '4',
      content: 'Verify your account immediately or it will be suspended...',
      type: 'email',
      threatLevel: 'dangerous',
      threatType: 'spam',
      timestamp: new Date(Date.now() - 10800000),
    },
  ]);

  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const [hauntLevel, setHauntLevel] = useState(5);
  const [analyzerInput, setAnalyzerInput] = useState('');

  // Start spooky audio when dashboard opens
  useEffect(() => {
    if (!spookyAudio.getIsPlaying()) {
      spookyAudio.start();
    }
    return () => {
      // Don't stop audio on unmount - let it continue
    };
  }, []);

  const handleExorcise = useCallback((id: string) => {
    setTrustItems((prev) => prev.filter((item) => item.id !== id));
    // Play exorcise sound effect
    spookyAudio.playExorciseSound();
  }, []);

  const handleAddParticles = useCallback((newParticles: ParticleProps[]) => {
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.slice(newParticles.length));
    }, 2000);
  }, []);

  const handleAnalyze = () => {
    if (analyzerInput.trim()) {
      const isThreat = Math.random() > 0.5;
      const newItem: TrustItem = {
        id: `item-${Date.now()}`,
        content: analyzerInput,
        type: 'comment',
        threatLevel: isThreat ? 'dangerous' : 'safe',
        threatType: ['spam', 'scam', 'deepfake', 'toxic'][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
      };
      setTrustItems((prev) => [newItem, ...prev]);
      setAnalyzerInput('');
      
      // Play threat sound if dangerous
      if (isThreat) {
        spookyAudio.playThreatSound();
      }
    }
  };

  const safeCount = trustItems.filter((i) => i.threatLevel === 'safe').length;
  const threatCount = trustItems.filter((i) => i.threatLevel !== 'safe').length;

  return (
    <div className="trust-guardian-container">
      {/* Background Effects */}
      <div className="spectral-bg" />
      <div className="fog-overlay" />

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="header-content">
          <div className="title-section">
            <motion.div
              className="ghost-icon"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👻
            </motion.div>
            <h1 className="spectral-title">Trust Guardian</h1>
            <p className="spectral-subtitle">The Resurrected Spam Filter</p>
          </div>

          <div className="haunt-control">
            <label>Haunt Level: {hauntLevel}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={hauntLevel}
              onChange={(e) => setHauntLevel(parseInt(e.target.value))}
              className="haunt-slider"
              style={{
                '--haunt-level': hauntLevel,
              } as React.CSSProperties}
            />
          </div>
        </div>
      </motion.header>

      {/* Stats */}
      <motion.div
        className="stats-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="stat-item safe">
          <span className="stat-label">Safe Content</span>
          <span className="stat-value">{safeCount}</span>
        </div>
        <div className="stat-item threat">
          <span className="stat-label">Threats Detected</span>
          <span className="stat-value">{threatCount}</span>
        </div>
      </motion.div>

      {/* Main Feed */}
      <div className="trust-feed">
        <AnimatePresence mode="popLayout">
          {trustItems.map((item) => (
            <TrustCard
              key={item.id}
              item={item}
              onExorcise={handleExorcise}
              onParticles={handleAddParticles}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Analyzer Widget */}
      <motion.div
        className="analyzer-widget"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="analyzer-header">
          <h3>🔮 Haunted Content Analyzer</h3>
        </div>
        <textarea
          className="analyzer-input"
          placeholder="Paste haunted content here for analysis..."
          value={analyzerInput}
          onChange={(e) => setAnalyzerInput(e.target.value)}
          rows={4}
        />
        <motion.button
          className="analyze-btn"
          onClick={handleAnalyze}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚡ ANALYZE
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="dashboard-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <p>Powered by Kiro Agents | Made for Kiroween Hackathon</p>
      </motion.footer>
    </div>
  );
}
