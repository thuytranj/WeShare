import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../../stores/i18n.store';

interface FilterTabsProps {
  activeTab: 'forYou' | 'following';
  onChange: (tab: 'forYou' | 'following') => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ activeTab, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-1">
      {/* Segmented Pill Capsule */}
      <div className="flex items-center gap-2 bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 p-1 rounded-full text-xs font-semibold">
        <button
          type="button"
          onClick={() => onChange('forYou')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'forYou'
              ? 'bg-white dark:bg-[#191D2A] text-[#7C3AED] dark:text-[#A78BFA] shadow-[0_2px_6px_rgba(150,162,185,0.2)] dark:shadow-none'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          {activeTab === 'forYou' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA]" />
          )}
          <span>{t('tabForYou')}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('following')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'following'
              ? 'bg-white dark:bg-[#191D2A] text-[#7C3AED] dark:text-[#A78BFA] shadow-[0_2px_6px_rgba(150,162,185,0.2)] dark:shadow-none'
              : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
          }`}
        >
          {activeTab === 'following' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] dark:bg-[#A78BFA]" />
          )}
          <span>{t('tabFollowing')}</span>
        </button>
      </div>

      {/* Feed Preferences Button */}
      <button
        type="button"
        title="Feed Preferences"
        className="p-2 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.2)] dark:shadow-none text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
      >
        <SlidersHorizontal size={15} />
      </button>
    </div>
  );
};
