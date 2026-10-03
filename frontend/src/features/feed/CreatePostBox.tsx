import React, { useState } from 'react';
import { Image, Smile, Users } from 'lucide-react';
import { useTranslation } from '../../stores/i18n.store';
import { useAuthStore } from '../../stores/auth.store';

interface CreatePostBoxProps {
  onPostCreated?: (content: string) => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated }) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onPostCreated?.(content);
      setContent('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-[#191D2A] rounded-3xl p-5 space-y-4 border border-slate-200/70 dark:border-white/5 shadow-[0_10px_30px_rgba(150,162,185,0.28),0_2px_8px_rgba(150,162,185,0.16)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Row */}
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBMepDWHFswwDXbQgpvEhhUQ1RZXTtPCjFM0kjs8QibpSlmMWdyi_3-WqtFQdRGybJqgLfHUbcjLgouhrZ_OdZomEfPUr1WCiM6aA8cKbQXC6mGKF_D1_tk97QKuHW5D8sZP07LvCTH_R-0ze4e-WJ4I3ow0rrzujeTCoJetRSZsGDKU3VvXkWcP_GGzqeKghLcg485wFKLWB1tpFlh5IhpRa67vaAkicB2Uk6ubOTgSTenTJMCjTimeovHDdLnstDEOGiOkB9ZIAOy'
            }
            alt={user?.fullName || 'Alex Morgan'}
            className="w-10 h-10 rounded-full object-cover border border-[#8B70DF]/30 shrink-0"
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('composerPlaceholder')}
              className="w-full bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 rounded-full px-4 py-2.5 text-sm text-[#0F172A] dark:text-slate-100 placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#8B70DF]/40 transition-all"
            />
          </div>
        </div>

        {/* Composer Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Photo/Video Action */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.15)] dark:shadow-none text-xs font-medium text-[#64748B] dark:text-slate-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-colors"
            >
              <Image size={15} className="text-[#7C3AED] dark:text-[#A78BFA]" />
              <span className="hidden sm:inline">{t('chipPhotoVideo')}</span>
            </button>

            {/* Mood Action */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.15)] dark:shadow-none text-xs font-medium text-[#64748B] dark:text-slate-400 hover:text-[#FBBF24] transition-colors"
            >
              <Smile size={15} className="text-[#FBBF24]" />
              <span className="hidden sm:inline">{t('chipMood')}</span>
            </button>

            {/* Tag Friends Action */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.15)] dark:shadow-none text-xs font-medium text-[#64748B] dark:text-slate-400 hover:text-[#10B981] transition-colors"
            >
              <Users size={15} className="text-[#10B981]" />
              <span className="hidden sm:inline">{t('chipTagFriends')}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`px-5 py-1.5 rounded-full bg-gradient-to-r from-[#8B70DF] to-[#7C3AED] text-white text-xs font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_16px_rgba(124,58,237,0.4)] transition-all cursor-pointer ${
              !content.trim() ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {isSubmitting ? '...' : t('btnPublish')}
          </button>
        </div>
      </form>
    </div>
  );
};
