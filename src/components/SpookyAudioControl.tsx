import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { spookyAudio } from '../utils/spookyAudio';
import { useTheme } from '../contexts/ThemeContext';

export const SpookyAudioControl = () => {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // Auto-start in haunted theme
  useEffect(() => {
    if (theme === 'haunted' && !isPlaying) {
      // Small delay to avoid autoplay restrictions
      const timer = setTimeout(() => {
        handleToggle();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (theme !== 'haunted' && isPlaying) {
      handleStop();
    }
  }, [theme]);

  const handleToggle = () => {
    if (isPlaying) {
      handleStop();
    } else {
      spookyAudio.start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    spookyAudio.stop();
    setIsPlaying(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    spookyAudio.setVolume(newVolume);
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 glass-morphism-strong rounded-xl p-4 border-2 smooth-transition ${
      theme === 'day'
        ? 'border-purple-300/50'
        : theme === 'night'
        ? 'border-blue-700/50'
        : 'border-red-900/50 glow-pulse-red'
    }`}>
      <div className="flex items-center gap-3">
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`p-2 rounded-lg smooth-transition button-press ${
            isPlaying
              ? theme === 'haunted'
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
          }`}
          title={isPlaying ? 'Stop Spooky Audio' : 'Play Spooky Audio'}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Volume Slider */}
        {isPlaying && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${
                  theme === 'haunted' ? '#ef4444' : '#8b5cf6'
                } 0%, ${
                  theme === 'haunted' ? '#ef4444' : '#8b5cf6'
                } ${(volume / 0.3) * 100}%, #4b5563 ${(volume / 0.3) * 100}%, #4b5563 100%)`,
              }}
            />
            <span className="text-xs text-gray-400 min-w-[3ch]">
              {Math.round((volume / 0.3) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className={`text-xs mt-2 ${
        theme === 'day' ? 'text-purple-600' :
        theme === 'night' ? 'text-blue-400' :
        'text-red-400'
      }`}>
        {isPlaying ? '🎵 Spooky Ambience' : '🔇 Audio Off'}
      </div>
    </div>
  );
};
