import React from 'react';
import { useI18nStore, Locale } from '../../stores/i18n.store';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { locale, setLocale } = useI18nStore();

  const handleSelect = (lang: Locale) => {
    if (locale !== lang) {
      setLocale(lang);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center p-1 rounded-full neu-inset ${className}`}
    >
      <button
        type="button"
        onClick={() => handleSelect('en')}
        className={`rounded-full transition-all duration-200 font-semibold ${
          isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        } ${
          locale === 'en'
            ? 'bg-gradient-to-r from-pastel-lavender to-pastel-violet text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => handleSelect('vi')}
        className={`rounded-full transition-all duration-200 font-semibold ${
          isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        } ${
          locale === 'vi'
            ? 'bg-gradient-to-r from-pastel-lavender to-pastel-violet text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        VI
      </button>
    </div>
  );
};
