import React, { useState } from 'react';
import { Heart, MessageSquare, Repeat2, Bookmark, MoreHorizontal, CheckCircle } from 'lucide-react';

export interface PostData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
    badge?: {
      label: string;
      colorClass: string;
    };
  };
  timestamp: string;
  content?: string;
  mediaUrls?: string[];
  quote?: {
    text: string;
    category?: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostCardProps {
  post: PostData;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  return (
    <article className="bg-white dark:bg-[#191D2A] rounded-3xl p-5 space-y-4 border border-slate-200/70 dark:border-white/5 shadow-[0_10px_30px_rgba(150,162,185,0.28),0_2px_8px_rgba(150,162,185,0.16)] dark:shadow-[-4px_-4px_12px_rgba(255,255,255,0.03),6px_8px_20px_rgba(0,0,0,0.6)]">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover border border-[#8B70DF]/30"
              loading="lazy"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#191D2A]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-sm text-[#0F172A] dark:text-white leading-tight">
                {post.author.name}
              </span>

              {post.author.isVerified && (
                <CheckCircle size={14} className="text-[#7C3AED] dark:text-[#A78BFA] fill-current" />
              )}

              {post.author.badge && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${post.author.badge.colorClass}`}
                >
                  {post.author.badge.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              <span>@{post.author.handle}</span>
              <span>•</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Options Button */}
        <button
          type="button"
          aria-label="Post options"
          className="p-2 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 shadow-sm text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Post Content (if plain text / reflection) */}
      {post.content && (
        <p className="text-sm leading-relaxed text-[#1E293B] dark:text-slate-200">
          {post.content.split(' ').map((word, idx) => {
            if (word.startsWith('#')) {
              return (
                <span
                  key={idx}
                  className="font-medium text-[#7C3AED] dark:text-[#A78BFA] hover:underline cursor-pointer"
                >
                  {word}{' '}
                </span>
              );
            }
            return word + ' ';
          })}
        </p>
      )}

      {/* Quote / Mindful Reflection Pod */}
      {post.quote && (
        <div className="bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden">
          {/* Ambient Decorative Quote Marks SVG */}
          <svg
            className="absolute right-4 bottom-2 w-16 h-16 text-slate-300/60 dark:text-slate-700/30 select-none pointer-events-none"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>

          <p className="text-base italic leading-relaxed text-[#0F172A] dark:text-slate-100 relative z-10 font-medium">
            {post.quote.text}
          </p>

          {post.quote.category && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <span className="w-4 h-0.5 rounded-full bg-[#10B981]" />
              <span className="text-xs text-[#059669] dark:text-emerald-400 font-semibold">
                {post.quote.category}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Post Images Grid / Inset Presentation */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="bg-[#EEF2F8] dark:bg-[#131620] shadow-[inset_0_2px_5px_rgba(150,162,185,0.25)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.75)] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden p-2">
          <div
            className={`grid gap-2 ${
              post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {post.mediaUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Post attachment"
                className="rounded-xl w-full h-56 object-cover transition-transform duration-200 hover:scale-[1.01]"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Bar with Crisp Tactile Buttons matching Stitch */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {/* Like (Heart) Button */}
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.18)] dark:shadow-none text-xs font-semibold transition-all active:scale-95 ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/30 text-[#F43F5E] border-rose-200 dark:border-rose-900/40'
                : 'bg-white dark:bg-[#191D2A] text-[#0F172A] dark:text-white hover:text-[#F43F5E]'
            }`}
          >
            <Heart
              size={15}
              className={`transition-colors ${
                isLiked
                  ? 'fill-[#F43F5E] text-[#F43F5E]'
                  : 'text-[#F43F5E] hover:fill-[#F43F5E]'
              }`}
            />
            <span>{likesCount.toLocaleString()}</span>
          </button>

          {/* Comment (Chat) Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.18)] dark:shadow-none text-xs font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] transition-all active:scale-95"
          >
            <MessageSquare size={15} />
            <span>{post.commentsCount.toLocaleString()}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#191D2A] border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.18)] dark:shadow-none text-xs font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#10B981] transition-all active:scale-95"
          >
            <Repeat2 size={15} />
            <span>{post.sharesCount.toLocaleString()}</span>
          </button>
        </div>

        {/* Bookmark Ribbon */}
        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          title="Save Post"
          className={`p-2 rounded-full border border-slate-200/70 dark:border-white/5 shadow-[0_2px_6px_rgba(150,162,185,0.18)] dark:shadow-none transition-all active:scale-95 ${
            isBookmarked
              ? 'bg-purple-50 dark:bg-purple-950/30 text-[#7C3AED] dark:text-[#A78BFA]'
              : 'bg-white dark:bg-[#191D2A] text-[#64748B] dark:text-slate-400 hover:text-[#7C3AED]'
          }`}
        >
          <Bookmark
            size={15}
            className={isBookmarked ? 'fill-current text-[#7C3AED] dark:text-[#A78BFA]' : ''}
          />
        </button>
      </div>
    </article>
  );
};
