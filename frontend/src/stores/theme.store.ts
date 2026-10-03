import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'weshare-theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'light'; // default Light Mode as per specification
}

function resolveIsDark(theme: ThemeMode): boolean {
  if (typeof window === 'undefined') return false;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeClass(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getInitialTheme();
  const initialIsDark = resolveIsDark(initialTheme);
  applyThemeClass(initialIsDark);

  return {
    theme: initialTheme,
    isDark: initialIsDark,

    setTheme: (theme: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY, theme);
      const isDark = resolveIsDark(theme);
      applyThemeClass(isDark);
      set({ theme, isDark });
    },

    toggleTheme: () => {
      const current = get().isDark;
      const nextTheme: ThemeMode = current ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },
  };
});
