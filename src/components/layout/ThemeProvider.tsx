'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(t);
  localStorage.setItem('discova-theme', t);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('discova-theme') as Theme | null;
    const resolved: Theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    applyTheme(resolved);
    setThemeState(resolved);
  }, []);

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeContext.Provider>
  );
}
