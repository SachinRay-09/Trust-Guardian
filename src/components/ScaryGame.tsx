import { useState, useEffect, useRef } from 'react';
import { X, Skull, Ghost, Volume2, VolumeX, Trophy } from 'lucide-react';

interface ScaryGameProps {
  isOpen: boolean;
  onClose: () => void;
}

type Difficulty = 'easy' | 'moderate' | 'hard';
type Boss = {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  size: number;
  attacking: boolean;
};

export const ScaryGame = ({ isOpen, onClose }: ScaryGameProps) => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [ghosts, setGhosts] = useState<{ id: number; x: number; y: number; speed: number }[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [cursorEaten, setCursorEaten] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bossAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scary_game_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Game timer
  useEffect(() => {
    if (!gameStarted || !isOpen || cursorEaten) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isOpen, cursorEaten]);

  // Background music
  useEffect(() => {
    if (!isOpen || muted) {
      audioRef.current?.pause();
      bossAudioRef.current?.pause();
      return;
    }

    if (gameStarted && !boss) {
      // Normal game music (using Web Audio API to generate spooky tones)
      playBackgroundMusic();
    } else if (boss) {
      // Boss battle music
      playBossMusic();
    }

    return () => {
      audioRef.current?.pause();
      bossAudioRef.current?.pause();
    };
  }, [gameStarted, boss, isOpen, muted]);

  const playBackgroundMusic = () => {
    // Simple spooky background tone using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 110; // Low A note
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    if (!muted) {
      oscillator.start();
      setTimeout(() => oscillator.stop(), 100);
    }
  };

  const playBossMusic = () => {
    // Intense boss music tone
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 220; // Higher pitch for intensity
    oscillator.type = 'square';
    gainNode.gain.value = 0.15;
    
    if (!muted) {
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    }
  };

  // Ghost spawning with level progression
  useEffect(() => {
    if (!gameStarted || !isOpen || boss || cursorEaten) return;

    const spawnGhost = () => {
      const difficultyMultiplier = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.5 : 1;
      const levelMultiplier = 1 + (level * 0.1);
      
      const newGhost = {
        id: Date.now() + Math.random(),
        x: Math.random() * 85 + 5,
        y: Math.random() * 85 + 5,
        speed: (1 + Math.random() * 2) * difficultyMultiplier * levelMultiplier,
      };
      setGhosts(prev => [...prev, newGhost]);

      const lifetime = Math.max(2000 - (level * 50), 1000);
      setTimeout(() => {
        setGhosts(prev => prev.filter(g => g.id !== newGhost.id));
      }, lifetime);
    };

    const spawnRate = Math.max(800 - (level * 30), 300);
    const interval = setInterval(spawnGhost, spawnRate);
    return () => clearInterval(interval);
  }, [gameStarted, isOpen, level, difficulty, boss, cursorEaten]);

  // Boss spawning at milestone levels
  useEffect(() => {
    if (!gameStarted || boss || cursorEaten) return;

    const bossLevels = [5, 10, 20, 40, 50];
    if (bossLevels.includes(level)) {
      spawnBoss();
    }
  }, [level, gameStarted]);

  const spawnBoss = () => {
    const bossHealth = level * 3;
    const newBoss: Boss = {
      id: Date.now(),
      x: 50,
      y: 50,
      health: bossHealth,
      maxHealth: bossHealth,
      speed: 0.5 + (level * 0.05),
      size: 80 + (level * 2),
      attacking: false,
    };
    setBoss(newBoss);
    setGhosts([]); // Clear regular ghosts during boss fight
  };

  // Boss movement and attack
  useEffect(() => {
    if (!boss || !gameStarted || cursorEaten) return;

    const moveBoss = setInterval(() => {
      setBoss(prev => {
        if (!prev) return null;

        // Move towards cursor
        const dx = cursorPos.x - prev.x;
        const dy = cursorPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Boss caught the cursor!
          setCursorEaten(true);
          setTimeout(() => endGame(), 1000);
          return prev;
        }

        const newX = prev.x + (dx / distance) * prev.speed;
        const newY = prev.y + (dy / distance) * prev.speed;

        return {
          ...prev,
          x: Math.max(0, Math.min(95, newX)),
          y: Math.max(0, Math.min(95, newY)),
          attacking: distance < 15,
        };
      });
    }, 50);

    return () => clearInterval(moveBoss);
  }, [boss, gameStarted, cursorPos, cursorEaten]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cursorEaten) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleGhostClick = (ghostId: number) => {
    if (cursorEaten) return;
    setGhosts(prev => prev.filter(g => g.id !== ghostId));
    const points = 10 * level;
    setScore(prev => prev + points);
    playClickSound();
  };

  const handleBossClick = () => {
    if (!boss || cursorEaten) return;
    
    setBoss(prev => {
      if (!prev) return null;
      const newHealth = prev.health - 1;
      
      if (newHealth <= 0) {
        // Boss defeated!
        const bossPoints = level * 50;
        setScore(s => s + bossPoints);
        playVictorySound();
        
        // Progress to next level
        setTimeout(() => {
          setLevel(l => l + 1);
          setTimeLeft(t => t + 10); // Bonus time for beating boss
        }, 500);
        
        return null;
      }
      
      playHitSound();
      return { ...prev, health: newHealth };
    });
  };

  const playClickSound = () => {
    if (muted) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    setTimeout(() => oscillator.stop(), 100);
  };

  const playHitSound = () => {
    if (muted) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    gainNode.gain.value = 0.2;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    setTimeout(() => oscillator.stop(), 200);
  };

  const playVictorySound = () => {
    if (muted) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    [400, 500, 600].forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.15;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        setTimeout(() => oscillator.stop(), 300);
      }, i * 100);
    });
  };

  const startGame = () => {
    setShowDifficultySelect(false);
    setGameStarted(true);
    setScore(0);
    setLevel(1);
    setCursorEaten(false);
    setBoss(null);
    
    const baseTime = difficulty === 'easy' ? 45 : difficulty === 'hard' ? 20 : 30;
    setTimeLeft(baseTime);
    setGhosts([]);
  };

  const endGame = () => {
    setGameStarted(false);
    setCursorEaten(false);
    setBoss(null);
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('scary_game_high_score', score.toString());
    }
  };

  const resetGame = () => {
    setShowDifficultySelect(true);
    setScore(0);
    setLevel(1);
    setGameStarted(false);
    setCursorEaten(false);
    setBoss(null);
    setGhosts([]);
  };

  if (!isOpen) return null;

  const getScoreThreshold = () => {
    return level * 100;
  };

  const getBossName = () => {
    if (level === 5) return "SHADOW LURKER";
    if (level === 10) return "NIGHTMARE KING";
    if (level === 20) return "VOID REAPER";
    if (level === 40) return "CHAOS DEMON";
    if (level === 50) return "FINAL HORROR";
    return "BOSS";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-red-950 overflow-hidden game-cursor">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-4 flex items-center justify-between z-10 border-b-2 border-red-900">
          <div className="flex items-center gap-4">
            <Skull className="text-red-500 animate-pulse" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-red-500 glitch-text" data-text="GHOST HUNTER">
                GHOST HUNTER
              </h2>
              <p className="text-red-300 text-sm terminal-text">
                {boss ? `BOSS BATTLE: ${getBossName()}` : `Level ${level} - ${difficulty.toUpperCase()}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? (
                <VolumeX className="text-red-400" size={24} />
              ) : (
                <Volume2 className="text-red-400" size={24} />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <X className="text-red-400" size={28} />
            </button>
          </div>
        </div>

        {/* Game Stats */}
        {gameStarted && (
          <div className="absolute top-20 left-0 right-0 flex justify-around p-4 z-10">
            <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-red-900">
              <div className="text-red-400 text-sm">LEVEL</div>
              <div className="text-3xl font-bold text-red-500 terminal-text">{level}</div>
            </div>
            <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-yellow-900">
              <div className="text-yellow-400 text-sm">SCORE</div>
              <div className="text-3xl font-bold text-yellow-500 terminal-text">{score}</div>
            </div>
            <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-orange-900">
              <div className="text-orange-400 text-sm">TIME</div>
              <div className="text-3xl font-bold text-orange-500 terminal-text">{timeLeft}s</div>
            </div>
            <div className="bg-black/70 px-6 py-3 rounded-lg border-2 border-purple-900">
              <div className="text-purple-400 text-sm">HIGH SCORE</div>
              <div className="text-3xl font-bold text-purple-500 terminal-text">{highScore}</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div
          className="absolute inset-0 pt-32"
          onMouseMove={handleMouseMove}
        >
          {showDifficultySelect ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Trophy className="text-yellow-500 mb-8 animate-pulse" size={120} />
              <h3 className="text-5xl font-bold text-red-500 mb-4 glitch-text" data-text="SELECT DIFFICULTY">
                SELECT DIFFICULTY
              </h3>
              <p className="text-gray-400 mb-8 text-center max-w-2xl">
                Hunt ghosts through 50 levels! Face powerful bosses at levels 5, 10, 20, 40, and 50.
                Beware - bosses can eat your cursor and end your game!
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {(['easy', 'moderate', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-8 py-6 rounded-xl font-bold text-xl transition-all border-4 ${
                      difficulty === diff
                        ? 'bg-gradient-to-r from-red-900 to-red-700 text-white border-red-500 scale-110 shadow-2xl'
                        : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:border-red-900/50 hover:scale-105'
                    }`}
                  >
                    <div className="text-2xl mb-2">{diff.toUpperCase()}</div>
                    <div className="text-sm opacity-75">
                      {diff === 'easy' && '45s per level'}
                      {diff === 'moderate' && '30s per level'}
                      {diff === 'hard' && '20s per level'}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={startGame}
                className="px-16 py-5 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-bold text-2xl rounded-xl transition-all shadow-lg nightmare-pulse dripping-button"
              >
                START HUNTING
              </button>
              {highScore > 0 && (
                <div className="mt-6 text-purple-400 terminal-text text-xl">
                  🏆 High Score: {highScore}
                </div>
              )}
            </div>
          ) : !gameStarted ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Ghost className="text-red-500 mb-8 haunted-float" size={120} />
              <h3 className="text-4xl font-bold text-red-500 mb-4 glitch-text" data-text="READY TO HUNT?">
                READY TO HUNT?
              </h3>
              <button
                onClick={startGame}
                className="px-12 py-4 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg nightmare-pulse dripping-button"
              >
                START HUNTING
              </button>
            </div>
          ) : cursorEaten ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Skull className="text-red-500 mb-8 creepy-shake" size={150} />
              <h3 className="text-6xl font-bold text-red-500 mb-4 glitch-text possessed-text" data-text="CURSOR EATEN!">
                CURSOR EATEN!
              </h3>
              <p className="text-red-300 text-2xl mb-8">The boss consumed your soul...</p>
              <div className="text-4xl text-white mb-6">Final Score: {score}</div>
            </div>
          ) : (
            <>
              {/* Boss */}
              {boss && (
                <div
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${boss.x}%`,
                    top: `${boss.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <button
                    onClick={handleBossClick}
                    className={`relative ${boss.attacking ? 'creepy-shake' : 'haunted-float'}`}
                  >
                    <svg width={boss.size} height={boss.size} viewBox="0 0 100 100">
                      <defs>
                        <filter id="boss-glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <ellipse cx="50" cy="50" rx="40" ry="45" fill="#1a0000" opacity="0.95" filter="url(#boss-glow)" />
                      <circle cx="35" cy="40" r="8" fill="#ff0000" filter="url(#boss-glow)">
                        <animate attributeName="r" values="8;12;8" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="65" cy="40" r="8" fill="#ff0000" filter="url(#boss-glow)">
                        <animate attributeName="r" values="8;12;8" dur="0.5s" repeatCount="indefinite" />
                      </circle>
                      <path d="M30,60 Q50,75 70,60" fill="none" stroke="#ff0000" strokeWidth="3" />
                      {level >= 20 && (
                        <>
                          <path d="M20,30 L35,35" stroke="#8a0000" strokeWidth="3" />
                          <path d="M80,30 L65,35" stroke="#8a0000" strokeWidth="3" />
                        </>
                      )}
                    </svg>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-red-500 font-bold text-sm mb-1">{getBossName()}</div>
                      <div className="w-32 h-3 bg-gray-800 rounded-full border border-red-900">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full transition-all"
                          style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Regular Ghosts */}
              {!boss && ghosts.map(ghost => (
                <button
                  key={ghost.id}
                  onClick={() => handleGhostClick(ghost.id)}
                  className="absolute transition-all duration-200 hover:scale-125 pointer-events-auto"
                  style={{
                    left: `${ghost.x}%`,
                    top: `${ghost.y}%`,
                    animation: `haunted-float ${ghost.speed}s ease-in-out infinite`,
                  }}
                >
                  <Ghost className="text-purple-400 opacity-80 hover:opacity-100" size={48} />
                </button>
              ))}

              {/* Level Progress */}
              {!boss && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-6 py-3 rounded-lg border-2 border-yellow-900">
                  <div className="text-yellow-400 text-sm mb-1">NEXT LEVEL: {getScoreThreshold()} pts</div>
                  <div className="w-64 h-2 bg-gray-800 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full transition-all"
                      style={{ width: `${Math.min((score / getScoreThreshold()) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Game Over */}
          {!gameStarted && !showDifficultySelect && score > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-center">
                <Skull className="text-red-500 mx-auto mb-6 creepy-shake" size={100} />
                <h3 className="text-5xl font-bold text-red-500 mb-4 glitch-text" data-text="GAME OVER">
                  GAME OVER
                </h3>
                <div className="mb-6 space-y-2">
                  <div className="text-2xl text-gray-400">Level Reached</div>
                  <div className="text-5xl font-bold text-yellow-500 terminal-text">{level}</div>
                </div>
                <div className="mb-6 space-y-2">
                  <div className="text-2xl text-gray-400">Final Score</div>
                  <div className="text-6xl font-bold text-red-500 terminal-text">{score}</div>
                </div>
                {score > highScore && (
                  <div className="text-3xl text-purple-400 mb-6 animate-pulse">
                    🏆 NEW HIGH SCORE! 🏆
                  </div>
                )}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    CHANGE DIFFICULTY
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
