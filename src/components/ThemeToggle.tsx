import { Sun, Moon, Ghost } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeMode } from '../types/database';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { mode: ThemeMode; icon: typeof Sun; label: string; activeColor: string; hoverColor: string }[] = [
    { mode: 'day', icon: Sun, label: 'Day', activeColor: 'from-purple-500 to-pink-500', hoverColor: 'hover:bg-purple-500/20' },
    { mode: 'night', icon: Moon, label: 'Night', activeColor: 'from-blue-500 to-cyan-500', hoverColor: 'hover:bg-blue-500/20' },
    { mode: 'haunted', icon: Ghost, label: 'Haunted', activeColor: 'from-red-600 to-red-800', hoverColor: 'hover:bg-red-500/20' },
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-full p-1 border-2 border-gray-700/50">
      {themes.map(({ mode, icon: Icon, label, activeColor, hoverColor }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
            ${theme === mode
              ? `bg-gradient-to-r ${activeColor} text-white shadow-lg scale-105`
              : `text-gray-400 hover:text-white ${hoverColor}`
            }
          `}
          title={label}
        >
          <Icon size={18} />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
