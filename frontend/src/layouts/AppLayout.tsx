import React from 'react';
import { LeftSidebar } from '../features/feed/LeftSidebar';
import { RightRail } from '../features/feed/RightRail';
import { MobileBottomNav } from '../features/feed/MobileBottomNav';
import { WeShareLogo } from '../components/shared/WeShareLogo';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FC] dark:bg-[#10131C] text-[#1E293B] dark:text-slate-100 antialiased transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <WeShareLogo size="sm" showTagline={false} />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Layout Container (3-Column Grid matching Stitch ~1360px) */}
      <div className="w-full mx-auto px-2 py-4 flex gap-6 items-start justify-evenly">
        {/* Left Navigation Rail (~260px) */}
        <LeftSidebar />

        {/* Center Main Social Feed (~680px) */}
        <main className="flex-1 max-w-[680px] min-w-0 pb-20 md:pb-8">
          {children}
        </main>

        {/* Right Discovery Rail (~320px) */}
        <RightRail />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};
