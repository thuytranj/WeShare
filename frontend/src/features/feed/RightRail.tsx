import React, { useState } from 'react';
import { Search, TrendingUp, Check } from 'lucide-react';
import { useTranslation } from '../../stores/i18n.store';

interface SuggestedFriend {
  id: string;
  name: string;
  avatar: string;
  mutualCount: number;
}

const mockSuggested: SuggestedFriend[] = [
  {
    id: '1',
    name: 'Le Thanh Hang',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBX5eWOTbbAS_AD4NN4atwc5CbBkiDyjmvxIP22C7fC0UKUIMliKhUSPUaoDjwITyCoEf8snq1fROwU1OlrGeN9285MW2xSCbVOlHdDty1-rSfJcobmYUx4JU7kLv4nvdo_Y1qHDrOPKSFweRCRTqkRmMmLlgcUDqihK6tRBtz0NGH3r4sGeVv-BSx1lEEJjHTlgL2fnAyFN5uoANugliP721SDSrp6At8siiJ57JEx4D3l800PskwSzV9Zft1R3QB5OeWnzNATYdRE',
    mutualCount: 8,
  },
  {
    id: '2',
    name: 'Dang Quang Huy',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ1C2PrLKoMXI5KqBz0BQfT_8alD6lthl3txtd2mf1_TM_onXgiC1Pn8npHE2f4n-7rAF-CEG5Hlag-rqh1zKZwn--At58Lb7H7TNB3X30h5f73xEhbD4mf1bMHmLJXWeVZBZ72z0dg5IREcYBfawXDAJAewMS8N7IQ9GKjfuk7dga2u3k1kzHu8c4qKZLEEjtbyA0MogtkKz0FmWPT_-O07rfRQb4EuFiRSWI3TYZl5JSYnMovUFlUpwYbZmdmR4ePL8hqtoE9nFy',
    mutualCount: 14,
  },
  {
    id: '3',
    name: 'Vu Bao Tram',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7ZBMBX9KfzSoXyvhCk_biZDYsjr9yAISyv4-5068U7gElx6hQo_MjScb7igonXJV3FfEFpwIxZV4-rV_Qxm0qrNOmpf0z8F7fzDhG1d2ZrdTJeHskImcenjwbySxjvDdFzQeBEP9mSj3R0U_5RjQnFXRyFLl54AW2W6DWOAOW7JwefK4nBe8GHPWG55cDVHSoqHhFGaDv8nppFr7MdBBElOdF5aUbPU4TenHJ2B4el-YAEs0NdIm1oANWF1OctZHzQfgakINnZAPP',
    mutualCount: 3,
  },
];

const mockTrends = [
  {
    tag: '#DigitalArt',
    count: '18.4k reflections',
    category: 'Art',
    pillClass: 'bg-[#7C3AED]/15 text-[#7C3AED] dark:text-[#A78BFA]',
  },
  {
    tag: '#DesignTrends',
    count: '12.1k reflections',
    category: 'UX',
    pillClass: 'bg-[#10B981]/15 text-[#059669] dark:text-[#34D399]',
  },
  {
    tag: '#WeShareLive',
    count: '9.8k people joining',
    category: 'Live',
    pillClass: 'bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FB7185]',
  },
  {
    tag: '#SoftUIAesthetic',
    count: '7.3k reflections',
    category: 'Trend',
    pillClass: 'bg-[#7C3AED]/15 text-[#7C3AED] dark:text-[#A78BFA]',
  },
];

export const RightRail: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside className="w-[320px] space-y-6 shrink-0 hidden lg:block sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
      {/* Search Bar Capsule with SVG Magnifier */}
      <div className="bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 rounded-full px-4 py-2.5 flex items-center gap-3">
        <Search size={16} className="text-[#64748B] shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('navSearchPlaceholder')}
          className="bg-transparent text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] dark:placeholder:text-slate-500 outline-none w-full border-none p-0 focus:ring-0"
        />
      </div>

      {/* Suggested Friends Pod */}
      <div className="bg-white dark:bg-[#191D2A] rounded-3xl p-5 space-y-4 border border-slate-200/70 dark:border-white/5 shadow-[0_10px_30px_rgba(150,162,185,0.28),0_2px_8px_rgba(150,162,185,0.16)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
            {t('widgetSuggestedFriends')}
          </h3>
          <button
            type="button"
            className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
          >
            {t('widgetSeeAll')}
          </button>
        </div>

        <div className="space-y-3.5">
          {mockSuggested.map((friend) => {
            const isFollowing = followingMap[friend.id];

            return (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="leading-tight min-w-0">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-white block truncate">
                      {friend.name}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-slate-400 block truncate">
                      {friend.mutualCount} mutual friends
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollow(friend.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 shrink-0 ${
                    isFollowing
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/10 shadow-[0_2px_6px_rgba(150,162,185,0.18)] dark:shadow-none text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white'
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-1">
                      <Check size={12} />
                      {t('widgetFollowing')}
                    </span>
                  ) : (
                    t('widgetFollow')
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics Pod */}
      <div className="bg-white dark:bg-[#191D2A] rounded-3xl p-5 space-y-4 border border-slate-200/70 dark:border-white/5 shadow-[0_10px_30px_rgba(150,162,185,0.28),0_2px_8px_rgba(150,162,185,0.16)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#10B981]" />
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
            {t('widgetTrending')}
          </h3>
        </div>

        <div className="space-y-3">
          {mockTrends.map((trend, idx) => (
            <div
              key={idx}
              className="bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#8B70DF]/40 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block hover:text-[#7C3AED] transition-colors">
                  {trend.tag}
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                  {trend.count}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${trend.pillClass}`}
              >
                {trend.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Meta Links */}
      <footer className="text-[11px] text-[#64748B] dark:text-slate-500 space-y-2 px-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a className="hover:underline" href="#">
            {t('footerPrivacy')}
          </a>
          <span>•</span>
          <a className="hover:underline" href="#">
            {t('footerTerms')}
          </a>
          <span>•</span>
          <a className="hover:underline" href="#">
            Cookies
          </a>
          <span>•</span>
          <a className="hover:underline" href="#">
            Mindfulness Charter
          </a>
        </div>
        <p>{t('footerCopyright')}</p>
      </footer>
    </aside>
  );
};
