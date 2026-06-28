import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  themeMode: string;
  setThemeMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('theme_primary') || '#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState(() => localStorage.getItem('theme_secondary') || '#1e293b');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('theme_accent') || '#f59e0b');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem('theme_logo'));
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme_mode') || 'light');

  useEffect(() => {
    localStorage.setItem('theme_primary', primaryColor);
    document.documentElement.style.setProperty('--theme-primary', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('theme_secondary', secondaryColor);
    document.documentElement.style.setProperty('--theme-secondary', secondaryColor);
  }, [secondaryColor]);

  useEffect(() => {
    localStorage.setItem('theme_accent', accentColor);
    document.documentElement.style.setProperty('--theme-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('theme_logo', logoUrl);
    } else {
      localStorage.removeItem('theme_logo');
    }
  }, [logoUrl]);

  useEffect(() => {
    localStorage.setItem('theme_mode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{
      primaryColor, setPrimaryColor,
      secondaryColor, setSecondaryColor,
      accentColor, setAccentColor,
      logoUrl, setLogoUrl,
      themeMode, setThemeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
