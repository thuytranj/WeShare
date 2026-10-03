import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle,
  Globe,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { useCurrentUserProfile } from '../../hooks/useUser';
import { useThemeStore } from '../../stores/theme.store';
import { useTranslation } from '../../stores/i18n.store';

export interface SettingsHubProps {
  onNavigateToProfile?: () => void;
}

function formatMetricCount(count: number | undefined | null, defaultFallback: string): string {
  if (count === undefined || count === null) {
    return defaultFallback;
  }
  if (count >= 1000) {
    const inK = count / 1000;
    return `${inK % 1 === 0 ? inK.toFixed(0) : inK.toFixed(1)}k`;
  }
  return count.toString();
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const SettingsHub: React.FC<SettingsHubProps> = ({ onNavigateToProfile }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCurrentUserProfile();
  const { theme, setTheme, isDark } = useThemeStore();
  const { locale, setLocale, t } = useTranslation();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [avatarError, setAvatarError] = useState<boolean>(false);

  const handleNavigateToProfile = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
    navigate('/settings/profile');
  };

  const tabs = [
    { id: 'overview', label: t('settingsTitle') },
    { id: 'profile', label: t('settingsTabEditProfile') },
    { id: 'appearance', label: t('settingsTabAppearance') },
    { id: 'security', label: t('settingsTabSecurity') },
    { id: 'privacy', label: t('settingsTabPrivacy') },
    { id: 'notifications', label: t('settingsTabNotifications') },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'profile') {
      handleNavigateToProfile();
    } else {
      setActiveTab(tabId);
      if (tabId === 'appearance') {
        document.getElementById('section-appearance')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header & Breadcrumbs */}
      <header className="space-y-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-[#7C3AED] dark:text-[#A78BFA] font-semibold">
            {t('settingsTitle')}
          </span>
        </nav>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-white tracking-tight">
            {t('settingsTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
            {t('settingsSubtitle')}
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/70 dark:border-white/5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] dark:bg-[#A78BFA] dark:text-[#10131C]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* SECTION 1: Profile Overview Card */}
      <section
        id="section-profile"
        className="dark:bg-[#1E232B] dark:border-white/5 bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200/60 dark:border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('profileOverviewTitle')}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Active Profile
          </span>
        </div>

        {/* Profile Card Body */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {isLoading ? (
            <div className="flex items-center gap-5 animate-pulse w-full">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700/60 shrink-0" />
              <div className="space-y-2.5 flex-1">
                <div className="w-40 h-5 rounded bg-slate-200 dark:bg-slate-700/60" />
                <div className="w-24 h-4 rounded bg-slate-200 dark:bg-slate-700/40" />
                <div className="w-56 h-6 rounded-full bg-slate-200 dark:bg-slate-700/30" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {/* Avatar with Camera badge */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-br from-purple-500/40 via-transparent to-white/10 shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-slate-100 dark:bg-[#222736] overflow-hidden flex items-center justify-center">
                    {profile?.avatarUrl && !avatarError ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName || 'User'}
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-indigo-500/15 to-purple-500/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                          {getInitials(profile?.fullName)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNavigateToProfile}
                  title={t('btnUpdatePhoto')}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white dark:bg-[#181B24] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] border border-slate-200 dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Identity & Metrics */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile?.fullName || 'User'}
                  </h3>
                  {profile?.isEmailVerified && (
                    <CheckCircle
                      className="w-4 h-4 text-blue-500 dark:text-blue-400 fill-blue-500/20 dark:fill-blue-400/20 shrink-0"
                      aria-label="Verified"
                    />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  @{profile?.username || 'user'}
                </p>
                {profile?.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                {/* Stats Capsule: Followers • Following */}
                <div className="pt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#0B0E16] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                    <strong className="text-slate-900 dark:text-white font-semibold mr-1">
                      {formatMetricCount(profile?.followersCount, '1.4k')}
                    </strong>{' '}
                    {t('statFollowers')}
                    <span className="mx-2 text-slate-400 dark:text-slate-600">•</span>
                    <strong className="text-slate-900 dark:text-white font-semibold mr-1">
                      {formatMetricCount(profile?.followingCount, '520')}
                    </strong>{' '}
                    {t('statFollowing')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button: Edit Profile */}
          <button
            type="button"
            onClick={handleNavigateToProfile}
            className="px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] bg-white dark:bg-[#181B24] border border-slate-200/80 dark:border-white/10 shadow-sm hover:bg-slate-50 dark:hover:bg-[#222736] hover:text-purple-700 dark:hover:text-white transition-all shrink-0 group active:scale-[0.98] cursor-pointer"
          >
            <span>{t('btnEditProfile')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* SECTION 2: Appearance Theme Section */}
      <section
        id="section-appearance"
        className="dark:bg-[#1E232B] dark:border-white/5 bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md rounded-2xl p-6 relative transition-all duration-300"
      >
        {/* Section Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('appearanceTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              {t('appearanceSubtitle')}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#7C3AED] dark:text-[#A78BFA] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
            Theme: {theme === 'dark' || isDark ? t('themeDarkMode') : t('themeLightMode')}
          </span>
        </div>

        {/* 2 Selectable Cards Side-by-Side */}
        <div
          role="radiogroup"
          aria-label={t('appearanceTitle')}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6"
        >
          {/* Card 1: Light Mode */}
          <div
            role="radio"
            aria-checked={!isDark}
            tabIndex={0}
            onClick={() => setTheme('light')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTheme('light');
              }
            }}
            className={`rounded-2xl p-5 cursor-pointer relative group flex flex-col justify-between transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              !isDark
                ? 'ring-2 ring-indigo-500/80 dark:ring-indigo-400/80 border-indigo-500/40 bg-white dark:bg-[#181B24] shadow-md'
                : 'border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#181B24]/60 opacity-80 hover:opacity-100 hover:ring-1 hover:ring-indigo-500/40'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('themeLightMode')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('themeLightDesc')}
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                {!isDark ? (
                  <div className="w-5 h-5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.8)] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Visual Mini-Preview: Pastel Neumorphic Canvas */}
              <div className="rounded-xl p-3.5 mt-5 space-y-2.5 bg-[#F4F7FC] dark:bg-[#12151E] border border-slate-200/80 dark:border-white/5 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 shadow-sm" />
                  <div className="w-16 h-2 rounded bg-slate-300 dark:bg-slate-700/60" />
                  <div className="ml-auto w-8 h-2 rounded bg-slate-200 dark:bg-slate-700/40" />
                </div>
                <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700/40" />
                <div className="w-3/4 h-2 rounded bg-slate-200 dark:bg-slate-700/30" />
                <div className="rounded-lg p-2 flex items-center justify-center gap-2 mt-2 bg-white dark:bg-[#1C202D] shadow-sm border border-slate-100 dark:border-white/5">
                  <span className="w-2 h-2 rounded-full bg-purple-400/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between pt-4 mt-2 text-[11px] font-medium border-t border-slate-100 dark:border-white/5">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Soft Pastel
              </span>
              <span className={!isDark ? 'text-[#7C3AED] dark:text-[#A78BFA] font-semibold' : 'text-slate-400'}>
                {!isDark ? 'Active' : 'Click to switch'}
              </span>
            </div>
          </div>

          {/* Card 2: Dark Mode */}
          <div
            role="radio"
            aria-checked={isDark}
            tabIndex={0}
            onClick={() => setTheme('dark')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTheme('dark');
              }
            }}
            className={`rounded-2xl p-5 cursor-pointer relative group flex flex-col justify-between transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDark
                ? 'ring-2 ring-indigo-500/80 dark:ring-indigo-400/80 border-indigo-500/40 bg-white dark:bg-[#181B24] shadow-md'
                : 'border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#181B24]/60 opacity-80 hover:opacity-100 hover:ring-1 hover:ring-indigo-500/40'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center shrink-0">
                    <Moon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('themeDarkMode')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('themeDarkDesc')}
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                {isDark ? (
                  <div className="w-5 h-5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.8)] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Visual Mini-Preview: Deep Tactile Charcoal Canvas */}
              <div className="rounded-xl p-3.5 mt-5 space-y-2.5 bg-[#141722] border border-white/5 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#A78BFA] shadow-[0_0_6px_rgba(167,139,250,0.7)]" />
                  <div className="w-20 h-2 rounded bg-slate-600/60" />
                  <div className="ml-auto w-7 h-2 rounded bg-slate-700/60" />
                </div>
                <div className="w-full h-2 rounded bg-slate-700/50" />
                <div className="w-4/5 h-2 rounded bg-slate-700/40" />
                <div className="rounded-lg p-2 flex items-center justify-center gap-2 mt-2 bg-[#090B10] border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_4px_#a78bfa]" />
                  <span className="w-2 h-2 rounded-full bg-[#34D399] shadow-[0_0_4px_#34d399]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="flex items-center justify-between pt-4 mt-2 text-[11px] font-medium border-t border-slate-100 dark:border-white/5">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                Velvet Slate
              </span>
              <span className={isDark ? 'text-[#7C3AED] dark:text-[#A78BFA] font-semibold' : 'text-slate-400'}>
                {isDark ? 'Active' : 'Click to switch'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Language & Region Section */}
      <section
        id="section-language"
        className="dark:bg-[#1E232B] dark:border-white/5 bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-md rounded-2xl p-6 relative transition-all duration-300"
      >
        {/* Section Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {t('languageTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              {t('languageSubtitle')}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
            {locale === 'en' ? 'Auto-detected: English (US)' : 'Đã chọn: Tiếng Việt'}
          </span>
        </div>

        {/* 2 Selectable Cards Side-by-Side */}
        <div
          role="radiogroup"
          aria-label={t('languageTitle')}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6"
        >
          {/* Card 1: English (US) */}
          <div
            role="radio"
            aria-checked={locale === 'en'}
            tabIndex={0}
            onClick={() => setLocale('en')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLocale('en');
              }
            }}
            className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              locale === 'en'
                ? 'ring-2 ring-indigo-500/80 dark:ring-indigo-400/80 border-indigo-500/40 bg-white dark:bg-[#181B24] shadow-md'
                : 'border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#181B24]/60 opacity-75 hover:opacity-100 hover:ring-1 hover:ring-indigo-500/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center border border-purple-500/20 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('langEnglish')}
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-purple-500/15 text-[#7C3AED] dark:text-[#A78BFA] border border-purple-500/25">
                    DEFAULT
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('langEnglishDesc')}
                </p>
              </div>
            </div>

            {/* Radio Indicator */}
            {locale === 'en' ? (
              <div className="w-5 h-5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.8)] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 shrink-0" />
            )}
          </div>

          {/* Card 2: Tiếng Việt */}
          <div
            role="radio"
            aria-checked={locale === 'vi'}
            tabIndex={0}
            onClick={() => setLocale('vi')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLocale('vi');
              }
            }}
            className={`rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              locale === 'vi'
                ? 'ring-2 ring-indigo-500/80 dark:ring-indigo-400/80 border-indigo-500/40 bg-white dark:bg-[#181B24] shadow-md'
                : 'border-slate-200/80 dark:border-white/5 bg-white/60 dark:bg-[#181B24]/60 opacity-75 hover:opacity-100 hover:ring-1 hover:ring-indigo-500/40'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center border border-purple-500/20 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('langVietnamese')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('langVietnameseDesc')}
                </p>
              </div>
            </div>

            {/* Radio Indicator */}
            {locale === 'vi' ? (
              <div className="w-5 h-5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA] text-white dark:text-[#10131C] flex items-center justify-center shadow-[0_0_8px_rgba(167,139,250,0.8)] shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 shrink-0" />
            )}
          </div>
        </div>
      </section>

      {/* Bottom Ambient Real-Time Sync Bar */}
      <footer className="rounded-2xl px-5 py-3.5 flex items-center justify-between bg-white/80 dark:bg-[#1E232B] border border-slate-200/80 dark:border-white/5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {t('syncNotice')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide hidden sm:inline">
            Synchronized
          </span>
        </div>
      </footer>
    </div>
  );
};

export default SettingsHub;
