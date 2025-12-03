import { Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function HauntLevelSlider() {
  const { hauntLevel, setHauntLevel } = useTheme();

  const intensityLabels = [
    'Peaceful',
    'Subtle',
    'Moderate',
    'Intense',
    'Extreme',
    'Maximum'
  ];

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-purple-400" size={20} />
        <h3 className="text-lg font-bold text-white">Haunt Level</h3>
      </div>

      <div className="space-y-4">
        <input
          type="range"
          min="0"
          max="5"
          value={hauntLevel}
          onChange={(e) => setHauntLevel(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer haunt-slider"
        />

        <div className="flex justify-between text-xs text-gray-400">
          {intensityLabels.map((label, index) => (
            <span
              key={label}
              className={`transition-all ${
                index === hauntLevel
                  ? 'text-purple-400 font-bold scale-110'
                  : ''
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30">
            <span className="text-sm text-purple-300">
              Filter Strictness: <strong>{intensityLabels[hauntLevel]}</strong>
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Controls both detection sensitivity and visual spookiness
      </p>
    </div>
  );
}
