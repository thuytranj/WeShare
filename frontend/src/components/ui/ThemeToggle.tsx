import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/theme.store';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { isDark, toggleTheme } = useThemeStore();
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center gap-1.5 p-1.5 rounded-full neu-inset hover:opacity-90 active:scale-95 transition-all duration-200 ${className}`}
    >
      <div
        className={`flex items-center justify-center rounded-full p-1 transition-all duration-300 ${
          !isDark
            ? 'bg-amber-400/20 text-amber-500 shadow-sm shadow-amber-400/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun size={iconSize} />
      </div>

      <div
        className={`flex items-center justify-center rounded-full p-1 transition-all duration-300 ${
          isDark
            ? 'bg-pastel-lavender/30 text-pastel-lavender shadow-sm shadow-pastel-lavender/40'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Moon size={iconSize} />
      </div>
    </button>
  );
};
