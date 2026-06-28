import React, { createContext, useContext, useState, useEffect } from 'react';

type CompanyType = "BGK" | "O2N";

interface ThemeContextType {
  activeCompany: CompanyType;
  setActiveCompany: (company: CompanyType) => void;
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
  const [activeCompany, setActiveCompanyState] = useState<CompanyType>(() => {
    return (localStorage.getItem('active_company') as CompanyType) || "BGK";
  });

  const [primaryColor, setPrimaryColorState] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColorState] = useState('#1e293b');
  const [accentColor, setAccentColorState] = useState('#f59e0b');
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme_mode') || 'light');

  // Sync colors when activeCompany changes
  useEffect(() => {
    const defaultPrimary = activeCompany === 'BGK' ? '#4f46e5' : '#e11d48';
    const defaultSecondary = activeCompany === 'BGK' ? '#1e293b' : '#0f172a';
    const defaultAccent = activeCompany === 'BGK' ? '#f59e0b' : '#3b82f6';

    const pColor = localStorage.getItem(`theme_primary_${activeCompany}`) || defaultPrimary;
    const sColor = localStorage.getItem(`theme_secondary_${activeCompany}`) || defaultSecondary;
    const aColor = localStorage.getItem(`theme_accent_${activeCompany}`) || defaultAccent;
    const lUrl = localStorage.getItem(`theme_logo_${activeCompany}`) || null;

    setPrimaryColorState(pColor);
    setSecondaryColorState(sColor);
    setAccentColorState(aColor);
    setLogoUrlState(lUrl);

    document.documentElement.style.setProperty('--theme-primary', pColor);
    document.documentElement.style.setProperty('--theme-secondary', sColor);
    document.documentElement.style.setProperty('--theme-accent', aColor);
  }, [activeCompany]);

  useEffect(() => {
    localStorage.setItem('theme_mode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const setActiveCompany = (comp: CompanyType) => {
    setActiveCompanyState(comp);
    localStorage.setItem('active_company', comp);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem(`theme_primary_${activeCompany}`, color);
    document.documentElement.style.setProperty('--theme-primary', color);
  };

  const setSecondaryColor = (color: string) => {
    setSecondaryColorState(color);
    localStorage.setItem(`theme_secondary_${activeCompany}`, color);
    document.documentElement.style.setProperty('--theme-secondary', color);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem(`theme_accent_${activeCompany}`, color);
    document.documentElement.style.setProperty('--theme-accent', color);
  };

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    if (url) {
      localStorage.setItem(`theme_logo_${activeCompany}`, url);
    } else {
      localStorage.removeItem(`theme_logo_${activeCompany}`);
    }
  };

  return (
    <ThemeContext.Provider value={{
      activeCompany, setActiveCompany,
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
