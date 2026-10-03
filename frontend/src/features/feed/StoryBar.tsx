import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../stores/i18n.store';

interface Story {
  id: string;
  author: string;
  avatar: string;
  gradient: string;
}

const mockStories: Story[] = [
  {
    id: '1',
    author: 'Elena',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0dUC9W01_bAJtpO2ZQgsAeTC41QOgj1ARv8mnJ7nUBuOU5Tyal8j8CKKbIIH7Dkxg832OmMs911QzpeDXE_RffibPdN2CgMjaVBLbRRpq1AgR_ABsV_pfQAsRSITHxWX0Bg-BCl0z7i-6f2l8uRN-uDzR7LQU9Aw3kiT2OeTDQSMqeCWCdD2YaK9MBhxQnu-CgkHGpznc4jVinWnGno5L5XjvkX8hGW97XJn8x0JA88kNVuienWsJYQ7Z3VPEXOZApnRpjBunzWNO',
    gradient: 'from-[#7C3AED] to-[#10B981]',
  },
  {
    id: '2',
    author: 'Marcus',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDD5xiU3sLm1Rgg19F6Ii6ls2JHNp-4_fxJpqerhkVp0ywCOM8uo8Ujy45EFO-z1Lct5cpEK7X1C0guCgWRpld9AHFQ6xK3_jP5LDchnGeDYvdlHU8JY_okdE8glZwoDtKEWWL-DmboxsIqJsYo5Q4B67gaPN5PT0jvD7_HVJ56lixb3i1Cd6ranq480tV1HJCO61p8uVS0XpdCUmMfsnwWG1fyYAM7euBriaW0d-Ir9JsWEn9_zRght99q77nxX1qpof3Yjh2YHgaQ',
    gradient: 'from-[#7C3AED] to-[#A78BFA]',
  },
  {
    id: '3',
    author: 'Chloe',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBirCP6CYEUGG8lRwvHcUAZfF0e6iYN3fJdzbin9CT26xouiNKCzW3W3ZA7B2KNZCK_JVGIgQ7f_x163fza3yLowId0ois8HCjtWBbPQoDoRcmWPH6-1vABt_FYLj1nGuM1GAsMRIj9nYCJ-UCb7r9ar67YPHrf_Mky2V9F2-61q9nTE-4vGz6b7ASsSp8OICRuhIEM4QhFWIAJjBH6GFcqNH94RC42RpmLwQNnnE3HzKiVqFBPYowXr6nzSd0Ugl6B0ZrLmyYHjFWY',
    gradient: 'from-[#10B981] to-[#A78BFA]',
  },
  {
    id: '4',
    author: 'Liam',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFnSiWdSKmweud-56-m15lDRbztNrR-bNWs0-V8X5_Sg-hcCfx6ph_5YcqcCJpbDk8H9tbkLBeSZnFSAYcAHmm0f90L36klN1T2YxV-ZnPvf2bAL8XMrIU0EtPQMQKe4aaA8T-m_e8QK1G-Gm88KT_Z-daCeinawNc5rwJ8ksgZ-zcm5E-zuRl1FGUAoQuq9uaGTO9zALMm3nkBYxWSsbw4onpIPX5u4K416o2QaZoKCbJioazhichk5ok86ZVfJI36AtG0Pf57JlB',
    gradient: 'from-[#7C3AED] to-[#EC4899]',
  },
  {
    id: '5',
    author: 'Sophia',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpODDmKeSrl9o7WeRMogcey7EVegdJD5g8WHbbYCI_HZ2NIouMa6-bvBUHQjMrwAcZRmgVkd2B0Xq9picyq5_csdLkHXWfyP02JkH-XX3wBlG6cpT4QTn9yRWTqm6TyZMSzc_l96WHx_whi_wCPvUog_GYiQOAjzP2f6t73lQ1s0OvbQwKE4PHE3JiNWascxNbFYvDrIahlAKyxWPEFAinhUqTcih8FFEenEbmcgBizfj7jWkLNjLF7oTR8bPukfaV7slltkoP2ces',
    gradient: 'from-[#A78BFA] to-[#10B981]',
  },
];

export const StoryBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
      {/* Add Story Pod */}
      <div className="flex flex-col items-center gap-2 cursor-pointer group shrink-0">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-[#191D2A] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] group-hover:scale-105 transition-transform border border-slate-200/70 dark:border-white/5 shadow-[0_10px_24px_rgba(150,162,185,0.25),0_2px_8px_rgba(150,162,185,0.12)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
          <Plus size={24} className="stroke-[2.5]" />
        </div>
        <span className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 group-hover:text-[#0F172A] dark:group-hover:text-white transition-colors">
          {t('storyAdd')}
        </span>
      </div>

      {/* Friend Stories */}
      {mockStories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
        >
          <div
            className={`p-0.5 rounded-full bg-gradient-to-tr ${story.gradient} group-hover:scale-105 transition-transform shadow-[0_6px_16px_rgba(124,58,237,0.22)]`}
          >
            <img
              src={story.avatar}
              alt={story.author}
              className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#191D2A]"
              loading="lazy"
            />
          </div>
          <span className="text-[11px] font-medium text-[#64748B] dark:text-slate-400">
            {story.author}
          </span>
        </div>
      ))}
    </div>
  );
};
