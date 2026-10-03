import React from 'react';
import { WeShareLogo } from '../components/shared/WeShareLogo';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTranslation } from '../stores/i18n.store';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F7FC] dark:bg-[#10131C] px-4 py-6 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <WeShareLogo size="md" />

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Form Center Stage */}
      <main className="flex items-center justify-center my-8 w-full">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t('footerCopyright')}
        </p>
      </footer>
    </div>
  );
};
