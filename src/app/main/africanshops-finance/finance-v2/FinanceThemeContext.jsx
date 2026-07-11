import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { FINANCE_THEMES } from './financeThemeTokens';

const FinanceThemeContext = createContext(null);
const STORAGE_KEY = 'africanshops-finance-theme-mode';

export function FinanceThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggleMode, tokens: FINANCE_THEMES[mode] }), [mode, toggleMode]);

  return <FinanceThemeContext.Provider value={value}>{children}</FinanceThemeContext.Provider>;
}

export function useFinanceTheme() {
  const ctx = useContext(FinanceThemeContext);
  if (!ctx) throw new Error('useFinanceTheme must be used within FinanceThemeProvider');
  return ctx;
}
