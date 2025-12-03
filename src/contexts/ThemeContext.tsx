import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode } from '../types/database';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  hauntLevel: number;
  setHauntLevel: (level: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('haunted');
  const [hauntLevel, setHauntLevel] = useState(3);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-haunt-level', hauntLevel.toString());
  }, [theme, hauntLevel]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, hauntLevel, setHauntLevel }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
