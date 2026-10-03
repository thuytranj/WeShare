import React, { useState } from 'react';
import { StoryBar } from './StoryBar';
import { CreatePostBox } from './CreatePostBox';
import { FilterTabs } from './FilterTabs';
import { PostCard, PostData } from './PostCard';
import { useAuthStore } from '../../stores/auth.store';

const initialPosts: PostData[] = [
  {
    id: 'post-1',
    author: {
      name: 'Chloe Bennett',
      handle: 'chloeb_design',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAOoR9A4xaKIuJfwFuRArIKyLaT1K0OJo775PzZ6hkopS0j2M5Ku8u0nWLOVbyRXFFN3XFnYuqbhduaDzLFWaz5hpLYs2SSLN2zsrkkNDJfrpY2enU1ATyLvXx15gx3FeK3cHrYKNvXXXEUkOelKICc0kMnAPoGR6Vh9SO3QlxnP998cMLjXjNAVfjJ3UxGr3sCxoYfkcBkuYgQ-7dVbGn_NJePRwG1er225N4MT6KfFbKu7tE4it_lYYR97wK5E6TyjZzzRrJA03Dx',
      isVerified: true,
      badge: {
        label: 'Mindful Creator',
        colorClass: 'text-[#059669] dark:text-emerald-400 bg-[#10B981]/15 border-[#10B981]/30',
      },
    },
    timestamp: '2 hours ago',
    content:
      'Exploring calm digital materiality today. There’s something deeply grounding about extruded soft surfaces and pastel light dispersion. We need digital spaces that lower cognitive friction and honor human presence. ✨☁️ #UIUX #DarkNeumorphism #PastelAesthetic',
    mediaUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUp61Ey4WVWFHgnsqwGw68hME8PN0BqXelTByZPZD597hPfGPGiExJC47Xa-HJaDltnuNmd_y3JR-2cYIEhi559C6_a06ewAaYf8xaLhwDSHYJzAlZAfZLDr-P8ny7XGe1SViZggPRYynCos4LqhhghhS5Hle9I3q5uwMEf7XnXKc2ejXY4QsB5Ls9sWbzEgmGmr3AgXScyGZKQ4z5cpBv8LTm4YfN0z8QwcZ-dfOzWAAhA_PkJlCRX-t2-XcoRjKjKfOyHuao92yi',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgNbiwQVTgJQoY4x_c6rBW5pYJsoc4jPLK3188uwfsEyqajs-PDTEXYvKTAO95aZSZRGcnzgJ6BgIQcrtGoVNGnO1DtMmz1LsBLypISce58x0MXTuxo19Y6F56gav362Rj_qpn809oK-XoQ_rNe3dgRfQPaob6TwryxMQa9GiVkHuz4vKd1pySQUnVZvGPYTvoDglfW3HUpP-krhDj0zSbNj0JZTokFZuLJ4Dq-kvdMu5mSk8D897AvTRQXp_cLwb1bm4Kd4nIhAz',
    ],
    likesCount: 428,
    commentsCount: 56,
    sharesCount: 18,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'post-2',
    author: {
      name: 'Elena Rostova',
      handle: 'elena_wellness',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBz6kTyXrX3RPRugAMLlHApUg96jQaABRKWM6uOnNcNLsqE7i1pQ05xdMuMrUeiEN3UhedT4Wr4gMSgN0aeGrLkbalLQuuL8CjDIFamAhMBYgYDNbj2A25LYkkR425ClP50gDv-ezLx_Fhh-wKspYq_fz2HgwegF34jgB83pnM8BojuAHEeDbavx4iSb0GIQ5dSWlhTO9nITHtePtMmBAbUvIzquDRJmTTTl7LsfAppUl_07MU8InvImYJfqSJJStdXJ0cqlpZMDo1k',
      isVerified: false,
      badge: {
        label: 'Meditation Teacher',
        colorClass: 'text-[#7C3AED] dark:text-[#A78BFA] bg-[#7C3AED]/15 border-[#7C3AED]/30',
      },
    },
    timestamp: '4 hours ago',
    quote: {
      text: '“You do not need to respond to the world at the speed of its acceleration. You are permitted to breathe, pause, and move at the cadence of stillness.”',
      category: 'Daily Mindful Resonance',
    },
    likesCount: 1204,
    commentsCount: 132,
    sharesCount: 89,
    isLiked: true,
    isBookmarked: true,
  },
];

export const FeedView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const [posts, setPosts] = useState<PostData[]>(initialPosts);

  const handlePostCreated = (content: string) => {
    const newPost: PostData = {
      id: `post-${Date.now()}`,
      author: {
        name: user?.fullName || 'Alex Morgan',
        handle: user?.email ? user.email.split('@')[0] : 'alexmorgan',
        avatar:
          user?.avatarUrl ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBMepDWHFswwDXbQgpvEhhUQ1RZXTtPCjFM0kjs8QibpSlmMWdyi_3-WqtFQdRGybJqgLfHUbcjLgouhrZ_OdZomEfPUr1WCiM6aA8cKbQXC6mGKF_D1_tk97QKuHW5D8sZP07LvCTH_R-0ze4e-WJ4I3ow0rrzujeTCoJetRSZsGDKU3VvXkWcP_GGzqeKghLcg485wFKLWB1tpFlh5IhpRa67vaAkicB2Uk6ubOTgSTenTJMCjTimeovHDdLnstDEOGiOkB9ZIAOy',
        isVerified: true,
      },
      timestamp: 'Just now',
      content,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isBookmarked: false,
    };

    setPosts([newPost, ...posts]);
  };

  return (
    <div className="space-y-6">
      {/* Story Tray */}
      <StoryBar />

      {/* Post Composer Pod */}
      <CreatePostBox onPostCreated={handlePostCreated} />

      {/* Feed Segmented Tabs & Filters */}
      <FilterTabs activeTab={activeTab} onChange={setActiveTab} />

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
