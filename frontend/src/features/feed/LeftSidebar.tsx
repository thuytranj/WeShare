import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  Settings,
  Plus,
  LogOut,
  Sun,
  Moon,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from '../../stores/i18n.store';
import { useThemeStore } from '../../stores/theme.store';
import { useAuthStore } from '../../stores/auth.store';
import { useLogout } from '../../hooks/useAuth';

export const LeftSidebar: React.FC = () => {
  const { t, locale, setLocale } = useTranslation();
  const { isDark, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const navItems = [
    { label: t('navFeed'), icon: Home, path: '/' },
    { label: t('navExplore'), icon: Compass, path: '/explore' },
    {
      label: t('navNotifications'),
      icon: Bell,
      path: '/notifications',
      badge: '4',
      badgeStyle: 'bg-[#FB7185]/15 text-[#E11D48] border border-[#FB7185]/30',
    },
    {
      label: t('navMessages'),
      icon: MessageSquare,
      path: '/messages',
      badge: '2',
      badgeStyle: 'bg-[#10B981]/15 text-[#059669] border border-[#10B981]/30',
    },
    { label: t('navBookmarks'), icon: Bookmark, path: '/bookmarks' },
  ];

  return (
    <aside className="w-[260px] h-[calc(100vh-2rem)] sticky top-4 hidden md:flex flex-col justify-between p-5 bg-white dark:bg-[#191D2A] rounded-3xl select-none shrink-0 border border-slate-200/70 dark:border-white/5 shadow-[0_10px_30px_rgba(150,162,185,0.28),0_2px_8px_rgba(150,162,185,0.16)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
      <div className="space-y-5">
        {/* Logo Header */}
        <Link to="/" className="flex items-center gap-3 px-1 pt-1 cursor-pointer">
          {/* WeShare 5-Node Star Squircle Badge */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shadow-[0_4px_14px_rgba(124,58,237,0.35)] shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" fill="currentColor" r="2.5" />
              <circle cx="12" cy="4" fill="currentColor" r="1.5" />
              <circle cx="19.5" cy="9.5" fill="currentColor" r="1.5" />
              <circle cx="17" cy="18" fill="currentColor" r="1.5" />
              <circle cx="7" cy="18" fill="currentColor" r="1.5" />
              <circle cx="4.5" cy="9.5" fill="currentColor" r="1.5" />
              <line x1="12" x2="12" y1="9.5" y2="5.5" />
              <line x1="14" x2="18.2" y1="10.5" y2="9.8" />
              <line x1="13.5" x2="16" y1="13.8" y2="16.8" />
              <line x1="10.5" x2="8" y1="13.8" y2="16.8" />
              <line x1="10" x2="5.8" y1="10.5" y2="9.8" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-[#0F172A] dark:text-white tracking-tight block">
              WeShare
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium block -mt-0.5">
              Mindful Social Network
            </span>
          </div>
        </Link>

        {/* Controls Capsule: Language + Light/Dark Mode Active */}
        <div className="flex items-center justify-between bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 rounded-full p-1.5 text-xs">
          {/* Language Pill */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                locale === 'en'
                  ? 'bg-[#8B70DF] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale('vi')}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                locale === 'vi'
                  ? 'bg-[#8B70DF] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium'
              }`}
            >
              VI
            </button>
          </div>

          {/* Theme Toggle Capsule */}
          <div className="flex items-center gap-1 pr-1">
            <button
              type="button"
              onClick={() => isDark && toggleTheme()}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                !isDark
                  ? 'bg-white shadow-[0_2px_6px_rgba(150,162,185,0.3)] text-[#8B70DF] border border-slate-200/60'
                  : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
              title="Light Mode"
            >
              <Sun size={14} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => !isDark && toggleTheme()}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-[#1C2130] shadow-[0_2px_6px_rgba(0,0,0,0.5)] text-[#A78BFA] border border-white/10'
                  : 'text-[#94A3B8] hover:text-[#64748B]'
              }`}
              title="Dark Mode"
            >
              <Moon size={14} className="fill-current" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation Items with Clean Inline SVGs */}
        <nav className="space-y-2.5 pt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 font-semibold text-[#7C3AED] dark:text-[#A78BFA]'
                    : 'bg-white dark:bg-[#191D2A] hover:bg-slate-50 dark:hover:bg-[#1C2130] text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium shadow-[0_2px_8px_rgba(150,162,185,0.1)] dark:shadow-none border border-slate-100 dark:border-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <item.icon
                      size={20}
                      className={
                        isActive
                          ? 'text-[#7C3AED] dark:text-[#A78BFA]'
                          : 'text-[#64748B] dark:text-slate-400'
                      }
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.badgeStyle}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Primary CTA: Create Post */}
        <button
          type="button"
          className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#8B70DF] to-[#7C3AED] text-white font-semibold text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_10px_24px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>{t('navCreatePost')}</span>
        </button>
      </div>

      {/* Bottom Profile Pod with SVG Settings Gear */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
        >
          <Settings size={16} className="text-[#64748B] dark:text-slate-400" />
          <span>{t('navSettings')}</span>
        </Link>

        <div className="flex items-center justify-between p-2 rounded-2xl bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={
                  user?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPh8p9DdL9uXAquc1kk-r5f3yC0XfXHdjEgb1QquJhSpgCV9j6cjbPmznv4vNmD2e1oc5p_Sk4zr_XsjvdTjUld60cCEp6b_vZKzTs3z6q9DeIzQUoZbe0mKc5d25So4KH08Re8ayzqRkLHW6vGwymiUnTASuMAG9b2qohFpVUojdDrTbXe_1dmOJMgZ0bVhxMQ9mIBhKmtNsS8eVRfLJfIrESvsHweS6nsla9MUFQQmAREHvrnmYHigSehPqXalKDFIDZwVHDV9RE'
                }
                alt={user?.fullName || 'Alex Morgan'}
                className="w-9 h-9 rounded-full object-cover border border-[#8B70DF]/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#131620]" />
            </div>

            <div className="leading-tight min-w-0">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1 truncate">
                {user?.fullName || 'Alex Morgan'}
                <CheckCircle size={12} className="text-[#7C3AED] shrink-0 fill-current" />
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400 block truncate">
                {user?.email ? `@${user.email.split('@')[0]}` : '@alexmorgan'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#E11D48] dark:hover:text-rose-400 transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
